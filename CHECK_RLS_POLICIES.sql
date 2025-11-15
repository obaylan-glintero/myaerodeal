-- Check all current RLS policies on the leads table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('leads', 'aircraft', 'deals', 'tasks')
ORDER BY tablename, cmd, policyname;
