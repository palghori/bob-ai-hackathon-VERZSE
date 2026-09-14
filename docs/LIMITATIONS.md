# GRIDGUARD — Limitations

This document clearly states the limitations of this prototype.

## This Application Is:
- A **decision-support prototype** using synthetic data
- Built for **educational/hackathon** purposes
- Designed to demonstrate concepts from modern asset-performance platforms

## This Application Is NOT:
- A certified grid-control system
- Connected to live SCADA, IoT, or utility telemetry systems
- A replacement for trained utility engineers
- Regulatory-compliant or safety-certified
- Suitable for production operational decisions

## Data Limitations
- All sensor data is **synthetically generated**
- Geographic coordinates are **fictional** and do not represent real utility locations
- Asset names, IDs, and configurations are **entirely fabricated**
- Weather data may be live (Open-Meteo) but is applied to fictional asset locations

## ML Limitations
- Models are trained on **synthetic demo data** only
- Validation metrics (precision, recall, F1, ROC-AUC) are real but reflect synthetic patterns
- Failure predictions are **estimates**, not guarantees
- Anomaly detection flags statistical deviation, NOT confirmed equipment faults
- Risk scores use prototype formulas with assumed weights

## Regulatory Disclaimer
- Where engineering standards are referenced (e.g., DGA diagnostics), the application only **models** standards-aware logic
- This does **NOT** constitute compliance certification
- The DGA module is a **prototype analytics implementation**, not a certified diagnostic tool

## Security Limitations
- Authentication is prototype-grade (no production SSO/OAuth)
- No end-to-end encryption of data at rest
- Role-based access is UI-level only (no backend enforcement in prototype)
