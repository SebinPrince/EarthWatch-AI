# EarthWatch AI — Global Earth & Disaster Intelligence Platform

> **"Understand what is happening anywhere on Earth."**

EarthWatch AI is an interactive global Earth intelligence platform that enables users to explore the planet on a photorealistic 3D globe, discover real-time and historical disaster/environmental events, inspect affected regions, track observing satellite constellations in orbit, and receive AI-assisted multi-sensor impact assessments.

---

## 🚀 Key Features

* **Interactive 3D Earth (CesiumJS & WGS84 Ellipsoid)**
  * Photorealistic satellite base imagery (ESRI World Imagery) with realistic atmospheric scattering and night-sky glow.
  * Real-time rotation, zoom, tilt, and smooth camera fly-to animations.
  * Visual severity indicators (Critical, High, Moderate, Low) with pulsing hazard halos.

* **Satellite Tracking & Satellite → Earth Connection**
  * Real-time orbital propagation for Earth Observation (Landsat 9, Sentinel-2A/B), Weather (GOES-16/18, INSAT-3DR, Himawari-9), Radar (Sentinel-1A SAR), and Science/Navigation platforms (ISS, GPS III).
  * **Dynamic Laser Connection Beams:** Selecting any disaster immediately traces orbital line-of-sight laser beams to all relevant satellites passing over or observing the region, showing exact distance (km) and sensor suitability (e.g. SAR radar swath, thermal infrared hotspot tracking, geostationary eyewall imagery).

* **Location Intelligence**
  * Search any city, country, or coordinates globally (e.g., *"Kerala, India"*, *"Tokyo"*, *"California"*).
  * Live atmospheric observations powered by Open-Meteo (temperature, conditions, wind speed, humidity, pressure).
  * Automated regional risk level assessment and enumeration of nearby hazards & overhead satellites.

* **AI Earth Analyst**
  * Grounded reasoning assistant (`EarthWatch Analyst`) that strictly answers user queries based on active database records and observational telemetry.
  * **Zero Hallucination Rule:** Returns *"Insufficient data available"* if data is unverified or outside database coverage.
  * Preset quick prompts for 1-click evaluation during hackathon presentations.

* **Disaster Simulation Mode**
  * Synthetic disaster propagation engine for Cyclones, Wildfires, Floods, Heatwaves, and Volcanoes.
  * Interactive controls: starting location, intensity (1–5), impact radius (km), direction bearing (0–360°), and propagation speed (km/h).
  * Generates animated hazard impact buffers on the 3D globe, estimated population affected, and recommended orbital monitoring assets.
  * Clearly labeled: **"SIMULATION — NOT A REAL EVENT"**.

* **Mission Control Analytics Dashboard**
  * Interactive data visualization built with Recharts:
    * Events breakdown by hazard type
    * Severity classification donut chart
    * 6-day multi-hazard detection and frequency trend
    * Satellite fleet distribution by mission domain

* **Historical Event Timeline Scrubber**
  * Scrub from 48 hours ago to live real-time, dynamically filtering active hazard markers across the globe.
  * Auto-play time progression mode.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, CesiumJS, Recharts, Lucide React, Axios |
| **Backend** | Python 3.13 / FastAPI, Uvicorn, SQLAlchemy, Pydantic v2, HTTPX |
| **Data & ML** | Pandas, NumPy, Scikit-learn, SGP4 / Keplerian Orbital Kinematics |
| **Database** | SQLite 3 (ORM configured for seamless PostgreSQL migration via `DATABASE_URL`) |
| **External APIs** | USGS Earthquake API, Open-Meteo Weather API, OpenStreetMap Nominatim, NASA EONET |

---

## 🏗️ Architecture & Project Structure

```text
earthwatch-ai/
│
├── frontend/                     # React + TypeScript + Vite + CesiumJS UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── Globe/            # Cesium 3D Globe with laser connections & halos
│   │   │   ├── Landing/          # Futuristic landing page with animated starfield
│   │   │   ├── Navigation/       # Mission control sidebar & hazard filters
│   │   │   ├── Panels/           # Event detail, satellite telemetry, location intel
│   │   │   ├── AIAnalyst/        # Grounded conversational Earth Analyst modal
│   │   │   ├── Simulation/       # Synthetic disaster physics engine & modal
│   │   │   ├── Analytics/        # Recharts telemetry graphs & distributions
│   │   │   ├── Search/           # Global omni-search for places, sats, and hazards
│   │   │   └── Timeline/         # Bottom scrubber bar with auto-advance
│   │   ├── services/             # Axios API client with fallback data
│   │   ├── types/                # Strict TypeScript interfaces
│   │   └── index.css             # Glassmorphism & neon status styling
│   ├── vite.config.ts            # Vite config with cesium plugin & proxy
│   └── package.json
│
├── backend/                      # Python FastAPI REST API & Data Adapters
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py         # Endpoints for satellites, events, weather, AI, sim
│   │   ├── models/
│   │   │   ├── database.py       # SQLAlchemy ORM models (satellites, events, locations)
│   │   │   └── schemas.py        # Pydantic validation schemas
│   │   ├── data/
│   │   │   ├── satellites_data.py # Orbital parameters & Keplerian sub-satellite math
│   │   │   ├── disasters_data.py  # Reference catalog + Live USGS GeoJSON adapter
│   │   │   ├── weather_data.py    # Open-Meteo live atmospheric observations
│   │   │   └── locations_data.py  # Geocoding & global region registry
│   │   ├── ai/
│   │   │   └── analyst.py        # EarthWatch Analyst reasoning engine
│   │   ├── services/
│   │   │   └── simulation.py     # Hazard physics & corridor buffer calculation
│   │   └── main.py               # FastAPI entrypoint with CORS & startup sync
│   ├── requirements.txt
│   └── .env.example
│
├── database/                     # SQLite database storage (earthwatch.db)
├── docker-compose.yml            # Multi-container orchestration
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js**: v18 or higher (v20+ recommended)
* **Python**: v3.10 or higher
* **Git**

---

### Step 1: Start the Backend (FastAPI)

1. Open a terminal in the project root:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
5. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   * Backend API: `http://127.0.0.1:8000`
   * Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

