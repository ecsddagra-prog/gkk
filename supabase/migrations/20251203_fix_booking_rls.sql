-- 1. Create a secure is_admin function that avoids recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user has the admin role in the users table
  -- SECURITY DEFINER allows this function to bypass RLS on the users table
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Reset Bookings Policies
-- Drop all known policies to ensure a clean slate
DROP POLICY IF EXISTS "Admins delete all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins update all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins view all bookings" ON bookings;
DROP POLICY IF EXISTS "Providers update assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Providers view assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Users create own bookings" ON bookings;
DROP POLICY IF EXISTS "Users update own bookings" ON bookings;
DROP POLICY IF EXISTS "Users view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Providers can view assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

-- 3. Create New Policies

-- Admin Access (Full Access)
CREATE POLICY "Admins can do everything on bookings"
ON bookings
FOR ALL
USING (is_admin());

-- User Access
CREATE POLICY "Users can view own bookings"
ON bookings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
ON bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
ON bookings
FOR UPDATE
USING (auth.uid() = user_id);

-- Provider Access
CREATE POLICY "Providers can view assigned bookings"
ON bookings
FOR SELECT
USING (
  provider_id IN (
    SELECT id FROM providers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Providers can update assigned bookings"
ON bookings
FOR UPDATE
USING (
  provider_id IN (
    SELECT id FROM providers WHERE user_id = auth.uid()
  )
);

-- Ensure RLS is enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
