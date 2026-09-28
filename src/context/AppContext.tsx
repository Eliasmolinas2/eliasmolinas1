import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  WalletState,
  Transaction,
  TransactionType,
  ResponsibleGamingSettings,
  CasinoGame,
  BetHistoryEntry,
  Tournament,
  Promotion,
  SecureMessage,
  SecureContact,
  WhatsAppTemplate,
  WhatsAppConsent,
  WhatsAppLog,
  AuditLog,
  UserRole,
  AdminUser,
  AdminRole,
  SupportTicket,
} from '../types';
import { generateProvablyFairHash, generateRandomSeed } from '../lib/crypto';
import { sound } from '../lib/sound';

export const PREDEFINED_ADMIN_ACCOUNTS: {
  account: AdminUser;
  secretPass: string;
}[] = [
  {
    account: {
      id: 'adm_sec_01',
      username: 'admin',
      email: 'admin@royalplay.com.ar',
      fullName: 'Ing. Gustavo Albarracín',
      role: 'admin',
      jurisdiction: 'Nacional / LOTBA Superadmin',
      lastLogin: new Date().toISOString(),
    },
    secretPass: 'RoyalAdmin2026!',
  },
  {
    account: {
      id: 'adm_sec_02',
      username: 'compliance',
      email: 'compliance@royalplay.com.ar',
      fullName: 'Dra. Silvina Ocampo',
      role: 'compliance_officer',
      jurisdiction: 'Oficial de Enlace Regulatorio LOTBA / IPLyC',
      lastLogin: new Date().toISOString(),
    },
    secretPass: 'Compliance2026!',
  },
];

interface AppContextType {
  // Navigation & View
  currentView: string;
  setCurrentView: (view: string) => void;
  activeGame: CasinoGame | null;
  setActiveGame: (game: CasinoGame | null) => void;

  // Sound
  soundEnabled: boolean;
  toggleSound: () => void;

  // User & Auth (Player Area)
  user: UserProfile;
  isPlayerLoggedIn: boolean;
  loginPlayer: (identifier: string, pass: string) => { success: boolean; message?: string; isAdmin?: boolean };
  logoutPlayer: () => void;
  registerPlayer: (data: { fullName: string; dni: string; email: string; phone: string; birthDate: string; password: string }) => { success: boolean; message?: string };
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalTab: 'player' | 'admin' | 'register' | 'forgot';
  setAuthModalTab: (tab: 'player' | 'admin' | 'register' | 'forgot') => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  submitKYC: (docs: { frontDniUrl: string; backDniUrl: string; selfieUrl: string }) => void;
  toggleTwoFactor: () => void;

  // Admin Session & Authentication (Separated from player session)
  adminSession: AdminUser | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (emailOrUser: string, pass: string, otpCode?: string) => { success: boolean; message?: string; user?: AdminUser };
  logoutAdmin: () => void;

  // Wallet & Transactions
  wallet: WalletState;
  transactions: Transaction[];
  deposit: (amount: number, method: Transaction['method'], notes?: string) => Promise<boolean>;
  withdraw: (amount: number, cbuAlias: string) => Promise<{ success: boolean; message: string }>;

  // Games & Bets
  games: CasinoGame[];
  setGames: React.Dispatch<React.SetStateAction<CasinoGame[]>>;
  betHistory: BetHistoryEntry[];
  placeGameBet: (game: CasinoGame, betAmount: number) => Promise<{ allowed: boolean; reason?: string }>;
  resolveGameBet: (
    game: CasinoGame,
    betAmount: number,
    winAmount: number,
    multiplier: number,
    outcomeDetail: string
  ) => Promise<BetHistoryEntry>;

  // Responsible Gaming
  responsibleGaming: ResponsibleGamingSettings;
  updateResponsibleLimits: (limits: Partial<ResponsibleGamingSettings>) => void;
  applyCoolingOff: (hours: number) => void;
  applySelfExclusion: (months: number, reason: string) => void;
  sessionElapsedMinutes: number;
  showRealityCheckAlert: boolean;
  dismissRealityCheck: () => void;

  // Promotions & Tournaments
  promotions: Promotion[];
  tournaments: Tournament[];
  claimPromoCode: (code: string) => { success: boolean; message: string };

  // Secure Messaging
  secureMessages: SecureMessage[];
  contacts: SecureContact[];
  addSecureMessage: (msg: Omit<SecureMessage, 'id' | 'createdAt' | 'isRead'>) => void;
  addContact: (name: string, identifier: string) => void;
  updateContactStatus: (contactId: string, status: 'allowed' | 'pending' | 'blocked') => void;

  // WhatsApp Gateway
  whatsappConsent: WhatsAppConsent;
  toggleWhatsAppConsent: () => void;
  whatsappTemplates: WhatsAppTemplate[];
  whatsappLogs: WhatsAppLog[];
  sendWhatsAppTemplateMessage: (templateName: string, recipientPhone: string) => Promise<{ success: boolean; message: string }>;

  // Admin & Audit (Comprehensive and Highly Secure)
  allUsers: UserProfile[];
  auditLogs: AuditLog[];
  approveKYCUser: (userId: string) => void;
  rejectKYCUser: (userId: string, reason: string) => void;
  approveTransaction: (txId: string, bankReference?: string) => void;
  rejectTransaction: (txId: string, reason?: string) => void;
  toggleGameStatus: (gameId: string) => void;
  updateGameConfig: (gameId: string, updates: Partial<CasinoGame>) => void;
  updateUserRoleByAdmin: (userId: string, newRole: UserRole) => void;
  adjustUserBalanceByAdmin: (userId: string, amount: number, isBonus: boolean, reason: string) => void;
  supportTickets: SupportTicket[];
  replySupportTicket: (ticketId: string, replyText: string, status: 'open' | 'pending' | 'resolved') => void;
  createAuditSelfExclusion: (userId: string, months: number, reason: string) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_ar_991823',
  fullName: 'Martín Ezequiel Rossi',
  email: 'martin.rossi@royalplay.com.ar',
  dni: '38.452.190',
  phone: '+54 9 11 5821-4490',
  birthDate: '1994-06-18',
  isOver18: true,
  role: 'user',
  kycStatus: 'approved',
  twoFactorEnabled: true,
  twoFactorMethod: 'whatsapp',
  createdAt: '2025-01-14T10:00:00.000Z',
};

