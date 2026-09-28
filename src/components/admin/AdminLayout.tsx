import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminPanelView } from '../views/AdminPanelView';
import {
  ShieldCheck,
  LogOut,
  ExternalLink,
  Lock,
  Building,
  Radio,
  FileCheck2,
  Clock,
  KeyRound,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

interface AdminLayoutProps {
  onExitToPlayerArea: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onExitToPlayerArea }) => {
  const { adminSession, logoutAdmin } = useApp();

  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(900); // 15 minutes
  const [isTerminalLocked, setIsTerminalLocked] = useState(false);
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Inactivity / Session countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSecondsLeft(prev => {
        if (prev <= 1) {
          setIsTerminalLocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRenewSession = () => {
    setSessionSecondsLeft(900);
  };

  const handleUnlockTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    // Accepts operator PIN 2026 or their passwords
    if (unlockPin === '2026' || unlockPin === 'RoyalAdmin2026!' || unlockPin === 'Compliance2026!') {
      setIsTerminalLocked(false);
      setUnlockPin('');
      setSessionSecondsLeft(900);
    } else {
      setUnlockError('PIN o Clave de seguridad incorrecta (PIN Maestro: 2026)');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    onExitToPlayerArea();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white relative">
      {/* TERMINAL LOCK SCREEN OVERLAY */}
      {isTerminalLocked && (
        <div className="fixed inset-0 z-[100] bg-[#04060dbf] backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-rose-500/50 rounded-3xl max-w-sm w-full p-6 sm:p-8 space-y-5 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold font-serif-luxury text-rose-200">
                Terminal Administrativa Bloqueada
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                La sesión de <strong className="text-white">{adminSession?.fullName}</strong> se encuentra en pausa preventiva por seguridad.
              </p>
            </div>

            {unlockError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{unlockError}</span>
              </div>
            )}

            <form onSubmit={handleUnlockTerminal} className="space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-mono-tech text-slate-400 block">
                  Ingrese PIN de desbloqueo o Contraseña:
                </label>
                <input
                  type="password"
                  value={unlockPin}
                  onChange={e => setUnlockPin(e.target.value)}
                  placeholder="PIN: 2026"
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono-tech text-center tracking-widest font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-rose-950/50"
              >
                Desbloquear Consola
              </button>
            </form>

            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-rose-400 transition"
            >
              Cerrar sesión completamente y salir
            </button>
          </div>
        </div>
      )}

      {/* EXCLUSIVE ADMIN TOP BAR (Completely separated from Player Area) */}
      <header className="sticky top-0 z-50 bg-[#080d1a]/95 backdrop-blur-md border-b border-rose-500/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Admin Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-red-600 to-rose-900 flex items-center justify-center shadow-lg shadow-rose-950/40 text-white shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury font-black text-lg tracking-wider text-rose-100">
                  ROYALPLAY
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-mono-tech font-bold uppercase">
                  Área de Administración
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono-tech">
                Enlace Regulatorio LOTBA / IPLyC • Jurisdicción Argentina
              </span>
            </div>
          </div>

          {/* Admin Session Security Bar & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Session Security Timer */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono-tech text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sesión: <strong className="text-amber-300">{formatTimer(sessionSecondsLeft)}</strong></span>
              <button
                onClick={handleRenewSession}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 ml-1 underline"
                title="Renovar 15 minutos adicionales"
              >
                Renovar
              </button>
            </div>

            {/* Operator Information Badge */}
            {adminSession && (
              <div className="hidden md:flex flex-col items-end text-right px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200">
                    {adminSession.fullName}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono-tech font-bold uppercase ${
                      adminSession.role === 'admin'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {adminSession.role === 'admin' ? 'SUPERADMIN' : 'OFICIAL LOTBA'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono-tech">
                  {adminSession.email}
                </span>
              </div>
            )}

            {/* Lock Screen Button */}
            <button
              onClick={() => setIsTerminalLocked(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Bloquear pantalla de la terminal por seguridad"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Bloquear</span>
            </button>

            {/* Quick Link to Return / View Player Area */}
            <button
              onClick={onExitToPlayerArea}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Volver a la vista del sitio público para jugadores"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Sitio Público</span>
            </button>

            {/* Logout Admin Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition shadow-sm"
              title="Finalizar sesión administrativa"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <AdminPanelView />
      </main>

      {/* Admin Regulatory Footer */}
      <footer className="bg-[#04060c] border-t border-slate-900 py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            RoyalPlay Management Console • Auditoría y Cumplimiento Ley 25.326 • Normativa LOTBA
          </span>
          <span className="font-mono-tech text-[11px] text-slate-400">
            Conexión Segura Encriptada TLS 1.3 • Registro Inmutable Activo
          </span>
        </div>
      </footer>
    </div>
  );
};

