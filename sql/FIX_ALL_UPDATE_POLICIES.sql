-- Comprehensive fix for all UPDATE policies
-- This ensures users can update records in their company

-- ============================================
-- LEADS TABLE
-- ============================================
-- Drop any existing UPDATE policies
DROP POLICY IF EXISTS "Users can update their company's leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads" ON public.leads;

-- Create correct UPDATE policy with both USING and WITH CHECK
CREATE POLICY "Users can update company leads" ON public.leads
  FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- ============================================
-- AIRCRAFT TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can update their company's aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Users can update their aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Users can update aircraft" ON public.aircraft;

CREATE POLICY "Users can update company aircraft" ON public.aircraft
  FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- ============================================
-- DEALS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can update their company's deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update their deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update deals" ON public.deals;

CREATE POLICY "Users can update company deals" ON public.deals
  FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- ============================================
-- TASKS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can update their company's tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;

CREATE POLICY "Users can update company tasks" ON public.tasks
  FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- ============================================
-- VERIFICATION
-- ============================================
-- Show all UPDATE policies to confirm they exist
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('leads', 'aircraft', 'deals', 'tasks')
  AND cmd = 'UPDATE'
ORDER BY tablename;
