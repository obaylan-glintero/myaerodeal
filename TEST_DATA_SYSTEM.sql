-- ============================================
-- TEST DATA POPULATION & CLEANUP SYSTEM
-- ============================================

-- Function to populate test data for a new company
CREATE OR REPLACE FUNCTION public.populate_test_data(
  target_company_id UUID
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  lead_id_1 BIGINT;
  lead_id_2 BIGINT;
  lead_id_3 BIGINT;
  aircraft_id_1 BIGINT;
  aircraft_id_2 BIGINT;
  aircraft_id_3 BIGINT;
  deal_id_1 BIGINT;
  result JSON;
BEGIN
  -- Insert 3 test leads
  INSERT INTO public.leads (
    company_id, name, company, aircraft_type, budget, budget_known,
    year_preference, status, notes, presentations, timestamped_notes, created_at
  ) VALUES 
  (
    target_company_id,
    'John Mitchell',
    'TechCorp Aviation',
    'Midsize Jet',
    8500000,
    true,
    '{"oldest": 2018, "newest": 2023}'::jsonb,
    'Interested',
    'Looking for immediate delivery. Budget approved by board.',
    '[]'::jsonb,
    '[]'::jsonb,
    now() - interval '5 days'
  ),
  (
    target_company_id,
    'Sarah Williams',
    'Global Ventures LLC',
    'Light Jet',
    4500000,
    true,
    '{"oldest": 2020, "newest": 2024}'::jsonb,
    'Inquiry',
    'First-time buyer. Needs guidance on aircraft selection.',
    '[]'::jsonb,
    '[]'::jsonb,
    now() - interval '3 days'
  ),
  (
    target_company_id,
    'Michael Chen',
    'Pacific Holdings',
    'Heavy Jet',
    NULL,
    false,
    '{"oldest": 2019, "newest": 2025}'::jsonb,
    'Presented',
    'Flexible on specifications. Looking for best value.',
    '[]'::jsonb,
    '[]'::jsonb,
    now() - interval '1 day'
  )
  RETURNING id INTO lead_id_1;

  -- Get the other lead IDs
  SELECT id INTO lead_id_2 FROM public.leads 
  WHERE company_id = target_company_id AND name = 'Sarah Williams';
  
  SELECT id INTO lead_id_3 FROM public.leads 
  WHERE company_id = target_company_id AND name = 'Michael Chen';

  -- Insert 3 test aircraft
  INSERT INTO public.aircraft (
    company_id, manufacturer, model, yom, serial_number, registration,
    category, location, price, total_time, access_type, summary,
    presentations, created_at
  ) VALUES
  (
    target_company_id,
    'Gulfstream',
    'G550',
    2019,
    'SN-5519',
    'N550GS',
    'Heavy Jet',
    'Van Nuys, CA',
    18500000,
    2450,
    'Direct',
    'Pristine G550 with fresh interior refurbishment. Full Honeywell avionics suite.',
    '[]'::jsonb,
    now() - interval '7 days'
  ),
  (
    target_company_id,
    'Bombardier',
    'Challenger 350',
    2021,
    'SN-20721',
    'N350BD',
    'Midsize Jet',
    'Teterboro, NJ',
    11200000,
    850,
    'Direct',
    'Low-time Challenger 350. Corporate owned, impeccably maintained.',
    '[]'::jsonb,
    now() - interval '4 days'
  ),
  (
    target_company_id,
    'Cessna',
    'Citation M2',
    2022,
    'SN-0622',
    'N522CS',
    'Light Jet',
    'Scottsdale, AZ',
    4750000,
    420,
    'Broker',
    'Nearly new M2. Perfect first jet for owner-operators.',
    '[]'::jsonb,
    now() - interval '2 days'
  )
  RETURNING id INTO aircraft_id_1;

  -- Get the other aircraft IDs
  SELECT id INTO aircraft_id_2 FROM public.aircraft 
  WHERE company_id = target_company_id AND model = 'Challenger 350';
  
  SELECT id INTO aircraft_id_3 FROM public.aircraft 
  WHERE company_id = target_company_id AND model = 'Citation M2';

  -- Insert 3 test deals
  INSERT INTO public.deals (
    company_id, deal_name, client_name, related_lead, related_aircraft,
    deal_value, estimated_closing, status, next_step, follow_up_date,
    document, document_data, document_type, created_at
  ) VALUES
  (
    target_company_id,
    'TechCorp G550 Acquisition',
    'John Mitchell',
    lead_id_1,
    aircraft_id_1,
    18250000,
    (now() + interval '45 days')::date,
    'APA Signed',
    'Schedule pre-purchase inspection',
    (now() + interval '5 days')::date,
    NULL,
    NULL,
    NULL,
    now() - interval '6 days'
  ),
  (
    target_company_id,
    'Global Ventures M2 Deal',
    'Sarah Williams',
    lead_id_2,
    aircraft_id_3,
    4650000,
    (now() + interval '30 days')::date,
    'LOI Signed',
    'Await deposit payment',
    (now() + interval '3 days')::date,
    NULL,
    NULL,
    NULL,
    now() - interval '2 days'
  ),
  (
    target_company_id,
    'Pacific Holdings Challenger',
    'Michael Chen',
    lead_id_3,
    aircraft_id_2,
    11000000,
    (now() + interval '60 days')::date,
    'Deposit Paid',
    'Draft purchase agreement',
    (now() + interval '7 days')::date,
    NULL,
    NULL,
    NULL,
    now() - interval '1 day'
  )
  RETURNING id INTO deal_id_1;

  -- Insert 3 test tasks
  INSERT INTO public.tasks (
    company_id, title, description, due_date, priority, status, created_at
  ) VALUES
  (
    target_company_id,
    'Follow up with John Mitchell',
    'Call to discuss PPI scheduling and answer any questions about the G550.',
    (now() + interval '2 days')::date,
    'high',
    'pending',
    now() - interval '4 days'
  ),
  (
    target_company_id,
    'Send comps to Sarah Williams',
    'Prepare and send comparable sales data for Citation M2 aircraft in the region.',
    (now() + interval '1 day')::date,
    'medium',
    'pending',
    now() - interval '1 day'
  ),
  (
    target_company_id,
    'Update Challenger 350 listing',
    'Refresh photos and update description with recent maintenance records.',
    (now() + interval '5 days')::date,
    'low',
    'pending',
    now() - interval '3 days'
  );

  result := json_build_object(
    'success', true,
    'message', 'Test data populated successfully',
    'leads_created', 3,
    'aircraft_created', 3,
    'deals_created', 3,
    'tasks_created', 3
  );

  RETURN result;
END;
$$;

-- Function to wipe all company data except users
CREATE OR REPLACE FUNCTION public.wipe_company_data()
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_company_id UUID;
  user_role TEXT;
  deleted_counts JSON;
  leads_count INT;
  aircraft_count INT;
  deals_count INT;
  tasks_count INT;
BEGIN
  -- Get current user's company and role
  SELECT company_id, role INTO user_company_id, user_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Security check: only admins can wipe data
  IF user_role != 'admin' THEN
    RAISE EXCEPTION 'Only company admins can wipe company data';
  END IF;

  IF user_company_id IS NULL THEN
    RAISE EXCEPTION 'User is not associated with a company';
  END IF;

  -- Delete all data for the company (RLS will enforce company_id automatically)
  DELETE FROM public.tasks WHERE company_id = user_company_id;
  GET DIAGNOSTICS tasks_count = ROW_COUNT;

  DELETE FROM public.deals WHERE company_id = user_company_id;
  GET DIAGNOSTICS deals_count = ROW_COUNT;

  DELETE FROM public.aircraft WHERE company_id = user_company_id;
  GET DIAGNOSTICS aircraft_count = ROW_COUNT;

  DELETE FROM public.leads WHERE company_id = user_company_id;
  GET DIAGNOSTICS leads_count = ROW_COUNT;

  -- Note: We DO NOT delete profiles or company
  -- Users and company structure remain intact

  deleted_counts := json_build_object(
    'success', true,
    'message', 'All company data has been wiped',
    'leads_deleted', leads_count,
    'aircraft_deleted', aircraft_count,
    'deals_deleted', deals_count,
    'tasks_deleted', tasks_count
  );

  RETURN deleted_counts;
END;
$$;

-- Update the approval function to include test data population
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
    'admin',
    invitation_token,
    now() + interval '30 days'
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
    'invitation_url', 'REPLACE_WITH_APP_URL?invitation=' || invitation_token,
    'test_data_populated', true
  );

  RETURN result;
END;
$$;

SELECT 'Test data system created! New companies will have sample data, and admins can wipe it.' as message;
