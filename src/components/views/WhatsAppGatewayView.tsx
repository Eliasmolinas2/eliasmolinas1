import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Send,
  Clock,
  Sparkles,
  Lock,
  Key,
  Flame,
  FileText,
} from 'lucide-react';

export const WhatsAppGatewayView: React.FC = () => {
  const {
    whatsappConsent,
    toggleWhatsAppConsent,
    whatsappTemplates,
    whatsappLogs,
    sendWhatsAppTemplateMessage,
    user,
    allUsers,
  } = useApp();

  const [selectedTemplateName, setSelectedTemplateName] = useState<string>(whatsappTemplates[0]?.name || '');
  const [recipientPhone, setRecipientPhone] = useState<string>(user.phone);
  const [selectedRecipientUserId, setSelectedRecipientUserId] = useState<string>(user.id);
  const [sending, setSending] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedTemplate = whatsappTemplates.find(t => t.name === selectedTemplateName);

  const handleSelectUser = (userId: string) => {
    setSelectedRecipientUserId(userId);
    const targetUser = allUsers.find(u => u.id === userId);
    if (targetUser) {
      setRecipientPhone(targetUser.phone);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendResult(null);

    try {
      const res = await sendWhatsAppTemplateMessage(selectedTemplateName, recipientPhone);
      setSendResult(res);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#062615] via-[#081a10] to-[#04120a] border border-emerald-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-serif-luxury text-emerald-300">
                Meta WhatsApp Business Cloud API Gateway
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono-tech border border-emerald-500/30 font-bold">
                OFICIAL REGULADO
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Canal oficial de notificaciones transaccionales y seguridad 2FA mediante la <strong>Meta Graph API v21.0</strong>.
              Estrictamente regulado bajo políticas anti-spam, límites de frecuencia y consentimiento informado (Opt-In).
            </p>
          </div>
        </div>

        <div className="shrink-0 p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-right">
          <span className="text-[10px] text-slate-400 block uppercase font-mono-tech">Anti-Spam Policy</span>
          <span className="text-xs font-mono-tech text-emerald-400 font-bold">Cumplimiento Meta 100%</span>
        </div>
      </div>

      {/* REGULATORY NOTICE: NO EVASION TECHNIQUES */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 flex items-center gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <strong className="text-white block">Alineación Estricta con Políticas Oficiales de WhatsApp Business</strong>
          <span>
            RoyalPlay no utiliza ni implementa mecanismos para evadir bloqueos, filtros, proxies no autorizados
            o sistemas de detección de WhatsApp. Toda comunicación transaccional se cursa por endpoints autorizados
            de Meta Graph API.
          </span>
        </div>
      </div>

      {/* CONSENT & OPT-IN MANAGEMENT */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold font-serif-luxury text-emerald-300">
              Gestión de Consentimiento (Opt-In Formal)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro inmutable de la autorización del usuario para recibir mensajes según Ley 25.326 y normativas Meta.
            </p>
          </div>

          <button
            onClick={toggleWhatsAppConsent}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono-tech transition ${
              whatsappConsent.active
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {whatsappConsent.active ? 'CONSENTIMIENTO ACTIVO (OPT-IN)' : 'CONSENTIMIENTO REVOCADO (OPT-OUT)'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-tech text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Número Registrado:</span>
            <span className="font-bold text-slate-200">{whatsappConsent.phoneNumber}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">Fecha Otorgamiento:</span>
            <span className="font-bold text-slate-200">
              {new Date(whatsappConsent.optedInAt).toLocaleDateString('es-AR')} {new Date(whatsappConsent.optedInAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] block uppercase">IP de Registro:</span>
            <span className="font-bold text-slate-200">{whatsappConsent.ipAddress} (CABA)</span>
          </div>
        </div>
      </div>

      {/* TEMPLATES & LIVE TEST SENDER */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Templates Gallery */}
        <div className="md:col-span-7 bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif-luxury text-emerald-300">
              Plantillas Meta Pre-Aprobadas
            </h3>
            <span className="text-xs text-slate-400 font-mono-tech">Idioma: es_AR</span>
          </div>

          <div className="space-y-3">
            {whatsappTemplates.map(tpl => (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplateName(tpl.name)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                  selectedTemplateName === tpl.name
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tech font-bold text-slate-200">{tpl.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400">
                      {tpl.category}
                    </span>
                  </div>
                  <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    {tpl.status}
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-mono-tech leading-relaxed bg-black/40 p-2 rounded-lg border border-slate-800/80">
                  {tpl.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Test Sender */}
        <div className="md:col-span-5 bg-[#090e18] border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs uppercase font-mono-tech font-bold tracking-wider text-emerald-400">
                Simulador de Envío Oficial
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Envía una prueba de la plantilla seleccionada al número verificado del usuario.
              </p>
            </div>

            <form onSubmit={handleSend} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Destinatario (Jugador Registrado):</label>
                <select
                  value={selectedRecipientUserId}
                  onChange={e => handleSelectUser(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono-tech text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.phone}) • {u.role === 'vip' ? 'VIP ORO' : 'ESTÁNDAR'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Plantilla:</label>
                <input
                  type="text"
                  readOnly
                  value={selectedTemplateName}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono-tech text-amber-300"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Teléfono Destinatario (E.164):</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={e => setRecipientPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono-tech text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {sendResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    sendResult.success
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {sendResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{sendResult.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={sending || !whatsappConsent.active}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 active:scale-98 text-white font-bold text-xs tracking-wider shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'DESPACHANDO VÍA GRAPH API...' : 'ENVIAR MENSAJE DE PRUEBA'}</span>
              </button>
            </form>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
            Límite anti-spam: Máximo 5 notificaciones cada 24 hs por usuario.
          </div>
        </div>
      </div>

      {/* OUTBOUND LOGS & RATE LIMIT AUDIT */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold font-serif-luxury text-emerald-300">
          Registro de Despachos & Webhook Ledger (Meta Cloud API)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono-tech text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Plantilla</th>
                <th className="py-2.5 px-3">Destinatario</th>
                <th className="py-2.5 px-3">Meta Message ID (wamid)</th>
                <th className="py-2.5 px-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-tech text-[11px]">
              {whatsappLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(log.sentAt).toLocaleDateString('es-AR')} {new Date(log.sentAt).toLocaleTimeString('es-AR')}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">{log.templateName}</td>
                  <td className="py-2.5 px-3 text-slate-300">{log.recipientPhone}</td>
                  <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{log.metaMessageId}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
