-- Add flag to track whether sample data has been created for a company
-- This prevents sample data from being recreated every time the user deletes their data

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS sample_data_created BOOLEAN DEFAULT false;

-- Update existing companies to have the flag set to true
-- (assuming they already have data or have been using the system)
UPDATE companies
SET sample_data_created = true
WHERE id IN (
  SELECT DISTINCT company_id
  FROM leads
  UNION
  SELECT DISTINCT company_id
  FROM aircraft
  UNION
  SELECT DISTINCT company_id
  FROM deals
);

-- Verify the column was added
SELECT
  id,
  name,
  sample_data_created,
  created_at
FROM companies
ORDER BY created_at DESC;
