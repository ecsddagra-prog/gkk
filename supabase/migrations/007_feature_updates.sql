-- Advanced platform updates: business-first providers, booking metadata,
-- wallet enhancements, and rate quote workflow.
BEGIN;

-- User location defaults
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_city_id UUID REFERENCES cities(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_city_id UUID REFERENCES cities(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10,8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_lng DECIMAL(11,8);

-- Provider business-first fields
ALTER TABLE providers ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS business_lat DECIMAL(10,8);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS business_lng DECIMAL(11,8);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS business_category_id UUID REFERENCES service_categories(id);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS business_subcategory_id UUID REFERENCES services(id);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS gst_number VARCHAR(15);

-- Service sub-services (variants)
CREATE TABLE IF NOT EXISTS service_subservices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    pricing_type VARCHAR(20) DEFAULT 'fixed', -- fixed | hourly | hybrid
    base_charge DECIMAL(10,2) DEFAULT 0.00,
    per_hour_charge DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_subservices_service ON service_subservices(service_id);

ALTER TABLE service_subservices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active sub-services are public"
    ON service_subservices
    FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Only admins manage sub-services" ON service_subservices;
CREATE POLICY "Only admins manage sub-services"
    ON service_subservices
    FOR ALL
    USING (false);

-- Provider documents
CREATE TABLE IF NOT EXISTS provider_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending | approved | rejected
    metadata JSONB,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_documents_provider ON provider_documents(provider_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_documents_unique ON provider_documents(provider_id, doc_type);

ALTER TABLE provider_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Providers manage their documents" ON provider_documents;
CREATE POLICY "Providers manage their documents"
    ON provider_documents
    FOR ALL
    USING (
        provider_id IN (
            SELECT id FROM providers WHERE user_id = auth.uid()
        )
    );

-- Bookings need richer metadata
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sub_service_id UUID REFERENCES service_subservices(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sub_service_name VARCHAR(200);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS base_charge DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hourly_charge DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS for_whom VARCHAR(20) DEFAULT 'self';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS other_contact JSONB;

-- Wallet master table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    locked_balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own wallet" ON wallets;
CREATE POLICY "Users view own wallet"
    ON wallets
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users cannot mutate wallet directly" ON wallets;
CREATE POLICY "Users cannot mutate wallet directly"
    ON wallets
    FOR ALL
    USING (false);

ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES wallets(id);

-- Wallet top-ups workflow (mock payments)
CREATE TABLE IF NOT EXISTS wallet_topups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending | success | failed
    reference_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE wallet_topups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own topups" ON wallet_topups;
CREATE POLICY "Users view own topups"
    ON wallet_topups
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users create own topups" ON wallet_topups;
CREATE POLICY "Users create own topups"
    ON wallet_topups
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users cannot update topups" ON wallet_topups;
CREATE POLICY "Users cannot update topups"
    ON wallet_topups
    FOR UPDATE
    USING (false);

-- Keep wallet timestamps fresh
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_wallets_updated_at ON wallets;
CREATE TRIGGER trg_wallets_updated_at
BEFORE UPDATE ON wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallet_timestamp();

CREATE OR REPLACE FUNCTION update_wallet_topup_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_wallet_topups_updated_at ON wallet_topups;
CREATE TRIGGER trg_wallet_topups_updated_at
BEFORE UPDATE ON wallet_topups
FOR EACH ROW
EXECUTE FUNCTION update_wallet_topup_timestamp();

-- Rate quote workflow
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rate_quote_status') THEN
        CREATE TYPE rate_quote_status AS ENUM ('open', 'expired', 'matched', 'converted', 'cancelled');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_quote_status') THEN
        CREATE TYPE provider_quote_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS rate_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    sub_service_id UUID REFERENCES service_subservices(id),
    city_id UUID REFERENCES cities(id),
    address_id UUID REFERENCES user_addresses(id),
    requested_price DECIMAL(10,2),
    status rate_quote_status DEFAULT 'open',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_quotes_user ON rate_quotes(user_id);

ALTER TABLE rate_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own rate quotes" ON rate_quotes;
CREATE POLICY "Users manage own rate quotes"
    ON rate_quotes
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users create rate quotes" ON rate_quotes;
CREATE POLICY "Users create rate quotes"
    ON rate_quotes
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rate_quote_id UUID REFERENCES rate_quotes(id);

CREATE TABLE IF NOT EXISTS provider_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rate_quote_id UUID REFERENCES rate_quotes(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    quoted_price DECIMAL(10,2) NOT NULL,
    message TEXT,
    status provider_quote_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_quotes_rate ON provider_quotes(rate_quote_id);

ALTER TABLE provider_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Providers view their quotes" ON provider_quotes;
CREATE POLICY "Providers view their quotes"
    ON provider_quotes
    FOR SELECT
    USING (
        provider_id IN (
            SELECT id FROM providers WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Providers submit quotes" ON provider_quotes;
CREATE POLICY "Providers submit quotes"
    ON provider_quotes
    FOR INSERT
    WITH CHECK (
        provider_id IN (
            SELECT id FROM providers WHERE user_id = auth.uid()
        )
    );

COMMIT;

