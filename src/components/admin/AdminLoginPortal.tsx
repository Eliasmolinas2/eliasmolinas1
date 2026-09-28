import React, { useState, useEffect } from 'react';
import { useApp, PREDEFINED_ADMIN_ACCOUNTS } from '../../context/AppContext';
import {
  ShieldAlert,
  Lock,
  KeyRound,
  ShieldCheck,
  UserCheck,
  ArrowLeft,
  AlertTriangle,
  Building2,
  FileCheck2,
  CheckCircle2,
  Fingerprint,
  Radio,
  Clock,
  Info,
} from 'lucide-react';

interface AdminLoginPortalProps {
  onBackToPlayerArea: () => void;
}

export const AdminLoginPortal: React.FC<AdminLoginPortalProps> = ({ onBackToPlayerArea }) => {
  const { loginAdmin } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('123456');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const interval = setInterval(() => {
        setLockoutTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTimer]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (lockoutTimer > 0) return;

    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      try {
        const res = loginAdmin(identifier, password, otpCode);
        if (!res.success) {
          const newFailed = failedAttempts + 1;
          setFailedAttempts(newFailed);
          if (newFailed >= 3) {
            setLockoutTimer(30);
            setErrorMessage('Demasiados intentos fallidos. Terminal bloqueada por 30 segundos por seguridad LOTBA.');
          } else {
            setErrorMessage(res.message || 'Error de autenticación administrativa');
          }
        } else {
          setFailedAttempts(0);
        }
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handlePopulateCredentials = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setOtpCode('123456');
    setErrorMessage(null);
    setShowCredentialsModal(false);
  };

  return (
    <div className="min-h-screen bg-[#04060d] text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background Security Grid & Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1528_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Security Header with Return to Public Site */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between z-10">
        <button
          onClick={onBackToPlayerArea}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Volver al Casino / Jugadores</span>
        </button>

        <div className="flex items-center gap-2.5 text-xs font-mono-tech text-rose-300 bg-rose-950/60 border border-rose-700/50 px-3.5 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-bold tracking-wider">CANAL PRIVADO DE GESTIÓN LOTBA</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6 z-10">
        <div className="bg-[#090d18]/95 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 via-red-950/50 to-slate-950 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400 shadow-xl shadow-rose-950/50">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="font-serif-luxury font-black text-2xl tracking-wider text-rose-100">
                ROYALPLAY
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/50 px-2 py-0.5 rounded font-mono-tech font-bold">
                PORTAL ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Supervisión de Operaciones, Verificación de DNI (+18) & Cumplimiento Regulatorio LOTBA
            </p>
          </div>

          {/* Security Status Banner */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-tech">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 1.3 / AES-256</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>IP 190.191.24.110</span>
            </div>
          </div>

          {/* Error Message & Lockout Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/60 flex items-start gap-2.5 text-xs text-rose-200 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>{errorMessage}</span>
                {lockoutTimer > 0 && (
                  <div className="flex items-center gap-1.5 font-mono-tech text-amber-300 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tiempo restante de bloqueo: {lockoutTimer}s</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Usuario o Correo Institucional</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono-tech">LOTBA ID</span>
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="admin@royalplay.com.ar"
                disabled={lockoutTimer > 0}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono-tech disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contraseña Administrativa</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono-tech">Cifrada</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={lockoutTimer > 0}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono-tech disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>Token 2FA / OTP (6 dígitos)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono-tech font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  2FA Obligatorio
                </span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                placeholder="123456"
                disabled={lockoutTimer > 0}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-amber-300 tracking-widest text-center text-sm font-bold font-mono-tech focus:outline-none focus:border-rose-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || lockoutTimer > 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs tracking-wider uppercase shadow-xl shadow-rose-950/60 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando Credenciales y Certificados...</span>
                </>
              ) : lockoutTimer > 0 ? (
                <span>Terminal Bloqueada ({lockoutTimer}s)</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Iniciar Sesión Administrativa</span>
                </>
              )}
            </button>
          </form>

          {/* Authorized Credentials Reference Drawer */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowCredentialsModal(!showCredentialsModal)}
              className="w-full py-2 px-3 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition text-[11px] font-mono-tech flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Credenciales de Auditoría LOTBA (Cargar Formulario)</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold">
                {showCredentialsModal ? 'Ocultar' : 'Ver'}
              </span>
            </button>

            {showCredentialsModal && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-[11px] font-mono-tech">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                  Seleccione cuenta para autocompletar formulario:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePopulateCredentials('admin@royalplay.com.ar', 'RoyalAdmin2026!')}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-rose-500/40 text-left transition flex flex-col gap-0.5 group"
                  >
                    <div className="flex items-center justify-between text-rose-300 font-bold text-xs">
                      <span>Superadmin</span>
                      <span className="text-[9px] bg-rose-500/20 px-1 rounded text-rose-300">Cargar Datos</span>
                    </div>
                    <span className="text-[10px] text-slate-400">admin@royalplay.com.ar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePopulateCredentials('compliance@royalplay.com.ar', 'Compliance2026!')}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-left transition flex flex-col gap-0.5 group"
                  >
                    <div className="flex items-center justify-between text-cyan-300 font-bold text-xs">
                      <span>Oficial LOTBA</span>
                      <span className="text-[9px] bg-cyan-500/20 px-1 rounded text-cyan-300">Cargar Datos</span>
                    </div>
                    <span className="text-[10px] text-slate-400">compliance@royalplay.com.ar</span>
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 pt-1">
                  Nota: El usuario debe presionar "Iniciar Sesión" para autenticar mediante el protocolo seguro.
                </div>
              </div>
            )}
          </div>

          {/* Regulatory Legal Notice */}
          <div className="pt-1 text-[10px] text-slate-500 text-center leading-relaxed">
            Consola auditada según estándares de la Ley Nacional 25.326 y convenios jurisdiccionales LOTBA / IPLyC.
            Todos los accesos son monitoreados y registrados en el libro inmutable de auditoría.
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-slate-500 z-10 font-mono-tech">
        RoyalPlay Argentina • Servidor de Control Privado • Conexión Cifrada TLS 1.3
      </div>
    </div>
  );
};

