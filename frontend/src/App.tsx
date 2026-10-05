import React from 'react';
import { EVProvider, useEV } from './context/EVContext';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyEVPage } from './pages/MyEVPage';
import { StationsPage } from './pages/StationsPage';
import { MapPage } from './pages/MapPage';
import { RecommendationPage } from './pages/RecommendationPage';
import { ChargingPage } from './pages/ChargingPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AIAgentPage } from './pages/AIAgentPage';

const AppContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useEV();

  // If not logged in and on login tab, show LoginPage
  if (!isAuthenticated && activeTab === 'login') {
    return <LoginPage />;
  }

  // Active Tab view dispatcher
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'my-ev':
        return <MyEVPage />;
      case 'stations':
        return <StationsPage />;
      case 'map':
        return <MapPage />;
      case 'charging':
        return <ChargingPage />;
      case 'recommendations':
        return <RecommendationPage />;
      case 'reservations':
        return <ReservationsPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'ai-agent':
        return <AIAgentPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <MainLayout>{renderCurrentView()}</MainLayout>;
};

export const App: React.FC = () => {
  return (
    <EVProvider>
      <AppContent />
    </EVProvider>
  );
};

export default App;
