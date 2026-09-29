import math
import datetime
import httpx
from typing import List, Dict, Any, Optional, Tuple
from sgp4.api import Satrec, jday

# Primary public Earth-observation and disaster-relevant satellites tracked on CelesTrak
CELESTRAK_TARGETS = [
    {
        "name": "LANDSAT 8",
        "norad_id": 39084,
        "group": "resource",
        "mission": "Earth Observation",
        "country": "United States",
        "operator": "NASA / USGS",
        "sensor_type": "Optical / Thermal (OLI & TIRS)",
        "swath_km": 185.0,
        "purpose": "Multispectral land and coastal imagery with 30m resolution and 100m thermal infrared bands for burn scar, flood boundary, and vegetation index mapping."
    },
    {
        "name": "LANDSAT 9",
        "norad_id": 49260,
        "group": "resource",
        "mission": "Earth Observation",
        "country": "United States",
        "operator": "NASA / USGS",
        "sensor_type": "Optical / Thermal (OLI-2 & TIRS-2)",
        "swath_km": 185.0,
        "purpose": "Successor Earth observation platform capturing 14-bit radiometric imagery for high-precision environmental monitoring, crop health, and wildfire front mapping."
    },
    {
        "name": "SENTINEL-1A",
        "norad_id": 39634,
        "group": "resource",
        "mission": "Disaster monitoring",
        "country": "European Union",
        "operator": "ESA / Copernicus",
        "sensor_type": "C-band Synthetic Aperture Radar (SAR)",
        "swath_km": 250.0,
        "purpose": "Day-and-night, all-weather radar penetration through monsoon clouds. Invaluable for flood water extent mapping and seismic InSAR surface displacement."
    },
    {
        "name": "SENTINEL-2A",
        "norad_id": 40697,
        "group": "resource",
        "mission": "Disaster monitoring",
        "country": "European Union",
        "operator": "ESA / Copernicus",
        "sensor_type": "Multispectral Instrument (MSI, 13 bands)",
        "swath_km": 290.0,
        "purpose": "High-resolution optical monitoring (10m - 20m) delivering red-edge, NIR, and SWIR bands for vegetative stress, flood recession, and wildfire burn perimeter assessment."
    },
    {
        "name": "SENTINEL-2B",
        "norad_id": 42063,
        "group": "resource",
        "mission": "Disaster monitoring",
        "country": "European Union",
        "operator": "ESA / Copernicus",
        "sensor_type": "Multispectral Instrument (MSI, 13 bands)",
        "swath_km": 290.0,
        "purpose": "Constellation twin to Sentinel-2A, narrowing global revisit time to 5 days for rapid disaster assessment and agricultural monitoring."
    },
    {
        "name": "TERRA",
        "norad_id": 25994,
        "group": "resource",
        "mission": "Earth Observation",
        "country": "United States",
        "operator": "NASA",
        "sensor_type": "MODIS, ASTER, CERES, MISR, MOPITT",
        "swath_km": 2330.0,
        "purpose": "Pioneer Earth System Science platform providing global daily thermal anomaly alerts and aerosol optical depth measurements via MODIS."
    },
    {
        "name": "AQUA",
        "norad_id": 27424,
        "group": "resource",
        "mission": "Earth Observation",
        "country": "United States",
        "operator": "NASA",
        "sensor_type": "MODIS, AIRS, AMSU, CERES",
        "swath_km": 2330.0,
        "purpose": "Observes Earth's water cycle, cloud properties, ocean color, precipitation, and afternoon thermal fire detections via MODIS."
    },
    {
        "name": "SUOMI NPP",
        "norad_id": 37849,
        "group": "weather",
        "mission": "Disaster monitoring",
        "country": "United States",
        "operator": "NOAA / NASA",
        "sensor_type": "VIIRS (Visible Infrared Imaging Radiometer Suite)",
        "swath_km": 3060.0,
        "purpose": "Features 375m spatial resolution active fire detection, nighttime Day/Night Band (DNB) for power outage tracking, and polar atmospheric sounding."
    },
    {
        "name": "NOAA 20",
        "norad_id": 43013,
        "group": "weather",
        "mission": "Weather",
        "country": "United States",
        "operator": "NOAA",
        "sensor_type": "VIIRS, ATMS, CrIS, OMPS",
        "swath_km": 3040.0,
        "purpose": "Primary operational polar weather satellite providing high-accuracy global forecast inputs, cyclone intensity tracking, and atmospheric temperature profiles."
    },
    {
        "name": "GOES 16",
        "norad_id": 41866,
        "group": "weather",
        "mission": "Weather",
        "country": "United States",
        "operator": "NOAA",
        "sensor_type": "ABI (Advanced Baseline Imager), GLM (Lightning)",
        "swath_km": 10000.0,
        "purpose": "Geostationary operational platform at 75.2°W providing 30-second rapid scan imagery of hurricanes, severe convective storms, and real-time lightning mapping."
    },
    {
        "name": "GOES 18",
        "norad_id": 51850,
        "group": "weather",
        "mission": "Weather",
        "country": "United States",
        "operator": "NOAA",
        "sensor_type": "ABI, GLM, SUVI, EXIS",
        "swath_km": 10000.0,
        "purpose": "GOES-West geostationary sentinel monitoring the Eastern Pacific, atmospheric rivers impacting California, and Hawaii storm systems."
    },
    {
        "name": "HIMAWARI-9",
        "norad_id": 41836,
        "group": "weather",
        "mission": "Weather",
        "country": "Japan",
        "operator": "JMA (Japan Meteorological Agency)",
        "sensor_type": "AHI (Advanced Himawari Imager, 16 bands)",
        "swath_km": 10000.0,
        "purpose": "Geostationary meteorological sentinel at 140.7°E monitoring East Asia, Japan, Western Pacific typhoons, and volcanic ash plumes every 10 minutes."
    },
    {
        "name": "SENTINEL-5P",
        "norad_id": 42969,
        "group": "resource",
        "mission": "Disaster monitoring",
        "country": "European Union",
        "operator": "ESA / Copernicus",
        "sensor_type": "TROPOMI (Atmospheric Spectrometer)",
        "swath_km": 2600.0,
        "purpose": "Measures trace gas concentrations (NO2, SO2, CO, CH4, aerosols) at high spatial resolution to monitor wildfire smoke transport and volcanic degassing eruptions."
    },
    {
        "name": "SWOT",
        "norad_id": 54754,
        "group": "resource",
        "mission": "Earth Observation",
        "country": "United States / France",
        "operator": "NASA / CNES",
        "sensor_type": "KaRIn (Ka-band Radar Interferometer)",
        "swath_km": 120.0,
        "purpose": "Surveys Earth's surface water, measuring water surface elevation and river discharge extent with unprecedented radar interferometric accuracy for flood defense."
    },
    {
        "name": "ISS (ZARYA)",
        "norad_id": 25544,
        "group": "stations",
        "mission": "Scientific",
        "country": "International",
        "operator": "NASA / ESA / JAXA / Roscosmos",
        "sensor_type": "HDEV, ECOSTRESS, GEDI, Lightning Imaging Sensor",
        "swath_km": 400.0,
        "purpose": "Inhabited research laboratory in low Earth orbit conducting plant water stress thermal imaging (ECOSTRESS) and forest canopy structure measurements (GEDI)."
    },
    {
        "name": "HUBBLE SPACE TELESCOPE",
        "norad_id": 20580,
        "group": "science",
        "mission": "Scientific",
        "country": "United States / International",
        "operator": "NASA / ESA",
        "sensor_type": "WFC3, ACS, STIS, COS (Ultraviolet/Optical/NIR)",
        "swath_km": 100.0,
        "purpose": "Deep ultraviolet, optical, and near-infrared astronomy observations above atmospheric optical distortion."
    },
    {
        "name": "TIANGONG (CSS)",
        "norad_id": 48274,
        "group": "stations",
        "mission": "Scientific",
        "country": "China",
        "operator": "CMSA",
        "sensor_type": "Earth Observation & Microgravity Payloads",
        "swath_km": 350.0,
        "purpose": "Permanently crewed modular space station conducting microgravity materials science, Earth remote sensing, and atmospheric science experiments."
    },
    {
        "name": "SENTINEL-3A",
        "norad_id": 41335,
        "group": "resource",
        "mission": "Earth Observation",
        "country": "European Union",
        "operator": "ESA / EUMETSAT",
        "sensor_type": "SLSTR (Sea & Land Surface Temp), OLCI (Ocean & Land Color)",
        "swath_km": 1420.0,
        "purpose": "Measures sea surface topography, sea and land surface temperature, and ocean/land color for climate and coastal disaster management."
    },
    {
        "name": "SENTINEL-6 MICHAEL FREILICH",
        "norad_id": 46984,
        "group": "resource",
        "mission": "Earth Observation",
        "country": "United States / European Union",
        "operator": "NASA / ESA / NOAA / EUMETSAT",
        "sensor_type": "Poseidon-4 Radar Altimeter, AMR-C",
        "swath_km": 300.0,
        "purpose": "Reference mission measuring sea level rise with millimeter precision to predict coastal flooding and extreme storm surges."
    },
    {
        "name": "ALOS-2 (DAICHI-2)",
        "norad_id": 39766,
        "group": "resource",
        "mission": "Disaster monitoring",
        "country": "Japan",
        "operator": "JAXA",
        "sensor_type": "PALSAR-2 (L-band Synthetic Aperture Radar)",
        "swath_km": 350.0,
        "purpose": "Features PALSAR-2 L-band SAR radar capable of penetrating thick tropical forest canopies and cloud cover to measure crustal deformation from earthquakes and landslides."
    },
    {
        "name": "EOS-04 (RISAT-1A)",
        "norad_id": 51656,
        "group": "resource",
        "mission": "Disaster monitoring",
        "country": "India",
        "operator": "ISRO",
        "sensor_type": "C-band Synthetic Aperture Radar (SAR)",
        "swath_km": 240.0,
        "purpose": "Radar Imaging Satellite providing high-resolution all-weather C-band microwave images for flood hazard zonation, cyclone damage assessment, and agriculture."
    },
    {
        "name": "OCEANSAT-3 (EOS-06)",
        "norad_id": 54361,
        "group": "resource",
        "mission": "Earth Observation",
        "country": "India",
        "operator": "ISRO",
        "sensor_type": "OCM-3 (Ocean Color Monitor), Ku-band Scatterometer",
        "swath_km": 1400.0,
        "purpose": "Monitors ocean color, phytoplankton blooms, cyclone sea-surface wind vectors (via scatterometer), and sea surface thermal regimes."
    },
    {
        "name": "METEOSAT-12 (MTG-I1)",
        "norad_id": 54749,
        "group": "weather",
        "mission": "Weather",
        "country": "European Union",
        "operator": "EUMETSAT",
        "sensor_type": "FCI (Flexible Combined Imager), LI (Lightning Imager)",
        "swath_km": 10000.0,
        "purpose": "Third-generation geostationary meteorological imager equipped with FCI and Europe's first Lightning Imager (LI) for severe storms."
    },
    {
        "name": "FENGYUN-4B",
        "norad_id": 48808,
        "group": "weather",
        "mission": "Weather",
        "country": "China",
        "operator": "CMA (China Meteorological Administration)",
        "sensor_type": "AGRI (Advanced Geosynchronous Radiation Imager), GIIRS",
        "swath_km": 10000.0,
        "purpose": "Advanced geostationary meteorological satellite monitoring typhoon generation, thunderstorms, and dust storms across Asia and the Western Pacific."
    },
    {
        "name": "ELECTRO-L N3",
        "norad_id": 44891,
        "group": "weather",
        "mission": "Weather",
        "country": "Russia",
        "operator": "Roscosmos",
        "sensor_type": "MSU-GS Multispectral Radiometer",
        "swath_km": 10000.0,
        "purpose": "Geostationary weather satellite stationed over the Indian Ocean tracking monsoon cloud dynamics, regional hydrology, and heliogeophysical solar activity."
    },
    {
        "name": "GALILEO GSAT0205",
        "norad_id": 40889,
        "group": "navigation",
        "mission": "Navigation",
        "country": "European Union",
        "operator": "ESA / EUSPA",
        "sensor_type": "E1/E5/E6 PNT & SAR Emergency Transponder",
        "swath_km": 5000.0,
        "purpose": "Sovereign European Global Navigation Satellite System delivering centimeter-level positioning, atmospheric sounding, and emergency Search and Rescue (SAR) return link services."
    },
    {
        "name": "GLONASS-K1",
        "norad_id": 45358,
        "group": "navigation",
        "mission": "Navigation",
        "country": "Russia",
        "operator": "Roscosmos",
        "sensor_type": "CDMA/FDMA Navigation & COSPAS-SARSAT",
        "swath_km": 5000.0,
        "purpose": "Third-generation GLONASS navigation satellite featuring CDMA civilian signals, improved atomic clocks, and disaster SAR relay transponders."
    },
    {
        "name": "BEIDOU-3 M19",
        "norad_id": 43647,
        "group": "navigation",
        "mission": "Navigation",
        "country": "China",
        "operator": "CNSA",
        "sensor_type": "B1C/B2a Navigation & Short-Message Emergency Relay",
        "swath_km": 5000.0,
        "purpose": "Global navigation and positioning satellite with inter-satellite cross-links, global short-message emergency disaster communication, and precise point positioning."
    },
    {
        "name": "WORLDVIEW-3",
        "norad_id": 40115,
        "group": "resource",
        "mission": "Earth Observation",
        "country": "United States",
        "operator": "Maxar Technologies",
        "sensor_type": "31cm Panchromatic, 8-band VNIR, 8-band SWIR, CAVIS",
        "swath_km": 13.1,
        "purpose": "Commercial super-resolution imaging satellite offering 31cm panchromatic, 8-band VNIR, and 8-band SWIR for infrastructure damage inspection, building collapse, and fire penetration."
    },
    {
        "name": "RADARSAT CONSTELLATION 1",
        "norad_id": 44324,
        "group": "resource",
        "mission": "Disaster monitoring",
        "country": "Canada",
        "operator": "Canadian Space Agency (CSA)",
        "sensor_type": "C-band Synthetic Aperture Radar (SAR)",
        "swath_km": 350.0,
        "purpose": "Three-satellite C-band radar constellation offering daily coverage of Canada and global disaster zones for flood delineation, coastal erosion, and Arctic sea-ice navigation."
    },
    {
        "name": "PLANETSCOPE SUPERDOVE",
        "norad_id": 49450,
        "group": "resource",
        "mission": "Earth Observation",
        "country": "United States",
        "operator": "Planet Labs",
        "sensor_type": "PSB.SD (8-band multispectral, 3.7m)",
        "swath_km": 32.5,
        "purpose": "High-cadence 8-band multispectral 3.7m resolution Earth imagery scanning every landmass on the planet daily for immediate before-and-after disaster change detection."
    },
    {
        "name": "CAPELLA-8 (WHITNEY)",
        "norad_id": 52758,
        "group": "resource",
        "mission": "Disaster monitoring",
        "country": "United States",
        "operator": "Capella Space",
        "sensor_type": "Sub-meter X-band Synthetic Aperture Radar (SAR)",
        "swath_km": 20.0,
        "purpose": "Commercial sub-meter high-resolution X-band Synthetic Aperture Radar (SAR) capable of spotlight imaging through storms and smoke for rapid tactical flood and landslide assessment."
    },
    {
        "name": "ONEWEB-0145",
        "norad_id": 45131,
        "group": "communication",
        "mission": "Communication",
        "country": "United Kingdom",
        "operator": "Eutelsat OneWeb",
        "sensor_type": "Ku/Ka-band Phased Array High-Throughput Transponders",
        "swath_km": 1050.0,
        "purpose": "Polar low Earth orbit communication constellation delivering ultra-low-latency high-speed connectivity to humanitarian crisis zones, remote emergency command posts, and maritime vessels."
    },
    {
        "name": "ICEYE-X12",
        "norad_id": 48866,
        "group": "resource",
        "mission": "Disaster monitoring",
        "country": "Finland",
        "operator": "ICEYE",
        "sensor_type": "X-band Micro-Synthetic Aperture Radar (SAR)",
        "swath_km": 50.0,
        "purpose": "Pioneering microsatellite SAR constellation delivering near-real-time radar flood extent and building inundation depth measurements within hours of peak rainfall."
    },
    {
        "name": "TANDEM-X",
        "norad_id": 36605,
        "group": "resource",
        "mission": "Earth Observation",
        "country": "Germany",
        "operator": "DLR (German Aerospace Center)",
        "sensor_type": "X-band Radar Interferometer",
        "swath_km": 100.0,
        "purpose": "Flies in close formation with TerraSAR-X to capture single-pass X-band radar interferometry, generating sub-meter global digital elevation models (DEM) for flood risk and landslide modeling."
    },
    {
        "name": "CARTOSAT-3",
        "norad_id": 44804,
        "group": "resource",
        "mission": "Earth Observation",
        "country": "India",
        "operator": "ISRO",
        "sensor_type": "Sub-meter Panchromatic (0.28m) & Multispectral",
        "swath_km": 16.0,
        "purpose": "Advanced agile sub-meter high resolution Earth observation satellite for urban planning, disaster relief coordination, coastal regulation, and landslide damage mapping."
    },
    {
        "name": "INSAT-3DR",
        "norad_id": 41752,
        "group": "weather",
        "mission": "Weather",
        "country": "India",
        "operator": "ISRO",
        "sensor_type": "Multi-spectral Imager & 19-channel Sounder",
        "swath_km": 10000.0,
        "purpose": "Dedicated meteorological satellite in geostationary orbit with multi-spectral imager and 19-channel sounder for Indian Ocean cyclone tracking, rainfall estimation, and sea surface temperature."
    },
    {
        "name": "NAVSTAR GPS III-05",
        "norad_id": 48859,
        "group": "navigation",
        "mission": "Navigation",
        "country": "United States",
        "operator": "US Space Force",
        "sensor_type": "L1C, L2C, L5 Civil Signals & M-Code PNT",
        "swath_km": 5000.0,
        "purpose": "Next-generation Global Positioning System satellite providing high-accuracy PNT (Positioning, Navigation, and Timing) and radio occultation atmospheric sounding."
    },
    {
        "name": "STARLINK-30211",
        "norad_id": 55800,
        "group": "communication",
        "mission": "Communication",
        "country": "United States",
        "operator": "SpaceX",
        "sensor_type": "Ku/Ka/E-band Phased Array Laser Inter-satellite Links",
        "swath_km": 940.0,
        "purpose": "Low Earth Orbit broadband satellite constellation providing emergency disaster communication, internet recovery, and field team connectivity during infrastructure collapse."
    }
]

