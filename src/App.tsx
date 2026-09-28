/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomeLobby } from './components/views/HomeLobby';
import { WalletView } from './components/views/WalletView';
import { PromotionsTournamentsView } from './components/views/PromotionsTournamentsView';
import { SecureMessagesView } from './components/views/SecureMessagesView';
import { ResponsibleGamingView } from './components/views/ResponsibleGamingView';
import { DatabaseArchitectureView } from './components/views/DatabaseArchitectureView';
import { PlansMonetizationView } from './components/views/PlansMonetizationView';
import { GoogleDriveView } from './components/drive/GoogleDriveView';
import { GameLauncherModal } from './components/casino/GameLauncherModal';
import { RealityCheckModal } from './components/modals/RealityCheckModal';
import { AdminLoginPortal } from './components/admin/AdminLoginPortal';
import { AdminLayout } from './components/admin/AdminLayout';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, adminSession, activeGame, setActiveGame } = useApp();

  // Handle URL hash changes (e.g. #/admin or #admin)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#/admin' || hash === '#admin') {
        setCurrentView('admin');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setCurrentView]);

  const handleExitAdmin = () => {
    window.location.hash = '';
    setCurrentView('home');
  };

  // ==========================================
  // ÁREA PRIVADA DE ADMINISTRADORES
  // ==========================================
  if (currentView === 'admin' || window.location.hash === '#/admin' || window.location.hash === '#admin') {
    // If administrative session is NOT active, require institutional authentication
    if (!adminSession) {
      return <AdminLoginPortal onBackToPlayerArea={handleExitAdmin} />;
    }

    // Authenticated administrator view with role-based permissions and exclusive layout
    return <AdminLayout onExitToPlayerArea={handleExitAdmin} />;
  }

  // ==========================================
  // ÁREA DE JUGADORES / CLIENTES
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Sticky Header for Players Only */}
      <Navbar />

      {/* Main Player Content Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentView === 'home' && <HomeLobby />}
        {currentView === 'wallet' && <WalletView />}
        {currentView === 'promotions' && <PromotionsTournamentsView />}
        {currentView === 'secure_messages' && <SecureMessagesView />}
        {currentView === 'responsible_gaming' && <ResponsibleGamingView />}
        {currentView === 'database_schema' && <DatabaseArchitectureView />}
        {currentView === 'drive' && <GoogleDriveView />}
        {currentView === 'plans' && <PlansMonetizationView />}
      </main>

      {/* Interactive Casino Game Modal */}
      {activeGame && (
        <GameLauncherModal
          game={activeGame}
          onClose={() => setActiveGame(null)}
        />
      )}

      {/* Responsible Gaming Reality Check Alert Modal */}
      <RealityCheckModal />

      {/* Argentine Regulatory Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
