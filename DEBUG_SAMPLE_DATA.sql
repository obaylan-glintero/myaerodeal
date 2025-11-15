-- Debug why sample data isn't being created
-- Run this in Supabase SQL Editor while logged in

-- Check RLS policies on data tables
SELECT
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename IN ('leads', 'aircraft', 'deals', 'tasks')
ORDER BY tablename, cmd;

-- Check if RLS is enabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('leads', 'aircraft', 'deals', 'tasks')
ORDER BY tablename;

-- Test if you can INSERT a lead manually
INSERT INTO leads (
  company_id,
  name,
  email,
  status,
  source,
  phone
)
VALUES (
  (SELECT company_id FROM profiles WHERE id = auth.uid()),
  'Test Lead',
  'test@example.com',
  'Inquiry',
  'Test',
  '+1 555 1234'
)
RETURNING id, name, email;

-- If the INSERT succeeds, the RLS policies are working
-- If it fails, we need to fix the policies
