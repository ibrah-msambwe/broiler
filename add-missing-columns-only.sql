-- Add only the missing columns to existing reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS admin_comment TEXT,
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
