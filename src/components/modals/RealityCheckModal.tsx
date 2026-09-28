import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, ShieldAlert, HeartHandshake, LogOut, CheckCircle } from 'lucide-react';

export const RealityCheckModal: React.FC = () => {
  const {
    showRealityCheckAlert,
    dismissRealityCheck,
    sessionElapsedMinutes,
    wallet,
    applyCoolingOff,
    setCurrentView,
  } = useApp();

  if (!showRealityCheckAlert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0c1220] border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center gold-glow">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mx-auto">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono-tech uppercase tracking-widest text-amber-400 font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Recordatorio de Realidad (+18)
          </span>
          <h3 className="text-xl sm:text-2xl font-black font-serif-luxury text-white">
            Control de Tiempo de Juego
          </h3>
          <p className="text-xs text-slate-300">
            Has estado jugando activamente durante <strong className="text-amber-300">{sessionElapsedMinutes} minutos</strong> continuos.
          </p>
        </div>

        {/* Balance Status */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono-tech flex items-center justify-between">
          <span className="text-slate-400">Saldo Disponible:</span>
          <span className="font-bold text-emerald-400 text-sm">
            ${wallet.realBalance.toLocaleString('es-AR')} ARS
          </span>
        </div>

        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-[11px] text-rose-300 text-left">
          <ShieldAlert className="w-4 h-4 inline mr-1 text-rose-400" />
          <strong>El jugar compulsivamente es perjudicial para la salud.</strong> Si sientes que el juego está
          afectando tu bienestar, puedes activar una pausa o autoexclusión.
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => {
              dismissRealityCheck();
              applyCoolingOff(24);
              setCurrentView('responsible_gaming');
            }}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition border border-slate-700"
          >
            TOMAR UNA PAUSA DE 24 HORAS
          </button>

          <button
            onClick={dismissRealityCheck}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold font-serif-luxury text-xs tracking-wider transition gold-glow"
          >
            CONTINUAR JUGANDO CON MODERACIÓN
          </button>
        </div>
      </div>
    </div>
  );
};
