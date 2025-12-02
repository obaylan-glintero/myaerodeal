-- ============================================
-- TEST RLS AND DATA ACCESS
-- ============================================
-- Run this to verify everything is set up correctly

-- Test 1: Check your profile exists
SELECT
  'Your Profile' as test,
  p.id,
  p.role,
  p.first_name,
  p.last_name,
  c.name as company_name
FROM public.profiles p
JOIN public.companies c ON c.id = p.company_id
WHERE p.id = auth.uid();

-- Test 2: Check if you can see your company
SELECT
  'Your Company' as test,
  id,
  name,
  created_at
FROM public.companies
LIMIT 5;

-- Test 3: Check leads data
SELECT
  'Leads' as test,
  COUNT(*) as total_records,
  COUNT(company_id) as records_with_company_id
FROM public.leads;

-- Test 4: Try to select leads (should be filtered by RLS)
SELECT
  'Your Leads (via RLS)' as test,
  id,
  name,
  company,
  status,
  company_id
FROM public.leads
LIMIT 5;

-- Test 5: Check RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('leads', 'aircraft', 'deals', 'tasks', 'companies', 'profiles');

-- Test 6: Check RLS policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('leads', 'aircraft', 'deals', 'tasks');
