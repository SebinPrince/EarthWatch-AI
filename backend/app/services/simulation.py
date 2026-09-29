import math
import uuid
from typing import List, Dict, Any
from app.models.schemas import SimulationRequest, SimulationResponse, SimulationStep, EventSatelliteOut
from app.data.satellites_data import SATELLITE_CATALOG, compute_current_satellite_position, haversine_distance

EVENT_TITLES = {
    "cyclone": "Simulated Category {} Tropical Cyclone",
    "wildfire": "Simulated Stage {} Wildfire Front Complex",
    "flood": "Simulated Level {} Basin Inundation & Flash Flood Surge",
    "heatwave": "Simulated Tier {} Extreme Atmospheric Heat Dome",
    "volcano": "Simulated VEI-{} Volcanic Ash & Plume Eruption"
}


def run_disaster_simulation(req: SimulationRequest) -> SimulationResponse:
    sim_id = f"sim-{uuid.uuid4().hex[:8]}"
    ev_type = req.event_type.lower()
    intensity_names = {1: "Minor", 2: "Moderate", 3: "Severe", 4: "Major", 5: "Catastrophic"}
    intensity_label = intensity_names.get(req.intensity, f"Level {req.intensity}")

    title_fmt = EVENT_TITLES.get(ev_type, "Simulated Disaster Event")
    title = f"{title_fmt.format(req.intensity)} ({req.starting_location_name})"

    # Calculate propagation steps
    steps: List[SimulationStep] = []
    total_steps = min(6, req.duration_hours // 8)
    if total_steps < 3:
        total_steps = 3

    current_lat = req.latitude
    current_lon = req.longitude
    rad = math.radians(req.direction_deg)

    # 1 deg lat ~ 111 km
    lat_step_km = req.speed_kmh * 8 * math.cos(rad)
    lon_step_km = req.speed_kmh * 8 * math.sin(rad)

    # Base density heuristic per sq km
    pop_density = 180 + (req.intensity * 95)
    total_area = math.pi * (req.radius_km ** 2)

    for i in range(total_steps):
        hour = i * 8
        dlat = (lat_step_km * i) / 111.0
        # Adjust for latitude cosine in longitude
        cos_factor = max(0.2, math.cos(math.radians(current_lat)))
        dlon = (lon_step_km * i) / (111.0 * cos_factor)

        step_lat = max(-85.0, min(85.0, req.latitude + dlat))
        step_lon = ((req.longitude + dlon + 180.0) % 360.0) - 180.0

        step_radius = req.radius_km * (1.0 + (0.15 * i))
        step_area = math.pi * (step_radius ** 2)
        step_pop = int(step_area * pop_density * (0.8 + 0.1 * i))

        steps.append(SimulationStep(
            hour=hour,
            latitude=round(step_lat, 4),
            longitude=round(step_lon, 4),
            radius_km=round(step_radius, 1),
            intensity=req.intensity,
            affected_population=step_pop,
            affected_area_km2=round(step_area, 1)
        ))

    # Identify potential monitoring satellites
    relevant_sats: List[EventSatelliteOut] = []
    center_lat = req.latitude
    center_lon = req.longitude

    for sat in SATELLITE_CATALOG:
        pos = compute_current_satellite_position(sat)
        dist = haversine_distance(center_lat, center_lon, pos["latitude"], pos["longitude"])

        is_match = False
        rel = "Orbital Pass Scheduled"

        if ev_type in ["wildfire", "heatwave"] and sat["mission"] in ["Earth Observation", "Disaster monitoring"]:
            rel = "Thermal / Infrared Hotspot Monitoring"
            is_match = True
        elif ev_type in ["flood", "earthquake"] and ("SAR" in sat["purpose"] or sat["mission"] == "Disaster monitoring"):
            rel = "Synthetic Aperture Radar (SAR) Inundation Swath"
            is_match = True
        elif ev_type == "cyclone" and sat["mission"] in ["Weather", "Scientific"]:
            rel = "Continuous Atmospheric Vortex & Eyewall Tracking"
            is_match = True
        elif dist < 3500:
            rel = "Regional Orbital Footprint"
            is_match = True

        if is_match and len(relevant_sats) < 5:
            relevant_sats.append(EventSatelliteOut(
                satellite_id=sat["id"],
                satellite_name=sat["name"],
                mission=sat["mission"],
                orbit_type=sat.get("orbit_type", "LEO"),
                altitude=sat.get("altitude"),
                latitude=pos["latitude"],
                longitude=pos["longitude"],
                relationship=rel,
                distance_km=dist
            ))

    # Sort by distance
    relevant_sats.sort(key=lambda s: s.distance_km)

    # Nearby regions heuristic
    nearby_regions = [
        f"Zone A - Ground Zero ({round(req.radius_km * 0.4, 0)} km radius)",
        f"Zone B - Intermediate Exposure ({round(req.radius_km * 0.8, 0)} km radius)",
        f"Zone C - Peripheral Buffer ({round(req.radius_km, 0)} km radius)"
    ]

    total_affected_pop = int(total_area * pop_density)

    ai_assessment = (
        f"[SIMULATION ASSESSMENT] Model predicts a {intensity_label.upper()} {ev_type.upper()} "
        f"propagating toward {req.direction_deg:.0f}° at {req.speed_kmh:.1f} km/h. "
        f"Maximum radius of impact expands to {req.radius_km:.0f} km covering approximately "
        f"{total_area:,.0f} km² with an estimated {total_affected_pop:,.0f} population in danger corridors. "
        f"Recommended orbital assets: {', '.join(s.satellite_name for s in relevant_sats[:3])}."
    )

    return SimulationResponse(
        simulation_id=sim_id,
        is_simulation=True,
        notice="SIMULATION — NOT A REAL EVENT",
        event_type=ev_type,
        title=title,
        center_latitude=round(req.latitude, 4),
        center_longitude=round(req.longitude, 4),
        max_radius_km=round(req.radius_km, 1),
        total_affected_area_km2=round(total_area, 1),
        estimated_population=total_affected_pop,
        steps=steps,
        nearby_monitoring_satellites=relevant_sats,
        nearby_regions=nearby_regions,
        ai_risk_assessment=ai_assessment
    )
