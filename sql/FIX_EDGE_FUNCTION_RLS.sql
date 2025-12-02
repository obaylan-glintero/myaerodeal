-- Temporary fix: Allow Edge Function to read profile/company during checkout
-- This is needed because Edge Function might not have proper auth context

-- The issue: Edge Function uses user's auth token to create Supabase client,
-- but RLS policies might not recognize auth.uid() in that context.

-- Solution: Add policies that allow reading for checkout creation

-- ============================================
-- Option 1: Allow reading during active session
-- ============================================

-- These policies are more permissive but still secure
-- They allow any authenticated user to read ANY profile/company
-- This is temporary - we'll use service role key in Edge Function instead

-- SKIP THIS - Too permissive, use Option 2 instead

-- ============================================
-- Option 2: Use Service Role Key in Edge Function (RECOMMENDED)
-- ============================================

-- No SQL changes needed!
-- We'll update the Edge Function to use service role key
-- for reading profile/company data during checkout creation.

-- This is secure because:
-- 1. Service role key bypasses RLS
-- 2. Only used internally by Edge Function
-- 3. User still needs valid auth token to call Edge Function
-- 4. We validate user owns the profile before proceeding

-- Run this to verify current policies are active:
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'companies')
ORDER BY tablename, policyname;

-- ============================================
-- Check what's failing
-- ============================================

-- Check if profile exists
SELECT id, email, company_id, role
FROM profiles
WHERE id = auth.uid();

-- Check if company exists
SELECT c.id, c.name, c.email, c.approved
FROM companies c
INNER JOIN profiles p ON c.id = p.company_id
WHERE p.id = auth.uid();

-- If these queries return data, RLS is working
-- If they return nothing, there's an auth context issue
