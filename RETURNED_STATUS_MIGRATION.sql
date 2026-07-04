-- ====================================================================
-- MIGRATION: Add 'returned' (Returned/Refund) option to tickets status
-- Run this in the Supabase SQL Editor
-- ====================================================================

-- 1. Drop the existing check constraint on the status column
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;

-- 2. Add the updated check constraint with 'returned' included
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check CHECK (status IN ('diagnosing', 'repairing', 'repaired', 'received', 'returned', 'cancelled'));

-- Success message log
SELECT 'Migration successful: tickets_status_check updated to allow ''returned'' status' AS status;
