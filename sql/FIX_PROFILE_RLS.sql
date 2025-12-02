-- ============================================
-- FIX PROFILE RLS POLICY
-- ============================================
-- This fixes the circular dependency in profile access

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;

-- Create two new policies:

-- 1. Users can ALWAYS view their own profile (no company_id needed)
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- 2. Users can view OTHER profiles in their company
CREATE POLICY "Users can view company profiles" ON public.profiles
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    AND id != auth.uid()  -- Don't need this for own profile (covered by policy 1)
  );

-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';
