-- Add image support to entities

-- Service Categories
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Services
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Service Sub-services
ALTER TABLE service_subservices ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Users (Profile Picture)
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
