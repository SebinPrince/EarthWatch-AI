import math
from datetime import datetime, timezone
from typing import List, Dict, Any

# Catalog of prominent public satellites with orbital parameters
SATELLITE_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "sat-iss",
        "name": "ISS (ZARYA)",
        "norad_id": 25544,
        "country": "International",
        "operator": "NASA / Roscosmos / ESA / JAXA",
        "mission": "Scientific",
        "purpose": "Low Earth Orbit research laboratory with high-resolution Earth viewing cameras (HDEV), lightning imaging sensor, and environmental observation instruments.",
        "orbit_type": "LEO",
        "altitude": 420.0,
        "launch_date": "1998-11-20",
        "base_lat": 24.5,
        "base_lon": 78.2,
        "velocity": 7.66,
        "inclination": 51.64,
        "period_minutes": 92.9,
        "status": "Active"
    },
    {
        "id": "sat-landsat-9",
        "name": "Landsat 9",
        "norad_id": 49260,
        "country": "United States",
        "operator": "NASA / USGS",
        "mission": "Earth Observation",
        "purpose": "Provides multispectral moderate-resolution imagery of Earth's land surface, coastal waters, and wildfires via OLI-2 and TIRS-2 instruments.",
        "orbit_type": "SSO",
        "altitude": 705.0,
        "launch_date": "2021-09-27",
        "base_lat": 10.85,
        "base_lon": 76.27,
        "velocity": 7.50,
        "inclination": 98.2,
        "period_minutes": 98.9,
        "status": "Active"
    },
    {
        "id": "sat-sentinel-2a",
        "name": "Sentinel-2A",
        "norad_id": 40697,
        "country": "European Union",
        "operator": "ESA / Copernicus",
        "mission": "Disaster monitoring",
        "purpose": "High-resolution optical multispectral imagery for land monitoring, emergency management, flood delineation, and burn scar assessment (13 spectral bands).",
        "orbit_type": "SSO",
        "altitude": 786.0,
        "launch_date": "2015-06-23",
        "base_lat": 15.3,
        "base_lon": 75.1,
        "velocity": 7.45,
        "inclination": 98.62,
        "period_minutes": 100.6,
        "status": "Active"
    },
    {
        "id": "sat-sentinel-1a",
        "name": "Sentinel-1A",
        "norad_id": 39634,
        "country": "European Union",
        "operator": "ESA / Copernicus",
        "mission": "Disaster monitoring",
        "purpose": "All-weather day-and-night C-band Synthetic Aperture Radar (SAR) for flood inundation mapping, oil spill detection, and ground deformation / earthquake displacement interferometry.",
        "orbit_type": "SSO",
        "altitude": 693.0,
        "launch_date": "2014-04-03",
        "base_lat": 8.5,
        "base_lon": 77.0,
        "velocity": 7.51,
        "inclination": 98.18,
        "period_minutes": 98.6,
        "status": "Active"
    },
    {
        "id": "sat-terra-modis",
        "name": "Terra (EOS AM-1)",
        "norad_id": 25994,
        "country": "United States",
        "operator": "NASA",
        "mission": "Earth Observation",
        "purpose": "Flagship Earth observing satellite carrying MODIS, ASTER, CERES, MISR, and MOPITT. Key source for global active thermal hotspots and wildfire detection.",
        "orbit_type": "SSO",
        "altitude": 705.0,
        "launch_date": "1999-12-18",
        "base_lat": 34.0,
        "base_lon": -118.2,
        "velocity": 7.50,
        "inclination": 98.2,
        "period_minutes": 98.8,
        "status": "Active"
    },
    {
        "id": "sat-suomi-npp",
        "name": "Suomi NPP (VIIRS)",
        "norad_id": 37849,
        "country": "United States",
        "operator": "NOAA / NASA",
        "mission": "Disaster monitoring",
        "purpose": "Equipped with the Visible Infrared Imaging Radiometer Suite (VIIRS) detecting active wildfires with 375m high spatial resolution night and day, storm tracking, and nocturnal lighting.",
        "orbit_type": "SSO",
        "altitude": 824.0,
        "launch_date": "2011-10-28",
        "base_lat": 36.7,
        "base_lon": 28.0,
        "velocity": 7.43,
        "inclination": 98.7,
        "period_minutes": 101.4,
        "status": "Active"
    },
    {
        "id": "sat-goes-16",
        "name": "GOES-16 (GOES-East)",
        "norad_id": 41866,
        "country": "United States",
        "operator": "NOAA",
        "mission": "Weather",
        "purpose": "Geostationary Advanced Baseline Imager (ABI) providing continuous real-time imagery of hurricanes, severe storms, lightning flashes (GLM), and aerosol plumes across the Western Hemisphere.",
        "orbit_type": "GEO",
        "altitude": 35786.0,
        "launch_date": "2016-11-19",
        "base_lat": 0.0,
        "base_lon": -75.2,
        "velocity": 3.07,
        "inclination": 0.05,
        "period_minutes": 1436.1,
        "status": "Active"
    },
    {
        "id": "sat-goes-18",
        "name": "GOES-18 (GOES-West)",
        "norad_id": 51850,
        "country": "United States",
        "operator": "NOAA",
        "mission": "Weather",
        "purpose": "Geostationary operational environmental satellite covering the Pacific Ocean, Alaska, Hawaii, and Western North America for atmospheric rivers, cyclones, and wildfires.",
        "orbit_type": "GEO",
        "altitude": 35786.0,
        "launch_date": "2022-03-01",
        "base_lat": 0.0,
        "base_lon": -137.2,
        "velocity": 3.07,
        "inclination": 0.08,
        "period_minutes": 1436.1,
        "status": "Active"
    },
    {
        "id": "sat-himawari-9",
        "name": "Himawari-9",
        "norad_id": 41836,
        "country": "Japan",
        "operator": "JMA (Japan Meteorological Agency)",
        "mission": "Weather",
        "purpose": "Geostationary weather satellite monitoring East Asia, Japan, India, Western Pacific typhoons, volcanic ash plumes, and aerosol optical depth every 10 minutes.",
        "orbit_type": "GEO",
        "altitude": 35793.0,
        "launch_date": "2016-11-02",
        "base_lat": 0.0,
        "base_lon": 140.7,
        "velocity": 3.07,
        "inclination": 0.06,
        "period_minutes": 1436.1,
        "status": "Active"
    },
    {
        "id": "sat-meteosat-11",
        "name": "Meteosat-11 (MSG-4)",
        "norad_id": 40732,
        "country": "European Union",
        "operator": "EUMETSAT",
        "mission": "Weather",
        "purpose": "Geostationary meteorological satellite providing rapid scan imagery over Europe and Africa for storm development, dust storms, and convective activity.",
        "orbit_type": "GEO",
        "altitude": 35786.0,
        "launch_date": "2015-07-15",
        "base_lat": 0.0,
        "base_lon": 0.0,
        "velocity": 3.07,
        "inclination": 0.04,
        "period_minutes": 1436.1,
        "status": "Active"
    },
    {
        "id": "sat-gpm-core",
        "name": "GPM Core Observatory",
        "norad_id": 39574,
        "country": "United States / Japan",
        "operator": "NASA / JAXA",
        "mission": "Scientific",
        "purpose": "Global Precipitation Measurement satellite featuring Dual-frequency Precipitation Radar (DPR) to measure rain rates, cyclone eyewall structure, and extreme flooding triggers.",
        "orbit_type": "LEO",
        "altitude": 407.0,
        "launch_date": "2014-02-27",
        "base_lat": 12.0,
        "base_lon": 82.5,
        "velocity": 7.67,
        "inclination": 65.0,
        "period_minutes": 92.6,
        "status": "Active"
    },
    {
        "id": "sat-cartosat-3",
        "name": "Cartosat-3",
        "norad_id": 44804,
        "country": "India",
        "operator": "ISRO",
        "mission": "Earth Observation",
        "purpose": "Advanced agile sub-meter high resolution Earth observation satellite for urban planning, disaster relief coordination, coastal regulation, and landslide damage mapping.",
        "orbit_type": "SSO",
        "altitude": 505.0,
        "launch_date": "2019-11-27",
        "base_lat": 13.0,
        "base_lon": 77.5,
        "velocity": 7.61,
        "inclination": 97.5,
        "period_minutes": 94.6,
        "status": "Active"
    },
    {
        "id": "sat-insat-3dr",
        "name": "INSAT-3DR",
        "norad_id": 41752,
        "country": "India",
        "operator": "ISRO",
        "mission": "Weather",
        "purpose": "Dedicated meteorological satellite in geostationary orbit with multi-spectral imager and 19-channel sounder for Indian Ocean cyclone tracking, rainfall estimation, and sea surface temperature.",
        "orbit_type": "GEO",
        "altitude": 35786.0,
        "launch_date": "2016-09-08",
        "base_lat": 0.0,
        "base_lon": 74.0,
        "velocity": 3.07,
        "inclination": 0.09,
        "period_minutes": 1436.1,
        "status": "Active"
    },
    {
        "id": "sat-gps-iii",
        "name": "NAVSTAR GPS III-05",
        "norad_id": 48859,
        "country": "United States",
        "operator": "US Space Force",
        "mission": "Navigation",
        "purpose": "Next-generation Global Positioning System satellite providing high-accuracy PNT (Positioning, Navigation, and Timing) and radio occultation atmospheric sounding.",
        "orbit_type": "MEO",
        "altitude": 20180.0,
        "launch_date": "2021-06-17",
        "base_lat": 32.1,
        "base_lon": -95.4,
        "velocity": 3.87,
        "inclination": 55.0,
        "period_minutes": 718.0,
        "status": "Active"
    },
    {
        "id": "sat-starlink-comm",
        "name": "Starlink-30211",
        "norad_id": 55800,
        "country": "United States",
        "operator": "SpaceX",
        "mission": "Communication",
        "purpose": "Low Earth Orbit broadband satellite constellation providing emergency disaster communication, internet recovery, and field team connectivity during infrastructure collapse.",
        "orbit_type": "LEO",
        "altitude": 550.0,
        "launch_date": "2023-03-03",
        "base_lat": 41.2,
        "base_lon": 12.5,
        "velocity": 7.59,
        "inclination": 53.2,
        "period_minutes": 95.5,
        "status": "Active"
    }
]


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in km."""
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)


def compute_current_satellite_position(sat: Dict[str, Any], current_time: datetime = None) -> Dict[str, Any]:
    """
    Computes realistic sub-satellite coordinates based on orbital parameters,
    inclination, and elapsed time since epoch.
    GEO satellites remain at their longitude with small inclination drift.
    LEO/SSO satellites move along orbital tracks.
    """
    if current_time is None:
        current_time = datetime.now(timezone.utc)

    orbit_type = sat.get("orbit_type", "LEO")
    base_lat = sat.get("base_lat", 0.0)
    base_lon = sat.get("base_lon", 0.0)
    period = sat.get("period_minutes", 95.0)
    inc = sat.get("inclination", 51.6)

    epoch_seconds = current_time.timestamp()

    if orbit_type == "GEO":
        # GEO satellites stay near fixed longitude with slight oscillation
        lat = 0.5 * math.sin(2 * math.pi * (epoch_seconds % 86400) / 86400.0)
        lon = base_lon
        return {
            "latitude": round(lat, 4),
            "longitude": round(lon, 4)
        }

    # Orbital progress in current orbit
    orbit_phase = (epoch_seconds / (period * 60.0)) % 1.0
    orbit_angle = 2.0 * math.pi * orbit_phase

    # Calculate sub-satellite latitude from inclination
    lat = inc * math.sin(orbit_angle)
    # Clamp to [-90, 90]
    lat = max(-89.9, min(89.9, lat))

    # Longitude precesses westward by ~360 deg per Earth rotation + node regression
    earth_rot = (epoch_seconds / 86400.0) * 360.0
    lon = (base_lon + orbit_phase * 360.0 - earth_rot) % 360.0
    if lon > 180.0:
        lon -= 360.0

    return {
        "latitude": round(lat, 4),
        "longitude": round(lon, 4)
    }
