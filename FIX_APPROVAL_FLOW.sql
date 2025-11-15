-- Fix the approval flow to automatically create an invitation

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
  invitation_token TEXT;
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

  -- Generate invitation token
  invitation_token := gen_random_uuid()::TEXT;

  -- Create an invitation for the user to complete signup
  INSERT INTO public.user_invitations (
    company_id,
    email,
    invited_by,
    role,
    token,
    expires_at
  ) VALUES (
    new_company_id,
    request_record.email,
    auth.uid(),
    'admin', -- First user is admin
    invitation_token,
    now() + interval '30 days' -- Longer expiry for approved registrations
  );

  -- Update the request status
  UPDATE public.company_registration_requests
  SET 
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = request_id;

  -- Return success with invitation link
  result := json_build_object(
    'success', true,
    'company_id', new_company_id,
    'email', request_record.email,
    'company_name', request_record.company_name,
    'invitation_token', invitation_token,
    'invitation_url', 'REPLACE_WITH_APP_URL?invitation=' || invitation_token
  );

  RETURN result;
END;
$$;

-- Also update the trigger to NOT require approved request if invitation exists
-- This way invitation-based signups work even without going through registration
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
  -- PRIORITY 1: Check if user was invited
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC -- Get most recent invitation
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

    RAISE NOTICE 'User % joined company via invitation', NEW.email;
    RETURN NEW;
  END IF;

  -- PRIORITY 2: Check if user has an approved registration request (legacy support)
  SELECT * INTO approved_request
  FROM public.company_registration_requests
  WHERE email = NEW.email AND status = 'approved'
  ORDER BY reviewed_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- Get the company created for this request
    SELECT id INTO new_company_id
    FROM public.companies
    WHERE name = approved_request.company_name
    ORDER BY created_at DESC
    LIMIT 1;

    IF new_company_id IS NOT NULL THEN
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

      RAISE NOTICE 'User % created from approved registration', NEW.email;
      RETURN NEW;
    END IF;
  END IF;

  -- No invitation and no approved request
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

SELECT 'Approval flow fixed! Now creates invitation automatically.' as message;
