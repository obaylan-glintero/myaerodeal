-- Force fix: Drop ALL update policies first, then recreate

-- ============================================
-- DROP ALL UPDATE POLICIES
-- ============================================

-- Get all UPDATE policies for these tables and drop them
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies
        WHERE tablename IN ('leads', 'aircraft', 'deals', 'tasks')
        AND cmd = 'UPDATE'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ============================================
-- CREATE NEW UPDATE POLICIES
-- ============================================

CREATE POLICY "Users can update company leads" ON public.leads
  FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update company aircraft" ON public.aircraft
  FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update company deals" ON public.deals
  FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

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
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'Missing USING clause'
  END as using_check,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'Missing WITH CHECK clause'
  END as with_check_status
FROM pg_policies
WHERE tablename IN ('leads', 'aircraft', 'deals', 'tasks')
  AND cmd = 'UPDATE'
ORDER BY tablename;
