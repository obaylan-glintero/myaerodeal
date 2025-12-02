-- Check what data currently exists for your user
-- Run this in Supabase SQL Editor while logged in

-- Step 1: Check your profile
SELECT
  id as user_id,
  email,
  company_id,
  role
FROM profiles
WHERE id = auth.uid();

-- Step 2: Count your company's data
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

-- Step 3: If you want to delete existing data and trigger sample data creation:
-- DELETE FROM tasks WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid());
-- DELETE FROM deals WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid());
-- DELETE FROM aircraft WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid());
-- DELETE FROM leads WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid());

-- Then refresh your browser to trigger the sample data creation
