-- Query to check the batches table status constraint
-- Run this in Supabase SQL Editor

-- Check column definition
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'batches' 
AND column_name = 'status';

-- Check constraints on the batches table
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

