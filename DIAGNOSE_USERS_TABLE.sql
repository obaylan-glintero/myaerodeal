-- ============================================
-- DIAGNOSE: Check for problematic users table
-- ============================================

-- Step 1: Check if public.users table exists
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'users';

-- Step 2: Check for policies on public.users (THIS IS THE PROBLEM!)
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users';

-- Step 3: Check for triggers on public.users
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users';

-- Step 4: Check table structure if it exists
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;
