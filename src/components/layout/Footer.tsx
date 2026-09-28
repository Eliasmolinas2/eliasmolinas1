import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, HeartHandshake, PhoneCall, Award, FileText, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <footer className="bg-[#050810] border-t border-slate-800 text-slate-400 text-xs mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* MANDATORY ARGENTINA RESPONSIBLE GAMING CALLOUT */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-red-950/40 border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center shrink-0">
              <span className="font-serif-luxury font-black text-2xl text-rose-400">+18</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-300 uppercase tracking-wider">
                El jugar compulsivamente es perjudicial para la salud
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Plataforma exclusiva para mayores de 18 años con residencia en territorio argentino. El juego online
                debe ser una actividad recreativa y controlada. Si necesitas asistencia u orientación, comunícate las 24 hs
                a las líneas gratuitas de prevención.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="text-center sm:text-right">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Línea Gratuita de Ayuda</span>
              <span className="text-amber-400 font-mono-tech font-bold text-sm">0800-444-4000</span>
            </div>
            <button
              onClick={() => setCurrentView('responsible_gaming')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
            >
              Programa de Autoexclusión
            </button>
          </div>
        </div>

        {/* 4 COLUMNS FOOTER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury font-black text-lg text-amber-400">ROYALPLAY</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono-tech font-bold">
                ARGENTINA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma de casino tecnológico con mensajería cifrada de grado militar (AES-256-GCM),
              billetera multidivisa en pesos argentinos y arquitectura adaptada a normativas de loterías provinciales (LOTBA / IPLyC).
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>TLS 1.3 • AES-256-GCM • SHA-256 Provably Fair</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2.5">
            <h5 className="text-xs uppercase tracking-wider font-bold text-slate-200">Navegación Rápida</h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => setCurrentView('home')} className="hover:text-amber-400 transition">
                  Lobby & Tragamonedas
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('wallet')} className="hover:text-amber-400 transition">
                  Billetera en Pesos (ARS)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('promotions')} className="hover:text-amber-400 transition">
                  Bonos de Bienvenida & Torneos
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('secure_messages')} className="hover:text-amber-400 transition">
                  Centro de Cifrado AES-256
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('responsible_gaming')} className="hover:text-amber-400 transition">
                  Canal de Ayuda 0800
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Regulación & Seguridad */}
          <div className="space-y-2.5">
            <h5 className="text-xs uppercase tracking-wider font-bold text-slate-200">Marco Legal & Seguridad</h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => setCurrentView('responsible_gaming')} className="hover:text-amber-400 transition">
                  Juego Responsable & Límites
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('database_schema')} className="hover:text-amber-400 transition">
                  Esquema Relacional PostgreSQL
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('drive')} className="hover:text-amber-400 transition">
                  Google Drive (Bóveda Digital)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('plans')} className="hover:text-amber-400 transition">
                  Planes de Operación B2B
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.location.hash = '#/admin';
                    setCurrentView('admin');
                  }}
                  className="text-slate-500 hover:text-rose-400 transition flex items-center gap-1 font-mono-tech text-[11px]"
                >
                  <Lock className="w-3 h-3 text-rose-500/70" />
                  <span>Portal Administrativo (Privado)</span>
                </button>
              </li>
              <li>
                <span className="text-slate-500">Protección de Datos (Ley 25.326)</span>
              </li>
              <li>
                <span className="text-slate-500">Prevención Lavado de Activos (UIF)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Métodos de Pago Autorizados en Argentina */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase tracking-wider font-bold text-slate-200">Billeteras & Medios de Pago</h5>
            <p className="text-[11px] text-slate-400">
              Integración nativa con canales bancarios y pasarelas argentinas autorizadas:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-tech font-semibold">
              <span className="p-2 rounded bg-slate-900 border border-slate-800 text-cyan-300 text-center">
                Mercado Pago
              </span>
              <span className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-300 text-center">
                CBU / CVU 3.0
              </span>
              <span className="p-2 rounded bg-slate-900 border border-slate-800 text-amber-300 text-center">
                Débito Visa / MC
              </span>
              <span className="p-2 rounded bg-slate-900 border border-slate-800 text-purple-300 text-center">
                Red Link / Banelco
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} RoyalPlay Argentina. Todos los derechos reservados.
            Preparado para operar bajo licencias jurisdiccionales de juegos de azar en línea.
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Cifrado 256-Bit
            </span>
            <span>•</span>
            <span className="text-rose-400 font-bold">+18 Prohibido Menores</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
