-- Fix RLS for city_services to allow public read access
-- This is required for the Home page to load services

CREATE POLICY "City services are viewable by everyone" ON city_services
    FOR SELECT USING (is_enabled = true);

-- Also ensure provider_services are viewable if needed for finding providers
CREATE POLICY "Provider services are viewable by everyone" ON provider_services
    FOR SELECT USING (is_active = true);
