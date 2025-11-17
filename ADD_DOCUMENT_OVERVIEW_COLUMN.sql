-- ============================================
-- ADD Document Overview Column to Deals Table
-- ============================================

-- Add document_overview column to store AI-extracted document metadata
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS document_overview JSONB DEFAULT NULL;

-- Show confirmation
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'deals'
  AND column_name = 'document_overview';
