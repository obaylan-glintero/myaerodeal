-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- ============================================
-- Error: 42P17 - infinite recursion detected in policy for relation "users"
--
-- This script removes problematic policies and creates correct ones

-- ============================================
-- STEP 1: Drop ALL existing policies (clean slate)
-- ============================================

-- Drop policies on leads
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Drop policies on aircraft
DROP POLICY IF EXISTS "Users can view their own aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Users can insert their own aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Users can update their own aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Users can delete their own aircraft" ON public.aircraft;

-- Drop policies on deals
DROP POLICY IF EXISTS "Users can view their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can insert their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can delete their own deals" ON public.deals;

-- Drop policies on tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Drop policies on profiles (if exists)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- ============================================
-- STEP 2: Create CORRECT policies (no recursion)
-- ============================================

-- LEADS table policies
CREATE POLICY "Users can view their own leads"
  ON public.leads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON public.leads
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
  ON public.leads
  FOR DELETE
  USING (auth.uid() = user_id);

-- AIRCRAFT table policies
CREATE POLICY "Users can view their own aircraft"
  ON public.aircraft
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own aircraft"
  ON public.aircraft
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aircraft"
  ON public.aircraft
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own aircraft"
  ON public.aircraft
  FOR DELETE
  USING (auth.uid() = user_id);

-- DEALS table policies
CREATE POLICY "Users can view their own deals"
  ON public.deals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deals"
  ON public.deals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals"
  ON public.deals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals"
  ON public.deals
  FOR DELETE
  USING (auth.uid() = user_id);

-- TASKS table policies
CREATE POLICY "Users can view their own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 3: Handle PROFILES table (if it exists)
-- ============================================

-- Check if profiles table exists and has issues
-- If you have a profiles table, these are SAFE policies:

-- First, check if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Drop any problematic policies
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles';

    -- Create simple, non-recursive policies
    EXECUTE 'CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)';
  END IF;
END $$;

-- ============================================
-- STEP 4: Verify the fix
-- ============================================

-- Check all policies are now correct
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- This should show 4 policies per table (SELECT, INSERT, UPDATE, DELETE)
-- and no errors should occur

-- ============================================
-- STEP 5: Test a simple query
-- ============================================

-- Try to select from each table
-- This should NOT cause infinite recursion
SELECT COUNT(*) as leads_count FROM leads;
SELECT COUNT(*) as aircraft_count FROM aircraft;
SELECT COUNT(*) as deals_count FROM deals;
SELECT COUNT(*) as tasks_count FROM tasks;

-- ✅ If these queries run without errors, the fix worked!
