-- Force reload the PostgREST schema cache
-- This is needed after adding new columns to tables

NOTIFY pgrst, 'reload schema';

-- Wait a moment, then verify the columns exist
SELECT 'Checking deals table columns...' as status;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'deals'
ORDER BY ordinal_position;
