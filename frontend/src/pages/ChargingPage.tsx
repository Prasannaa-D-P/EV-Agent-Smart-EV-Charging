import React, { useState } from 'react';
import { useEV } from '../context/EVContext';
import { ChargingSessionVisualizer } from '../components/charging/ChargingSessionVisualizer';
import { DemoBadge } from '../components/common/DemoBadge';
import { Zap, Play, Square, Pause, History, CheckCircle2 } from 'lucide-react';
import { Station } from '../types';

export const ChargingPage: React.FC = () => {
  const {
    activeSession,
    stations,
    startDemoCharging,
    setActiveTab
  } = useEV();

  const [selectedStationId, setSelectedStationId] = useState<string>(
    activeSession?.stationId || stations[0]?.station_id || ''
  );

  const handleStartWithSelected = () => {
    const st = stations.find(s => s.station_id === selectedStationId) || stations[0];
    if (st) {
      startDemoCharging(st);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Live Charging Session Simulation
            </h1>
            <DemoBadge isDemo={true} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate a high-power DC or AC charging session with real-time battery SOC increment, power flow, and billing.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('history')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
        >
          <History className="w-4 h-4" />
          <span>View Session Logs</span>
        </button>
      </div>

      {/* Station Selector if not active */}
      {!activeSession && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Charging Station to Plug Into:
            </label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary"
            >
              {stations.map(st => (
                <option key={st.station_id} value={st.station_id}>
                  {st.station_name} ({st.area}) • {st.connector_type} • {st.power_kw ? `${st.power_kw} kW` : 'Varies'}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStartWithSelected}
            className="w-full sm:w-auto mt-2 sm:mt-5 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Plug In & Start Charge</span>
          </button>
        </div>
      )}

      {/* Main Visualizer */}
      <ChargingSessionVisualizer />
    </div>
  );
};
