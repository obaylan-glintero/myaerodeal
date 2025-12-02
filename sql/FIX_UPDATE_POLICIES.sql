-- Fix UPDATE policies for all tables to allow status changes
-- The issue is likely that UPDATE policies need both USING and WITH CHECK clauses

-- Leads table
DROP POLICY IF EXISTS "Users can update their company's leads" ON public.leads;
CREATE POLICY "Users can update their company's leads" ON public.leads
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Aircraft table
DROP POLICY IF EXISTS "Users can update their company's aircraft" ON public.aircraft;
CREATE POLICY "Users can update their company's aircraft" ON public.aircraft
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Deals table
DROP POLICY IF EXISTS "Users can update their company's deals" ON public.deals;
CREATE POLICY "Users can update their company's deals" ON public.deals
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Tasks table
DROP POLICY IF EXISTS "Users can update their company's tasks" ON public.tasks;
CREATE POLICY "Users can update their company's tasks" ON public.tasks
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );
