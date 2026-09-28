import React, { useState } from 'react';
import { POSTGRESQL_DDL_SCHEMA, PROVIDER_INTEGRATION_GUIDE } from '../../lib/schemaExport';
import { Database, Copy, Download, CheckCircle2, Layers, Server, Code, FileCode } from 'lucide-react';

export const DatabaseArchitectureView: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'architecture' | 'providers'>('sql');

  const handleCopy = () => {
    navigator.clipboard.writeText(POSTGRESQL_DDL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([POSTGRESQL_DDL_SCHEMA], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'royalplay_schema_argentina.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1628] via-[#09101c] to-[#04111e] border border-cyan-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-serif-luxury text-cyan-300">
                Arquitectura de Datos PostgreSQL & Integración de Proveedores
              </h2>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono-tech border border-cyan-500/30 font-bold">
                14 TABLAS DDL
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Esquema relacional empresarial en PostgreSQL para producción, preparado para auditorías de LOTBA y
              conexión a agregadores mundiales de juegos de casino.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-tech flex items-center gap-1.5 transition border border-slate-700"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? '¡Copiado!' : 'Copiar DDL SQL'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-mono-tech flex items-center gap-1.5 transition shadow-lg"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar .sql</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'sql', label: '1. Script DDL PostgreSQL (14 Tablas)', icon: FileCode },
          { id: 'architecture', label: '2. Diagrama de Relaciones', icon: Layers },
          { id: 'providers', label: '3. API de Proveedores Reales', icon: Server },
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                active
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DDL CODE VIEWER */}
      {activeTab === 'sql' && (
        <div className="bg-[#070b14] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono-tech">
            <span className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span>royalplay_schema_argentina.sql</span>
            </span>
            <span className="text-[11px] text-emerald-400">PostgreSQL 15+ Compatible</span>
          </div>

          <pre className="p-4 sm:p-6 text-[11px] sm:text-xs font-mono-tech text-cyan-200/90 leading-relaxed overflow-x-auto max-h-[550px] overflow-y-auto select-all bg-[#050810]">
            <code>{POSTGRESQL_DDL_SCHEMA}</code>
          </pre>
        </div>
      )}

      {/* TAB 2: ARCHITECTURE OVERVIEW */}
      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: '1. Núcleo de Jugadores & Identidad',
              tables: 'users, user_sessions, kyc_verifications',
              desc: 'Garantiza la mayoría de edad (+18) mediante validación de fecha de nacimiento contra RENAPER y hash de sesiones HTTPS/TLS.',
            },
            {
              title: '2. Billetera & Contabilidad Multidivisa',
              tables: 'wallets, transactions',
              desc: 'Gestión en pesos argentinos (ARS) de saldos reales, saldo de bono con rollover e historial de depósitos CBU/Mercado Pago.',
            },
            {
              title: '3. Catálogo de Juegos & Provably Fair',
              tables: 'casino_games, bets',
              desc: 'Registro de apuestas auditables con SHA-256 (Server Seed + Client Seed + Nonce) y cálculo automático de RTP.',
            },
            {
              title: '4. Marco de Juego Responsable LOTBA',
              tables: 'responsible_gaming_limits, self_exclusions',
              desc: 'Límites de depósito diario, semanal y mensual; pausas temporales y registro irrevocable de autoexclusión sincronizable.',
            },
            {
              title: '5. Comunicaciones Cifradas & WhatsApp',
              tables: 'secure_messages, secure_contacts, whatsapp_consents, whatsapp_logs',
              desc: 'Cifrado de grado militar AES-256-GCM y gateway oficial Meta Graph API con Opt-In formal y límites anti-spam.',
            },
            {
              title: '6. Auditoría Regulatoria & Soporte',
              tables: 'audit_logs, support_tickets, promotions',
              desc: 'Registro inmutable de acciones administrativas con severidad, IP y rol del operador actuante.',
            },
          ].map((sec, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-cyan-300 font-serif-luxury">{sec.title}</h4>
              <span className="text-[11px] font-mono-tech text-amber-300 block bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                Tablas: {sec.tables}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">{sec.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: REAL PROVIDER INTEGRATION GUIDE */}
      {activeTab === 'providers' && (
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold font-serif-luxury text-amber-300">
            Arquitectura de Integración Seamless Wallet para Proveedores Oficiales
          </h3>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono-tech text-xs text-slate-300 whitespace-pre-line leading-relaxed">
            {PROVIDER_INTEGRATION_GUIDE}
          </div>
        </div>
      )}
    </div>
  );
};
