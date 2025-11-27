-- Add city_id to providers table
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_providers_city ON providers(city_id);
