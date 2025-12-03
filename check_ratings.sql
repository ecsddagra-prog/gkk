-- Check ratings
SELECT id, booking_id, rating, rated_by, created_at FROM ratings ORDER BY created_at DESC LIMIT 5;
