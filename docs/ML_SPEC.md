# GRIDGUARD — ML Specification

> All models are trained on **synthetic demo data**. Metrics are real but computed on synthetic data.

## Failure Prediction

### Pipeline
1. **Baseline**: Logistic Regression
2. **Candidate**: Gradient Boosting Classifier
3. Model with best test accuracy is selected automatically

### Features Used
temperature, winding_temperature, hotspot_temperature, load_percent, vibration, oil_temperature, oil_moisture, hydrogen, acetylene, methane, ethylene, carbon_monoxide, power_factor, bushing_tandelta, harmonic_distortion, current_unbalance

### Target
Binary: 1 = asset health is WARNING or CRITICAL, 0 = HEALTHY or WATCH

### Reported Metrics (actual, not fabricated)
- Precision
- Recall
- F1 Score
- ROC-AUC
- Confusion Matrix

### Output
```json
{
  "asset_id": "TX-1001",
  "failure_probability": 0.78,
  "risk_band": "CRITICAL",
  "prediction_horizon": "30d",
  "top_features": [...],
  "model_version": "v0.1.0-demo"
}
```

## Anomaly Detection

### Model
Isolation Forest (contamination=0.1, n_estimators=100)

### Output
- anomaly_score (0-1, higher = more anomalous)
- anomaly_status: NORMAL / WATCH / ANOMALOUS
- anomalous_features with z-scores

### Disclaimer
"Anomalous sensor behavior detected and included as a risk signal."
Anomaly ≠ imminent failure.

## Risk Engine

### Outage Risk Score Formula
```
outage_risk = (
  failure_prob × 0.30 +
  (1 - health/100) × 0.20 +
  weather_risk × 0.15 +
  incident_factor × 0.10 +
  criticality × 0.15 +
  anomaly_score × 0.10
)
```

### Grid Impact Score Formula
```
impact = (
  customer_factor × 0.35 +
  critical_load × 0.20 +
  criticality × 0.20 +
  feeder_factor × 0.10 +
  redundancy_factor × 0.15
)
```

### Priority Score
```
priority = outage_risk × 0.6 + impact × 0.4
```
