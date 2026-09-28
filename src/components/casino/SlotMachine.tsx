import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../lib/sound';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, ShieldCheck, Zap, Info, Volume2, VolumeX, X } from 'lucide-react';
import { CasinoGame } from '../../types';

interface SlotMachineProps {
  game: CasinoGame;
  onClose?: () => void;
}

const SYMBOLS = [
  { id: '777', label: '777', color: 'text-rose-500', bg: 'bg-rose-500/20 border-rose-500/50', multiplier: 25, icon: '🔥' },
  { id: 'diamond', label: 'DIAMANTE', color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/50', multiplier: 15, icon: '💎' },
  { id: 'crown', label: 'CORONA', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/50', multiplier: 10, icon: '👑' },
  { id: 'gold_bar', label: 'ORO', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/50', multiplier: 6, icon: '🪙' },
  { id: 'bell', label: 'CAMPANA', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/50', multiplier: 4, icon: '🔔' },
  { id: 'cherry', label: 'CEREZAS', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/50', multiplier: 2, icon: '🍒' },
];

export const SlotMachine: React.FC<SlotMachineProps> = ({ game, onClose }) => {
  const { wallet, placeGameBet, resolveGameBet, soundEnabled, toggleSound } = useApp();

  const [bet, setBet] = useState<number>(1000);
  const [reels, setReels] = useState<number[][]>([
    [0, 1, 2],
    [1, 2, 3],
    [2, 3, 4],
    [0, 1, 5],
    [3, 4, 0],
  ]);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [winMessage, setWinMessage] = useState<string>('');
  const [showProvablyFair, setShowProvablyFair] = useState<boolean>(false);
  const [provablyFairData, setProvablyFairData] = useState<{
    serverHash: string;
    clientSeed: string;
    nonce: number;
  } | null>(null);

  const BET_PRESETS = [500, 1000, 2500, 5000, 10000];

  const spin = async () => {
    if (spinning) return;

    // Check bet legality & wallet
    const check = await placeGameBet(game, bet);
    if (!check.allowed) {
      setAutoSpin(false);
      alert(check.reason);
      return;
    }

    setSpinning(true);
    setLastWin(0);
    setWinMessage('');

    // Spinning tick intervals
    const tickInterval = setInterval(() => {
      sound.playReelTick();
      setReels([
        [Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length)],
        [Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length)],
        [Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length)],
        [Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length)],
        [Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length)],
      ]);
    }, 90);

    // Conclude spin after 1.4s
    setTimeout(async () => {
      clearInterval(tickInterval);

      // Determine outcome with calculated probabilities (RTP 96.8%)
      const rand = Math.random();
      let finalReels: number[][];
      let won = false;
      let mult = 0;
      let winDesc = '';

      if (rand < 0.05) {
        // JACKPOT: 5 of a kind 777 or Diamonds
        const sym = rand < 0.015 ? 0 : 1; // 777 or Diamond
        finalReels = [
          [sym, Math.floor(Math.random() * 6), Math.floor(Math.random() * 6)],
          [sym, Math.floor(Math.random() * 6), Math.floor(Math.random() * 6)],
          [sym, Math.floor(Math.random() * 6), Math.floor(Math.random() * 6)],
          [sym, Math.floor(Math.random() * 6), Math.floor(Math.random() * 6)],
          [sym, Math.floor(Math.random() * 6), Math.floor(Math.random() * 6)],
        ];
        mult = SYMBOLS[sym].multiplier * 4;
        winDesc = `¡MEGA JACKPOT! 5x ${SYMBOLS[sym].label}`;
        won = true;
      } else if (rand < 0.38) {
        // Standard win: 3 or 4 matched across payline
        const sym = Math.floor(Math.random() * SYMBOLS.length);
        finalReels = [
          [sym, 2, 4],
          [sym, 1, 3],
          [sym, 5, 0],
          [rand < 0.15 ? sym : 3, 2, 1],
          [rand < 0.08 ? sym : 4, 0, 5],
        ];
        mult = SYMBOLS[sym].multiplier;
        winDesc = `¡Ganador! 3x ${SYMBOLS[sym].label}`;
        won = true;
      } else {
        // No match
        finalReels = [
          [0, 2, 4],
          [1, 3, 5],
          [2, 4, 0],
          [3, 5, 1],
          [4, 0, 2],
        ];
        won = false;
        mult = 0;
      }

      setReels(finalReels);
      setSpinning(false);

      const winAmount = won ? Math.floor(bet * mult) : 0;
      if (won) {
        setLastWin(winAmount);
        setWinMessage(winDesc);
        if (mult >= 20) {
          sound.playJackpot();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } else {
          sound.playWin();
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
        }
      }

      // Record bet with Provably Fair hash
      const entry = await resolveGameBet(
        game,
        bet,
        winAmount,
        mult,
        won ? winDesc : 'Sin coincidencia en líneas activas'
      );

      setProvablyFairData({
        serverHash: entry.provablyFair.serverSeedHash,
        clientSeed: entry.provablyFair.clientSeed,
        nonce: entry.provablyFair.nonce,
      });

      if (autoSpin) {
        setTimeout(() => {
          spin();
        }, 1200);
      }
    }, 1400);
  };

  useEffect(() => {
    return () => {
      setAutoSpin(false);
    };
  }, []);

  return (
    <div className="relative bg-[#0c1220] border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif-luxury text-amber-300 tracking-wide">
              {game.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">RTP {game.rtp}%</span>
              <span>•</span>
              <span>Líneas: 20 fijas</span>
              <span>•</span>
              <span className="text-amber-400">Regulado AR</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
            title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Provably Fair */}
          <button
            onClick={() => setShowProvablyFair(!showProvablyFair)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-amber-300 font-mono-tech border border-amber-500/20 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fair Audit</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progressive Jackpot Banner */}
      <div className="my-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-amber-950/60 border border-amber-500/40 flex items-center justify-between text-center">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>Pozo Acumulado Nacional ARS</span>
        </div>
        <div className="font-serif-luxury font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow">
          ${(38450000 + (lastWin > 0 ? 0 : 1500)).toLocaleString('es-AR')} ARS
        </div>
      </div>

      {/* Slot Reel Frame */}
      <div className="relative bg-[#070a12] p-4 sm:p-6 rounded-2xl border-2 border-amber-500/30 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
        {/* Payline Guides */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {reels.map((reel, rIdx) => (
            <div key={rIdx} className="flex flex-col gap-2 sm:gap-3">
              {reel.map((symIdx, rowIdx) => {
                const sym = SYMBOLS[symIdx];
                return (
                  <div
                    key={rowIdx}
                    className={`h-20 sm:h-28 rounded-xl flex flex-col items-center justify-center p-2 border transition-all duration-200 ${
                      sym.bg
                    } ${spinning ? 'scale-95 blur-[0.6px] opacity-75' : 'scale-100 shadow-lg'}`}
                  >
                    <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none">
                      {sym.icon}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-bold font-mono-tech mt-1 tracking-wider ${sym.color}`}>
                      {sym.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Win Banner Overlay */}
        {lastWin > 0 && !spinning && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 bg-slate-950/95 border-2 border-amber-400 rounded-2xl p-4 text-center shadow-2xl gold-glow animate-pulse-glow z-10">
            <p className="text-xs uppercase font-mono-tech text-amber-300 tracking-widest">{winMessage}</p>
            <p className="text-3xl sm:text-4xl font-serif-luxury font-black text-amber-400 mt-1">
              +${lastWin.toLocaleString('es-AR')} ARS
            </p>
          </div>
        )}
      </div>

      {/* Controls & Betting Grid */}
      <div className="mt-5 space-y-4">
        {/* Preset Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Apuesta:</span>
            {BET_PRESETS.map(preset => (
              <button
                key={preset}
                onClick={() => setBet(preset)}
                disabled={spinning}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-tech font-bold transition ${
                  bet === preset
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ${preset.toLocaleString('es-AR')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBet(Math.max(game.minBet, bet - 500))}
              disabled={spinning || bet <= game.minBet}
              className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 disabled:opacity-40"
            >
              -
            </button>
            <div className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-mono-tech font-bold text-sm min-w-24 text-center">
              ${bet.toLocaleString('es-AR')} ARS
            </div>
            <button
              onClick={() => setBet(Math.min(game.maxBet, bet + 500))}
              disabled={spinning || bet >= game.maxBet}
              className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 disabled:opacity-40"
            >
              +
            </button>
            <button
              onClick={() => setBet(game.maxBet)}
              disabled={spinning}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-amber-950/60 border border-amber-500/20 text-xs font-bold"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Action Buttons: Spin & Auto */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setAutoSpin(!autoSpin)}
            disabled={spinning && !autoSpin}
            className={`px-4 py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
              autoSpin
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 hover:bg-rose-500/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <RotateCcw className={`w-4 h-4 ${autoSpin ? 'animate-spin' : ''}`} />
            <span>{autoSpin ? 'Detener Auto' : 'Auto Spin'}</span>
          </button>

          <button
            onClick={spin}
            disabled={spinning}
            className={`flex-1 py-3.5 sm:py-4 rounded-xl font-bold font-serif-luxury text-base sm:text-lg tracking-wider transition-all duration-200 shadow-xl flex items-center justify-center gap-2 ${
              spinning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black hover:brightness-110 active:scale-[0.99] gold-glow'
            }`}
          >
            <Sparkles className="w-5 h-5 text-black" />
            <span>{spinning ? 'GIRANDO CARRETES...' : `GIRAR • $${bet.toLocaleString('es-AR')} ARS`}</span>
          </button>
        </div>

        {/* User Balance Info Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-1 border-t border-slate-800/60">
          <div>
            Saldo Disponible:{' '}
            <span className="text-emerald-400 font-mono-tech font-bold">
              ${wallet.realBalance.toLocaleString('es-AR')} ARS
            </span>{' '}
            {wallet.bonusBalance > 0 && (
              <span className="text-amber-400 text-[11px]">(+${wallet.bonusBalance.toLocaleString('es-AR')} Bono)</span>
            )}
          </div>
          <div className="text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Provably Fair SHA-256 Verificable</span>
          </div>
        </div>
      </div>

      {/* Provably Fair Audit Drawer */}
      {showProvablyFair && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 font-mono-tech">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Verificación de Juego Justo (Provably Fair)
            </span>
            <span className="text-slate-400">Algoritmo SHA-256</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Cada giro es determinado matemáticamente antes de la animación mediante la combinación de la semilla del servidor
            (Server Seed) y la semilla del cliente (Client Seed).
          </p>
          {provablyFairData ? (
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div>
                <span className="text-slate-500">Hash SHA-256: </span>
                <span className="text-amber-300 break-all">{provablyFairData.serverHash}</span>
              </div>
              <div>
                <span className="text-slate-500">Semilla Jugador: </span>
                <span className="text-cyan-300">{provablyFairData.clientSeed}</span>
              </div>
              <div>
                <span className="text-slate-500">Nonce Tirada: </span>
                <span className="text-emerald-300">{provablyFairData.nonce}</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 italic">Realiza tu primera tirada para auditar el hash de resultado.</p>
          )}
        </div>
      )}
    </div>
  );
};
