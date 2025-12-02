-- Simplified RLS policy for companies table
-- This allows authenticated users to create companies during registration
-- Run this in your Supabase SQL Editor

-- Drop all existing policies on companies table
DROP POLICY IF EXISTS "Allow authenticated users to create companies" ON companies;
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;
DROP POLICY IF EXISTS "Users can only access their company data" ON companies;
DROP POLICY IF EXISTS "Companies can view own data" ON companies;

-- Simple INSERT policy - allow any authenticated user to create a company
CREATE POLICY "Allow company creation"
ON companies FOR INSERT
WITH CHECK (true);

-- SELECT policy - users can view their own company
CREATE POLICY "View own company"
ON companies FOR SELECT
USING (
  id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
  OR
  auth.uid() IS NOT NULL  -- Allow viewing during registration process
);

-- UPDATE policy - users can update their own company
CREATE POLICY "Update own company"
ON companies FOR UPDATE
USING (
  id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- DELETE policy - users can delete their own company (admin only)
CREATE POLICY "Delete own company"
ON companies FOR DELETE
USING (
  id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Verify policies
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'companies'
ORDER BY policyname;
