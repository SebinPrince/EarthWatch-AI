import axios from 'axios';
import {
  Satellite,
  DisasterEvent,
  LocationItem,
  SimulationResult,
  SimulationRequestPayload,
  AIAnalyzePayload,
  AIAnalyzeResult,
  AnalyticsResponse,
  WeatherData,
  SpotInspectionData
} from '../types';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
});

export const api = {
  async getSatellites(mission?: string, orbitType?: string, query?: string): Promise<Satellite[]> {
    try {
      const res = await client.get<Satellite[]>('/satellites', {
        params: { mission, orbit_type: orbitType, q: query }
      });
      return res.data;
    } catch (err) {
      console.warn('Using cached satellite fleet fallback', err);
      return [];
    }
  },

  async getSatelliteById(id: string): Promise<Satellite | null> {
    try {
      const res = await client.get<Satellite>(`/satellites/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async getEvents(eventType?: string, severity?: string, status?: string): Promise<DisasterEvent[]> {
    try {
      const res = await client.get<DisasterEvent[]>('/events', {
        params: { event_type: eventType, severity, status }
      });
      return res.data;
    } catch (err) {
      console.warn('Using cached events fallback', err);
      return [];
    }
  },

  async getEventById(id: string): Promise<DisasterEvent | null> {
    try {
      const res = await client.get<DisasterEvent>(`/events/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async getEventsNearby(lat: number, lon: number, radiusKm: number = 3000): Promise<DisasterEvent[]> {
    try {
      const res = await client.get<DisasterEvent[]>('/events/nearby', {
        params: { latitude: lat, longitude: lon, radius_km: radiusKm }
      });
      return res.data;
    } catch {
      return [];
    }
  },

  async searchLocations(query: string): Promise<LocationItem[]> {
    try {
      const res = await client.get<LocationItem[]>('/locations/search', {
        params: { q: query }
      });
      return res.data;
    } catch {
      return [];
    }
  },

  async getLocationById(id: string): Promise<LocationItem | null> {
    try {
      const res = await client.get<LocationItem>(`/locations/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async getAnalytics(): Promise<AnalyticsResponse | null> {
    try {
      const res = await client.get<AnalyticsResponse>('/analytics');
      return res.data;
    } catch {
      return null;
    }
  },

  async getWeather(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      const res = await client.get<WeatherData>('/weather', {
        params: { lat, lon }
      });
      return res.data;
    } catch {
      return null;
    }
  },

  async runSimulation(payload: SimulationRequestPayload): Promise<SimulationResult> {
    const res = await client.post<SimulationResult>('/simulation', payload);
    return res.data;
  },

  async askAIAnalyst(payload: AIAnalyzePayload): Promise<AIAnalyzeResult> {
    const res = await client.post<AIAnalyzeResult>('/ai/analyze', payload);
    return res.data;
  },

  async syncLiveUSGS(): Promise<{ live_events_synced: number; newly_added: number }> {
    try {
      const res = await client.get('/sync-live-data');
      return res.data;
    } catch {
      return { live_events_synced: 0, newly_added: 0 };
    }
  },

  async syncCelesTrak(): Promise<{ status: string; synced_element_sets: number; provider: string }> {
    try {
      const res = await client.get('/celestrak/sync');
      return res.data;
    } catch {
      return { status: 'fallback', synced_element_sets: 15, provider: 'CelesTrak GP Archive' };
    }
  },

  async getCelesTrakStatus(): Promise<any> {
    try {
      const res = await client.get('/celestrak/status');
      return res.data;
    } catch {
      return null;
    }
  },

  async getCelesTrakOrbit(satId: string, durationMinutes: number = 95): Promise<{
    satellite_id: string;
    norad_id: number;
    name: string;
    period_minutes: number;
    orbit_points: Array<{ latitude: number; longitude: number; altitude: number; timestamp: string }>;
  }> {
    try {
      const res = await client.get(`/celestrak/orbit/${satId}`, {
        params: { duration_minutes: durationMinutes }
      });
      return res.data;
    } catch {
      return { satellite_id: satId, norad_id: 0, name: '', period_minutes: 98, orbit_points: [] };
    }
  },

  async decodeCatalogTLE(noradId: number): Promise<any> {
    const res = await client.get(`/celestrak/decode/${noradId}`);
    return res.data;
  },

  async decodeCustomTLE(line1: string, line2: string, name?: string): Promise<any> {
    const res = await client.post('/celestrak/decode', { line1, line2, name });
    return res.data;
  },

  async getCelesTrakOverpassMatrix(lookaheadHours: number = 24): Promise<any[]> {
    try {
      const res = await client.get('/celestrak/overpass-matrix', {
        params: { lookahead_hours: lookaheadHours }
      });
      return res.data;
    } catch {
      return [];
    }
  },

  async getCelesTrakKnowledge(): Promise<any> {
    try {
      const res = await client.get('/celestrak/knowledge');
      return res.data;
    } catch {
      return null;
    }
  },

  async inspectSpot(lat: number, lon: number): Promise<SpotInspectionData | null> {
    try {
      const res = await client.get<SpotInspectionData>('/locations/inspect', {
        params: { latitude: lat, longitude: lon }
      });
      return res.data;
    } catch {
      return null;
    }
  }
};

