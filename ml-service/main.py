"""
GRIDGUARD ML Service
====================
FastAPI service providing:
- Failure prediction (Logistic Regression / XGBoost)
- Anomaly detection (Isolation Forest)
- Risk scoring

All predictions are estimates from a prototype model trained on synthetic data.
This is NOT a certified prediction system.
"""

import os
import json
import sqlite3
import logging
from datetime import datetime
from pathlib import Path
from contextlib import asynccontextmanager

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from models.failure_predictor import FailurePredictor
from models.anomaly_detector import AnomalyDetector
from models.risk_engine import RiskEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gridguard-ml")

DB_PATH = os.environ.get("DB_PATH", str(Path(__file__).parent.parent / "data" / "gridguard.db"))
MODEL_DIR = Path(__file__).parent / "models" / "trained"

# Global model instances
failure_predictor: Optional[FailurePredictor] = None
anomaly_detector: Optional[AnomalyDetector] = None
risk_engine: Optional[RiskEngine] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize models on startup."""
    global failure_predictor, anomaly_detector, risk_engine
    
    logger.info("🔌 GRIDGUARD ML Service starting...")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    try:
        failure_predictor = FailurePredictor(DB_PATH, MODEL_DIR)
        failure_predictor.train()
        logger.info("✅ Failure predictor trained")
    except Exception as e:
        logger.error(f"⚠️ Failure predictor init failed: {e}")
        failure_predictor = FailurePredictor(DB_PATH, MODEL_DIR)
    
    try:
        anomaly_detector = AnomalyDetector(DB_PATH)
        anomaly_detector.train()
        logger.info("✅ Anomaly detector trained")
    except Exception as e:
        logger.error(f"⚠️ Anomaly detector init failed: {e}")
        anomaly_detector = AnomalyDetector(DB_PATH)
    
    risk_engine = RiskEngine(DB_PATH)
    logger.info("✅ Risk engine initialized")
    logger.info("⚡ ML Service ready")
    
    yield
    
    logger.info("🛑 ML Service shutting down")


app = FastAPI(
    title="GRIDGUARD ML Service",
    description="Failure prediction, anomaly detection, and risk scoring for grid assets. All outputs are prototype estimates.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Response Models ────────────────────────────────────────────────
class PredictionResponse(BaseModel):
    asset_id: str
    failure_probability: float
    risk_band: str
    prediction_horizon: str
    top_features: list
    model_version: str
    timestamp: str
    disclaimer: str = "This is a prototype estimate, not a guarantee of failure."


class AnomalyResponse(BaseModel):
    asset_id: str
    anomaly_score: float
    anomaly_status: str
    anomalous_features: list
    timestamp: str


class RiskResponse(BaseModel):
    asset_id: str
    outage_risk_score: float
    outage_risk_level: str
    impact_score: float
    priority_score: float
    affected_zone: str
    potential_impact: int
    contributors: list
    timestamp: str


class HealthCheck(BaseModel):
    status: str
    service: str
    models_loaded: dict
    timestamp: str


# ─── Endpoints ──────────────────────────────────────────────────────

@app.get("/health", response_model=HealthCheck)
async def health():
    return HealthCheck(
        status="online",
        service="gridguard-ml",
        models_loaded={
            "failure_predictor": failure_predictor is not None and failure_predictor.is_trained,
            "anomaly_detector": anomaly_detector is not None and anomaly_detector.is_trained,
            "risk_engine": risk_engine is not None,
        },
        timestamp=datetime.utcnow().isoformat(),
    )


@app.get("/predict/{asset_id}", response_model=PredictionResponse)
async def predict_failure(asset_id: str):
    if not failure_predictor or not failure_predictor.is_trained:
        raise HTTPException(status_code=503, detail="Failure predictor not available")
    
    result = failure_predictor.predict(asset_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found or no sensor data")
    
    # Store prediction in DB
    _store_prediction(asset_id, result)
    
    return PredictionResponse(**result)


@app.get("/anomaly/{asset_id}", response_model=AnomalyResponse)
async def detect_anomaly(asset_id: str):
    if not anomaly_detector or not anomaly_detector.is_trained:
        raise HTTPException(status_code=503, detail="Anomaly detector not available")
    
    result = anomaly_detector.detect(asset_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found or no sensor data")
    
    return AnomalyResponse(**result)


@app.get("/risk/{asset_id}", response_model=RiskResponse)
async def compute_risk(asset_id: str):
    if not risk_engine:
        raise HTTPException(status_code=503, detail="Risk engine not available")
    
    # Get failure prediction and anomaly data
    failure_prob = 0.0
    anomaly_score = 0.0
    
    if failure_predictor and failure_predictor.is_trained:
        pred = failure_predictor.predict(asset_id)
        if pred:
            failure_prob = pred["failure_probability"]
    
    if anomaly_detector and anomaly_detector.is_trained:
        anom = anomaly_detector.detect(asset_id)
        if anom:
            anomaly_score = anom["anomaly_score"]
    
    result = risk_engine.compute(asset_id, failure_prob, anomaly_score)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
    
    return RiskResponse(**result)


@app.post("/predict-all")
async def predict_all():
    """Run predictions for all assets. Returns summary."""
    if not failure_predictor or not failure_predictor.is_trained:
        raise HTTPException(status_code=503, detail="Failure predictor not available")
    
    conn = sqlite3.connect(DB_PATH)
    assets = pd.read_sql("SELECT asset_id FROM assets", conn)
    conn.close()
    
    results = []
    for asset_id in assets["asset_id"]:
        try:
            result = failure_predictor.predict(asset_id)
            if result:
                _store_prediction(asset_id, result)
                results.append(result)
        except Exception as e:
            logger.warning(f"Prediction failed for {asset_id}: {e}")
    
    return {
        "predictions_generated": len(results),
        "timestamp": datetime.utcnow().isoformat(),
        "model_version": failure_predictor.model_version,
        "data_mode": "DEMO",
    }


@app.get("/model-info")
async def model_info():
    """Return model metadata and validation metrics."""
    info = {}
    
    if failure_predictor:
        info["failure_predictor"] = failure_predictor.get_info()
    if anomaly_detector:
        info["anomaly_detector"] = anomaly_detector.get_info()
    
    return {
        "models": info,
        "data_mode": "DEMO",
        "disclaimer": "All metrics are computed on synthetic demo data.",
    }


def _store_prediction(asset_id: str, result: dict):
    """Store prediction result in database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            """INSERT INTO predictions (asset_id, timestamp, failure_probability, risk_band, 
               prediction_horizon, top_features, model_version, anomaly_score, anomaly_status, anomalous_features)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                asset_id,
                result["timestamp"],
                result["failure_probability"],
                result["risk_band"],
                result.get("prediction_horizon", "30d"),
                json.dumps(result.get("top_features", [])),
                result.get("model_version", "unknown"),
                result.get("anomaly_score"),
                result.get("anomaly_status"),
                json.dumps(result.get("anomalous_features", [])),
            ),
        )
        conn.commit()
        conn.close()
    except Exception as e:
        logger.warning(f"Failed to store prediction: {e}")
