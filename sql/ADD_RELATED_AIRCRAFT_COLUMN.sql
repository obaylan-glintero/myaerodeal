-- Add related_aircraft column to deals table
-- This allows deals to be linked to specific aircraft

-- Add the column (using uuid type to match aircraft IDs)
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS related_aircraft uuid;

-- Add foreign key constraint to aircraft table
ALTER TABLE deals
ADD CONSTRAINT fk_deals_aircraft
FOREIGN KEY (related_aircraft)
REFERENCES aircraft(id)
ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_deals_related_aircraft
ON deals(related_aircraft);

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'deals'
AND column_name = 'related_aircraft';
