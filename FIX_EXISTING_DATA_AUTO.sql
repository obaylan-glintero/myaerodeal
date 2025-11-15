-- ============================================
-- AUTOMATED FIX FOR EXISTING DATA
-- ============================================
-- This script automatically restores access to your data

DO $$
DECLARE
  existing_company_id UUID;
  user_record RECORD;
BEGIN
  -- Step 1: Create a company for existing data
  INSERT INTO public.companies (name)
  VALUES ('My Company')
  ON CONFLICT DO NOTHING
  RETURNING id INTO existing_company_id;

  -- If company already exists, get its ID
  IF existing_company_id IS NULL THEN
    SELECT id INTO existing_company_id FROM public.companies WHERE name = 'My Company' LIMIT 1;
  END IF;

  RAISE NOTICE 'Company ID: %', existing_company_id;

  -- Step 2: Create profiles for all existing users who don't have one
  FOR user_record IN SELECT id, email FROM auth.users LOOP
    INSERT INTO public.profiles (id, company_id, role, first_name, last_name)
    VALUES (
      user_record.id,
      existing_company_id,
      'admin',  -- Make first user(s) admin
      'Admin',
      'User'
    )
    ON CONFLICT (id) DO UPDATE SET
      company_id = existing_company_id,
      role = 'admin';

    RAISE NOTICE 'Created/updated profile for user: %', user_record.email;
  END LOOP;

  -- Step 3: Assign all existing data to the company
  UPDATE public.leads
  SET company_id = existing_company_id
  WHERE company_id IS NULL;

  UPDATE public.aircraft
  SET company_id = existing_company_id
  WHERE company_id IS NULL;

  UPDATE public.deals
  SET company_id = existing_company_id
  WHERE company_id IS NULL;

  UPDATE public.tasks
  SET company_id = existing_company_id
  WHERE company_id IS NULL;

  RAISE NOTICE 'All data assigned to company';
END $$;

-- Verification query
SELECT
  'Companies' as item,
  COUNT(*) as count
FROM public.companies
UNION ALL
SELECT
  'Profiles',
  COUNT(*)
FROM public.profiles
UNION ALL
SELECT
  'Leads with company',
  COUNT(*)
FROM public.leads
WHERE company_id IS NOT NULL
UNION ALL
SELECT
  'Aircraft with company',
  COUNT(*)
FROM public.aircraft
WHERE company_id IS NOT NULL
UNION ALL
SELECT
  'Deals with company',
  COUNT(*)
FROM public.deals
WHERE company_id IS NOT NULL
UNION ALL
SELECT
  'Tasks with company',
  COUNT(*)
FROM public.tasks
WHERE company_id IS NOT NULL;
