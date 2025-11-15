-- Simplified test data population that doesn't rely on related_lead/related_aircraft
-- This avoids type mismatches entirely

CREATE OR REPLACE FUNCTION public.populate_test_data(
  target_company_id UUID
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
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
  );

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
  );

  -- Insert 3 test deals WITHOUT related_lead and related_aircraft to avoid type issues
  INSERT INTO public.deals (
    company_id, deal_name, client_name,
    deal_value, estimated_closing, status, next_step, follow_up_date,
    document, document_data, document_type, created_at
  ) VALUES
  (
    target_company_id,
    'TechCorp G550 Acquisition',
    'John Mitchell',
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
    11000000,
    (now() + interval '60 days')::date,
    'Deposit Paid',
    'Draft purchase agreement',
    (now() + interval '7 days')::date,
    NULL,
    NULL,
    NULL,
    now() - interval '1 day'
  );

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
    'tasks_created', 3,
    'note', 'Deals are not linked to specific leads/aircraft to avoid type conflicts'
  );

  RETURN result;
END;
$$;

SELECT 'Test data function updated - deals will not be linked to specific leads/aircraft' as message;
