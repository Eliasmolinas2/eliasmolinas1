import React, { useState } from 'react';
import { Layers, CheckCircle2, Shield, Zap, Sparkles, CreditCard, Building2, Lock } from 'lucide-react';

export const PlansMonetizationView: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const PLANS = [
    {
      id: 'free',
      name: 'Plan Free / Starter',
      priceARS: '$0',
      period: 'Gratis para siempre',
      desc: 'Ideal para evaluar las funciones tecnológicas de RoyalPlay y juegos demostrativos.',
      badge: 'Básico',
      features: [
        'Acceso a todos los juegos demo interactivos',
        'Cifrado AES-256-GCM local en el navegador',
        'Billetera virtual en pesos (modo prueba)',
        'Panel básico de juego responsable (+18)',
        'Esquema DDL de base de datos PostgreSQL',
      ],
      cta: 'Plan Actual Activo',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Plan Pro Operator',
      priceARS: '$180.000 ARS',
      period: 'por mes (o $149 USD)',
      desc: 'Para operadores en proceso de licenciamiento con WhatsApp oficial y KYC integrado.',
      badge: 'Más Elegido',
      features: [
        'Todo lo incluido en el plan Free',
        'Meta WhatsApp Cloud API (hasta 2.500 notificaciones/mes)',
        'Módulo KYC con validación biométrica y de DNI',
        '2FA obligatorio vía WhatsApp / Authenticator',
        'Motor de auditoría inmutable de transacciones',
        'Gestión de límites de juego responsable y autoexclusión',
        'Soporte técnico preferencial 24/7',
      ],
      cta: 'Seleccionar Plan Pro',
      popular: true,
    },
    {
      id: 'business',
      name: 'Plan Business Enterprise',
      priceARS: '$550.000 ARS',
      period: 'por mes (o a medida)',
      desc: 'Solución llave en mano para casinos regulados con licencias provinciales (LOTBA / IPLyC).',
      badge: 'Regulado',
      features: [
        'Todo lo incluido en el plan Pro',
        'Conexión Seamless Wallet para agregadores (Pragmatic, Evolution)',
        'Integración nativa con pasarelas de pago (Mercado Pago, CBU 3.0)',
        'Panel auditor para inspectores de Loterías Provinciales',
        'Infraestructura PostgreSQL de alta disponibilidad y réplicas',
        'Acuerdo de Nivel de Servicio (SLA 99.95%)',
        'Acompañamiento legal y técnico en auditorías UIF',
      ],
      cta: 'Contactar para Enterprise',
      popular: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* HEADER BANNER */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Monetización & Licenciamiento B2B</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-serif-luxury text-white">
          Planes Tecnológicos <span className="gold-gradient-text">RoyalPlay</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Escalabilidad garantizada para proyectos de casino online regulados en Argentina,
          desde prototipos funcionales hasta salas certificadas ante organismos oficiales.
        </p>
      </div>

      {/* PLANS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const isSelected = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 relative ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#141b2d] to-[#0c1220] border-2 border-amber-500/70 shadow-2xl scale-[1.02]'
                  : 'bg-[#0c1220] border border-slate-800 hover:border-slate-700 shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-black font-serif-luxury font-black text-[10px] tracking-wider uppercase shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-serif-luxury text-lg text-white">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                </div>

                <div className="py-2 border-y border-slate-800/80">
                  <span className="text-2xl sm:text-3xl font-black font-serif-luxury text-amber-300">
                    {plan.priceARS}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    alert(`Has seleccionado el ${plan.name}. La pasarela de pagos oficial está preparada para procesar la suscripción.`);
                  }}
                  className={`w-full py-3 rounded-xl font-bold font-serif-luxury text-xs tracking-wider transition ${
                    plan.popular
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110 shadow-lg gold-glow'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PSP INTEGRATION READINESS SECTION */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold font-serif-luxury text-amber-300 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-400" />
          <span>Integración Lista con Pasarelas de Pago Autorizadas (PSPs)</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          La arquitectura de RoyalPlay cuenta con los adaptadores y endpoints necesarios para vincularse de forma
          inmediata con pasarelas de pago homologadas por el Banco Central de la República Argentina (BCRA):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-tech">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300">Mercado Pago Checkout Pro</span>
            <p className="text-slate-400 text-[11px]">Cobro por QR interoperable, tarjeta y dinero en cuenta con Webhooks IPN.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-300">Transferencias 3.0 (COELSA)</span>
            <p className="text-slate-400 text-[11px]">Conciliación automática de CBU/CVU bancarios por API REST.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="font-bold text-amber-300">dLocal & PayU Latam</span>
            <p className="text-slate-400 text-[11px]">Procesamiento transfronterizo y liquidaciones locales en moneda ARS.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
