import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../lib/sound';
import confetti from 'canvas-confetti';
import { ShieldCheck, RotateCcw, Volume2, VolumeX, X, Trophy } from 'lucide-react';
import { CasinoGame } from '../../types';

interface RouletteGameProps {
  game: CasinoGame;
  onClose?: () => void;
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

interface BetPlacements {
  [key: string]: number; // key: '0', '1', 'red', 'black', 'even', 'odd', '1-18', '19-36', '1st12', '2nd12', '3rd12'
}

export const RouletteGame: React.FC<RouletteGameProps> = ({ game, onClose }) => {
  const { wallet, placeGameBet, resolveGameBet, soundEnabled, toggleSound } = useApp();

  const [activeChip, setActiveChip] = useState<number>(1000);
  const [bets, setBets] = useState<BetPlacements>({});
  const [spinning, setSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number>(0);
  const [winMessage, setWinMessage] = useState<string>('');
  const [history, setHistory] = useState<number[]>([17, 32, 0, 7, 24, 11]);

  const CHIPS = [500, 1000, 5000, 25000];

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const placeBetOnKey = (key: string) => {
    if (spinning) return;
    sound.playChip();
    setBets(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + activeChip,
    }));
  };

  const clearBets = () => {
    if (spinning) return;
    setBets({});
  };

  const spin = async () => {
    if (spinning) return;
    if (totalBet <= 0) {
      alert('Coloca al menos una ficha en el paño para girar la ruleta.');
      return;
    }

    const check = await placeGameBet(game, totalBet);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }

    setSpinning(true);
    setLastWin(0);
    setWinMessage('');
    setWinningNumber(null);

    // Pick target winning number randomly (0 - 36)
    const target = Math.floor(Math.random() * 37);

    // Find angle on wheel
    const indexInWheel = WHEEL_ORDER.indexOf(target);
    const sectorAngle = 360 / 37;
    // Add 5 full rotations (1800 deg) plus offset
    const randomRotations = 360 * 6;
    const finalAngle = randomRotations + (360 - indexInWheel * sectorAngle);

    setWheelRotation(prev => prev + finalAngle);

    // Sound effect ticks
    const tickInterval = setInterval(() => {
      sound.playReelTick();
    }, 120);

