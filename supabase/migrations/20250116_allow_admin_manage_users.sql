-- ============================================
-- ALLOW ADMINS TO MANAGE USERS IN THEIR COMPANY
-- ============================================

-- Drop existing update policy for profiles
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

-- Create new update policy that allows:
-- 1. Users to update their own profile
-- 2. Admins to update users in their company
CREATE POLICY "profiles_update"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  -- Users can update their own profile
  id = auth.uid()
  OR
  -- Admins can update users in their company
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'admin'
      AND admin_profile.company_id = profiles.company_id
      AND admin_profile.active = true
  )
);

-- ============================================
-- ALLOW ADMINS TO VIEW USERS IN THEIR COMPANY
-- ============================================

-- Drop existing select policy for profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- Create new select policy that allows:
-- 1. Users to see their own profile
-- 2. Admins to see all users in their company
CREATE POLICY "profiles_select"
ON public.profiles FOR SELECT
TO authenticated
USING (
  -- Users can see their own profile
  id = auth.uid()
  OR
  -- Admins can see all users in their company
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'admin'
      AND admin_profile.company_id = profiles.company_id
      AND admin_profile.active = true
  )
);

-- ============================================
-- VERIFY POLICIES
-- ============================================

SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_status,
  CASE
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as check_status
FROM pg_policies
WHERE tablename = 'profiles'
  AND policyname IN ('profiles_update', 'profiles_select')
ORDER BY cmd;

SELECT '✅ Admin user management policies applied successfully!' as status;
