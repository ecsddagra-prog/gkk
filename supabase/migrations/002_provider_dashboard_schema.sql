-- Provider Dashboard Schema Updates

-- 1. Update providers table with new columns for pricing and profile
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS travel_charge_type VARCHAR(20) DEFAULT 'per_km', -- 'per_km', 'slab', 'fixed'
ADD COLUMN IF NOT EXISTS travel_charge_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS free_travel_radius_km DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS enable_travel_charges BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_rental_charges BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gst_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT 18.00,
ADD COLUMN IF NOT EXISTS short_bio TEXT,
ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS past_companies TEXT;

-- 2. Update provider_services table with extra charge fields
ALTER TABLE provider_services
ADD COLUMN IF NOT EXISTS inspection_fee DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS emergency_fee DECIMAL(10,2) DEFAULT 0.00;

-- 3. Create provider_documents table
CREATE TABLE IF NOT EXISTS provider_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'aadhar', 'pan', 'certificate', 'other'
    document_number VARCHAR(100),
    document_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create provider_staff table
CREATE TABLE IF NOT EXISTS provider_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(100), -- 'electrician', 'helper', 'driver', etc.
    id_proof_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create provider_staff_services table (Many-to-Many)
CREATE TABLE IF NOT EXISTS provider_staff_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES provider_staff(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(staff_id, service_id)
);

-- 6. Add indexes
CREATE INDEX IF NOT EXISTS idx_provider_documents_provider ON provider_documents(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_staff_provider ON provider_staff(provider_id);

-- 7. Add triggers for updated_at
CREATE TRIGGER update_provider_documents_updated_at BEFORE UPDATE ON provider_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_staff_updated_at BEFORE UPDATE ON provider_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