---

### Step 2: Start the Frontend (Vite + React)

1. Open a second terminal window:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   **`http://localhost:5173/`**

---

## 🌐 Running with Docker Compose

To launch the entire platform with a single command:
```bash
docker-compose up --build
```
* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:8000`

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/satellites` | List all orbiting satellites with real-time calculated lat/lon |
| `GET` | `/api/satellites/{id}` | Retrieve single satellite telemetry and orbital parameters |
| `GET` | `/api/satellites/near/{lat}/{lon}` | Query satellites nearest to specific coordinates |
| `GET` | `/api/events` | List active disaster events (filterable by type & severity) |
| `GET` | `/api/events/{id}` | Enriched event details, relevant satellites, and local weather |
| `GET` | `/api/locations/search?q={query}` | Search cities and regions globally via Nominatim & DB |
| `GET` | `/api/locations/{id}` | Location intelligence with weather and nearby hazard buffer |
| `GET` | `/api/analytics` | Recharts aggregation metrics (types, severity, trend) |
| `POST` | `/api/simulation` | Compute synthetic hazard corridor, population, and satellites |
| `POST` | `/api/ai/analyze` | Ask EarthWatch Analyst questions with verified grounding |
| `GET` | `/api/weather?lat={lat}&lon={lon}` | Real-time weather from Open-Meteo |
| `GET` | `/api/sync-live-data` | Synchronize live M4.5+ earthquakes from USGS |

---

## 🏆 3–5 Minute Hackathon Demo Flow

Follow this exact walkthrough during your presentation:

1. **Landing Screen (30s):**
   * Show the animated starfield and EarthWatch AI mission tagline: *"Understand what is happening anywhere on Earth."*
   * Point out the live telemetry badges (15 satellites, 20 active hazards, real-time sync).
   * Click **[ EXPLORE EARTH ]**.

2. **3D Cesium Globe Exploration (45s):**
   * Rotate and zoom into the 3D globe to show the realistic atmosphere, day/night lighting, and orbiting satellite markers.
   * Toggle auto-rotation using the playback control on the top right.

3. **Disaster Inspection & Satellite → Earth Connection (60s):**
   * Open **Disaster Monitor** from the left sidebar.
   * Click the **"Kerala Monsoon Torrential Inundation & Landslide Zone"** (or click any hazard pin on the globe).
   * Notice the smooth camera fly-to centering on Kerala, India.
   * **Highlight the Laser Beams:** Observe the glowing cyan laser connection lines drawn from the disaster coordinates to the relevant satellites overhead (Landsat 9, Sentinel-1A SAR, Cartosat-3).
   * Show the **Event Details Panel**:
     * Live weather context in Kerala (31.8°C, wind, humidity).
     * **EarthWatch AI Synthesis:** Highlight the distinct AI analysis badge grounded in SAR and thermal radiometer passes.
     * Click on a connected satellite (e.g., *Sentinel-1A*) to seamlessly view its orbital altitude and radar mission details.

4. **Location Intelligence (45s):**
   * Use the top global search bar and search **"Kerala"** or **"Tokyo"**.
   * Open the **Location Intelligence** panel to show coordinates, real-time weather from Open-Meteo, regional risk level, and nearby satellites.

5. **AI Earth Analyst (45s):**
   * Click **AI Earth Analyst** in the sidebar.
   * Click the preset question: *"What is happening in Kerala?"*
   * Show the detailed, grounded answer citing Copernicus EMS and IMD.
   * Click *"Which satellites are relevant to this wildfire?"* to demonstrate multi-spectral sensor matching without hallucination.

6. **Disaster Simulation Mode (45s):**
   * Click **Simulation Mode** in the sidebar.
   * Notice the prominent disclaimer: **`SIMULATION — NOT A REAL EVENT`**.
   * Select **Cyclone**, starting location: **Bay of Bengal (Coastal)**, Intensity: **Category 4**.
   * Click **[ EXECUTE SIMULATION ON 3D GLOBE ]**.
   * Show the animated simulated hazard buffer and propagation vector on the 3D globe along with estimated population in danger and nearby monitoring assets.

7. **Analytics Dashboard (30s):**
   * Open **Analytics Dashboard** to show the Recharts graphs (hazard distribution by type, severity classification, and 6-day multi-hazard timeline trend).

---

## 🔒 Security & Verification Policy

* **Zero Hallucination:** EarthWatch AI does not fabricate real-world coordinates, satellite telemetry, or disaster occurrences.
* **Distinct Provenance:** Synthetic simulations and AI-generated syntheses are visually branded and clearly segregated from verified ground sensor telemetry.
* **Graceful Degradation:** If external public APIs (USGS, Open-Meteo) experience network throttling, the platform automatically falls back to cached baseline archives so demos never break.
