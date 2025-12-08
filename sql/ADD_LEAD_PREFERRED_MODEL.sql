-- ============================================
-- ADD Preferred Model Column to Leads Table
-- ============================================

-- Add preferred_model column to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS preferred_model TEXT DEFAULT NULL;

-- Verify column was added
SELECT
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'leads'
  AND column_name = 'preferred_model';

-- Check leads table structure
SELECT id, name, company, preferred_model
FROM leads
LIMIT 5;
