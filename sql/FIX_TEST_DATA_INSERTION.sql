-- Fix the test data population function to insert one row at a time

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
  deal_id_2 BIGINT;
  deal_id_3 BIGINT;
  result JSON;
BEGIN
  -- Insert lead 1
  INSERT INTO public.leads (
    company_id, name, company, aircraft_type, budget, budget_known,
    year_preference, status, notes, presentations, timestamped_notes, created_at
  ) VALUES (
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
  ) RETURNING id INTO lead_id_1;

  -- Insert lead 2
  INSERT INTO public.leads (
    company_id, name, company, aircraft_type, budget, budget_known,
    year_preference, status, notes, presentations, timestamped_notes, created_at
  ) VALUES (
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
  ) RETURNING id INTO lead_id_2;

  -- Insert lead 3
  INSERT INTO public.leads (
    company_id, name, company, aircraft_type, budget, budget_known,
    year_preference, status, notes, presentations, timestamped_notes, created_at
  ) VALUES (
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
  ) RETURNING id INTO lead_id_3;

  -- Insert aircraft 1
  INSERT INTO public.aircraft (
    company_id, manufacturer, model, yom, serial_number, registration,
    category, location, price, total_time, access_type, summary,
    presentations, created_at
  ) VALUES (
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
  ) RETURNING id INTO aircraft_id_1;

  -- Insert aircraft 2
  INSERT INTO public.aircraft (
    company_id, manufacturer, model, yom, serial_number, registration,
    category, location, price, total_time, access_type, summary,
    presentations, created_at
  ) VALUES (
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
  ) RETURNING id INTO aircraft_id_2;

  -- Insert aircraft 3
  INSERT INTO public.aircraft (
    company_id, manufacturer, model, yom, serial_number, registration,
    category, location, price, total_time, access_type, summary,
    presentations, created_at
  ) VALUES (
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
  ) RETURNING id INTO aircraft_id_3;

  -- Insert deal 1
  INSERT INTO public.deals (
    company_id, deal_name, client_name, related_lead, related_aircraft,
    deal_value, estimated_closing, status, next_step, follow_up_date,
    document, document_data, document_type, created_at
  ) VALUES (
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
  ) RETURNING id INTO deal_id_1;

  -- Insert deal 2
  INSERT INTO public.deals (
    company_id, deal_name, client_name, related_lead, related_aircraft,
    deal_value, estimated_closing, status, next_step, follow_up_date,
    document, document_data, document_type, created_at
  ) VALUES (
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
  ) RETURNING id INTO deal_id_2;

  -- Insert deal 3
  INSERT INTO public.deals (
    company_id, deal_name, client_name, related_lead, related_aircraft,
    deal_value, estimated_closing, status, next_step, follow_up_date,
    document, document_data, document_type, created_at
  ) VALUES (
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
  ) RETURNING id INTO deal_id_3;

  -- Insert task 1
  INSERT INTO public.tasks (
    company_id, title, description, due_date, priority, status, created_at
  ) VALUES (
    target_company_id,
    'Follow up with John Mitchell',
    'Call to discuss PPI scheduling and answer any questions about the G550.',
    (now() + interval '2 days')::date,
    'high',
    'pending',
    now() - interval '4 days'
  );

  -- Insert task 2
  INSERT INTO public.tasks (
    company_id, title, description, due_date, priority, status, created_at
  ) VALUES (
    target_company_id,
    'Send comps to Sarah Williams',
    'Prepare and send comparable sales data for Citation M2 aircraft in the region.',
    (now() + interval '1 day')::date,
    'medium',
    'pending',
    now() - interval '1 day'
  );

  -- Insert task 3
  INSERT INTO public.tasks (
    company_id, title, description, due_date, priority, status, created_at
  ) VALUES (
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

SELECT 'Test data insertion function fixed!' as message;
