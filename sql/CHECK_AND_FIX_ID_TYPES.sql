-- First, let's check what type the ID columns actually are
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('leads', 'aircraft', 'deals', 'tasks')
  AND column_name IN ('id', 'related_lead', 'related_aircraft')
ORDER BY table_name, column_name;

-- Check if leads.id is UUID or BIGINT
DO $$
DECLARE
  leads_id_type TEXT;
BEGIN
  SELECT data_type INTO leads_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'id';
  
  RAISE NOTICE 'leads.id type: %', leads_id_type;
END $$;
