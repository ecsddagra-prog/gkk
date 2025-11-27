-- Enable Row Level Security
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashback_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Cities: Public read for active cities
CREATE POLICY "Cities are viewable by everyone" ON cities
    FOR SELECT USING (is_active = true);

-- Cities admin management: Handled via API with service role to avoid RLS recursion
-- Client-side operations disabled, all admin ops go through API
CREATE POLICY "Only admins can manage cities" ON cities
    FOR ALL USING (false);

-- Services: Public read for active services
CREATE POLICY "Active services are viewable by everyone" ON services
    FOR SELECT USING (is_active = true);

-- Services admin management: Handled via API with service role to avoid RLS recursion
CREATE POLICY "Only admins can manage services" ON services
    FOR ALL USING (false);

-- Users: Users can read their own data
-- Note: Admin viewing all users is handled via API using service role to avoid RLS recursion
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- User Addresses: Users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON user_addresses
    FOR ALL USING (user_id = auth.uid());

-- Providers: Public read, providers can update own profile
CREATE POLICY "Providers are viewable by everyone" ON providers
    FOR SELECT USING (is_verified = true AND is_suspended = false);

CREATE POLICY "Providers can update own profile" ON providers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.id = providers.user_id
        )
    );

-- Bookings: Users and providers can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Providers can view assigned bookings" ON bookings
    FOR SELECT USING (provider_id IN (
        SELECT id FROM providers WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (user_id = auth.uid());

-- Chat Messages: Participants can view messages
CREATE POLICY "Chat participants can view messages" ON chat_messages
    FOR SELECT USING (
        sender_id = auth.uid() OR receiver_id = auth.uid()
    );

CREATE POLICY "Users can send chat messages" ON chat_messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Ratings: Users can create ratings for their bookings
CREATE POLICY "Users can create ratings for own bookings" ON ratings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = ratings.booking_id 
            AND bookings.user_id = auth.uid()
        )
    );

CREATE POLICY "Ratings are viewable by everyone" ON ratings
    FOR SELECT USING (true);

-- Wallet Transactions: Users can view own transactions
CREATE POLICY "Users can view own wallet transactions" ON wallet_transactions
    FOR SELECT USING (user_id = auth.uid());

-- Notifications: Users can view own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Admin Settings: Handled via API with service role to avoid RLS recursion
CREATE POLICY "Only admins can manage settings" ON admin_settings
    FOR ALL USING (false);

