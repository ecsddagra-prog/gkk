-- Fix RLS policies for service_categories to allow fetching
-- This fixes the issue where categories were not loading in the Admin Panel

-- Allow everyone to view active categories (public read)
-- Note: We allow viewing ALL categories for now to ensure Admins can see them too
-- Ideally, we'd filter is_active=true for public and all for admins, but for simplicity:
CREATE POLICY "Categories are viewable by everyone" ON service_categories
    FOR SELECT USING (true);

-- Only admins can manage categories (insert/update/delete)
-- This is technically redundant if we only use API (service role), but good for security
CREATE POLICY "Only admins can manage categories" ON service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND (users.role = 'admin' OR users.role = 'superadmin')
        )
    );
