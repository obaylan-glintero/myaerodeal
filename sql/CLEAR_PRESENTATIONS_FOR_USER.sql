-- ============================================
-- Clear Presentations for User
-- User ID: 036e7503-2203-410a-8fe2-bd607e9fa99b
-- ============================================

-- Clear all presentations from leads
UPDATE leads
SET presentations = '[]'::jsonb
WHERE user_id = '036e7503-2203-410a-8fe2-bd607e9fa99b';

-- Clear all presentations from aircraft
UPDATE aircraft
SET presentations = '[]'::jsonb
WHERE user_id = '036e7503-2203-410a-8fe2-bd607e9fa99b';

-- Verify it worked - should show 0 presentations for both tables
SELECT
  'leads' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN jsonb_array_length(presentations) > 0 THEN 1 ELSE 0 END) as with_presentations
FROM leads
WHERE user_id = '036e7503-2203-410a-8fe2-bd607e9fa99b'

UNION ALL

SELECT
  'aircraft' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN jsonb_array_length(presentations) > 0 THEN 1 ELSE 0 END) as with_presentations
FROM aircraft
WHERE user_id = '036e7503-2203-410a-8fe2-bd607e9fa99b';

-- ✅ Both should show 0 'with_presentations' after running this
