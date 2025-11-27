-- Create booking_items table for multi-select sub-services
CREATE TABLE IF NOT EXISTS booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    sub_service_id UUID REFERENCES service_subservices(id),
    sub_service_name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON booking_items(booking_id);

ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own booking items" ON booking_items;
CREATE POLICY "Users view own booking items"
    ON booking_items
    FOR SELECT
    USING (
        booking_id IN (
            SELECT id FROM bookings WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Providers view assigned booking items" ON booking_items;
CREATE POLICY "Providers view assigned booking items"
    ON booking_items
    FOR SELECT
    USING (
        booking_id IN (
            SELECT id FROM bookings WHERE provider_id IN (
                SELECT id FROM providers WHERE user_id = auth.uid()
            )
        )
    );
