-- Fix infinite recursion in RLS policies
-- This migration fixes the recursive policy issue on users table

-- Drop the problematic admin policy on users table
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Drop other policies that might cause recursion
DROP POLICY IF EXISTS "Only admins can manage cities" ON cities;
DROP POLICY IF EXISTS "Only admins can manage services" ON services;
DROP POLICY IF EXISTS "Only admins can manage settings" ON admin_settings;

-- Recreate users admin policy using a security definer function approach
-- For now, we'll use a simpler approach - admins can view all users
-- Note: In production, you might want to use service role for admin operations
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        -- Check if user is admin by checking auth.jwt() claims
        -- This avoids recursion by not querying users table
        (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin')
        OR auth.uid() = id
    );

-- Alternative: Use a function to check admin status (more reliable)
-- First create a function that doesn't cause recursion
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Use auth.uid() directly to avoid recursion
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_id
        AND role IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now recreate policies using the function or simpler checks
-- Cities admin policy
CREATE POLICY "Only admins can manage cities" ON cities
    FOR ALL USING (
        is_admin(auth.uid())
    );

-- Services admin policy  
CREATE POLICY "Only admins can manage services" ON services
    FOR ALL USING (
        is_admin(auth.uid())
    );

-- Admin settings policy
CREATE POLICY "Only admins can manage settings" ON admin_settings
    FOR ALL USING (
        is_admin(auth.uid())
    );

-- However, the function approach still queries users table which might cause issues
-- Better approach: Use service role for admin operations or simplify policies

-- Let's use a simpler approach - remove admin policies that cause recursion
-- Admin operations should be done via API with service role key

-- Drop the function approach policies
DROP POLICY IF EXISTS "Only admins can manage cities" ON cities;
DROP POLICY IF EXISTS "Only admins can manage services" ON services;
DROP POLICY IF EXISTS "Only admins can manage settings" ON admin_settings;
DROP FUNCTION IF EXISTS is_admin(UUID);

-- Recreate with simpler policies that don't query users table
-- For admin operations, use service role in API routes (which we already do)
-- These policies are for client-side access only

-- Cities: Only allow SELECT for non-admins, admin operations via API
CREATE POLICY "Only admins can manage cities" ON cities
    FOR ALL USING (false); -- Disable client-side admin operations, use API instead

-- Services: Only allow SELECT for non-admins
CREATE POLICY "Only admins can manage services" ON services
    FOR ALL USING (false); -- Disable client-side admin operations, use API instead

-- Admin settings: Only allow SELECT for non-admins  
CREATE POLICY "Only admins can manage settings" ON admin_settings
    FOR ALL USING (false); -- Disable client-side admin operations, use API instead

-- Users: Fix the admin view policy to avoid recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Simple policy: Users can only see their own data
-- Admin operations will use service role in API
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Note: Admin viewing all users will be handled via API using service role
-- This avoids RLS recursion issues

