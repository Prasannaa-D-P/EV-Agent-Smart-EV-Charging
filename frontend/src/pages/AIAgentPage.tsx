import React from 'react';
import { Bot, Sparkles, Cpu, GitBranch, ArrowRight, ShieldCheck, Zap, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { DemoBadge } from '../components/common/DemoBadge';

export const AIAgentPage: React.FC = () => {
  const futureAgents = [
    {
      title: 'Coordinator Orchestrator Agent',
      file: 'src/future/agents/orchestrator.ts',
      desc: 'Master supervisor agent that decomposes driver itineraries, monitors vehicle SoC drain, and orchestrates specialized sub-agents.',
      status: 'Architectural Interface Stub Defined'
    },
    {
      title: 'ML Demand Prediction Agent',
      file: 'src/future/ml/demandPrediction.ts',
      desc: 'Predicts bay occupancy probability and queue delays across Chennai stations (Guindy, OMR, Anna Nagar) using historical traffic data.',
      status: 'Data Quality Pipeline Seeded'
    },
    {
      title: 'Dynamic Tariff Optimizer Agent',
      file: 'src/future/optimization/costOptimizer.ts',
      desc: 'Optimizes charging windows against time-of-day solar tariffs, reducing driver electricity costs by up to 25%.',
      status: 'Heuristic Baseline Active'
    },
    {
      title: 'Chennai Corridor Routing Agent',
      file: 'src/future/routing/corridorPlanner.ts',
      desc: 'Real-time transit energy calculation accounting for cabin AC power draw, elevation, and arterial bottleneck delays.',
      status: 'Corridor Nodes Mapped'
    },
    {
      title: 'TNEV & OCPP Live Telemetry Connector',
      file: 'src/future/realtime/tnevConnector.ts',
      desc: 'Interfaces with live Tamil Nadu TNEV APIs and charger OCPP 2.0.1 streams to verify gun connectivity and power delivery.',
      status: 'Schema Standardized'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-tr from-purple-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 agentic-glow">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Stage 2 Roadmap Preview
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Agentic AI Decision Engine
          </h1>

          <p className="text-xs text-purple-200/90 leading-relaxed">
            &ldquo;Agentic AI decision engine will be integrated in the next development stage.&rdquo;
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            In this initial Step 1 release, the platform establishes the complete user interface, dataset integrity classification, and modular architectural extension hooks.
          </p>
        </div>

        <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-purple-400 shadow-2xl shrink-0 z-10">
          <Bot className="w-16 h-16 animate-pulse" />
        </div>
      </div>

      {/* Multi-Agent Architecture Blueprint */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Multi-Agent Architecture Blueprint (Step 2 Implementation)
          </h2>
          <p className="text-xs text-slate-500">
            The code repository already features modular placeholder interfaces for each autonomous agent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {futureAgents.map(agent => (
            <div
              key={agent.title}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    {agent.title}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Planned
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{agent.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <code className="text-[10px] text-slate-400 font-mono">{agent.file}</code>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {agent.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Development Stages Roadmap */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          Incremental Roadmap
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-800 uppercase text-[10px]">Current Stage</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">Step 1 (Complete)</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">UI & Platform Foundation</h4>
            <ul className="text-slate-600 space-y-1 pt-1">
              <li>✓ Complete modern responsive UI</li>
              <li>✓ Chennai 20-station dataset integration</li>
              <li>✓ Leaflet geospatial map plotting</li>
              <li>✓ Battery & energy available formulas</li>
              <li>✓ Live charging simulation</li>
              <li>✓ Slot booking pass with QR code</li>
              <li>✓ Modular code architecture stubs</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-800 uppercase text-[10px]">Next Milestone</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">Step 2</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Agentic AI & ML Models</h4>
            <ul className="text-slate-600 space-y-1 pt-1">
              <li>• LangChain / AutoGen multi-agent system</li>
              <li>• Machine learning demand prediction</li>
              <li>• Dynamic time-of-day tariff optimization</li>
              <li>• Autonomous bay pre-booking negotiation</li>
              <li>• Real-time Chennai corridor re-routing</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Future Expansion</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">Step 3</span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">IoT & Production Network</h4>
            <ul className="text-slate-600 space-y-1 pt-1">
              <li>• Live TNEV / TNGECL API integration</li>
              <li>• IoT hardware relay charger control</li>
              <li>• Razorpay / UPI automated billing</li>
              <li>• Fleet management for EV logistics</li>
              <li>• Solar micro-grid bidirectional V2G</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
