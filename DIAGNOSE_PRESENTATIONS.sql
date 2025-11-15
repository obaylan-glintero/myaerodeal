-- ============================================
-- DIAGNOSE: Presentations Data Issues
-- ============================================

-- Step 1: Get your user_id
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Copy your user_id and replace 'YOUR-USER-ID' below

-- ============================================
-- Step 2: Check presentations in leads table
-- ============================================

-- See what presentations exist and if the aircraftIds are valid
SELECT
  l.id as lead_id,
  l.name as lead_name,
  l.presentations,
  l.user_id
FROM leads l
WHERE l.user_id = 'YOUR-USER-ID';

-- This will show the presentations array stored in each lead
-- Check if the aircraftId values in presentations match YOUR aircraft IDs

-- ============================================
-- Step 3: Check presentations in aircraft table
-- ============================================

SELECT
  a.id as aircraft_id,
  a.manufacturer || ' ' || a.model as aircraft_name,
  a.presentations,
  a.user_id
FROM aircraft a
WHERE a.user_id = 'YOUR-USER-ID';

-- This will show the presentations array stored in each aircraft
-- Check if the leadId values in presentations match YOUR lead IDs

-- ============================================
-- Step 4: Find YOUR valid lead and aircraft IDs
-- ============================================

-- Get all YOUR lead IDs
SELECT id, name FROM leads WHERE user_id = 'YOUR-USER-ID';

-- Get all YOUR aircraft IDs
SELECT id, manufacturer, model FROM aircraft WHERE user_id = 'YOUR-USER-ID';

-- ============================================
-- Step 5: Clear ALL presentations (start fresh)
-- ============================================
-- This will remove all presentation data so you can start clean
-- Only run this if you want to remove all presentations!

/*
UPDATE leads
SET presentations = '[]'::jsonb
WHERE user_id = 'YOUR-USER-ID';

UPDATE aircraft
SET presentations = '[]'::jsonb
WHERE user_id = 'YOUR-USER-ID';
*/

-- After clearing, refresh your browser and create presentations fresh

-- ============================================
-- Step 6: Verify presentations are cleared
-- ============================================

/*
SELECT
  'leads' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN jsonb_array_length(presentations) > 0 THEN 1 ELSE 0 END) as with_presentations
FROM leads
WHERE user_id = 'YOUR-USER-ID'

UNION ALL

SELECT
  'aircraft' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN jsonb_array_length(presentations) > 0 THEN 1 ELSE 0 END) as with_presentations
FROM aircraft
WHERE user_id = 'YOUR-USER-ID';
*/

-- Both should show 0 'with_presentations' after clearing
