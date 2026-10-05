import React, { useState } from 'react';
import { Station, Reservation } from '../../types';
import { useEV } from '../../context/EVContext';
import { X, CalendarCheck, Sparkles, QrCode, CheckCircle2, Navigation } from 'lucide-react';
import { DemoBadge } from '../common/DemoBadge';

interface ReservationModalProps {
  station: Station | null;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({ station, onClose }) => {
  const { addReservation, setActiveTab } = useEV();
  const [selectedBay, setSelectedBay] = useState<string>('Bay #02');
  const [selectedDate, setSelectedDate] = useState<string>('Today, 26 Oct');
  const [selectedSlot, setSelectedSlot] = useState<string>('11:30 AM - 12:15 PM');
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  if (!station) return null;

  const handleConfirm = () => {
    const res = addReservation({
      stationId: station.station_id,
      stationName: station.station_name,
      area: station.area,
      bayNumber: selectedBay,
      connectorType: station.connector_type,
      powerKw: station.power_kw || 30,
      date: selectedDate,
      timeSlot: selectedSlot,
      isDemo: true
    });
    setConfirmedReservation(res);
  };

  const slots = [
    { time: '09:30 AM - 10:15 AM', isOptimal: false },
    { time: '11:30 AM - 12:15 PM', isOptimal: true, reason: 'Matches transit time + solar peak discount' },
    { time: '02:00 PM - 02:45 PM', isOptimal: false },
    { time: '04:30 PM - 05:15 PM', isOptimal: false }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Book Charging Slot</h3>
              <p className="text-xs text-slate-500">Fast Corridor Dispatch</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {confirmedReservation ? (
            /* Confirmed Booking Pass */
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Slot Lock Confirmed
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-1">Demo Booking Pass</h4>
                <p className="text-xs text-slate-500">Booking Reference: <strong className="font-mono text-slate-800">{confirmedReservation.bookingCode}</strong></p>
              </div>

              {/* Pass Card with QR */}
              <div className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                  <QrCode className="w-32 h-32 text-slate-900" />
                </div>

                <div className="w-full text-left space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Station:</span>
                    <span className="font-bold text-slate-800">{confirmedReservation.stationName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Allocated Bay:</span>
                    <span className="font-bold text-primary">{confirmedReservation.bayNumber} ({confirmedReservation.connectorType})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Schedule:</span>
                    <span className="font-bold text-slate-800">{confirmedReservation.date} • {confirmedReservation.timeSlot}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Simulation Status:</span>
                    <DemoBadge isDemo={true} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    onClose();
                    setActiveTab('reservations');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs transition-colors hover:bg-slate-800"
                >
                  View in Reservations
                </button>
              </div>
            </div>
          ) : (
            /* Reservation Configuration Form */
            <div className="space-y-5">
              {/* Station Snapshot */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Selected Station</span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{station.station_name}</h4>
                <p className="text-xs text-slate-500">{station.address}</p>
              </div>

              {/* Bay Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Select Bay & Connector</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Bay #01 (CCS2 DC)', 'Bay #02 (CCS2 Fast)', 'Bay #03 (Type 2 AC)', 'Bay #04 (CCS2 Dual)'].map((bay, idx) => (
                    <button
                      key={bay}
                      type="button"
                      onClick={() => setSelectedBay(`Bay #0${idx + 1}`)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        selectedBay === `Bay #0${idx + 1}`
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {bay}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Date</label>
                <div className="flex gap-2">
                  {['Today, 26 Oct', 'Tomorrow, 27 Oct'].map(date => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        selectedDate === date
                          ? 'border-primary bg-emerald-50 text-primary'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Available Time Slots</label>
                  <span className="text-[10px] text-slate-400">IST Timezone</span>
                </div>

                <div className="space-y-2">
                  {slots.map(s => (
                    <button
                      key={s.time}
                      type="button"
                      onClick={() => setSelectedSlot(s.time)}
                      className={`w-full p-3 rounded-xl border text-xs font-semibold text-left transition-all flex flex-col gap-1 ${
                        selectedSlot === s.time
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-200'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{s.time}</span>
                        {s.isOptimal && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold uppercase">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            AI Optimal
                          </span>
                        )}
                      </div>
                      {s.reason && (
                        <span className="text-[11px] text-purple-700/80 font-normal">
                          {s.reason}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Confirm Demo Reservation</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
