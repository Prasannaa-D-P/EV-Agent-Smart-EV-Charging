import React from 'react';
import { useEV } from '../../context/EVContext';
import { Station } from '../../types';
import { DemoBadge } from '../common/DemoBadge';
import { Zap, Play, Pause, Square, Clock, Gauge, IndianRupee, ShieldCheck } from 'lucide-react';
import { formatInr } from '../../utils/calculations';

interface ChargingSessionVisualizerProps {
  onStartSession?: () => void;
}

export const ChargingSessionVisualizer: React.FC<ChargingSessionVisualizerProps> = () => {
  const {
    activeSession,
    startDemoCharging,
    pauseDemoCharging,
    stopDemoCharging,
    vehicle,
    stations
  } = useEV();

  const isCharging = activeSession?.status === 'IN_PROGRESS';
  const isPaused = activeSession?.status === 'PAUSED';

  // Fallback candidate station if starting session directly from this screen
  const defaultStation: Station = stations[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs relative overflow-hidden flex flex-col items-center text-center gap-8">
      {/* Top Demo Simulation Banner */}
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-4">
        <DemoBadge isDemo={true} />
        <span className="text-xs font-semibold text-slate-500">
          OCPP 2.0.1 Protocol Emulator
        </span>
      </div>

      {/* Selected Station Banner */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Connected Dispenser Bay
        </span>
        <h3 className="text-lg font-bold text-slate-900 mt-1">
          {activeSession ? activeSession.stationName : defaultStation.station_name}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {activeSession ? activeSession.location : `${defaultStation.area}, Chennai`} • {activeSession ? activeSession.connector : defaultStation.connector_type}
        </p>
      </div>

      {/* Visual Circular Pulse Progress Meter */}
      <div className="relative flex items-center justify-center w-64 h-64 my-2">
        {/* Animated aura ring */}
        <div className={`absolute inset-0 rounded-full border-4 border-dashed transition-all duration-1000 ${
          isCharging ? 'border-primary/40 animate-spin' : isPaused ? 'border-amber-300' : 'border-slate-200'
        }`} />

        <div className={`w-52 h-52 rounded-full bg-slate-50 border-8 flex flex-col items-center justify-center shadow-inner transition-colors ${
          isCharging ? 'border-primary shadow-emerald-100' : isPaused ? 'border-amber-400 shadow-amber-50' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-1 text-primary">
            <Zap className={`w-6 h-6 ${isCharging ? 'animate-bounce fill-current' : ''}`} />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-5xl font-extrabold text-slate-900 tnum tracking-tight">
              {vehicle.currentSoc}
            </span>
            <span className="text-2xl font-bold text-primary">%</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
            {isCharging ? 'Dispensing DC' : isPaused ? 'Session Paused' : 'Idle / Ready'}
          </span>
        </div>
      </div>

      {/* Real-time Telemetry Metrics Quad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
          <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-primary" /> Power
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 tnum">
            {isCharging ? '48.5 kW' : '0.0 kW'}
          </span>
          <span className="text-[10px] text-slate-400">Peak 60 kW</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
          <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-secondary" /> Energy
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 tnum">
            {activeSession ? `${activeSession.energyDeliveredKwh} kWh` : '0.0 kWh'}
          </span>
          <span className="text-[10px] text-slate-400">Delivered</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
          <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Cost
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 tnum">
            {formatInr(activeSession ? activeSession.costInr : 0)}
          </span>
          <span className="text-[10px] text-slate-400">₹ 18.00/kWh</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
          <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-600" /> Time
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 tnum">
            {activeSession ? `${activeSession.durationMinutes} min` : '0 min'}
          </span>
          <span className="text-[10px] text-slate-400">Elapsed</span>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 w-full max-w-md">
        {!activeSession ? (
          <button
            onClick={() => startDemoCharging(defaultStation)}
            className="flex-1 py-3 px-6 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Demo Charging</span>
          </button>
        ) : (
          <>
            <button
              onClick={pauseDemoCharging}
              className={`flex-1 py-3 px-5 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              <span>{isPaused ? 'Resume Session' : 'Pause Simulation'}</span>
            </button>

            <button
              onClick={stopDemoCharging}
              className="flex-1 py-3 px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop & Log to History</span>
            </button>
          </>
        )}
      </div>

      <div className="text-[11px] text-slate-400 max-w-md">
        Simulated session automatically increments battery percentage and energy telemetry. Stopping logs the completed receipt into the local History registry.
      </div>
    </div>
  );
};
