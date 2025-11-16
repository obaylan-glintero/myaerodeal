-- ============================================
-- EMERGENCY ROLLBACK: RESTORE BASIC ACCESS
-- ============================================
-- Use this if you need to restore access immediately

-- Drop problematic policies
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- Restore simple policies (users can only see/update their own profile)
CREATE POLICY "profiles_select"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "profiles_update"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

SELECT '✅ Emergency rollback complete - basic access restored!' as status;

-- NOTE: After running this, admins won't be able to manage other users
-- But regular users will have access to their data again
-- Then apply the fix: 20250116_fix_admin_policies_no_recursion.sql
