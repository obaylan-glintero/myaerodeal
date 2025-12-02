-- Comprehensive cleanup for registration testing
-- This cleans up ALL orphaned data from failed registration attempts

-- ============================================
-- Step 1: Find orphaned data
-- ============================================

-- Find users without profiles
SELECT 'Orphaned Users:' as type, COUNT(*) as count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Find companies without users
SELECT 'Orphaned Companies:' as type, COUNT(*) as count
FROM companies c
LEFT JOIN profiles p ON c.id = p.company_id
WHERE p.id IS NULL;

-- Find profiles without users
SELECT 'Orphaned Profiles:' as type, COUNT(*) as count
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- ============================================
-- Step 2: Delete orphaned data
-- ============================================

-- Delete profiles without users (dead profiles)
DELETE FROM profiles
WHERE id NOT IN (SELECT id FROM auth.users);

-- Delete companies without any profiles (orphaned companies)
DELETE FROM companies
WHERE id NOT IN (SELECT DISTINCT company_id FROM profiles WHERE company_id IS NOT NULL);

-- Delete users without profiles (orphaned users)
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- ============================================
-- Step 3: Verify cleanup
-- ============================================

-- Should all show 0
SELECT 'Remaining Orphaned Users:' as type, COUNT(*) as count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 'Remaining Orphaned Companies:', COUNT(*)
FROM companies c
LEFT JOIN profiles p ON c.id = p.company_id
WHERE p.id IS NULL
UNION ALL
SELECT 'Remaining Orphaned Profiles:', COUNT(*)
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- ============================================
-- Step 4: Show current valid data
-- ============================================

SELECT
  'Valid Users with Profiles' as description,
  COUNT(*) as count
FROM auth.users u
INNER JOIN profiles p ON u.id = p.id
INNER JOIN companies c ON p.company_id = c.id;

-- List all valid companies
SELECT
  c.id,
  c.name,
  c.email,
  c.approved,
  COUNT(p.id) as user_count
FROM companies c
LEFT JOIN profiles p ON c.id = p.company_id
GROUP BY c.id, c.name, c.email, c.approved
ORDER BY c.created_at DESC;
