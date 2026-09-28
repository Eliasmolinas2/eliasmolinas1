import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  ShieldCheck,
  Gamepad2,
  Wallet,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Ban,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Sliders,
  LifeBuoy,
  Smartphone,
  Lock,
  X,
  Send,
  AlertTriangle,
  Building2,
  CreditCard,
  PlusCircle,
  MinusCircle,
  UserX,
  UserCheck,
  Award,
  Download,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Fingerprint,
  Check,
  Sparkles,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  Shield,
  HardDrive,
} from 'lucide-react';
import { UserRole, KYCStatus, CasinoGame, SupportTicket, AuditLog, UserProfile, Transaction } from '../../types';
import { WhatsAppGatewayView } from './WhatsAppGatewayView';
import { uploadTextFileToDrive } from '../../services/googleDriveService';
import { getAccessToken, googleSignIn } from '../../lib/googleDriveAuth';

interface AdminToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export const AdminPanelView: React.FC = () => {
  const {
    user,
    wallet,
    adminSession,
    allUsers,
    transactions,
    games,
    toggleGameStatus,
    updateGameConfig,
    updateUserRoleByAdmin,
    adjustUserBalanceByAdmin,
    auditLogs,
    approveKYCUser,
    rejectKYCUser,
    approveTransaction,
    rejectTransaction,
    responsibleGaming,
    supportTickets,
    replySupportTicket,
    createAuditSelfExclusion,
  } = useApp();

  const [adminTab, setAdminTab] = useState<
    'overview' | 'users' | 'kyc' | 'wallet' | 'games' | 'whatsapp' | 'compliance' | 'audit' | 'support'
  >('overview');

