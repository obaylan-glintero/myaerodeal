-- ============================================
-- USER INVITATION EMAIL TEMPLATE AND COMPANY USER LIMITS
-- ============================================

-- Insert email template for user invitations
INSERT INTO public.email_templates (
  id,
  company_id,
  name,
  subject,
  body_html,
  body_text,
  variables,
  category,
  is_system,
  is_active
) VALUES (
  gen_random_uuid(),
  NULL, -- System template, available to all companies
  'user-invitation',
  'You''ve been invited to join {{company_name}} on MyAeroDeal',
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MyAeroDeal</h1>
    </div>
    <div class="content">
      <h2>You''ve been invited!</h2>
      <p>Hi there,</p>
      <p><strong>{{inviter_name}}</strong> has invited you to join <strong>{{company_name}}</strong> on MyAeroDeal.</p>
      <p>MyAeroDeal is a powerful CRM platform designed specifically for the aerospace industry, helping teams manage leads, deals, and customer relationships efficiently.</p>
      <p>Click the button below to accept your invitation and create your account:</p>
      <p style="text-align: center;">
        <a href="{{invitation_url}}" class="button">Accept Invitation</a>
      </p>
      <p style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <a href="{{invitation_url}}">{{invitation_url}}</a>
      </p>
      <p style="margin-top: 30px;">This invitation will expire in 7 days.</p>
      <p>If you have any questions, please contact your administrator.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 MyAeroDeal. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
  'Hi there,

{{inviter_name}} has invited you to join {{company_name}} on MyAeroDeal.

MyAeroDeal is a powerful CRM platform designed specifically for the aerospace industry, helping teams manage leads, deals, and customer relationships efficiently.

Click the link below to accept your invitation and create your account:

{{invitation_url}}

This invitation will expire in 7 days.

If you have any questions, please contact your administrator.

---
© 2025 MyAeroDeal. All rights reserved.',
  '["company_name", "inviter_name", "invitation_url"]'::jsonb,
  'system',
  true,
  true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FUNCTION TO COUNT ACTIVE USERS IN A COMPANY
-- ============================================

CREATE OR REPLACE FUNCTION public.get_company_user_count(
  p_company_id UUID
)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO user_count
  FROM public.profiles
  WHERE company_id = p_company_id
    AND active = true;

  RETURN user_count;
END;
$$;

-- ============================================
-- FUNCTION TO CHECK IF COMPANY CAN ADD MORE USERS
-- ============================================

CREATE OR REPLACE FUNCTION public.can_add_user_to_company(
  p_company_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_count INTEGER;
  max_users INTEGER := 5; -- Company user limit
BEGIN
  current_user_count := public.get_company_user_count(p_company_id);

  RETURN current_user_count < max_users;
END;
$$;

-- ============================================
-- TRIGGER FUNCTION TO ENFORCE USER LIMIT
-- ============================================

CREATE OR REPLACE FUNCTION public.check_company_user_limit()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_count INTEGER;
  max_users INTEGER := 5;
BEGIN
  -- Only check on INSERT or when activating a user
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.active = false AND NEW.active = true) THEN
    -- Get current active user count for the company
    current_user_count := public.get_company_user_count(NEW.company_id);

    -- Check if adding this user would exceed the limit
    IF current_user_count >= max_users THEN
      RAISE EXCEPTION 'Company has reached the maximum limit of % users. Please contact support to increase your limit.', max_users;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS enforce_company_user_limit ON public.profiles;
CREATE TRIGGER enforce_company_user_limit
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_company_user_limit();

-- ============================================
-- TRIGGER FUNCTION TO ENFORCE INVITATION LIMIT
-- ============================================

CREATE OR REPLACE FUNCTION public.check_invitation_user_limit()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_count INTEGER;
  pending_invitation_count INTEGER;
  max_users INTEGER := 5;
BEGIN
  -- Only check on INSERT of new invitations
  IF TG_OP = 'INSERT' THEN
    -- Get current active user count
    current_user_count := public.get_company_user_count(NEW.company_id);

    -- Get pending invitation count for this company
    SELECT COUNT(*)
    INTO pending_invitation_count
    FROM public.user_invitations
    WHERE company_id = NEW.company_id
      AND status = 'pending'
      AND expires_at > now();

    -- Check if current users + pending invitations would exceed limit
    IF (current_user_count + pending_invitation_count) >= max_users THEN
      RAISE EXCEPTION 'Company has reached the maximum limit of % users (including pending invitations). Please contact support to increase your limit.', max_users;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS enforce_invitation_user_limit ON public.user_invitations;
CREATE TRIGGER enforce_invitation_user_limit
  BEFORE INSERT ON public.user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_invitation_user_limit();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Allow authenticated users to execute these functions
GRANT EXECUTE ON FUNCTION public.get_company_user_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_add_user_to_company(UUID) TO authenticated;

SELECT 'User invitation email template and company user limits created successfully!' as message;
