# EV-Agent: Agentic AI Powered Smart EV Charging Platform

> **Urban Electric Mobility Intelligence for the Chennai Metropolitan Corridor**

EV-Agent is a multi-stage engineering platform designed to optimize EV charging discovery, routing, and energy management across Chennai, Tamil Nadu.

---

## 🚀 Development Status

| Stage | Focus Area | Status |
| :--- | :--- | :--- |
| **Stage 1** | Frontend UI Prototype, Design System, Chennai Dataset, Simulation Stubs | ✅ **Completed** |
| **Stage 2** | OSINT / Open Data Integration Layer, Schemas, Deduplication, Routing & Weather | ✅ **Completed** |
| **Stage 3** | Telemetry Ingestion & Real-Time EV Diagnostics | ⏳ Planned |
| **Stage 4** | Autonomous Recommendation Engine & Dynamic Optimization | ⏳ Planned |

---

## ⚡ Key Highlights (Stage 2)

- **15 Open Data Adapters**: Bureau of Energy Efficiency (BEE), Open Charge Map (OCM), OpenStreetMap Overpass, Nominatim, OSRM, Open-Meteo, TNEV Directory, Data.gov.in, IEA, and 6 network stubs.
- **Canonical 22-Field Schema**: Normalized station entities with individual hardware charger mapping in SQLite.
- **Deduplication Engine**: Haversine formula (<150m) and tokenized name similarity to link records without duplication.
- **Audit Conflict Engine**: Zero silent overwrites. Discrepancies between public sources are logged to `data_conflicts` and displayed on station cards.
- **OSRM Road Routing**: Real turn-by-turn driving polylines plotted directly on the interactive Chennai Leaflet map.
- **Open-Meteo Live Weather**: Real-time ambient temperature and conditions for coastal Chennai displayed in the navigation header.
- **Ethical Open Access**: Strict upstream rate-limiting delay queues and SQLite TTL caching.
- **Proprietary Network Integrity**: Closed operator networks without open APIs are transparently marked `PUBLIC_API_NOT_CONFIGURED`.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Leaflet & React-Leaflet.
- **Backend**: Python 3.12+, Flask, SQLite 3, urllib3.
- **Geospatial & OSINT**: Open Charge Map, OpenStreetMap (Overpass & Nominatim), OSRM (Open Source Routing Machine), Open-Meteo Weather API.

---

## 💻 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
Backend API will start at `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

Run backend unit tests:
```bash
cd backend
python -m unittest discover tests -v
```

Run frontend build check:
```bash
cd frontend
npm run build
```

---

## 📖 Documentation
- [OSINT Integration Architecture](docs/osint.md)
- [API Endpoints Reference](docs/osint.md#6-rest-api-reference)
