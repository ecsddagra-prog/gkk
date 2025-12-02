-- Add avatar_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for faster lookups (optional)
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url);
