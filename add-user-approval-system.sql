-- Add user approval system to batches table
-- Run this in Supabase SQL Editor

-- Add is_approved column to batches table
ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Add approval timestamp
ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Add approved_by column to track which admin approved
ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- Update existing batches to be approved (so they can login immediately)
UPDATE batches 
SET is_approved = true, 
    approved_at = NOW(),
    approved_by = 'system_migration'
WHERE is_approved IS NULL OR is_approved = false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_batches_is_approved ON batches(is_approved);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'batches' 
AND column_name IN ('is_approved', 'approved_at', 'approved_by');

