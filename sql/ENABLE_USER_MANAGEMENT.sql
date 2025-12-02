-- ============================================
-- ENABLE USER MANAGEMENT FOR ADMINS
-- ============================================
-- This allows admins to view and manage users in their company

-- Add policy for admins to view other profiles in their company
-- Uses a subquery that directly checks the admin's profile without recursion
CREATE POLICY "Admins can view company profiles" ON public.profiles
  FOR SELECT
  USING (
    -- Allow if the requesting user is an admin in the same company
    company_id = (
      SELECT p.company_id
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Add policy for admins to update other users' profiles
CREATE POLICY "Admins can update company profiles" ON public.profiles
  FOR UPDATE
  USING (
    company_id = (
      SELECT p.company_id
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Verify all policies
SELECT
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY cmd, policyname;
