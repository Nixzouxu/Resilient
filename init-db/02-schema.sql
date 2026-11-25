-- 1. Tabel Tenants (Organisasi / Workspace)
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Users (Autentikasi Dashboard)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Services (Target yang dipantau oleh Agent)
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    endpoint_url TEXT,
    container_name VARCHAR(255),
    check_interval INT DEFAULT 30,
    status VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
    consecutive_failures INT NOT NULL DEFAULT 0,
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk mempercepat query agent berdasarkan tenant
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);

-- isi kolom telegram_chat_id di tabel tenants untuk menyimpan ID chat Telegram
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(255);
ALTER TABLE services ADD COLUMN IF NOT EXISTS last_alerted_at TIMESTAMPTZ;