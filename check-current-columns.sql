-- Check what columns currently exist in your reports table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'reports' 
ORDER BY ordinal_position;
