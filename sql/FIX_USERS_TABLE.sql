-- ============================================
-- FIX: Remove problematic public.users table
-- ============================================
-- This table is causing the infinite recursion
-- Supabase already has auth.users - we don't need public.users

-- Option 1: Drop the entire public.users table (RECOMMENDED)
-- This removes the problematic table entirely
-- Your app uses auth.users (managed by Supabase), not public.users

DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- Alternative: Just disable RLS on users table
-- (Only if you really need to keep the table)
-- ============================================

-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ============================================
-- After dropping the table, verify it's gone
-- ============================================

SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'users';

-- Should return 0 rows if successfully dropped

-- ============================================
-- Now test your queries again
-- ============================================

SELECT COUNT(*) FROM leads;
SELECT COUNT(*) FROM aircraft;
SELECT COUNT(*) FROM deals;
SELECT COUNT(*) FROM tasks;

-- These should now work without infinite recursion!
