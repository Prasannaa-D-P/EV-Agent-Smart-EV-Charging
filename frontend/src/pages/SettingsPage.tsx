import React, { useState } from 'react';
import { useEV } from '../context/EVContext';
import { Settings, Save, RotateCcw, Bell, ShieldCheck, CheckCircle2, IndianRupee, BatteryWarning } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../data/demoSessions';
import { formatInr } from '../utils/calculations';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useEV();
  const [formData, setFormData] = useState({ ...settings });
  const [saveAlert, setSaveAlert] = useState(false);

  const handleChange = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2500);
  };

  const handleReset = () => {
    setFormData(DEFAULT_SETTINGS);
    updateSettings(DEFAULT_SETTINGS);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Platform Settings & Driver Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure tariff thresholds, corridor alerts, and autonomous agent parameters.
          </p>
        </div>

        {saveAlert && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences Saved!</span>
          </div>
        )}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-8">
        {/* Tariff & Cost Rules */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            Charging Cost & Tariff Ceiling
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Maximum Acceptable Cost (₹/kWh)</label>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatInr(formData.maxAcceptableCostInr)}/kWh
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="35"
                step="1"
                value={formData.maxAcceptableCostInr}
                onChange={(e) => handleChange('maxAcceptableCostInr', Number(e.target.value))}
                className="w-full accent-primary cursor-pointer mt-2"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Stations with higher tariffs will trigger an agentic warning before booking.
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Minimum Battery Alert Threshold</label>
                <span className="text-xs font-mono font-bold text-amber-600">
                  {formData.minimumBatteryThresholdPercent}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                value={formData.minimumBatteryThresholdPercent}
                onChange={(e) => handleChange('minimumBatteryThresholdPercent', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer mt-2"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Triggers automatic recommendation banner when SOC drops below this value.
              </span>
            </div>
          </div>
        </div>

        {/* Corridor & Mode */}
        <div className="pt-6 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Corridor Mobility Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Default Charging Mode</label>
              <select
                value={formData.preferredChargingMode}
                onChange={(e) => handleChange('preferredChargingMode', e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary"
              >
                <option value="Balanced">Balanced (Standard Speed & Fair Price)</option>
                <option value="Eco">Eco Mode (Off-Peak Solar Priority)</option>
                <option value="Max Speed">Max Speed (Fastest DC Dispenser regardless of tariff)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Chennai Home Corridor</label>
              <input
                type="text"
                value={formData.homeCorridor}
                onChange={(e) => handleChange('homeCorridor', e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-purple-600" />
            Notification & Autonomous Dispatch
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Telemetry Notifications</span>
              <span className="text-[11px] text-slate-500">Receive in-transit warnings when SoC is insufficient for corridor destination.</span>
            </div>
            <input
              type="checkbox"
              checked={formData.notificationsEnabled}
              onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
              className="w-5 h-5 accent-primary cursor-pointer rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Auto-Reserve on Critical Battery</span>
              <span className="text-[11px] text-slate-500">Allow autonomous agent to reserve the nearest available bay when battery &lt; 15%.</span>
            </div>
            <input
              type="checkbox"
              checked={formData.autoReserveOnLowBattery}
              onChange={(e) => handleChange('autoReserveOnLowBattery', e.target.checked)}
              className="w-5 h-5 accent-purple-600 cursor-pointer rounded"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
