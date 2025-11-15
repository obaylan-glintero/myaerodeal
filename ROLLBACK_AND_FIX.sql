-- ============================================
-- ROLLBACK AND FIX - Remove recursive policies
-- ============================================

-- Remove the problematic recursive policies
DROP POLICY IF EXISTS "Admins can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update company profiles" ON public.profiles;

-- Keep only the simple, non-recursive policies
-- These should already exist from FIX_PROFILE_RLS_FINAL.sql:
-- 1. Users can select own profile
-- 2. Users can update own profile
-- 3. Allow profile creation

-- Verify only non-recursive policies exist
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY cmd, policyname;
