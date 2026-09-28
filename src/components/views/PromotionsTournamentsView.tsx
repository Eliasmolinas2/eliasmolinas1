import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Gift, Sparkles, CheckCircle2, AlertCircle, Clock, Users, Flame } from 'lucide-react';

export const PromotionsTournamentsView: React.FC = () => {
  const { promotions, tournaments, claimPromoCode } = useApp();

  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [claimStatus, setClaimStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    const res = claimPromoCode(promoCodeInput);
    setClaimStatus(res);
    if (res.success) {
      setPromoCodeInput('');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#211604] via-[#140f06] to-[#090d16] border border-amber-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Gift className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-serif-luxury text-amber-300">
                Promociones & Torneos VIP Argentina
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono-tech border border-amber-500/30 font-bold">
                BONOS ARS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Premios reales en pesos argentinos. Rollover transparente auditado y tablas de clasificación en tiempo real.
            </p>
          </div>
        </div>

        <div className="shrink-0 text-center md:text-right">
          <span className="text-xs text-rose-400 font-bold block">+18 • Juega con Moderación</span>
          <span className="text-[11px] text-slate-400">El juego compulsivo es perjudicial para la salud</span>
        </div>
      </div>

      {/* CLAIM PROMO CODE BAR */}
      <div className="bg-[#0c1220] border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-white font-serif-luxury">¿Tienes un Código Promocional?</h4>
            <span className="text-xs text-slate-400">Ingresa códigos como <strong>ROYAL100</strong>, <strong>SPINS50</strong> o <strong>VIP15</strong></span>
          </div>
        </div>

        <form onSubmit={handleClaim} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="EJ: ROYAL100"
            value={promoCodeInput}
            onChange={e => setPromoCodeInput(e.target.value)}
            className="w-full sm:w-44 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono-tech font-bold uppercase text-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-serif-luxury tracking-wider shadow-md shrink-0 transition"
          >
            CANJEAR
          </button>
        </form>
      </div>

      {claimStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            claimStatus.success
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}
        >
          {claimStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{claimStatus.message}</span>
        </div>
      )}

      {/* ACTIVE PROMOTIONS LIST */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-serif-luxury text-amber-200">
          Promociones Vigentes para Argentina
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promotions.map(promo => (
            <div
              key={promo.id}
              className="bg-[#0c1220] border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono-tech font-bold px-2 py-0.5 rounded-full">
                    ROL {promo.wageringRequirement}x
                  </span>
                  <span className="text-[10px] text-slate-500">Hasta {promo.validUntil}</span>
                </div>

                <h4 className="font-bold text-base text-slate-100 font-serif-luxury">
                  {promo.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {promo.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono-tech">Código:</span>
                  <span className="font-mono-tech font-bold text-amber-400 text-xs">{promo.code}</span>
                </div>

                <button
                  onClick={() => {
                    const res = claimPromoCode(promo.code);
                    setClaimStatus(res);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-black text-slate-200 font-bold text-xs transition"
                >
                  Activar Bono
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE TOURNAMENTS SECTION */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-serif-luxury text-amber-200 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Torneos en Vivo & Tablas de Clasificación</span>
          </h3>
          <span className="text-xs text-emerald-400 font-mono-tech flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Pozo Total: $5.500.000 ARS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map(tour => (
            <div
              key={tour.id}
              className="bg-[#0c1220] border border-amber-500/30 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-base text-amber-300 font-serif-luxury">
                    {tour.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{tour.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono-tech block">Pozo en Juego</span>
                  <span className="text-base font-bold font-mono-tech text-emerald-400">
                    ${tour.prizePoolARS.toLocaleString('es-AR')} ARS
                  </span>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-semibold block uppercase">
                  Top 5 Clasificados
                </span>
                <div className="space-y-1.5 font-mono-tech text-xs">
                  {tour.leaderboard.map(lb => (
                    <div
                      key={lb.rank}
                      className={`p-2 rounded-xl flex items-center justify-between ${
                        lb.username.includes('(Tú)')
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200 font-bold'
                          : 'bg-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${lb.rank === 1 ? 'bg-amber-400 text-black' : lb.rank === 2 ? 'bg-slate-300 text-black' : lb.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {lb.rank}
                        </span>
                        <span className="truncate">{lb.username}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400">{lb.points.toLocaleString()} pts</span>
                        <span className="ml-2 text-emerald-400 font-bold">${lb.prizeARS.toLocaleString('es-AR')} ARS</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {tour.participantsCount} participantes
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Clock className="w-3.5 h-3.5" /> Finaliza el 02/10
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
