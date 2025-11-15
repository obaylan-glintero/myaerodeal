-- Verify user data and RLS policies are working
-- Run this in Supabase SQL Editor while logged in

-- ============================================
-- STEP 1: Check your user profile
-- ============================================

-- This should return YOUR profile
SELECT
  id as user_id,
  email,
  company_id,
  role,
  first_name,
  last_name
FROM profiles
WHERE id = auth.uid();

-- ============================================
-- STEP 2: Check your company
-- ============================================

-- This should return YOUR company
SELECT
  c.id as company_id,
  c.name,
  c.email,
  c.approved,
  c.subscription_status
FROM companies c
INNER JOIN profiles p ON c.id = p.company_id
WHERE p.id = auth.uid();

-- ============================================
-- STEP 3: Check if you have any data
-- ============================================

-- Count data in each table for YOUR company
WITH user_company AS (
  SELECT company_id FROM profiles WHERE id = auth.uid()
)
SELECT
  'Leads' as table_name,
  COUNT(*) as row_count
FROM leads
WHERE company_id = (SELECT company_id FROM user_company)
UNION ALL
SELECT 'Aircraft', COUNT(*)
FROM aircraft
WHERE company_id = (SELECT company_id FROM user_company)
UNION ALL
SELECT 'Deals', COUNT(*)
FROM deals
WHERE company_id = (SELECT company_id FROM user_company)
UNION ALL
SELECT 'Tasks', COUNT(*)
FROM tasks
WHERE company_id = (SELECT company_id FROM user_company);

-- ============================================
-- STEP 4: Check RLS policies are active
-- ============================================

SELECT
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE tablename IN ('companies', 'profiles', 'leads', 'aircraft', 'deals', 'tasks')
ORDER BY tablename;

-- All tables should show:
-- rls_enabled = true
-- policy_count > 0

-- ============================================
-- STEP 5: Test if you can insert data
-- ============================================

-- Try to insert a test lead (should work)
INSERT INTO leads (
  company_id,
  name,
  email,
  status,
  source
)
VALUES (
  (SELECT company_id FROM profiles WHERE id = auth.uid()),
  'Test Lead',
  'test@example.com',
  'new',
  'Website'
)
RETURNING id, name, email;

-- If this returns a row, RLS policies are working correctly!

-- ============================================
-- STEP 6: Verify you can see the test lead
-- ============================================

SELECT
  id,
  name,
  email,
  status,
  source,
  created_at
FROM leads
WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
ORDER BY created_at DESC
LIMIT 5;

-- You should see the test lead you just inserted

-- ============================================
-- RESULT INTERPRETATION
-- ============================================

-- If Step 3 shows 0 for all tables:
--   → You have no data yet (expected for new registration)
--   → App is working correctly, just create some data!

-- If Step 5 succeeds:
--   → RLS policies are working
--   → You can insert data

-- If Step 6 shows your test lead:
--   → RLS policies are working
--   → You can read data
--   → App should show data now!
