-- Add sub-sub-services support (3-level hierarchy)
-- This enables: Service → Sub-service → Sub-sub-service

-- Create sub_subservices table
CREATE TABLE IF NOT EXISTS service_sub_subservices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sub_service_id UUID REFERENCES service_subservices(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    base_charge DECIMAL(10,2) DEFAULT 0.00,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sub_subservices_sub_service 
    ON service_sub_subservices(sub_service_id);

-- Enable RLS
ALTER TABLE service_sub_subservices ENABLE ROW LEVEL SECURITY;

-- Public can view active sub-sub-services
CREATE POLICY "Active sub-sub-services are viewable by everyone"
    ON service_sub_subservices
    FOR SELECT
    USING (is_active = true);

-- Only admins can manage sub-sub-services
CREATE POLICY "Only admins can manage sub-sub-services"
    ON service_sub_subservices
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND (users.role = 'admin' OR users.role = 'superadmin')
        )
    );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_sub_subservices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sub_subservices_timestamp
    BEFORE UPDATE ON service_sub_subservices
    FOR EACH ROW
    EXECUTE FUNCTION update_sub_subservices_updated_at();
