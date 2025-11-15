-- ============================================
-- USER MANAGEMENT VIA DATABASE FUNCTION
-- ============================================
-- This creates a secure function for admins to view company users

-- Create function to get company users (admins only)
CREATE OR REPLACE FUNCTION public.get_company_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  active BOOLEAN,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_company_id UUID;
  user_role TEXT;
BEGIN
  -- Get current user's company_id and role
  SELECT p.company_id, p.role
  INTO user_company_id, user_role
  FROM public.profiles p
  WHERE p.id = auth.uid();

  -- Check if user is admin
  IF user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can view company users';
  END IF;

  -- Return all profiles in the same company
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    COALESCE(p.active, true) as active,
    p.created_at
  FROM public.profiles p
  WHERE p.company_id = user_company_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_company_users() TO authenticated;

-- Test the function
SELECT * FROM public.get_company_users();
