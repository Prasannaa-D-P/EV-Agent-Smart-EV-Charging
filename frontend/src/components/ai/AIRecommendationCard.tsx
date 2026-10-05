import React, { useState } from 'react';
import { RecommendationResult, Station } from '../../types';
import { Bot, Sparkles, Navigation, Clock, Zap, Info, ChevronDown, ChevronUp, CalendarCheck, ShieldCheck } from 'lucide-react';
import { formatInr } from '../../utils/calculations';

interface AIRecommendationCardProps {
  recommendation: RecommendationResult;
  destination: string;
  onBookSlot: (station: Station) => void;
  onSelectStation: (station: Station) => void;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  recommendation,
  destination,
  onBookSlot,
  onSelectStation
}) => {
  const [whyOpen, setWhyOpen] = useState(false);
  const st = recommendation.station;

  return (
    <div className="bg-white rounded-3xl border border-purple-200/80 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between gap-5 agentic-glow">
      {/* Ambient agentic violet aura */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-100/60 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block leading-tight">
              Agentic Recommendation
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Heuristic Co-pilot (Step 1)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>{Math.round(recommendation.confidenceScore * 100)}% Confidence</span>
        </div>
      </div>

      {/* Primary Recommended Action */}
      <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
          Corridor Route: Towards {destination}
        </span>
        <h4 className="text-base font-bold text-slate-900">{recommendation.action}</h4>
        <p className="text-xs text-slate-600 mt-0.5">{recommendation.reason}</p>
      </div>

      {/* Selected Station Telemetry Block */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">{st.operator} Network</span>
            <h5 
              onClick={() => onSelectStation(st)}
              className="text-sm font-bold text-slate-900 hover:text-primary cursor-pointer transition-colors"
            >
              {st.station_name}
            </h5>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Navigation className="w-3 h-3 text-primary" />
              <span>{st.area}, Chennai</span>
              <span className="text-slate-300">•</span>
              <span>8 min transit</span>
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {st.connector_type}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium">Power</span>
            <p className="font-bold text-slate-900 mt-0.5">{st.power_kw ? `${st.power_kw} kW` : 'Fast DC'}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium">Est. Cost</span>
            <p className="font-bold text-slate-900 mt-0.5">{formatInr(recommendation.estimatedCostInr)}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium">Duration</span>
            <p className="font-bold text-slate-900 mt-0.5">{recommendation.estimatedChargingTimeMin} min</p>
          </div>
        </div>
      </div>

      {/* Accordion: Why this station? */}
      <div className="border border-slate-200/70 rounded-2xl overflow-hidden text-xs">
        <button
          onClick={() => setWhyOpen(!whyOpen)}
          className="w-full p-3 bg-white hover:bg-slate-50 flex items-center justify-between text-slate-700 font-semibold transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-purple-600" />
            Why was this station recommended?
          </span>
          {whyOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {whyOpen && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200/70 text-slate-600 space-y-1.5 leading-relaxed">
            <p>
              • <strong>Traffic Optimization:</strong> AI heuristic bypassed Anna Salai congestion (+14m delay) to route directly along inner arterial corridors.
            </p>
            <p>
              • <strong>Tariff Window:</strong> Station offers solar peak pricing ({formatInr(st.price_per_kwh)}/kWh) valid for the next 45 minutes.
            </p>
            <p>
              • <strong>Hardware Compatibility:</strong> High confidence match for your vehicle&apos;s CCS2 fast charging curve.
            </p>
          </div>
        )}
      </div>

      {/* 1-Tap Reserve Action */}
      <button
        onClick={() => onBookSlot(st)}
        className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
      >
        <CalendarCheck className="w-4 h-4" />
        <span>1-Tap Reserve Optimal Bay for 11:30 AM</span>
      </button>

      {/* Step 1 Architecture Label */}
      <div className="text-center">
        <span className="text-[10px] text-slate-400 font-medium">
          Step 1 Rule-Based Prototype • Modular Agentic AI Engine integrates in Step 2
        </span>
      </div>
    </div>
  );
};
