import React from 'react';
import { useApp } from '../../context/AppContext';
import { SlotMachine } from './SlotMachine';
import { RouletteGame } from './RouletteGame';
import { BlackjackGame } from './BlackjackGame';
import { CrashGame } from './CrashGame';
import { X, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { CasinoGame } from '../../types';

interface GameLauncherModalProps {
  game: CasinoGame;
  onClose: () => void;
}

export const GameLauncherModal: React.FC<GameLauncherModalProps> = ({ game, onClose }) => {
  const { wallet } = useApp();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto">
        {game.slug === 'royal-slots-777' && (
          <SlotMachine game={game} onClose={onClose} />
        )}

        {game.slug === 'ruleta-argentina' && (
          <RouletteGame game={game} onClose={onClose} />
        )}

        {game.slug === 'blackjack-royal-21' && (
          <BlackjackGame game={game} onClose={onClose} />
        )}

        {game.slug === 'astrocrash-aviator' && (
          <CrashGame game={game} onClose={onClose} />
        )}

        {/* Third-party Aggregator Provider Mock Frame */}
        {game.provider !== 'RoyalPlay Originals' && (
          <div className="bg-[#0c1220] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl">
                  🎰
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-300 font-serif-luxury">
                    {game.title}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Proveedor: <strong>{game.provider}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono-tech">RTP {game.rtp}%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seamless Wallet Bridge Simulator */}
            <div className="relative rounded-2xl bg-[#060a14] border-2 border-slate-800 p-8 text-center space-y-4 min-h-[340px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
                🎮
              </div>

              <div className="space-y-1 max-w-md">
                <span className="text-xs uppercase font-mono-tech text-cyan-400 font-bold tracking-wider">
                  Seamless Wallet Bridge Activo
                </span>
                <h4 className="text-lg font-bold text-white">
                  Conexión con Servidor Oficial de {game.provider}
                </h4>
                <p className="text-xs text-slate-400">
                  La sesión de juego se autentica automáticamente con el token de usuario de RoyalPlay,
                  conectando el saldo de tu billetera en Pesos (ARS).
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono-tech text-slate-300 flex items-center gap-4">
                <span>Saldo Vinculado: <strong className="text-emerald-400">${wallet.realBalance.toLocaleString('es-AR')} ARS</strong></span>
                <span>•</span>
                <span className="text-amber-400">Modo Demo Regulado</span>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>RNG Certificado por GLI (Gaming Laboratories International)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
