import { ChargingSession, Reservation, UserSettings } from '../types';

export const INITIAL_SESSIONS: ChargingSession[] = [
  {
    id: 'sess-2026-0920-01',
    date: '2026-09-20T14:30:00Z',
    displayDate: '20 Sep 2026, 02:30 PM',
    stationName: 'Tata Power Charging - Chennai One',
    stationId: 'CHN-TATA-THORAI-005',
    location: 'Thoraipakkam, Chennai',
    connector: 'Type 2 AC',
    energyDeliveredKwh: 14.8,
    durationMinutes: 120,
    costInr: 177.6,
    startSoc: 35,
    endSoc: 72,
    status: 'COMPLETED',
    isDemo: true
  },
  {
    id: 'sess-2026-0918-02',
    date: '2026-09-18T18:15:00Z',
    displayDate: '18 Sep 2026, 06:15 PM',
    stationName: 'Zeon Charging - Pantheon Road',
    stationId: 'CHN-ZEON-EGMORE-013',
    location: 'Egmore, Chennai',
    connector: 'CCS2 DC',
    energyDeliveredKwh: 22.4,
    durationMinutes: 32,
    costInr: 403.2,
    startSoc: 18,
    endSoc: 74,
    status: 'COMPLETED',
    isDemo: true
  },
  {
    id: 'sess-2026-0915-03',
    date: '2026-09-15T09:40:00Z',
    displayDate: '15 Sep 2026, 09:40 AM',
    stationName: 'Ather Space - Mount Road',
    stationId: 'CHN-ATH-GUINDY-003',
    location: 'Guindy, Chennai',
    connector: 'LEV DC',
    energyDeliveredKwh: 18.0,
    durationMinutes: 45,
    costInr: 270.0,
    startSoc: 22,
    endSoc: 66,
    status: 'COMPLETED',
    isDemo: true
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-001',
    bookingCode: 'EV-2026-000123',
    stationId: 'CHN-ATH-GUINDY-003',
    stationName: 'Ather Space - Mount Road, Guindy',
    area: 'Guindy',
    bayNumber: 'Bay #02',
    connectorType: 'CCS2 DC Gun',
    powerKw: 60,
    date: 'Today, 26 Oct',
    timeSlot: '11:30 AM - 12:15 PM',
    status: 'CONFIRMED',
    createdAt: '2026-10-26T10:14:00Z',
    isDemo: true
  }
];

export const DEFAULT_SETTINGS: UserSettings = {
  maxAcceptableCostInr: 22.0,
  minimumBatteryThresholdPercent: 20,
  preferredChargingMode: 'Balanced',
  preferredConnector: 'CCS2',
  homeCorridor: 'Anna Nagar, Chennai',
  notificationsEnabled: true,
  autoReserveOnLowBattery: false,
  demoMode: true
};
