-- Drop existing table to ensure clean schema (WARNING: This deletes existing document records)
DROP TABLE IF EXISTS provider_documents CASCADE;

-- Create provider_documents table
CREATE TABLE provider_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- aadhar, pan, license, experience, bank, qualification, other
    document_number VARCHAR(100),
    document_url TEXT,
    metadata JSONB,
    status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_provider_documents_provider_id ON provider_documents(provider_id);

-- Create partial unique index to ensure one document per type for standard types
CREATE UNIQUE INDEX idx_provider_documents_unique_type 
ON provider_documents(provider_id, document_type) 
WHERE document_type NOT IN ('other');
