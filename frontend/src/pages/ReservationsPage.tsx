import React, { useState } from 'react';
import { useEV } from '../context/EVContext';
import { Reservation, Station } from '../types';
import { ReservationModal } from '../components/reservations/ReservationModal';
import { DemoBadge } from '../components/common/DemoBadge';
import { CalendarCheck, QrCode, Trash2, Plus, CheckCircle2, Clock, MapPin, Zap } from 'lucide-react';

export const ReservationsPage: React.FC = () => {
  const { reservations, cancelReservation, stations } = useEV();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station>(stations[0]);
  const [activeQrPass, setActiveQrPass] = useState<Reservation | null>(null);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Charging Bay Slot Reservations
            </h1>
            <DemoBadge isDemo={true} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pre-book charger time slots along Chennai corridors with automated bay allocation.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedStation(stations[0]);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Active Reservations List */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Active Confirmed Passes</h3>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
            <CalendarCheck className="w-12 h-12 text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-900 text-base">No active reservations</h4>
            <p className="text-xs text-slate-500 mt-1">Book a slot at any Chennai station to lock a bay in advance.</p>
            <button
              onClick={() => {
                setSelectedStation(stations[0]);
                setModalOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs transition-colors hover:bg-purple-700"
            >
              Book a Slot Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reservations.map(res => (
              <div
                key={res.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between gap-5 relative overflow-hidden group hover:border-purple-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      {res.status}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    {res.bookingCode}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-base">{res.stationName}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{res.area}, Chennai</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-purple-50/50 rounded-2xl border border-purple-100/80 text-xs">
                    <div>
                      <span className="text-[10px] text-purple-700/80 uppercase font-semibold">Allocated Bay</span>
                      <p className="font-bold text-slate-900 mt-0.5">{res.bayNumber} ({res.connectorType})</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-700/80 uppercase font-semibold">Scheduled Slot</span>
                      <p className="font-bold text-slate-900 mt-0.5">{res.date} • {res.timeSlot}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setActiveQrPass(res)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View QR Pass</span>
                  </button>

                  <button
                    onClick={() => cancelReservation(res.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Cancel demo reservation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {modalOpen && (
        <ReservationModal
          station={selectedStation}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* QR Pass View Dialog */}
      {activeQrPass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-900 text-base">Driver Digital Pass</h4>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
              <QrCode className="w-44 h-44 text-slate-900" />
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-mono font-bold text-slate-900 text-sm">{activeQrPass.bookingCode}</p>
              <p>{activeQrPass.stationName}</p>
              <p className="font-semibold text-primary">{activeQrPass.bayNumber} • {activeQrPass.timeSlot}</p>
            </div>
            <button
              onClick={() => setActiveQrPass(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
