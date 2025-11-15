-- ============================================
-- ADD Missing Presentations Columns
-- ============================================

-- Add presentations column to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS presentations JSONB DEFAULT '[]'::jsonb;

-- Add presentations column to aircraft table
ALTER TABLE public.aircraft
ADD COLUMN IF NOT EXISTS presentations JSONB DEFAULT '[]'::jsonb;

-- Verify the columns were added
SELECT
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('leads', 'aircraft')
  AND column_name = 'presentations';

-- Should show 2 rows (one for leads, one for aircraft)

-- Check your data now has the presentations column
SELECT id, name, presentations
FROM leads
WHERE user_id = '036e7503-2203-410a-8fe2-bd607e9fa99b'
LIMIT 3;

SELECT id, manufacturer, model, presentations
FROM aircraft
WHERE user_id = '036e7503-2203-410a-8fe2-bd607e9fa99b'
LIMIT 3;

-- All presentations should be empty arrays '[]' by default
