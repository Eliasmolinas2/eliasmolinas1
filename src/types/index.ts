export type UserRole = 'user' | 'vip' | 'compliance_officer' | 'admin';
export type AdminRole = 'admin' | 'compliance_officer';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  jurisdiction: string;
  lastLogin: string;
}

export type KYCStatus = 'unverified' | 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  dni: string; // Argentine DNI
  phone: string;
  birthDate: string; // YYYY-MM-DD
  isOver18: boolean;
  role: UserRole;
  kycStatus: KYCStatus;
  kycDocuments?: {
    frontDniUrl?: string;
    backDniUrl?: string;
    selfieUrl?: string;
    submittedAt?: string;
  };
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorMethod: 'app' | 'whatsapp' | 'sms';
  createdAt: string;
  balanceARS?: number;
  bonusBalanceARS?: number;
}

export type TransactionType = 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus' | 'refund';
export type TransactionStatus = 'completed' | 'pending' | 'rejected' | 'in_review';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: 'ARS';
  method: 'mercadopago' | 'transferencia_bancaria' | 'debito' | 'cripto' | 'sistema';
  status: TransactionStatus;
  referenceCode: string;
  cbuAlias?: string;
  notes?: string;
  createdAt: string;
}

export interface WalletState {
  realBalance: number;
  bonusBalance: number;
  lockedForWithdrawal: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

export interface ResponsibleGamingSettings {
  depositLimitDaily: number;
  depositLimitWeekly: number;
  depositLimitMonthly: number;
  sessionTimeLimitMinutes: number;
  realityCheckMinutes: number;
  coolingOffUntil: string | null; // ISO Date or null
  selfExcludedUntil: string | null; // ISO Date or null
  selfExclusionReason: string | null;
  lastTestDate?: string;
  lastTestScore?: number;
}

export type GameCategory = 'all' | 'slots' | 'roulette' | 'blackjack' | 'crash' | 'live';

export interface CasinoGame {
  id: string;
  title: string;
  slug: string;
  category: GameCategory;
  provider: 'RoyalPlay Originals' | 'Pragmatic Play' | 'Evolution Gaming' | 'Playtech' | 'Playngo';
  rtp: number; // e.g. 96.5%
  minBet: number;
  maxBet: number;
  jackpotARS?: number;
  featured: boolean;
  active: boolean;
  volatility: 'Baja' | 'Media' | 'Alta';
  tag?: string;
}

export interface BetHistoryEntry {
  id: string;
  gameId: string;
  gameTitle: string;
  betAmount: number;
  winAmount: number;
  multiplier: number;
  outcomeDetail: string;
  provablyFair: {
    clientSeed: string;
    serverSeedHash: string;
    nonce: number;
    verified: boolean;
  };
  timestamp: string;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  prizePoolARS: number;
  category: GameCategory;
  startsAt: string;
  endsAt: string;
  participantsCount: number;
  leaderboard: {
    rank: number;
    username: string;
    points: number;
    prizeARS: number;
  }[];
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  bonusPercent: number;
  maxBonusARS: number;
  wageringRequirement: number; // rollover multiplier
  validUntil: string;
  category: 'welcome' | 'cashback' | 'free_spins' | 'vip';
  active: boolean;
}

export interface SecureMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientContactId: string;
  recipientName: string;
  ciphertext: string;
  salt: string;
  iv: string;
  tag: string;
  subjectHint: string;
  expiresAt?: string;
  createdAt: string;
  isRead: boolean;
}

export interface SecureContact {
  id: string;
  name: string;
  aliasOrPhone: string;
  consentGiven: boolean;
  consentDate: string;
  status: 'allowed' | 'pending' | 'blocked';
  publicKeyFingerprint?: string;
  notes?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'AUTHENTICATION' | 'UTILITY' | 'MARKETING';
  language: string;
  content: string;
  variables: string[];
  status: 'APPROVED' | 'IN_REVIEW' | 'REJECTED';
}

export interface WhatsAppConsent {
  id: string;
  userId: string;
  phoneNumber: string;
  optedInAt: string;
  source: 'web_registration' | 'security_settings' | 'user_profile';
  ipAddress: string;
  active: boolean;
}

export interface WhatsAppLog {
  id: string;
  templateName: string;
  recipientPhone: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED' | 'READ';
  sentAt: string;
  metaMessageId: string;
  dailyQuotaRemaining: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'security';
  ipAddress: string;
}

export interface SupportTicket {
  id: string;
  user: string;
  userId: string;
  email: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  time: string;
  messages: {
    sender: 'user' | 'agent';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}
