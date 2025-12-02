-- Enable Realtime for bookings table
-- This allows real-time updates when booking status changes

-- Enable realtime on bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Optional: Enable realtime on other related tables
-- ALTER PUBLICATION supabase_realtime ADD TABLE booking_quotes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE ratings;
