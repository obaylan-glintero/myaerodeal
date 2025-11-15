-- ============================================
-- CHECK AND LINK YOUR USER
-- ============================================

-- Step 1: See all users in auth.users
SELECT
  id as user_id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at;

-- Step 2: See all profiles that exist
SELECT
  id as user_id,
  company_id,
  role,
  first_name,
  last_name
FROM public.profiles;

-- Step 3: See all companies
SELECT
  id as company_id,
  name,
  created_at
FROM public.companies;

-- ============================================
-- AFTER CHECKING ABOVE, RUN THIS TO LINK YOUR USER
-- ============================================
-- Replace YOUR_EMAIL@example.com with your actual email address

DO $$
DECLARE
  my_user_id UUID;
  my_company_id UUID;
BEGIN
  -- Get your user ID from your email
  SELECT id INTO my_user_id
  FROM auth.users
  WHERE email = 'YOUR_EMAIL@example.com';  -- CHANGE THIS TO YOUR EMAIL

  -- Get the company ID (assuming "My Company" was created)
  SELECT id INTO my_company_id
  FROM public.companies
  WHERE name = 'My Company'
  LIMIT 1;

  -- If no company exists, create one
  IF my_company_id IS NULL THEN
    INSERT INTO public.companies (name)
    VALUES ('My Company')
    RETURNING id INTO my_company_id;
  END IF;

  -- Create or update your profile
  INSERT INTO public.profiles (id, company_id, role, first_name, last_name)
  VALUES (
    my_user_id,
    my_company_id,
    'admin',
    'Your',
    'Name'
  )
  ON CONFLICT (id) DO UPDATE SET
    company_id = my_company_id,
    role = 'admin';

  RAISE NOTICE 'User % linked to company %', my_user_id, my_company_id;

  -- Update all your existing data
  UPDATE public.leads SET company_id = my_company_id WHERE user_id = my_user_id AND company_id IS NULL;
  UPDATE public.aircraft SET company_id = my_company_id WHERE user_id = my_user_id AND company_id IS NULL;
  UPDATE public.deals SET company_id = my_company_id WHERE user_id = my_user_id AND company_id IS NULL;
  UPDATE public.tasks SET company_id = my_company_id WHERE user_id = my_user_id AND company_id IS NULL;

  RAISE NOTICE 'All data linked to company';
END $$;

-- Step 4: Verify everything is linked
SELECT
  'Users in auth' as item,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT
  'Profiles created',
  COUNT(*)
FROM public.profiles
UNION ALL
SELECT
  'Leads with company',
  COUNT(*)
FROM public.leads
WHERE company_id IS NOT NULL;
