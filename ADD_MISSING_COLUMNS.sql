-- Add missing columns that the app expects

-- Check and add timestamped_notes to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS timestamped_notes JSONB DEFAULT '[]'::jsonb;

-- Check and add presentations to leads table  
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS presentations JSONB DEFAULT '[]'::jsonb;

-- Check and add presentations to aircraft table
ALTER TABLE public.aircraft
ADD COLUMN IF NOT EXISTS presentations JSONB DEFAULT '[]'::jsonb;

-- Verify columns exist
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('leads', 'aircraft')
  AND column_name IN ('timestamped_notes', 'presentations')
ORDER BY table_name, column_name;
