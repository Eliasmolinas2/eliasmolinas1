/**
 * RoyalPlay PostgreSQL Architecture & DDL Schema
 * Production-ready relational schema covering all requested enterprise casino modules.
 */

export const POSTGRESQL_DDL_SCHEMA = `-- ========================================================================
-- ROYALPLAY PLATFORM - PRODUCTION POSTGRESQL SCHEMA v2.4 (ARGENTINA)
-- Compliant with LOTBA / IPLyC Responsible Gaming Regulations & Law 25.326
-- ========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS & ROLES
CREATE TYPE user_role_enum AS ENUM ('user', 'vip', 'compliance_officer', 'admin');
CREATE TYPE kyc_status_enum AS ENUM ('unverified', 'pending', 'approved', 'rejected');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    dni VARCHAR(15) UNIQUE NOT NULL, -- Argentine National Identity Document
    phone VARCHAR(30) NOT NULL,
    birth_date DATE NOT NULL,
    is_over_18 BOOLEAN NOT NULL DEFAULT true,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'user',
    kyc_status kyc_status_enum NOT NULL DEFAULT 'unverified',
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    two_factor_secret VARCHAR(128),
    two_factor_method VARCHAR(20) DEFAULT 'app',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_legal_age CHECK (birth_date <= (CURRENT_DATE - INTERVAL '18 years'))
);

-- 2. USER SESSIONS (Security & Device Tracking)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(128) NOT NULL UNIQUE,
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 3. KYC DOCUMENTATION & VERIFICATION
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dni_front_url TEXT NOT NULL,
    dni_back_url TEXT NOT NULL,
    selfie_liveness_url TEXT NOT NULL,
    status kyc_status_enum NOT NULL DEFAULT 'pending',
    reviewer_id UUID REFERENCES users(id),
    rejection_reason TEXT,
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. WALLET & BALANCES (Currency: ARS)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
    real_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (real_balance >= 0),
    bonus_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (bonus_balance >= 0),
    locked_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (locked_balance >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TRANSACTIONS (MercadoPago / CBU / Retiros)
CREATE TYPE transaction_type_enum AS ENUM ('deposit', 'withdraw', 'bet', 'win', 'bonus', 'refund');
CREATE TYPE transaction_status_enum AS ENUM ('completed', 'pending', 'rejected', 'in_review');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    type transaction_type_enum NOT NULL,
    status transaction_status_enum NOT NULL DEFAULT 'pending',
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ARS',
    method VARCHAR(50) NOT NULL, -- mercadopago, cbu_cvu, debito, crypto
    reference_code VARCHAR(100) UNIQUE NOT NULL,
    cbu_alias VARCHAR(100),
    notes TEXT,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CASINO GAMES CATALOG (Aggregator Architecture)
CREATE TABLE casino_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(120) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- slots, roulette, blackjack, crash, live
    provider VARCHAR(80) NOT NULL, -- Pragmatic, Evolution, Originals
    provider_game_id VARCHAR(100),
    rtp NUMERIC(5, 2) NOT NULL, -- e.g. 96.50
    min_bet NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    max_bet NUMERIC(10, 2) NOT NULL DEFAULT 500000.00,
    jackpot_enabled BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BETS & PROVABLY FAIR AUDIT
CREATE TABLE bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    game_id UUID NOT NULL REFERENCES casino_games(id),
    bet_amount NUMERIC(15, 2) NOT NULL CHECK (bet_amount > 0),
    win_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (win_amount >= 0),
    multiplier NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
    client_seed TEXT NOT NULL,
    server_seed_hash VARCHAR(64) NOT NULL,
    nonce INTEGER NOT NULL,
    outcome_detail JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. RESPONSIBLE GAMING LIMITS & SELF-EXCLUSION
CREATE TABLE responsible_gaming_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    deposit_limit_daily NUMERIC(12, 2) DEFAULT 50000.00,
    deposit_limit_weekly NUMERIC(12, 2) DEFAULT 200000.00,
    deposit_limit_monthly NUMERIC(12, 2) DEFAULT 600000.00,
    session_time_limit_minutes INTEGER DEFAULT 60,
    reality_check_interval_minutes INTEGER DEFAULT 30,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE self_exclusions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL means permanent
    cooling_off_period BOOLEAN NOT NULL DEFAULT false,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PROMOTIONS & BONUS ROLLOVERS
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(120) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    bonus_percent INTEGER NOT NULL,
    max_bonus_ars NUMERIC(12, 2) NOT NULL,
    wagering_rollover INTEGER NOT NULL DEFAULT 35,
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true
);

-- 10. SECURE MESSAGES (AES-256-GCM)
CREATE TABLE secure_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_contact_id UUID NOT NULL,
    ciphertext TEXT NOT NULL,
    salt VARCHAR(64) NOT NULL,
    iv VARCHAR(32) NOT NULL,
    tag VARCHAR(32) NOT NULL,
    subject_hint VARCHAR(100),
    expires_at TIMESTAMPTZ,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. SECURE CONTACTS & CONSENT
CREATE TABLE secure_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(120) NOT NULL,
    identifier VARCHAR(120) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'allowed', -- allowed, pending, blocked
    consent_given BOOLEAN NOT NULL DEFAULT true,
    consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

-- 12. WHATSAPP OFFICIAL API & CONSENT (Meta Cloud API)
CREATE TABLE whatsapp_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone_number VARCHAR(30) NOT NULL,
    opted_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source VARCHAR(50) NOT NULL,
    ip_address INET NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_phone VARCHAR(30) NOT NULL,
    template_name VARCHAR(80) NOT NULL,
    status VARCHAR(20) NOT NULL, -- DELIVERED, SENT, FAILED
    meta_message_id VARCHAR(120),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AUDIT LOGS (Immutable Regulatory Ledger)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    actor_role user_role_enum NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info',
    ip_address INET NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. SUPPORT TICKETS
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    subject VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PERFORMANCE INDEXES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_dni ON users(dni);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_bets_user ON bets(user_id);
CREATE INDEX idx_bets_game ON bets(game_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_self_exclusions_user ON self_exclusions(user_id);
`;

export const PROVIDER_INTEGRATION_GUIDE = `
# RoyalPlay - Seamless Game Aggregator API Integration Architecture

Para conectar RoyalPlay a agregadores autorizados (p.ej. Slotegrator, SoftGamings, EveryMatrix, Pragmatic Play Direct):

1. **Authentication & Session Bridge**:
   - RoyalPlay genera un 'session_token' de un solo uso con HMAC-SHA256.
   - El proveedor invoca la URL del iframe: https://provider-games.com/launch?session_token=XYZ&currency=ARS

2. **Seamless Wallet Callbacks (Webhooks Server-to-Server)**:
   - \`POST /api/v1/provider/authenticate\` -> Valida al jugador y devuelve balance actual en ARS.
   - \`POST /api/v1/provider/bet\` -> Bloquea o descuenta monto de apuesta con verificación de límites de juego responsable.
   - \`POST /api/v1/provider/win\` -> Acredita ganancias a la billetera y actualiza rollover.
   - \`POST /api/v1/provider/refund\` -> Reembolsa apuestas canceladas por desconexión.

3. **Responsible Gaming Interceptor**:
   - Todo callback de apuesta valida antes de autorizar:
     * Si el jugador está autoexcluido (SelfExclusion active = true).
     * Si la apuesta excede el límite diario/semanal configurado.
     * Si el reality check de tiempo de sesión ha expirado.
`;