    setTimeout(async () => {
      clearInterval(tickInterval);
      setSpinning(false);
      setWinningNumber(target);
      setHistory(prev => [target, ...prev.slice(0, 7)]);

      // Calculate payouts
      let totalWon = 0;
      const isRed = RED_NUMBERS.includes(target);
      const isBlack = target !== 0 && !isRed;
      const isEven = target !== 0 && target % 2 === 0;
      const isOdd = target !== 0 && target % 2 !== 0;

      // Straight number (pays 35:1 + original = 36x)
      if (bets[target.toString()]) {
        totalWon += bets[target.toString()] * 36;
      }
      // Red / Black (pays 1:1 = 2x)
      if (isRed && bets['red']) totalWon += bets['red'] * 2;
      if (isBlack && bets['black']) totalWon += bets['black'] * 2;
      // Even / Odd
      if (isEven && bets['even']) totalWon += bets['even'] * 2;
      if (isOdd && bets['odd']) totalWon += bets['odd'] * 2;
      // 1-18 / 19-36
      if (target >= 1 && target <= 18 && bets['1-18']) totalWon += bets['1-18'] * 2;
      if (target >= 19 && target <= 36 && bets['19-36']) totalWon += bets['19-36'] * 2;
      // Dozens (pays 2:1 = 3x)
      if (target >= 1 && target <= 12 && bets['1st12']) totalWon += bets['1st12'] * 3;
      if (target >= 13 && target <= 24 && bets['2nd12']) totalWon += bets['2nd12'] * 3;
      if (target >= 25 && target <= 36 && bets['3rd12']) totalWon += bets['3rd12'] * 3;

      const multiplier = totalBet > 0 ? Number((totalWon / totalBet).toFixed(2)) : 0;

      if (totalWon > 0) {
        setLastWin(totalWon);
        setWinMessage(`¡Número ganador: ${target} ${target === 0 ? 'Verde' : isRed ? 'Rojo' : 'Negro'}!`);
        sound.playWin();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } else {
        setWinMessage(`Salió el número ${target}. ¡Prueba tu suerte en la siguiente tirada!`);
      }

      await resolveGameBet(
        game,
        totalBet,
        totalWon,
        multiplier,
        `Ruleta bola cayó en: ${target} (${target === 0 ? 'Cero Verde' : isRed ? 'Rojo' : 'Negro'})`
      );
    }, 3200);
  };

  const getNumberColor = (num: number) => {
    if (num === 0) return 'bg-emerald-600 text-white';
    return RED_NUMBERS.includes(num) ? 'bg-rose-700 text-white' : 'bg-slate-900 text-white';
  };

  return (
    <div className="relative bg-[#0c1220] border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-amber-300 tracking-wide flex items-center gap-2">
            <span>{game.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono-tech border border-emerald-500/30">
              RTP {game.rtp}%
            </span>
          </h2>
          <p className="text-xs text-slate-400">Ruleta Europea 37 casillas (0 al 36) • Cero Único</p>
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

      {/* History and Live Result Bar */}
      <div className="my-3 flex items-center justify-between gap-2 overflow-x-auto py-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="font-semibold uppercase text-slate-500 text-[10px]">Historial:</span>
          {history.map((h, i) => (
            <span
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${getNumberColor(
                h
              )} shadow`}
            >
              {h}
            </span>
          ))}
        </div>

        {winningNumber !== null && (
          <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-xl border border-amber-500/40 text-amber-300 text-xs font-mono-tech font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>ÚLTIMO: {winningNumber}</span>
          </div>
        )}
      </div>

      {/* Center Wheel Animation & Felt Board */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Animated Wheel */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-[#080d17] rounded-xl border border-slate-800">
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full border-4 border-amber-600/60 p-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-gradient-to-tr from-amber-950 via-slate-900 to-amber-950 flex items-center justify-center">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-5 bg-amber-400 [clip-path:polygon(50%_100%,0_0,100%_0)] z-20 shadow-md"></div>

            {/* Rotating Rotor */}
            <div
              className="w-full h-full rounded-full border-2 border-amber-500/40 flex items-center justify-center transition-transform duration-[3200ms] ease-out relative"
              style={{ transform: `rotate(${wheelRotation}deg)` }}
            >
              <div className="absolute inset-0 rounded-full border-[10px] border-slate-800 opacity-60"></div>
              {/* Center brass hub */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 flex items-center justify-center shadow-inner text-[10px] font-black font-serif-luxury text-black">
                ROYAL
              </div>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[11px] text-slate-400">
              {spinning ? 'Girando la bola...' : winningNumber !== null ? `Bola en ${winningNumber}` : 'Listo para apostar'}
            </span>
          </div>
        </div>

        {/* Betting Board Grid */}
        <div className="md:col-span-8 bg-[#092214] p-3 rounded-xl border-2 border-emerald-600/40 shadow-[inset_0_0_25px_rgba(0,0,0,0.7)]">
          {/* Numbers Grid */}
          <div className="flex gap-1">
            {/* 0 (Green) */}
            <button
              onClick={() => placeBetOnKey('0')}
              disabled={spinning}
              className="w-10 sm:w-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded flex flex-col items-center justify-center relative transition"
            >
              <span>0</span>
              {bets['0'] && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[9px] font-bold px-1 rounded-full">
                  ${bets['0']}
                </span>
              )}
            </button>

            {/* 1 to 36 */}
            <div className="grid grid-cols-12 gap-1 flex-1">
              {[
                [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
                [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
                [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
              ].map((row, rIdx) => (
                <React.Fragment key={rIdx}>
                  {row.map(num => {
                    const isRed = RED_NUMBERS.includes(num);
                    const bVal = bets[num.toString()];
                    return (
                      <button
                        key={num}
                        onClick={() => placeBetOnKey(num.toString())}
                        disabled={spinning}
                        className={`h-9 sm:h-11 rounded font-bold text-xs flex flex-col items-center justify-center relative transition select-none ${
                          isRed
                            ? 'bg-rose-700 hover:bg-rose-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700'
                        }`}
                      >
                        <span>{num}</span>
                        {bVal && (
                          <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black font-mono-tech text-[8px] font-bold px-1 rounded-full shadow">
                            ${bVal >= 1000 ? `${bVal / 1000}k` : bVal}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Dozens */}
          <div className="grid grid-cols-3 gap-1 mt-1 pl-10 sm:pl-12">
            {[
              { id: '1st12', label: '1ra DOCENA (1-12)' },
              { id: '2nd12', label: '2da DOCENA (13-24)' },
              { id: '3rd12', label: '3ra DOCENA (25-36)' },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => placeBetOnKey(d.id)}
                disabled={spinning}
                className="py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[10px] font-bold rounded border border-emerald-700/50 relative"
              >
                <span>{d.label} (2:1)</span>
                {bets[d.id] && (
                  <span className="absolute -top-1 right-1 bg-amber-400 text-black font-bold text-[8px] px-1 rounded-full">
                    ${bets[d.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Outside Bets (1-18, Even, Red, Black, Odd, 19-36) */}
          <div className="grid grid-cols-6 gap-1 mt-1 pl-10 sm:pl-12 text-[10px] font-bold">
            <button
              onClick={() => placeBetOnKey('1-18')}
              disabled={spinning}
              className="py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 rounded border border-emerald-700/40 relative"
            >
              1-18 {bets['1-18'] && `($${bets['1-18']})`}
            </button>
            <button
              onClick={() => placeBetOnKey('even')}
              disabled={spinning}
              className="py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 rounded border border-emerald-700/40 relative"
            >
              PAR {bets['even'] && `($${bets['even']})`}
            </button>
            <button
              onClick={() => placeBetOnKey('red')}
              disabled={spinning}
              className="py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded border border-rose-500/50 relative flex items-center justify-center gap-1"
            >
              <span className="w-2 h-2 rounded-full bg-white"></span>
              ROJO {bets['red'] && `($${bets['red']})`}
            </button>
            <button
              onClick={() => placeBetOnKey('black')}
              disabled={spinning}
              className="py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded border border-slate-700 relative flex items-center justify-center gap-1"
            >
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              NEGRO {bets['black'] && `($${bets['black']})`}
            </button>
            <button
              onClick={() => placeBetOnKey('odd')}
              disabled={spinning}
              className="py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 rounded border border-emerald-700/40 relative"
            >
              IMPAR {bets['odd'] && `($${bets['odd']})`}
            </button>
            <button
              onClick={() => placeBetOnKey('19-36')}
              disabled={spinning}
              className="py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 rounded border border-emerald-700/40 relative"
            >
              19-36 {bets['19-36'] && `($${bets['19-36']})`}
            </button>
          </div>
        </div>
      </div>

      {/* Win Banner */}
      {winMessage && !spinning && (
        <div className={`mt-3 p-2.5 rounded-xl text-center text-xs font-bold ${lastWin > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800/80 text-slate-300'}`}>
          <span>{winMessage}</span>
          {lastWin > 0 && <span className="ml-2 font-mono-tech font-black text-amber-400 text-sm">+${lastWin.toLocaleString('es-AR')} ARS</span>}
        </div>
      )}

      {/* Footer Controls: Chip selectors, Total, Spin */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Chip Denominations */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Ficha:</span>
          {CHIPS.map(c => (
            <button
              key={c}
              onClick={() => setActiveChip(c)}
              disabled={spinning}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full font-mono-tech text-[10px] sm:text-xs font-black border-2 transition-transform ${
                activeChip === c
                  ? 'border-amber-400 scale-110 shadow-lg shadow-amber-500/40 bg-gradient-to-br from-amber-400 to-yellow-600 text-black'
                  : 'border-slate-600 bg-slate-800 text-slate-300 hover:scale-105'
              }`}
            >
              ${c >= 1000 ? `${c / 1000}k` : c}
            </button>
          ))}
        </div>

        {/* Clear & Total Bet */}
        <div className="flex items-center gap-3">
          <button
            onClick={clearBets}
            disabled={spinning || totalBet === 0}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Apuesta Total</span>
            <span className="text-amber-400 font-mono-tech font-bold text-sm">
              ${totalBet.toLocaleString('es-AR')} ARS
            </span>
          </div>

          <button
            onClick={spin}
            disabled={spinning || totalBet === 0}
            className={`px-6 py-2.5 rounded-xl font-serif-luxury font-black text-sm tracking-wider shadow-lg transition ${
              spinning || totalBet === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110 active:scale-95 gold-glow'
            }`}
          >
            {spinning ? 'GIRANDO...' : 'GIRAR BOLA'}
          </button>
        </div>
      </div>
    </div>
  );
};
