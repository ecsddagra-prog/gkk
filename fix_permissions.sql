
-- Grant permissions to authenticated users and service role
grant select, insert, update, delete on booking_status_history to authenticated;
grant select, insert, update, delete on booking_status_history to service_role;

-- Verify policies are correct
-- (Re-applying them just in case, or ensuring they exist)
