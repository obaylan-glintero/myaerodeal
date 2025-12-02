-- ============================================
-- ADD Document Columns to Deals Table
-- ============================================

-- Add document-related columns to deals table
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS document TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS document_data TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timeline_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS document_parsed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS timestamped_notes JSONB DEFAULT '[]'::jsonb;

-- Show all current columns in deals table
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'deals'
ORDER BY ordinal_position;
