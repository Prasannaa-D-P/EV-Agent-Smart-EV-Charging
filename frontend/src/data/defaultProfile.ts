import { EVProfile } from '../types';

export const DEFAULT_VEHICLE: EVProfile = {
  id: 'veh_01',
  name: 'Tata Nexon EV Max',
  model: 'XZ+ Lux 2024',
  registration: 'TN 09 BK 4521',
  batteryCapacityKwh: 40.5,
  currentSoc: 62,
  preferredConnector: 'CCS2',
  preferredChargingType: 'DC Fast',
  maxAcChargeRateKw: 7.2,
  maxDcChargeRateKw: 50.0,
  consumptionWhPerKm: 145,
  sohHealthPercent: 98,
  packTempC: 31.4,
  tyrePressurePsi: 34.2,
  currentLocation: 'Anna Nagar, Chennai'
};
