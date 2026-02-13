-- =====================================================
-- Migration: Rename firebase_uid to google_id
-- Description: Makes the schema consistent with Google OAuth
-- =====================================================

-- Rename column in users table
ALTER TABLE users RENAME COLUMN firebase_uid TO google_id;

-- Rename indexes if they exist with specific names
-- (Postgres usually renames automatically, but let's be explicit if needed)
-- CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Update comments
COMMENT ON COLUMN users.google_id IS 'Unique immutable ID from Google OAuth (sub claim)';
