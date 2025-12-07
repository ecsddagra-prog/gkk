-- Add pricing_unit column to provider_services
ALTER TABLE public.provider_services 
ADD COLUMN IF NOT EXISTS pricing_unit VARCHAR(20) DEFAULT 'job';

-- Add pricing_unit column to provider_service_rates (for sub-services)
ALTER TABLE public.provider_service_rates 
ADD COLUMN IF NOT EXISTS pricing_unit VARCHAR(20) DEFAULT 'job';

-- Comment on columns
COMMENT ON COLUMN public.provider_services.pricing_unit IS 'Unit of pricing (job, hour, day, week, month, km, visit)';
COMMENT ON COLUMN public.provider_service_rates.pricing_unit IS 'Unit of pricing for sub-services (job, hour, day, week, month, km, visit)';
