import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartHandshake,
  Shield,
  Clock,
  AlertTriangle,
  Ban,
  CheckCircle2,
  PhoneCall,
  Scale,
  FileText,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const ResponsibleGamingView: React.FC = () => {
  const {
    responsibleGaming,
    updateResponsibleLimits,
    applyCoolingOff,
    applySelfExclusion,
    sessionElapsedMinutes,
  } = useApp();

  // Limits Form State
  const [dailyLimit, setDailyLimit] = useState<number>(responsibleGaming.depositLimitDaily);
  const [weeklyLimit, setWeeklyLimit] = useState<number>(responsibleGaming.depositLimitWeekly);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(responsibleGaming.depositLimitMonthly);
  const [realityInterval, setRealityInterval] = useState<number>(responsibleGaming.realityCheckMinutes);
  const [savedLimitsNotice, setSavedLimitsNotice] = useState<string>('');

  // Cooling-off State
  const [coolingHours, setCoolingHours] = useState<number>(24);

  // Self Exclusion State
  const [selfExclusionMonths, setSelfExclusionMonths] = useState<number>(6);
  const [selfExclusionReason, setSelfExclusionReason] = useState<string>('Necesito tomar distancia voluntaria del juego.');
  const [confirmIrrevocable, setConfirmIrrevocable] = useState<boolean>(false);

  // Self-Assessment Test State
  const [answers, setAnswers] = useState<{ [key: number]: boolean }>({});
  const [testResult, setTestResult] = useState<string | null>(null);

  const QUESTIONS = [
    '¿Has intentado recuperar dinero perdido aumentando el monto de tus apuestas?',
    '¿Has ocultado a tus familiares o amigos el tiempo o dinero que dedicas a jugar?',
    '¿Has sentido culpa o ansiedad tras haber apostado en el casino online?',
    '¿Has jugado para escapar de problemas, soledad o estrés cotidiano?',
    '¿Has gastado en apuestas dinero destinado a gastos esenciales (alquiler, alimentos, servicios)?',
    '¿Has intentado reducir o parar el juego sin lograrlo con éxito?',
  ];

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    updateResponsibleLimits({
      depositLimitDaily: dailyLimit,
      depositLimitWeekly: weeklyLimit,
      depositLimitMonthly: monthlyLimit,
      realityCheckMinutes: realityInterval,
    });
    setSavedLimitsNotice('Límites actualizados correctamente según regulación LOTBA / IPLyC.');
    setTimeout(() => setSavedLimitsNotice(''), 3000);
  };

  const handleCoolingOffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyCoolingOff(coolingHours);
  };

  const handleSelfExclusionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmIrrevocable) {
      alert('Debes confirmar que comprendes el carácter irrevocable de la autoexclusión.');
      return;
    }
    applySelfExclusion(selfExclusionMonths, selfExclusionReason);
    alert(`Autoexclusión formal radicada por ${selfExclusionMonths} meses. Tu cuenta ha sido bloqueada para apuestas.`);
  };

  const handleTestSubmit = () => {
    const affirmativeCount = Object.values(answers).filter(Boolean).length;
    if (affirmativeCount === 0) {
      setTestResult('Riesgo Bajo: Tu relación con el juego aparenta ser recreativa y controlada.');
    } else if (affirmativeCount <= 2) {
      setTestResult('Riesgo Moderado: Se detectan hábitos que podrían escalar. Te recomendamos fijar límites estrictos de depósito y tiempo.');
    } else {
      setTestResult('Riesgo Alto: Es conveniente realizar una pausa inmediata y comunicarte con la línea gratuita 0800-444-4000 para recibir orientación profesional confidencial.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* MANDATORY ARGENTINA BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950 via-slate-950 to-red-950 border-2 border-rose-500 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white font-serif-luxury font-black text-3xl flex items-center justify-center shrink-0 shadow-lg">
            +18
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-black font-serif-luxury text-rose-300 uppercase tracking-wide">
              EL JUGAR COMPULSIVAMENTE ES PERJUDICIAL PARA LA SALUD
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              En cumplimiento con las normativas de Lotería de la Ciudad (LOTBA) y el Instituto Provincial de Lotería
              y Casinos (IPLyC), RoyalPlay promueve el juego transparente y seguro como una actividad de entretenimiento
              exclusiva para adultos.
            </p>
          </div>
        </div>

        <div className="shrink-0 text-center md:text-right bg-black/60 p-4 rounded-2xl border border-rose-500/40">
          <span className="text-[10px] text-slate-400 uppercase font-mono-tech block">Asistencia Telefónica Gratuita</span>
          <span className="text-xl font-black font-mono-tech text-amber-400">0800-444-4000</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">24 hs • Anónimo • Nacional</span>
        </div>
      </div>

      {/* 2x2 GRID OF CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. DEPOSIT LIMITS */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-serif-luxury text-amber-300">
              Límites de Depósito (ARS)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Fija el importe máximo que puedes ingresar en tu cuenta por periodo.
          </p>

          <form onSubmit={handleSaveLimits} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Límite Diario (24 hs):</label>
              <input
                type="number"
                min="1000"
                step="5000"
                value={dailyLimit}
                onChange={e => setDailyLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono-tech font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Límite Semanal (7 días):</label>
              <input
                type="number"
                min="5000"
                step="10000"
                value={weeklyLimit}
                onChange={e => setWeeklyLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono-tech font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Límite Mensual (30 días):</label>
              <input
                type="number"
                min="10000"
                step="50000"
                value={monthlyLimit}
                onChange={e => setMonthlyLimit(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono-tech font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {savedLimitsNotice && (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs">
                {savedLimitsNotice}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-wider transition"
            >
              GUARDAR LÍMITES
            </button>
          </form>
        </div>

        {/* 2. TIME LIMITS & REALITY CHECK */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold font-serif-luxury text-cyan-300">
              Límites de Tiempo & Reality Check
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Controla tu permanencia activa y recibe alertas de realidad con saldo en juego.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono-tech">Sesión en Curso Hoy</span>
            <div className="text-2xl font-mono-tech font-bold text-emerald-400">
              {sessionElapsedMinutes} minutos
            </div>
            <span className="text-[11px] text-slate-400">
              Se resetea automáticamente al cerrar sesión.
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">
                Frecuencia de Recordatorio de Realidad (minutos):
              </label>
              <select
                value={realityInterval}
                onChange={e => setRealityInterval(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono-tech"
              >
                <option value={15}>Cada 15 minutos</option>
                <option value={30}>Cada 30 minutos (Recomendado)</option>
                <option value={60}>Cada 60 minutos</option>
                <option value={120}>Cada 120 minutos</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-[11px] text-cyan-300">
              Cuando el temporizador expira, el sistema emitirá una alerta sonora y desplegará un modal con el
              tiempo transcurrido y la variación de tu saldo para invitarte a hacer una pausa.
            </div>
          </div>
        </div>

        {/* 3. COOLING-OFF PAUSE */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-serif-luxury text-amber-300">
              Pausa Temporal (Cooling-Off)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Tómate un respiro temporal. Durante este lapso tu cuenta no podrá procesar apuestas ni depósitos.
          </p>

          <form onSubmit={handleCoolingOffSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Duración de la Pausa:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { hours: 24, label: '24 hs' },
                  { hours: 48, label: '48 hs' },
                  { hours: 168, label: '7 días' },
                  { hours: 720, label: '30 días' },
                ].map(p => (
                  <button
                    key={p.hours}
                    type="button"
                    onClick={() => setCoolingHours(p.hours)}
                    className={`p-2 rounded-xl font-mono-tech font-bold text-center border transition ${
                      coolingHours === p.hours
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {responsibleGaming.coolingOffUntil && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs">
                Pausa activa hasta el:{' '}
                <strong>{new Date(responsibleGaming.coolingOffUntil).toLocaleDateString('es-AR')}</strong>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs tracking-wider transition"
            >
              ACTIVAR PAUSA TEMPORAL
            </button>
          </form>
        </div>

        {/* 4. FORMAL SELF-EXCLUSION */}
        <div className="bg-[#0c1220] border border-rose-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold font-serif-luxury text-rose-300">
              Programa Formal de Autoexclusión
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Procedimiento vinculante e irrevocable. La cuenta quedará inhabilitada para toda actividad de juego.
          </p>

          <form onSubmit={handleSelfExclusionSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Periodo de Autoexclusión:</label>
              <select
                value={selfExclusionMonths}
                onChange={e => setSelfExclusionMonths(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              >
                <option value={6}>6 Meses (Mínimo legal)</option>
                <option value={12}>1 Año</option>
                <option value={24}>2 Años</option>
                <option value={60}>5 Años</option>
                <option value={999}>Permanente / Indefinido</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Motivo Principal:</label>
              <input
                type="text"
                value={selfExclusionReason}
                onChange={e => setSelfExclusionReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 text-slate-300 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmIrrevocable}
                  onChange={e => setConfirmIrrevocable(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-500 mt-0.5"
                />
                <span>
                  Declaro bajo juramento que comprendo el carácter irrevocable de la autoexclusión y que no podré
                  reactivar mi cuenta antes del plazo fijado.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!confirmIrrevocable}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wider transition disabled:opacity-50"
            >
              RADICAR AUTOEXCLUSIÓN FORMAL
            </button>
          </form>
        </div>
      </div>

      {/* CLINICAL SELF-ASSESSMENT TEST */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold font-serif-luxury text-amber-300">
              Autoevaluación de Hábitos de Juego (Test Clínico de Detección)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cuestionario orientativo y anónimo para evaluar el impacto de las apuestas en tu vida cotidiana.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {QUESTIONS.map((q, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 text-xs"
            >
              <span className="text-slate-200">{idx + 1}. {q}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setAnswers(prev => ({ ...prev, [idx]: true }))}
                  className={`px-3 py-1 rounded-lg font-bold font-mono-tech transition ${
                    answers[idx] === true ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  SÍ
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers(prev => ({ ...prev, [idx]: false }))}
                  className={`px-3 py-1 rounded-lg font-bold font-mono-tech transition ${
                    answers[idx] === false ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  NO
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleTestSubmit}
            disabled={Object.keys(answers).length < QUESTIONS.length}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-wider transition disabled:opacity-40"
          >
            CALCULAR RESULTADO DEL TEST
          </button>

          {testResult && (
            <div className="flex-1 p-3 rounded-xl bg-slate-900 border border-amber-500/40 text-xs text-amber-200">
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
