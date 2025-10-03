-- Add missing columns to reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS admin_comment TEXT;
