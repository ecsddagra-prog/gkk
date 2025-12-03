-- Verification query to check if ratings table has been updated correctly
-- Run this in Supabase SQL Editor or via CLI

-- 1. Check if new columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'ratings'
AND column_name IN ('rated_by', 'behavior_rating', 'nature_rating', 'work_knowledge_rating', 'work_quality_rating', 'punctuality_rating')
ORDER BY column_name;

-- 2. Check all check constraints on ratings table
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'ratings'
AND con.contype = 'c'
ORDER BY con.conname;

-- 3. Check unique constraints
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'ratings'
AND con.contype = 'u'
ORDER BY con.conname;

-- 4. Check RLS policies on ratings table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'ratings'
ORDER BY policyname;
