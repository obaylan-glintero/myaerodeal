-- Add approved column to companies table
-- Run this in your Supabase SQL Editor

-- Add approved column (this is what was missing!)
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Create index for faster approved status lookups
CREATE INDEX IF NOT EXISTS idx_companies_approved
ON companies(approved);

-- Add helpful comment
COMMENT ON COLUMN companies.approved IS 'Whether company has been approved (via payment or manual approval)';

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'companies'
AND column_name = 'approved';
