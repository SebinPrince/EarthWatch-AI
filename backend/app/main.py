import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.models.database import init_db, SessionLocal
from app.api.routes import router, ensure_db_seeded
from app.data.disasters_data import fetch_live_usgs_earthquakes
from app.models.database import DisasterEventModel


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    init_db()
    db = SessionLocal()
    try:
        ensure_db_seeded(db)
        # Try initial background sync of live earthquakes
        try:
            live_quakes = await fetch_live_usgs_earthquakes()
            for q in live_quakes:
                if not db.query(DisasterEventModel).filter(DisasterEventModel.id == q["id"]).first():
                    ev = DisasterEventModel(
                        id=q["id"],
                        title=q["title"],
                        type=q["type"],
                        latitude=q["latitude"],
                        longitude=q["longitude"],
                        severity=q["severity"],
                        description=q["description"],
                        detected_at=q["detected_at"],
                        source=q["source"],
                        status=q["status"],
                        affected_area_km2=q.get("affected_area_km2"),
                        estimated_population=q.get("estimated_population"),
                        ai_summary=q.get("ai_summary"),
                        is_live=True,
                        is_simulated=False
                    )
                    db.add(ev)
            db.commit()
        except Exception:
            pass
    finally:
        db.close()
    yield


app = FastAPI(
    title="EarthWatch AI — Global Earth & Disaster Intelligence Platform API",
    description="Production-grade REST API powering 3D globe visualization, real-time satellite tracking, disaster monitoring, location intelligence, and AI analysis.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "name": "EarthWatch AI Platform API",
        "tagline": "Understand what is happening anywhere on Earth.",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "healthy", "service": "earthwatch-backend"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
