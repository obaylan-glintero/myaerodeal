-- ============================================
-- AUTOMATIC EMAIL APPROVAL SYSTEM
-- ============================================
-- This approach uses Supabase Auth magic links to send emails automatically

-- Create a function to generate and email magic link for approved users
-- NOTE: This requires enabling "Enable email confirmations" in Supabase Auth settings

CREATE OR REPLACE FUNCTION public.approve_and_send_magic_link(
  request_id UUID,
  app_url TEXT DEFAULT 'http://localhost:5173'
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
  invitation_url TEXT;
  test_data_result JSON;
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

  -- Populate test data for the new company
  SELECT * INTO test_data_result 
  FROM public.populate_test_data(new_company_id);

  -- Generate invitation token
  invitation_token := gen_random_uuid()::TEXT;

  -- Create an invitation for the user
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
    'admin',
    invitation_token,
    now() + interval '30 days'
  );

  -- Build invitation URL
  invitation_url := app_url || '?invitation=' || invitation_token;

  -- Update the request status
  UPDATE public.company_registration_requests
  SET 
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = request_id;

  -- Return success with invitation link and email instructions
  result := json_build_object(
    'success', true,
    'company_id', new_company_id,
    'email', request_record.email,
    'company_name', request_record.company_name,
    'first_name', request_record.first_name,
    'last_name', request_record.last_name,
    'invitation_token', invitation_token,
    'invitation_url', invitation_url,
    'test_data_populated', true,
    'email_instructions', 'Send the invitation_url to ' || request_record.email
  );

  RETURN result;
END;
$$;

-- Alternative: Function to check if we can use Supabase admin API
-- This would require service role key which should only be in Edge Functions
COMMENT ON FUNCTION public.approve_and_send_magic_link IS 
'Approves registration and creates invitation. To enable automatic emails:
1. Create a Supabase Edge Function that calls auth.admin.inviteUserByEmail()
2. Or integrate an email service (SendGrid, Resend, etc.)
3. The invitation URL must be sent to the user via email';

SELECT 'Approval function updated. Invitation URL is returned but emails must be sent manually or via Edge Function.' as message;