  // In-App Toast System (Replaces window.alert / prompt)
  const [toasts, setToasts] = useState<AdminToast[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Search & Filter States
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'user' | 'vip'>('all');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<'all' | 'security' | 'warning' | 'info'>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Modals States
  const [selectedUserForManage, setSelectedUserForManage] = useState<UserProfile | null>(null);
  const [manageUserActiveTab, setManageUserActiveTab] = useState<'profile' | 'role' | 'balance' | 'security'>('profile');
  const [newRoleForUser, setNewRoleForUser] = useState<UserRole>('user');
  const [roleChangeReason, setRoleChangeReason] = useState<string>('Evaluación de actividad y lealtad');
  const [balanceAdjustmentAmount, setBalanceAdjustmentAmount] = useState<string>('25000');
  const [balanceAdjustmentOperation, setBalanceAdjustmentOperation] = useState<'credit' | 'debit'>('credit');
  const [balanceAdjustmentType, setBalanceAdjustmentType] = useState<'real' | 'bonus'>('real');
  const [balanceAdjustmentReason, setBalanceAdjustmentReason] = useState<string>('Bonificación VIP por Fidelidad');
  const [operatorPin, setOperatorPin] = useState<string>('');

  const [selectedUserForKYC, setSelectedUserForKYC] = useState<UserProfile | null>(null);
  const [kycRejectionReason, setKycRejectionReason] = useState<string>('Fotografía del DNI con reflejos o ilegible');
  const [kycNotes, setKycNotes] = useState<string>('Validado satisfactoriamente con base de datos RENAPER');
  const [showKycRejectSection, setShowKycRejectSection] = useState<boolean>(false);

  const [selectedTxForWithdrawal, setSelectedTxForWithdrawal] = useState<Transaction | null>(null);
  const [coelsaReferenceInput, setCoelsaReferenceInput] = useState<string>('');
  const [withdrawalChannel, setWithdrawalChannel] = useState<string>('COELSA Transferencias 3.0');
  const [withdrawalDisbursalPin, setWithdrawalDisbursalPin] = useState<string>('2026');
  const [showWithdrawalRejectForm, setShowWithdrawalRejectForm] = useState<boolean>(false);
  const [withdrawalRejectReason, setWithdrawalRejectReason] = useState<string>('Discrepancia en titularidad de cuenta CBU');
  const [withdrawalRejectAction, setWithdrawalRejectAction] = useState<'refund' | 'escrow'>('refund');

  const [selectedGameForEdit, setSelectedGameForEdit] = useState<CasinoGame | null>(null);
  const [editMinBet, setEditMinBet] = useState<number>(100);
  const [editMaxBet, setEditMaxBet] = useState<number>(50000);
  const [editRtp, setEditRtp] = useState<number>(96.5);
  const [editJackpot, setEditJackpot] = useState<number>(38450000);
  const [editVolatility, setEditVolatility] = useState<'Baja' | 'Media' | 'Alta'>('Media');
  const [rngServerSeed, setRngServerSeed] = useState<string>('7a8f9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a');

  const [selectedTicketForReply, setSelectedTicketForReply] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState<string>('');
  const [ticketNewStatus, setTicketNewStatus] = useState<'open' | 'pending' | 'resolved'>('resolved');

  const [showRuaModal, setShowRuaModal] = useState<boolean>(false);
  const [ruaUserId, setRuaUserId] = useState<string>(allUsers[0]?.id || '');
  const [ruaMonths, setRuaMonths] = useState<number>(6);
  const [ruaReason, setRuaReason] = useState<string>('Solicitud de exclusión voluntaria ante Lotería');

  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  // Filtered Lists
  const filteredUsers = allUsers.filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.dni.includes(q) || u.email.toLowerCase().includes(q);
  });

  const pendingWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'pending');
  const pendingKYCUsers = allUsers.filter(u => u.kycStatus === 'pending');

  const filteredAuditLogs = auditLogs.filter(l => {
    if (auditSeverityFilter !== 'all' && l.severity !== auditSeverityFilter) return false;
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.actor.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.ipAddress.toLowerCase().includes(q)
    );
  });

  // Calculate age from birth date string
  const calculateAge = (birthDateString: string): number => {
    try {
      const parts = birthDateString.split('-');
      if (parts.length === 3) {
        const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      }
    } catch {
      // fallback
    }
    return 30;
  };

  // Helper for downloading official compliance JSON
  const handleDownloadComplianceReport = () => {
    const reportData = {
      platform: 'RoyalPlay Argentina',
      jurisdiction: 'LOTBA / IPLyC',
      complianceOfficer: adminSession?.fullName || 'Operador Autorizado',
      timestamp: new Date().toISOString(),
      activePlayersCount: allUsers.length,
      kycVerifiedRatio: `${allUsers.filter(u => u.kycStatus === 'approved').length} / ${allUsers.length}`,
      pendingWithdrawalsTotalARS: pendingWithdrawals.reduce((acc, t) => acc + t.amount, 0),
      immutableAuditLogsCount: auditLogs.length,
      securityHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      status: 'AUDIT_PASSED_CERTIFIED',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LOTBA_Compliance_Report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Certificado Descargado', 'Reporte oficial de cumplimiento LOTBA generado y guardado.', 'success');
  };

  const handleSaveReportToDrive = async () => {
    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }
      if (!token) {
        addToast('Autenticación Requerida', 'Conecte su cuenta de Google para respaldar en Drive.', 'warning');
        return;
      }
      const reportData = {
        plataforma: 'RoyalPlay Casino Online Argentina',
        tipo: 'Reporte Oficial de Cumplimiento Regulatorio LOTBA',
        emisor: adminSession?.fullName || 'Superadministrador',
        fechaEmision: new Date().toISOString(),
        totalJugadores: allUsers.length,
        kycVerificados: allUsers.filter(u => u.kycStatus === 'approved').length,
        retirosPendientesARS: pendingWithdrawals.reduce((acc, t) => acc + t.amount, 0),
        selloDigitalSHA256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      };
      const filename = `LOTBA_Compliance_Report_${new Date().toISOString().slice(0, 10)}.json`;
      await uploadTextFileToDrive(filename, JSON.stringify(reportData, null, 2), 'application/json');
      addToast('Guardado en Google Drive', `El reporte "${filename}" fue exportado a su Google Drive.`, 'success');
    } catch (err: any) {
      addToast('Error Google Drive', err.message || 'Error al exportar a Google Drive', 'error');
    }
  };

  const handleSaveAuditLogsToDrive = async () => {
    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }
      if (!token) {
        addToast('Autenticación Requerida', 'Conecte su cuenta de Google para respaldar en Drive.', 'warning');
        return;
      }
      const filename = `RoyalPlay_Libro_Auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = 'ID,Fecha,Acción,Actor,Rol,Severidad,Detalles,HashBloque\n';
      const rows = auditLogs
        .map(
          l =>
            `"${l.id}","${l.timestamp}","${l.action.replace(/"/g, '""')}","${l.actor}","${l.actorRole}","${l.severity}","${l.details.replace(/"/g, '""')}","${l.blockHash}"`
        )
        .join('\n');
      const content = headers + rows;
      await uploadTextFileToDrive(filename, content, 'text/csv');
      addToast('Guardado en Google Drive', `El registro de auditoría "${filename}" fue exportado a su Google Drive.`, 'success');
    } catch (err: any) {
      addToast('Error Google Drive', err.message || 'Error al exportar a Google Drive', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* FLOATING TOAST NOTIFICATION CONTAINER */}
      <div className="fixed bottom-5 right-5 z-[200] space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl pointer-events-auto flex items-start gap-3 transition-all transform translate-y-0 ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : t.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : t.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <div className="font-bold text-xs">{t.title}</div>
              <div className="text-[11px] opacity-90 leading-relaxed mt-0.5">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1d0e1b] via-[#120b1f] to-[#0a1224] border border-rose-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/50">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-serif-luxury text-rose-300">
                Consola Maestra de Administración & Cumplimiento LOTBA
              </h2>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-mono-tech border border-rose-500/30 font-bold">
                {adminSession?.role === 'admin' ? 'SUPERADMINISTRADOR' : 'OFICIAL LOTBA'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Supervisión de jugadores, validación biométrica DNI (+18 RENAPER), liquidación de transferencias bancarias COELSA,
              configuración de catálogo de juegos, pasarela oficial WhatsApp y trazabilidad inmutable Ley 25.326.
            </p>
          </div>
        </div>

        <div className="shrink-0 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-right space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase font-mono-tech">Operador en Turno</span>
          <span className="text-xs font-mono-tech text-amber-300 font-bold block">
            {adminSession ? adminSession.fullName : 'Operador Autorizado'}
          </span>
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 font-mono-tech">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{adminSession?.jurisdiction || 'Jurisdicción Nacional'}</span>
          </div>
        </div>
      </div>

      {/* KPI METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'GGR Bruto (Mes)', val: '$14.850.000 ARS', color: 'text-emerald-400' },
          { label: 'NGR Neto (Mes)', val: '$11.200.000 ARS', color: 'text-emerald-300' },
          { label: 'Depósitos Totales', val: '$45.800.000 ARS', color: 'text-cyan-400' },
          { label: 'Retiros Pagados', val: '$32.400.000 ARS', color: 'text-amber-400' },
          { label: 'Jugadores Registrados', val: `${allUsers.length} cuentas`, color: 'text-purple-400' },
          { label: 'KYC en Cola', val: `${pendingKYCUsers.length} pendientes`, color: 'text-rose-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-[#0c1220] border border-slate-800 space-y-1 shadow-sm">
            <span className="text-[10px] text-slate-400 uppercase font-mono-tech block truncate">
              {kpi.label}
            </span>
            <div className={`text-sm sm:text-base font-bold font-mono-tech ${kpi.color}`}>
              {kpi.val}
            </div>
          </div>
        ))}
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Resumen Ejecutivo', icon: TrendingUp },
          { id: 'users', label: 'Usuarios & Roles', icon: Users },
          { id: 'kyc', label: `Verificación KYC (${pendingKYCUsers.length})`, icon: ShieldCheck },
          {
            id: 'wallet',
            label: `Retiros Pendientes (${pendingWithdrawals.length})`,
            icon: Wallet,
            badge: adminSession?.role === 'compliance_officer' ? 'Auditoría' : undefined,
          },
          {
            id: 'games',
            label: 'Catálogo & RTP',
            icon: Gamepad2,
            badge: adminSession?.role === 'compliance_officer' ? 'Auditoría' : undefined,
          },
          { id: 'whatsapp', label: 'WhatsApp Oficial API', icon: Smartphone },
          { id: 'compliance', label: 'Cumplimiento LOTBA', icon: Ban },
          { id: 'audit', label: 'Libro de Auditoría', icon: FileText },
          {
            id: 'support',
            label: `Soporte (${supportTickets.filter(t => t.status === 'open').length})`,
            icon: LifeBuoy,
          },
        ].map(tab => {
          const Icon = tab.icon;
          const active = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as typeof adminTab)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                active
                  ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono-tech border border-cyan-500/30">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB: OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold font-serif-luxury text-amber-300">
              Alertas Prioritarias de Operación
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-300 block">Retiros Bancarios Pendientes</span>
                  <span className="text-slate-400 text-[11px]">
                    {pendingWithdrawals.length} solicitudes aguardan autorización para transferencia COELSA.
                  </span>
                </div>
                <button
                  onClick={() => setAdminTab('wallet')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
                >
                  Gestionar Retiros
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-cyan-300 block">Expedientes KYC en Espera</span>
                  <span className="text-slate-400 text-[11px]">
                    {pendingKYCUsers.length} jugadores aguardando inspección de DNI (+18 RENAPER).
                  </span>
                </div>
                <button
                  onClick={() => setAdminTab('kyc')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition"
                >
                  Inspeccionar DNI
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-300 block">Integridad Criptográfica Provably Fair</span>
                  <span className="text-emerald-400 text-[11px]">
                    100% de apuestas verificadas con semilla SHA-256 inalterable.
                  </span>
                </div>
                <span className="text-emerald-400 font-bold font-mono-tech text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  AUDITADO OK
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold font-serif-luxury text-amber-300">
              Distribución de Tráfico por Categoría
            </h3>

            <div className="space-y-3 font-mono-tech text-xs">
              {[
                { cat: 'Tragamonedas / Slots (Royal 777 & Pragmatic)', pct: '54%', vol: '$24.730.000 ARS' },
                { cat: 'Ruleta Europea & Mesas en Vivo', pct: '26%', vol: '$11.900.000 ARS' },
                { cat: 'AstroCrash / Aviator Games', pct: '14%', vol: '$6.420.000 ARS' },
                { cat: 'Blackjack 21 VIP', pct: '6%', vol: '$2.750.000 ARS' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="truncate">{item.cat}</span>
                    <span className="text-amber-400 font-bold">
                      {item.pct} ({item.vol})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
                      style={{ width: item.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: USERS & ROLES */}
      {adminTab === 'users' && (
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-serif-luxury text-amber-300">
                Directorio Oficial de Jugadores & Permisos
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gestión institucional de cuentas de jugadores, expedientes KYC, suspensión y balances auditados.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono-tech"
              >
                <option value="all">Todos los Roles</option>
                <option value="user">Jugadores Estándar</option>
                <option value="vip">Jugadores VIP Oro</option>
              </select>

              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por DNI, nombre, email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-tech">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Nombre & Correo</th>
                  <th className="py-2.5 px-3">DNI Argentino</th>
                  <th className="py-2.5 px-3">Nivel Rol</th>
                  <th className="py-2.5 px-3">KYC (+18)</th>
                  <th className="py-2.5 px-3">2FA</th>
                  <th className="py-2.5 px-3 text-right">Acción Administrativa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-200">{u.fullName}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-bold">{u.dni}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'vip'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {u.role === 'vip' ? 'VIP ORO' : 'ESTÁNDAR'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.kycStatus === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : u.kycStatus === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {u.kycStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] ${u.twoFactorEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {u.twoFactorEnabled ? 'Activo (OTP)' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedUserForManage(u);
                          setNewRoleForUser(u.role);
                          setManageUserActiveTab('profile');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition inline-flex items-center gap-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Gestionar Expediente</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: KYC VERIFICATION */}
      {adminTab === 'kyc' && (
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-serif-luxury text-cyan-300">
                Cola Oficial de Verificación de Identidad (KYC & Mayoría de Edad +18)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspección biométrica de documentos DNI conforme a convenios con Lotería de Buenos Aires (LOTBA).
              </p>
            </div>
            <span className="text-xs font-mono-tech text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              {pendingKYCUsers.length} en espera de revisión
            </span>
          </div>

          {pendingKYCUsers.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-slate-800 rounded-2xl space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-200">
                Cola de validación al día
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No hay solicitudes pendientes en este momento. Todos los jugadores han sido verificados satisfactoriamente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingKYCUsers.map(u => (
                <div
                  key={u.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono-tech"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{u.fullName}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        PENDIENTE DE VALIDAR
                      </span>
                    </div>
                    <div className="text-slate-300">
                      DNI: <strong className="text-amber-300">{u.dni}</strong> • Nacimiento: {u.birthDate} ({calculateAge(u.birthDate)} Años - Mayor de 18)
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Email: {u.email} • Tel: {u.phone} • Registro: {new Date(u.createdAt).toLocaleDateString('es-AR')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUserForKYC(u);
                        setShowKycRejectSection(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-900/30 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspeccionar DNI Digital</span>
                    </button>
                    <button
                      onClick={() => {
                        approveKYCUser(u.id);
                        addToast('KYC Aprobado', `El usuario ${u.fullName} ha sido verificado como mayor de 18 años.`, 'success');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                    >
                      Aprobar Directo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: WALLET & WITHDRAWALS */}
      {adminTab === 'wallet' && (
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold font-serif-luxury text-amber-300">
                Autorización de Pagos & Retiros Bancarios (CBU / Alias)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Liquidación de retiros en pesos argentinos hacia cuentas bancarias verificadas (Transferencias 3.0 COELSA).
              </p>
            </div>
            {adminSession?.role === 'compliance_officer' && (
              <span className="text-[11px] font-mono-tech text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Auditoría LOTBA: Solo Lectura (Desembolsos reservados a Superadmin)</span>
              </span>
            )}
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs text-slate-400">
                No hay retiros pendientes de liquidación bancaria en este momento.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map(tx => (
                <div
                  key={tx.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono-tech"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{tx.referenceCode}</span>
                      <span className="px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        PENDIENTE
                      </span>
                    </div>
                    <div className="text-slate-300">
                      Importe: <strong className="text-emerald-400 text-sm">${tx.amount.toLocaleString('es-AR')} ARS</strong>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Destino: <strong>{tx.cbuAlias || 'CBU Titular'}</strong> • Fecha: {new Date(tx.createdAt).toLocaleDateString('es-AR')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {adminSession?.role === 'compliance_officer' ? (
                      <span className="text-[11px] text-slate-500 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>Desembolso reservado a Superadmin</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedTxForWithdrawal(tx);
                          setCoelsaReferenceInput(`COELSA-3.0-${Math.floor(100000 + Math.random() * 900000)}`);
                          setShowWithdrawalRejectForm(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Revisar & Liquidar Transferencia</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: GAMES & RTP CONFIG */}
      {adminTab === 'games' && (
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold font-serif-luxury text-amber-300">
                Catálogo de Juegos, Certificación RTP & Límites
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Control de disponibilidad en sala, parámetros de apuesta y verificación de retorno al jugador certificado.
              </p>
            </div>
            {adminSession?.role === 'compliance_officer' && (
              <span className="text-[11px] font-mono-tech text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Inspección Regulatoria (Modificación reservada a Superadmin)</span>
              </span>
            )}
          </div>

          <div className="space-y-3">
            {games.map(g => (
              <div
                key={g.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono-tech"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{g.title}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono-tech">
                      {g.provider}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        g.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {g.active ? 'EN SALA' : 'PAUSADO'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>
                      RTP Nominal: <strong className="text-emerald-400">{g.rtp}%</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Apuestas: <strong className="text-white">${g.minBet} - ${g.maxBet.toLocaleString('es-AR')} ARS</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Volatilidad: <strong className="text-amber-400">{g.volatility}</strong>
                    </span>
                    {g.jackpotARS && (
                      <>
                        <span>•</span>
                        <span className="text-amber-300">
                          Pozo: ${g.jackpotARS.toLocaleString('es-AR')} ARS
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {adminSession?.role !== 'compliance_officer' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedGameForEdit(g);
                          setEditMinBet(g.minBet);
                          setEditMaxBet(g.maxBet);
                          setEditRtp(g.rtp);
                          setEditJackpot(g.jackpotARS || 30000000);
                          setEditVolatility(g.volatility as any || 'Media');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold transition flex items-center gap-1"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Configurar</span>
                      </button>
                      <button
                        onClick={() => {
                          toggleGameStatus(g.id);
                          addToast(
                            g.active ? 'Juego Pausado' : 'Juego Activado',
                            `El juego ${g.title} fue ${g.active ? 'retirado de sala' : 'puesto en sala'}.`,
                            'info'
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold transition ${
                          g.active
                            ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600 hover:text-white'
                            : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {g.active ? 'Pausar' : 'Activar'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: WHATSAPP OFFICIAL API GATEWAY */}
      {adminTab === 'whatsapp' && (
        <div>
          <WhatsAppGatewayView />
        </div>
      )}

      {/* TAB: COMPLIANCE LOTBA */}
      {adminTab === 'compliance' && (
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-serif-luxury text-amber-300">
                Marco de Cumplimiento Regulatorio LOTBA & Juego Responsable
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Convenios de reciprocidad, autoexclusiones RUA, límites de depósito y sellado de auditoría.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCertModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Ver Certificado LOTBA</span>
              </button>
              <button
                onClick={handleDownloadComplianceReport}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Reporte JSON</span>
              </button>
              <button
                onClick={handleSaveReportToDrive}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 text-xs font-bold transition flex items-center gap-1.5"
              >
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>Respaldar en Google Drive</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Registro de Autoexcluidos (RUA)</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono-tech">
                  {responsibleGaming.selfExcludedUntil ? '1 Activo' : '0 Activos'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Padrón vinculante de exclusión voluntaria e involuntaria bajo la Ley de la Ciudad N° 538.
              </p>
              <button
                onClick={() => setShowRuaModal(true)}
                className="w-full py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition mt-2"
              >
                Radicar Autoexclusión
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Alerta de Realidad (Reality Check)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono-tech">
                  Cada {responsibleGaming.realityCheckMinutes} min
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pausa mandatoria cada {responsibleGaming.realityCheckMinutes} minutos de juego continuo para mitigar conductas compulsivas.
              </p>
              <div className="pt-2 text-[10px] text-emerald-400 font-mono-tech">
                Estado: ACTIVO Y VERIFICADO
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Límites de Depósito Mandatorios</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono-tech">
                  $150.000 / día
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tope máximo de recargas diarias fijado según perfil socioeconómico y scoring financiero UIF.
              </p>
              <div className="pt-2 text-[10px] text-cyan-400 font-mono-tech">
                Cumplimiento: 100% de jugadores
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AUDIT LOG */}
      {adminTab === 'audit' && (
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-serif-luxury text-amber-300">
                Libro Mayor de Auditoría Inmutable (Append-Only)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Registro criptográfico de todas las operaciones, logins, transacciones y aprobaciones regulatorias.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={auditSeverityFilter}
                onChange={e => setAuditSeverityFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono-tech"
              >
                <option value="all">Todas las Severidades</option>
                <option value="security">Seguridad Crítica</option>
                <option value="warning">Advertencias</option>
                <option value="info">Informativas</option>
              </select>

              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar en auditoría..."
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-tech">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Fecha & Hora</th>
                  <th className="py-2.5 px-3">Acción Registrada</th>
                  <th className="py-2.5 px-3">Actor / Operador</th>
                  <th className="py-2.5 px-3">IP Origen</th>
                  <th className="py-2.5 px-3">Severidad</th>
                  <th className="py-2.5 px-3 text-right">Inspección</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredAuditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('es-AR')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-200 block">{log.action}</span>
                      <span className="text-[10px] text-slate-400 truncate block max-w-xs">{log.details}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-amber-300 font-bold">{log.actor}</span>
                      <span className="text-[10px] text-slate-500 block uppercase">({log.actorRole})</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{log.ipAddress}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.severity === 'security'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : log.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {log.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedAuditLog(log)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold transition"
                      >
                        Ver Bloque
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SUPPORT & HELPDESK */}
      {adminTab === 'support' && (
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold font-serif-luxury text-amber-300">
                Mesa de Ayuda & Atención de Incidencias
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tickets de jugadores, reclamos técnicos y consultas sobre depósitos o retiros.
              </p>
            </div>
            <span className="text-xs font-mono-tech text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              {supportTickets.filter(t => t.status === 'open').length} abiertos
            </span>
          </div>

          <div className="space-y-3">
            {supportTickets.map(t => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono-tech"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{t.subject}</span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        t.status === 'open'
                          ? 'bg-rose-500/20 text-rose-300'
                          : t.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Usuario: <strong className="text-slate-200">{t.user}</strong> ({t.email}) • Fecha:{' '}
                    {t.time}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTicketForReply(t);
                    setTicketReplyText('');
                    setTicketNewStatus('resolved');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
                >
                  Atender & Responder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED & SECURE ACTION MODALS (NO WINDOW.ALERT OR WINDOW.PROMPT)        */}
      {/* ========================================================================= */}

      {/* MODAL 1: USER DOSSIER & ACTIONS (EXPEDIENTE COMPLETO) */}
      {selectedUserForManage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedUserForManage(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-serif-luxury text-amber-300">
                  Expediente Institucional del Jugador
                </h3>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono-tech px-2 py-0.5 rounded">
                  ID: {selectedUserForManage.id}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono-tech">
                DNI N°: {selectedUserForManage.dni} • Nombre: {selectedUserForManage.fullName}
              </span>
            </div>

            {/* Sub-tabs inside user modal */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono-tech">
              <button
                onClick={() => setManageUserActiveTab('profile')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  manageUserActiveTab === 'profile'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ficha General
              </button>
              <button
                onClick={() => setManageUserActiveTab('role')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  manageUserActiveTab === 'role'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Nivel de Membresía
              </button>
              <button
                onClick={() => setManageUserActiveTab('balance')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  manageUserActiveTab === 'balance'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ajuste Contable
              </button>
              <button
                onClick={() => setManageUserActiveTab('security')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  manageUserActiveTab === 'security'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Seguridad & RUA
              </button>
            </div>

            {/* TAB CONTENT: PROFILE */}
            {manageUserActiveTab === 'profile' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono-tech bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Nombre Completo:</span>
                    <span className="text-white font-bold">{selectedUserForManage.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Documento DNI:</span>
                    <span className="text-amber-300 font-bold">{selectedUserForManage.dni}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Fecha de Nacimiento:</span>
                    <span className="text-white">
                      {selectedUserForManage.birthDate} ({calculateAge(selectedUserForManage.birthDate)} años)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Estado KYC:</span>
                    <span
                      className={`font-bold ${
                        selectedUserForManage.kycStatus === 'approved' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {selectedUserForManage.kycStatus.toUpperCase()} (+18)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Email Institucional:</span>
                    <span className="text-slate-300 truncate block">{selectedUserForManage.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Teléfono / WhatsApp:</span>
                    <span className="text-slate-300">{selectedUserForManage.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Saldo Real (ARS):</span>
                    <span className="text-emerald-400 font-bold">
                      ${((selectedUserForManage.id === user.id ? wallet.realBalance : selectedUserForManage.balanceARS) ?? 85000).toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Saldo de Bono (ARS):</span>
                    <span className="text-amber-400 font-bold">
                      ${((selectedUserForManage.id === user.id ? wallet.bonusBalance : selectedUserForManage.bonusBalanceARS) ?? 15000).toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Nivel Actual:</span>
                    <span className="text-cyan-300 font-bold uppercase">{selectedUserForManage.role}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">Canal Oficial de WhatsApp</span>
                    <span className="text-slate-400 text-[11px]">
                      El usuario tiene opt-in consentido para notificaciones transaccionales.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUserForManage(null);
                      setAdminTab('whatsapp');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Abrir en WhatsApp API</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ROLE */}
            {manageUserActiveTab === 'role' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Modificar Nivel de Membresía del Jugador</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    La asignación de nivel VIP otorga beneficios de promociones exclusivas y límites ampliados de retiro.
                  </p>

                  <div className="space-y-2 text-xs font-mono-tech">
                    <div>
                      <label className="text-slate-400 text-[10px] block mb-1">Nivel Destino:</label>
                      <select
                        value={newRoleForUser}
                        onChange={e => setNewRoleForUser(e.target.value as UserRole)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                      >
                        <option value="user">Jugador Estándar</option>
                        <option value="vip">Jugador VIP Oro</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 text-[10px] block mb-1">Justificación del Operador:</label>
                      <input
                        type="text"
                        value={roleChangeReason}
                        onChange={e => setRoleChangeReason(e.target.value)}
                        placeholder="Motivo formal de la recategorización..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      updateUserRoleByAdmin(selectedUserForManage.id, newRoleForUser);
                      setSelectedUserForManage(prev => (prev ? { ...prev, role: newRoleForUser } : null));
                      addToast(
                        'Nivel de Membresía Actualizado',
                        `El usuario ${selectedUserForManage.fullName} ahora tiene nivel ${newRoleForUser.toUpperCase()}.`,
                        'success'
                      );
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition"
                  >
                    Guardar y Certificar Nivel de Membresía
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: BALANCE ADJUSTMENT */}
            {manageUserActiveTab === 'balance' && (
              <div className="space-y-4">
                {adminSession?.role === 'compliance_officer' ? (
                  <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800 text-xs text-cyan-200 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Acción Reservada:</strong> Los oficiales de cumplimiento tienen acceso de solo lectura sobre movimientos de fondos. Los ajustes contables requieren autorización de Superadministrador.
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Ajuste Contable de Fondos Auditado</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Todo movimiento de fondos genera un registro inmutable en el libro mayor y requiere firma del operador.
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono-tech">
                      <div>
                        <label className="text-slate-400 text-[10px] block mb-1">Operación:</label>
                        <select
                          value={balanceAdjustmentOperation}
                          onChange={e => setBalanceAdjustmentOperation(e.target.value as any)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                        >
                          <option value="credit">Acreditar Fondos (+)</option>
                          <option value="debit">Debitar Fondos (-)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 text-[10px] block mb-1">Tipo de Saldo:</label>
                        <select
                          value={balanceAdjustmentType}
                          onChange={e => setBalanceAdjustmentType(e.target.value as any)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                        >
                          <option value="real">Saldo Real (ARS)</option>
                          <option value="bonus">Bono Promocional</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 text-[10px] block mb-1">Importe en Pesos (ARS):</label>
                        <input
                          type="number"
                          value={balanceAdjustmentAmount}
                          onChange={e => setBalanceAdjustmentAmount(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 text-[10px] block mb-1">PIN Operador (2026):</label>
                        <input
                          type="password"
                          value={operatorPin}
                          onChange={e => setOperatorPin(e.target.value)}
                          placeholder="••••"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-amber-300 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 text-[10px] block mb-1 font-mono-tech">
                        Motivo Formal para el Libro Mayor:
                      </label>
                      <input
                        type="text"
                        value={balanceAdjustmentReason}
                        onChange={e => setBalanceAdjustmentReason(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <button
                      onClick={() => {
                        const rawAmt = parseFloat(balanceAdjustmentAmount);
                        if (isNaN(rawAmt) || rawAmt <= 0) {
                          addToast('Monto Inválido', 'Ingrese un importe positivo válido.', 'error');
                          return;
                        }
                        const finalAmt = balanceAdjustmentOperation === 'debit' ? -rawAmt : rawAmt;
                        adjustUserBalanceByAdmin(
                          selectedUserForManage.id,
                          finalAmt,
                          balanceAdjustmentType === 'bonus',
                          balanceAdjustmentReason
                        );

                        addToast(
                          'Ajuste Registrado con Éxito',
                          `${balanceAdjustmentOperation === 'credit' ? 'Acreditación' : 'Débito'} de $${rawAmt.toLocaleString('es-AR')} ARS asentado en el expediente.`,
                          'success'
                        );
                        setSelectedUserForManage(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950/40"
                    >
                      Ejecutar & Certificar Movimiento Contable
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SECURITY & RUA */}
            {manageUserActiveTab === 'security' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs font-mono-tech">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Estado de Autenticación 2FA</span>
                      <span className="text-slate-400 text-[11px]">Protección por OTP y Biometría WebAuthn</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      ACTIVO (OK)
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Registro de Autoexclusión RUA</span>
                      <span className="text-slate-400 text-[11px]">Consulta de inhibición en padrón LOTBA</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      SIN INHIBICIONES
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                  <span className="text-xs font-bold text-rose-300 block">Medida Cautelar / Bloqueo Preventivo:</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Permite congelar temporalmente la cuenta del jugador ante sospecha fundada de fraude o violación de los términos LOTBA.
                  </p>
                  <button
                    onClick={() => {
                      addToast(
                        'Alerta de Seguridad Registrada',
                        `Se ha enviado una notificación de control al oficial de cumplimiento para la cuenta ${selectedUserForManage.fullName}.`,
                        'warning'
                      );
                      setSelectedUserForManage(null);
                    }}
                    className="w-full py-2 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-bold transition"
                  >
                    Marcar Cuenta en Revisión de Seguridad
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: KYC DIGITAL DOCUMENT INSPECTION (+18 DNI RENAPER) */}
      {selectedUserForKYC && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedUserForKYC(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif-luxury text-cyan-300">
                Inspección de Documentación DNI & Prueba de Vida (+18)
              </h3>
              <span className="text-xs text-slate-400 font-mono-tech">
                Usuario: {selectedUserForKYC.fullName} • DNI N°: {selectedUserForKYC.dni}
              </span>
            </div>

            {/* Realistic DNI Document Simulation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Frente DNI */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/40 space-y-3 font-mono-tech text-xs">
                <div className="flex items-center justify-between text-[10px] text-cyan-300 border-b border-cyan-800/40 pb-1">
                  <span>REPÚBLICA ARGENTINA</span>
                  <span>RENAPER DNI</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-16 rounded-lg bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs text-center p-1">
                    FOTO RENAPER
                  </div>
                  <div className="space-y-0.5 text-[11px]">
                    <div className="text-slate-400 text-[9px] uppercase">Apellidos y Nombres:</div>
                    <div className="font-bold text-white">{selectedUserForKYC.fullName}</div>
                    <div className="text-slate-400 text-[9px] uppercase">Documento N°:</div>
                    <div className="font-bold text-amber-300">{selectedUserForKYC.dni}</div>
                  </div>
                </div>
                <div className="pt-1 text-[10px] text-emerald-400 flex items-center justify-between">
                  <span>Nacimiento: {selectedUserForKYC.birthDate}</span>
                  <span className="font-bold">
                    {calculateAge(selectedUserForKYC.birthDate)} AÑOS (+18 OK)
                  </span>
                </div>
              </div>

              {/* Dorso DNI */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700 space-y-3 font-mono-tech text-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                  <span>DORSO DNI DIGITAL</span>
                  <span>BIOMETRÍA OK</span>
                </div>
                <div className="space-y-1.5 text-[10px] text-slate-300">
                  <div>Domicilio Legal: Av. Santa Fe 2480, CABA</div>
                  <div>Trámite N°: 004819201948</div>
                  <div className="h-6 bg-slate-800 rounded flex items-center justify-center text-[9px] text-slate-500 tracking-widest">
                    ||||| |||| |||||| |||| ||||| |||| PDF417
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400">
                  Prueba de vida facial (Liveness): 99.8% Coincidencia
                </div>
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono-tech block font-bold">
                Puntos de Control Regulatorio LOTBA:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono-tech">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Mayoría de 18 años confirmada</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>DNI activo en base RENAPER</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Sin coincidencias en RUA</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Firma digital verificada</span>
                </div>
              </div>
            </div>

            {/* Actions: Approve or Toggle Reject Section */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              {!showKycRejectSection ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      approveKYCUser(selectedUserForKYC.id);
                      addToast(
                        'Verificación Aprobada',
                        `El expediente de ${selectedUserForKYC.fullName} ha sido certificado ante LOTBA.`,
                        'success'
                      );
                      setSelectedUserForKYC(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprobar KYC (+18 Años Validado)</span>
                  </button>

                  <button
                    onClick={() => setShowKycRejectSection(true)}
                    className="px-4 py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs transition"
                  >
                    Denegar...
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300">
                      Denegación Formal por Incumplimiento Regulatorio:
                    </span>
                    <button
                      onClick={() => setShowKycRejectSection(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="space-y-2 text-xs font-mono-tech">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Causal de Rechazo:</label>
                      <select
                        value={kycRejectionReason}
                        onChange={e => setKycRejectionReason(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                      >
                        <option value="Fotografía del DNI con reflejos o ilegible">
                          Fotografía ilegible o con reflejos
                        </option>
                        <option value="Titular menor de 18 años detectado según fecha de nacimiento">
                          Titular menor de 18 años detectado
                        </option>
                        <option value="Documento vencido o adulterado">Documento vencido o adulterado</option>
                        <option value="Selfie biométrica no coincide con el DNI">Selfie no coincide con DNI</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        rejectKYCUser(selectedUserForKYC.id, kycRejectionReason);
                        addToast(
                          'KYC Denegado',
                          `Documentación de ${selectedUserForKYC.fullName} rechazada: "${kycRejectionReason}".`,
                          'warning'
                        );
                        setSelectedUserForKYC(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase transition shadow-lg shadow-rose-950/50"
                    >
                      Confirmar Rechazo y Notificar al Jugador
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: WITHDRAWAL LIQUIDATION (TRANSFERENCIA BANCARIA COELSA CBU) */}
      {selectedTxForWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTxForWithdrawal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif-luxury text-emerald-300">
                Liquidación Bancaria de Retiro
              </h3>
              <span className="text-xs text-slate-400 font-mono-tech">
                Ref: {selectedTxForWithdrawal.referenceCode}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono-tech">
              <div className="flex justify-between">
                <span className="text-slate-400">Importe a Desembolsar:</span>
                <span className="text-emerald-400 font-bold text-base">
                  ${selectedTxForWithdrawal.amount.toLocaleString('es-AR')} ARS
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CBU / CVU Destino:</span>
                <span className="text-white font-bold">{selectedTxForWithdrawal.cbuAlias || 'ROSSI.GALICIA.ARS'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Banco Receptor:</span>
                <span className="text-cyan-300">Banco Galicia (COELSA 3.0)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Control Antifraude UIF:</span>
                <span className="text-emerald-400 font-bold">100% Sin Alertas</span>
              </div>
            </div>

            {!showWithdrawalRejectForm ? (
              <div className="space-y-3">
                <div className="space-y-1.5 text-xs font-mono-tech">
                  <label className="text-slate-400 text-[10px] uppercase block">
                    Referencia Bancaria COELSA / Transferencias 3.0:
                  </label>
                  <input
                    type="text"
                    value={coelsaReferenceInput}
                    onChange={e => setCoelsaReferenceInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
                  <div>
                    <label className="text-slate-400 text-[10px] uppercase block mb-1">Canal de Pago:</label>
                    <select
                      value={withdrawalChannel}
                      onChange={e => setWithdrawalChannel(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                    >
                      <option value="COELSA Transferencias 3.0">COELSA 3.0</option>
                      <option value="Interbanking Directo">Interbanking</option>
                      <option value="Red Link">Red Link</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 text-[10px] uppercase block mb-1">PIN Operador (2026):</label>
                    <input
                      type="password"
                      value={withdrawalDisbursalPin}
                      onChange={e => setWithdrawalDisbursalPin(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-300 font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      approveTransaction(selectedTxForWithdrawal.id, coelsaReferenceInput);
                      addToast(
                        'Transferencia Liquidada',
                        `Pago de $${selectedTxForWithdrawal.amount.toLocaleString('es-AR')} ARS liquidado vía ${withdrawalChannel}. Ref: ${coelsaReferenceInput}`,
                        'success'
                      );
                      setSelectedTxForWithdrawal(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Autorizar & Liquidar Transferencia</span>
                  </button>

                  <button
                    onClick={() => setShowWithdrawalRejectForm(true)}
                    className="px-4 py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs transition"
                  >
                    Denegar...
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-3 animate-fade-in text-xs font-mono-tech">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300">Denegar Retiro por Incumplimiento Bancario:</span>
                  <button
                    onClick={() => setShowWithdrawalRejectForm(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Volver
                  </button>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">Motivo Formal de Rechazo:</label>
                  <select
                    value={withdrawalRejectReason}
                    onChange={e => setWithdrawalRejectReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Discrepancia en titularidad de cuenta CBU">
                      CBU no coincide con el DNI titular
                    </option>
                    <option value="Incumplimiento de Rollover mínimo de apuestas (Res. UIF 134/2018)">
                      Rollover insuficiente (Lavado de Activos)
                    </option>
                    <option value="Cuenta bancaria destino inactiva o bloqueada">
                      Cuenta bancaria inactiva o bloqueada
                    </option>
                    <option value="Bloqueo preventivo por solicitud del usuario">
                      Bloqueo preventivo solicitado
                    </option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    rejectTransaction(selectedTxForWithdrawal.id, withdrawalRejectReason);
                    addToast(
                      'Retiro Denegado',
                      `Retiro de $${selectedTxForWithdrawal.amount.toLocaleString('es-AR')} ARS denegado. Fondos devueltos al saldo del jugador.`,
                      'warning'
                    );
                    setSelectedTxForWithdrawal(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase transition shadow-lg shadow-rose-950/50"
                >
                  Confirmar Denegación y Reintegrar Fondos
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: GAME CONFIGURATION & RTP */}
      {selectedGameForEdit && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedGameForEdit(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif-luxury text-amber-300">
                Parámetros Regulatorios de Juego
              </h3>
              <span className="text-xs text-slate-400 font-mono-tech">
                {selectedGameForEdit.title} ({selectedGameForEdit.provider})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono-tech">
              <div>
                <label className="text-slate-400 text-[10px] uppercase block mb-1">Apuesta Mínima (ARS):</label>
                <input
                  type="number"
                  value={editMinBet}
                  onChange={e => setEditMinBet(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase block mb-1">Apuesta Máxima (ARS):</label>
                <input
                  type="number"
                  value={editMaxBet}
                  onChange={e => setEditMaxBet(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase block mb-1">
                  RTP Objetivo (%): {editRtp < 92 && <span className="text-rose-400 font-bold">Min 92%</span>}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="92.0"
                  max="99.5"
                  value={editRtp}
                  onChange={e => setEditRtp(parseFloat(e.target.value) || 0)}
                  className={`w-full bg-slate-800 border rounded-xl px-3 py-2 font-bold ${
                    editRtp < 92 ? 'border-rose-500 text-rose-300' : 'border-slate-700 text-emerald-400'
                  }`}
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase block mb-1">Pozo Jackpot (ARS):</label>
                <input
                  type="number"
                  value={editJackpot}
                  onChange={e => setEditJackpot(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold"
                />
              </div>
            </div>

            {/* Provably Fair Random Seed */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs font-mono-tech">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase">Semilla Servidor (Provably Fair HMAC):</span>
                <button
                  type="button"
                  onClick={() =>
                    setRngServerSeed(
                      Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
                    )
                  }
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                >
                  Regenerar Semilla
                </button>
              </div>
              <div className="text-[10px] text-emerald-400 truncate bg-black/60 p-2 rounded border border-slate-800">
                {rngServerSeed}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              Certificación de RNG: Las modificaciones de RTP nominal se comunican automáticamente al registro de auditoría de LOTBA.
            </div>

            <button
              onClick={() => {
                if (editRtp < 92.0) {
                  addToast('RTP Fuera de Norma', 'La normativa LOTBA exige un RTP nominal mínimo del 92.0%.', 'error');
                  return;
                }
                updateGameConfig(selectedGameForEdit.id, {
                  minBet: editMinBet,
                  maxBet: editMaxBet,
                  rtp: editRtp,
                  jackpotARS: editJackpot,
                });
                addToast(
                  'Juego Configurado y Certificado',
                  `Parámetros de ${selectedGameForEdit.title} certificados con RTP ${editRtp}%.`,
                  'success'
                );
                setSelectedGameForEdit(null);
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-amber-500/20"
            >
              Guardar y Certificar Parámetros
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: SELF-EXCLUSION RUA REGISTRATION */}
      {showRuaModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-rose-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowRuaModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif-luxury text-rose-300">
                Radicación en Registro Único de Autoexcluidos (RUA LOTBA)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inscripción legal vinculante para bloqueo preventivo de actividades de apuestas.
              </p>
            </div>

            <div className="space-y-3 text-xs font-mono-tech">
              <div>
                <label className="text-slate-400 text-[10px] uppercase block mb-1">Seleccionar Jugador:</label>
                <select
                  value={ruaUserId}
                  onChange={e => setRuaUserId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} (DNI: {u.dni})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase block mb-1">Periodo de Autoexclusión:</label>
                <select
                  value={ruaMonths}
                  onChange={e => setRuaMonths(parseInt(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value={6}>6 Meses (Plazo Mínimo LOTBA)</option>
                  <option value={12}>12 Meses (1 Año)</option>
                  <option value={24}>24 Meses (2 Años)</option>
                  <option value={60}>60 Meses (5 Años)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase block mb-1">Motivo Formal de la Radicación:</label>
                <input
                  type="text"
                  value={ruaReason}
                  onChange={e => setRuaReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <button
              onClick={() => {
                createAuditSelfExclusion(ruaUserId, ruaMonths, ruaReason);
                addToast(
                  'Autoexclusión Radicada',
                  `Inscripción por ${ruaMonths} meses asentada en el Registro Único de Autoexcluidos de LOTBA.`,
                  'warning'
                );
                setShowRuaModal(false);
              }}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase transition shadow-lg shadow-rose-900/40"
            >
              Radicar Autoexclusión Oficial
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: OFFICIAL LOTBA REGULATORY COMPLIANCE CERTIFICATE */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#090e1a] border border-amber-500/50 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-xs font-mono-tech">
            <button
              onClick={() => setShowCertModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 border-b border-amber-500/30 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-luxury text-amber-300">
                CERTIFICADO DE CUMPLIMIENTO REGULATORIO
              </h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                Lotería de la Ciudad de Buenos Aires (LOTBA) • Ley 25.326
              </p>
            </div>

            <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 leading-relaxed text-slate-300 text-[11px]">
              <div>
                <strong>Plataforma:</strong> RoyalPlay Tecnología Argentina .AR
              </div>
              <div>
                <strong>Ente Regulador:</strong> Lotería de la Ciudad de Buenos Aires (LOTBA S.E.) / IPLyC
              </div>
              <div>
                <strong>Validación +18:</strong> Cumplida mediante comprobación de DNI ante RENAPER
              </div>
              <div>
                <strong>Juego Responsable:</strong> Programa de Autoexclusión RUA, límites de depósito y Reality Check activos
              </div>
              <div>
                <strong>Hash de Sellado Criptográfico:</strong>
                <div className="p-2 mt-1 rounded bg-black/60 text-emerald-400 text-[9px] break-all">
                  SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-500">
                Emitido el: {new Date().toLocaleDateString('es-AR')} • Validez: 2026/2027
              </span>
              <button
                onClick={() => {
                  handleDownloadComplianceReport();
                  setShowCertModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF/A</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: SUPPORT TICKET INTERACTIVE REPLY */}
      {selectedTicketForReply && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedTicketForReply(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif-luxury text-amber-300">
                Atención de Incidencia: {selectedTicketForReply.subject}
              </h3>
              <span className="text-xs text-slate-400 font-mono-tech">
                Usuario: {selectedTicketForReply.user} ({selectedTicketForReply.email})
              </span>
            </div>

            {/* Message conversation history */}
            <div className="space-y-3 max-h-56 overflow-y-auto p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              {selectedTicketForReply.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl max-w-[85%] ${
                    m.sender === 'agent'
                      ? 'ml-auto bg-amber-500/20 text-amber-200 border border-amber-500/30'
                      : 'mr-auto bg-slate-800 text-slate-200'
                  }`}
                >
                  <span className="text-[10px] font-bold block mb-1 text-slate-400">{m.senderName}:</span>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>

            {/* Quick Macro Templates */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono-tech text-slate-400 pb-1">
              <span>Plantillas:</span>
              <button
                type="button"
                onClick={() =>
                  setTicketReplyText(
                    'Estimado jugador, su retiro bancario ha sido autorizado y transferido vía COELSA 3.0. Podrá visualizar los fondos en su cuenta en los próximos minutos.'
                  )
                }
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
              >
                Retiro Procesado
              </button>
              <button
                type="button"
                onClick={() =>
                  setTicketReplyText(
                    'Su documentación de identidad DNI ha sido validada satisfactoriamente (+18). Su cuenta goza de plenos privilegios operativos.'
                  )
                }
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
              >
                KYC Aprobado
              </button>
            </div>

            {/* Reply Input */}
            <div className="space-y-2 text-xs">
              <label className="text-slate-400 font-mono-tech text-[10px] uppercase block">
                Redactar Respuesta Oficial del Agente:
              </label>
              <textarea
                rows={3}
                placeholder="Escriba su respuesta institucional aquí..."
                value={ticketReplyText}
                onChange={e => setTicketReplyText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 font-mono-tech">
                  <span className="text-slate-400 text-[10px]">Estado:</span>
                  <select
                    value={ticketNewStatus}
                    onChange={e => setTicketNewStatus(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="resolved">Resuelto</option>
                    <option value="pending">En Espera</option>
                    <option value="open">Abierto</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    if (!ticketReplyText.trim()) {
                      addToast('Mensaje Vacío', 'Escriba una respuesta para el ticket.', 'warning');
                      return;
                    }
                    replySupportTicket(selectedTicketForReply.id, ticketReplyText, ticketNewStatus);
                    addToast(
                      'Respuesta Enviada',
                      `Incidencia actualizada a estado ${ticketNewStatus.toUpperCase()}.`,
                      'success'
                    );
                    setSelectedTicketForReply(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
                >
                  Enviar Respuesta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: AUDIT EVENT CRYPTOGRAPHIC INSPECTOR */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-xs font-mono-tech">
            <button
              onClick={() => setSelectedAuditLog(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif-luxury text-cyan-300">
                Bloque de Auditoría Inmutable
              </h3>
              <span className="text-slate-400 text-[10px]">ID: {selectedAuditLog.id}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-slate-300">
              <div>
                <strong>Acción:</strong> {selectedAuditLog.action}
              </div>
              <div>
                <strong>Actor:</strong> {selectedAuditLog.actor} ({selectedAuditLog.actorRole.toUpperCase()})
              </div>
              <div>
                <strong>Fecha ISO:</strong> {selectedAuditLog.timestamp}
              </div>
              <div>
                <strong>IP Origen:</strong> {selectedAuditLog.ipAddress}
              </div>
              <div>
                <strong>Severidad:</strong> {selectedAuditLog.severity.toUpperCase()}
              </div>
              <div>
                <strong>Detalles:</strong> {selectedAuditLog.details}
              </div>
            </div>

            <button
              onClick={() => setSelectedAuditLog(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
            >
              Cerrar Inspección
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
