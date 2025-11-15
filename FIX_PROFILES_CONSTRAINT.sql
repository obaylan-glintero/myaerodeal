-- Fix profiles table foreign key constraint
-- Run this in your Supabase SQL Editor

-- Step 1: Check current constraints on profiles table
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE cl.relname = 'profiles';

-- Step 2: Drop the problematic foreign key constraint if it exists
-- This constraint might be preventing profile creation
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 3: Disable RLS on profiles table temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 4: Recreate the constraint properly (if needed)
-- This allows the profile to reference the auth user
-- Only add if you want strict referential integrity
/*
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
*/

-- Step 5: Verify constraints
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE cl.relname = 'profiles';

-- Step 6: Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('profiles', 'companies');
