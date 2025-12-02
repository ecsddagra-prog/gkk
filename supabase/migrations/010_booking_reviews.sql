-- Create booking_status_history table
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new rating columns to ratings table
ALTER TABLE ratings 
ADD COLUMN IF NOT EXISTS behavior_rating INTEGER CHECK (behavior_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS nature_rating INTEGER CHECK (nature_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS work_knowledge_rating INTEGER CHECK (work_knowledge_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS work_quality_rating INTEGER CHECK (work_quality_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON booking_status_history(booking_id);
