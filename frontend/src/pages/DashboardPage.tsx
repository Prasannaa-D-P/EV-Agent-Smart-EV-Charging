import React, { useState, useEffect } from 'react';
import { useEV } from '../context/EVContext';
import { BatteryGauge } from '../components/battery/BatteryGauge';
import { AIRecommendationCard } from '../components/ai/AIRecommendationCard';
import { StationCard } from '../components/stations/StationCard';
import { StationDetailModal } from '../components/stations/StationDetailModal';
import { ReservationModal } from '../components/reservations/ReservationModal';
import { ApiService } from '../services/api';
import { RecommendationResult, Station } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import {
  Zap,
  MapPin,
  CalendarCheck,
  Compass,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  QrCode,
  ArrowUpRight,
  Bot
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    vehicle,
    updateVehicle,
    stations,
    selectedStation,
    setSelectedStation,
    reservations,
    startDemoCharging,
    setActiveTab,
    destination
  } = useEV();

  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [modalStation, setModalStation] = useState<Station | null>(null);
  const [reservationModalStation, setReservationModalStation] = useState<Station | null>(null);

  useEffect(() => {
    ApiService.getRecommendation(
      vehicle.currentSoc,
      vehicle.batteryCapacityKwh,
      destination,
      vehicle.preferredConnector
    ).then(setRecommendation);
  }, [vehicle.currentSoc, vehicle.batteryCapacityKwh, destination, vehicle.preferredConnector]);

  const activeBooking = reservations[0];

  return (
    <div className="space-y-8">
      {/* Top Welcome Greeting & Agentic Engine Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Vanakkam, Karthik
            </h1>
            <span className="text-xl">⚡</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              Corridor Synced
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
              <Bot className="w-3.5 h-3.5 text-purple-700" />
              <span>Step 1 Foundation Core Active</span>
            </div>
            <span>•</span>
            <span>Chennai Metropolitian Corridor</span>
          </div>
        </div>

        {/* Quick Action Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('stations')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-xs transition-all active:scale-95 whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Find Charger</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all active:scale-95 whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5 text-secondary" />
            <span>Chennai Map</span>
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all active:scale-95 whitespace-nowrap"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-secondary" />
            <span>Book Slot</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-agent')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Roadmap</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Battery Telemetry & AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Battery Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <BatteryGauge
            vehicle={vehicle}
            onSocChange={(soc) => updateVehicle({ currentSoc: soc })}
            interactive={true}
          />

          {/* Confirmed Booking Pass Card (if exists) */}
          {activeBooking && (
            <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shrink-0">
                  <QrCode className="w-10 h-10 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      Confirmed Booking Pass
                    </span>
                    <span className="font-mono text-xs text-slate-400">({activeBooking.bookingCode})</span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">{activeBooking.stationName}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {activeBooking.bayNumber} • {activeBooking.date} ({activeBooking.timeSlot})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('reservations')}
                className="py-2 px-4 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                View Pass
              </button>
            </div>
          )}
        </div>

        {/* Right Column: AI Recommendation Card (5 Cols) */}
        <div className="lg:col-span-5">
          {recommendation && (
            <AIRecommendationCard
              recommendation={recommendation}
              destination={destination}
              onBookSlot={(st) => setReservationModalStation(st)}
              onSelectStation={(st) => setModalStation(st)}
            />
          )}
        </div>
      </div>

      {/* Nearby Chennai Charging Stations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Nearby Charging Stations
            </h2>
            <p className="text-xs text-slate-500">
              Chennai Reference Dataset • 20 stations registered
            </p>
          </div>

          <button
            onClick={() => setActiveTab('stations')}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>View All (20)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Featured Stations Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stations.slice(0, 3).map(station => (
            <StationCard
              key={station.station_id}
              station={station}
              onSelect={(st) => setModalStation(st)}
              onBookSlot={(st) => setReservationModalStation(st)}
              onStartCharge={(st) => startDemoCharging(st)}
            />
          ))}
        </div>
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
