-- ============================================
-- ADD Missing Image Column to Aircraft Table
-- ============================================

-- Add image_data column to aircraft table
ALTER TABLE public.aircraft
ADD COLUMN IF NOT EXISTS image_data TEXT DEFAULT NULL;

-- Verify column was added
SELECT
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'aircraft'
  AND column_name = 'image_data';

-- Show all columns in aircraft table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'aircraft'
ORDER BY ordinal_position;
