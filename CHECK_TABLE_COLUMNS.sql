-- Check what columns exist in each table
-- Run this in Supabase SQL Editor

-- Leads table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;

-- Aircraft table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'aircraft'
ORDER BY ordinal_position;

-- Deals table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'deals'
ORDER BY ordinal_position;

-- Tasks table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;
