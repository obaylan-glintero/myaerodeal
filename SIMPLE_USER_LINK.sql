-- ============================================
-- SIMPLE USER LINKING - 2 STEPS
-- ============================================

-- ========================================
-- STEP 1: RUN THIS FIRST - Find your user ID
-- ========================================
SELECT
  id as "Copy this User ID",
  email as "Your Email",
  created_at
FROM auth.users
ORDER BY created_at;

-- ========================================
-- STEP 2: Copy your User ID from above, then run the script below
-- Replace 'PASTE_YOUR_USER_ID_HERE' with the actual UUID from Step 1
-- ========================================

DO $$
DECLARE
  my_user_id UUID := 'PASTE_YOUR_USER_ID_HERE';  -- PASTE YOUR USER ID HERE
  my_company_id UUID;
BEGIN
  -- Create or get company
  INSERT INTO public.companies (name)
  VALUES ('My Company')
  ON CONFLICT DO NOTHING
  RETURNING id INTO my_company_id;

  IF my_company_id IS NULL THEN
    SELECT id INTO my_company_id FROM public.companies WHERE name = 'My Company' LIMIT 1;
  END IF;

  RAISE NOTICE 'Company ID: %', my_company_id;

  -- Create your profile as admin
  INSERT INTO public.profiles (id, company_id, role, first_name, last_name)
  VALUES (
    my_user_id,
    my_company_id,
    'admin',
    'Admin',
    'User'
  )
  ON CONFLICT (id) DO UPDATE SET
    company_id = my_company_id,
    role = 'admin';

  RAISE NOTICE 'Profile created for user: %', my_user_id;

  -- Link all your existing data to the company
  UPDATE public.leads SET company_id = my_company_id WHERE user_id = my_user_id AND company_id IS NULL;
  UPDATE public.aircraft SET company_id = my_company_id WHERE user_id = my_user_id AND company_id IS NULL;
  UPDATE public.deals SET company_id = my_company_id WHERE user_id = my_user_id AND company_id IS NULL;
  UPDATE public.tasks SET company_id = my_company_id WHERE user_id = my_user_id AND company_id IS NULL;

  RAISE NOTICE 'All data linked successfully!';
END $$;

-- ========================================
-- STEP 3: VERIFY - Run this to confirm everything worked
-- ========================================
SELECT 'Verification Results' as status;

SELECT
  u.email as "Your Email",
  p.role as "Your Role",
  c.name as "Your Company"
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
JOIN public.companies c ON c.id = p.company_id;

SELECT
  'Leads' as table_name,
  COUNT(*) as total_records,
  COUNT(company_id) as records_with_company
FROM public.leads
UNION ALL
SELECT
  'Aircraft',
  COUNT(*),
  COUNT(company_id)
FROM public.aircraft
UNION ALL
SELECT
  'Deals',
  COUNT(*),
  COUNT(company_id)
FROM public.deals
UNION ALL
SELECT
  'Tasks',
  COUNT(*),
  COUNT(company_id)
FROM public.tasks;
