export type EventType =
  | 'wildfire'
  | 'flood'
  | 'cyclone'
  | 'earthquake'
  | 'volcano'
  | 'heatwave'
  | 'storm'
  | 'environmental_anomaly';

export type SeverityLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface Satellite {
  id: string;
  name: string;
  norad_id?: number;
  country?: string;
  operator?: string;
  mission: string;
  purpose?: string;
  orbit_type?: string;
  altitude?: number;
  launch_date?: string;
  latitude: number;
  longitude: number;
  velocity?: number;
  inclination?: number;
  period_minutes?: number;
  eccentricity?: number;
  tle_line1?: string;
  tle_line2?: string;
  sensor_type?: string;
  swath_km?: number;
  data_source?: string;
  status: string;
  is_live: boolean;
  last_updated?: string;
}

export interface EventSatelliteRel {
  satellite_id: string;
  satellite_name: string;
  mission: string;
  orbit_type: string;
  altitude?: number;
  latitude: number;
  longitude: number;
  relationship: string;
  distance_km: number;
  sensor_type?: string;
  swath_km?: number;
  next_pass_in_minutes?: number;
}

export interface DisasterEvent {
  id: string;
  title: string;
  type: EventType;
  latitude: number;
  longitude: number;
  severity: SeverityLevel;
  description?: string;
  detected_at: string;
  source: string;
  status: string;
  affected_area_km2?: number;
  estimated_population?: number;
  ai_summary?: string;
  is_live: boolean;
  is_simulated: boolean;
  relevant_satellites?: EventSatelliteRel[];
  weather_context?: WeatherData;
}

export interface LocationItem {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  region?: string;
  population?: number;
  current_events?: DisasterEvent[];
  nearby_satellites?: Satellite[];
  weather?: WeatherData;
  historical_events_count?: number;
  risk_level?: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface WeatherData {
  is_live: boolean;
  provider: string;
  temperature_c: number;
  apparent_temperature_c: number;
  humidity_percent: number;
  precipitation_mm: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  pressure_hpa: number;
  condition: string;
  icon: string;
  weather_code: number;
}

export interface SimulationStep {
  hour: number;
  latitude: number;
  longitude: number;
  radius_km: number;
  intensity: number;
  affected_population: number;
  affected_area_km2: number;
}

export interface SimulationResult {
  simulation_id: string;
  is_simulation: boolean;
  notice: string;
  event_type: string;
  title: string;
  center_latitude: number;
  center_longitude: number;
  max_radius_km: number;
  total_affected_area_km2: number;
  estimated_population: number;
  steps: SimulationStep[];
  nearby_monitoring_satellites: EventSatelliteRel[];
  nearby_regions: string[];
  ai_risk_assessment: string;
}

export interface SimulationRequestPayload {
  event_type: string;
  starting_location_name?: string;
  latitude: number;
  longitude: number;
  intensity: number;
  radius_km: number;
  direction_deg: number;
  speed_kmh: number;
  duration_hours: number;
}

export interface AIAnalyzePayload {
  query: string;
  selected_event_id?: string;
  selected_location_id?: string;
}

export interface AIAnalyzeResult {
  query: string;
  answer: string;
  confidence: number;
  sources: string[];
  relevant_events: DisasterEvent[];
  relevant_satellites: Satellite[];
  suggestions: string[];
  insufficient_data?: boolean;
}

export interface AnalyticsResponse {
  total_events: number;
  total_satellites: number;
  events_by_type: Record<string, number>;
  events_by_severity: Record<string, number>;
  events_by_region: Record<string, number>;
  satellites_by_mission: Record<string, number>;
  timeline_trend: Array<{
    period: string;
    wildfire: number;
    flood: number;
    cyclone: number;
    earthquake: number;
    total: number;
  }>;
  last_updated: string;
}

export interface FilterState {
  eventType: string; // 'all' or specific
  severity: string;  // 'all' or specific
  status: string;    // 'all' or specific
  timelineHoursAgo: number; // 0 (now) to 48
  showSatellites: boolean;
  showDisasters: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  satelliteMission: string;
}

export interface CelesTrakStatusResponse {
  service: string;
  provider: string;
  is_live_synced: boolean;
  last_sync: string | null;
  total_norad_tracked: number;
  propagator_engine: string;
  reference_frame: string;
  tracked_satellites: number[];
}

export interface TLEDecodedResult {
  satellite_name: string;
  norad_id: number;
  classification: string;
  international_designator: string;
  epoch: {
    utc_timestamp: string;
    year: number;
    day_of_year: number;
    age_days: number;
  };
  line1_fields: {
    line_number: number;
    satellite_catalog_number: string;
    ballistic_coefficient_first_derivative: number;
    second_derivative_mean_motion: number;
    bstar_drag_term: number;
    bstar_scientific: string;
    ephemeris_type: string;
    element_set_number: string;
    checksum: string;
  };
  line2_fields: {
    line_number: number;
    satellite_catalog_number: string;
    inclination_deg: number;
    raan_deg: number;
    eccentricity: number;
    argument_of_perigee_deg: number;
    mean_anomaly_deg: number;
    mean_motion_revs_day: number;
    revolution_number_at_epoch: number;
    checksum: string;
  };
  derived_orbital_elements: {
    semi_major_axis_km: number;
    apogee_altitude_km: number;
    perigee_altitude_km: number;
    orbital_period_minutes: number;
    mean_orbital_speed_kms: number;
    orbit_regime: string;
    is_sun_synchronous: boolean;
    revolutions_per_day: number;
  };
  sensor_info: {
    sensor_type: string;
    swath_km: number;
    purpose: string;
    operator: string;
  };
}

export interface OverpassMatrixItem {
  satellite_name: string;
  norad_id: number;
  operator: string;
  sensor_type: string;
  swath_km: number;
  disaster_id: string;
  disaster_title: string;
  disaster_type: string;
  disaster_severity: string;
  target_lat: number;
  target_lon: number;
  minutes_until_pass: number;
  predicted_pass_time: string;
  closest_approach_km: number;
  is_within_swath: boolean;
  suitability_score: number;
}

export interface CelesTrakKnowledgeResponse {
  source: string;
  curator: string;
  modules: Array<{
    id: string;
    title: string;
    tag: string;
    summary: string;
    details: string[];
  }>;
  total_targets: number;
  target_satellites: Array<{
    norad_id: number;
    name: string;
    operator: string;
    sensor_type: string;
    swath_km: number;
    mission: string;
  }>;
}

export interface SpotInspectionData {
  latitude: number;
  longitude: number;
  coordinate_label: string;
  name: string;
  display_name: string;
  country: string;
  region: string;
  terrain_type: string;
  is_maritime: boolean;
  weather: WeatherData | null;
  nearby_events: Array<{
    id: string;
    title: string;
    type: EventType;
    severity: SeverityLevel;
    distance_km: number;
    latitude: number;
    longitude: number;
  }>;
  next_overpass: {
    satellite_name: string;
    operator: string;
    minutes_until_pass: number;
    predicted_pass_time: string;
    closest_approach_km: number;
    is_within_swath: boolean;
    swath_width_km: number;
    sensor_type: string;
  } | null;
  risk_level: string;
}


