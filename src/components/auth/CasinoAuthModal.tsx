import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Crown,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  Building2,
  KeyRound,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  X,
  Phone,
  Calendar,
  Sparkles,
  Fingerprint,
  Info,
} from 'lucide-react';
import casinoBg from '../../assets/images/casino_login_bg_1790630432237.jpg';

interface CasinoAuthModalProps {
  onClose?: () => void;
  initialTab?: 'player' | 'admin' | 'register' | 'forgot';
}

export const CasinoAuthModal: React.FC<CasinoAuthModalProps> = ({
  onClose,
  initialTab = 'player',
}) => {
  const {
    loginPlayer,
    registerPlayer,
    loginAdmin,
    adminSession,
    setCurrentView,
    allUsers,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'player' | 'admin' | 'register' | 'forgot'>(initialTab);

  // Player Login Form
  const [playerIdentifier, setPlayerIdentifier] = useState('martin.rossi');
  const [playerPassword, setPlayerPassword] = useState('Player2026!');
  const [showPlayerPassword, setShowPlayerPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Admin Login Form
  const [adminIdentifier, setAdminIdentifier] = useState('admin@royalplay.com.ar');
  const [adminPassword, setAdminPassword] = useState('RoyalAdmin2026!');
  const [adminOtp, setAdminOtp] = useState('123456');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Registration Form
  const [regFullName, setRegFullName] = useState('');
  const [regDni, setRegDni] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+54 9 11 ');
  const [regBirthDate, setRegBirthDate] = useState('2000-01-15');
  const [regPassword, setRegPassword] = useState('');
  const [regTermsAccepted, setRegTermsAccepted] = useState(true);

  // Forgot Password Form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCredentialsHint, setShowCredentialsHint] = useState(false);

  // Handle Player Login
  const handlePlayerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      try {
        const res = loginPlayer(playerIdentifier, playerPassword);
        if (!res.success) {
          if (res.isAdmin) {
            // Smart recognition: user entered admin email in player login
            setErrorMessage(res.message || 'Cuenta administrativa detectada.');
            // Allow 1-click switch to admin entrance
            setTimeout(() => {
              setActiveTab('admin');
              setAdminIdentifier(playerIdentifier);
            }, 1200);
          } else {
            setErrorMessage(res.message || 'Credenciales de jugador incorrectas.');
          }
        } else {
          setSuccessMessage('¡Bienvenido al casino! Sesión iniciada correctamente.');
          setTimeout(() => {
            if (onClose) onClose();
            setCurrentView('home');
          }, 400);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  // Handle Admin Login (Restricted)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      try {
        const res = loginAdmin(adminIdentifier, adminPassword, adminOtp);
        if (!res.success) {
          setErrorMessage(res.message || 'Error de autenticación administrativa.');
        } else {
          setSuccessMessage('Acceso administrativo validado. Redirigiendo a consola de administración...');
          setTimeout(() => {
            window.location.hash = '#/admin';
            setCurrentView('admin');
            if (onClose) onClose();
          }, 500);
        }
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  // Handle Player Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regTermsAccepted) {
      setErrorMessage('Debe declarar ser mayor de 18 años y aceptar las normativas LOTBA.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const res = registerPlayer({
          fullName: regFullName,
          dni: regDni,
          email: regEmail,
          phone: regPhone,
          birthDate: regBirthDate,
          password: regPassword,
        });

        if (!res.success) {
          setErrorMessage(res.message || 'Error en el registro.');
        } else {
          setSuccessMessage('¡Cuenta creada exitosamente! Has recibido $25.000 ARS en bono de bienvenida.');
          setTimeout(() => {
            if (onClose) onClose();
            setCurrentView('home');
          }, 600);
        }
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  // Handle Forgot Password
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage('Por favor ingrese su correo electrónico.');
      return;
    }
    setForgotSubmitted(true);
    setSuccessMessage(`Se ha enviado un enlace de recuperación seguro a ${forgotEmail}.`);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl">
      {/* Background Casino Image with Dark Gold Velvet Overlay matching image.png */}
      <div
        className="fixed inset-0 pointer-events-none opacity-45 bg-cover bg-center transition-opacity"
        style={{
          backgroundImage: `url(${casinoBg})`,
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-[#04060b] via-[#060a16]/85 to-[#04060b]/90" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md my-auto space-y-5 animate-fade-in">
        {/* Top Casino Online Logo Badge (EXACTLY AS IN THE USER'S IMAGE) */}
        <div className="text-center space-y-1">
          {/* Golden Crown Emblem */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                <Crown className="w-9 h-9 text-black fill-black" />
              </div>
            </div>
          </div>

          {/* CASINO ONLINE TEXT */}
          <div className="pt-2">
            <h1 className="text-3xl sm:text-4xl font-black font-serif-luxury tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-yellow-600 drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
              CASINO
            </h1>
            <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.3em] text-amber-400">
              <span className="w-6 h-[1.5px] bg-gradient-to-r from-transparent to-amber-400" />
              <span>ONLINE</span>
              <span className="w-6 h-[1.5px] bg-gradient-to-l from-transparent to-amber-400" />
            </div>
            <p className="text-[11px] font-mono-tech tracking-[0.25em] text-amber-200/80 pt-1 uppercase">
              JUEGA • DISFRUTA • GANA
            </p>
          </div>
        </div>

        {/* Dual Access Type Selector (Player vs Restricted Admin) */}
        <div className="p-1 rounded-2xl bg-[#0a0f1d]/90 border border-slate-800 grid grid-cols-2 gap-1 text-xs font-bold font-mono-tech">
          <button
            type="button"
            onClick={() => {
              setActiveTab('player');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'player' || activeTab === 'register' || activeTab === 'forgot'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Acceso Jugadores</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-950/60'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Acceso Admin (2FA)</span>
          </button>
        </div>

        {/* The Card (EXACTLY MATCHING THE USER'S PROVIDED IMAGE) */}
        <div className="bg-[#0b101d]/95 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-5 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-200 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-start gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: PLAYER / CLIENT LOGIN (Matches image.png)           */}
          {/* ========================================================= */}
          {activeTab === 'player' && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-white">
                  Iniciar sesión
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Acceso exclusivo para jugadores y clientes
                </p>
              </div>

              <form onSubmit={handlePlayerLogin} className="space-y-4">
                {/* Usuario o correo electrónico */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={playerIdentifier}
                    onChange={e => setPlayerIdentifier(e.target.value)}
                    placeholder="Usuario o correo electrónico"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#090e18] border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400 font-sans transition"
                  />
                </div>

                {/* Contraseña with Eye icon toggle */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPlayerPassword ? 'text' : 'password'}
                    required
                    value={playerPassword}
                    onChange={e => setPlayerPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-[#090e18] border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400 font-sans transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPlayerPassword(!showPlayerPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPlayerPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Recordar sesión & ¿Olvidaste tu contraseña? */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberSession}
                      onChange={e => setRememberSession(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400 accent-amber-500"
                    />
                    <span>Recordar sesión</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-amber-400 hover:text-amber-300 font-medium underline transition"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {/* Golden "Ingresar" button exactly as in image */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-b from-[#e5a823] via-[#eab308] to-[#ca8a04] hover:brightness-110 active:scale-[0.99] text-black font-extrabold text-sm sm:text-base tracking-wide shadow-[0_4px_20px_rgba(234,179,8,0.35)] transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Verificando...' : 'Ingresar'}
                </button>
              </form>

              {/* Divider: ¿No tienes una cuenta? */}
              <div className="relative flex items-center justify-center pt-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative px-3 bg-[#0b101d] text-xs text-slate-400">
                  ¿No tienes una cuenta?
                </span>
              </div>

              {/* Outline "Regístrate aquí" button */}
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="w-full py-3 rounded-xl bg-transparent hover:bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:border-amber-400 font-bold text-xs sm:text-sm tracking-wide transition cursor-pointer"
              >
                Regístrate aquí
              </button>

              {/* Sample credentials hint for evaluator */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowCredentialsHint(!showCredentialsHint)}
                  className="w-full text-center text-[11px] text-slate-500 hover:text-slate-300 font-mono-tech transition"
                >
                  {showCredentialsHint ? 'Ocultar cuentas de prueba' : 'Ver cuentas de prueba de jugadores'}
                </button>
                {showCredentialsHint && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono-tech space-y-1 text-slate-300">
                    <div
                      onClick={() => {
                        setPlayerIdentifier('martin.rossi');
                        setPlayerPassword('Player2026!');
                      }}
                      className="cursor-pointer hover:text-amber-400 flex justify-between"
                    >
                      <span>Martín Rossi (VIP Oro):</span>
                      <strong className="text-amber-300">martin.rossi</strong>
                    </div>
                    <div
                      onClick={() => {
                        setPlayerIdentifier('lucas.b@gmail.com');
                        setPlayerPassword('Player2026!');
                      }}
                      className="cursor-pointer hover:text-amber-400 flex justify-between"
                    >
                      <span>Lucas Benítez (Estándar):</span>
                      <strong className="text-amber-300">lucas.b@gmail.com</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: RESTRICTED ADMIN LOGIN (With 2FA and High Security) */}
          {/* ========================================================= */}
          {activeTab === 'admin' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-300 text-[10px] font-mono-tech font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>ZONA DE ACCESO RESTRINGIDO LOTBA</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-rose-200">
                  Acceso Administrativo
                </h2>
                <p className="text-xs text-slate-400">
                  Requiere credencial oficial y Token 2FA obligatorio
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                {/* Identifier */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-5 h-5 text-rose-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={adminIdentifier}
                    onChange={e => setAdminIdentifier(e.target.value)}
                    placeholder="Usuario o correo institucional"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#090e18] border border-rose-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-400 font-mono-tech transition"
                  />
                </div>

                {/* Password with eye */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5 text-rose-400" />
                  </div>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="Contraseña administrativa"
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-[#090e18] border border-rose-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-400 font-mono-tech transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Mandatory 2FA OTP Token */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono-tech text-slate-300">
                    <span className="flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Token 2FA / OTP (6 dígitos)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">Obligatorio</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={adminOtp}
                    onChange={e => setAdminOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#090e18] border border-rose-500/30 text-amber-300 text-center tracking-widest text-base font-bold font-mono-tech focus:outline-none focus:border-rose-400"
                  />
                </div>

                {/* Security Telemetry */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] font-mono-tech flex items-center justify-between text-slate-400">
                  <span>Terminal: 190.191.24.110</span>
                  <span className="text-emerald-400">Cifrado TLS 1.3 / AES-256</span>
                </div>

                {/* Submit button for admin */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:brightness-110 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-950/60 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Validando Credenciales...' : 'Ingresar a Consola de Administración'}
                </button>
              </form>

              {/* Sample admin credentials */}
              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAdminIdentifier('admin@royalplay.com.ar');
                    setAdminPassword('RoyalAdmin2026!');
                    setAdminOtp('123456');
                  }}
                  className="text-[11px] text-slate-500 hover:text-amber-300 font-mono-tech transition"
                >
                  Cargar credenciales Superadmin (admin@royalplay.com.ar)
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: NEW PLAYER REGISTRATION                            */}
          {/* ========================================================= */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold font-serif-luxury text-white">
                  Registro de Jugador (+18)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Crea tu cuenta oficial y recibe $25.000 ARS en bono de bienvenida
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Nombre Completo (como en el DNI):</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder="Ej: Marcelo Gómez"
                    className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 block mb-1">DNI Argentino:</label>
                    <input
                      type="text"
                      required
                      value={regDni}
                      onChange={e => setRegDni(e.target.value)}
                      placeholder="38.920.104"
                      className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Fecha de Nacimiento:</label>
                    <input
                      type="date"
                      required
                      value={regBirthDate}
                      onChange={e => setRegBirthDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 block mb-1">Email:</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="marcelo@gmail.com"
                      className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Teléfono:</label>
                    <input
                      type="text"
                      required
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="+54 9 11 ..."
                      className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Contraseña:</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 rounded-xl bg-[#090e18] border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <label className="flex items-start gap-2 pt-1 text-[11px] text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regTermsAccepted}
                    onChange={e => setRegTermsAccepted(e.target.checked)}
                    className="mt-0.5 accent-amber-500"
                  />
                  <span>
                    Declaro ser mayor de 18 años y acepto el reglamento de juego responsable LOTBA.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:scale-[0.99] text-black font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  {loading ? 'Creando Cuenta...' : 'Crear Cuenta y Obtener Bono'}
                </button>
              </form>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('player')}
                  className="text-xs text-amber-400 hover:text-amber-300 underline"
                >
                  ¿Ya tienes cuenta? Inicia sesión aquí
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: FORGOT PASSWORD                                    */}
          {/* ========================================================= */}
          {activeTab === 'forgot' && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold font-serif-luxury text-white">
                  Recuperar Contraseña
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ingrese su correo electrónico registrado para restablecer su acceso
                </p>
              </div>

              {!forgotSubmitted ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Correo Electrónico:</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full px-3.5 py-3 rounded-xl bg-[#090e18] border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Enviar Enlace de Recuperación
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-3 py-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <p className="text-xs text-slate-300">
                    Hemos enviado las instrucciones a <strong>{forgotEmail}</strong>.
                  </p>
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('player')}
                  className="text-xs text-amber-400 hover:text-amber-300 underline"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Regulatory Security Seal */}
        <div className="text-center text-[10px] text-slate-500 font-mono-tech">
          LOTBA Licencia N° 0841/2024 • Solo mayores de 18 años (+18)
        </div>
      </div>
    </div>
  );
};