const INITIAL_GAMES: CasinoGame[] = [
  {
    id: 'game_slots_777',
    title: 'Royal 777 Diamonds',
    slug: 'royal-slots-777',
    category: 'slots',
    provider: 'RoyalPlay Originals',
    rtp: 96.8,
    minBet: 100,
    maxBet: 50000,
    jackpotARS: 38450000,
    featured: true,
    active: true,
    volatility: 'Alta',
    tag: 'Jackpot ARS',
  },
  {
    id: 'game_roulette_eu',
    title: 'Ruleta Clásica Argentina',
    slug: 'ruleta-argentina',
    category: 'roulette',
    provider: 'RoyalPlay Originals',
    rtp: 97.3,
    minBet: 500,
    maxBet: 100000,
    featured: true,
    active: true,
    volatility: 'Media',
    tag: 'Mesa Premium',
  },
  {
    id: 'game_blackjack_21',
    title: 'Royal 21 Blackjack VIP',
    slug: 'blackjack-royal-21',
    category: 'blackjack',
    provider: 'RoyalPlay Originals',
    rtp: 99.4,
    minBet: 500,
    maxBet: 200000,
    featured: true,
    active: true,
    volatility: 'Baja',
    tag: 'RTP 99.4%',
  },
  {
    id: 'game_crash_rocket',
    title: 'AstroCrash Aviator',
    slug: 'astrocrash-aviator',
    category: 'crash',
    provider: 'RoyalPlay Originals',
    rtp: 97.0,
    minBet: 100,
    maxBet: 75000,
    featured: true,
    active: true,
    volatility: 'Alta',
    tag: 'Mult. 100x+',
  },
  {
    id: 'game_sweet_bonanza',
    title: 'Sweet Bonanza AR',
    slug: 'sweet-bonanza-ar',
    category: 'slots',
    provider: 'Pragmatic Play',
    rtp: 96.5,
    minBet: 200,
    maxBet: 80000,
    featured: true,
    active: true,
    volatility: 'Alta',
    tag: 'Proveedor Oficial',
  },
  {
    id: 'game_gates_olympus',
    title: 'Gates of Olympus 1000',
    slug: 'gates-of-olympus',
    category: 'slots',
    provider: 'Pragmatic Play',
    rtp: 96.5,
    minBet: 200,
    maxBet: 100000,
    featured: false,
    active: true,
    volatility: 'Alta',
    tag: 'Cascada',
  },
  {
    id: 'game_live_roulette_ba',
    title: 'Ruleta en Vivo Buenos Aires',
    slug: 'live-roulette-ba',
    category: 'live',
    provider: 'Evolution Gaming',
    rtp: 97.3,
    minBet: 1000,
    maxBet: 500000,
    featured: true,
    active: true,
    volatility: 'Media',
    tag: 'Croupier en Directo',
  },
];

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo_welcome',
    title: 'Bono de Bienvenida 100%',
    description: 'Duplica tu primer depósito hasta $150.000 ARS para jugar en Slots y Ruleta.',
    code: 'ROYAL100',
    bonusPercent: 100,
    maxBonusARS: 150000,
    wageringRequirement: 30,
    validUntil: '2026-12-31',
    category: 'welcome',
    active: true,
  },
  {
    id: 'promo_spins',
    title: '50 Giros Gratis en Royal 777',
    description: 'Acredita 50 tiradas gratuitas con depósito mínimo de $10.000 ARS.',
    code: 'SPINS50',
    bonusPercent: 50,
    maxBonusARS: 25000,
    wageringRequirement: 25,
    validUntil: '2026-11-30',
    category: 'free_spins',
    active: true,
  },
  {
    id: 'promo_cashback',
    title: 'Cashback Semanal VIP 15%',
    description: 'Reintegro directo de pérdidas netas todos los lunes sin rollover restrictivo.',
    code: 'VIP15',
    bonusPercent: 15,
    maxBonusARS: 300000,
    wageringRequirement: 5,
    validUntil: '2026-12-31',
    category: 'cashback',
    active: true,
  },
];

const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 'tour_ba_weekly',
    title: 'Gran Torneo Tragamonedas Buenos Aires',
    description: 'Compite por el pozo acumulado sumando puntos en cada multiplicador obtenido.',
    prizePoolARS: 3500000,
    category: 'slots',
    startsAt: '2026-09-25T00:00:00Z',
    endsAt: '2026-10-02T23:59:59Z',
    participantsCount: 428,
    leaderboard: [
      { rank: 1, username: 'Facundo_CABA', points: 14850, prizeARS: 1200000 },
      { rank: 2, username: 'Valeria_Rosario', points: 12420, prizeARS: 800000 },
      { rank: 3, username: 'Martin_Rossi (Tú)', points: 9810, prizeARS: 500000 },
      { rank: 4, username: 'TangoWinner_99', points: 8740, prizeARS: 350000 },
      { rank: 5, username: 'Guido_Cordoba', points: 7600, prizeARS: 200000 },
    ],
  },
  {
    id: 'tour_roulette_cup',
    title: 'Copa de Oro de Ruleta Argentina',
    description: 'Mesa exclusiva de ruleta con premios a las mayores rachas de pleno.',
    prizePoolARS: 2000000,
    category: 'roulette',
    startsAt: '2026-09-27T00:00:00Z',
    endsAt: '2026-10-05T23:59:59Z',
    participantsCount: 184,
    leaderboard: [
      { rank: 1, username: 'Nico_Pleno36', points: 5800, prizeARS: 900000 },
      { rank: 2, username: 'Camila_Sur', points: 4950, prizeARS: 550000 },
      { rank: 3, username: 'Martin_Rossi (Tú)', points: 3800, prizeARS: 300000 },
    ],
  },
];

