-- Step 1: Check what policies currently exist
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('companies', 'profiles', 'leads', 'aircraft', 'deals', 'tasks', 'payments')
ORDER BY tablename, policyname;

-- Step 2: Drop each policy explicitly (copy the policyname from above and run these)
-- COMPANIES policies
DROP POLICY IF EXISTS "admins_delete_own_company" ON companies;
DROP POLICY IF EXISTS "allow_authenticated_insert_companies" ON companies;
DROP POLICY IF EXISTS "authenticated_can_create_companies" ON companies;
DROP POLICY IF EXISTS "select_own_company" ON companies;
DROP POLICY IF EXISTS "users_select_own_company" ON companies;
DROP POLICY IF EXISTS "users_update_own_company" ON companies;

-- PROFILES policies
DROP POLICY IF EXISTS "admins_delete_company_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_update_company_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_authenticated_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "authenticated_can_create_profiles" ON profiles;
DROP POLICY IF EXISTS "select_own_company_profiles" ON profiles;
DROP POLICY IF EXISTS "users_select_own_company_profiles" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;

-- LEADS policies
DROP POLICY IF EXISTS "users_access_company_leads" ON leads;

-- AIRCRAFT policies
DROP POLICY IF EXISTS "users_access_company_aircraft" ON aircraft;

-- DEALS policies
DROP POLICY IF EXISTS "users_access_company_deals" ON deals;

-- TASKS policies
DROP POLICY IF EXISTS "users_access_company_tasks" ON tasks;

-- PAYMENTS policies
DROP POLICY IF EXISTS "users_view_company_payments" ON payments;
DROP POLICY IF EXISTS "Companies can view own payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON payments;

-- Step 3: Disable RLS
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify everything is clean
SELECT
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE tablename IN ('companies', 'profiles', 'leads', 'aircraft', 'deals', 'tasks', 'payments')
ORDER BY tablename;

-- Should show:
-- rls_enabled = false for all
-- policy_count = 0 for all

SELECT '✅ All policies dropped and RLS disabled!' as status;
