-- ============================================
-- ADD Aircraft Summary Column
-- ============================================

-- Add summary column to aircraft table
ALTER TABLE public.aircraft
ADD COLUMN IF NOT EXISTS summary TEXT DEFAULT NULL;

-- Verify column was added
SELECT
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'aircraft'
  AND column_name = 'summary';

-- Check your aircraft now have the summary column
SELECT id, manufacturer, model, summary
FROM aircraft
WHERE user_id = '036e7503-2203-410a-8fe2-bd607e9fa99b'
LIMIT 5;
