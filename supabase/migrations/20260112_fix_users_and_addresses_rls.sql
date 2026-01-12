-- Fix RLS policies for users table and user_addresses table
-- This migration ensures new signups and address additions work correctly

-- ============================================
-- FIX USERS TABLE RLS
-- ============================================

-- Drop existing user policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create comprehensive user policies
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- FIX USER_ADDRESSES TABLE RLS
-- ============================================

-- Drop existing catchall policy
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
