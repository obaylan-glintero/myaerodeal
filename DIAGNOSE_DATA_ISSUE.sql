-- ============================================
-- DIAGNOSTIC SCRIPT: Why Can't I See My Data?
-- ============================================
-- Run this in Supabase SQL Editor to diagnose the issue

-- Step 1: Get your current logged-in user ID
-- This shows all users in the system
SELECT
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Copy the user_id of YOUR account (the email you're logged in with)
-- Then use it in the queries below

-- ============================================
-- Step 2: Check if data exists for YOUR user
-- Replace 'YOUR-USER-ID-HERE' with the actual UUID from Step 1
-- ============================================

-- Check leads
SELECT
  'leads' as table_name,
  COUNT(*) as total_records,
  user_id
FROM leads
WHERE user_id = 'YOUR-USER-ID-HERE'
GROUP BY user_id

UNION ALL

-- Check aircraft
SELECT
  'aircraft' as table_name,
  COUNT(*) as total_records,
  user_id
FROM aircraft
WHERE user_id = 'YOUR-USER-ID-HERE'
GROUP BY user_id

UNION ALL

-- Check deals
SELECT
  'deals' as table_name,
  COUNT(*) as total_records,
  user_id
FROM deals
WHERE user_id = 'YOUR-USER-ID-HERE'
GROUP BY user_id

UNION ALL

-- Check tasks
SELECT
  'tasks' as table_name,
  COUNT(*) as total_records,
  user_id
FROM tasks
WHERE user_id = 'YOUR-USER-ID-HERE'
GROUP BY user_id;

-- ============================================
-- Step 3: Check ALL data (to see if it belongs to someone else)
-- ============================================

SELECT
  'leads' as table_name,
  COUNT(*) as records,
  user_id,
  (SELECT email FROM auth.users WHERE id = leads.user_id) as belongs_to_email
FROM leads
GROUP BY user_id

UNION ALL

SELECT
  'aircraft' as table_name,
  COUNT(*) as records,
  user_id,
  (SELECT email FROM auth.users WHERE id = aircraft.user_id) as belongs_to_email
FROM aircraft
GROUP BY user_id

UNION ALL

SELECT
  'deals' as table_name,
  COUNT(*) as records,
  user_id,
  (SELECT email FROM auth.users WHERE id = deals.user_id) as belongs_to_email
FROM deals
GROUP BY user_id

UNION ALL

SELECT
  'tasks' as table_name,
  COUNT(*) as records,
  user_id,
  (SELECT email FROM auth.users WHERE id = tasks.user_id) as belongs_to_email
FROM tasks
GROUP BY user_id;

-- ============================================
-- Step 4: FIX - Update all test data to YOUR user_id
-- Only run this if Step 3 shows data belongs to wrong user!
-- Replace 'YOUR-USER-ID-HERE' with your actual user_id
-- ============================================

/*
-- UNCOMMENT AND RUN THIS TO FIX:

-- Update leads
UPDATE leads
SET user_id = 'YOUR-USER-ID-HERE'
WHERE user_id != 'YOUR-USER-ID-HERE';

-- Update aircraft
UPDATE aircraft
SET user_id = 'YOUR-USER-ID-HERE'
WHERE user_id != 'YOUR-USER-ID-HERE';

-- Update deals
UPDATE deals
SET user_id = 'YOUR-USER-ID-HERE'
WHERE user_id != 'YOUR-USER-ID-HERE';

-- Update tasks
UPDATE tasks
SET user_id = 'YOUR-USER-ID-HERE'
WHERE user_id != 'YOUR-USER-ID-HERE';

-- Verify the fix worked
SELECT
  'leads' as table_name,
  COUNT(*) as records
FROM leads
WHERE user_id = 'YOUR-USER-ID-HERE'

UNION ALL

SELECT
  'aircraft' as table_name,
  COUNT(*) as records
FROM aircraft
WHERE user_id = 'YOUR-USER-ID-HERE'

UNION ALL

SELECT
  'deals' as table_name,
  COUNT(*) as records
FROM deals
WHERE user_id = 'YOUR-USER-ID-HERE'

UNION ALL

SELECT
  'tasks' as table_name,
  COUNT(*) as records
FROM tasks
WHERE user_id = 'YOUR-USER-ID-HERE';
*/

-- ============================================
-- Step 5: Check RLS Policies are enabled
-- ============================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- If this returns 0 rows, RLS policies are NOT set up!
-- You need to run the SQL from SUPABASE_SETUP.md
