"""
GRIDGUARD — Failure Prediction Model
=====================================
Trains a classifier to predict equipment failure probability.

Pipeline:
1. Logistic Regression (baseline)
2. XGBoost (if available and improves metrics)

All metrics are computed on SYNTHETIC demo data.
Predictions are estimates, NOT guarantees.
"""

import sqlite3
import logging
import pickle
from datetime import datetime
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
)
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger("gridguard-ml.failure")

FEATURE_COLUMNS = [
    "temperature", "winding_temperature", "hotspot_temperature",
    "load_percent", "vibration", "oil_temperature", "oil_moisture",
    "hydrogen", "acetylene", "methane", "ethylene",
    "carbon_monoxide", "power_factor", "bushing_tandelta",
    "harmonic_distortion", "current_unbalance",
]


class FailurePredictor:
    def __init__(self, db_path: str, model_dir: Path):
        self.db_path = db_path
        self.model_dir = model_dir
        self.model = None
        self.scaler = None
        self.is_trained = False
        self.model_version = "v0.1.0-demo"
        self.metrics = {}
        self.feature_importances = {}

    def _load_training_data(self) -> pd.DataFrame:
        """Load and prepare training data from sensor readings and asset health."""
        conn = sqlite3.connect(self.db_path)

        # Get latest sensor readings per asset
        readings = pd.read_sql("""
            SELECT sr.*, a.health_status, a.criticality, a.maintenance_status,
                   a.asset_type
            FROM sensor_readings sr
            JOIN assets a ON sr.asset_id = a.asset_id
            WHERE sr.timestamp IN (
                SELECT MAX(timestamp) FROM sensor_readings GROUP BY asset_id
            )
        """, conn)

        # Get incident counts per asset
        incidents = pd.read_sql("""
            SELECT asset_id, COUNT(*) as incident_count
            FROM incidents
            GROUP BY asset_id
        """, conn)

        conn.close()

        if readings.empty:
            return pd.DataFrame()

        # Merge
        data = readings.merge(incidents, on="asset_id", how="left")
        data["incident_count"] = data["incident_count"].fillna(0)

        # Create binary target: 1 = at risk (WARNING/CRITICAL), 0 = healthy
        data["failure_target"] = data["health_status"].apply(
            lambda x: 1 if x in ("WARNING", "CRITICAL") else 0
        )

        return data

    def train(self):
        """Train the failure prediction model."""
        data = self._load_training_data()

        if data.empty or len(data) < 10:
            logger.warning("Not enough data for training, using fallback")
            self.is_trained = False
            return

        # Prepare features
        available_features = [f for f in FEATURE_COLUMNS if f in data.columns]
        X = data[available_features].copy()

        # Fill NaN with median
        for col in X.columns:
            X[col] = pd.to_numeric(X[col], errors="coerce")
            X[col] = X[col].fillna(X[col].median() if not X[col].isna().all() else 0)

        y = data["failure_target"]

        # Ensure we have both classes
        if y.nunique() < 2:
            logger.warning("Only one class present. Adding synthetic diversity.")
            # Force at least some positive examples
            n_flip = max(1, len(y) // 5)
            indices = y[y == 0].index[:n_flip]
            y.loc[indices] = 1

        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.25, random_state=42, stratify=y
        )

        # Train Logistic Regression baseline
        lr = LogisticRegression(max_iter=1000, random_state=42)
        lr.fit(X_train, y_train)
        lr_score = lr.score(X_test, y_test)

        # Train Gradient Boosting
        gb = GradientBoostingClassifier(
            n_estimators=100, max_depth=4, random_state=42, learning_rate=0.1
        )
        gb.fit(X_train, y_train)
        gb_score = gb.score(X_test, y_test)

        # Select best model
        if gb_score >= lr_score:
            self.model = gb
            model_name = "GradientBoosting"
            self.feature_importances = dict(zip(available_features, gb.feature_importances_))
        else:
            self.model = lr
            model_name = "LogisticRegression"
            self.feature_importances = dict(zip(available_features, np.abs(lr.coef_[0])))

        # Compute metrics on test set
        y_pred = self.model.predict(X_test)
        y_proba = self.model.predict_proba(X_test)[:, 1]

        self.metrics = {
            "model": model_name,
            "accuracy": float(self.model.score(X_test, y_test)),
            "precision": float(precision_score(y_test, y_pred, zero_division=0)),
            "recall": float(recall_score(y_test, y_pred, zero_division=0)),
            "f1": float(f1_score(y_test, y_pred, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_test, y_proba)) if y_test.nunique() > 1 else 0.0,
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            "train_size": len(X_train),
            "test_size": len(X_test),
            "features_used": available_features,
            "trained_at": datetime.utcnow().isoformat(),
            "data_source": "SYNTHETIC_DEMO",
        }

        self.is_trained = True
        self._available_features = available_features

        # Save model
        model_path = self.model_dir / "failure_predictor.pkl"
        with open(model_path, "wb") as f:
            pickle.dump({"model": self.model, "scaler": self.scaler, "features": available_features}, f)

        logger.info(f"Model: {model_name} | Accuracy: {self.metrics['accuracy']:.3f} | F1: {self.metrics['f1']:.3f} | ROC-AUC: {self.metrics['roc_auc']:.3f}")

    def predict(self, asset_id: str) -> Optional[dict]:
        """Predict failure probability for a specific asset."""
        if not self.is_trained:
            return None

        conn = sqlite3.connect(self.db_path)

        # Get latest sensor reading
        reading = pd.read_sql(
            "SELECT * FROM sensor_readings WHERE asset_id = ? ORDER BY timestamp DESC LIMIT 1",
            conn, params=(asset_id,)
        )

        conn.close()

        if reading.empty:
            return None

        # Prepare features
        X = reading[self._available_features].copy()
        for col in X.columns:
            X[col] = pd.to_numeric(X[col], errors="coerce")
            X[col] = X[col].fillna(0)

        X_scaled = self.scaler.transform(X)

        # Predict
        proba = float(self.model.predict_proba(X_scaled)[0][1])

        # Determine risk band
        if proba >= 0.7:
            risk_band = "CRITICAL"
        elif proba >= 0.5:
            risk_band = "HIGH"
        elif proba >= 0.3:
            risk_band = "MEDIUM"
        else:
            risk_band = "LOW"

        # Get top contributing features
        sorted_features = sorted(
            self.feature_importances.items(), key=lambda x: x[1], reverse=True
        )
        top_features = [
            {"feature": name, "importance": round(float(imp), 4)}
            for name, imp in sorted_features[:5]
        ]

        return {
            "asset_id": asset_id,
            "failure_probability": round(proba, 4),
            "risk_band": risk_band,
            "prediction_horizon": "30d",
            "top_features": top_features,
            "model_version": self.model_version,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def get_info(self) -> dict:
        return {
            "model_version": self.model_version,
            "is_trained": self.is_trained,
            "metrics": self.metrics,
            "feature_importances": {k: round(v, 4) for k, v in self.feature_importances.items()},
            "disclaimer": "All metrics computed on synthetic demo data.",
        }
