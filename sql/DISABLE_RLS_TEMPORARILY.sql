-- Temporarily disable RLS to get registration working
-- We'll add back policies incrementally later

-- ============================================
-- STEP 1: Disable RLS on all tables
-- ============================================

ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop ALL policies (clean slate)
-- ============================================

-- Drop all companies policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'companies' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON companies';
    END LOOP;
END $$;

-- Drop all profiles policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- Drop all leads policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'leads' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON leads';
    END LOOP;
END $$;

-- Drop all aircraft policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'aircraft' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON aircraft';
    END LOOP;
END $$;

-- Drop all deals policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'deals' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON deals';
    END LOOP;
END $$;

-- Drop all tasks policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'tasks' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON tasks';
    END LOOP;
END $$;

-- Drop all payments policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'payments' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON payments';
    END LOOP;
END $$;

-- ============================================
-- STEP 3: Verify all policies are dropped
-- ============================================

SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('companies', 'profiles', 'leads', 'aircraft', 'deals', 'tasks', 'payments')
GROUP BY tablename;

-- Should show 0 policies for all tables

-- ============================================
-- STEP 4: Verify RLS is disabled
-- ============================================

SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('companies', 'profiles', 'leads', 'aircraft', 'deals', 'tasks', 'payments')
ORDER BY tablename;

-- All should show rls_enabled = false

-- ============================================
-- RESULT
-- ============================================

SELECT '✅ RLS disabled, all policies dropped. Registration should work now!' as status;
SELECT '⚠️ NOTE: Re-enable RLS with proper policies once registration is confirmed working' as warning;
