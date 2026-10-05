/**
 * EV-Agent Prototype Calculations & Utilities
 * 
 * Note: These are baseline prototype heuristic calculations.
 * In later stages, these will be replaced with ML-based battery degradation
 * models and real-time dynamic traffic energy consumption formulas.
 */

export interface BatteryCalculations {
  energyAvailableKwh: number;
  energyRequiredKwh: number;
  idealRangeKm: number;
  realWorldChennaiRangeKm: number;
  chargingTimeMinutes: number;
  estimatedCostInr: number;
  alertLevel: 'LOW' | 'WARNING' | 'HEALTHY' | 'NORMAL';
  alertMessage: string;
}

export function calculateBatteryTelemetry(
  batteryCapacityKwh: number,
  currentSoc: number,
  targetSoc: number = 80,
  chargerPowerKw: number = 30,
  pricePerKwh: number = 18.0,
  consumptionWhPerKm: number = 145
): BatteryCalculations {
  const socClamped = Math.max(0, Math.min(100, currentSoc));
  const targetClamped = Math.max(socClamped, Math.min(100, targetSoc));

  const energyAvailableKwh = Number((batteryCapacityKwh * (socClamped / 100)).toFixed(2));
  const energyRequiredKwh = Number((batteryCapacityKwh * ((targetClamped - socClamped) / 100)).toFixed(2));

  // Ideal range in steady-state MIDC conditions
  const idealRangeKm = Math.round((energyAvailableKwh * 1000) / (consumptionWhPerKm * 0.85));

  // Chennai real-world range factoring 24°C cabin AC draw (1.8 kW) + stop-and-go corridor traffic
  const realWorldChennaiRangeKm = Math.round(idealRangeKm * 0.82);

  // Charging time estimate (hours = kWh / kW)
  const power = chargerPowerKw > 0 ? chargerPowerKw : 30;
  const chargingTimeHours = energyRequiredKwh / power;
  const chargingTimeMinutes = Math.round(chargingTimeHours * 60);

  // Cost estimate
  const estimatedCostInr = Math.round(energyRequiredKwh * pricePerKwh);

  // Health and alert level
  let alertLevel: 'LOW' | 'WARNING' | 'HEALTHY' | 'NORMAL' = 'NORMAL';
  let alertMessage = 'Normal operational state.';

  if (socClamped < 20) {
    alertLevel = 'LOW';
    alertMessage = 'Critical: Battery level below 20%. Charge immediately to avoid stranding.';
  } else if (socClamped < 30) {
    alertLevel = 'WARNING';
    alertMessage = 'Notice: Battery below 30%. Consider charging before long transit.';
  } else if (socClamped >= 70) {
    alertLevel = 'HEALTHY';
    alertMessage = 'Healthy: Battery pack is well charged for Chennai metropolitan corridor.';
  }

  return {
    energyAvailableKwh,
    energyRequiredKwh,
    idealRangeKm,
    realWorldChennaiRangeKm,
    chargingTimeMinutes,
    estimatedCostInr,
    alertLevel,
    alertMessage
  };
}

export function formatInr(amount: number): string {
  return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