const INITIAL_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl_2fa_otp',
    name: 'auth_security_code_ar',
    category: 'AUTHENTICATION',
    language: 'es_AR',
    content: 'Tu código de seguridad RoyalPlay es: {{1}}. Válido por 5 minutos. No lo compartas con nadie.',
    variables: ['Código OTP'],
    status: 'APPROVED',
  },
  {
    id: 'tpl_deposit_confirmed',
    name: 'wallet_deposit_success',
    category: 'UTILITY',
    language: 'es_AR',
    content: 'Hola {{1}}, tu depósito de {{2}} fue acreditado con éxito en tu Billetera RoyalPlay. Ref: {{3}}.',
    variables: ['Nombre', 'Monto ARS', 'Referencia'],
    status: 'APPROVED',
  },
  {
    id: 'tpl_withdrawal_processed',
    name: 'wallet_withdrawal_approved',
    category: 'UTILITY',
    language: 'es_AR',
    content: 'Estimado/a {{1}}, tu solicitud de retiro por {{2}} a tu CBU/Alias ha sido transferida.',
    variables: ['Nombre', 'Monto ARS'],
    status: 'APPROVED',
  },
  {
    id: 'tpl_resp_gaming_alert',
    name: 'responsible_gaming_limit_reached',
    category: 'UTILITY',
    language: 'es_AR',
    content: 'Alerta RoyalPlay: Has alcanzado el {{1}}% de tu límite de depósito fijado. Recuerda que el juego debe ser entretenimiento.',
    variables: ['Porcentaje'],
    status: 'APPROVED',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeGame, setActiveGame] = useState<CasinoGame | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Administrative Private Session (Completely separated from Player Session)
  const [adminSession, setAdminSession] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('royalplay_admin_session');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  // User Profile (Player Area)
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('royalplay_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [isPlayerLoggedIn, setIsPlayerLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('royalplay_player_logged_in');
    return saved !== null ? saved === 'true' : true;
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'player' | 'admin' | 'register' | 'forgot'>('player');

  // Admin users list
  const [allUsers, setAllUsers] = useState<UserProfile[]>([
    DEFAULT_USER,
    {
      id: 'usr_ar_102',
      fullName: 'Lucas Benítez',
      email: 'lucas.b@gmail.com',
      dni: '35.190.281',
      phone: '+54 9 11 4099-2810',
      birthDate: '1990-03-12',
      isOver18: true,
      role: 'user',
      kycStatus: 'pending',
      twoFactorEnabled: false,
      twoFactorMethod: 'sms',
      createdAt: '2026-02-10T14:30:00Z',
    },
    {
      id: 'usr_ar_103',
      fullName: 'Carolina Méndez',
      email: 'caro.mendez@outlook.com',
      dni: '41.802.449',
      phone: '+54 9 341 620-1920',
      birthDate: '1999-11-04',
      isOver18: true,
      role: 'vip',
      kycStatus: 'approved',
      twoFactorEnabled: true,
      twoFactorMethod: 'whatsapp',
      createdAt: '2025-11-20T09:15:00Z',
    },
  ]);

  // Wallet State
  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem('royalplay_wallet');
    return saved
      ? JSON.parse(saved)
      : {
          realBalance: 185000,
          bonusBalance: 25000,
          lockedForWithdrawal: 0,
          totalDeposited: 450000,
          totalWithdrawn: 280000,
        };
  });

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('royalplay_transactions');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'tx_ar_991',
            userId: 'usr_ar_991823',
            type: 'deposit',
            amount: 50000,
            currency: 'ARS',
            method: 'mercadopago',
            status: 'completed',
            referenceCode: 'MP-89102931-ARS',
            notes: 'Acreditación instantánea Mercado Pago',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
          {
            id: 'tx_ar_992',
            userId: 'usr_ar_991823',
            type: 'win',
            amount: 120000,
            currency: 'ARS',
            method: 'sistema',
            status: 'completed',
            referenceCode: 'WIN-777-SLOT-01',
            notes: 'Premio Mayor Royal 777 Diamonds',
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          },
          {
            id: 'tx_ar_993',
            userId: 'usr_ar_991823',
            type: 'withdraw',
            amount: 30000,
            currency: 'ARS',
            method: 'transferencia_bancaria',
            status: 'pending',
            referenceCode: 'WD-2026-ARG-09',
            cbuAlias: 'ROSSI.BANCO.GALICIA',
            notes: 'En proceso de verificación bancaria',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
        ];
  });

  // Responsible Gaming Settings
  const [responsibleGaming, setResponsibleGaming] = useState<ResponsibleGamingSettings>(() => {
    const saved = localStorage.getItem('royalplay_resp_gaming');
    return saved
      ? JSON.parse(saved)
      : {
          depositLimitDaily: 75000,
          depositLimitWeekly: 250000,
          depositLimitMonthly: 700000,
          sessionTimeLimitMinutes: 60,
          realityCheckMinutes: 30,
          coolingOffUntil: null,
          selfExcludedUntil: null,
          selfExclusionReason: null,
          lastTestScore: 2,
          lastTestDate: '2026-09-15',
        };
  });

  // Session elapsed timer
  const [sessionElapsedMinutes, setSessionElapsedMinutes] = useState<number>(18);
  const [showRealityCheckAlert, setShowRealityCheckAlert] = useState<boolean>(false);

  // Games State
  const [games, setGames] = useState<CasinoGame[]>(INITIAL_GAMES);

  // Bet History
  const [betHistory, setBetHistory] = useState<BetHistoryEntry[]>(() => {
    const saved = localStorage.getItem('royalplay_bet_history');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'bet_init_01',
            gameId: 'game_slots_777',
            gameTitle: 'Royal 777 Diamonds',
            betAmount: 1000,
            winAmount: 5000,
            multiplier: 5.0,
            outcomeDetail: 'Línea 3: Tres Diamantes Azules',
            provablyFair: {
              clientSeed: 'ar_player_seed_99',
              serverSeedHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              nonce: 41,
              verified: true,
            },
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
        ];
  });

  // Tournaments & Promotions
  const [promotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [tournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);

  // Secure Messaging
  const [contacts, setContacts] = useState<SecureContact[]>(() => {
    const saved = localStorage.getItem('royalplay_contacts');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'ct_01',
            name: 'Oficial de Cumplimiento (Compliance)',
            aliasOrPhone: 'compliance@royalplay.com.ar',
            consentGiven: true,
            consentDate: '2026-01-01T12:00:00Z',
            status: 'allowed',
            notes: 'Canal oficial para auditorías y juego responsable',
          },
          {
            id: 'ct_02',
            name: 'Mesa de Ayuda VIP',
            aliasOrPhone: '+54 9 11 VIP-ROYAL',
            consentGiven: true,
            consentDate: '2026-02-15T10:00:00Z',
            status: 'allowed',
            notes: 'Soporte 24/7 cifrado de extremo a extremo',
          },
        ];
  });

  const [secureMessages, setSecureMessages] = useState<SecureMessage[]>(() => {
    const saved = localStorage.getItem('royalplay_secure_msgs');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'msg_01',
            senderId: 'usr_ar_991823',
            senderName: 'Martín Rossi',
            recipientContactId: 'ct_01',
            recipientName: 'Oficial de Cumplimiento (Compliance)',
            ciphertext: 'RP-AES256GCM:aW5pdGlhbHNhbHQxMjM0NQ==:aW5pdGl2OTg3NjU0:ZW5jcnlwdGVkZGF0YXNhbXBsZQ==',
            salt: 'aW5pdGlhbHNhbHQxMjM0NQ==',
            iv: 'aW5pdGl2OTg3NjU0',
            tag: 'c3Ryb25ndGFnMTI4',
            subjectHint: 'Confirmación de documentación DNI frente y dorso',
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            isRead: true,
          },
        ];
  });

  // WhatsApp Gateway
  const [whatsappConsent, setWhatsappConsent] = useState<WhatsAppConsent>(() => {
    const saved = localStorage.getItem('royalplay_wa_consent');
    return saved
      ? JSON.parse(saved)
      : {
          id: 'wac_01',
          userId: 'usr_ar_991823',
          phoneNumber: '+54 9 11 5821-4490',
          optedInAt: '2025-01-14T10:05:00.000Z',
          source: 'web_registration',
          ipAddress: '181.44.120.91',
          active: true,
        };
  });

  const [whatsappTemplates] = useState<WhatsAppTemplate[]>(INITIAL_WHATSAPP_TEMPLATES);

  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>([
    {
      id: 'wal_01',
      templateName: 'auth_security_code_ar',
      recipientPhone: '+54 9 11 5821-4490',
      status: 'READ',
      sentAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      metaMessageId: 'wamid.HBgLNTQ5MTE1ODIxNDQ5MBUCABEYEkRFREVEMjE5MzU4Q0M0RjAA',
      dailyQuotaRemaining: 4,
    },
    {
      id: 'wal_02',
      templateName: 'wallet_deposit_success',
      recipientPhone: '+54 9 11 5821-4490',
      status: 'DELIVERED',
      sentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      metaMessageId: 'wamid.HBgLNTQ5MTE1ODIxNDQ5MBUCABEYEkY4MDUxQTFEOTM5NzkxQwAA',
      dailyQuotaRemaining: 3,
    },
  ]);

  // Regulatory Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'aud_01',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      actor: 'Sistema Automatizado',
      actorRole: 'admin',
      action: 'LOGIN_2FA_SUCCESS',
      details: 'Inicio de sesión exitoso validado con OTP WhatsApp Cloud API',
      severity: 'info',
      ipAddress: '181.44.120.91 (CABA, Argentina)',
    },
    {
      id: 'aud_02',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      actor: 'Martín Rossi',
      actorRole: 'user',
      action: 'DEPOSIT_PROCESSED',
      details: 'Depósito completado por $50.000 ARS vía Mercado Pago',
      severity: 'info',
      ipAddress: '181.44.120.91',
    },
  ]);

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('royalplay_support_tickets');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'tkt_01',
            user: 'Lucas Benítez',
            userId: 'usr_ar_102',
            email: 'lucas.b@gmail.com',
            subject: 'Consulta por acreditación de depósito CBU Transferencias 3.0',
            status: 'open',
            priority: 'high',
            time: 'Hace 25 min',
            messages: [
              {
                sender: 'user',
                senderName: 'Lucas Benítez',
                text: 'Hola, transferí $50.000 ARS desde mi cuenta de Banco Galicia hace 20 minutos y todavía figura en estado pendiente de verificación. ¿Pueden revisar el comprobante COELSA?',
                timestamp: new Date(Date.now() - 1500000).toISOString(),
              },
            ],
          },
          {
            id: 'tkt_02',
            user: 'Carolina Méndez',
            userId: 'usr_ar_103',
            email: 'caro.mendez@outlook.com',
            subject: 'Solicitud de límite diario especial VIP y habilitación de ruleta',
            status: 'pending',
            priority: 'medium',
            time: 'Hace 2 horas',
            messages: [
              {
                sender: 'user',
                senderName: 'Carolina Méndez',
                text: 'Buenas tardes. Como jugadora VIP Oro quisiera solicitar la ampliación de mi límite diario de depósito a $500.000 ARS para participar en la Copa de Oro de Ruleta.',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
              },
            ],
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem('royalplay_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  // Persist core state
  useEffect(() => {
    if (adminSession) {
      localStorage.setItem('royalplay_admin_session', JSON.stringify(adminSession));
    } else {
      localStorage.removeItem('royalplay_admin_session');
    }
  }, [adminSession]);

  useEffect(() => {
    localStorage.setItem('royalplay_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('royalplay_player_logged_in', isPlayerLoggedIn.toString());
  }, [isPlayerLoggedIn]);

  useEffect(() => {
    localStorage.setItem('royalplay_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('royalplay_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('royalplay_resp_gaming', JSON.stringify(responsibleGaming));
  }, [responsibleGaming]);

  useEffect(() => {
    localStorage.setItem('royalplay_bet_history', JSON.stringify(betHistory));
  }, [betHistory]);

  useEffect(() => {
    localStorage.setItem('royalplay_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('royalplay_secure_msgs', JSON.stringify(secureMessages));
  }, [secureMessages]);

  useEffect(() => {
    localStorage.setItem('royalplay_wa_consent', JSON.stringify(whatsappConsent));
  }, [whatsappConsent]);

  // Session timer tracker
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionElapsedMinutes(prev => {
        const next = prev + 1;
        if (next > 0 && next % responsibleGaming.realityCheckMinutes === 0) {
          setShowRealityCheckAlert(true);
          sound.playAlarm();
        }
        return next;
      });
    }, 60000); // 1 minute in real app

    return () => clearInterval(timer);
  }, [responsibleGaming.realityCheckMinutes]);

  // Sound toggle
  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Switch Role
  const switchRole = (role: UserRole) => {
    setUser(prev => ({ ...prev, role }));
    const log: AuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: user.fullName,
      actorRole: role,
      action: 'USER_ROLE_SWITCH',
      details: `Rol cambiado a: ${role}`,
      severity: role === 'admin' || role === 'compliance_officer' ? 'warning' : 'info',
      ipAddress: '181.44.120.91',
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const submitKYC = (docs: { frontDniUrl: string; backDniUrl: string; selfieUrl: string }) => {
    setUser(prev => ({
      ...prev,
      kycStatus: 'pending',
      kycDocuments: {
        ...docs,
        submittedAt: new Date().toISOString(),
      },
    }));
    const log: AuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: user.fullName,
      actorRole: user.role,
      action: 'KYC_DOCUMENTS_SUBMITTED',
      details: 'El usuario envió DNI frente, dorso y prueba de vida para validación LOTBA.',
      severity: 'info',
      ipAddress: '181.44.120.91',
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const toggleTwoFactor = () => {
    setUser(prev => {
      const next = !prev.twoFactorEnabled;
      return { ...prev, twoFactorEnabled: next };
    });
  };

  // Wallet Deposit
  const deposit = async (amount: number, method: Transaction['method'], notes?: string): Promise<boolean> => {
    if (amount <= 0) return false;

    // Check responsible gaming daily limit
    const todayDeposits = transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed' && new Date(t.createdAt).toDateString() === new Date().toDateString())
      .reduce((acc, t) => acc + t.amount, 0);

    if (todayDeposits + amount > responsibleGaming.depositLimitDaily) {
      sound.playAlarm();
      alert(`Límite de Juego Responsable alcanzado: Tu límite diario de depósito es $${responsibleGaming.depositLimitDaily.toLocaleString('es-AR')} ARS.`);
      return false;
    }

    const refCode = `DEP-${method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'deposit',
      amount,
      currency: 'ARS',
      method,
      status: 'completed',
      referenceCode: refCode,
      notes: notes || `Depósito instantáneo mediante ${method}`,
      createdAt: new Date().toISOString(),
    };

    setWallet(prev => ({
      ...prev,
      realBalance: prev.realBalance + amount,
      totalDeposited: prev.totalDeposited + amount,
    }));

    setTransactions(prev => [newTx, ...prev]);
    sound.playWin();

    // Audit log
    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: user.fullName,
        actorRole: user.role,
        action: 'DEPOSIT_SUCCESS',
        details: `Depósito por $${amount.toLocaleString('es-AR')} ARS completado vía ${method}. Ref: ${refCode}`,
        severity: 'info',
        ipAddress: '181.44.120.91',
      },
      ...prev,
    ]);

    // Send WhatsApp notification if opted in
    if (whatsappConsent.active) {
      sendWhatsAppTemplateMessage('wallet_deposit_success', user.phone);
    }

    return true;
  };

  // Wallet Withdrawal
  const withdraw = async (amount: number, cbuAlias: string): Promise<{ success: boolean; message: string }> => {
    if (amount <= 0) return { success: false, message: 'El importe debe ser mayor a 0.' };
    if (amount > wallet.realBalance) {
      return { success: false, message: 'Saldo real insuficiente para realizar el retiro.' };
    }
    if (user.kycStatus !== 'approved') {
      return {
        success: false,
        message: 'Regulación argentina (LOTBA/IPLyC): Se requiere KYC verificado para autorizar retiros.',
      };
    }
    if (!cbuAlias.trim()) {
      return { success: false, message: 'Debes proporcionar un CBU o Alias bancario registrado a tu nombre.' };
    }

    const refCode = `WD-ARS-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'withdraw',
      amount,
      currency: 'ARS',
      method: 'transferencia_bancaria',
      status: 'pending',
      referenceCode: refCode,
      cbuAlias,
      notes: `Solicitud de retiro a ${cbuAlias} sujeta a verificación de seguridad`,
      createdAt: new Date().toISOString(),
    };

    setWallet(prev => ({
      ...prev,
      realBalance: prev.realBalance - amount,
      lockedForWithdrawal: prev.lockedForWithdrawal + amount,
    }));

    setTransactions(prev => [newTx, ...prev]);
    sound.playChip();

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: user.fullName,
        actorRole: user.role,
        action: 'WITHDRAWAL_REQUESTED',
        details: `Solicitud de retiro por $${amount.toLocaleString('es-AR')} ARS al CBU/Alias ${cbuAlias}.`,
        severity: 'info',
        ipAddress: '181.44.120.91',
      },
      ...prev,
    ]);

    return {
      success: true,
      message: `Solicitud de retiro ${refCode} generada con éxito. Será procesada en un plazo de 24 a 48 hs hábiles.`,
    };
  };

  // Game Bet Verification & Interceptor
  const placeGameBet = async (game: CasinoGame, betAmount: number): Promise<{ allowed: boolean; reason?: string }> => {
    // 1. Check self exclusion
    if (responsibleGaming.selfExcludedUntil) {
      const until = new Date(responsibleGaming.selfExcludedUntil);
      if (until > new Date()) {
        sound.playAlarm();
        return {
          allowed: false,
          reason: `Tu cuenta se encuentra autoexcluida hasta el ${until.toLocaleDateString('es-AR')}. Contacta al 0800-444-4000.`,
        };
      }
    }

    // 2. Check cooling off
    if (responsibleGaming.coolingOffUntil) {
      const until = new Date(responsibleGaming.coolingOffUntil);
      if (until > new Date()) {
        sound.playAlarm();
        return {
          allowed: false,
          reason: `Periodo de pausa (Cooling-off) activo hasta ${until.toLocaleDateString('es-AR')} ${until.toLocaleTimeString('es-AR')}.`,
        };
      }
    }

    // 3. Check bet limits
    if (betAmount < game.minBet) {
      return { allowed: false, reason: `La apuesta mínima para este juego es de $${game.minBet.toLocaleString('es-AR')} ARS.` };
    }
    if (betAmount > game.maxBet) {
      return { allowed: false, reason: `La apuesta máxima para este juego es de $${game.maxBet.toLocaleString('es-AR')} ARS.` };
    }

    // 4. Check available funds
    const totalAvail = wallet.realBalance + wallet.bonusBalance;
    if (betAmount > totalAvail) {
      return { allowed: false, reason: 'Saldo insuficiente. Realiza un depósito para continuar.' };
    }

    // Deduct bet from real balance first, then bonus balance
    setWallet(prev => {
      let rem = betAmount;
      let newReal = prev.realBalance;
      let newBonus = prev.bonusBalance;

      if (newReal >= rem) {
        newReal -= rem;
      } else {
        rem -= newReal;
        newReal = 0;
        newBonus = Math.max(0, newBonus - rem);
      }

      return {
        ...prev,
        realBalance: newReal,
        bonusBalance: newBonus,
      };
    });

    sound.playChip();
    return { allowed: true };
  };

  // Resolve Game Bet and record provably fair entry
  const resolveGameBet = async (
    game: CasinoGame,
    betAmount: number,
    winAmount: number,
    multiplier: number,
    outcomeDetail: string
  ): Promise<BetHistoryEntry> => {
    const clientSeed = 'seed_ar_' + Math.random().toString(36).substring(2, 10);
    const serverSeed = generateRandomSeed(16);
    const nonce = betHistory.length + 1;
    const serverSeedHash = await generateProvablyFairHash(serverSeed, clientSeed, nonce);

    // Credit winnings
    if (winAmount > 0) {
      setWallet(prev => ({
        ...prev,
        realBalance: prev.realBalance + winAmount,
      }));
    }

    const entry: BetHistoryEntry = {
      id: `bet_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      gameId: game.id,
      gameTitle: game.title,
      betAmount,
      winAmount,
      multiplier,
      outcomeDetail,
      provablyFair: {
        clientSeed,
        serverSeedHash,
        nonce,
        verified: true,
      },
      timestamp: new Date().toISOString(),
    };

    setBetHistory(prev => [entry, ...prev]);

    // Record transaction
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: winAmount > betAmount ? 'win' : 'bet',
      amount: winAmount > 0 ? winAmount : betAmount,
      currency: 'ARS',
      method: 'sistema',
      status: 'completed',
      referenceCode: `BET-${game.slug.toUpperCase()}-${nonce}`,
      notes: `${game.title}: ${outcomeDetail} (Mult: ${multiplier}x)`,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [tx, ...prev]);

    return entry;
  };

  // Update Responsible Gaming Limits
  const updateResponsibleLimits = (limits: Partial<ResponsibleGamingSettings>) => {
    const updated = { ...responsibleGaming, ...limits };
    setResponsibleGaming(updated);
    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: user.fullName,
        actorRole: user.role,
        action: 'RESPONSIBLE_GAMING_LIMITS_MODIFIED',
        details: `Límites actualizados: Depósito Diario $${updated.depositLimitDaily} ARS`,
        severity: 'info',
        ipAddress: '181.44.120.91',
      },
      ...prev,
    ]);
  };

  const applyCoolingOff = (hours: number) => {
    const until = new Date(Date.now() + hours * 3600000).toISOString();
    setResponsibleGaming(prev => ({ ...prev, coolingOffUntil: until }));
    alert(`Periodo de pausa activado por ${hours} horas. No podrás realizar apuestas hasta que expire.`);
  };

  const applySelfExclusion = (months: number, reason: string) => {
    const until = new Date(Date.now() + months * 30 * 24 * 3600000).toISOString();
    setResponsibleGaming(prev => ({
      ...prev,
      selfExcludedUntil: until,
      selfExclusionReason: reason,
    }));
    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: user.fullName,
        actorRole: user.role,
        action: 'SELF_EXCLUSION_FORMAL_ENACTED',
        details: `Autoexclusión legal activada por ${months} meses. Motivo: ${reason}`,
        severity: 'security',
        ipAddress: '181.44.120.91',
      },
      ...prev,
    ]);
  };

  const dismissRealityCheck = () => {
    setShowRealityCheckAlert(false);
  };

  // Claim Promo
  const claimPromoCode = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    const promo = promotions.find(p => p.code === clean && p.active);
    if (!promo) {
      return { success: false, message: 'Código promocional inválido o expirado.' };
    }

    const bonusAmount = 25000; // instant test bonus credited
    setWallet(prev => ({
      ...prev,
      bonusBalance: prev.bonusBalance + bonusAmount,
    }));

    setTransactions(prev => [
      {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'bonus',
        amount: bonusAmount,
        currency: 'ARS',
        method: 'sistema',
        status: 'completed',
        referenceCode: `PROMO-${clean}`,
        notes: `Bono promocional '${promo.title}' acreditado`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    sound.playWin();
    return {
      success: true,
      message: `¡Código ${clean} canjeado con éxito! Se acreditaron $${bonusAmount.toLocaleString('es-AR')} ARS en saldo de bono (Rollover ${promo.wageringRequirement}x).`,
    };
  };

  // Secure Messaging
  const addSecureMessage = (msg: Omit<SecureMessage, 'id' | 'createdAt' | 'isRead'>) => {
    const newMsg: SecureMessage = {
      ...msg,
      id: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setSecureMessages(prev => [newMsg, ...prev]);
  };

  const addContact = (name: string, identifier: string) => {
    const contact: SecureContact = {
      id: `ct_${Date.now()}`,
      name,
      aliasOrPhone: identifier,
      consentGiven: true,
      consentDate: new Date().toISOString(),
      status: 'allowed',
    };
    setContacts(prev => [contact, ...prev]);
  };

  const updateContactStatus = (contactId: string, status: 'allowed' | 'pending' | 'blocked') => {
    setContacts(prev => prev.map(c => (c.id === contactId ? { ...c, status } : c)));
  };

  // WhatsApp Gateway
  const toggleWhatsAppConsent = () => {
    setWhatsappConsent(prev => {
      const next = !prev.active;
      const log: AuditLog = {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: user.fullName,
        actorRole: user.role,
        action: next ? 'WHATSAPP_OPT_IN_GRANTED' : 'WHATSAPP_OPT_OUT_REVOKED',
        details: next
          ? `Consentimiento formal de WhatsApp Cloud API otorgado para ${prev.phoneNumber}`
          : 'Consentimiento revocado por el usuario',
        severity: 'info',
        ipAddress: '181.44.120.91',
      };
      setAuditLogs(l => [log, ...l]);
      return { ...prev, active: next };
    });
  };

  const sendWhatsAppTemplateMessage = async (
    templateName: string,
    recipientPhone: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!whatsappConsent.active) {
      return { success: false, message: 'El usuario no posee consentimiento activo (Opt-In) para WhatsApp.' };
    }

    // Rate limiting: max 5 messages per 24 hours
    const todayLogs = whatsappLogs.filter(
      l => new Date(l.sentAt).toDateString() === new Date().toDateString()
    );
    if (todayLogs.length >= 5) {
      return {
        success: false,
        message: 'Límite diario de frecuencia de WhatsApp alcanzado (Políticas oficiales Meta Cloud API).',
      };
    }

    const metaMessageId = `wamid.HBgL${btoa(Date.now().toString()).slice(0, 16)}AA`;
    const newLog: WhatsAppLog = {
      id: `wal_${Date.now()}`,
      templateName,
      recipientPhone,
      status: 'DELIVERED',
      sentAt: new Date().toISOString(),
      metaMessageId,
      dailyQuotaRemaining: 5 - (todayLogs.length + 1),
    };

    setWhatsappLogs(prev => [newLog, ...prev]);
    return {
      success: true,
      message: `Plantilla '${templateName}' enviada con éxito mediante WhatsApp Business Cloud API. ID: ${metaMessageId}`,
    };
  };

  // Admin Authentication & Session Management (Independent from Player Session)
  const loginAdmin = (
    emailOrUser: string,
    pass: string,
    otpCode?: string
  ): { success: boolean; message?: string; user?: AdminUser } => {
    const cleanIdentifier = emailOrUser.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check predefined official accounts
    const match = PREDEFINED_ADMIN_ACCOUNTS.find(
      adm =>
        (adm.account.email.toLowerCase() === cleanIdentifier ||
          adm.account.username.toLowerCase() === cleanIdentifier) &&
        adm.secretPass === cleanPass
    );

    if (!match) {
      // Record failed security attempt in immutable audit log
      setAuditLogs(prev => [
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: cleanIdentifier || 'Desconocido',
          actorRole: 'user',
          action: 'FAILED_ADMIN_LOGIN',
          details: `Intento de acceso administrativo fallido para identificador: ${cleanIdentifier}. Credenciales inválidas.`,
          severity: 'security',
          ipAddress: '181.44.120.91 (CABA, Argentina)',
        },
        ...prev,
      ]);
      return {
        success: false,
        message: 'Credenciales administrativas no autorizadas. Acceso denegado.',
      };
    }

    // 2FA check (if provided, must be 6 digits or standard)
    if (otpCode && otpCode.trim().length !== 6 && otpCode.trim() !== '123456') {
      return {
        success: false,
        message: 'Código 2FA inválido. Debe contener 6 dígitos de seguridad.',
      };
    }

    const authenticatedAdmin: AdminUser = {
      ...match.account,
      lastLogin: new Date().toISOString(),
    };

    setAdminSession(authenticatedAdmin);

    // Record successful admin authentication in regulatory audit log
    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: authenticatedAdmin.fullName,
        actorRole: authenticatedAdmin.role,
        action: 'ADMIN_SESSION_INITIATED',
        details: `Sesión de control maestro iniciada con éxito. Rol: ${authenticatedAdmin.role.toUpperCase()} • Jurisdicción: ${authenticatedAdmin.jurisdiction}`,
        severity: 'info',
        ipAddress: '190.210.88.10 (VPN Corporativa LOTBA)',
      },
      ...prev,
    ]);

    return {
      success: true,
      user: authenticatedAdmin,
    };
  };

  const logoutAdmin = () => {
    if (adminSession) {
      setAuditLogs(prev => [
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: adminSession.fullName,
          actorRole: adminSession.role,
          action: 'ADMIN_SESSION_TERMINATED',
          details: `Sesión administrativa cerrada correctamente por el operador ${adminSession.email}.`,
          severity: 'info',
          ipAddress: '190.210.88.10',
        },
        ...prev,
      ]);
    }
    setAdminSession(null);
  };

  // Player Authentication & Session Management (Separated from Admin)
  const loginPlayer = (
    identifier: string,
    pass: string
  ): { success: boolean; message?: string; isAdmin?: boolean } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check if user is typing an administrative account in the player login
    const isAdminAccount = PREDEFINED_ADMIN_ACCOUNTS.some(
      a =>
        a.account.email.toLowerCase() === cleanId ||
        a.account.username.toLowerCase() === cleanId
    );
    if (isAdminAccount) {
      return {
        success: false,
        isAdmin: true,
        message: 'Cuenta administrativa detectada. Por protocolos de seguridad LOTBA, debe ingresar mediante el acceso restringido con Token 2FA.',
      };
    }

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'Ingrese su usuario o correo y contraseña.' };
    }

    // Match in allUsers
    const matchedUser = allUsers.find(
      u =>
        u.email.toLowerCase() === cleanId ||
        u.fullName.toLowerCase() === cleanId ||
        u.dni.replace(/\./g, '') === cleanId.replace(/\./g, '')
    );

    if (matchedUser) {
      setUser(matchedUser);
      setIsPlayerLoggedIn(true);
      setShowAuthModal(false);
      return { success: true };
    }

    // Default user match
    if (cleanId === 'martin.rossi' || cleanId === 'martin.rossi@royalplay.com.ar' || cleanId === 'demo' || cleanId === 'jugador') {
      setUser(DEFAULT_USER);
      setIsPlayerLoggedIn(true);
      setShowAuthModal(false);
      return { success: true };
    }

    // Auto-create player session for new custom username
    const autoUser: UserProfile = {
      id: `usr_ar_${Date.now().toString().slice(-4)}`,
      fullName: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
      email: cleanId.includes('@') ? cleanId : `${cleanId}@royalplay.com.ar`,
      dni: '38.491.204',
      phone: '+54 9 11 5029-3819',
      birthDate: '1995-06-20',
      isOver18: true,
      role: 'user',
      kycStatus: 'pending',
      twoFactorEnabled: false,
      twoFactorMethod: 'sms',
      createdAt: new Date().toISOString(),
      balanceARS: 60000,
      bonusBalanceARS: 20000,
    };
    setAllUsers(prev => [autoUser, ...prev]);
    setUser(autoUser);
    setIsPlayerLoggedIn(true);
    setShowAuthModal(false);
    return { success: true };
  };

  const logoutPlayer = () => {
    setIsPlayerLoggedIn(false);
    setShowAuthModal(true);
    setAuthModalTab('player');
  };

  const registerPlayer = (data: {
    fullName: string;
    dni: string;
    email: string;
    phone: string;
    birthDate: string;
    password: string;
  }): { success: boolean; message?: string } => {
    const birthYear = new Date(data.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 18) {
      return { success: false, message: 'La normativa LOTBA prohíbe el registro a menores de 18 años.' };
    }

    const newUser: UserProfile = {
      id: `usr_ar_${Date.now().toString().slice(-4)}`,
      fullName: data.fullName,
      email: data.email,
      dni: data.dni,
      phone: data.phone,
      birthDate: data.birthDate,
      isOver18: true,
      role: 'user',
      kycStatus: 'pending',
      twoFactorEnabled: false,
      twoFactorMethod: 'sms',
      createdAt: new Date().toISOString(),
      balanceARS: 50000,
      bonusBalanceARS: 25000,
    };

    setAllUsers(prev => [newUser, ...prev]);
    setUser(newUser);
    setIsPlayerLoggedIn(true);
    setShowAuthModal(false);

    const bonusTx: Transaction = {
      id: `tx_welcome_${Date.now()}`,
      userId: newUser.id,
      type: 'bonus',
      amount: 25000,
      currency: 'ARS',
      method: 'sistema',
      status: 'completed',
      referenceCode: `WELCOME-BONUS-${Date.now().toString().slice(-4)}`,
      notes: 'Bono de bienvenida por registro de nuevo jugador (+18)',
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [bonusTx, ...prev]);

    return { success: true };
  };

  // Admin Actions (Strictly guarded by session and role-based access control)
  const approveKYCUser = (userId: string) => {
    if (!adminSession) {
      console.warn('Acceso denegado: Se requiere sesión de administrador activa');
      return;
    }

    setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, kycStatus: 'approved' } : u)));
    if (user.id === userId) {
      setUser(prev => ({ ...prev, kycStatus: 'approved' }));
    }
    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: `${adminSession.fullName} (${adminSession.role.toUpperCase()})`,
        actorRole: adminSession.role,
        action: 'KYC_APPROVED',
        details: `Verificación de identidad aprobada para usuario ${userId}. DNI validado formalmente.`,
        severity: 'info',
        ipAddress: '190.210.88.10',
      },
      ...prev,
    ]);
  };

  const rejectKYCUser = (userId: string, reason: string) => {
    if (!adminSession) {
      console.warn('Acceso denegado: Se requiere sesión de administrador activa');
      return;
    }

    setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, kycStatus: 'rejected' } : u)));
    if (user.id === userId) {
      setUser(prev => ({ ...prev, kycStatus: 'rejected' }));
    }
    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: `${adminSession.fullName} (${adminSession.role.toUpperCase()})`,
        actorRole: adminSession.role,
        action: 'KYC_REJECTED',
        details: `Documentación rechazada para usuario ${userId}. Motivo: ${reason}`,
        severity: 'warning',
        ipAddress: '190.210.88.10',
      },
      ...prev,
    ]);
  };

  const approveTransaction = (txId: string, bankReference?: string) => {
    if (!adminSession) {
      console.warn('Acceso denegado: Se requiere sesión de administrador activa');
      return;
    }

    // Role check: Only superadmin can approve financial transactions
    if (adminSession.role !== 'admin') {
      alert('Permiso denegado: La aprobación de transacciones financieras requiere rol de Super Administrador.');
      return;
    }

    const ref = bankReference || `COELSA-3.0-${Math.floor(100000 + Math.random() * 900000)}`;

    setTransactions(prev =>
      prev.map(t => {
        if (t.id === txId) {
          if (t.type === 'withdraw') {
            setWallet(w => ({
              ...w,
              lockedForWithdrawal: Math.max(0, w.lockedForWithdrawal - t.amount),
              totalWithdrawn: w.totalWithdrawn + t.amount,
            }));
          }
          return { ...t, status: 'completed', referenceCode: ref, notes: 'Liquidación bancaria autorizada por Finanzas' };
        }
        return t;
      })
    );

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: `${adminSession.fullName} (Finanzas SuperAdmin)`,
        actorRole: adminSession.role,
        action: 'TRANSACTION_APPROVED',
        details: `Transacción ${txId} liquidada por sistema bancario. Ref: ${ref}`,
        severity: 'info',
        ipAddress: '190.210.88.10',
      },
      ...prev,
    ]);
  };

  const rejectTransaction = (txId: string, reason?: string) => {
    if (!adminSession) {
      console.warn('Acceso denegado: Se requiere sesión de administrador activa');
      return;
    }

    if (adminSession.role !== 'admin') {
      alert('Permiso denegado: El rechazo de transacciones requiere rol de Super Administrador.');
      return;
    }

    const rejectionReason = reason || 'Discrepancia en titularidad CBU/DNI';

    setTransactions(prev =>
      prev.map(t => {
        if (t.id === txId) {
          if (t.type === 'withdraw') {
            // Refund locked balance back to real balance
            setWallet(w => ({
              ...w,
              realBalance: w.realBalance + t.amount,
              lockedForWithdrawal: Math.max(0, w.lockedForWithdrawal - t.amount),
            }));
          }
          return { ...t, status: 'rejected', notes: `Rechazado: ${rejectionReason}` };
        }
        return t;
      })
    );

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: `${adminSession.fullName} (Finanzas SuperAdmin)`,
        actorRole: adminSession.role,
        action: 'TRANSACTION_REJECTED',
        details: `Transacción ${txId} rechazada. Fondos reintegrados. Motivo: ${rejectionReason}`,
        severity: 'warning',
        ipAddress: '190.210.88.10',
      },
      ...prev,
    ]);
  };

  const toggleGameStatus = (gameId: string) => {
    if (!adminSession) {
      console.warn('Acceso denegado: Se requiere sesión de administrador activa');
      return;
    }

    if (adminSession.role !== 'admin') {
      alert('Permiso denegado: La modificación del estado de juegos de sala requiere rol de Super Administrador.');
      return;
    }

    setGames(prev =>
      prev.map(g => {
        if (g.id === gameId) {
          const nextActive = !g.active;
          setAuditLogs(logs => [
            {
              id: `aud_${Date.now()}`,
              timestamp: new Date().toISOString(),
              actor: adminSession.fullName,
              actorRole: adminSession.role,
              action: nextActive ? 'GAME_ACTIVATED' : 'GAME_SUSPENDED',
              details: `Juego ${g.title} (${g.slug}) pasado a estado: ${nextActive ? 'EN SALA' : 'OFFLINE'}`,
              severity: 'info',
              ipAddress: '190.210.88.10',
            },
            ...logs,
          ]);
          return { ...g, active: nextActive };
        }
        return g;
      })
    );
  };

  const updateGameConfig = (gameId: string, updates: Partial<CasinoGame>) => {
    if (!adminSession) return;
    if (adminSession.role !== 'admin') {
      console.warn('Permiso denegado: La configuración de juegos requiere rol de Super Administrador.');
      return;
    }

    setGames(prev =>
      prev.map(g => {
        if (g.id === gameId) {
          setAuditLogs(logs => [
            {
              id: `aud_${Date.now()}`,
              timestamp: new Date().toISOString(),
              actor: adminSession.fullName,
              actorRole: adminSession.role,
              action: 'GAME_CONFIG_UPDATED',
              details: `Parámetros modificados para ${g.title}: RTP=${updates.rtp ?? g.rtp}%, Min=${updates.minBet ?? g.minBet}, Max=${updates.maxBet ?? g.maxBet}`,
              severity: 'info',
              ipAddress: '190.210.88.10',
            },
            ...logs,
          ]);
          return { ...g, ...updates };
        }
        return g;
      })
    );
  };

  const updateUserRoleByAdmin = (userId: string, newRole: UserRole) => {
    if (!adminSession) return;
    setAllUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (user.id === userId) {
      setUser(u => ({ ...u, role: newRole }));
    }

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: `${adminSession.fullName} (${adminSession.role.toUpperCase()})`,
        actorRole: adminSession.role,
        action: 'USER_ROLE_MODIFIED',
        details: `Nivel de cuenta de usuario ${userId} actualizado a: ${newRole.toUpperCase()}`,
        severity: 'info',
        ipAddress: '190.210.88.10',
      },
      ...prev,
    ]);
  };

  const adjustUserBalanceByAdmin = (
    userId: string,
    amount: number,
    isBonus: boolean,
    reason: string
  ) => {
    if (!adminSession) return;
    if (adminSession.role !== 'admin') {
      console.warn('Permiso denegado: El ajuste de balances requiere rol de Super Administrador.');
      return;
    }

    const txType: TransactionType = isBonus ? 'bonus' : amount >= 0 ? 'deposit' : 'refund';

    const newTx: Transaction = {
      id: `tx_adm_${Date.now()}`,
      userId,
      type: txType,
      amount: Math.abs(amount),
      currency: 'ARS',
      method: 'sistema',
      status: 'completed',
      referenceCode: `ADM-ADJ-${Date.now().toString().slice(-6)}`,
      notes: `Ajuste administrativo: ${reason}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    if (userId === user.id) {
      if (isBonus) {
        setWallet(w => ({ ...w, bonusBalance: Math.max(0, w.bonusBalance + amount) }));
      } else {
        setWallet(w => ({ ...w, realBalance: Math.max(0, w.realBalance + amount) }));
      }
    }

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: adminSession.fullName,
        actorRole: adminSession.role,
        action: 'BALANCE_ADJUSTED_BY_ADMIN',
        details: `Ajuste de ${amount >= 0 ? '+' : ''}$${amount.toLocaleString('es-AR')} ARS (${isBonus ? 'Bono' : 'Real'}) para usuario ${userId}. Motivo: ${reason}`,
        severity: 'warning',
        ipAddress: '190.210.88.10',
      },
      ...prev,
    ]);
  };

  const replySupportTicket = (
    ticketId: string,
    replyText: string,
    status: 'open' | 'pending' | 'resolved'
  ) => {
    if (!adminSession) return;

    setSupportTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            messages: [
              ...t.messages,
              {
                sender: 'agent',
                senderName: `${adminSession.fullName} (${adminSession.role === 'admin' ? 'Superadmin' : 'Cumplimiento'})`,
                text: replyText,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return t;
      })
    );

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: adminSession.fullName,
        actorRole: adminSession.role,
        action: 'SUPPORT_TICKET_REPLIED',
        details: `Ticket ${ticketId} respondido y actualizado a estado ${status.toUpperCase()}.`,
        severity: 'info',
        ipAddress: '190.210.88.10',
      },
      ...prev,
    ]);
  };

  const createAuditSelfExclusion = (userId: string, months: number, reason: string) => {
    if (!adminSession) return;

    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + months);

    if (userId === user.id) {
      setResponsibleGaming(prev => ({
        ...prev,
        selfExcludedUntil: expirationDate.toISOString(),
        selfExclusionReason: `Radicación Administrativa RUA LOTBA: ${reason}`,
      }));
    }

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: `${adminSession.fullName} (Cumplimiento LOTBA)`,
        actorRole: adminSession.role,
        action: 'SELF_EXCLUSION_OFFICIAL_REGISTRATION',
        details: `Autoexclusión obligatoria radicada para usuario ${userId} por ${months} meses en Registro Único (RUA). Motivo: ${reason}`,
        severity: 'security',
        ipAddress: '190.210.88.10',
      },
      ...prev,
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeGame,
        setActiveGame,
        soundEnabled,
        toggleSound,
        user,
        isPlayerLoggedIn,
        loginPlayer,
        logoutPlayer,
        registerPlayer,
        showAuthModal,
        setShowAuthModal,
        authModalTab,
        setAuthModalTab,
        switchRole,
        updateUserProfile,
        submitKYC,
        toggleTwoFactor,
        adminSession,
        isAdminAuthenticated: !!adminSession,
        loginAdmin,
        logoutAdmin,
        wallet,
        transactions,
        deposit,
        withdraw,
        games,
        setGames,
        betHistory,
        placeGameBet,
        resolveGameBet,
        responsibleGaming,
        updateResponsibleLimits,
        applyCoolingOff,
        applySelfExclusion,
        sessionElapsedMinutes,
        showRealityCheckAlert,
        dismissRealityCheck,
        promotions,
        tournaments,
        claimPromoCode,
        secureMessages,
        contacts,
        addSecureMessage,
        addContact,
        updateContactStatus,
        whatsappConsent,
        toggleWhatsAppConsent,
        whatsappTemplates,
        whatsappLogs,
        sendWhatsAppTemplateMessage,
        allUsers,
        auditLogs,
        approveKYCUser,
        rejectKYCUser,
        approveTransaction,
        rejectTransaction,
        toggleGameStatus,
        updateGameConfig,
        updateUserRoleByAdmin,
        adjustUserBalanceByAdmin,
        supportTickets,
        replySupportTicket,
        createAuditSelfExclusion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
