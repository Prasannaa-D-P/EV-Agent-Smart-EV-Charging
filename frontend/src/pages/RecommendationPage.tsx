import React, { useState, useEffect } from 'react';
import { useEV } from '../context/EVContext';
import { AIRecommendationCard } from '../components/ai/AIRecommendationCard';
import { StationDetailModal } from '../components/stations/StationDetailModal';
import { ReservationModal } from '../components/reservations/ReservationModal';
import { ApiService } from '../services/api';
import { RecommendationResult, Station } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import { Bot, MapPin, Sparkles, Navigation, Target, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { calculateBatteryTelemetry } from '../utils/calculations';

export const RecommendationPage: React.FC = () => {
  const {
    vehicle,
    updateVehicle,
    destination,
    setDestination,
    startDemoCharging
  } = useEV();

  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [modalStation, setModalStation] = useState<Station | null>(null);
  const [reservationStation, setReservationStation] = useState<Station | null>(null);

  const destinations = [
    'Chennai Airport',
    'OMR Siruseri IT Park',
    'Marina Beach',
    'Guindy Industrial Estate',
    'Central Railway Station',
    'Mahabalipuram Coastal Corridor'
  ];

  useEffect(() => {
    ApiService.getRecommendation(
      vehicle.currentSoc,
      vehicle.batteryCapacityKwh,
      destination,
      vehicle.preferredConnector
    ).then(setRecommendation);
  }, [vehicle.currentSoc, vehicle.batteryCapacityKwh, destination, vehicle.preferredConnector]);

  const calc = calculateBatteryTelemetry(vehicle.batteryCapacityKwh, vehicle.currentSoc);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Charging Decision & Recommendation Engine
            </h1>
            <DemoBadge isDemo={true} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rule-based placeholder logic. This screen architecture is primed for the Step 2 Multi-Agent Orchestrator.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          <span>Step 1 Rule Engine Active</span>
        </div>
      </div>

      {/* Corridor Context Setup Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Trip Corridor & Target Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Destination Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Trip Destination</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary"
            >
              {destinations.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Current SOC Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Simulate Battery SOC</label>
              <span className="text-xs font-bold text-primary font-mono">{vehicle.currentSoc}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={vehicle.currentSoc}
              onChange={(e) => updateVehicle({ currentSoc: Number(e.target.value) })}
              className="w-full accent-primary cursor-pointer mt-2"
            />
          </div>

          {/* Practical Range Readout */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Practical Range</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{calc.realWorldChennaiRangeKm} km</p>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">To reach {destination}</span>
          </div>
        </div>
      </div>

      {/* Main Agentic Recommendation Card */}
      {recommendation && (
        <AIRecommendationCard
          recommendation={recommendation}
          destination={destination}
          onBookSlot={(st) => setReservationStation(st)}
          onSelectStation={(st) => setModalStation(st)}
        />
      )}

      {/* Architectural Transition Banner */}
      <div className="p-5 rounded-3xl bg-purple-50/60 border border-purple-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-purple-700 shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold text-purple-900">How will this screen work in Step 2?</span>
            <p className="text-purple-700/80">
              The current rule-based heuristic will be seamlessly swapped with our <code>AgenticOrchestrator</code>, which autonomously monitors traffic bottlenecks, negotiates charger time slots, and executes reservation decisions.
            </p>
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
