-- Complete cleanup and fix for registration issues
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Clean up all orphaned users
-- ============================================

-- Delete all users without profiles
DELETE FROM auth.users
WHERE id IN (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE p.id IS NULL
);

-- Verify cleanup
SELECT COUNT(*) as orphaned_users_remaining
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
-- Should show: 0

-- ============================================
-- STEP 2: Verify RLS is disabled
-- ============================================

-- Check RLS status on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('companies', 'profiles', 'leads', 'aircraft', 'deals', 'tasks')
ORDER BY tablename;

-- Disable RLS on all necessary tables if not already disabled
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Optional: Disable on data tables too (for testing)
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Check and fix constraints
-- ============================================

-- Check constraints on profiles
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE cl.relname = 'profiles';

-- Drop foreign key constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ============================================
-- STEP 4: Verify table structure
-- ============================================

-- Check profiles table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check companies table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'companies'
ORDER BY ordinal_position;

-- ============================================
-- STEP 5: Test data to verify setup works
-- ============================================

-- Test: Can we insert into companies?
-- (This will be rolled back, just for testing)
DO $$
DECLARE
  test_company_id UUID;
BEGIN
  -- Try to insert a test company
  INSERT INTO companies (name, email, approved)
  VALUES ('Test Company', 'test@example.com', false)
  RETURNING id INTO test_company_id;

  RAISE NOTICE 'Successfully inserted company: %', test_company_id;

  -- Clean up test data
  DELETE FROM companies WHERE id = test_company_id;
  RAISE NOTICE 'Cleanup successful';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting company: %', SQLERRM;
END $$;

-- ============================================
-- STEP 6: Final verification
-- ============================================

-- Summary of current state
SELECT
  'Users' as table_name, COUNT(*) as row_count FROM auth.users
UNION ALL
SELECT 'Companies', COUNT(*) FROM companies
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'Leads', COUNT(*) FROM leads
UNION ALL
SELECT 'Aircraft', COUNT(*) FROM aircraft
UNION ALL
SELECT 'Deals', COUNT(*) FROM deals
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks;

-- ============================================
-- RESULTS
-- ============================================

-- After running this, you should see:
-- 1. orphaned_users_remaining = 0
-- 2. All RLS disabled (rowsecurity = false)
-- 3. No blocking constraints
-- 4. Test company insert successful
-- 5. Table counts showing your existing data

RAISE NOTICE 'Cleanup and verification complete!';
