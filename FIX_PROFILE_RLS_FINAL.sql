-- ============================================
-- FINAL FIX FOR PROFILE RLS - NO RECURSION
-- ============================================

-- Drop ALL existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert users in their company" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update users in their company" ON public.profiles;

-- Create NON-RECURSIVE policies

-- 1. SELECT: Users can view their own profile (NO RECURSION)
CREATE POLICY "Users can select own profile" ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- 2. UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());

-- 3. INSERT: Allow inserts (for user creation)
CREATE POLICY "Allow profile creation" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Verify policies
SELECT
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';
