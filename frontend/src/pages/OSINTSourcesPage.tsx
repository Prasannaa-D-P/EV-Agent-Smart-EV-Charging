import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { OSINTSource, OSINTStatus, SyncLog, DataConflict } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Server,
  Activity,
  Layers,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const OSINTSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<OSINTSource[]>([]);
  const [status, setStatus] = useState<OSINTStatus | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  const loadData = async () => {
    const [srcData, statData, logsData, confData] = await Promise.all([
      ApiService.getOSINTSources(),
      ApiService.getOSINTStatus(),
      ApiService.getSyncLogs(),
      ApiService.getConflicts()
    ]);
    setSources(srcData);
    setStatus(statData);
    setSyncLogs(logsData);
    setConflicts(confData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncSuccess(null);
    try {
      const res = await ApiService.triggerSync(["OPEN_CHARGE_MAP", "OPENSTREETMAP", "BEE", "TNEV"]);
      if (res.status === 'COMPLETED') {
        setSyncSuccess(`Sync completed! ${res.result.records_accepted} records processed, ${res.result.duplicates_found} duplicates linked, ${res.result.conflicts_found} conflicts logged.`);
      } else {
        setSyncSuccess(`Sync failed: ${res.error || 'Server error'}`);
      }
      await loadData();
    } catch (e: any) {
      setSyncSuccess(`Sync error: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (statusStr: string, connected: boolean) => {
    switch (statusStr) {
      case 'CONNECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            CONNECTED
          </span>
        );
      case 'REFERENCE_CONNECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            REFERENCE DATA
          </span>
        );
      case 'MOCK_ACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Activity className="w-3 h-3 text-amber-600" />
            MOCK MODE
          </span>
        );
      case 'PUBLIC_API_NOT_CONFIGURED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
            NOT CONFIGURED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            {statusStr}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              OSINT & Open Data Sources Ingestion
            </h1>
            <DemoBadge isDemo={true} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Multi-source ingestion pipeline: Open Charge Map, OpenStreetMap, Nominatim, OSRM, Open-Meteo, BEE, and TNEV.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Ingesting Feeds...' : 'Trigger Pipeline Sync'}</span>
        </button>
      </div>

      {syncSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncSuccess}</span>
        </div>
      )}

      {/* Aggregate Architecture Summary Quad */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-primary" /> Station Entities
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 tnum">
              {status?.station_entities_count || 20}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Deduplicated physical hubs</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-secondary" /> Source Records
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 tnum">
              {status?.source_records_count || 20}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Tracked across all adapters</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Active Conflicts
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-amber-600 tnum">
              {conflicts.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Divergent field values</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-600" /> Sync Cycles
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 tnum">
              {status?.total_sync_runs || 1}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Audit log entries</span>
        </div>
      </div>

      {/* Data Conflicts Panel */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-900 text-sm">
                Data Conflicts Detected Across Sources ({conflicts.length})
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Not Silently Overwritten
            </span>
          </div>

          <p className="text-xs text-amber-800/90 leading-relaxed">
            In accordance with OSINT data integrity rules, divergent values across sources are exposed transparently rather than guessed:
          </p>

          <div className="space-y-2">
            {conflicts.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-4 border border-amber-200/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{c.station_name || c.station_entity_id}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({c.area || 'Chennai'})</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Field Discrepancy: <strong className="font-mono text-amber-700">{c.field_name}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    <span className="text-[9px] block text-slate-400 uppercase">{c.source_a}</span>
                    <strong>{c.value_a}</strong>
                  </div>
                  <span className="text-slate-400 font-bold">vs</span>
                  <div className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900">
                    <span className="text-[9px] block text-amber-600 uppercase">{c.source_b}</span>
                    <strong>{c.value_b}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of 15 OSINT Sources */}
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Registered OSINT & Public Adapters</h3>
          <p className="text-xs text-slate-500">Independent adapter instances. Zero hard dependencies on any single upstream provider.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sources.map(src => (
            <div
              key={src.source_id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{src.type}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{src.name}</h4>
                  </div>
                  {getStatusBadge(src.status, src.connected)}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {src.health?.message || 'Standardized adapter active and participating in pipeline.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Records Stored:</span>
                <span className="font-mono font-bold text-slate-800">{src.records_stored}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Synchronization Audit Trail Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Synchronization Audit Trail (`osint_sync_logs`)</h3>
          <span className="text-xs text-slate-400 font-mono">{syncLogs.length} Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-5">Source</th>
                <th className="py-3.5 px-5">Started At</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Received</th>
                <th className="py-3.5 px-5 text-right">Accepted</th>
                <th className="py-3.5 px-5 text-right">Duplicates</th>
                <th className="py-3.5 px-5 text-right">Conflicts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {syncLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900 font-mono text-xs">
                    {log.source}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                    {log.started_at?.replace('T', ' ').substring(0, 19)}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono">{log.records_received}</td>
                  <td className="py-3.5 px-5 text-right font-mono font-bold text-primary">{log.records_accepted}</td>
                  <td className="py-3.5 px-5 text-right font-mono text-slate-600">{log.duplicates_found}</td>
                  <td className="py-3.5 px-5 text-right font-mono font-bold text-amber-600">{log.conflicts_found}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
