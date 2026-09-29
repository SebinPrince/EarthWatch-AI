import httpx
from typing import List, Dict, Any

SEED_LOCATIONS: List[Dict[str, Any]] = [
    {
        "id": "loc-kerala",
        "name": "Kerala",
        "country": "India",
        "region": "South Asia",
        "latitude": 10.8505,
        "longitude": 76.2711,
        "population": 34630000
    },
    {
        "id": "loc-tokyo",
        "name": "Tokyo",
        "country": "Japan",
        "region": "East Asia",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "population": 37400000
    },
    {
        "id": "loc-california",
        "name": "California",
        "country": "United States",
        "region": "North America",
        "latitude": 36.7783,
        "longitude": -119.4179,
        "population": 39000000
    },
    {
        "id": "loc-athens",
        "name": "Athens",
        "country": "Greece",
        "region": "Southern Europe",
        "latitude": 37.9838,
        "longitude": 23.7275,
        "population": 3150000
    },
    {
        "id": "loc-reykjavik",
        "name": "Reykjavik",
        "country": "Iceland",
        "region": "Northern Europe",
        "latitude": 64.1466,
        "longitude": -21.9426,
        "population": 135000
    },
    {
        "id": "loc-manila",
        "name": "Manila",
        "country": "Philippines",
        "region": "Southeast Asia",
        "latitude": 14.5995,
        "longitude": 120.9842,
        "population": 14600000
    },
    {
        "id": "loc-sydney",
        "name": "Sydney",
        "country": "Australia",
        "region": "Oceania",
        "latitude": -33.8688,
        "longitude": 151.2093,
        "population": 5312000
    },
    {
        "id": "loc-cairo",
        "name": "Cairo",
        "country": "Egypt",
        "region": "North Africa",
        "latitude": 30.0444,
        "longitude": 31.2357,
        "population": 21750000
    },
    {
        "id": "loc-saopaulo",
        "name": "São Paulo",
        "country": "Brazil",
        "region": "South America",
        "latitude": -23.5505,
        "longitude": -46.6333,
        "population": 22400000
    },
    {
        "id": "loc-jakarta",
        "name": "Jakarta",
        "country": "Indonesia",
        "region": "Southeast Asia",
        "latitude": -6.2088,
        "longitude": 106.8456,
        "population": 10560000
    },
    {
        "id": "loc-london",
        "name": "London",
        "country": "United Kingdom",
        "region": "Western Europe",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "population": 8982000
    },
    {
        "id": "loc-delhi",
        "name": "New Delhi",
        "country": "India",
        "region": "South Asia",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "population": 32900000
    }
]


async def geocode_query(query: str) -> List[Dict[str, Any]]:
    """
    Search location via OpenStreetMap Nominatim API, with fallback to local seed locations.
    """
    q_clean = query.strip().lower()

    # Check local seeds first for fast matches
    local_matches = [
        loc for loc in SEED_LOCATIONS
        if q_clean in loc["name"].lower() or q_clean in loc["country"].lower() or (loc.get("region") and q_clean in loc["region"].lower())
    ]

    # Also query OpenStreetMap Nominatim for any location on Earth
    remote_matches: List[Dict[str, Any]] = []
    try:
        url = "https://nominatim.openstreetmap.org/search"
        headers = {"User-Agent": "EarthWatchAI-GlobalIntelligence/1.0"}
        params = {"q": query, "format": "json", "limit": 4, "addressdetails": 1}

        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                for item in data:
                    addr = item.get("address", {})
                    country = addr.get("country", "")
                    name = item.get("name") or item.get("display_name", "").split(",")[0]
                    loc_id = f"osm-{item.get('osm_id', 'loc')}"
                    remote_matches.append({
                        "id": loc_id,
                        "name": name,
                        "country": country or "Global",
                        "region": addr.get("state") or addr.get("continent") or "Global",
                        "latitude": float(item.get("lat", 0)),
                        "longitude": float(item.get("lon", 0)),
                        "population": None
                    })
    except Exception:
        pass

    # Merge unique results
    seen_coords = set()
    combined: List[Dict[str, Any]] = []

    for item in local_matches + remote_matches:
        coord_key = (round(item["latitude"], 2), round(item["longitude"], 2))
        if coord_key not in seen_coords:
            seen_coords.add(coord_key)
            combined.append(item)

    return combined


async def reverse_geocode(lat: float, lon: float) -> Dict[str, Any]:
    """
    Reverse geocodes latitude/longitude to real human place/country/region name.
    Falls back to intelligent oceanic/geographic basin detection for maritime and remote areas.
    """
    # 1. Try OpenStreetMap Nominatim reverse geocode
    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        headers = {"User-Agent": "EarthWatchAI-GlobalIntelligence/1.0"}
        params = {"lat": lat, "lon": lon, "format": "json", "zoom": 10, "addressdetails": 1}

        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                if "address" in data:
                    addr = data["address"]
                    country = addr.get("country", "")
                    state = addr.get("state") or addr.get("region") or addr.get("province") or ""
                    city = addr.get("city") or addr.get("town") or addr.get("village") or addr.get("county") or addr.get("municipality") or ""
                    
                    place_name = city or state or country
                    display_parts = [p for p in [city, state, country] if p]
                    display_name = ", ".join(display_parts) if display_parts else data.get("display_name", f"{lat:.2f}, {lon:.2f}")

                    return {
                        "name": place_name or country or "Earth Landmark",
                        "display_name": display_name,
                        "country": country or "Global Territory",
                        "region": state or country or "Continental Region",
                        "type": "Terrestrial",
                        "is_maritime": False
                    }
    except Exception:
        pass

    # 2. Oceanic and Geographic Basin Identification heuristic
    # Polar regimes
    if lat > 66.5:
        name = "Arctic Ocean / Polar Basin"
        country = "International Arctic Waters"
        region = "North Polar Zone"
    elif lat < -60.0:
        name = "Southern Ocean / Antarctic Coast"
        country = "Antarctic Treaty Waters"
        region = "South Polar Zone"
    else:
        # Atlantic
        if -70.0 <= lon <= 20.0 and lat >= 0:
            name = "North Atlantic Ocean"
            country = "International Waters"
            region = "Atlantic Basin"
        elif -70.0 <= lon <= 20.0 and lat < 0:
            name = "South Atlantic Ocean"
            country = "International Waters"
            region = "Atlantic Basin"
        # Indian Ocean
        elif 20.0 < lon <= 100.0 and lat < 30.0:
            if 60.0 <= lon <= 78.0 and lat >= 10.0:
                name = "Arabian Sea"
            elif 80.0 <= lon <= 95.0 and lat >= 5.0:
                name = "Bay of Bengal"
            else:
                name = "Indian Ocean"
            country = "International Waters"
            region = "Indian Ocean Basin"
        # Mediterranean
        elif 30.0 <= lat <= 46.0 and -5.0 <= lon <= 36.0:
            name = "Mediterranean Sea Basin"
            country = "Mediterranean Waters"
            region = "Mediterranean"
        # Pacific
        else:
            if lat >= 0:
                name = "North Pacific Ocean"
            else:
                name = "South Pacific Ocean"
            country = "International Waters"
            region = "Pacific Basin"

    return {
        "name": name,
        "display_name": f"{name} ({country})",
        "country": country,
        "region": region,
        "type": "Maritime / Oceanic",
        "is_maritime": True
    }

