-- Fix user_addresses RLS policy for INSERT

-- Drop existing policy if any
DROP POLICY IF EXISTS "Users can manage own addresses" ON user_addresses;

-- Create separate policies for each operation
CREATE POLICY "Users can view own addresses"
ON user_addresses
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own addresses"
ON user_addresses
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own addresses"
ON user_addresses
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own addresses"
ON user_addresses
FOR DELETE
USING (user_id = auth.uid());
