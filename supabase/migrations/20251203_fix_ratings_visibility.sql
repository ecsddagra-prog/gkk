-- Ensure ratings are viewable by everyone
-- This fixes potential visibility issues where providers can't see their own ratings

BEGIN;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON ratings;

-- Re-create the policy
CREATE POLICY "Ratings are viewable by everyone" 
ON ratings FOR SELECT 
USING (true);

COMMIT;
