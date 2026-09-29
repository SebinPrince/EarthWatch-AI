from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class SatelliteBase(BaseModel):
    id: str
    name: str
    norad_id: Optional[int] = None
    country: Optional[str] = None
    operator: Optional[str] = None
    mission: str
    purpose: Optional[str] = None
    orbit_type: Optional[str] = "LEO"
    altitude: Optional[float] = 500.0
    launch_date: Optional[str] = None
    latitude: float
    longitude: float
    velocity: Optional[float] = 7.6
    inclination: Optional[float] = 98.2
    eccentricity: Optional[float] = None
    period_minutes: Optional[float] = None
    tle_line1: Optional[str] = None
    tle_line2: Optional[str] = None
    sensor_type: Optional[str] = None
    swath_km: Optional[float] = None
    data_source: Optional[str] = "CelesTrak / NORAD"
    status: str = "Active"
    is_live: bool = True


class SatelliteOut(SatelliteBase):
    last_updated: Optional[datetime] = None
    next_pass_prediction: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class EventSatelliteOut(BaseModel):
    satellite_id: str
    satellite_name: str
    mission: str
    orbit_type: str
    altitude: Optional[float] = None
    latitude: float
    longitude: float
    relationship: str
    distance_km: float
    sensor_type: Optional[str] = "Multispectral Observation"
    swath_km: Optional[float] = 250.0
    next_pass_in_minutes: Optional[int] = None

    class Config:
        from_attributes = True


class DisasterEventBase(BaseModel):
    id: str
    title: str
    type: str # wildfire, flood, cyclone, earthquake, volcano, heatwave, storm, environmental_anomaly
    latitude: float
    longitude: float
    severity: str # low, moderate, high, critical
    description: Optional[str] = None
    source: str
    status: str = "Active"
    affected_area_km2: Optional[float] = None
    estimated_population: Optional[int] = None
    ai_summary: Optional[str] = None
    is_live: bool = False
    is_simulated: bool = False


class DisasterEventOut(DisasterEventBase):
    detected_at: datetime

    class Config:
        from_attributes = True


class DisasterEventDetail(DisasterEventOut):
    relevant_satellites: List[EventSatelliteOut] = []
    weather_context: Optional[Dict[str, Any]] = None


class LocationBase(BaseModel):
    id: str
    name: str
    country: str
    latitude: float
    longitude: float
    region: Optional[str] = None
    population: Optional[int] = None


class LocationOut(LocationBase):
    class Config:
        from_attributes = True


class LocationDetail(LocationOut):
    current_events: List[DisasterEventOut] = []
    nearby_satellites: List[SatelliteOut] = []
    weather: Optional[Dict[str, Any]] = None
    historical_events_count: int = 0
    risk_level: str = "Low"


# Simulation schemas
class SimulationRequest(BaseModel):
    event_type: str = Field(..., description="cyclone, wildfire, flood, heatwave, volcano")
    starting_location_name: Optional[str] = "Selected Point"
    latitude: float
    longitude: float
    intensity: int = Field(3, ge=1, le=5, description="1 (Minor) to 5 (Extreme)")
    radius_km: float = Field(150.0, ge=10.0, le=1500.0)
    direction_deg: float = Field(45.0, ge=0.0, le=360.0) # Angle of movement
    speed_kmh: float = Field(25.0, ge=0.0, le=300.0)
    duration_hours: int = Field(48, ge=6, le=120)


class SimulationStep(BaseModel):
    hour: int
    latitude: float
    longitude: float
    radius_km: float
    intensity: int
    affected_population: int
    affected_area_km2: float


class SimulationResponse(BaseModel):
    simulation_id: str
    is_simulation: bool = True
    notice: str = "SIMULATION — NOT A REAL EVENT"
    event_type: str
    title: str
    center_latitude: float
    center_longitude: float
    max_radius_km: float
    total_affected_area_km2: float
    estimated_population: int
    steps: List[SimulationStep]
    nearby_monitoring_satellites: List[EventSatelliteOut]
    nearby_regions: List[str]
    ai_risk_assessment: str


# AI Analyst schemas
class AIAnalyzeRequest(BaseModel):
    query: str
    selected_event_id: Optional[str] = None
    selected_location_id: Optional[str] = None
    context_filters: Optional[Dict[str, Any]] = None


class AIAnalyzeResponse(BaseModel):
    query: str
    answer: str
    confidence: float
    sources: List[str]
    relevant_events: List[DisasterEventOut] = []
    relevant_satellites: List[SatelliteOut] = []
    suggestions: List[str] = []
    insufficient_data: bool = False


# Analytics schemas
class AnalyticsData(BaseModel):
    total_events: int
    total_satellites: int
    events_by_type: Dict[str, int]
    events_by_severity: Dict[str, int]
    events_by_region: Dict[str, int]
    satellites_by_mission: Dict[str, int]
    timeline_trend: List[Dict[str, Any]]
    last_updated: datetime
