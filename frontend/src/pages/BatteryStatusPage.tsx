import React from 'react';
import { useEV } from '../context/EVContext';
import { BatteryGauge } from '../components/battery/BatteryGauge';
import { calculateBatteryTelemetry, formatInr } from '../utils/calculations';
import { Zap, AlertTriangle, ShieldCheck, Thermometer, BatteryCharging, Gauge } from 'lucide-react';
import { DemoBadge } from '../components/common/DemoBadge';

export const BatteryStatusPage: React.FC = () => {
  const { vehicle, updateVehicle, setActiveTab } = useEV();
  const calc = calculateBatteryTelemetry(vehicle.batteryCapacityKwh, vehicle.currentSoc);

  // Generate ASCII / Unicode battery bar representation as requested in prompt:
  // e.g. 68% ██████████████░░░░░░
  const totalBlocks = 20;
  const filledBlocks = Math.round((vehicle.currentSoc / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  const batteryAsciiBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Battery Telemetry & Capacity Status
            </h1>
            <DemoBadge isDemo={true} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pack state of charge, estimated usable energy, degradation diagnostics, and thermal curve.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('charging')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <BatteryCharging className="w-4 h-4" />
          <span>Launch Charging Simulation</span>
        </button>
      </div>

      {/* Main Battery Gauge Card */}
      <BatteryGauge
        vehicle={vehicle}
        onSocChange={(soc) => updateVehicle({ currentSoc: soc })}
        interactive={true}
      />

      {/* Visual ASCII / Monospace Bar Display Card (as requested in PPT / guidelines) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-slate-900 text-sm">State of Charge Block Representation</h3>
          </div>
          <span className="text-xs font-mono font-bold text-primary">{vehicle.currentSoc}% Capacity</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-lg md:text-xl tracking-wider overflow-x-auto shadow-inner">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-sans">
            <span>[0% Empty]</span>
            <span>[Current Reserve: {calc.energyAvailableKwh} kWh]</span>
            <span>[100% Full]</span>
          </div>
          <div className="text-center font-bold">
            {batteryAsciiBar}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 text-center">
          Note: In Step 1, usable energy is calculated as: <code>Estimated Available Energy = Battery Capacity ({vehicle.batteryCapacityKwh} kWh) × Current SOC ({vehicle.currentSoc}%) = {calc.energyAvailableKwh} kWh</code>.
        </div>
      </div>

      {/* Energy Math & Reserve Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Pack Capacity</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{vehicle.batteryCapacityKwh}</span>
              <span className="text-xs font-semibold text-slate-500">kWh</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Gross nominal battery capacity installed in vehicle.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
            <span>Usable Buffer</span>
            <span className="font-bold text-slate-900">95%</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Energy Remaining</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-primary">{calc.energyAvailableKwh}</span>
              <span className="text-xs font-semibold text-primary">kWh</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Calculated real-time available energy stored in the pack.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
            <span>To Reach 100%</span>
            <span className="font-bold text-slate-900">{calc.energyRequiredKwh} kWh needed</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Chennai Corridor Reserve</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{calc.realWorldChennaiRangeKm}</span>
              <span className="text-xs font-semibold text-slate-500">km</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Based on Chennai city average consumption rate of {vehicle.consumptionWhPerKm} Wh/km.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
            <span>Ideal MIDC</span>
            <span className="font-bold text-slate-900">{calc.idealRangeKm} km</span>
          </div>
        </div>
      </div>
    </div>
  );
};
