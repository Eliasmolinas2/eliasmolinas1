import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  QrCode,
  CreditCard,
  Building2,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { Transaction } from '../../types';

export const WalletView: React.FC = () => {
  const { wallet, transactions, deposit, withdraw, user, responsibleGaming } = useApp();

  const [activeTab, setActiveTab] = useState<'balance' | 'deposit' | 'withdraw' | 'history'>('deposit');

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(15000);
  const [depositMethod, setDepositMethod] = useState<Transaction['method']>('mercadopago');
  const [depositLoading, setDepositLoading] = useState<boolean>(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string>('');

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(20000);
  const [cbuAlias, setCbuAlias] = useState<string>('ROSSI.BANCO.GALICIA');
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const [withdrawResult, setWithdrawResult] = useState<{ success: boolean; message: string } | null>(null);

  // History Filter
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [copiedText, setCopiedText] = useState<string>('');

  const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositLoading(true);
    setDepositSuccessMsg('');

    try {
      const ok = await deposit(depositAmount, depositMethod);
      if (ok) {
        setDepositSuccessMsg(`¡Depósito de $${depositAmount.toLocaleString('es-AR')} ARS acreditado con éxito!`);
      }
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawLoading(true);
    setWithdrawResult(null);

    try {
      const res = await withdraw(withdrawAmount, cbuAlias);
      setWithdrawResult(res);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (historyFilter === 'all') return true;
    return t.type === historyFilter;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* WALLET BALANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Real Balance */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0e1d15] to-[#07130d] border border-emerald-500/40 shadow-xl relative overflow-hidden">
          <div className="text-emerald-400 text-xs uppercase font-mono-tech font-bold tracking-wider flex items-center justify-between">
            <span>Saldo Real Retirable</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black font-serif-luxury text-emerald-300">
            ${wallet.realBalance.toLocaleString('es-AR')}{' '}
            <span className="text-sm font-mono-tech text-emerald-400/80">ARS</span>
          </div>
          <p className="text-[11px] text-emerald-400/70 mt-1">
            Disponible de inmediato para juego o retiro bancario.
          </p>
        </div>

        {/* Bonus Balance */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1d1607] to-[#120d04] border border-amber-500/40 shadow-xl relative overflow-hidden">
          <div className="text-amber-400 text-xs uppercase font-mono-tech font-bold tracking-wider flex items-center justify-between">
            <span>Saldo de Bonificación</span>
            <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
              Rollover 30x
            </span>
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black font-serif-luxury text-amber-300">
            ${wallet.bonusBalance.toLocaleString('es-AR')}{' '}
            <span className="text-sm font-mono-tech text-amber-400/80">ARS</span>
          </div>
          <p className="text-[11px] text-amber-400/70 mt-1">
            Se convierte en saldo real al completar el requisito de apuesta.
          </p>
        </div>

        {/* In-Review / Locked */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-700 shadow-xl">
          <div className="text-slate-400 text-xs uppercase font-mono-tech font-bold tracking-wider flex items-center justify-between">
            <span>En Proceso de Retiro</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-black font-serif-luxury text-slate-200">
            ${wallet.lockedForWithdrawal.toLocaleString('es-AR')}{' '}
            <span className="text-sm font-mono-tech text-slate-400">ARS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Validando titularidad bancaria con DNI del titular.
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'deposit', label: 'Cargar Saldo (Depósito)', icon: ArrowDownLeft },
          { id: 'withdraw', label: 'Retirar Fondos (CBU)', icon: ArrowUpRight },
          { id: 'history', label: 'Historial de Transacciones', icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                active
                  ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: DEPOSIT */}
      {activeTab === 'deposit' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Form */}
          <div className="md:col-span-7 bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold font-serif-luxury text-amber-300">
                Seleccionar Medio de Pago (Argentina)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Acreditación instantánea sin comisiones operativas. Límite diario disponible: $
                {responsibleGaming.depositLimitDaily.toLocaleString('es-AR')} ARS.
              </p>
            </div>

            {/* Methods Selection */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'mercadopago', label: 'Mercado Pago', icon: QrCode, badge: 'Instantáneo' },
                { id: 'transferencia_bancaria', label: 'CBU / CVU 3.0', icon: Building2, badge: 'Red Bancaria' },
                { id: 'debito', label: 'Tarjeta Débito', icon: CreditCard, badge: 'Visa / Master' },
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDepositMethod(m.id as Transaction['method'])}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between h-24 transition ${
                    depositMethod === m.id
                      ? 'border-amber-500 bg-amber-500/10 shadow-md'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <m.icon className={`w-5 h-5 ${depositMethod === m.id ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono-tech">
                      {m.badge}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-200">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Amount Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Monto a Depositar (ARS):</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_AMOUNTS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDepositAmount(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold transition ${
                      depositAmount === p
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ${p.toLocaleString('es-AR')}
                  </button>
                ))}
              </div>

              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono-tech font-bold text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="1000"
                  max={responsibleGaming.depositLimitDaily}
                  value={depositAmount}
                  onChange={e => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono-tech font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {depositSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{depositSuccessMsg}</span>
              </div>
            )}

            <button
              onClick={handleDepositSubmit}
              disabled={depositLoading || depositAmount <= 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black font-serif-luxury font-black text-sm tracking-wider shadow-xl gold-glow hover:brightness-110 active:scale-98 transition disabled:opacity-50"
            >
              {depositLoading ? 'PROCESANDO...' : `CONFIRMAR CARGA • $${depositAmount.toLocaleString('es-AR')} ARS`}
            </button>
          </div>

          {/* Transfer instructions sidebar */}
          <div className="md:col-span-5 bg-[#090e18] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs uppercase font-mono-tech font-bold tracking-wider text-amber-400">
              Datos Oficiales de Recaudación (Argentina)
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">Titular Registrado:</span>
                <span className="font-bold text-slate-200">ROYALPLAY TECNOLOGÍA S.A.</span>
                <span className="text-[11px] text-slate-400 block font-mono-tech">CUIT: 30-71829301-4</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase">Alias Bancario CBU/CVU:</span>
                  <button
                    onClick={() => handleCopy('ROYALPLAY.OFICIAL.ARG')}
                    className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedText === 'ROYALPLAY.OFICIAL.ARG' ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="font-mono-tech font-bold text-amber-300 text-sm">
                  ROYALPLAY.OFICIAL.ARG
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase">CBU 22 Dígitos:</span>
                  <button
                    onClick={() => handleCopy('0070001620000018293014')}
                    className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedText === '0070001620000018293014' ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="font-mono-tech text-xs text-slate-300 break-all">
                  0070001620000018293014
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-[11px] text-rose-300 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Control Regulador LOTBA
              </span>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Solo se aceptan transferencias originadas desde cuentas bancarias donde el titular coincida con el
                DNI {user.dni} registrado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WITHDRAW */}
      {activeTab === 'withdraw' && (
        <div className="max-w-2xl mx-auto bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold font-serif-luxury text-amber-300">
              Solicitud de Retiro Bancario a CBU / Alias
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Transferencia bancaria directa a tu cuenta en pesos argentinos. Plazo estimado: 24 a 48 hs hábiles.
            </p>
          </div>

          {/* KYC Status Check */}
          {user.kycStatus !== 'approved' && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <div>
                <strong className="block">Verificación de Identidad (KYC) Requerida</strong>
                <span>
                  Debes subir la foto de tu DNI frente y dorso en la sección de Perfil antes de solicitar retiros.
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                CBU o Alias de Cuenta Bancaria Titular:
              </label>
              <input
                type="text"
                value={cbuAlias}
                onChange={e => setCbuAlias(e.target.value)}
                placeholder="Ej: ROSSI.BANCO.GALICIA o 0720..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono-tech font-bold text-white focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                El titular bancario debe coincidir exactamente con: <strong>{user.fullName} (DNI: {user.dni})</strong>
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Monto a Retirar (ARS):</span>
                <span className="text-slate-400">
                  Saldo real retirable: <strong className="text-emerald-400">${wallet.realBalance.toLocaleString('es-AR')}</strong>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono-tech font-bold text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="5000"
                  max={wallet.realBalance}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono-tech font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {withdrawResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  withdrawResult.success
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
              >
                {withdrawResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{withdrawResult.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={withdrawLoading || withdrawAmount <= 0 || withdrawAmount > wallet.realBalance}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-serif-luxury font-black text-sm tracking-wider shadow-xl gold-glow hover:brightness-110 active:scale-98 transition disabled:opacity-50"
            >
              {withdrawLoading ? 'GENERANDO SOLICITUD...' : `SOLICITAR RETIRO • $${withdrawAmount.toLocaleString('es-AR')} ARS`}
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif-luxury text-amber-300">
              Libro Contable de Movimientos
            </h3>

            <div className="flex items-center gap-1.5 text-xs">
              {['all', 'deposit', 'withdraw', 'win', 'bet'].map(f => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-1.5 rounded-lg uppercase text-[10px] font-mono-tech font-bold transition ${
                    historyFilter === f
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f === 'deposit' ? 'Depósitos' : f === 'withdraw' ? 'Retiros' : f === 'win' ? 'Premios' : 'Apuestas'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono-tech text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Referencia</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Detalle</th>
                    <th className="py-3 px-4">Importe</th>
                    <th className="py-3 px-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-tech">
                  {filteredTransactions.map(tx => {
                    const isCredit = tx.type === 'deposit' || tx.type === 'win' || tx.type === 'bonus';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString('es-AR')} {new Date(tx.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-300">{tx.referenceCode}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.type === 'deposit'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : tx.type === 'withdraw'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : tx.type === 'win'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{tx.notes || tx.method}</td>
                        <td className={`py-3 px-4 font-bold whitespace-nowrap ${isCredit ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {isCredit ? '+' : '-'}${tx.amount.toLocaleString('es-AR')} ARS
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : tx.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {tx.status === 'completed' ? 'Aprobado' : tx.status === 'pending' ? 'En Revisión' : 'Rechazado'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
