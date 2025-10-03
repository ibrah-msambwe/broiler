-- Fix batch status constraint issue
-- Run this in your Supabase SQL Editor

-- First, drop the existing constraint if it exists
ALTER TABLE batches DROP CONSTRAINT IF EXISTS batches_status_check;

-- Add the correct constraint that matches the frontend values
ALTER TABLE batches 
ADD CONSTRAINT batches_status_check 
CHECK (status IN ('Planning', 'Starting', 'Active', 'Finalizing', 'Completed'));

-- Verify the change
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'batches'
AND tc.constraint_type = 'CHECK'
AND cc.check_clause LIKE '%status%';

