-- Add missing columns to providers table to match registration API
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id),
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS business_category_id UUID REFERENCES service_categories(id),
ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS business_lat DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS business_lng DECIMAL(11,8);

-- Create index for city_id and category for performance
CREATE INDEX IF NOT EXISTS idx_providers_city_id ON providers(city_id);
CREATE INDEX IF NOT EXISTS idx_providers_category_id ON providers(business_category_id);
