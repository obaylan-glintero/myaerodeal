-- ============================================
-- FIX: Update test data to match your user_id
-- ============================================

-- Step 1: Get YOUR current user ID
-- Look for the email you used to sign up
SELECT
  id as user_id,
  email,
  created_at,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- Copy YOUR user_id from above (the UUID for your email)
-- It looks like: 12345678-1234-1234-1234-123456789abc

-- ============================================
-- Step 2: Check what user_id your test data currently has
-- ============================================

-- Check leads
SELECT
  COUNT(*) as count,
  user_id,
  (SELECT email FROM auth.users WHERE id = leads.user_id) as belongs_to
FROM leads
GROUP BY user_id;

-- Check aircraft
SELECT
  COUNT(*) as count,
  user_id,
  (SELECT email FROM auth.users WHERE id = aircraft.user_id) as belongs_to
FROM aircraft
GROUP BY user_id;

-- Check deals
SELECT
  COUNT(*) as count,
  user_id,
  (SELECT email FROM auth.users WHERE id = deals.user_id) as belongs_to
FROM deals
GROUP BY user_id;

-- Check tasks
SELECT
  COUNT(*) as count,
  user_id,
  (SELECT email FROM auth.users WHERE id = tasks.user_id) as belongs_to
FROM tasks
GROUP BY user_id;

-- ============================================
-- Step 3: FIX - Update ALL data to YOUR user_id
-- Replace 'YOUR-USER-ID-HERE' with the UUID from Step 1
-- ============================================

-- IMPORTANT: Copy your user_id from Step 1 and paste it below
-- Example: '12345678-1234-1234-1234-123456789abc'

-- Update leads
UPDATE leads
SET user_id = 'YOUR-USER-ID-HERE';

-- Update aircraft
UPDATE aircraft
SET user_id = 'YOUR-USER-ID-HERE';

-- Update deals
UPDATE deals
SET user_id = 'YOUR-USER-ID-HERE';

-- Update tasks
UPDATE tasks
SET user_id = 'YOUR-USER-ID-HERE';

-- ============================================
-- Step 4: Verify the fix worked
-- ============================================

-- Check data now belongs to you
SELECT 'leads' as table_name, COUNT(*) as your_records
FROM leads
WHERE user_id = 'YOUR-USER-ID-HERE'

UNION ALL

SELECT 'aircraft' as table_name, COUNT(*) as your_records
FROM aircraft
WHERE user_id = 'YOUR-USER-ID-HERE'

UNION ALL

SELECT 'deals' as table_name, COUNT(*) as your_records
FROM deals
WHERE user_id = 'YOUR-USER-ID-HERE'

UNION ALL

SELECT 'tasks' as table_name, COUNT(*) as your_records
FROM tasks
WHERE user_id = 'YOUR-USER-ID-HERE';

-- You should now see your record counts!
-- ✅ After this, refresh your browser and data should appear
