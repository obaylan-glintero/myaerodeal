-- ============================================
-- ADD EMAIL TO PROFILES TABLE
-- ============================================
-- This allows us to display user emails in User Management

-- Add email column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Copy existing emails from auth.users to profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- Update the trigger to also store email
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
    INSERT INTO public.profiles (id, company_id, role, first_name, last_name, email)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'company_id')::UUID,
      COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email
    );
  ELSE
    -- Create new company for first user
    INSERT INTO public.companies (name)
    VALUES (user_company_name)
    RETURNING id INTO new_company_id;

    -- Create profile as admin
    INSERT INTO public.profiles (id, company_id, role, first_name, last_name, email)
    VALUES (
      NEW.id,
      new_company_id,
      'admin',
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify
SELECT
  id,
  email,
  first_name,
  last_name,
  role
FROM public.profiles
LIMIT 5;
