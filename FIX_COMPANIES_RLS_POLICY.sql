-- Fix RLS policies for companies table to allow registration
-- Run this in your Supabase SQL Editor

-- First, let's see existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'companies';

-- Drop any overly restrictive INSERT policies if they exist
DROP POLICY IF EXISTS "Users can only access their company data" ON companies;
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can insert their company" ON companies;

-- Allow authenticated users to INSERT companies (needed for registration)
CREATE POLICY "Allow authenticated users to create companies"
ON companies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view their own company
CREATE POLICY "Users can view their own company"
ON companies FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Allow users to update their own company
CREATE POLICY "Users can update their own company"
ON companies FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'companies'
ORDER BY policyname;
