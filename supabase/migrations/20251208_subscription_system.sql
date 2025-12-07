-- Subscription-Based Services System Migration
-- For services like Tiffin, Tuition, Milk Delivery, Newspaper, etc.

BEGIN;

-- Drop old subscription tables if exist
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;

-- 1. Add subscription configuration to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS is_subscription_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_config JSONB DEFAULT '{}'::jsonb;

-- 2. Create subscription_sub_services table (e.g., Breakfast, Lunch, Dinner)
CREATE TABLE IF NOT EXISTS subscription_sub_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    unit VARCHAR(50), -- e.g., 'plate', 'glass', 'copy'
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_sub_services_service ON subscription_sub_services(service_id);

-- 3. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    sub_services UUID[], -- Array of subscription_sub_services IDs
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('daily', 'weekly', 'monthly')),
    advance_paid DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_provider ON user_subscriptions(provider_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_service ON user_subscriptions(service_id);

-- 4. Create subscription_broadcasts table
CREATE TABLE IF NOT EXISTS subscription_broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    images TEXT[],
    broadcast_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_broadcasts_provider ON subscription_broadcasts(provider_id);
CREATE INDEX IF NOT EXISTS idx_subscription_broadcasts_date ON subscription_broadcasts(broadcast_date);

-- 5. Create subscription_responses table (Accept/Reject/Not Today)
CREATE TABLE IF NOT EXISTS subscription_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broadcast_id UUID REFERENCES subscription_broadcasts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    response VARCHAR(20) NOT NULL CHECK (response IN ('accepted', 'rejected', 'not_today')),
    quantity INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(broadcast_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscription_responses_broadcast ON subscription_responses(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_subscription_responses_user ON subscription_responses(user_id);

-- 6. Create subscription_deliveries table (QR-based delivery tracking)
CREATE TABLE IF NOT EXISTS subscription_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    broadcast_id UUID REFERENCES subscription_broadcasts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity INT DEFAULT 1,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'cancelled')),
    delivered_at TIMESTAMP WITH TIME ZONE,
    qr_token VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_deliveries_subscription ON subscription_deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_deliveries_user ON subscription_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_deliveries_provider ON subscription_deliveries(provider_id);
CREATE INDEX IF NOT EXISTS idx_subscription_deliveries_date ON subscription_deliveries(delivery_date);

-- 7. Create subscription_ledger table (Credit/Debit tracking)
CREATE TABLE IF NOT EXISTS subscription_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'advance')),
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT,
    delivery_id UUID REFERENCES subscription_deliveries(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_ledger_subscription ON subscription_ledger(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_ledger_user ON subscription_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_ledger_provider ON subscription_ledger(provider_id);

-- 8. Create provider_qr_tokens table (Secure QR codes with rotation)
CREATE TABLE IF NOT EXISTS provider_qr_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    token VARCHAR(100) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_qr_tokens_provider ON provider_qr_tokens(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_qr_tokens_token ON provider_qr_tokens(token);

-- 9. RLS will be configured via API with service role key

-- 17. Triggers for updated_at
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_subscriptions_updated_at') THEN
        CREATE TRIGGER update_user_subscriptions_updated_at 
            BEFORE UPDATE ON user_subscriptions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 18. Function to generate QR token
CREATE OR REPLACE FUNCTION generate_provider_qr_token(p_provider_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    new_token VARCHAR;
BEGIN
    UPDATE provider_qr_tokens 
    SET is_active = false 
    WHERE provider_id = p_provider_id;
    
    new_token := encode(gen_random_bytes(32), 'hex');
    
    INSERT INTO provider_qr_tokens (provider_id, token, expires_at)
    VALUES (p_provider_id, new_token, NOW() + INTERVAL '24 hours');
    
    RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. Function to record delivery
CREATE OR REPLACE FUNCTION record_subscription_delivery(
    p_subscription_id UUID,
    p_broadcast_id UUID,
    p_quantity INT,
    p_amount DECIMAL
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_provider_id UUID;
    v_delivery_id UUID;
    v_current_balance DECIMAL;
BEGIN
    SELECT user_id, provider_id INTO v_user_id, v_provider_id
    FROM user_subscriptions WHERE id = p_subscription_id;
    
    INSERT INTO subscription_deliveries (
        subscription_id, broadcast_id, user_id, provider_id,
        quantity, amount, status, delivered_at
    ) VALUES (
        p_subscription_id, p_broadcast_id, v_user_id, v_provider_id,
        p_quantity, p_amount, 'delivered', NOW()
    ) RETURNING id INTO v_delivery_id;
    
    SELECT COALESCE(balance_after, 0) INTO v_current_balance
    FROM subscription_ledger
    WHERE subscription_id = p_subscription_id
    ORDER BY created_at DESC LIMIT 1;
    
    INSERT INTO subscription_ledger (
        subscription_id, user_id, provider_id,
        transaction_type, amount, balance_after,
        description, delivery_id
    ) VALUES (
        p_subscription_id, v_user_id, v_provider_id,
        'debit', p_amount, v_current_balance - p_amount,
        'Delivery on ' || CURRENT_DATE, v_delivery_id
    );
    
    RETURN v_delivery_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
