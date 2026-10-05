import React from 'react';
import { useEV } from '../context/EVContext';
import { DemoBadge } from '../components/common/DemoBadge';
import { History, Download, Zap, Calendar, Clock, IndianRupee, ArrowUpRight } from 'lucide-react';
import { formatInr } from '../utils/calculations';

export const HistoryPage: React.FC = () => {
  const { historySessions } = useEV();

  const totalKwh = historySessions.reduce((acc, s) => acc + s.energyDeliveredKwh, 0);
  const totalCost = historySessions.reduce((acc, s) => acc + s.costInr, 0);
  const totalMinutes = historySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const handleExport = () => {
    const jsonStr = JSON.stringify(historySessions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ev-agent-charging-history-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Charging Session History & Receipts
            </h1>
            <DemoBadge isDemo={true} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical log of all simulated and completed dispenser charging sessions.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Logs (.JSON)</span>
        </button>
      </div>

      {/* Aggregate Metrics Quad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-primary" /> Total Energy Dispensed
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 tnum">{totalKwh.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-500">kWh</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Across {historySessions.length} recorded sessions</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Total Tariff Cost
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 tnum">{formatInr(totalCost)}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Average {formatInr(totalCost / (historySessions.length || 1))} / session</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-600" /> Total Charging Time
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 tnum">{Math.round(totalMinutes / 60)}h {totalMinutes % 60}m</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Fast DC & AC combined</span>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Session Log Registry</h3>
          <span className="text-xs text-slate-400 font-mono">{historySessions.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-5">Date & Time</th>
                <th className="py-3.5 px-5">Station & Location</th>
                <th className="py-3.5 px-5">Connector</th>
                <th className="py-3.5 px-5 text-right">Energy</th>
                <th className="py-3.5 px-5 text-right">Duration</th>
                <th className="py-3.5 px-5 text-right">Cost</th>
                <th className="py-3.5 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {historySessions.map(session => (
                <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5 font-medium text-slate-900 whitespace-nowrap">
                    {session.displayDate}
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900">{session.stationName}</div>
                    <div className="text-[11px] text-slate-400">{session.location}</div>
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap font-medium text-slate-600">
                    {session.connector}
                  </td>
                  <td className="py-4 px-5 text-right font-bold text-slate-900 whitespace-nowrap">
                    {session.energyDeliveredKwh} kWh
                  </td>
                  <td className="py-4 px-5 text-right text-slate-600 whitespace-nowrap">
                    {session.durationMinutes} min
                  </td>
                  <td className="py-4 px-5 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatInr(session.costInr)}
                  </td>
                  <td className="py-4 px-5 text-center whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
