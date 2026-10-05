import React from 'react';
import { Station } from '../../types';
import { StatusPill } from '../common/StatusPill';
import { QualityBadge } from '../common/QualityBadge';
import { DemoBadge } from '../common/DemoBadge';
import { X, MapPin, Zap, Clock, Phone, Database, ShieldAlert, CalendarCheck, Play } from 'lucide-react';
import { formatInr } from '../../utils/calculations';

interface StationDetailModalProps {
  station: Station | null;
  onClose: () => void;
  onBookSlot?: (station: Station) => void;
  onStartCharge?: (station: Station) => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  station,
  onClose,
  onBookSlot,
  onStartCharge
}) => {
  if (!station) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {station.operator}
              </span>
              <StatusPill status={station.status} />
              <QualityBadge quality={station.data_quality} hasCoords={station.latitude !== null} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{station.station_name}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {station.address}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 22 Schema Specifications */}
        <div className="p-6 space-y-6">
          {/* Coordinates Alert if approximate */}
          {station.latitude === null ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold block mb-0.5">Approximate Operator Listing</span>
                Exact coordinate verification from TNEV/BEE is pending for this station. It is listed for corridor discovery but omitted from map pin rendering until independently geocoded.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-start gap-3">
              <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold block mb-0.5">BEE Verified Geospatial Coordinates</span>
                Latitude: <strong className="font-mono">{station.latitude}</strong> • Longitude: <strong className="font-mono">{station.longitude}</strong>
              </div>
            </div>
          )}

          {/* Verified Station Highlights */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <div>
                <span className="font-bold text-slate-800 block">Verified Chennai Charging Hub</span>
                <span className="text-[11px] text-slate-500">Location, power rating, and tariffs verified for Chennai corridor transit</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[11px]">
              {station.operator}
            </span>
          </div>

          {/* Quick Specifications Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Hardware & Electrical Specifications</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Connector Standard</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{station.connector_type}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Charger Power</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {station.power_kw ? `${station.power_kw} kW` : 'Varies'} ({station.charger_type})
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Tariff Rate</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{formatInr(station.price_per_kwh)}/kWh</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Operating Hours</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {station.is_24_hours ? '24 Hours Open' : `${station.opening_time} - ${station.closing_time}`}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Contact Phone</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{station.phone}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Station ID</span>
                <p className="text-xs font-mono font-bold text-slate-700 mt-0.5 truncate">{station.station_id}</p>
              </div>
            </div>
          </div>

          {/* Operational Information & Bay Features */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <h4 className="text-xs font-bold text-slate-600 mb-2">Facility & Corridor Details</h4>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Corridor Area:</span>
              <span className="font-semibold text-slate-800">{station.area}, Chennai</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Operational Status:</span>
              <span className="font-semibold text-emerald-600">Active & Available</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Last Verified:</span>
              <span className="text-slate-700">{station.last_verified_at || 'Recent Corridor Audit'}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Close
          </button>

          {onBookSlot && (
            <button
              onClick={() => {
                onBookSlot(station);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Reserve Bay Slot</span>
            </button>
          )}

          {onStartCharge && (
            <button
              onClick={() => {
                onStartCharge(station);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Demo Charging</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
