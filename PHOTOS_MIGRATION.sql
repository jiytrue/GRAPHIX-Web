-- ====================================================================
-- MIGRATION: Add 'device_photos' column to tickets table
-- Run this in the Supabase SQL Editor
-- ====================================================================

-- Add device_photos column to store compressed base64 images as a JSON array
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS device_photos JSONB;

-- Success message log
SELECT 'Migration successful: device_photos column added to tickets table' AS status;
