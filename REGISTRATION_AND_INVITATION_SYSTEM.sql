-- ============================================
-- REGISTRATION AND INVITATION SYSTEM
-- ============================================

-- Table for pending company registration requests
CREATE TABLE IF NOT EXISTS public.company_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT
);

-- Table for user invitations
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT NOT NULL DEFAULT 'user', -- user or admin
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  UNIQUE(company_id, email)
);

-- Add super_admin role to profiles for app owner
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.company_registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR REGISTRATION REQUESTS
-- ============================================

-- Anyone can create a registration request (public signup)
CREATE POLICY "Anyone can create registration request" 
  ON public.company_registration_requests
  FOR INSERT
  WITH CHECK (true);

-- Only super admins can view registration requests
CREATE POLICY "Super admins can view all requests" 
  ON public.company_registration_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Only super admins can update registration requests
CREATE POLICY "Super admins can update requests" 
  ON public.company_registration_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- ============================================
-- RLS POLICIES FOR INVITATIONS
-- ============================================

-- Company admins can create invitations
CREATE POLICY "Company admins can create invitations" 
  ON public.user_invitations
  FOR INSERT
  WITH CHECK (
    invited_by IN (
      SELECT id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view invitations for their company
CREATE POLICY "Users can view company invitations" 
  ON public.user_invitations
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Company admins can update/delete their company's invitations
CREATE POLICY "Company admins can update invitations" 
  ON public.user_invitations
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Company admins can delete invitations" 
  ON public.user_invitations
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to approve a registration request and create company + profile
CREATE OR REPLACE FUNCTION public.approve_registration_request(
  request_id UUID
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  request_record RECORD;
  new_company_id UUID;
  result JSON;
BEGIN
  -- Check if caller is super admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_super_admin = true
  ) THEN
    RAISE EXCEPTION 'Only super admins can approve registration requests';
  END IF;

  -- Get the request
  SELECT * INTO request_record
  FROM public.company_registration_requests
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration request not found or already processed';
  END IF;

  -- Create the company
  INSERT INTO public.companies (name)
  VALUES (request_record.company_name)
  RETURNING id INTO new_company_id;

  -- Update the request status
  UPDATE public.company_registration_requests
  SET 
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = request_id;

  -- Return success with info
  result := json_build_object(
    'success', true,
    'company_id', new_company_id,
    'email', request_record.email,
    'company_name', request_record.company_name
  );

  RETURN result;
END;
$$;

-- Function to reject a registration request
CREATE OR REPLACE FUNCTION public.reject_registration_request(
  request_id UUID,
  reason TEXT
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if caller is super admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_super_admin = true
  ) THEN
    RAISE EXCEPTION 'Only super admins can reject registration requests';
  END IF;

  -- Update the request status
  UPDATE public.company_registration_requests
  SET 
    status = 'rejected',
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    rejection_reason = reason
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration request not found or already processed';
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- Function to check if an invitation token is valid
CREATE OR REPLACE FUNCTION public.validate_invitation_token(
  invitation_token TEXT
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  invitation_record RECORD;
  company_record RECORD;
  result JSON;
BEGIN
  -- Get the invitation
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE token = invitation_token
    AND status = 'pending'
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Invitation not found or expired'
    );
  END IF;

  -- Get company info
  SELECT * INTO company_record
  FROM public.companies
  WHERE id = invitation_record.company_id;

  -- Return invitation details
  result := json_build_object(
    'valid', true,
    'email', invitation_record.email,
    'company_id', invitation_record.company_id,
    'company_name', company_record.name,
    'role', invitation_record.role
  );

  RETURN result;
END;
$$;

-- Update the trigger to handle invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_company_id UUID;
  approved_request RECORD;
  invitation_record RECORD;
BEGIN
  -- Check if user was invited
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > now()
  LIMIT 1;

  IF FOUND THEN
    -- User was invited - join existing company
    INSERT INTO public.profiles (
      id, 
      company_id, 
      role, 
      first_name, 
      last_name,
      email
    ) VALUES (
      NEW.id,
      invitation_record.company_id,
      invitation_record.role,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.email
    );

    -- Mark invitation as accepted
    UPDATE public.user_invitations
    SET status = 'accepted', accepted_at = now()
    WHERE id = invitation_record.id;

    RETURN NEW;
  END IF;

  -- Check if user has an approved registration request
  SELECT * INTO approved_request
  FROM public.company_registration_requests
  WHERE email = NEW.email AND status = 'approved'
  LIMIT 1;

  IF FOUND THEN
    -- Get the company created for this request
    SELECT id INTO new_company_id
    FROM public.companies
    WHERE name = approved_request.company_name
    ORDER BY created_at DESC
    LIMIT 1;

    -- Create profile as admin
    INSERT INTO public.profiles (
      id, 
      company_id, 
      role, 
      first_name, 
      last_name,
      email
    ) VALUES (
      NEW.id,
      new_company_id,
      'admin',
      approved_request.first_name,
      approved_request.last_name,
      NEW.email
    );

    RETURN NEW;
  END IF;

  -- If no invitation and no approved request, don't create profile
  -- User will need to wait for approval
  RAISE NOTICE 'User % has no approved registration or invitation', NEW.email;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_registration_requests_status 
  ON public.company_registration_requests(status);

CREATE INDEX IF NOT EXISTS idx_registration_requests_email 
  ON public.company_registration_requests(email);

CREATE INDEX IF NOT EXISTS idx_invitations_token 
  ON public.user_invitations(token);

CREATE INDEX IF NOT EXISTS idx_invitations_email 
  ON public.user_invitations(email);

CREATE INDEX IF NOT EXISTS idx_invitations_company 
  ON public.user_invitations(company_id);

-- ============================================
-- MAKE YOURSELF SUPER ADMIN (REPLACE WITH YOUR EMAIL)
-- ============================================
-- UPDATE public.profiles 
-- SET is_super_admin = true 
-- WHERE email = 'your-email@example.com';

SELECT 'Registration and Invitation system created successfully!' as message;
