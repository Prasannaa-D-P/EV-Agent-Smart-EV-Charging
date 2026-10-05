import React from 'react';
import { EVProfile } from '../../types';
import { calculateBatteryTelemetry } from '../../utils/calculations';
import { Zap, Gauge, Thermometer, Disc, ShieldCheck, AlertCircle } from 'lucide-react';

interface BatteryGaugeProps {
  vehicle: EVProfile;
  onSocChange?: (newSoc: number) => void;
  interactive?: boolean;
}

export const BatteryGauge: React.FC<BatteryGaugeProps> = ({
  vehicle,
  onSocChange,
  interactive = true
}) => {
  const calc = calculateBatteryTelemetry(vehicle.batteryCapacityKwh, vehicle.currentSoc);

  const getBarColor = (soc: number) => {
    if (soc < 20) return 'from-red-500 to-red-600';
    if (soc < 35) return 'from-amber-400 to-amber-500';
    return 'from-emerald-400 to-primary';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between gap-6">
      {/* Subtle ambient light */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-lg">{vehicle.name}</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {vehicle.model}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{vehicle.registration} • {vehicle.currentLocation}</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span>{vehicle.batteryCapacityKwh} kWh Pack</span>
        </div>
      </div>

      {/* Main SOC Readout & Progress Gauge */}
      <div className="flex flex-col md:flex-row items-baseline md:items-center justify-between gap-6">
        <div className="flex items-baseline gap-2">
          <span className="font-extrabold text-5xl text-slate-900 tnum tracking-tight">{vehicle.currentSoc}</span>
          <span className="font-bold text-2xl text-primary">%</span>
          <span className="text-xs text-slate-400 ml-2 font-medium">State of Charge (SOC)</span>
        </div>

        <div className="flex-1 w-full max-w-md flex flex-col gap-2">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>Usable Reserve</span>
            <span className="font-bold text-slate-900">{calc.energyAvailableKwh} / {vehicle.batteryCapacityKwh} kWh</span>
          </div>

          <div className="w-full h-4 bg-slate-100 rounded-full p-0.5 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getBarColor(vehicle.currentSoc)} transition-all duration-700 shadow-sm`}
              style={{ width: `${vehicle.currentSoc}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>0% Critical</span>
            <span className="text-primary font-semibold">Eco Safe Zone (&gt;30%)</span>
            <span>100% Full</span>
          </div>
        </div>
      </div>

      {/* Interactive SOC Slider if allowed */}
      {interactive && onSocChange && (
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Simulate Battery SOC:</span>
          <input
            type="range"
            min="5"
            max="100"
            value={vehicle.currentSoc}
            onChange={(e) => onSocChange(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
          <span className="text-xs font-bold text-primary font-mono w-12 text-right">{vehicle.currentSoc}%</span>
        </div>
      )}

      {/* Range Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ideal MIDC Range */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-slate-400" />
            Standard MIDC Range
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900 tnum">{calc.idealRangeKm}</span>
            <span className="text-xs font-semibold text-slate-500">km</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Steady state unconstrained laboratory test</span>
        </div>

        {/* Chennai Real-World Range */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" />
              Chennai Real-World Practical Range
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-primary tnum">{calc.realWorldChennaiRangeKm}</span>
            <span className="text-xs font-bold text-primary">km</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1">
            Factoring 24°C cabin AC + Anna Salai/OMR stop-and-go traffic
          </span>
        </div>
      </div>

      {/* Battery Alert Banner */}
      <div className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs ${
        calc.alertLevel === 'LOW'
          ? 'bg-red-50 text-red-800 border border-red-200'
          : calc.alertLevel === 'WARNING'
          ? 'bg-amber-50 text-amber-800 border border-amber-200'
          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
      }`}>
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="font-medium">{calc.alertMessage}</span>
      </div>

      {/* Pack Health Diagnostics */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-primary" />
            SOH Health
          </span>
          <span className="text-base font-bold text-slate-900 mt-1">{vehicle.sohHealthPercent}%</span>
          <span className="text-[10px] text-slate-400">Degradation minimal</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-amber-500" />
            Pack Temp
          </span>
          <span className="text-base font-bold text-slate-900 mt-1">{vehicle.packTempC} °C</span>
          <span className="text-[10px] text-slate-400">Optimal thermal window</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Disc className="w-3 h-3 text-secondary" />
            Tyre Pressure
          </span>
          <span className="text-base font-bold text-slate-900 mt-1">{vehicle.tyrePressurePsi} PSI</span>
          <span className="text-[10px] text-slate-400">All 4 corners calibrated</span>
        </div>
      </div>
    </div>
  );
};
