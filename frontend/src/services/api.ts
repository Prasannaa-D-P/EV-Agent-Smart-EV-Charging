import {
  Station,
  EVProfile,
  ChargingSession,
  RecommendationResult,
  OSINTSource,
  OSINTStatus,
  SyncLog,
  DataConflict,
  WeatherData,
  RouteData
} from '../types';
import { INITIAL_STATIONS } from '../data/stationsData';
import { DEFAULT_VEHICLE } from '../data/defaultProfile';
import { INITIAL_SESSIONS } from '../data/demoSessions';
import { calculateBatteryTelemetry } from '../utils/calculations';

const API_BASE_URL = 'http://localhost:5000/api';

export const ApiService = {
  async getStations(params: Record<string, string> = {}): Promise<Station[]> {
    try {
      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/stations${query ? `?${query}` : ''}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      return data.stations || INITIAL_STATIONS;
    } catch {
      return INITIAL_STATIONS;
    }
  },

  async getStationById(id: string): Promise<Station | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/stations/${id}`, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch {
      return INITIAL_STATIONS.find(s => s.station_id === id) || null;
    }
  },

  async getNearbyStations(lat: number, lon: number, radiusKm: number = 15): Promise<Station[]> {
    try {
      const url = `${API_BASE_URL}/stations/nearby?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      return data.stations || [];
    } catch {
      return [];
    }
  },

  async getRecommendation(
    batterySoc: number,
    batteryCapacityKwh: number,
    destination: string,
    preferredConnector: string
  ): Promise<RecommendationResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battery_soc: batterySoc,
          battery_capacity_kwh: batteryCapacityKwh,
          destination,
          preferred_connector: preferredConnector
        }),
        signal: AbortSignal.timeout(2000)
      });
      if (!response.ok) throw new Error('Recommendation API failed');
      const data = await response.json();
      const r = data.recommendation;
      return {
        urgency: r.urgency,
        action: r.recommended_action,
        reason: r.reason,
        station: r.recommended_station as Station,
        energyNeededKwh: r.energy_needed_kwh,
        estimatedCostInr: r.estimated_cost_inr,
        estimatedChargingTimeMin: r.estimated_charging_time_minutes,
        confidenceScore: r.confidence_score
      };
    } catch {
      const compatible = INITIAL_STATIONS.filter(s =>
        s.connector_type.toLowerCase().includes(preferredConnector.toLowerCase())
      );
      const st = compatible[0] || INITIAL_STATIONS[0];
      const calc = calculateBatteryTelemetry(batteryCapacityKwh, batterySoc, 80, st.power_kw, st.price_per_kwh);

      return {
        urgency: batterySoc < 20 ? 'HIGH' : batterySoc < 30 ? 'MEDIUM' : 'MODERATE',
        action: batterySoc < 20 ? 'Immediate Charge Required' : 'Consider charging before travel',
        reason: `Battery level (${batterySoc}%) requires top-up at ${st.area} hub for unconstrained corridor transit to ${destination}.`,
        station: st,
        energyNeededKwh: calc.energyRequiredKwh,
        estimatedCostInr: calc.estimatedCostInr,
        estimatedChargingTimeMin: calc.chargingTimeMinutes,
        confidenceScore: 0.94
      };
    }
  },

  async getOSINTSources(): Promise<OSINTSource[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/osint/sources`, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('OSINT API failed');
      const data = await response.json();
      return data.sources || [];
    } catch {
      return [];
    }
  },

  async getOSINTStatus(): Promise<OSINTStatus | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/osint/status`, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('OSINT Status API failed');
      return await response.json();
    } catch {
      return null;
    }
  },

  async triggerSync(sources?: string[]): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/osint/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources }),
        signal: AbortSignal.timeout(10000)
      });
      return await response.json();
    } catch (e: any) {
      return { status: 'FAILED', error: e.message };
    }
  },

  async getSyncLogs(): Promise<SyncLog[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/osint/sync-logs`, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('Sync logs failed');
      const data = await response.json();
      return data.logs || [];
    } catch {
      return [];
    }
  },

  async getConflicts(): Promise<DataConflict[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/osint/conflicts`, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('Conflicts API failed');
      const data = await response.json();
      return data.conflicts || [];
    } catch {
      return [];
    }
  },

  async getWeather(lat: number = 13.0827, lon: number = 80.2707): Promise<WeatherData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}`, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('Weather API failed');
      return await response.json();
    } catch {
      return {
        location: 'Chennai Corridor',
        temperature_c: 31.5,
        apparent_temperature_c: 36.0,
        relative_humidity_percent: 74,
        wind_speed_kmh: 14.5,
        precipitation_mm: 0.0,
        weather_condition: 'Partly Cloudy',
        source: 'OPEN_METEO_LOCAL'
      };
    }
  },

  async getRoute(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number
  ): Promise<RouteData | null> {
    try {
      const url = `${API_BASE_URL}/route?start_lat=${startLat}&start_lon=${startLon}&end_lat=${endLat}&end_lon=${endLon}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!response.ok) throw new Error('Route API failed');
      return await response.json();
    } catch {
      return {
        distance_km: 10.2,
        duration_minutes: 24,
        geometry: [[startLat, startLon], [endLat, endLon]],
        steps: [],
        source: 'OSRM_FALLBACK'
      };
    }
  },

  async getVehicleProfile(): Promise<EVProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/telemetry/vehicle`, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch {
      return DEFAULT_VEHICLE;
    }
  },

  async getSessions(): Promise<ChargingSession[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/telemetry/sessions`, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      return data.sessions || INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  }
};
