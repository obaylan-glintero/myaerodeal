-- =====================================================
-- BULK RENAME LEADS SCRIPT
-- =====================================================
-- This script renames leads to the format:
-- {Lead Name} - {Preferred Model} - {Budget}
--
-- IMPORTANT: This script will only update leads for a specific company
-- Replace 'YOUR_COMPANY_ID_HERE' with the actual company UUID
-- =====================================================

-- Step 1: Preview the changes (run this first to verify)
-- Uncomment to preview what will be changed:

/*
SELECT
  id,
  name as current_name,
  CASE
    WHEN preferred_model IS NOT NULL AND budget IS NOT NULL THEN
      name || ' - ' || preferred_model || ' - $' || ROUND(budget/1000000, 1) || 'M'
    WHEN preferred_model IS NOT NULL AND budget IS NULL THEN
      name || ' - ' || preferred_model || ' - Unknown'
    WHEN preferred_model IS NULL AND budget IS NOT NULL THEN
      name || ' - ' || '$' || ROUND(budget/1000000, 1) || 'M'
    ELSE
      name  -- Keep original if both are NULL
  END as new_name,
  preferred_model,
  budget,
  company_id
FROM public.leads
WHERE company_id = 'YOUR_COMPANY_ID_HERE'
ORDER BY created_at DESC;
*/

-- Step 2: Perform the actual update
-- Replace 'YOUR_COMPANY_ID_HERE' with your company UUID
-- Uncomment to execute:

/*
UPDATE public.leads
SET
  name = CASE
    WHEN preferred_model IS NOT NULL AND budget IS NOT NULL THEN
      name || ' - ' || preferred_model || ' - $' || ROUND(budget/1000000, 1) || 'M'
    WHEN preferred_model IS NOT NULL AND budget IS NULL THEN
      name || ' - ' || preferred_model || ' - Unknown'
    WHEN preferred_model IS NULL AND budget IS NOT NULL THEN
      name || ' - ' || '$' || ROUND(budget/1000000, 1) || 'M'
    ELSE
      name  -- Keep original if both are NULL
  END,
  updated_at = NOW()
WHERE company_id = 'YOUR_COMPANY_ID_HERE'
  AND (preferred_model IS NOT NULL OR budget IS NOT NULL)  -- Only update if we have data to add
  AND name NOT LIKE '% - %';  -- Skip already renamed leads

-- Show affected rows
SELECT COUNT(*) as updated_leads FROM public.leads
WHERE company_id = 'YOUR_COMPANY_ID_HERE'
  AND name LIKE '% - %';
*/

-- =====================================================
-- HOW TO USE THIS SCRIPT:
-- =====================================================
-- 1. Get your company_id:
--    SELECT id, name FROM public.companies;
--
-- 2. Replace 'YOUR_COMPANY_ID_HERE' with your company UUID
--
-- 3. Uncomment and run the preview SELECT query first
--
-- 4. Verify the changes look correct
--
-- 5. Uncomment and run the UPDATE query
--
-- 6. Refresh your app to see the changes
-- =====================================================

-- =====================================================
-- TO UNDO THE CHANGES (if needed):
-- =====================================================
-- This removes everything after the first " - " to restore original names
/*
UPDATE public.leads
SET
  name = SPLIT_PART(name, ' - ', 1),
  updated_at = NOW()
WHERE company_id = 'YOUR_COMPANY_ID_HERE'
  AND name LIKE '% - %';
*/
