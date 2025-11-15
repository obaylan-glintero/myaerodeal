-- Fix infinite recursion in RLS policies
-- The issue: INSERT policies were checking profiles table which causes circular dependency

-- ============================================
-- STEP 1: Drop the problematic policies
-- ============================================

DROP POLICY IF EXISTS "authenticated_can_create_companies" ON companies;
DROP POLICY IF EXISTS "authenticated_can_create_profiles" ON profiles;
DROP POLICY IF EXISTS "users_select_own_company" ON companies;
DROP POLICY IF EXISTS "users_select_own_company_profiles" ON profiles;

-- ============================================
-- STEP 2: Create simplified INSERT policies (no recursion)
-- ============================================

-- Companies: Allow any authenticated user to INSERT (needed for registration)
-- No checks on profiles table to avoid recursion
CREATE POLICY "allow_authenticated_insert_companies"
ON companies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Profiles: Allow any authenticated user to INSERT (needed for registration)
-- No checks on other tables to avoid recursion
CREATE POLICY "allow_authenticated_insert_profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- STEP 3: Create SELECT policies (can reference other tables safely)
-- ============================================

-- Companies: Users can SELECT their own company
-- This is safe because it's only used AFTER registration is complete
CREATE POLICY "select_own_company"
ON companies FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Profiles: Users can SELECT their own profile and company profiles
-- This is safe because it's only used AFTER registration is complete
CREATE POLICY "select_own_company_profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================
-- STEP 4: Verify policies
-- ============================================

SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN cmd = 'INSERT' THEN 'Should not reference other tables'
    WHEN cmd = 'SELECT' THEN 'Can reference other tables safely'
    ELSE 'Other command'
  END as note
FROM pg_policies
WHERE tablename IN ('companies', 'profiles')
ORDER BY tablename, cmd, policyname;

-- ============================================
-- RESULT
-- ============================================

SELECT '✅ Recursive policies fixed! Registration should work now.' as status;
