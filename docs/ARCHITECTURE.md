# GRIDGUARD — Architecture

## System Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│            Next.js 16 · React 19 · Tailwind CSS 4              │
│               Recharts · React Three Fiber                      │
│                      Port 3000                                  │
└─────────────────────┬──────────────────┬────────────────────────┘
                      │ REST             │
┌─────────────────────▼──────────────────▼────────────────────────┐
│                       BACKEND                                   │
│           Node.js · Express · TypeScript                        │
│     Condition Engine · Health Scoring · Weather Cache           │
│                      Port 4000                                  │
│                    ┌──────────┐                                  │
│                    │  SQLite  │                                  │
│                    └──────────┘                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │ REST
┌─────────────────────▼───────────────────────────────────────────┐
│                     ML SERVICE                                  │
│           Python · FastAPI · scikit-learn · XGBoost             │
│    Failure Prediction · Anomaly Detection · Risk Engine         │
│                      Port 8000                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow
```
Sensor Data → Condition Engine → Health Score
                                    ↓
Sensor Data → ML Service → Failure Prediction → Risk Engine
                         → Anomaly Detection  ↗       ↓
                                               Priority Score
                                                    ↓
                                          Maintenance Recommendations
                                                    ↓
                                              Work Orders → Crew Assignment
```

## Database: SQLite (prototype)
- Code structured for PostgreSQL migration via raw SQL (no ORM lock-in)
- WAL mode for concurrent reads
- Foreign keys enforced
