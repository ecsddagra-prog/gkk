
-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    category_id UUID REFERENCES service_categories(id),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Providers can view their own requests"
    ON service_requests FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM providers WHERE id = service_requests.provider_id
    ));

CREATE POLICY "Providers can create requests"
    ON service_requests FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM providers WHERE id = service_requests.provider_id
    ));

-- Admin policies (assuming admin has a way to bypass RLS or specific role)
-- For now, we'll rely on service_role key for admin actions or add specific admin policies if needed.