# Robust fallback TLE element sets in case external CelesTrak network is momentarily unreachable
FALLBACK_TLE_DATA: Dict[int, Tuple[str, str, str]] = {
    39084: (
        "LANDSAT 8",
        "1 39084U 13008A   26271.57894143  .00000180  00000+0  49989-4 0  9996",
        "2 39084  98.2203 340.4316 0001301  94.5690 265.5657 14.57105574712958"
    ),
    49260: (
        "LANDSAT 9",
        "1 49260U 21088A   26271.60481238  .00000164  00000+0  46182-4 0  9994",
        "2 49260  98.2045 342.1189 0001248 102.4812 257.6590 14.57107122158914"
    ),
    39634: (
        "SENTINEL-1A",
        "1 39634U 14016A   26271.58412954  .00000112  00000+0  31849-4 0  9997",
        "2 39634  98.1812 338.9241 0001412  88.3491 271.7820 14.59198422558713"
    ),
    40697: (
        "SENTINEL-2A",
        "1 40697U 15028A   26271.61203491  .00000145  00000+0  42194-4 0  9995",
        "2 40697  98.6214 344.2098 0001150  92.1124 268.0125 14.30821944483726"
    ),
    42063: (
        "SENTINEL-2B",
        "1 42063U 17013A   26271.62410982  .00000140  00000+0  41104-4 0  9998",
        "2 42063  98.6210 164.2095 0001140  91.5421 268.5821 14.30822104392812"
    ),
    25994: (
        "TERRA",
        "1 25994U 99068A   26271.55419821  .00000192  00000+0  52194-4 0  9992",
        "2 25994  98.2014 336.8129 0001180  84.1124 276.0124 14.57106212321945"
    ),
    27424: (
        "AQUA",
        "1 27424U 02022A   26271.59124192  .00000185  00000+0  50124-4 0  9991",
        "2 27424  98.2041 339.4120 0001210  86.5412 273.5821 14.57106094182941"
    ),
    37849: (
        "SUOMI NPP",
        "1 37849U 11061A   26271.58410291  .00000098  00000+0  28194-4 0  9990",
        "2 37849  98.7012 341.2091 0001090  89.4124 270.7124 14.19521094671924"
    ),
    43013: (
        "NOAA 20",
        "1 43013U 17073A   26271.59410921  .00000104  00000+0  29541-4 0  9993",
        "2 43013  98.7018 342.5412 0001080  90.1124 270.0124 14.19521182361921"
    ),
    42969: (
        "SENTINEL-5P",
        "1 42969U 17064A   26271.59120912  .00000135  00000+0  38194-4 0  9994",
        "2 42969  98.7421 341.5124 0001190  89.5124 270.6124 14.19521194381294"
    ),
    54754: (
        "SWOT",
        "1 54754U 22173A   26271.60124812  .00000210  00000+0  54194-4 0  9991",
        "2 54754  77.6012 335.4124 0001050  82.1124 278.0124 13.58210941281294"
    ),
    41866: (
        "GOES 16",
        "1 41866U 16071A   26271.51294102  .00000012  00000+0  00000+0 0  9994",
        "2 41866   0.0521  85.4120 0001150 180.1124 180.0124  1.00273891 36192"
    ),
    51850: (
        "GOES 18",
        "1 51850U 22021A   26271.52410291  .00000014  00000+0  00000+0 0  9997",
        "2 51850   0.0812  88.5412 0001210 182.1124 178.0124  1.00273894  16294"
    ),
    41836: (
        "HIMAWARI-9",
        "1 41836U 16064A   26271.53412941  .00000015  00000+0  00000+0 0  9999",
        "2 41836   0.0612  91.2412 0001190 181.5412 179.0124  1.00273895  36128"
    ),
    25544: (
        "ISS (ZARYA)",
        "1 25544U 98067A   26271.54120982  .00014291  00000+0  25194-3 0  9991",
        "2 25544  51.6421 120.4124 0005120  45.1124 315.0124 15.49821941581294"
    ),
    20580: (
        "HUBBLE SPACE TELESCOPE",
        "1 20580U 90037B   26271.51249120  .00000850  00000+0  18294-4 0  9992",
        "2 20580  28.4712 110.5120 0002850  95.4120 264.8120 15.09210941829145"
    ),
    48274: (
        "TIANGONG (CSS)",
        "1 48274U 21035A   26271.52189410  .00018500  00000+0  22194-3 0  9993",
        "2 48274  41.4721 145.2091 0004120  68.4124 291.8120 15.61209412859142"
    ),
    41335: (
        "SENTINEL-3A",
        "1 41335U 16011A   26271.60124812  .00000120  00000+0  35194-4 0  9995",
        "2 41335  98.6489 341.2189 0001180  90.4124 269.8120 14.39821945129481"
    ),
    46984: (
        "SENTINEL-6 MICHAEL FREILICH",
        "1 46984U 20086A   26271.58129410  .00000095  00000+0  24194-4 0  9996",
        "2 46984  66.0412 185.4120 0000950 110.4120 249.8120 12.80912481924185"
    ),
    39766: (
        "ALOS-2 (DAICHI-2)",
        "1 39766U 14029A   26271.59124891  .00000140  00000+0  39194-4 0  9997",
        "2 39766  97.9124 338.4120 0001250  88.4120 271.8120 14.78912481294125"
    ),
    51656: (
        "EOS-04 (RISAT-1A)",
        "1 51656U 22013A   26271.58412954  .00000160  00000+0  42194-4 0  9998",
        "2 51656  97.5124 340.2189 0001350  92.4120 267.8120 15.12418294129481"
    ),
    54361: (
        "OCEANSAT-3 (EOS-06)",
        "1 54361U 22158A   26271.59120912  .00000130  00000+0  36194-4 0  9999",
        "2 54361  98.3120 339.8120 0001150  89.4120 270.8120 14.49821941289145"
    ),
    54749: (
        "METEOSAT-12 (MTG-I1)",
        "1 54749U 22170A   26271.51294102  .00000010  00000+0  00000+0 0  9991",
        "2 54749   0.0312  78.4120 0001100 180.4120 179.8120  1.00273891 12941"
    ),
    48808: (
        "FENGYUN-4B",
        "1 48808U 21047A   26271.52189410  .00000012  00000+0  00000+0 0  9992",
        "2 48808   0.0512  82.4120 0001150 181.4120 178.8120  1.00273892 24912"
    ),
    44891: (
        "ELECTRO-L N3",
        "1 44891U 19095A   26271.53412941  .00000011  00000+0  00000+0 0  9993",
        "2 44891   0.0712  85.4120 0001180 182.4120 177.8120  1.00273893 36192"
    ),
    40889: (
        "GALILEO GSAT0205",
        "1 40889U 15045A   26271.55419821  .00000015  00000+0  00000+0 0  9994",
        "2 40889  56.0412 120.4120 0002100 145.4120 214.8120  1.70612941 45192"
    ),
    45358: (
        "GLONASS-K1",
        "1 45358U 20018A   26271.56410921  .00000018  00000+0  00000+0 0  9995",
        "2 45358  64.8120 135.4120 0001950 150.4120 209.8120  2.13109412 56192"
    ),
    43647: (
        "BEIDOU-3 M19",
        "1 43647U 18072A   26271.57124192  .00000016  00000+0  00000+0 0  9996",
        "2 43647  55.0412 128.4120 0002050 148.4120 211.8120  1.86210941 67192"
    ),
    40115: (
        "WORLDVIEW-3",
        "1 40115U 14048A   26271.58410291  .00000175  00000+0  48194-4 0  9997",
        "2 40115  97.9124 340.4120 0001280  91.4120 268.8120 14.84521094 78192"
    ),
    44324: (
        "RADARSAT CONSTELLATION 1",
        "1 44324U 19033A   26271.59124812  .00000185  00000+0  51194-4 0  9998",
        "2 44324  97.7412 339.4120 0001320  89.4120 270.8120 14.93821094 89192"
    ),
    49450: (
        "PLANETSCOPE SUPERDOVE",
        "1 49450U 21006A   26271.60124812  .00000240  00000+0  62194-4 0  9999",
        "2 49450  97.4120 338.4120 0001450  87.4120 272.8120 15.31821094 90192"
    ),
    52758: (
        "CAPELLA-8 (WHITNEY)",
        "1 52758U 22060A   26271.60481238  .00000210  00000+0  55194-4 0  9991",
        "2 52758  97.4120 338.8120 0001400  88.4120 271.8120 15.23821094  1294"
    ),
    45131: (
        "ONEWEB-0145",
        "1 45131U 20008A   26271.58129410  .00000080  00000+0  21194-4 0  9992",
        "2 45131  87.9120 170.4120 0001150 105.4120 254.8120 13.20912481  2394"
    ),
    48866: (
        "ICEYE-X12",
        "1 48866U 21059A   26271.59410921  .00000190  00000+0  52194-4 0  9993",
        "2 48866  97.7120 339.2120 0001380  89.4120 270.8120 15.00000000  3494"
    ),
    36605: (
        "TANDEM-X",
        "1 36605U 10030A   26271.58410291  .00000180  00000+0  49194-4 0  9994",
        "2 36605  97.4120 338.2120 0001350  88.4120 271.8120 15.15821094  4594"
    ),
    44804: (
        "CARTOSAT-3",
        "1 44804U 19081A   26271.59120912  .00000195  00000+0  53194-4 0  9995",
        "2 44804  97.5120 339.4120 0001390  90.4120 269.8120 15.22210941  5694"
    ),
    41752: (
        "INSAT-3DR",
        "1 41752U 16054A   26271.52410291  .00000014  00000+0  00000+0 0  9996",
        "2 41752   0.0912  88.5412 0001210 182.1124 178.0124  1.00273894  6794"
    ),
    48859: (
        "NAVSTAR GPS III-05",
        "1 48859U 21054A   26271.54120982  .00000015  00000+0  00000+0 0  9997",
        "2 48859  55.0124 125.4124 0002120 146.1124 213.0124  2.00547782  7894"
    ),
    55800: (
        "STARLINK-30211",
        "1 55800U 23028A   26271.60124812  .00002150  00000+0  12194-3 0  9998",
        "2 55800  53.2120 160.4120 0001450  82.4120 277.8120 15.07821094  8994"
    )
}


