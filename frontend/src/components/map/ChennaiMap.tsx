import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Station, RouteData } from '../../types';
import { StatusPill } from '../common/StatusPill';
import { QualityBadge } from '../common/QualityBadge';
import { Zap, MapPin, Navigation, Info, Car } from 'lucide-react';
import { formatInr } from '../../utils/calculations';
import { ApiService } from '../../services/api';

// Custom Map center controller
const RecenterAutomatically = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

// Create custom user pin
const createVehicleIcon = () => {
  const html = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
    ">
      <div style="
        background: #2563eb;
        color: white;
        padding: 3px 8px;
        border-radius: 9999px;
        font-size: 10px;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(37,99,235,0.4);
        border: 2px solid white;
        white-space: nowrap;
        margin-bottom: 2px;
      ">
        My EV (Anna Nagar)
      </div>
      <div style="
        width: 14px;
        height: 14px;
        background: #2563eb;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(37,99,235,0.8);
      "></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-ev-user-pin',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
};

// Create custom marker pins for Leaflet
const createCustomIcon = (status: string, operator: string) => {
  const isAvailable = status === 'AVAILABLE';
  const isLimited = status === 'LIMITED';
  const color = isAvailable ? '#16a05d' : isLimited ? '#f2a900' : '#d92d20';

  const html = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
    ">
      <div style="
        background: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 9999px;
        font-size: 10px;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        border: 2px solid white;
        white-space: nowrap;
        margin-bottom: 2px;
      ">
        ${operator}
      </div>
      <div style="
        width: 14px;
        height: 14px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-ev-pin',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
};

interface ChennaiMapProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  onBookSlot?: (station: Station) => void;
  onStartCharge?: (station: Station) => void;
}

export const ChennaiMap: React.FC<ChennaiMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onBookSlot,
  onStartCharge
}) => {
  const userCoords: [number, number] = [13.0850, 80.2100];
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);

  // Verified coordinate stations strictly plotted
  const plottableStations = stations.filter(
    s => s.latitude !== null && s.longitude !== null && !isNaN(s.latitude) && !isNaN(s.longitude)
  );

  // Unplotted stations
  const unplottableStations = stations.filter(s => s.latitude === null || s.longitude === null);

  // When selectedStation changes, fetch route from current location
  useEffect(() => {
    if (selectedStation && selectedStation.latitude && selectedStation.longitude) {
      setIsLoadingRoute(true);
      ApiService.getRoute(userCoords[0], userCoords[1], selectedStation.latitude, selectedStation.longitude)
        .then(r => {
          setRoute(r);
          setIsLoadingRoute(false);
        })
        .catch(() => {
          setIsLoadingRoute(false);
        });
    } else {
      setRoute(null);
    }
  }, [selectedStation]);

  // Chennai default center (Guindy / OMR corridor)
  const defaultCenter: [number, number] = [13.0125, 80.2206];

  const mapCenter: [number, number] = selectedStation && selectedStation.latitude && selectedStation.longitude
    ? [selectedStation.latitude, selectedStation.longitude]
    : defaultCenter;

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-md flex flex-col bg-slate-100">
      {/* Top Floating Map Header & Legend */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-3">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-bold text-slate-800">
              {plottableStations.length} Verified Charging Hubs
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">Chennai Corridor Core</span>
        </div>

        {/* Route Info Badge if active */}
        {route && selectedStation && (
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 shadow-lg text-white text-xs flex items-center gap-3 animate-fadeIn">
            <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white">
                {route.distance_km} km • {route.duration_minutes} mins
              </span>
              <span className="text-[10px] text-slate-300 ml-2">
                Fastest route to {selectedStation.area}
              </span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="pointer-events-auto hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/80 shadow-sm text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Limited
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Occupied
          </span>
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectedStation && selectedStation.latitude && selectedStation.longitude && (
          <RecenterAutomatically lat={selectedStation.latitude} lng={selectedStation.longitude} />
        )}

        {/* User Vehicle Location Pin */}
        <Marker position={userCoords} icon={createVehicleIcon()}>
          <Popup>
            <div className="p-1 text-xs">
              <strong className="text-slate-900 block font-semibold">My Current EV Position</strong>
              <span className="text-slate-500 text-[11px]">Anna Nagar West, Chennai</span>
            </div>
          </Popup>
        </Marker>

        {/* OSRM Route Polyline Overlay */}
        {route && route.geometry && route.geometry.length > 0 && (
          <Polyline
            positions={route.geometry}
            pathOptions={{
              color: '#2563eb',
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        )}

        {plottableStations.map(station => {
          const lat = station.latitude as number;
          const lng = station.longitude as number;
          const icon = createCustomIcon(station.status, station.operator);

          return (
            <Marker
              key={station.station_id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectStation(station)
              }}
            >
              <Popup className="custom-station-popup">
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500">{station.operator}</span>
                    <StatusPill status={station.status} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{station.station_name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{station.area}, Chennai</p>

                  <div className="my-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] flex justify-between">
                    <span>{station.connector_type} • {station.power_kw} kW</span>
                    <span className="font-bold text-slate-900">{formatInr(station.price_per_kwh)}/kWh</span>
                  </div>

                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => onSelectStation(station)}
                      className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-semibold transition-colors"
                    >
                      Station Info
                    </button>
                    {onBookSlot && (
                      <button
                        onClick={() => onBookSlot(station)}
                        className="py-1.5 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-semibold transition-colors"
                      >
                        Reserve
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Bottom Floating Notice regarding Unmapped Listings */}
      {unplottableStations.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-md flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>{unplottableStations.length} Corridor Locations</strong> (T. Nagar, Porur, Egmore, etc.) have approximate address listings. Browse full specifications in the Stations Registry.
            </span>
          </div>
          <span className="font-semibold text-primary underline cursor-pointer shrink-0" onClick={() => onSelectStation(unplottableStations[0])}>
            Browse in Registry
          </span>
        </div>
      )}
    </div>
  );
};
