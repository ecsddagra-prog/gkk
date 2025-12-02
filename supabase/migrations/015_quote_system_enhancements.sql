-- Quote System Enhancements

-- Add quote tracking fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS provider_counter_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS final_agreed_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS quote_status TEXT DEFAULT 'none' 
  CHECK (quote_status IN ('none', 'user_quoted', 'provider_countered', 'accepted', 'rejected'));

-- Update existing bookings to have quote_status based on current state
UPDATE bookings 
SET quote_status = CASE
  WHEN user_quoted_price IS NOT NULL AND status = 'quote_requested' THEN 'user_quoted'
  WHEN status = 'quote_sent' THEN 'provider_countered'
  WHEN status IN ('quote_accepted', 'confirmed') THEN 'accepted'
  ELSE 'none'
END
WHERE quote_status = 'none';

-- Create provider service rates table (for custom pricing)
CREATE TABLE IF NOT EXISTS provider_service_rates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  custom_rate DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, service_id)
);

-- Create quote negotiation history table
CREATE TABLE IF NOT EXISTS quote_negotiations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  quoted_by TEXT NOT NULL CHECK (quoted_by IN ('user', 'provider')),
  quoted_price DECIMAL(10,2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_quote_status ON bookings(quote_status);
CREATE INDEX IF NOT EXISTS idx_provider_service_rates_provider ON provider_service_rates(provider_id);
CREATE INDEX IF NOT EXISTS idx_quote_negotiations_booking ON quote_negotiations(booking_id);

-- Create updated_at trigger for provider_service_rates
CREATE OR REPLACE FUNCTION update_provider_service_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_provider_service_rates_updated_at
  BEFORE UPDATE ON provider_service_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_service_rates_updated_at();
