# GRIDGUARD — Master Build Specification

> **Version**: 0.1.0 | **Status**: Phase 1 Complete | **Data Mode**: DEMO (Synthetic)

## Overview
GRIDGUARD is a decision-support prototype for power grid asset performance monitoring and outage prevention.

## Architecture
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4
- **Backend**: Node.js + Express + TypeScript + SQLite (better-sqlite3)
- **ML Service**: Python + FastAPI + scikit-learn + XGBoost

## Current Capabilities
- 100 synthetic assets across 12 substations and 8 regions
- 7,300 time-series sensor readings (72 hours)
- Failure prediction (Logistic Regression, validated on demo data)
- Anomaly detection (Isolation Forest)
- Outage risk and grid impact scoring
- Configurable threshold-based health engine
- Work order management with CRUD
- Crew tracking and availability
- Alert center with acknowledge/resolve
- Weather integration (Open-Meteo with cached/simulated fallback)

## Disclaimer
All data is synthetic. Predictions are estimates. This is not a certified system.
