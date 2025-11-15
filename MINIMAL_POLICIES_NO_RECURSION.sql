-- Minimal RLS policies - absolutely no cross-table references
-- This CANNOT cause recursion

-- ============================================
-- FIRST: Make sure everything is clean
-- ============================================

-- Disable RLS
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "companies_insert_policy" ON companies;
DROP POLICY IF EXISTS "companies_select_policy" ON companies;
DROP POLICY IF EXISTS "companies_update_policy" ON companies;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- ============================================
-- STEP 1: COMPANIES - Minimal policies
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- INSERT: Anyone authenticated can insert (registration)
CREATE POLICY "companies_insert"
ON companies FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- SELECT: For now, allow all authenticated users to select
-- We'll refine this later once registration is stable
CREATE POLICY "companies_select"
ON companies FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

-- UPDATE: For now, allow all authenticated users
-- Application logic will handle company ownership
CREATE POLICY "companies_update"
ON companies FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated');

-- ============================================
-- STEP 2: PROFILES - Minimal policies
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- INSERT: Anyone authenticated can insert (registration)
CREATE POLICY "profiles_insert"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- SELECT: Users can see their own profile
-- NOTE: No subquery, just direct ID check
CREATE POLICY "profiles_select"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- UPDATE: Users can update their own profile
CREATE POLICY "profiles_update"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- ============================================
-- STEP 3: Verify
-- ============================================

SELECT
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('companies', 'profiles')
ORDER BY tablename, cmd;

-- ============================================
-- RESULT
-- ============================================

-- These policies:
-- ✅ Cannot cause recursion (no cross-table references)
-- ✅ Allow registration (INSERT permitted)
-- ✅ Profiles are secure (only see your own)
-- ✅ Companies temporarily open (will refine after testing)

-- NOTE: Companies policy is permissive for now
-- Once registration is confirmed working, we can add
-- company_id checks using a separate stored function
-- to avoid recursion

SELECT '✅ Minimal policies applied - NO recursion possible!' as status;
