-- Check all columns in the deals table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'deals'
ORDER BY ordinal_position;

-- Also check if the column was added but with a different name
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'deals'
AND column_name LIKE '%aircraft%';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
