-- Quick fix: ONLY add the approved column
-- This skips everything else that might already exist
-- Run this in your Supabase SQL Editor

-- Add approved column (the missing piece!)
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Create index
CREATE INDEX IF NOT EXISTS idx_companies_approved
ON companies(approved);

-- Verify it was added
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'companies'
AND column_name = 'approved';

-- Should show:
-- column_name | data_type | column_default | is_nullable
-- approved    | boolean   | false          | YES
