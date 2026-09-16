# Technical Setup Guide

GridGuard AI uses a 3-tier architecture:
1. **Frontend:** Next.js (React) on port 3005
2. **Backend:** Node.js API on port 4000
3. **ML Service:** Python FastAPI on port 8000

## Prerequisites
- Node.js (v18+)
- Python (3.10+)
- `pnpm` (for frontend package management)
- `git`

## Step-by-Step Installation

### 1. Clone the Repository
```bash
git clone https://github.com/palghori/gridguard-ai.git
cd gridguard-ai
```

### 2. Start the Backend API (Node.js)
The backend serves as the data aggregation layer, interacting with the SQLite database.
```bash
cd backend
npm install
npm run dev
```
*(Runs on http://localhost:4000)*

### 3. Start the ML Service (Python FastAPI)
The ML service provides predictive health scoring and anomaly detection. Open a **new terminal tab** for this step.
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
DB_PATH=../data/gridguard.db uvicorn main:app --reload --port 8000
```
*(Runs on http://localhost:8000)*

### 4. Start the Frontend (Next.js)
The frontend provides the Operations Command Center interface. Open a **new terminal tab** for this step.
```bash
cd frontend
pnpm install
npx pnpm@latest dev -p 3005
```
*(Runs on http://localhost:3005)*

## Verification
Once all three services are running, open your browser and navigate to [http://localhost:3005](http://localhost:3005). You should see the GridGuard AI dashboard populated with telemetry data.
