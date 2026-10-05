import React, { useState, useMemo } from 'react';
import { useEV } from '../context/EVContext';
import { Station } from '../types';
import { StationCard } from '../components/stations/StationCard';
import { StationDetailModal } from '../components/stations/StationDetailModal';
import { ReservationModal } from '../components/reservations/ReservationModal';
import { DemoBadge } from '../components/common/DemoBadge';
import { Search, Filter, SlidersHorizontal, MapPin, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

export const StationsPage: React.FC = () => {
  const { stations, startDemoCharging } = useEV();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('ALL');
  const [selectedConnector, setSelectedConnector] = useState('ALL');
  const [selectedQuality, setSelectedQuality] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [modalStation, setModalStation] = useState<Station | null>(null);
  const [reservationModalStation, setReservationModalStation] = useState<Station | null>(null);

  // Available unique operators from dataset
  const operators = ['ALL', 'Ather', 'Tata Power', 'Zeon', 'Yocharge', 'Statiq', 'Mahindra', 'TEDA'];
  const connectors = ['ALL', 'CCS2', 'Type 2', 'LEV DC', 'AC'];

  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      // Search text match
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        s.station_name.toLowerCase().includes(query) ||
        s.area.toLowerCase().includes(query) ||
        s.operator.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query);

      // Operator filter
      const matchOperator = selectedOperator === 'ALL' || s.operator.toLowerCase() === selectedOperator.toLowerCase();

      // Connector filter
      const matchConnector = selectedConnector === 'ALL' || s.connector_type.toLowerCase().includes(selectedConnector.toLowerCase());

      // Quality filter
      const matchQuality =
        selectedQuality === 'ALL' ||
        (selectedQuality === 'VERIFIED' && s.data_quality === 'VERIFIED_COORDINATE') ||
        (selectedQuality === 'PENDING' && s.data_quality === 'OPERATOR_LISTING');

      // Status filter
      const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

      return matchSearch && matchOperator && matchConnector && matchQuality && matchStatus;
    });
  }, [stations, searchQuery, selectedOperator, selectedConnector, selectedQuality, selectedStatus]);

  const verifiedCount = stations.filter(s => s.data_quality === 'VERIFIED_COORDINATE').length;
  const listingCount = stations.filter(s => s.data_quality === 'OPERATOR_LISTING').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Chennai EV Charging Stations Registry
            </h1>
            <DemoBadge isDemo={true} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Displaying official records from Bureau of Energy Efficiency (BEE) and Tamil Nadu operator listings.
          </p>
        </div>

        {/* Quality classification pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            {verifiedCount} BEE Verified
          </span>
          <span className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
            {listingCount} Operator Listings
          </span>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        {/* Search Input Row */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by area, location, or operator (e.g. Guindy, OMR, Adyar, Tata Power, Zeon)..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Operator Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Operator</label>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-primary"
            >
              {operators.map(op => (
                <option key={op} value={op}>{op === 'ALL' ? 'All Operators' : op}</option>
              ))}
            </select>
          </div>

          {/* Connector Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Connector</label>
            <select
              value={selectedConnector}
              onChange={(e) => setSelectedConnector(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-primary"
            >
              {connectors.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Connectors' : c}</option>
              ))}
            </select>
          </div>

          {/* Coordinate Verification Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Geospatial Fidelity</label>
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Stations (20)</option>
              <option value="VERIFIED">BEE Verified Coords (7)</option>
              <option value="PENDING">Operator Listings (13)</option>
            </select>
          </div>

          {/* Availability Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Live Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="LIMITED">Limited</option>
              <option value="OCCUPIED">Occupied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Found <strong>{filteredStations.length}</strong> matching stations in Chennai</span>
          <span className="text-[11px] text-slate-400">Strict Data Rule: Approximate coordinates are omitted from map plotting</span>
        </div>

        {filteredStations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
            <MapPin className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-900 text-base">No matching Chennai stations found</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing or adjusting your search filters above.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedOperator('ALL');
                setSelectedConnector('ALL');
                setSelectedQuality('ALL');
                setSelectedStatus('ALL');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map(station => (
              <StationCard
                key={station.station_id}
                station={station}
                onSelect={(st) => setModalStation(st)}
                onBookSlot={(st) => setReservationModalStation(st)}
                onStartCharge={(st) => startDemoCharging(st)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Station Detail Modal */}
      {modalStation && (
        <StationDetailModal
          station={modalStation}
          onClose={() => setModalStation(null)}
          onBookSlot={(st) => setReservationModalStation(st)}
          onStartCharge={(st) => startDemoCharging(st)}
        />
      )}

      {/* Reservation Booking Modal */}
      {reservationModalStation && (
        <ReservationModal
          station={reservationModalStation}
          onClose={() => setReservationModalStation(null)}
        />
      )}
    </div>
  );
};
