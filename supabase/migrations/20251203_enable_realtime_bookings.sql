-- Enable Realtime for bookings table
-- Drop from publication if exists, then add back

-- This will fail silently if table is not in publication
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS bookings;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore errors
END
$$;

-- Add bookings table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

