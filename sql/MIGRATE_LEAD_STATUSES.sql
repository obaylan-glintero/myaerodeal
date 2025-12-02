-- ============================================
-- MIGRATE Lead Statuses from Old to New Values
-- ============================================
-- Old values: Hot, Warm, Cold, Initial
-- New values: Inquiry, Presented, Interested, Deal Created, Lost

-- Update mapping:
-- Initial/Cold -> Inquiry (initial contact)
-- Warm -> Interested (showing interest)
-- Hot -> Interested (strong interest, same as warm)
-- Keep: Presented, Deal Created, Lost (already correct)

-- Update old 'Initial' status to 'Inquiry'
UPDATE public.leads
SET status = 'Inquiry'
WHERE status = 'Initial';

-- Update old 'Cold' status to 'Inquiry'
UPDATE public.leads
SET status = 'Inquiry'
WHERE status = 'Cold';

-- Update old 'Warm' status to 'Interested'
UPDATE public.leads
SET status = 'Interested'
WHERE status = 'Warm';

-- Update old 'Hot' status to 'Interested'
UPDATE public.leads
SET status = 'Interested'
WHERE status = 'Hot';

-- Show updated lead statuses
SELECT status, COUNT(*) as count
FROM public.leads
GROUP BY status
ORDER BY status;

-- Verify all leads have valid statuses
SELECT id, name, company, status
FROM public.leads
WHERE status NOT IN ('Inquiry', 'Presented', 'Interested', 'Deal Created', 'Lost')
ORDER BY name;
