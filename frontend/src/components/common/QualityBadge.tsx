import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DataQuality } from '../../types';

interface QualityBadgeProps {
  quality: DataQuality;
  hasCoords?: boolean;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ quality, hasCoords }) => {
  if (quality === 'VERIFIED_COORDINATE' || hasCoords) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium" title="Geospatial coordinates verified against BEE records">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>BEE Verified Coords</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium" title="Operator listing - approximate location, coordinates pending independent verification">
      <AlertTriangle className="w-3 h-3 text-amber-500" />
      <span>Listing • Coords Pending</span>
    </span>
  );
};
