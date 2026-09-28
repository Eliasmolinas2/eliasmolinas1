import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../lib/sound';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, X, ShieldCheck } from 'lucide-react';
import { CasinoGame } from '../../types';

interface BlackjackGameProps {
  game: CasinoGame;
  onClose?: () => void;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  weight: number;
}

const SUITS: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];
const VALUES = [
  { val: 'A', weight: 11 },
  { val: '2', weight: 2 },
  { val: '3', weight: 3 },
  { val: '4', weight: 4 },
  { val: '5', weight: 5 },
  { val: '6', weight: 6 },
  { val: '7', weight: 7 },
  { val: '8', weight: 8 },
  { val: '9', weight: 9 },
  { val: '10', weight: 10 },
  { val: 'J', weight: 10 },
  { val: 'Q', weight: 10 },
  { val: 'K', weight: 10 },
];

function drawCard(): Card {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const item = VALUES[Math.floor(Math.random() * VALUES.length)];
  return { suit, value: item.val, weight: item.weight };
}

function calculateHandScore(cards: Card[]): number {
  let score = 0;
  let aces = 0;

  for (const c of cards) {
    score += c.weight;
    if (c.value === 'A') aces += 1;
  }

  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }

  return score;
}

export const BlackjackGame: React.FC<BlackjackGameProps> = ({ game, onClose }) => {
  const { wallet, placeGameBet, resolveGameBet, soundEnabled, toggleSound } = useApp();

  const [bet, setBet] = useState<number>(1000);
  const [gameState, setGameState] = useState<'betting' | 'player_turn' | 'dealer_turn' | 'finished'>('betting');
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [outcomeMessage, setOutcomeMessage] = useState<string>('');
  const [payoutAmount, setPayoutAmount] = useState<number>(0);

  const CHIPS = [500, 1000, 2500, 5000, 10000];

  const playerScore = calculateHandScore(playerCards);
  const dealerScore = calculateHandScore(dealerCards);

  const startRound = async () => {
    if (gameState !== 'betting' && gameState !== 'finished') return;

    const check = await placeGameBet(game, bet);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }

    sound.playCard();
    const p1 = drawCard();
    const d1 = drawCard();
    const p2 = drawCard();
    const d2 = drawCard();

    setPlayerCards([p1, p2]);
    setDealerCards([d1, d2]);
    setPayoutAmount(0);
    setOutcomeMessage('');

    const initialPScore = calculateHandScore([p1, p2]);
    const initialDScore = calculateHandScore([d1, d2]);

    // Check Natural 21 Blackjack
    if (initialPScore === 21) {
      if (initialDScore === 21) {
        // Push
        concludeRound([p1, p2], [d1, d2], 'push', bet, 'Empate de Blackjack Natural 21 (Push)');
      } else {
        // Blackjack 3:2 payout = 2.5x original
        const win = Math.floor(bet * 2.5);
        concludeRound([p1, p2], [d1, d2], 'blackjack', win, '¡BLACKJACK NATURAL 21! Paga 3 a 2');
      }
    } else {
      setGameState('player_turn');
    }
  };

  const hit = () => {
    if (gameState !== 'player_turn') return;
    sound.playCard();
    const newCard = drawCard();
    const newHand = [...playerCards, newCard];
    setPlayerCards(newHand);

    const score = calculateHandScore(newHand);
    if (score > 21) {
      // Player Busts
      concludeRound(newHand, dealerCards, 'bust', 0, '¡Te pasaste de 21! La casa gana.');
    } else if (score === 21) {
      // Auto stand on 21
      stand(newHand);
    }
  };

  const stand = (customPlayerHand?: Card[]) => {
    if (gameState !== 'player_turn') return;
    setGameState('dealer_turn');

    const curPlayer = customPlayerHand || playerCards;
    const pScore = calculateHandScore(curPlayer);

    let curDealer = [...dealerCards];
    let dScore = calculateHandScore(curDealer);

    // Dealer draws to 17 or higher
    while (dScore < 17) {
      curDealer.push(drawCard());
      dScore = calculateHandScore(curDealer);
    }

    setDealerCards(curDealer);

    if (dScore > 21) {
      const win = bet * 2;
      concludeRound(curPlayer, curDealer, 'dealer_bust', win, '¡El Dealer se pasó! Ganaste la mano.');
    } else if (pScore > dScore) {
      const win = bet * 2;
      concludeRound(curPlayer, curDealer, 'win', win, `Ganaste: ${pScore} vs ${dScore} del Dealer.`);
    } else if (pScore < dScore) {
      concludeRound(curPlayer, curDealer, 'lose', 0, `El Dealer gana con ${dScore} vs tu ${pScore}.`);
    } else {
      concludeRound(curPlayer, curDealer, 'push', bet, `Empate en ${pScore}. Se devuelve la apuesta.`);
    }
  };

  const doubleDown = async () => {
    if (gameState !== 'player_turn' || playerCards.length !== 2) return;
    const check = await placeGameBet(game, bet);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }

    setBet(prev => prev * 2);
    sound.playCard();
    const newCard = drawCard();
    const newHand = [...playerCards, newCard];
    setPlayerCards(newHand);

    const score = calculateHandScore(newHand);
    if (score > 21) {
      concludeRound(newHand, dealerCards, 'bust', 0, 'Doble apuesta: te pasaste de 21.');
    } else {
      stand(newHand);
    }
  };

  const concludeRound = async (
    pHand: Card[],
    dHand: Card[],
    result: string,
    win: number,
    message: string
  ) => {
    setGameState('finished');
    setPayoutAmount(win);
    setOutcomeMessage(message);

    const mult = bet > 0 ? Number((win / bet).toFixed(2)) : 0;

    if (win > 0) {
      sound.playWin();
      if (result === 'blackjack') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }

    await resolveGameBet(
      game,
      bet,
      win,
      mult,
      `Blackjack: ${message}`
    );
  };

  const isCardRed = (suit: string) => suit === '♥' || suit === '♦';

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
          <p className="text-xs text-slate-400">Blackjack paga 3 a 2 • Dealer se planta en 17 • Seguro disponible</p>
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

      {/* Blackjack Felt Table */}
      <div className="my-4 bg-gradient-to-b from-[#06331e] to-[#042013] border-4 border-amber-700/60 rounded-3xl p-5 sm:p-8 shadow-[inset_0_0_40px_rgba(0,0,0,0.85)] min-h-[360px] flex flex-col justify-between relative">
        {/* Table Felt Arch Watermark */}
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 border-2 border-emerald-400/10 rounded-full h-40 pointer-events-none flex items-center justify-center">
          <span className="text-emerald-300/10 font-serif-luxury font-black text-2xl tracking-widest uppercase">
            ROYALPLAY VIP BLACKJACK 21
          </span>
        </div>

        {/* Dealer Area */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-emerald-300 uppercase tracking-widest font-semibold">Dealer</span>
            {gameState !== 'betting' && (
              <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300 font-mono-tech text-xs font-bold border border-amber-500/30">
                {gameState === 'player_turn' ? '?' : dealerScore}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {dealerCards.map((card, idx) => {
              const hide = idx === 1 && gameState === 'player_turn';
              return (
                <div
                  key={idx}
                  className={`w-16 h-24 sm:w-20 sm:h-28 rounded-lg shadow-xl border flex flex-col justify-between p-2 select-none transition-all ${
                    hide
                      ? 'bg-gradient-to-br from-blue-950 to-indigo-900 border-amber-400/40 flex items-center justify-center'
                      : 'bg-slate-100 text-slate-900 border-slate-300'
                  }`}
                >
                  {hide ? (
                    <div className="w-8 h-10 border border-amber-400/30 rounded flex items-center justify-center text-amber-400 font-serif-luxury text-xs">
                      RP
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className={`font-black font-mono-tech text-sm sm:text-base ${isCardRed(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>
                          {card.value}
                        </span>
                        <span className={`text-base sm:text-lg ${isCardRed(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>
                          {card.suit}
                        </span>
                      </div>
                      <div className="text-center text-2xl sm:text-3xl">{card.suit}</div>
                      <div className="text-right">
                        <span className={`font-black font-mono-tech text-xs ${isCardRed(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>
                          {card.value}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Round Outcome / Notification */}
        {outcomeMessage && (
          <div className="my-2 py-2 px-4 rounded-xl bg-slate-950/90 border border-amber-400/60 text-center shadow-xl z-10 self-center">
            <p className="text-sm font-bold text-amber-300">{outcomeMessage}</p>
            {payoutAmount > 0 && (
              <p className="text-base font-black font-mono-tech text-emerald-400 mt-0.5">
                +${payoutAmount.toLocaleString('es-AR')} ARS
              </p>
            )}
          </div>
        )}

        {/* Player Area */}
        <div className="flex flex-col items-center mt-3">
          <div className="flex items-center gap-3">
            {playerCards.map((card, idx) => (
              <div
                key={idx}
                className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg shadow-2xl border bg-slate-100 text-slate-900 border-slate-300 flex flex-col justify-between p-2 select-none"
              >
                <div className="flex items-center justify-between">
                  <span className={`font-black font-mono-tech text-sm sm:text-base ${isCardRed(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>
                    {card.value}
                  </span>
                  <span className={`text-base sm:text-lg ${isCardRed(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>
                    {card.suit}
                  </span>
                </div>
                <div className="text-center text-2xl sm:text-3xl">{card.suit}</div>
                <div className="text-right">
                  <span className={`font-black font-mono-tech text-xs ${isCardRed(card.suit) ? 'text-rose-600' : 'text-slate-900'}`}>
                    {card.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-emerald-300 uppercase tracking-widest font-semibold">Tus Cartas</span>
            {playerCards.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full font-mono-tech text-xs font-bold border ${playerScore > 21 ? 'bg-rose-950 text-rose-300 border-rose-600' : 'bg-slate-900/80 text-emerald-300 border-emerald-500/40'}`}>
                {playerScore}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="pt-2 space-y-3">
        {gameState === 'player_turn' ? (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={hit}
              className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wider shadow-lg active:scale-95 transition"
            >
              PEDIR CARTA (HIT)
            </button>
            <button
              onClick={() => stand()}
              className="py-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-sm tracking-wider shadow-lg active:scale-95 transition"
            >
              PLANTARSE (STAND)
            </button>
            <button
              onClick={doubleDown}
              disabled={playerCards.length !== 2}
              className="py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-sm tracking-wider shadow-lg active:scale-95 transition disabled:opacity-40"
            >
              DOBLAR (2X)
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Chip selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Apuesta:</span>
              {CHIPS.map(c => (
                <button
                  key={c}
                  onClick={() => setBet(c)}
                  className={`px-3 py-1.5 rounded-lg font-mono-tech text-xs font-bold transition ${
                    bet === c
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ${c.toLocaleString('es-AR')}
                </button>
              ))}
            </div>

            {/* Deal Button */}
            <button
              onClick={startRound}
              className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-serif-luxury font-black text-base tracking-wider hover:brightness-110 active:scale-95 transition shadow-xl gold-glow"
            >
              REPARTIR MANO • ${bet.toLocaleString('es-AR')} ARS
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Saldo disponible: <strong className="text-emerald-400 font-mono-tech">${wallet.realBalance.toLocaleString('es-AR')} ARS</strong></span>
          <span className="flex items-center gap-1 text-slate-500"><ShieldCheck className="w-3.5 h-3.5" /> Provably Fair Certificado</span>
        </div>
      </div>
    </div>
  );
};
