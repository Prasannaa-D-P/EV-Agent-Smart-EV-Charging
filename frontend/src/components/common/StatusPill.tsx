import React from 'react';
import { StationStatus } from '../../types';

interface StatusPillProps {
  status: StationStatus;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'AVAILABLE':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          Available
        </span>
      );
    case 'LIMITED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Limited Bays
        </span>
      );
    case 'OCCUPIED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Occupied
        </span>
      );
    case 'RESERVED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
          Reserved
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Offline
        </span>
      );
  }
};
