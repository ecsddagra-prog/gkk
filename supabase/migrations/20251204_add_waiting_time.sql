-- Add waiting_time column to quote related tables

ALTER TABLE rate_quotes ADD COLUMN IF NOT EXISTS waiting_time TEXT DEFAULT '30 minutes';
ALTER TABLE provider_quotes ADD COLUMN IF NOT EXISTS waiting_time TEXT DEFAULT '30 minutes';
ALTER TABLE quote_negotiations ADD COLUMN IF NOT EXISTS waiting_time TEXT DEFAULT '30 minutes';
ALTER TABLE booking_quotes ADD COLUMN IF NOT EXISTS waiting_time TEXT DEFAULT '30 minutes';
