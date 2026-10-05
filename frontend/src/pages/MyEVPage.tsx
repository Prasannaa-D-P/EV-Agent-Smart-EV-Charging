import React, { useState } from 'react';
import { useEV } from '../context/EVContext';
import { Car, Zap, BatteryCharging, Save, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { DemoBadge } from '../components/common/DemoBadge';
import { calculateBatteryTelemetry } from '../utils/calculations';

export const MyEVPage: React.FC = () => {
  const { vehicle, updateVehicle } = useEV();
  const [formData, setFormData] = useState({ ...vehicle });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateVehicle(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const calc = calculateBatteryTelemetry(formData.batteryCapacityKwh, formData.currentSoc);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Electric Vehicle Profile
            </h1>
            <DemoBadge isDemo={true} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure vehicle battery capacity, connector preferences, and telemetry calibrations.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile Saved to Local Storage!</span>
          </div>
        )}
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Vehicle Specifications</h3>
            <p className="text-xs text-slate-400">Values are stored locally and immediately adjust all range/charging formulas.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Name */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Vehicle Model & Trim */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Model & Trim</label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Registration Number */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Registration Number</label>
            <input
              type="text"
              required
              value={formData.registration}
              onChange={(e) => handleChange('registration', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Current Home Location */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Corridor Location</label>
            <input
              type="text"
              required
              value={formData.currentLocation}
              onChange={(e) => handleChange('currentLocation', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Battery Capacity (kWh) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Battery Pack Capacity</label>
              <span className="text-[10px] text-slate-400 font-mono">kWh</span>
            </div>
            <input
              type="number"
              step="0.1"
              min="1"
              max="150"
              required
              value={formData.batteryCapacityKwh}
              onChange={(e) => handleChange('batteryCapacityKwh', Number(e.target.value))}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Current SOC (%) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Current Battery Level (SOC)</label>
              <span className="text-xs font-bold text-primary font-mono">{formData.currentSoc}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.currentSoc}
                onChange={(e) => handleChange('currentSoc', Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <span className="w-12 text-right font-mono text-xs font-bold text-slate-700">{formData.currentSoc}%</span>
            </div>
          </div>

          {/* Preferred Connector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Connector Standard</label>
            <select
              value={formData.preferredConnector}
              onChange={(e) => handleChange('preferredConnector', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="CCS2">CCS2 (Combined Charging System 2 - India Standard)</option>
              <option value="Type 2">Type 2 AC (Mennekes)</option>
              <option value="LEV DC">LEV DC (Ather / 2-Wheeler DC Fast)</option>
              <option value="CHAdeMO">CHAdeMO</option>
            </select>
          </div>

          {/* Preferred Charging Mode */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Charging Preference</label>
            <select
              value={formData.preferredChargingType}
              onChange={(e) => handleChange('preferredChargingType', e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="DC Fast">DC Fast Priority (&gt;30 kW)</option>
              <option value="AC Normal">AC Normal Charging (7.4 kW / 22 kW)</option>
              <option value="Eco">Eco Mode (Off-Peak Solar Optimization)</option>
            </select>
          </div>
        </div>

        {/* Real-time Calculated Energy Preview */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary" />
            <div>
              <span className="font-bold text-slate-900">Instant Telemetry Feedback:</span>
              <p className="text-slate-600 mt-0.5">
                Available Energy: <strong className="text-slate-900">{calc.energyAvailableKwh} kWh</strong> • Practical Chennai Range: <strong className="text-primary">{calc.realWorldChennaiRangeKm} km</strong>
              </p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100">
            Auto Synced
          </span>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>Save EV Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
