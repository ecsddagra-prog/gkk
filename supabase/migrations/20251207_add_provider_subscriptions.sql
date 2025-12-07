-- Create provider_subscribers table
CREATE TABLE IF NOT EXISTS provider_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_provider_subscribers_user ON provider_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_subscribers_provider ON provider_subscribers(provider_id);

-- RLS for provider_subscribers
ALTER TABLE provider_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions"
    ON provider_subscribers
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Providers can view their subscribers"
    ON provider_subscribers
    FOR SELECT
    USING (
        provider_id IN (
            SELECT id FROM providers WHERE user_id = auth.uid()
        )
    );

-- Create provider_broadcasts table
CREATE TABLE IF NOT EXISTS provider_broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'daily_menu', 'weekly_menu', 'offer', 'update'
    image_url TEXT,
    sent_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_provider_broadcasts_provider ON provider_broadcasts(provider_id);

-- RLS for provider_broadcasts
ALTER TABLE provider_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their broadcasts"
    ON provider_broadcasts
    FOR ALL
    USING (
        provider_id IN (
            SELECT id FROM providers WHERE user_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_provider_subscribers_updated_at BEFORE UPDATE ON provider_subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
