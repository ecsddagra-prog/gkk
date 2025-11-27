-- Function to add wallet balance
CREATE OR REPLACE FUNCTION add_wallet_balance(
    user_id UUID,
    amount DECIMAL,
    transaction_type TEXT
)
RETURNS VOID AS $$
DECLARE
    current_balance DECIMAL;
    new_balance DECIMAL;
BEGIN
    -- Get current balance
    SELECT wallet_balance INTO current_balance
    FROM users
    WHERE id = user_id;

    -- Calculate new balance
    new_balance := COALESCE(current_balance, 0) + amount;

    -- Update wallet balance
    UPDATE users
    SET wallet_balance = new_balance
    WHERE id = user_id;

    -- Create transaction record (if needed, can be called separately)
    -- This is a helper function, actual transaction creation happens in API
END;
$$ LANGUAGE plpgsql;

-- Function to check and auto-suspend providers with low ratings
CREATE OR REPLACE FUNCTION check_provider_ratings()
RETURNS TRIGGER AS $$
DECLARE
    recent_ratings DECIMAL[];
    all_low BOOLEAN := true;
    suspension_days INT;
BEGIN
    -- Get last 3 ratings for this provider
    SELECT ARRAY_AGG(rating ORDER BY created_at DESC)
    INTO recent_ratings
    FROM ratings
    WHERE provider_id = NEW.provider_id
    ORDER BY created_at DESC
    LIMIT 3;

    -- Check if we have 3 ratings and all are <= 2
    IF array_length(recent_ratings, 1) = 3 THEN
        FOR i IN 1..3 LOOP
            IF recent_ratings[i] > 2 THEN
                all_low := false;
                EXIT;
            END IF;
        END LOOP;

        -- If all 3 are low, suspend provider
        IF all_low THEN
            SELECT value->>'value'::INT INTO suspension_days
            FROM admin_settings
            WHERE key = 'suspension_days'
            LIMIT 1;

            IF suspension_days IS NULL THEN
                suspension_days := 7; -- Default 7 days
            END IF;

            UPDATE providers
            SET 
                is_suspended = true,
                suspension_until = NOW() + (suspension_days || ' days')::INTERVAL
            WHERE id = NEW.provider_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-suspension (already handled in API, but can be used as backup)
-- CREATE TRIGGER check_ratings_trigger
-- AFTER INSERT ON ratings
-- FOR EACH ROW
-- EXECUTE FUNCTION check_provider_ratings();

-- Function to get nearby providers (for use in API)
CREATE OR REPLACE FUNCTION get_nearby_providers(
    service_id_param UUID,
    lat_param DECIMAL,
    lng_param DECIMAL,
    radius_km_param DECIMAL DEFAULT 10
)
RETURNS TABLE (
    provider_id UUID,
    distance_km DECIMAL,
    provider_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        -- Haversine formula for distance calculation
        (
            6371 * acos(
                cos(radians(lat_param)) *
                cos(radians(COALESCE(p.current_lat, p.fixed_location_lat))) *
                cos(radians(COALESCE(p.current_lng, p.fixed_location_lng)) - radians(lng_param)) +
                sin(radians(lat_param)) *
                sin(radians(COALESCE(p.current_lat, p.fixed_location_lat)))
            )
        ) AS distance,
        row_to_json(p)::JSONB AS provider_data
    FROM providers p
    INNER JOIN provider_services ps ON ps.provider_id = p.id
    WHERE 
        ps.service_id = service_id_param
        AND p.is_verified = true
        AND p.is_suspended = false
        AND p.is_available = true
        AND p.is_online = true
        AND (
            p.current_lat IS NOT NULL OR p.fixed_location_lat IS NOT NULL
        )
    HAVING (
        6371 * acos(
            cos(radians(lat_param)) *
            cos(radians(COALESCE(p.current_lat, p.fixed_location_lat))) *
            cos(radians(COALESCE(p.current_lng, p.fixed_location_lng)) - radians(lng_param)) +
            sin(radians(lat_param)) *
            sin(radians(COALESCE(p.current_lat, p.fixed_location_lat)))
        )
    ) <= radius_km_param
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

