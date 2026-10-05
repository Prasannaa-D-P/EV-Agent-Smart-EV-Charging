import React, { useState, useEffect } from 'react';
import { Search, MapPin, Zap, Bell, CloudSun, Wind } from 'lucide-react';
import { useEV } from '../context/EVContext';
import { DemoBadge } from '../components/common/DemoBadge';
import { Station, WeatherData } from '../types';
import { ApiService } from '../services/api';

export const Navbar: React.FC = () => {
  const { vehicle, setActiveTab, setSelectedStation, stations, settings, updateSettings } = useEV();
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    ApiService.getWeather().then(w => {
      if (w) setWeather(w);
    });
  }, []);

  const handleNearestFastCharger = () => {
    // Find highest power DC charger with verified coords or in Guindy/Central
    const fastStation = stations.find((s: Station) => s.charger_type === 'DC' && s.power_kw >= 30) || stations[0];
    if (fastStation) {
      setSelectedStation(fastStation);
      setActiveTab('stations');
    }
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 z-30 flex items-center justify-between px-6 gap-4">
      {/* Search Input & Location Breadcrumb */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Chennai stations (e.g. Guindy, OMR, Adyar, Anna Nagar)..."
            onClick={() => setActiveTab('stations')}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium whitespace-nowrap">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold text-slate-900">{vehicle.currentLocation}</span>
          <span className="text-slate-300">•</span>
          <span className="text-primary font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            Corridor Synced
          </span>
        </div>
      </div>

      {/* Right Utility Stack */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Open-Meteo Weather Pill */}
        {weather && (
          <div
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 text-slate-700 text-xs font-medium border border-slate-200/60"
            title={`Chennai Metro Weather: ${weather.weather_condition} • Humidity: ${weather.relative_humidity_percent}% • Wind: ${weather.wind_speed_kmh} km/h (Source: Open-Meteo)`}
          >
            <CloudSun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-bold text-slate-900">{Math.round(weather.temperature_c)}°C</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 truncate max-w-[90px]">{weather.weather_condition}</span>
            <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-500 pl-1 border-l border-slate-200">
              <Wind className="w-3 h-3 text-slate-400" />
              <span>{weather.wind_speed_kmh} km/h</span>
            </div>
          </div>
        )}

        {/* Demo / Live Toggle */}
        <button
          onClick={() => updateSettings({ demoMode: !settings.demoMode })}
          title="Click to toggle simulation / live mode demonstration"
          className="hidden md:flex items-center hover:opacity-90 transition-opacity"
        >
          <DemoBadge isDemo={settings.demoMode} />
        </button>

        {/* Nearest Fast Charger Quick Action */}
        <button
          onClick={handleNearestFastCharger}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-sm transition-all active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Nearest Fast Charger</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setActiveTab('recommendations')}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="System Telemetry Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
        </div>

        {/* User Profile Pill */}
        <div 
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2.5 pl-2 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-emerald-400 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            KS
          </div>
          <div className="hidden 2xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 leading-tight">Karthik S.</span>
            <span className="text-[11px] text-slate-500 leading-tight">Chennai Corridor</span>
          </div>
        </div>
      </div>
    </header>
  );
};
