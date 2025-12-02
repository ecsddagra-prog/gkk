-- Create provider payment settings table
CREATE TABLE IF NOT EXISTS provider_payment_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  
  -- Bank Transfer Details
  account_holder_name TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  
  -- UPI Details
  upi_id TEXT,
  qr_code_url TEXT,
  
  -- Payment Preferences
  primary_method TEXT CHECK (primary_method IN ('bank', 'upi', 'cash', 'all')),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  
  -- Admin notes
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(provider_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_provider_payment_settings_provider_id ON provider_payment_settings(provider_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_provider_payment_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_provider_payment_settings_updated_at
  BEFORE UPDATE ON provider_payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_payment_settings_updated_at();
