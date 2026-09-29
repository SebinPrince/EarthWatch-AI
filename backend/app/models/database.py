import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship as orm_relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database/earthwatch.db")

# Ensure database directory exists if using sqlite
if DATABASE_URL.startswith("sqlite"):
    db_path = DATABASE_URL.replace("sqlite:///", "")
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class SatelliteModel(Base):
    __tablename__ = "satellites"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    norad_id = Column(Integer, nullable=True, index=True)
    country = Column(String, nullable=True)
    operator = Column(String, nullable=True)
    mission = Column(String, nullable=False) # e.g. "Earth Observation", "Weather", "Scientific"
    purpose = Column(Text, nullable=True)
    orbit_type = Column(String, nullable=True) # "LEO", "GEO", "SSO", "MEO"
    altitude = Column(Float, nullable=True) # km
    launch_date = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    velocity = Column(Float, nullable=True) # km/s
    inclination = Column(Float, nullable=True) # degrees
    eccentricity = Column(Float, nullable=True)
    period_minutes = Column(Float, nullable=True)
    tle_line1 = Column(Text, nullable=True)
    tle_line2 = Column(Text, nullable=True)
    sensor_type = Column(String, nullable=True)
    swath_km = Column(Float, nullable=True)
    data_source = Column(String, default="CelesTrak / NORAD")
    status = Column(String, default="Active")
    is_live = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=datetime.utcnow)

    # Relationships
    event_associations = orm_relationship("EventSatelliteModel", back_populates="satellite")


class DisasterEventModel(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False, index=True) # wildfire, flood, cyclone, earthquake, volcano, heatwave, storm, environmental_anomaly
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(String, nullable=False, index=True) # low, moderate, high, critical
    description = Column(Text, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow)
    source = Column(String, nullable=False) # "USGS", "NASA EONET", "Copernicus EMS", "NOAA", "Simulated"
    status = Column(String, default="Active") # "Active", "Contained", "Monitoring", "Resolved"
    affected_area_km2 = Column(Float, nullable=True)
    estimated_population = Column(Integer, nullable=True)
    ai_summary = Column(Text, nullable=True)
    is_live = Column(Boolean, default=False)
    is_simulated = Column(Boolean, default=False)

    # Relationships
    satellite_associations = orm_relationship("EventSatelliteModel", back_populates="event")


class LocationModel(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    region = Column(String, nullable=True)
    population = Column(Integer, nullable=True)


class EventSatelliteModel(Base):
    __tablename__ = "event_satellites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    satellite_id = Column(String, ForeignKey("satellites.id"), nullable=False)
    relationship_desc = Column("relationship", String, nullable=False)
    distance_km = Column(Float, nullable=True)

    event = orm_relationship("DisasterEventModel", back_populates="satellite_associations")
    satellite = orm_relationship("SatelliteModel", back_populates="event_associations")


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
