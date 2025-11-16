-- ============================================
-- FIX: ADMIN USER MANAGEMENT WITHOUT RECURSION
-- ============================================

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- ============================================
-- CREATE HELPER FUNCTION (NO RECURSION)
-- ============================================

-- Function to check if current user is admin in a company
CREATE OR REPLACE FUNCTION public.is_admin_in_company(target_company_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND company_id = target_company_id
      AND role = 'admin'
      AND active = true
  ) INTO user_is_admin;

  RETURN user_is_admin;
END;
$$;

-- ============================================
-- RECREATE POLICIES WITHOUT RECURSION
-- ============================================

-- SELECT: Users see their own profile OR admins see all users in their company
CREATE POLICY "profiles_select"
ON public.profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR
  public.is_admin_in_company(company_id)
);

-- UPDATE: Users update their own profile OR admins update users in their company
CREATE POLICY "profiles_update"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
  OR
  public.is_admin_in_company(company_id)
);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION public.is_admin_in_company(UUID) TO authenticated;

-- ============================================
-- VERIFY
-- ============================================

SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
  AND policyname IN ('profiles_update', 'profiles_select')
ORDER BY cmd;

SELECT '✅ Fixed admin policies - NO RECURSION!' as status;
