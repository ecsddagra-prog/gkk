-- Add gst_number and business_category_id to providers table
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS gst_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS business_category_id UUID REFERENCES service_categories(id);
