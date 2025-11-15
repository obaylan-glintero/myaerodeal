-- Quick cleanup for testing
-- Run this before each test attempt

-- Delete all orphaned users (users without profiles)
DELETE FROM auth.users
WHERE id IN (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE p.id IS NULL
);

-- Verify - should show 0
SELECT COUNT(*) as remaining_orphaned_users
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Also delete the specific user mentioned in error
DELETE FROM auth.users WHERE id = '8ec310b2-7509-40f5-958e-764bef6ed281';
