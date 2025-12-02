-- Clean up orphaned users from failed registration attempts
-- Run this in your Supabase SQL Editor

-- Step 1: Check users in auth.users
SELECT id, email, created_at, confirmed_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Check which users have profiles
SELECT
  u.id,
  u.email,
  u.created_at,
  p.id as profile_exists,
  c.name as company_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN companies c ON p.company_id = c.id
ORDER BY u.created_at DESC
LIMIT 10;

-- Step 3: Find orphaned users (users without profiles)
SELECT
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- Step 4: Delete orphaned users (UNCOMMENT TO RUN)
-- WARNING: This will delete users without profiles
-- Make sure to review the list above first!

/*
DELETE FROM auth.users
WHERE id IN (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE p.id IS NULL
);
*/

-- Step 5: Alternative - Delete a specific user by email
-- Replace 'your-email@example.com' with the actual email

/*
DELETE FROM auth.users
WHERE email = 'your-email@example.com';
*/

-- Step 6: Verify deletion
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
