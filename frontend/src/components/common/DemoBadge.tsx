import React from 'react';
import { FlaskConical, Wifi } from 'lucide-react';

interface DemoBadgeProps {
  isDemo?: boolean;
  className?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ isDemo = true, className = '' }) => {
  if (isDemo) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold tracking-wide ${className}`}>
        <FlaskConical className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
        <span>DEMO / SIMULATED DATA</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide ${className}`}>
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      <Wifi className="w-3.5 h-3.5 text-emerald-600" />
      <span>LIVE TELEMETRY</span>
    </div>
  );
};
