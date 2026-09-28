import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Crown,
  Wallet,
  Shield,
  MessageSquareLock,
  Smartphone,
  HeartHandshake,
  Settings,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  UserCheck,
  AlertTriangle,
  Clock,
  Layers,
  Database,
  Menu,
  X,
  CreditCard,
  LogOut,
  Lock,
  CheckCircle2,
  User,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  FileCheck2,
  HardDrive,
} from 'lucide-react';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    setActiveGame,
    wallet,
    user,
    soundEnabled,
    toggleSound,
    sessionElapsedMinutes,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const navigateTo = (view: string) => {
    setActiveGame(null);
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#070b14]/95 backdrop-blur-md border-b border-amber-500/20">
      {/* ARGENTINA REGULATORY BANNER & INSTITUTIONAL ACCESS GATEWAY */}
      <div className="bg-gradient-to-r from-red-950/90 via-black to-red-950/90 py-1.5 px-3 sm:px-6 text-[11px] border-b border-red-500/30 flex items-center justify-between gap-2 flex-wrap">
        {/* Regulatory Responsible Gaming Banner */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-rose-600 text-white font-black px-1.5 py-0.2 rounded text-[10px]">
            +18
          </span>
          <span className="font-bold text-rose-300 uppercase tracking-wide text-[10px] sm:text-[11px]">
            EL JUGAR COMPULSIVAMENTE ES PERJUDICIAL PARA LA SALUD
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden md:inline">
            Línea gratuita: <strong className="text-amber-400 font-mono-tech">0800-444-4000</strong>
          </span>
          <button
            onClick={() => navigateTo('responsible_gaming')}
            className="text-amber-400 underline hover:text-amber-300 ml-1 font-semibold text-[10px] sm:text-[11px]"
          >
            Autoexclusión & Límites
          </button>
        </div>

        {/* Regulatory License Status for Players */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono-tech text-slate-400">
          <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LOTBA Licencia N° 0841/2024
          </span>
          <span className="hidden md:inline bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-300 font-semibold">
            Certificación GLI-19
          </span>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Crest */}
        <div
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-luxury font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500">
                ROYALPLAY
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono-tech font-bold">
                .AR
              </span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
              Casino & Secure Comms
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
          {[
            { id: 'home', label: 'Lobby Casino', icon: Sparkles },
            { id: 'wallet', label: 'Billetera ARS', icon: Wallet },
            { id: 'promotions', label: 'Promos & Torneos', icon: Trophy },
            { id: 'secure_messages', label: 'Mensajes Cifrados', icon: MessageSquareLock, badge: 'AES-256' },
            { id: 'responsible_gaming', label: 'Juego Responsable', icon: HeartHandshake },
            { id: 'database_schema', label: 'Arquitectura DB', icon: Database },
            { id: 'drive', label: 'Google Drive', icon: HardDrive, badge: 'Drive' },
            { id: 'plans', label: 'Planes B2B', icon: Layers },
          ].map(item => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                  active
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono-tech">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Wallet Balance, Player Profile, Sound */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Balance Card */}
          <div
            onClick={() => navigateTo('wallet')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition shadow-inner"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                Saldo Real
              </div>
              <div className="font-mono-tech font-bold text-xs sm:text-sm text-emerald-400">
                ${wallet.realBalance.toLocaleString('es-AR')} <span className="text-[10px]">ARS</span>
              </div>
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                navigateTo('wallet');
              }}
              className="ml-1 hidden sm:flex px-2 py-0.5 rounded bg-amber-500 text-black font-bold text-[10px] hover:bg-amber-400 transition"
            >
              + Cargar
            </button>
          </div>

          {/* Session Timer (Reality Check) */}
          <div
            onClick={() => navigateTo('responsible_gaming')}
            className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 font-mono-tech px-2 py-1 rounded bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700"
            title="Tiempo de sesión transcurrido hoy"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{sessionElapsedMinutes}m</span>
          </div>

          {/* Secure Player Profile Badge (Authenticated Read-Only Identity) */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-500/50 text-xs text-slate-200 transition shadow-sm group"
            title="Ver expediente del jugador y seguridad de cuenta"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 text-black font-black text-[10px] flex items-center justify-center shrink-0 shadow-sm">
              {user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="text-left hidden md:block">
              <div className="flex items-center gap-1 font-bold text-[11px] text-slate-200 group-hover:text-amber-300 transition">
                <span>{user.fullName.split(' ')[0]}</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono-tech">
                <span className="text-amber-400 font-bold uppercase">{user.role === 'vip' ? 'VIP ORO' : 'JUGADOR'}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400">KYC +18</span>
              </div>
            </div>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition"
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 lg:hidden text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU (Players Only) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0f1d] border-b border-slate-800 p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {[
              { id: 'home', label: 'Lobby Casino', icon: Sparkles },
              { id: 'wallet', label: 'Billetera ARS', icon: Wallet },
              { id: 'promotions', label: 'Promos & Torneos', icon: Trophy },
              { id: 'secure_messages', label: 'Mensajes Cifrados', icon: MessageSquareLock },
              { id: 'responsible_gaming', label: 'Juego Responsable', icon: HeartHandshake },
              { id: 'database_schema', label: 'Arquitectura DB', icon: Database },
              { id: 'drive', label: 'Google Drive', icon: HardDrive },
              { id: 'plans', label: 'Planes B2B', icon: Layers },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`p-2.5 rounded-lg flex items-center gap-2 ${
                    currentView === item.id ? 'bg-amber-500 text-black font-bold' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Usuario: {user.fullName}</span>
            <span className="font-mono-tech text-amber-400">${wallet.realBalance.toLocaleString('es-AR')} ARS</span>
          </div>
        </div>
      )}

      {/* SECURE PLAYER PROFILE MODAL (READ-ONLY) */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-amber-500/30 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 text-black font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                {user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-luxury font-black text-lg text-white">
                    {user.fullName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono-tech font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>VERIFICADO</span>
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono-tech">
                  ID: {user.id} • Residencia: CABA, Argentina
                </span>
              </div>
            </div>

            {/* Read-Only Legal & Account Credentials */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono-tech">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">Documento DNI</span>
                <span className="text-white font-bold text-sm">{user.dni}</span>
                <span className="text-[10px] text-emerald-400 block">+18 Años Validado</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">Nivel de Cuenta</span>
                <span className="text-amber-400 font-bold text-sm uppercase">
                  {user.role === 'vip' ? 'Jugador VIP Oro' : 'Jugador Estándar'}
                </span>
                <span className="text-[10px] text-slate-400 block">Asignado por Operador</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">Teléfono Móvil</span>
                <span className="text-slate-200 font-bold">{user.phone}</span>
                <span className="text-[10px] text-emerald-400 block">Opt-In WhatsApp Activo</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">Seguridad 2FA</span>
                <span className="text-emerald-400 font-bold">Activo (Biometría / OTP)</span>
                <span className="text-[10px] text-slate-400 block">Cifrado TLS 1.3</span>
              </div>
            </div>

            {/* Regulatory Notice on Fixed Roles */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Aviso de Seguridad Regulatoria:</strong> La asignación de roles, verificación de identidad (+18) y límites de depósito están regulados por la normativa de juegos de azar de LOTBA y el equipo de Cumplimiento de RoyalPlay. Los jugadores no tienen autorización para modificar sus privilegios o roles de forma unilateral.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setProfileModalOpen(false);
                  navigateTo('wallet');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
              >
                Ver Billetera ARS
              </button>

              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
