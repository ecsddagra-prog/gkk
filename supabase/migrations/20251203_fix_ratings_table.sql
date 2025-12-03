-- Fix ratings table to support bidirectional ratings (user ↔ provider)
-- and add detailed rating fields

BEGIN;

-- Add rated_by column to distinguish between user and provider ratings
ALTER TABLE ratings 
ADD COLUMN IF NOT EXISTS rated_by VARCHAR(20) NOT NULL DEFAULT 'user' 
CHECK (rated_by IN ('user', 'provider'));

-- Add detailed rating columns with check constraints
ALTER TABLE ratings 
ADD COLUMN IF NOT EXISTS behavior_rating DECIMAL(2,1) 
CHECK (behavior_rating IS NULL OR (behavior_rating >= 1 AND behavior_rating <= 5));

ALTER TABLE ratings 
ADD COLUMN IF NOT EXISTS nature_rating DECIMAL(2,1) 
CHECK (nature_rating IS NULL OR (nature_rating >= 1 AND nature_rating <= 5));

ALTER TABLE ratings 
ADD COLUMN IF NOT EXISTS work_knowledge_rating DECIMAL(2,1) 
CHECK (work_knowledge_rating IS NULL OR (work_knowledge_rating >= 1 AND work_knowledge_rating <= 5));

ALTER TABLE ratings 
ADD COLUMN IF NOT EXISTS work_quality_rating DECIMAL(2,1) 
CHECK (work_quality_rating IS NULL OR (work_quality_rating >= 1 AND work_quality_rating <= 5));

ALTER TABLE ratings 
ADD COLUMN IF NOT EXISTS punctuality_rating DECIMAL(2,1) 
CHECK (punctuality_rating IS NULL OR (punctuality_rating >= 1 AND punctuality_rating <= 5));

-- Drop the existing unique constraint on booking_id
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_booking_id_key;

-- Add composite unique constraint to allow one rating from user and one from provider per booking
ALTER TABLE ratings 
ADD CONSTRAINT ratings_booking_rated_by_unique 
UNIQUE (booking_id, rated_by);

-- Update RLS policy for creating ratings to handle both user and provider ratings
DROP POLICY IF EXISTS "Users can create ratings for own bookings" ON ratings;

-- Policy for users to rate providers
CREATE POLICY "Users can rate providers for own bookings" ON ratings
    FOR INSERT WITH CHECK (
        rated_by = 'user' 
        AND EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = ratings.booking_id 
            AND bookings.user_id = auth.uid()
        )
    );

-- Policy for providers to rate users
CREATE POLICY "Providers can rate users for assigned bookings" ON ratings
    FOR INSERT WITH CHECK (
        rated_by = 'provider' 
        AND EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = ratings.booking_id 
            AND bookings.provider_id IN (
                SELECT id FROM providers WHERE user_id = auth.uid()
            )
        )
    );

COMMIT;