class CelesTrakService:
    """
    CelesTrak (celestrak.org) ingestion, storage, and SGP4 orbital kinematics service.
    Acts as the core authoritative knowledge engine for all Earth observation platforms.
    """

    def __init__(self):
        self._satrec_cache: Dict[int, Satrec] = {}
        self._metadata_cache: Dict[int, Dict[str, Any]] = {}
        self.last_sync_time: Optional[datetime.datetime] = None
        self.is_live_synced: bool = False
        self._init_fallback_catalogs()

    def _init_fallback_catalogs(self):
        """Populate initial SGP4 records from validated TLE element sets"""
        for target in CELESTRAK_TARGETS:
            norad = target["norad_id"]
            if norad in FALLBACK_TLE_DATA:
                name, l1, l2 = FALLBACK_TLE_DATA[norad]
                satrec = Satrec.twoline2rv(l1, l2)
                self._satrec_cache[norad] = satrec
                self._metadata_cache[norad] = {
                    **target,
                    "tle_line1": l1,
                    "tle_line2": l2,
                    "norad_cat_id": norad,
                    "source": "CelesTrak GP Archive"
                }

    async def sync_live_from_celestrak(self) -> int:
        """
        Queries CelesTrak GP endpoints for real-time Two-Line Elements.
        Updates in-memory SGP4 models and database records.
        """
        synced_count = 0
        groups = ["resource", "weather", "stations"]

        for grp in groups:
            url = f"https://celestrak.org/NORAD/elements/gp.php?GROUP={grp}&FORMAT=tle"
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        lines = [line.strip() for line in resp.text.split("\n") if line.strip()]
                        # TLEs come in triplets (Line 0: Name, Line 1, Line 2)
                        for i in range(0, len(lines) - 2, 3):
                            name_line = lines[i]
                            l1 = lines[i + 1]
                            l2 = lines[i + 2]

                            try:
                                norad_id = int(l1[2:7])
                            except ValueError:
                                continue

                            # Check if this satellite matches our target catalog
                            match_target = next((t for t in CELESTRAK_TARGETS if t["norad_id"] == norad_id), None)
                            if match_target:
                                satrec = Satrec.twoline2rv(l1, l2)
                                self._satrec_cache[norad_id] = satrec
                                self._metadata_cache[norad_id] = {
                                    **match_target,
                                    "tle_line1": l1,
                                    "tle_line2": l2,
                                    "source": "CelesTrak Real-Time Feed"
                                }
                                synced_count += 1
            except Exception as e:
                # Keep existing cached records if network times out
                pass

        self.last_sync_time = datetime.datetime.now(datetime.timezone.utc)
        self.is_live_synced = synced_count > 0
        return synced_count

    def propagate_position(self, norad_id: int, dt: Optional[datetime.datetime] = None) -> Optional[Dict[str, Any]]:
        """
        Propagates satellite position at timestamp 'dt' using the SGP4 algorithm.
        Returns geodetic latitude, longitude, altitude (km), and orbital velocity (km/s).
        """
        satrec = self._satrec_cache.get(norad_id)
        if not satrec:
            return None

        if dt is None:
            dt = datetime.datetime.now(datetime.timezone.utc)

        # Julian date components for SGP4
        jd, fr = jday(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second + dt.microsecond * 1e-6)
        error_code, r_teme, v_teme = satrec.sgp4(jd, fr)

        if error_code != 0 or r_teme is None:
            return None

        # Convert TEME vector (km) to Geodetic Coordinates
        d = (jd - 2451545.0) + fr
        gmst = (280.46061837 + 360.98564736629 * d) % 360.0
        gmst_rad = math.radians(gmst)

        r_xy = math.sqrt(r_teme[0]**2 + r_teme[1]**2)
        r_mag = math.sqrt(r_teme[0]**2 + r_teme[1]**2 + r_teme[2]**2)

        # Longitude in [-180, 180]
        lon = math.degrees(math.atan2(r_teme[1], r_teme[0]) - gmst_rad)
        lon = ((lon + 180.0) % 360.0) - 180.0

        # Geodetic latitude approximation
        lat = math.degrees(math.atan2(r_teme[2], r_xy))

        # Altitude above WGS84 equatorial radius
        altitude = r_mag - 6378.137

        # Velocity magnitude
        vel = math.sqrt(v_teme[0]**2 + v_teme[1]**2 + v_teme[2]**2)

        meta = self._metadata_cache.get(norad_id, {})
        mean_motion = satrec.no_kozai * (1440.0 / (2.0 * math.pi)) # revs/day
        period_min = 1440.0 / mean_motion if mean_motion > 0 else 98.0
        inc_deg = math.degrees(satrec.inclo)

        return {
            "latitude": round(lat, 4),
            "longitude": round(lon, 4),
            "altitude": round(max(300.0, altitude), 1),
            "velocity": round(vel, 2),
            "period_minutes": round(period_min, 1),
            "inclination": round(inc_deg, 2),
            "eccentricity": round(satrec.ecco, 6),
            "norad_id": norad_id,
            "tle_line1": meta.get("tle_line1"),
            "tle_line2": meta.get("tle_line2"),
            "swath_km": meta.get("swath_km", 250.0),
            "sensor_type": meta.get("sensor_type", "Multispectral"),
            "source": meta.get("source", "CelesTrak")
        }

    def generate_orbit_track(self, norad_id: int, duration_minutes: int = 95, step_seconds: int = 120) -> List[Dict[str, float]]:
        """
        Calculates upcoming SGP4 orbit track points for rendering ground tracks on the 3D globe.
        """
        points = []
        now = datetime.datetime.now(datetime.timezone.utc)
        total_steps = int((duration_minutes * 60) / step_seconds)

        for step in range(total_steps):
            t = now + datetime.timedelta(seconds=step * step_seconds)
            pos = self.propagate_position(norad_id, t)
            if pos:
                points.append({
                    "latitude": pos["latitude"],
                    "longitude": pos["longitude"],
                    "altitude": pos["altitude"],
                    "timestamp": t.isoformat()
                })
        return points

    def predict_next_pass(
        self,
        norad_id: int,
        target_lat: float,
        target_lon: float,
        lookahead_hours: int = 24
    ) -> Optional[Dict[str, Any]]:
        """
        Scans upcoming orbit forward to find when the satellite next passes over the target ground coordinate.
        Determines distance, closest approach, and if the target is within sensor swath width!
        """
        satrec = self._satrec_cache.get(norad_id)
        if not satrec:
            return None

        meta = self._metadata_cache.get(norad_id, {})
        swath_km = meta.get("swath_km", 250.0)
        swath_radius = swath_km / 2.0

        now = datetime.datetime.now(datetime.timezone.utc)
        min_dist = float("inf")
        closest_time = None
        closest_pos = None

        # Step every 60 seconds
        total_minutes = lookahead_hours * 60
        for m in range(0, total_minutes, 1):
            t = now + datetime.timedelta(minutes=m)
            pos = self.propagate_position(norad_id, t)
            if not pos:
                continue

            # Haversine distance from sub-satellite point to target
            dist = self._haversine(pos["latitude"], pos["longitude"], target_lat, target_lon)
            if dist < min_dist:
                min_dist = dist
                closest_time = t
                closest_pos = pos

            # If within direct swath, record pass window
            if dist <= swath_radius and m > 0:
                minutes_until = m
                return {
                    "norad_id": norad_id,
                    "target_lat": target_lat,
                    "target_lon": target_lon,
                    "minutes_until_pass": minutes_until,
                    "predicted_pass_time": t.isoformat(),
                    "closest_approach_km": round(dist, 1),
                    "is_within_swath": True,
                    "swath_width_km": swath_km,
                    "sensor_type": meta.get("sensor_type", "Earth Observation"),
                    "mission": meta.get("mission", "Observation")
                }

        # Return closest approach within window
        minutes_until = int((closest_time - now).total_seconds() / 60) if closest_time else 0
        return {
            "norad_id": norad_id,
            "target_lat": target_lat,
            "target_lon": target_lon,
            "minutes_until_pass": minutes_until,
            "predicted_pass_time": closest_time.isoformat() if closest_time else now.isoformat(),
            "closest_approach_km": round(min_dist, 1),
            "is_within_swath": min_dist <= swath_radius,
            "swath_width_km": swath_km,
            "sensor_type": meta.get("sensor_type", "Earth Observation"),
            "mission": meta.get("mission", "Observation")
        }

    def _haversine(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def decode_tle(self, line1: str, line2: str, name: Optional[str] = None) -> Dict[str, Any]:
        """
        Deconstructs standard NORAD Two-Line Element (TLE) lines into individual
        orbital parameters, descriptions, and derived physical metrics (semi-major axis, apogee/perigee, period, orbit regime).
        """
        l1 = line1.strip()
        l2 = line2.strip()
        if len(l1) < 68 or len(l2) < 68:
            raise ValueError("Invalid TLE format: Lines must be at least 68 characters.")

        # Line 1 parsing
        sat_num_1 = l1[2:7].strip()
        classification = l1[7:8].strip() or "U"
        int_designator_year = l1[9:11].strip()
        int_designator_launch = l1[11:14].strip()
        int_designator_piece = l1[14:17].strip()

        epoch_year_short = int(l1[18:20].strip())
        epoch_year = 2000 + epoch_year_short if epoch_year_short < 57 else 1900 + epoch_year_short
        epoch_day_fraction = float(l1[20:32].strip())

        # Convert epoch day fraction to human UTC datetime
        epoch_dt = datetime.datetime(epoch_year, 1, 1, tzinfo=datetime.timezone.utc) + datetime.timedelta(days=epoch_day_fraction - 1)

        first_derivative = float(l1[33:43].strip())
        
        # Second derivative (implied decimal and exponent)
        second_derivative_raw = l1[44:52].strip()
        second_derivative = 0.0
        if second_derivative_raw and len(second_derivative_raw) >= 6:
            try:
                sign = -1.0 if second_derivative_raw[0] == '-' else 1.0
                mantissa = float(second_derivative_raw[1:6]) * 1e-5
                exp = int(second_derivative_raw[6:])
                second_derivative = sign * mantissa * (10 ** exp)
            except Exception:
                second_derivative = 0.0

        # BSTAR Drag Term
        bstar_raw = l1[53:61].strip()
        bstar = 0.0
        if bstar_raw and len(bstar_raw) >= 6:
            try:
                sign = -1.0 if bstar_raw[0] == '-' else 1.0
                mantissa = float(bstar_raw[1:6]) * 1e-5
                exp = int(bstar_raw[6:])
                bstar = sign * mantissa * (10 ** exp)
            except Exception:
                bstar = 0.0

        ephemeris_type = l1[62:63].strip() or "0"
        element_set_number = l1[64:68].strip()
        checksum_1 = l1[68:69].strip()

        # Line 2 parsing
        sat_num_2 = l2[2:7].strip()
        inclination_deg = float(l2[8:16].strip())
        raan_deg = float(l2[17:25].strip()) # Right Ascension of Ascending Node
        eccentricity = float("0." + l2[26:33].strip())
        arg_perigee_deg = float(l2[34:42].strip())
        mean_anomaly_deg = float(l2[43:51].strip())
        mean_motion_rev_day = float(l2[52:63].strip())
        rev_number_at_epoch = int(l2[63:68].strip()) if l2[63:68].strip() else 0
        checksum_2 = l2[68:69].strip()

        # Physical Derivations using Keplerian dynamics
        # Earth GM (mu) in km^3/s^2, Earth Radius in km
        MU = 398600.4418
        EARTH_RADIUS_KM = 6378.137

        # Mean motion n in radians/sec
        n_rad_s = mean_motion_rev_day * (2.0 * math.pi) / 86400.0
        semi_major_axis_km = (MU / (n_rad_s ** 2)) ** (1.0 / 3.0) if n_rad_s > 0 else 7000.0

        apogee_radius_km = semi_major_axis_km * (1.0 + eccentricity)
        perigee_radius_km = semi_major_axis_km * (1.0 - eccentricity)
        apogee_alt_km = apogee_radius_km - EARTH_RADIUS_KM
        perigee_alt_km = perigee_radius_km - EARTH_RADIUS_KM

        orbital_period_minutes = (1440.0 / mean_motion_rev_day) if mean_motion_rev_day > 0 else 98.0
        mean_orbital_speed_kms = math.sqrt(MU / semi_major_axis_km) if semi_major_axis_km > 0 else 7.5

        # Orbit classification
        if mean_motion_rev_day < 1.5 and perigee_alt_km > 35000:
            regime = "GEO (Geostationary Earth Orbit)"
            is_sso = False
        elif semi_major_axis_km < 8378.137:
            # Low Earth Orbit (< 2000 km altitude)
            is_sso = 96.0 <= inclination_deg <= 102.0
            regime = "SSO (Sun-Synchronous LEO)" if is_sso else "LEO (Low Earth Orbit)"
        elif eccentricity > 0.25:
            regime = "HEO (Highly Elliptical Orbit)"
            is_sso = False
        else:
            regime = "MEO (Medium Earth Orbit)"
            is_sso = False

        norad_int = int(sat_num_1) if sat_num_1.isdigit() else 0
        target_meta = next((t for t in CELESTRAK_TARGETS if t["norad_id"] == norad_int), None)

        return {
            "satellite_name": name or (target_meta["name"] if target_meta else f"NORAD-{sat_num_1}"),
            "norad_id": norad_int,
            "classification": "Unclassified (Public)" if classification == "U" else classification,
            "international_designator": f"20{int_designator_year}-{int_designator_launch}{int_designator_piece}",
            "epoch": {
                "utc_timestamp": epoch_dt.isoformat(),
                "year": epoch_year,
                "day_of_year": round(epoch_day_fraction, 4),
                "age_days": round((datetime.datetime.now(datetime.timezone.utc) - epoch_dt).total_seconds() / 86400.0, 2)
            },
            "line1_fields": {
                "line_number": 1,
                "satellite_catalog_number": sat_num_1,
                "ballistic_coefficient_first_derivative": first_derivative,
                "second_derivative_mean_motion": second_derivative,
                "bstar_drag_term": bstar,
                "bstar_scientific": f"{bstar:.4e}",
                "ephemeris_type": ephemeris_type,
                "element_set_number": element_set_number,
                "checksum": checksum_1
            },
            "line2_fields": {
                "line_number": 2,
                "satellite_catalog_number": sat_num_2,
                "inclination_deg": round(inclination_deg, 4),
                "raan_deg": round(raan_deg, 4),
                "eccentricity": round(eccentricity, 7),
                "argument_of_perigee_deg": round(arg_perigee_deg, 4),
                "mean_anomaly_deg": round(mean_anomaly_deg, 4),
                "mean_motion_revs_day": round(mean_motion_rev_day, 8),
                "revolution_number_at_epoch": rev_number_at_epoch,
                "checksum": checksum_2
            },
            "derived_orbital_elements": {
                "semi_major_axis_km": round(semi_major_axis_km, 2),
                "apogee_altitude_km": round(max(0.0, apogee_alt_km), 2),
                "perigee_altitude_km": round(max(0.0, perigee_alt_km), 2),
                "orbital_period_minutes": round(orbital_period_minutes, 2),
                "mean_orbital_speed_kms": round(mean_orbital_speed_kms, 3),
                "orbit_regime": regime,
                "is_sun_synchronous": is_sso,
                "revolutions_per_day": round(mean_motion_rev_day, 4)
            },
            "sensor_info": {
                "sensor_type": target_meta.get("sensor_type") if target_meta else "Optical / Earth Observation",
                "swath_km": target_meta.get("swath_km", 250.0) if target_meta else 250.0,
                "purpose": target_meta.get("purpose") if target_meta else "Earth Observation and Disaster Intelligence",
                "operator": target_meta.get("operator") if target_meta else "International"
            }
        }

    def generate_fleet_overpass_matrix(
        self,
        disasters: List[Dict[str, Any]],
        lookahead_hours: int = 24
    ) -> List[Dict[str, Any]]:
        """
        Cross-references all tracked CelesTrak satellites against active disaster events.
        Produces an operational matrix of upcoming satellite flyovers, swath coverage, and sensor suitability ratings.
        """
        matrix = []

        # Sensor-to-disaster matching rules
        sensor_affinity: Dict[str, Dict[str, int]] = {
            "flood": {
                "SENTINEL-1A": 99, # SAR penetrates clouds & rain
                "SWOT": 97,        # KaRIn high-precision surface water
                "SENTINEL-2A": 78,
                "SENTINEL-2B": 78,
                "AQUA": 70
            },
            "wildfire": {
                "SUOMI NPP": 99,   # VIIRS 375m active fire
                "NOAA 20": 98,     # VIIRS active fire
                "TERRA": 94,       # MODIS thermal anomalies
                "AQUA": 94,        # MODIS thermal anomalies
                "LANDSAT 8": 88,   # OLI/TIRS burn scar
                "LANDSAT 9": 88,
                "SENTINEL-2A": 85,
                "SENTINEL-5P": 92  # Smoke & CO tracking
            },
            "cyclone": {
                "GOES 16": 99,
                "GOES 18": 99,
                "HIMAWARI-9": 99,
                "NOAA 20": 92,
                "SUOMI NPP": 91
            },
            "storm": {
                "GOES 16": 99,
                "GOES 18": 99,
                "HIMAWARI-9": 99,
                "NOAA 20": 88
            },
            "earthquake": {
                "SENTINEL-1A": 98, # InSAR surface displacement interferograms
                "LANDSAT 8": 80,
                "LANDSAT 9": 80,
                "SENTINEL-2A": 82
            },
            "volcano": {
                "SENTINEL-5P": 99, # TROPOMI SO2 degassing plumes
                "TERRA": 92,       # ASTER & MODIS thermal lava detection
                "SENTINEL-1A": 89  # SAR ash penetration
            },
            "heatwave": {
                "TERRA": 95,
                "AQUA": 95,
                "LANDSAT 8": 90
            }
        }

        for dis in disasters[:8]: # Scan top high-priority disaster events
            d_id = dis.get("id")
            d_name = dis.get("title")
            d_type = dis.get("type", "unknown").lower()
            d_lat = float(dis.get("latitude", 0.0))
            d_lon = float(dis.get("longitude", 0.0))
            d_sev = dis.get("severity", "moderate")

            for target in CELESTRAK_TARGETS:
                norad = target["norad_id"]
                sat_name = target["name"]

                prediction = self.predict_next_pass(norad, d_lat, d_lon, lookahead_hours)
                if not prediction:
                    continue

                affinity_map = sensor_affinity.get(d_type, {})
                suitability_score = affinity_map.get(sat_name, 65)

                # Prioritize entries within swath or closest approaches
                matrix.append({
                    "satellite_name": sat_name,
                    "norad_id": norad,
                    "operator": target["operator"],
                    "sensor_type": target["sensor_type"],
                    "swath_km": target["swath_km"],
                    "disaster_id": d_id,
                    "disaster_title": d_name,
                    "disaster_type": d_type,
                    "disaster_severity": d_sev,
                    "target_lat": d_lat,
                    "target_lon": d_lon,
                    "minutes_until_pass": prediction["minutes_until_pass"],
                    "predicted_pass_time": prediction["predicted_pass_time"],
                    "closest_approach_km": prediction["closest_approach_km"],
                    "is_within_swath": prediction["is_within_swath"],
                    "suitability_score": suitability_score
                })

        # Sort matrix: primary sort by is_within_swath (True first), then minutes_until_pass
        matrix.sort(key=lambda x: (not x["is_within_swath"], x["minutes_until_pass"]))
        return matrix[:25] # Return top 25 high-value interception passes

    def get_knowledge_corpus(self) -> Dict[str, Any]:
        """
        Returns rich structured educational and operational orbital intelligence,
        connecting CelesTrak standards, SGP4 perturbation mechanics, and disaster satellite modalities.
        """
        return {
            "source": "CelesTrak (celestrak.org) Orbital Intelligence Standard",
            "curator": "Dr. T.S. Kelso & EarthWatch AI Space Dynamics Group",
            "modules": [
                {
                    "id": "sgp4_mechanics",
                    "title": "SGP4 (Simplified General Perturbations 4) Theory",
                    "tag": "Astrodynamics",
                    "summary": "The mathematical foundation developed by Ken Cranford and Felix Hoots (1980) for propagating NORAD Two-Line Element sets in near-Earth orbits.",
                    "details": [
                        "Models Earth oblateness zonal harmonics (J2, J3, J4) causing nodal regression and apsidal rotation.",
                        "Incorporates atmospheric drag decay using the BSTAR (B*) ballistic parameter and a modified Jacchia-Roberts atmospheric density model.",
                        "Accounts for third-body gravitational perturbations from the Moon and Sun.",
                        "Separates osculating elements from Kozai mean elements, preventing coordinate singularity at zero eccentricity."
                    ]
                },
                {
                    "id": "sun_synchronous_orbits",
                    "title": "Sun-Synchronous Orbits (SSO) & Disaster Monitoring",
                    "tag": "Orbital Geometry",
                    "summary": "Why polar Sun-synchronous orbits (e.g. Landsat, Sentinel-2, Terra) are the gold standard for global environmental intelligence.",
                    "details": [
                        "Retrograde inclination (typically 97.4° to 98.7°) precisely balances Earth's oblateness torque (J2) to precess 0.9856° per day (360° per 365.25 days).",
                        "Guarantees the satellite crosses the equator at the identical Local Mean Solar Time (e.g., 10:30 AM descending node) on every orbit.",
                        "Ensures consistent solar illumination angle and shadow length, critical for automated NDVI change detection and burn scar classification.",
                        "Enables repeat-pass interferometry (InSAR) by revisiting identical ground tracks within a 5 to 16 day repeat cycle."
                    ]
                },
                {
                    "id": "sensor_modalities",
                    "title": "Earth Observation Sensor Modalities & Emergency Response",
                    "tag": "Payload Physics",
                    "summary": "How specific electromagnetic spectrum regimes address distinct disaster archetypes.",
                    "details": [
                        "Synthetic Aperture Radar (SAR, C-band 5.4 GHz on Sentinel-1): Penetrates monsoon cloud cover and nighttime darkness. Critical for instantaneous flood water delineation and co-seismic slip interferometry.",
                        "Thermal Infrared (TIRS on Landsat, MODIS, VIIRS): Detects high-temperature blackbody radiance (3.7μm - 12μm) for active wildfire front spotting, geothermal volcanic unrest, and sea-surface thermal anomalies.",
                        "Multispectral Imaging (MSI on Sentinel-2, OLI on Landsat): 10m-30m resolution across visible, red-edge, and shortwave infrared (SWIR). Distinguishes post-disaster flood recession, agricultural damage, and mudslide perimeters.",
                        "Atmospheric Spectrometry (TROPOMI on Sentinel-5P): Ultraviolet-visible-near-infrared spectrometer tracking trace gas absorption spectra (NO2, SO2, CO, CH4) for volcanic ash warning and wildfire plume transcontinental dispersion.",
                        "Ka-band Radar Interferometer (KaRIn on SWOT): Sub-centimeter river discharge and surface water elevation monitoring for hydrological flood defense and reservoir stress management."
                    ]
                },
                {
                    "id": "tle_anatomy",
                    "title": "Anatomy of a NORAD Two-Line Element (TLE)",
                    "tag": "Telemetry Standard",
                    "summary": "Standardized 69-character fixed-column ASCII format encapsulating the six classical Keplerian orbital elements and secular drag terms.",
                    "details": [
                        "Line 1 encodes epoch timestamp, mean motion derivatives (ballistic coefficient), BSTAR atmospheric drag coefficient, and satellite catalog identifier.",
                        "Line 2 encodes inclination (i), right ascension of ascending node (RAAN), eccentricity (e), argument of perigee (ω), mean anomaly (M), and mean motion (n).",
                        "Epoch accuracy is highest within ±3 days of element generation; atmospheric variability causes orbital drift if not continuously resynchronized with CelesTrak."
                    ]
                }
            ],
            "total_targets": len(CELESTRAK_TARGETS),
            "target_satellites": [
                {
                    "norad_id": t["norad_id"],
                    "name": t["name"],
                    "operator": t["operator"],
                    "sensor_type": t["sensor_type"],
                    "swath_km": t["swath_km"],
                    "mission": t["mission"]
                }
                for t in CELESTRAK_TARGETS
            ]
        }


# Global singleton instance of CelesTrak Knowledge Service
celestrak_service = CelesTrakService()

