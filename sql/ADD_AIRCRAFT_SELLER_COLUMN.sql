-- ============================================
-- ADD Aircraft Seller Column
-- ============================================

-- Add seller column to aircraft table
ALTER TABLE public.aircraft
ADD COLUMN IF NOT EXISTS seller TEXT DEFAULT NULL;

-- Verify column was added
SELECT
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'aircraft'
  AND column_name = 'seller';

-- Check aircraft table structure
SELECT id, manufacturer, model, seller
FROM aircraft
LIMIT 5;
