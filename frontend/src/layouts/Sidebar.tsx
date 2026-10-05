import React from 'react';
import {
  LayoutDashboard,
  Car,
  MapPin,
  Map as MapIcon,
  Zap,
  Sparkles,
  CalendarCheck,
  History,
  Settings,
  Bot,
  BatteryCharging
} from 'lucide-react';
import { useEV } from '../context/EVContext';
import { calculateBatteryTelemetry } from '../utils/calculations';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, vehicle, activeSession } = useEV();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-ev', label: 'My EV & Telemetry', icon: Car },
    { id: 'stations', label: 'Stations Registry', icon: MapPin },
    { id: 'map', label: 'Chennai Map View', icon: MapIcon },
    {
      id: 'charging',
      label: 'Charging Session',
      icon: Zap,
      badge: activeSession ? 'ACTIVE' : undefined,
      badgeColor: 'bg-emerald-500 text-white animate-pulse'
    },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { id: 'reservations', label: 'Reservations', icon: CalendarCheck },
    { id: 'history', label: 'Charging History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
    {
      id: 'ai-agent',
      label: 'AI Agent',
      icon: Bot,
      badge: 'Copilot',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
  ];

  const calc = calculateBatteryTelemetry(vehicle.batteryCapacityKwh, vehicle.currentSoc);

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200/80 z-40 flex flex-col justify-between shadow-sm">
      {/* Brand Header */}
      <div className="flex flex-col">
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-white shadow-sm">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-slate-900 tracking-tight leading-tight">EV-Agent</span>
              <span className="text-[11px] text-tertiary font-semibold flex items-center gap-1">
                Autonomous Core
              </span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            Step 1
          </span>
        </div>

        {/* Active EV Mini Card */}
        <div className="p-4 pb-2">
          <div 
            onClick={() => setActiveTab('my-ev')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 cursor-pointer transition-colors flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-primary flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                {vehicle.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {vehicle.registration}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-bold text-primary mt-1">{vehicle.currentSoc}%</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAgent = item.id === 'ai-agent';

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? isAgent
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isAgent ? 'text-tertiary' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${isActive ? 'bg-white/20 text-white' : item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div 
          onClick={() => setActiveTab('my-ev')}
          className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs cursor-pointer hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <BatteryCharging className="w-4 h-4 text-primary" />
              <span>SoC: {vehicle.currentSoc}%</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              {calc.realWorldChennaiRangeKm} km
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-primary rounded-full transition-all duration-500"
              style={{ width: `${vehicle.currentSoc}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Online • Chennai Metro
          </span>
          <span className="font-mono text-[10px]">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
