-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- ============================================
-- Simplified version - only for tables that exist

-- ============================================
-- STEP 1: Drop ALL existing policies
-- ============================================

-- Drop policies on leads
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Drop policies on aircraft
DROP POLICY IF EXISTS "Users can view their own aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Users can insert their own aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Users can update their own aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Users can delete their own aircraft" ON public.aircraft;

-- Drop policies on deals
DROP POLICY IF EXISTS "Users can view their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can insert their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can delete their own deals" ON public.deals;

-- Drop policies on tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- ============================================
-- STEP 2: Create CORRECT policies (no recursion)
-- ============================================

-- LEADS table policies
CREATE POLICY "Users can view their own leads"
  ON public.leads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON public.leads
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
  ON public.leads
  FOR DELETE
  USING (auth.uid() = user_id);

-- AIRCRAFT table policies
CREATE POLICY "Users can view their own aircraft"
  ON public.aircraft
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own aircraft"
  ON public.aircraft
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aircraft"
  ON public.aircraft
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own aircraft"
  ON public.aircraft
  FOR DELETE
  USING (auth.uid() = user_id);

-- DEALS table policies
CREATE POLICY "Users can view their own deals"
  ON public.deals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deals"
  ON public.deals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals"
  ON public.deals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals"
  ON public.deals
  FOR DELETE
  USING (auth.uid() = user_id);

-- TASKS table policies
CREATE POLICY "Users can view their own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 3: Verify the fix
-- ============================================

-- Check all policies are now correct
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- ============================================
-- STEP 4: Test queries (should work now)
-- ============================================

SELECT COUNT(*) as leads_count FROM leads;
SELECT COUNT(*) as aircraft_count FROM aircraft;
SELECT COUNT(*) as deals_count FROM deals;
SELECT COUNT(*) as tasks_count FROM tasks;

-- ✅ If these run without errors, the fix worked!
