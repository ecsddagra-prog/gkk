-- Add pricing_unit column to services table
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS pricing_unit VARCHAR(20) DEFAULT 'job';

-- Add pricing_unit column to service_subservices table
ALTER TABLE public.service_subservices
ADD COLUMN IF NOT EXISTS pricing_unit VARCHAR(20) DEFAULT 'job';

-- Comment on columns
COMMENT ON COLUMN public.services.pricing_unit IS 'Master unit of pricing (job, hour, day, week, month, km, visit). Providers must follow this.';
COMMENT ON COLUMN public.service_subservices.pricing_unit IS 'Master unit of pricing for sub-services.';
