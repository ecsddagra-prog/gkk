-- Create document change requests table
CREATE TABLE IF NOT EXISTS provider_document_change_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  old_document_id UUID REFERENCES provider_documents(id),
  
  -- New document details
  document_type TEXT NOT NULL,
  new_document_url TEXT NOT NULL,
  new_document_number TEXT,
  
  -- Request details
  change_reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Admin response
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_doc_change_requests_provider ON provider_document_change_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_doc_change_requests_status ON provider_document_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_doc_change_requests_old_doc ON provider_document_change_requests(old_document_id);

-- Add verification_status to providers table
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS verification_status TEXT 
DEFAULT 'pending' 
CHECK (verification_status IN ('pending', 'partially_verified', 'verified', 'rejected'));

-- Create index for verification status
CREATE INDEX IF NOT EXISTS idx_providers_verification_status ON providers(verification_status);

-- Create updated_at trigger for change requests
CREATE OR REPLACE FUNCTION update_doc_change_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_doc_change_request_updated_at
  BEFORE UPDATE ON provider_document_change_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_doc_change_request_updated_at();
