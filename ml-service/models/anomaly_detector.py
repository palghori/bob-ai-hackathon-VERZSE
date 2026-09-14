"""
GRIDGUARD — Anomaly Detection
==============================
Uses Isolation Forest to detect abnormal sensor behavior.

Anomaly detection is used as ONE input into the risk engine.
Anomaly != imminent failure. 
It means: "Abnormal sensor behavior detected and included as a risk signal."
"""

import sqlite3
import logging
from datetime import datetime
from typing import Optional

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger("gridguard-ml.anomaly")

ANOMALY_FEATURES = [
    "temperature", "winding_temperature", "hotspot_temperature",
    "load_percent", "vibration", "oil_moisture",
    "hydrogen", "acetylene", "power_factor",
    "bushing_tandelta", "harmonic_distortion",
]


class AnomalyDetector:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.model = None
        self.scaler = None
        self.is_trained = False
        self._available_features = []

    def train(self):
        """Train Isolation Forest on sensor data."""
        conn = sqlite3.connect(self.db_path)
        data = pd.read_sql(
            "SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 5000",
            conn,
        )
        conn.close()

        if data.empty or len(data) < 20:
            logger.warning("Not enough data for anomaly training")
            return

        self._available_features = [f for f in ANOMALY_FEATURES if f in data.columns]
        X = data[self._available_features].copy()

        for col in X.columns:
            X[col] = pd.to_numeric(X[col], errors="coerce")
            X[col] = X[col].fillna(X[col].median() if not X[col].isna().all() else 0)

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.1,
            random_state=42,
        )
        self.model.fit(X_scaled)
        self.is_trained = True

        logger.info(f"Anomaly detector trained on {len(data)} readings, {len(self._available_features)} features")

    def detect(self, asset_id: str) -> Optional[dict]:
        """Detect anomalies for a specific asset."""
        if not self.is_trained:
            return None

        conn = sqlite3.connect(self.db_path)
        reading = pd.read_sql(
            "SELECT * FROM sensor_readings WHERE asset_id = ? ORDER BY timestamp DESC LIMIT 1",
            conn, params=(asset_id,),
        )
        conn.close()

        if reading.empty:
            return None

        X = reading[self._available_features].copy()
        for col in X.columns:
            X[col] = pd.to_numeric(X[col], errors="coerce")
            X[col] = X[col].fillna(0)

        X_scaled = self.scaler.transform(X)

        # Isolation Forest: -1 = anomaly, 1 = normal
        prediction = self.model.predict(X_scaled)[0]
        raw_score = self.model.decision_function(X_scaled)[0]

        # Convert to 0-1 scale (higher = more anomalous)
        anomaly_score = max(0.0, min(1.0, 0.5 - float(raw_score)))

        if prediction == -1:
            anomaly_status = "ANOMALOUS"
        elif anomaly_score > 0.3:
            anomaly_status = "WATCH"
        else:
            anomaly_status = "NORMAL"

        # Identify which features are most anomalous
        anomalous_features = []
        row = reading.iloc[0]
        for feature in self._available_features:
            val = pd.to_numeric(row.get(feature), errors="coerce")
            if pd.isna(val):
                continue
            # Compare to training distribution
            col_idx = self._available_features.index(feature)
            mean = self.scaler.mean_[col_idx]
            std = self.scaler.scale_[col_idx]
            if std > 0:
                z = abs((val - mean) / std)
                if z > 2.0:
                    anomalous_features.append({
                        "feature": feature,
                        "value": float(val),
                        "z_score": round(float(z), 2),
                        "deviation": "HIGH" if z > 3 else "MODERATE",
                    })

        anomalous_features.sort(key=lambda x: x["z_score"], reverse=True)

        return {
            "asset_id": asset_id,
            "anomaly_score": round(anomaly_score, 4),
            "anomaly_status": anomaly_status,
            "anomalous_features": anomalous_features[:5],
            "timestamp": datetime.utcnow().isoformat(),
        }

    def get_info(self) -> dict:
        return {
            "model": "IsolationForest",
            "is_trained": self.is_trained,
            "features": self._available_features,
            "contamination": 0.1,
            "disclaimer": "Anomaly detection is a risk signal, not a failure prediction.",
        }
