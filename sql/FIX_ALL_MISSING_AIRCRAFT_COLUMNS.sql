-- ============================================
-- FIX All Missing Aircraft Table Columns
-- ============================================

-- Add all potentially missing columns to aircraft table
ALTER TABLE public.aircraft
ADD COLUMN IF NOT EXISTS summary TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_data TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS spec_sheet TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS spec_sheet_data TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS spec_sheet_type TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS presentations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS timestamped_notes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_time INTEGER DEFAULT NULL;

-- Show all current columns in aircraft table
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'aircraft'
ORDER BY ordinal_position;
