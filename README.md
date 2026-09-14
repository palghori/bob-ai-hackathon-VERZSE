# 🚀 GridGuard AI: Operations Command Center

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | VERZSE |
| **Track** | AI / Sustainability |
| **Team Lead** | Pal Ghori |
| **Members** | Pal Ghori |

---

## 🎯 Problem Statement

Modern power grids face unpredictable cascading failures, rapid equipment degradation, and extreme weather events. Grid operators currently rely on reactive maintenance and heavily siloed data systems, leading to prolonged localized outages, high operational costs, and critical safety risks.

---

## 💡 Solution

GridGuard AI is an intelligent operations platform that unifies grid telemetry, IoT sensor data, and weather forecasts into a single pane of glass. It leverages machine learning to predict asset failures before they occur, automatically generating root cause analyses (RCA) and intelligent mitigation strategies to prevent downtime.

---

## ✨ Key Features

- **Real-time Anomaly Detection:** Continuous monitoring of transformer telemetry (DGA, thermal) using AI to detect thermal runaway and insulation degradation.
- **Automated Root Cause Analysis (RCA):** Instant generation of professional, downloadable PDF reports detailing incident timelines and exact mitigation steps.
- **Simulation Lab:** A digital twin sandbox to model grid stress under synthetic scenarios (e.g., severe heatwaves, storm fronts) to assess outage exposure.
- **Predictive Maintenance:** AI-driven health scoring for all field assets to optimize CapEx budgets and dispatch work orders prior to critical failure.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | TypeScript, Python, SQL |
| **Frameworks** | Next.js (React), Node.js (Express), FastAPI |
| **IBM Technologies** | watsonx.ai (Planned for Production Models) |
| **Databases** | SQLite (Prototype architecture) |
| **Other** | TailwindCSS, Recharts, Lucide, html-to-image |

---

## 📁 Repository Structure

```
├── frontend/             # Next.js React client application
├── backend/              # Node.js API and data aggregation layer
├── ml-service/           # FastAPI Python predictive models
├── docs/                 # Written documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   └── demo-video-link.txt
├── presentation/         # Slide deck
└── submission.yaml       # Structured submission metadata
```

---

## ⚡ How to Run

> **For detailed setup, see [`docs/setup-guide.md`](docs/setup-guide.md)**

```bash
# 1. Clone the repo
git clone https://github.com/your-username/gridguard-ai.git
cd gridguard-ai

# 2. Run the Node Backend
cd backend
npm install
npm run dev

# 3. Run the ML Service (in a new terminal)
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
DB_PATH=../data/gridguard.db uvicorn main:app --reload --port 8000

# 4. Run the Next.js Frontend (in a new terminal)
cd frontend
pnpm install
npx pnpm@latest dev -p 3005
```
*(The dashboard will be available at http://localhost:3005)*

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/slides.pdf](presentation/) |

---

## ⚠️ Known Limitations

- **Simulated Telemetry:** IoT sensor data is currently mocked via synthetic generation scripts; live SCADA integration is planned for phase 2.
- **Local Persistence:** Data currently persists to a local SQLite database for prototyping ease, rather than a production-grade time-series DB (like TimescaleDB or BigQuery).
- **Hardcoded ML Confidence:** Some ML inference scores are mathematically mocked for the UI demonstration while the underlying PyTorch models are trained.

---

## 🏅 What We're Most Proud Of

We are exceptionally proud of the **UI/UX and dynamic workflow**. GridGuard AI doesn't just display raw metrics—it provides actionable intelligence through a premium, enterprise-grade dark mode dashboard. Features like the **Automated PDF RCA Generator** and the **Interactive Simulation Lab** demonstrate a deep understanding of what grid operators actually need to make critical decisions under pressure.
