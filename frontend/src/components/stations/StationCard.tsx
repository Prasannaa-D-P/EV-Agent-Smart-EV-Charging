import React from 'react';
import { Station } from '../../types';
import { StatusPill } from '../common/StatusPill';
import { QualityBadge } from '../common/QualityBadge';
import { Zap, Clock, ShieldCheck, MapPin, ChevronRight, CalendarCheck, Play } from 'lucide-react';
import { formatInr } from '../../utils/calculations';

interface StationCardProps {
  station: Station;
  onSelect: (station: Station) => void;
  onBookSlot?: (station: Station) => void;
  onStartCharge?: (station: Station) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  onSelect,
  onBookSlot,
  onStartCharge
}) => {
  const getOperatorColor = (op: string) => {
    switch (op.toLowerCase()) {
      case 'ather':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'tata power':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'zeon':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'statiq':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getOperatorColor(station.operator)}`}>
            {station.operator}
          </span>
          <div className="flex items-center gap-1.5">
            <QualityBadge quality={station.data_quality} hasCoords={station.latitude !== null} />
            <StatusPill status={station.status} />
          </div>
        </div>

        {/* Station Title and Area */}
        <h3 className="font-semibold text-slate-900 text-base group-hover:text-primary transition-colors line-clamp-1">
          {station.station_name}
        </h3>
        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 mb-4">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{station.address}</span>
        </p>

        {/* Power & Connector Grid */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Connector & Power</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
              {station.connector_type} • {station.power_kw ? `${station.power_kw} kW` : 'Varies'}
            </span>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Tariff Rate</span>
            <span className="font-semibold text-slate-800 mt-0.5">
              {formatInr(station.price_per_kwh)}/kWh
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onSelect(station)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          View Details
        </button>

        {onBookSlot && (
          <button
            onClick={() => onBookSlot(station)}
            title="Book reservation slot"
            className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
          >
            <CalendarCheck className="w-4 h-4" />
          </button>
        )}

        {onStartCharge && (
          <button
            onClick={() => onStartCharge(station)}
            title="Start demo charge simulation"
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
};
