export type DataQuality = 'VERIFIED_COORDINATE' | 'OPERATOR_LISTING' | 'LIVE_STATUS' | 'ESTIMATED' | 'DEMO';

export type StationStatus = 'AVAILABLE' | 'LIMITED' | 'OCCUPIED' | 'OFFLINE' | 'RESERVED';

export interface Station {
  station_entity_id?: string;
  station_id: string;
  station_name: string;
  operator: string;
  address: string;
  city: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  opening_time: string;
  closing_time: string;
  is_24_hours: boolean;
  station_status: string;
  charger_id?: string;
  chargers?: Charger[];
  connector_type: string;
  charger_type: 'AC' | 'DC';
  power_kw: number;
  status: StationStatus;
  price_per_kwh: number;
  last_verified_at: string;
  data_source?: string;
  source?: string;
  source_url?: string;
  is_demo: boolean;
  data_quality: DataQuality;
  coordinates_verified: boolean;
  linked_sources?: string[];
  conflicts?: DataConflict[];
  has_conflicts?: boolean;
  distance_km?: number;
}

export interface Charger {
  charger_id: string;
  station_id?: string;
  station_entity_id?: string;
  connector_type: string;
  charger_type: string;
  power_kw: number;
  status: string;
  source?: string;
}

export interface EVProfile {
  id: string;
  name: string;
  model: string;
  registration: string;
  batteryCapacityKwh: number;
  currentSoc: number;
  preferredConnector: string;
  preferredChargingType: string;
  maxAcChargeRateKw: number;
  maxDcChargeRateKw: number;
  consumptionWhPerKm: number;
  sohHealthPercent: number;
  packTempC: number;
  tyrePressurePsi: number;
  currentLocation: string;
}

export interface ChargingSession {
  id: string;
  date: string;
  displayDate: string;
  stationName: string;
  stationId: string;
  location: string;
  connector: string;
  energyDeliveredKwh: number;
  durationMinutes: number;
  costInr: number;
  startSoc: number;
  endSoc: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  isDemo: boolean;
}

export interface Reservation {
  id: string;
  bookingCode: string;
  stationId: string;
  stationName: string;
  area: string;
  bayNumber: string;
  connectorType: string;
  powerKw: number;
  date: string;
  timeSlot: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  isDemo: boolean;
}

export interface RecommendationResult {
  urgency: 'HIGH' | 'MEDIUM' | 'LOW' | 'MODERATE';
  action: string;
  reason: string;
  station: Station;
  energyNeededKwh: number;
  estimatedCostInr: number;
  estimatedChargingTimeMin: number;
  confidenceScore: number;
}

export interface UserSettings {
  maxAcceptableCostInr: number;
  minimumBatteryThresholdPercent: number;
  preferredChargingMode: 'Eco' | 'Balanced' | 'Max Speed';
  preferredConnector: string;
  homeCorridor: string;
  notificationsEnabled: boolean;
  autoReserveOnLowBattery: boolean;
  demoMode: boolean;
}

export interface OSINTSource {
  source_id: string;
  name: string;
  type: string;
  connected: boolean;
  status: string;
  records_stored: number;
  health: {
    status: string;
    connected: boolean;
    latency_ms?: number;
    message?: string;
  };
}

export interface OSINTStatus {
  status: string;
  station_entities_count: number;
  source_records_count: number;
  active_conflicts_count: number;
  total_sync_runs: number;
  last_sync?: any;
}

export interface SyncLog {
  id: number;
  source: string;
  started_at: string;
  completed_at: string;
  status: string;
  records_received: number;
  records_accepted: number;
  records_rejected: number;
  duplicates_found: number;
  conflicts_found: number;
  error_message?: string;
}

export interface DataConflict {
  id: number;
  station_entity_id: string;
  station_name?: string;
  area?: string;
  field_name: string;
  source_a: string;
  value_a: string;
  source_b: string;
  value_b: string;
  detected_at: string;
  resolved: boolean;
}

export interface WeatherData {
  location: string;
  temperature_c: number;
  apparent_temperature_c: number;
  relative_humidity_percent: number;
  wind_speed_kmh: number;
  precipitation_mm: number;
  weather_condition: string;
  weather_code?: number;
  source: string;
}

export interface RouteData {
  distance_km: number;
  duration_minutes: number;
  geometry: [number, number][];
  steps: { instruction: string; distance_km: number }[];
  source: string;
}
