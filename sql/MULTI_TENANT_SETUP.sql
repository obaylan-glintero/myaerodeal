-- ============================================
-- MULTI-TENANT SETUP FOR AEROBROKERONE
-- ============================================
-- This script sets up the database for multi-tenancy with company-based data isolation

-- Step 1: Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true
);

-- Step 2: Add company_id and role to users (auth.users is managed by Supabase)
-- We'll use a profiles table to extend user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

-- Step 3: Add company_id to all data tables
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.aircraft ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_company_id ON public.aircraft(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON public.deals(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON public.tasks(company_id);

-- Step 5: Enable Row Level Security (RLS) on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies

-- Companies: Users can only see their own company
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Companies: Admins can update their company
DROP POLICY IF EXISTS "Admins can update their company" ON public.companies;
CREATE POLICY "Admins can update their company" ON public.companies
  FOR UPDATE
  USING (
    id IN (
      SELECT company_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Profiles: Users can view profiles in their company
DROP POLICY IF EXISTS "Users can view profiles in their company" ON public.profiles;
CREATE POLICY "Users can view profiles in their company" ON public.profiles
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Profiles: Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Profiles: Admins can insert new users in their company
DROP POLICY IF EXISTS "Admins can insert users in their company" ON public.profiles;
CREATE POLICY "Admins can insert users in their company" ON public.profiles
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Profiles: Admins can update users in their company
DROP POLICY IF EXISTS "Admins can update users in their company" ON public.profiles;
CREATE POLICY "Admins can update users in their company" ON public.profiles
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Leads: Users can only see leads from their company
DROP POLICY IF EXISTS "Users can view company leads" ON public.leads;
CREATE POLICY "Users can view company leads" ON public.leads
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert company leads" ON public.leads;
CREATE POLICY "Users can insert company leads" ON public.leads
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update company leads" ON public.leads;
CREATE POLICY "Users can update company leads" ON public.leads
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete company leads" ON public.leads;
CREATE POLICY "Users can delete company leads" ON public.leads
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Aircraft: Users can only see aircraft from their company
DROP POLICY IF EXISTS "Users can view company aircraft" ON public.aircraft;
CREATE POLICY "Users can view company aircraft" ON public.aircraft
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert company aircraft" ON public.aircraft;
CREATE POLICY "Users can insert company aircraft" ON public.aircraft
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update company aircraft" ON public.aircraft;
CREATE POLICY "Users can update company aircraft" ON public.aircraft
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete company aircraft" ON public.aircraft;
CREATE POLICY "Users can delete company aircraft" ON public.aircraft
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Deals: Users can only see deals from their company
DROP POLICY IF EXISTS "Users can view company deals" ON public.deals;
CREATE POLICY "Users can view company deals" ON public.deals
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert company deals" ON public.deals;
CREATE POLICY "Users can insert company deals" ON public.deals
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update company deals" ON public.deals;
CREATE POLICY "Users can update company deals" ON public.deals
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete company deals" ON public.deals;
CREATE POLICY "Users can delete company deals" ON public.deals
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Tasks: Users can only see tasks from their company
DROP POLICY IF EXISTS "Users can view company tasks" ON public.tasks;
CREATE POLICY "Users can view company tasks" ON public.tasks
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert company tasks" ON public.tasks;
CREATE POLICY "Users can insert company tasks" ON public.tasks
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update company tasks" ON public.tasks;
CREATE POLICY "Users can update company tasks" ON public.tasks
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete company tasks" ON public.tasks;
CREATE POLICY "Users can delete company tasks" ON public.tasks
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Step 7: Create function to handle new user signup (creates company and profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
  user_company_name TEXT;
BEGIN
  -- Extract company name from user metadata or use email domain
  user_company_name := COALESCE(
    NEW.raw_user_meta_data->>'company_name',
    split_part(NEW.email, '@', 2)
  );

  -- Check if this is the first user (no profiles exist yet) or if company_id is provided
  IF NEW.raw_user_meta_data->>'company_id' IS NOT NULL THEN
    -- User is being added to existing company
    INSERT INTO public.profiles (id, company_id, role, first_name, last_name)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'company_id')::UUID,
      COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name'
    );
  ELSE
    -- Create new company for first user
    INSERT INTO public.companies (name)
    VALUES (user_company_name)
    RETURNING id INTO new_company_id;

    -- Create profile as admin
    INSERT INTO public.profiles (id, company_id, role, first_name, last_name)
    VALUES (
      NEW.id,
      new_company_id,
      'admin',
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 8: Create function to get current user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.aircraft TO authenticated;
GRANT ALL ON public.deals TO authenticated;
GRANT ALL ON public.tasks TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verification queries (uncomment to run)
-- SELECT * FROM public.companies;
-- SELECT * FROM public.profiles;
-- SELECT id, email, raw_user_meta_data FROM auth.users;
