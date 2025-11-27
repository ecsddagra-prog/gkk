-- Verification Queries
-- Run these in Supabase SQL Editor to verify migrations

-- 1. Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check service categories count (should be 7)
SELECT COUNT(*) as category_count FROM service_categories;

-- 3. Check services count (should be 40+)
SELECT COUNT(*) as service_count FROM services;

-- 4. Check cities count (should be 8)
SELECT COUNT(*) as city_count FROM cities;

-- 5. Check if RLS is enabled on key tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'bookings', 'providers', 'payments')
ORDER BY tablename;

-- 6. Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 7. Check admin settings
SELECT key, value FROM admin_settings ORDER BY key;

-- 8. Verify foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- 9. Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 10. Summary check
SELECT 
    (SELECT COUNT(*) FROM service_categories) as categories,
    (SELECT COUNT(*) FROM services) as services,
    (SELECT COUNT(*) FROM cities) as cities,
    (SELECT COUNT(*) FROM admin_settings) as settings;

