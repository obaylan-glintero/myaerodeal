-- ============================================
-- FIX EXISTING DATA - Restore Access
-- ============================================
-- This script assigns existing data to a company and creates a profile for existing users

-- Step 1: Create a company for existing data
INSERT INTO public.companies (name, active)
VALUES ('My Company', true)
ON CONFLICT DO NOTHING
RETURNING id;

-- Step 2: Get the company ID (you'll need this)
-- Copy the UUID that appears after running the above INSERT

-- Step 3: Create profile for existing user
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- You can find your user ID by running: SELECT id, email FROM auth.users;

-- First, let's see what users exist:
SELECT id, email, created_at FROM auth.users;

-- Step 4: After you have your user ID, run this (uncomment and replace YOUR_USER_ID_HERE):
/*
INSERT INTO public.profiles (id, company_id, role, first_name, last_name, active)
VALUES (
  'YOUR_USER_ID_HERE'::UUID,
  (SELECT id FROM public.companies WHERE name = 'My Company'),
  'admin',
  'Admin',
  'User',
  true
)
ON CONFLICT (id) DO UPDATE SET
  company_id = (SELECT id FROM public.companies WHERE name = 'My Company'),
  role = 'admin',
  active = true;
*/

-- Step 5: Assign all existing data to the company
UPDATE public.leads
SET company_id = (SELECT id FROM public.companies WHERE name = 'My Company')
WHERE company_id IS NULL;

UPDATE public.aircraft
SET company_id = (SELECT id FROM public.companies WHERE name = 'My Company')
WHERE company_id IS NULL;

UPDATE public.deals
SET company_id = (SELECT id FROM public.companies WHERE name = 'My Company')
WHERE company_id IS NULL;

UPDATE public.tasks
SET company_id = (SELECT id FROM public.companies WHERE name = 'My Company')
WHERE company_id IS NULL;

-- Step 6: Verify everything is set up
SELECT 'Companies' as table_name, COUNT(*) as count FROM public.companies
UNION ALL
SELECT 'Profiles', COUNT(*) FROM public.profiles
UNION ALL
SELECT 'Leads with company_id', COUNT(*) FROM public.leads WHERE company_id IS NOT NULL
UNION ALL
SELECT 'Aircraft with company_id', COUNT(*) FROM public.aircraft WHERE company_id IS NOT NULL
UNION ALL
SELECT 'Deals with company_id', COUNT(*) FROM public.deals WHERE company_id IS NOT NULL
UNION ALL
SELECT 'Tasks with company_id', COUNT(*) FROM public.tasks WHERE company_id IS NOT NULL;
