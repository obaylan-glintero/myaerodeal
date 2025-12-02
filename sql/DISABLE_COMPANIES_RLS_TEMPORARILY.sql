-- Temporary fix: Disable RLS on companies table
-- This allows registration to work while we debug
-- Run this in your Supabase SQL Editor

-- Step 1: Check current RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'companies';

-- Step 2: See all current policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'companies';

-- Step 3: DISABLE RLS temporarily (we'll re-enable with proper policies later)
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'companies';

-- Should show: rowsecurity = false

-- NOTE: This is temporary for testing registration.
-- Once registration works, we can re-enable RLS with proper policies.
-- To re-enable later: ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
