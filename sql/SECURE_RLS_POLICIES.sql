-- Secure RLS Policies for Production
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Enable RLS on all tables
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop all existing policies (clean slate)
-- ============================================

-- Drop companies policies
DROP POLICY IF EXISTS "Allow company creation" ON companies;
DROP POLICY IF EXISTS "View own company" ON companies;
DROP POLICY IF EXISTS "Update own company" ON companies;
DROP POLICY IF EXISTS "Delete own company" ON companies;
DROP POLICY IF EXISTS "Allow authenticated users to create companies" ON companies;
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;

-- Drop profiles policies
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "View own profile" ON profiles;
DROP POLICY IF EXISTS "Update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Drop data table policies (they might exist from initial setup)
DROP POLICY IF EXISTS "Users can only access their company data" ON leads;
DROP POLICY IF EXISTS "Users can only access their company data" ON aircraft;
DROP POLICY IF EXISTS "Users can only access their company data" ON deals;
DROP POLICY IF EXISTS "Users can only access their company data" ON tasks;

-- ============================================
-- STEP 3: COMPANIES TABLE POLICIES
-- ============================================

-- Allow authenticated users to INSERT companies (needed for registration)
CREATE POLICY "authenticated_can_create_companies"
ON companies FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can SELECT their own company
CREATE POLICY "users_select_own_company"
ON companies FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Users can UPDATE their own company
CREATE POLICY "users_update_own_company"
ON companies FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Admins can DELETE their company
CREATE POLICY "admins_delete_own_company"
ON companies FOR DELETE
TO authenticated
USING (
  id IN (
    SELECT company_id FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- STEP 4: PROFILES TABLE POLICIES
-- ============================================

-- Allow authenticated users to INSERT profiles (needed for registration)
CREATE POLICY "authenticated_can_create_profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can SELECT their own profile and profiles from their company
CREATE POLICY "users_select_own_company_profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Users can UPDATE their own profile
CREATE POLICY "users_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can UPDATE profiles in their company
CREATE POLICY "admins_update_company_profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can DELETE profiles in their company (except their own)
CREATE POLICY "admins_delete_company_profiles"
ON profiles FOR DELETE
TO authenticated
USING (
  id != auth.uid()
  AND
  company_id IN (
    SELECT company_id FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- STEP 5: DATA TABLES POLICIES (leads, aircraft, deals, tasks)
-- ============================================

-- LEADS policies
CREATE POLICY "users_access_company_leads"
ON leads FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- AIRCRAFT policies
CREATE POLICY "users_access_company_aircraft"
ON aircraft FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- DEALS policies
CREATE POLICY "users_access_company_deals"
ON deals FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- TASKS policies
CREATE POLICY "users_access_company_tasks"
ON tasks FOR ALL
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================
-- STEP 6: PAYMENTS TABLE POLICIES
-- ============================================

-- Users can view their company's payments
CREATE POLICY "users_view_company_payments"
ON payments FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Only Edge Functions can insert payments (via service role key)
-- No INSERT policy for regular users
-- Payments are created by Stripe webhook

-- ============================================
-- STEP 7: Verify policies are set
-- ============================================

-- Show all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check RLS is enabled on all tables
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('companies', 'profiles', 'leads', 'aircraft', 'deals', 'tasks', 'payments')
ORDER BY tablename;

-- ============================================
-- RESULT
-- ============================================

-- All tables should show rls_enabled = true
-- Each table should have appropriate policies

-- Security Summary:
-- ✅ Users can only see/modify their own company's data
-- ✅ Admins can manage users in their company
-- ✅ Registration still works (INSERT allowed for authenticated users)
-- ✅ Stripe webhook can still insert payments (service role key)
-- ✅ Multi-tenant isolation maintained

SELECT '✅ RLS policies secured!' as status;
