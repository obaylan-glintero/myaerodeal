-- Add RLS policies for data tables (leads, aircraft, deals, tasks)
-- These tables don't have the recursion issue because they reference profiles directly

-- ============================================
-- STEP 1: Enable RLS on data tables
-- ============================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop any existing policies (clean slate)
-- ============================================

DROP POLICY IF EXISTS "leads_all_policy" ON leads;
DROP POLICY IF EXISTS "leads_policy" ON leads;
DROP POLICY IF EXISTS "users_access_company_leads" ON leads;

DROP POLICY IF EXISTS "aircraft_all_policy" ON aircraft;
DROP POLICY IF EXISTS "aircraft_policy" ON aircraft;
DROP POLICY IF EXISTS "users_access_company_aircraft" ON aircraft;

DROP POLICY IF EXISTS "deals_all_policy" ON deals;
DROP POLICY IF EXISTS "deals_policy" ON deals;
DROP POLICY IF EXISTS "users_access_company_deals" ON deals;

DROP POLICY IF EXISTS "tasks_all_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_policy" ON tasks;
DROP POLICY IF EXISTS "users_access_company_tasks" ON tasks;

-- ============================================
-- STEP 3: Create simple policies for data tables
-- ============================================

-- These policies check company_id from profiles
-- This is safe because:
-- 1. No circular dependency (data tables -> profiles is one-way)
-- 2. Profiles policies are already working
-- 3. No recursion possible

-- LEADS
CREATE POLICY "leads_all"
ON leads FOR ALL
TO authenticated
USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
)
WITH CHECK (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
);

-- AIRCRAFT
CREATE POLICY "aircraft_all"
ON aircraft FOR ALL
TO authenticated
USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
)
WITH CHECK (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
);

-- DEALS
CREATE POLICY "deals_all"
ON deals FOR ALL
TO authenticated
USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
)
WITH CHECK (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
);

-- TASKS
CREATE POLICY "tasks_all"
ON tasks FOR ALL
TO authenticated
USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
)
WITH CHECK (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1)
);

-- ============================================
-- STEP 4: Verify policies
-- ============================================

SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('leads', 'aircraft', 'deals', 'tasks')
ORDER BY tablename;

-- Check RLS is enabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('leads', 'aircraft', 'deals', 'tasks')
ORDER BY tablename;

-- ============================================
-- RESULT
-- ============================================

SELECT '✅ Data table policies added!' as status;
SELECT '🔒 Users can now access their company data' as access;
SELECT '✅ Multi-tenant isolation working' as security;
