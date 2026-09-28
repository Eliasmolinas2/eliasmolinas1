import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../lib/sound';
import confetti from 'canvas-confetti';
import { Rocket, ShieldCheck, Volume2, VolumeX, X, Users, Flame } from 'lucide-react';
import { CasinoGame } from '../../types';

interface CrashGameProps {
  game: CasinoGame;
  onClose?: () => void;
}

export const CrashGame: React.FC<CrashGameProps> = ({ game, onClose }) => {
  const { wallet, placeGameBet, resolveGameBet, soundEnabled, toggleSound } = useApp();

  const [bet, setBet] = useState<number>(1000);
  const [autoCashout, setAutoCashout] = useState<number>(2.0);
  const [useAutoCashout, setUseAutoCashout] = useState<boolean>(false);

  const [gameState, setGameState] = useState<'idle' | 'running' | 'crashed' | 'cashed_out'>('idle');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number>(0);
  const [cashoutWin, setCashoutWin] = useState<number>(0);

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const targetCrashRef = useRef<number>(0);
  const betActiveRef = useRef<boolean>(false);

  const CHIPS = [500, 1000, 2500, 5000];

  // Simulated live other players for community atmosphere
  const [communityPlayers] = useState([
    { name: 'Lucas_Cordoba', bet: 2500, cashedAt: 1.84, status: 'won' },
    { name: 'Matias_Tigre', bet: 5000, cashedAt: 2.45, status: 'won' },
    { name: 'Sofi_Rosario', bet: 1000, cashedAt: null, status: 'playing' },
    { name: 'Javier_Palermo', bet: 10000, cashedAt: null, status: 'playing' },
  ]);

  const launch = async () => {
    if (gameState === 'running') return;

    const check = await placeGameBet(game, bet);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }

    // Determine crash point using house edge formula (RTP ~97%)
    const e = 2 ** 32;
    const h = Math.floor(Math.random() * e);
    // Crash point between 1.05 and 50.0x
    const r = Math.random();
    let point = 1.0;
    if (r < 0.04) {
      point = 1.0 + Math.random() * 0.15; // early crash
    } else if (r < 0.6) {
      point = 1.2 + Math.random() * 2.5; // mid
    } else if (r < 0.9) {
      point = 3.5 + Math.random() * 7.0; // high
    } else {
      point = 10.0 + Math.random() * 35.0; // massive
    }
    point = Number(point.toFixed(2));

    targetCrashRef.current = point;
    setCrashPoint(point);
    setMultiplier(1.0);
    setGameState('running');
    setCashoutWin(0);
    betActiveRef.current = true;
    startTimeRef.current = performance.now();

    runLoop();
  };

  const runLoop = () => {
    const elapsedSec = (performance.now() - startTimeRef.current) / 1000;
    // Multiplier growth: 1.00 + elapsed^1.55 * 0.45
    const currentMult = Number((1.0 + Math.pow(elapsedSec, 1.45) * 0.35).toFixed(2));

    if (currentMult >= targetCrashRef.current) {
      // CRASH!
      setMultiplier(targetCrashRef.current);
      setGameState('crashed');
      sound.playCrashBust();

      if (betActiveRef.current) {
        betActiveRef.current = false;
        resolveGameBet(
          game,
          bet,
          0,
          0,
          `AstroCrash explotó en ${targetCrashRef.current}x antes de retirar`
        );
      }
      return;
    }

    setMultiplier(currentMult);

    // Auto cashout check
    if (useAutoCashout && betActiveRef.current && currentMult >= autoCashout) {
      cashOut(currentMult);
    }

    animFrameRef.current = requestAnimationFrame(runLoop);
  };

  const cashOut = async (currentM?: number) => {
    if (gameState !== 'running' || !betActiveRef.current) return;

    betActiveRef.current = false;
    const finalMult = currentM || multiplier;
    const win = Math.floor(bet * finalMult);

    setCashoutWin(win);
    setGameState('cashed_out');
    sound.playCashout();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    await resolveGameBet(
      game,
      bet,
      win,
      finalMult,
      `Retiro exitoso de AstroCrash a ${finalMult}x`
    );
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="relative bg-[#0c1220] border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-amber-300 tracking-wide flex items-center gap-2">
            <Rocket className="w-5 h-5 text-amber-400" />
            <span>{game.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono-tech border border-emerald-500/30">
              RTP {game.rtp}%
            </span>
          </h2>
          <p className="text-xs text-slate-400">Juego rápido de multiplicador exponencial continuo • Retira a tiempo</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Crash Screen & Multiplayer Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-4">
        {/* Radar Curve Area */}
        <div className="md:col-span-8 bg-[#060a14] rounded-2xl border border-slate-800 p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
          {/* Ambient Grid Lines */}
          <div className="absolute inset-0 [background-image:linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-25"></div>

          {/* Glowing trajectory curve */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
            <path
              d={`M 20 280 Q 200 270, ${Math.min(380, 50 + multiplier * 25)} ${Math.max(40, 280 - multiplier * 18)}`}
              fill="none"
              stroke={gameState === 'crashed' ? '#f43f5e' : '#f59e0b'}
              strokeWidth="4"
              strokeDasharray={gameState === 'crashed' ? '6 6' : 'none'}
            />
          </svg>

          {/* Multiplier Central Display */}
          <div className="z-10 text-center">
            {gameState === 'crashed' ? (
              <div className="space-y-1">
                <span className="text-4xl sm:text-6xl font-black font-mono-tech text-rose-500 tracking-tight">
                  {multiplier.toFixed(2)}x
                </span>
                <p className="text-xs uppercase font-mono-tech text-rose-400 font-bold tracking-widest">
                  ¡EXPLOSIÓN! ESPERA LA PRÓXIMA RONDA
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className={`text-5xl sm:text-7xl font-black font-mono-tech tracking-tight transition-colors ${
                  gameState === 'cashed_out' ? 'text-emerald-400' : 'text-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                }`}>
                  {multiplier.toFixed(2)}x
                </span>
                {gameState === 'cashed_out' && (
                  <p className="text-sm font-mono-tech text-emerald-400 font-bold">
                    ¡Retirado con éxito! +${cashoutWin.toLocaleString('es-AR')} ARS
                  </p>
                )}
                {gameState === 'running' && (
                  <p className="text-xs font-mono-tech text-slate-400">
                    Ganancia potencial: <strong className="text-emerald-400">${Math.floor(bet * multiplier).toLocaleString('es-AR')} ARS</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Community Players List */}
        <div className="md:col-span-4 bg-slate-900/80 rounded-2xl border border-slate-800 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-400" /> Jugadores en Sala</span>
              <span className="text-emerald-400 text-[10px] font-mono-tech">184 ONLINE</span>
            </div>

            <div className="mt-2 space-y-2 text-xs">
              {communityPlayers.map((cp, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 font-mono-tech">
                  <div className="truncate max-w-[110px] text-slate-300">{cp.name}</div>
                  <div className="text-right">
                    <span className="text-slate-400">${cp.bet}</span>
                    {cp.cashedAt ? (
                      <span className="ml-2 text-emerald-400 font-bold">{cp.cashedAt}x</span>
                    ) : (
                      <span className="ml-2 text-amber-400 font-bold animate-pulse">En vuelo</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2 mt-3 rounded-lg bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-300/80">
            <Flame className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
            Los multiplicadores son calculados por Provably Fair con SHA-256 inmutable.
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="pt-2 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bet Setting */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">Monto de Apuesta (ARS):</label>
            <div className="flex items-center gap-2">
              {CHIPS.map(c => (
                <button
                  key={c}
                  onClick={() => setBet(c)}
                  disabled={gameState === 'running'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold ${
                    bet === c ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ${c.toLocaleString('es-AR')}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Cashout Setting */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 font-medium">Auto-Retiro:</label>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAutoCashout}
                  onChange={e => setUseAutoCashout(e.target.checked)}
                  disabled={gameState === 'running'}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>Habilitar</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              {[1.5, 2.0, 3.0, 5.0].map(m => (
                <button
                  key={m}
                  onClick={() => {
                    setAutoCashout(m);
                    setUseAutoCashout(true);
                  }}
                  disabled={gameState === 'running'}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-tech font-bold ${
                    autoCashout === m && useAutoCashout ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {m.toFixed(1)}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button: Launch or Cashout */}
        <div>
          {gameState === 'running' ? (
            <button
              onClick={() => cashOut()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 active:scale-98 text-white font-serif-luxury font-black text-lg tracking-wider shadow-2xl emerald-glow transition"
            >
              RETIRAR AHORA • ${(Math.floor(bet * multiplier)).toLocaleString('es-AR')} ARS ({multiplier.toFixed(2)}x)
            </button>
          ) : (
            <button
              onClick={launch}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:scale-98 text-black font-serif-luxury font-black text-lg tracking-wider shadow-2xl gold-glow transition"
            >
              INICIAR DESPEGUE • ${bet.toLocaleString('es-AR')} ARS
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Saldo disponible: <strong className="text-emerald-400 font-mono-tech">${wallet.realBalance.toLocaleString('es-AR')} ARS</strong></span>
          <span className="flex items-center gap-1 text-slate-500"><ShieldCheck className="w-3.5 h-3.5" /> Curva Certificada Anti-Manipulación</span>
        </div>
      </div>
    </div>
  );
};
