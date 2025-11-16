-- Add status field to aircraft table
-- Status can be: For Sale, Not for Sale, Under Contract

-- Add the status column
ALTER TABLE aircraft
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'For Sale' CHECK (status IN ('For Sale', 'Not for Sale', 'Under Contract'));

-- Update existing aircraft to have 'For Sale' status
UPDATE aircraft
SET status = 'For Sale'
WHERE status IS NULL;

-- Verify the change
SELECT id, manufacturer, model, status
FROM aircraft
LIMIT 5;
