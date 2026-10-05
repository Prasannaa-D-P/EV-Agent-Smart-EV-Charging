import React, { useState } from 'react';
import { useEV } from '../context/EVContext';
import { ChennaiMap } from '../components/map/ChennaiMap';
import { StationDetailModal } from '../components/stations/StationDetailModal';
import { ReservationModal } from '../components/reservations/ReservationModal';
import { Station } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import { QualityBadge } from '../components/common/QualityBadge';
import { StatusPill } from '../components/common/StatusPill';
import { MapPin } from 'lucide-react';
import { formatInr } from '../utils/calculations';

export const MapPage: React.FC = () => {
  const { stations, selectedStation, setSelectedStation, startDemoCharging } = useEV();
  const [modalStation, setModalStation] = useState<Station | null>(null);
  const [reservationStation, setReservationStation] = useState<Station | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

  const verifiedStations = stations.filter(s => s.latitude !== null && s.longitude !== null);
  const pendingStations = stations.filter(s => s.latitude === null || s.longitude === null);

  const displayedList =
    activeTabFilter === 'VERIFIED'
      ? verifiedStations
      : activeTabFilter === 'PENDING'
      ? pendingStations
      : stations;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Interactive Chennai Geospatial Map
            </h1>
            <DemoBadge isDemo={true} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            OpenStreetMap Leaflet rendering. Only coordinate-verified BEE records are plotted on the map.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTabFilter('ALL')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all ${
              activeTabFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Stations (20)
          </button>
          <button
            onClick={() => setActiveTabFilter('VERIFIED')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all ${
              activeTabFilter === 'VERIFIED'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Map Plotted (7)
          </button>
          <button
            onClick={() => setActiveTabFilter('PENDING')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all ${
              activeTabFilter === 'PENDING'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Coords Pending (13)
          </button>
        </div>
      </div>

      {/* Grid: Map (8 Cols) + Sidebar Station Directory (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Map View (8 Cols) */}
        <div className="lg:col-span-8">
          <ChennaiMap
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={(st) => setModalStation(st)}
            onBookSlot={(st) => setReservationStation(st)}
            onStartCharge={(st) => startDemoCharging(st)}
          />
        </div>

        {/* Side Station Drawer List (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col h-[620px]">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Station Directory</h3>
              <p className="text-[11px] text-slate-400">Click a station to inspect or center</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">{displayedList.length}</span>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1">
            {displayedList.map(st => {
              const isSelected = selectedStation?.station_id === st.station_id;
              const hasCoords = st.latitude !== null;

              return (
                <div
                  key={st.station_id}
                  onClick={() => {
                    setSelectedStation(st);
                    if (!hasCoords) {
                      setModalStation(st);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-primary bg-emerald-50/50 shadow-xs ring-1 ring-primary/30'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 text-xs truncate max-w-[170px]">
                      {st.station_name}
                    </span>
                    <StatusPill status={st.status} className="scale-90" />
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{st.area}, Chennai</span>
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100/80">
                    <span className="text-slate-600 font-medium">
                      {st.connector_type} • {st.power_kw ? `${st.power_kw} kW` : 'Varies'}
                    </span>
                    <QualityBadge quality={st.data_quality} hasCoords={hasCoords} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            Stations without verified coordinates are listed here and will not render fake map pins.
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {modalStation && (
        <StationDetailModal
          station={modalStation}
          onClose={() => setModalStation(null)}
          onBookSlot={(st) => setReservationStation(st)}
          onStartCharge={(st) => startDemoCharging(st)}
        />
      )}

      {/* Reservation Modal */}
      {reservationStation && (
        <ReservationModal
          station={reservationStation}
          onClose={() => setReservationStation(null)}
        />
      )}
    </div>
  );
};
