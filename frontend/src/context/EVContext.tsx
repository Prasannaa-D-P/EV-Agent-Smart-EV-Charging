import React, { createContext, useContext, useState, useEffect } from 'react';
import { EVProfile, Station, ChargingSession, Reservation, UserSettings } from '../types';
import { DEFAULT_VEHICLE } from '../data/defaultProfile';
import { INITIAL_STATIONS } from '../data/stationsData';
import { INITIAL_SESSIONS, INITIAL_RESERVATIONS, DEFAULT_SETTINGS } from '../data/demoSessions';
import { ApiService } from '../services/api';

interface EVContextType {
  vehicle: EVProfile;
  updateVehicle: (updated: Partial<EVProfile>) => void;
  stations: Station[];
  selectedStation: Station | null;
  setSelectedStation: (station: Station | null) => void;
  reservations: Reservation[];
  addReservation: (res: Omit<Reservation, 'id' | 'bookingCode' | 'createdAt' | 'status'>) => Reservation;
  cancelReservation: (id: string) => void;
  historySessions: ChargingSession[];
  activeSession: ChargingSession | null;
  startDemoCharging: (station: Station, targetSoc?: number) => void;
  pauseDemoCharging: () => void;
  stopDemoCharging: () => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  destination: string;
  setDestination: (dest: string) => void;
}

const EVContext = createContext<EVContextType | undefined>(undefined);

export const EVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Vehicle Profile state
  const [vehicle, setVehicle] = useState<EVProfile>(() => {
    const saved = localStorage.getItem('ev_agent_vehicle');
    return saved ? JSON.parse(saved) : DEFAULT_VEHICLE;
  });

  // Stations state
  const [stations, setStations] = useState<Station[]>(INITIAL_STATIONS);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Reservations state
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('ev_agent_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  // History state
  const [historySessions, setHistorySessions] = useState<ChargingSession[]>(() => {
    const saved = localStorage.getItem('ev_agent_history');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  // Active charging simulation state
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null);

  // Settings state
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('ev_agent_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Navigation and Auth state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [destination, setDestination] = useState<string>('Chennai Airport');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ev_agent_auth') === 'true';
  });

  // Sync with API on mount if available
  useEffect(() => {
    ApiService.getStations().then(data => {
      if (data && data.length > 0) setStations(data);
    });
  }, []);

  // Save to localStorage whenever critical states change
  useEffect(() => {
    localStorage.setItem('ev_agent_vehicle', JSON.stringify(vehicle));
  }, [vehicle]);

  useEffect(() => {
    localStorage.setItem('ev_agent_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('ev_agent_history', JSON.stringify(historySessions));
  }, [historySessions]);

  useEffect(() => {
    localStorage.setItem('ev_agent_settings', JSON.stringify(settings));
  }, [settings]);

  // Charging simulation timer loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (activeSession && activeSession.status === 'IN_PROGRESS') {
      interval = setInterval(() => {
        setActiveSession(prev => {
          if (!prev) return null;
          if (prev.endSoc >= 100) {
            // Auto complete
            const completedSession: ChargingSession = {
              ...prev,
              status: 'COMPLETED'
            };
            setHistorySessions(h => [completedSession, ...h]);
            return null;
          }
          const increment = 1;
          const newSoc = Math.min(100, prev.endSoc + increment);
          const energyAdded = Number((vehicle.batteryCapacityKwh * (increment / 100)).toFixed(2));
          const newEnergy = Number((prev.energyDeliveredKwh + energyAdded).toFixed(2));
          const newCost = Number((newEnergy * 18.0).toFixed(2));
          const newDuration = prev.durationMinutes + 1;

          // Update vehicle currentSoc simultaneously
          setVehicle(v => ({ ...v, currentSoc: newSoc }));

          return {
            ...prev,
            endSoc: newSoc,
            energyDeliveredKwh: newEnergy,
            costInr: newCost,
            durationMinutes: newDuration
          };
        });
      }, 1200); // 1.2s tick for realistic visual feedback
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession, vehicle.batteryCapacityKwh]);

  const updateVehicle = (updated: Partial<EVProfile>) => {
    setVehicle(prev => ({ ...prev, ...updated }));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addReservation = (data: Omit<Reservation, 'id' | 'bookingCode' | 'createdAt' | 'status'>): Reservation => {
    const bookingCode = `EV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRes: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      bookingCode,
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED'
    };
    setReservations(prev => [newRes, ...prev]);
    return newRes;
  };

  const cancelReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  const startDemoCharging = (station: Station) => {
    const newSession: ChargingSession = {
      id: `sess-${Date.now()}`,
      date: new Date().toISOString(),
      displayDate: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      stationName: station.station_name,
      stationId: station.station_id,
      location: `${station.area}, Chennai`,
      connector: station.connector_type,
      energyDeliveredKwh: 0.1,
      durationMinutes: 1,
      costInr: 1.8,
      startSoc: vehicle.currentSoc,
      endSoc: vehicle.currentSoc,
      status: 'IN_PROGRESS',
      isDemo: true
    };
    setActiveSession(newSession);
    setActiveTab('charging');
  };

  const pauseDemoCharging = () => {
    if (!activeSession) return;
    setActiveSession(prev => prev ? {
      ...prev,
      status: prev.status === 'IN_PROGRESS' ? 'PAUSED' : 'IN_PROGRESS'
    } : null);
  };

  const stopDemoCharging = () => {
    if (!activeSession) return;
    const finalSession: ChargingSession = {
      ...activeSession,
      status: 'COMPLETED'
    };
    setHistorySessions(prev => [finalSession, ...prev]);
    setActiveSession(null);
  };

  const login = (email: string, name?: string) => {
    localStorage.setItem('ev_agent_auth', 'true');
    localStorage.setItem('ev_agent_user_email', email);
    if (name) localStorage.setItem('ev_agent_user_name', name);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const logout = () => {
    localStorage.removeItem('ev_agent_auth');
    setIsAuthenticated(false);
    setActiveTab('login');
  };

  return (
    <EVContext.Provider
      value={{
        vehicle,
        updateVehicle,
        stations,
        selectedStation,
        setSelectedStation,
        reservations,
        addReservation,
        cancelReservation,
        historySessions,
        activeSession,
        startDemoCharging,
        pauseDemoCharging,
        stopDemoCharging,
        settings,
        updateSettings,
        isAuthenticated,
        login,
        logout,
        activeTab,
        setActiveTab,
        destination,
        setDestination
      }}
    >
      {children}
    </EVContext.Provider>
  );
};

export const useEV = (): EVContextType => {
  const context = useContext(EVContext);
  if (!context) {
    throw new Error('useEV must be used within an EVProvider');
  }
  return context;
};
