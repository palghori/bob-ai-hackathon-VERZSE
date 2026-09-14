"""
GRIDGUARD — Risk Engine
========================
Computes outage risk and grid impact scores.

This is a PROTOTYPE estimation. Not a certified risk assessment.

Outage Risk combines:
- Equipment failure probability
- Asset health
- Weather risk
- Historical incident frequency
- Asset criticality
- Grid dependency

Grid Impact considers:
- Customers served
- Critical load
- Substation importance
- Connected feeders
- Redundancy
- Asset criticality
"""

import sqlite3
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger("gridguard-ml.risk")

CRITICALITY_WEIGHTS = {
    "CRITICAL": 1.0,
    "HIGH": 0.75,
    "MEDIUM": 0.5,
    "LOW": 0.25,
}

REDUNDANCY_WEIGHTS = {
    "N": 1.0,      # No redundancy → highest risk
    "N-1": 0.6,
    "N-2": 0.3,
}


class RiskEngine:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def compute(self, asset_id: str, failure_probability: float, anomaly_score: float) -> Optional[dict]:
        """Compute outage risk and impact scores for an asset."""
        conn = sqlite3.connect(self.db_path)
        
        # Get asset
        cursor = conn.execute("SELECT * FROM assets WHERE asset_id = ?", (asset_id,))
        cols = [desc[0] for desc in cursor.description]
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        asset = dict(zip(cols, row))

        # Get substation info
        substation = None
        if asset.get("substation_id"):
            cursor = conn.execute("SELECT * FROM substations WHERE substation_id = ?", (asset["substation_id"],))
            cols = [desc[0] for desc in cursor.description]
            sub_row = cursor.fetchone()
            if sub_row:
                substation = dict(zip(cols, sub_row))

        # Get incident count (last 365 days)
        year_ago = datetime(datetime.now().year - 1, datetime.now().month, datetime.now().day).isoformat()
        incident_count = conn.execute(
            "SELECT COUNT(*) FROM incidents WHERE asset_id = ? AND timestamp >= ?",
            (asset_id, year_ago),
        ).fetchone()[0]

        # Get latest weather
        weather_risk = 0.0
        weather_row = conn.execute(
            "SELECT severe_weather, wind_speed_kmh, rain_mm FROM weather_cache WHERE latitude = ? AND longitude = ? ORDER BY timestamp DESC LIMIT 1",
            (asset.get("latitude", 0), asset.get("longitude", 0)),
        ).fetchone()
        if weather_row:
            severe, wind, rain = weather_row
            if severe:
                weather_risk = 0.8
            elif wind and wind > 50:
                weather_risk = 0.5
            elif rain and rain > 20:
                weather_risk = 0.3

        conn.close()

        contributors = []

        # ─── Outage Risk Score ──────────────────────────────────────
        # Weighted combination of risk factors
        criticality_weight = CRITICALITY_WEIGHTS.get(asset.get("criticality", "MEDIUM"), 0.5)
        
        incident_factor = min(1.0, incident_count / 5.0)  # Normalize to 0-1
        
        outage_risk_score = (
            failure_probability * 0.30 +
            (1 - (asset.get("health_score", 50) or 50) / 100) * 0.20 +
            weather_risk * 0.15 +
            incident_factor * 0.10 +
            criticality_weight * 0.15 +
            anomaly_score * 0.10
        )
        outage_risk_score = round(min(1.0, max(0.0, outage_risk_score)), 4)

        if failure_probability > 0.5:
            contributors.append(f"High failure probability: {failure_probability:.0%}")
        if weather_risk > 0.3:
            contributors.append(f"Weather risk: {weather_risk:.0%}")
        if incident_count > 0:
            contributors.append(f"Historical incidents: {incident_count} in past year")
        if criticality_weight >= 0.75:
            contributors.append(f"Asset criticality: {asset.get('criticality')}")
        if anomaly_score > 0.3:
            contributors.append(f"Anomaly detected: score {anomaly_score:.2f}")

        # Risk level
        if outage_risk_score >= 0.7:
            outage_risk_level = "CRITICAL"
        elif outage_risk_score >= 0.5:
            outage_risk_level = "HIGH"
        elif outage_risk_score >= 0.3:
            outage_risk_level = "MEDIUM"
        else:
            outage_risk_level = "LOW"

        # ─── Grid Impact Score ──────────────────────────────────────
        customers = asset.get("customers_served", 0) or 0
        critical_load = asset.get("critical_load", 0) or 0
        connected_feeders = substation.get("connected_feeders", 1) if substation else 1
        redundancy = substation.get("redundancy", "N-1") if substation else "N-1"
        redundancy_factor = REDUNDANCY_WEIGHTS.get(redundancy, 0.6)

        # Normalize customers (assume max ~25000)
        customer_factor = min(1.0, customers / 25000)
        feeder_factor = min(1.0, connected_feeders / 10)

        impact_score = round(
            customer_factor * 0.35 +
            critical_load * 0.20 +
            criticality_weight * 0.20 +
            feeder_factor * 0.10 +
            redundancy_factor * 0.15, 4
        )

        if customers > 5000:
            contributors.append(f"Serves {customers:,} customers")
        if critical_load:
            contributors.append("Supplies critical load")

        # ─── Priority Score ─────────────────────────────────────────
        # Combines outage risk AND grid impact
        priority_score = round(outage_risk_score * 0.6 + impact_score * 0.4, 4)

        return {
            "asset_id": asset_id,
            "outage_risk_score": outage_risk_score,
            "outage_risk_level": outage_risk_level,
            "impact_score": impact_score,
            "priority_score": priority_score,
            "affected_zone": asset.get("zone", "Unknown"),
            "potential_impact": customers,
            "contributors": contributors,
            "timestamp": datetime.utcnow().isoformat(),
        }
