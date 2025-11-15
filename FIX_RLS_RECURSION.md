# Fix: RLS Infinite Recursion Error (42P17)

## 🔴 The Error You're Seeing:
```
❌ Error fetching leads: {code: '42P17', message: 'infinite recursion detected in policy for relation "users"'}
```

## 🎯 What This Means:
Your Row Level Security (RLS) policies in Supabase have a circular reference that's causing infinite recursion. This typically happens when:
- A policy on the `profiles` or `users` table references itself
- There's a complex JOIN in a policy that creates a loop
- Foreign key relationships cause recursive checks

## ⚡ Quick Fix (5 minutes)

### Step 1: Go to Supabase SQL Editor
1. Open **https://app.supabase.com**
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Run the Fix Script

**Copy the ENTIRE contents of `FIX_RLS_RECURSION.sql` and paste it into the SQL Editor**, then click **Run**.

Or manually run these sections:

#### A) Drop all existing policies (clean slate)
```sql
-- Drop policies on leads
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Repeat for aircraft, deals, tasks tables
DROP POLICY IF EXISTS "Users can view their own aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Users can insert their own aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Users can update their own aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Users can delete their own aircraft" ON public.aircraft;

DROP POLICY IF EXISTS "Users can view their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can insert their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can delete their own deals" ON public.deals;

DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
```

#### B) Create correct policies (no recursion)
```sql
-- LEADS policies
CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
  ON public.leads FOR DELETE
  USING (auth.uid() = user_id);

-- AIRCRAFT policies
CREATE POLICY "Users can view their own aircraft"
  ON public.aircraft FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own aircraft"
  ON public.aircraft FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aircraft"
  ON public.aircraft FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own aircraft"
  ON public.aircraft FOR DELETE
  USING (auth.uid() = user_id);

-- DEALS policies
CREATE POLICY "Users can view their own deals"
  ON public.deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deals"
  ON public.deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals"
  ON public.deals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals"
  ON public.deals FOR DELETE
  USING (auth.uid() = user_id);

-- TASKS policies
CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);
```

### Step 3: Verify the Fix
Run this to check policies are correct:
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

You should see 4 policies per table (SELECT, INSERT, UPDATE, DELETE).

### Step 4: Test the Connection
```sql
-- These should run without errors
SELECT COUNT(*) FROM leads;
SELECT COUNT(*) FROM aircraft;
SELECT COUNT(*) FROM deals;
SELECT COUNT(*) FROM tasks;
```

If these queries run successfully without the recursion error, you're fixed! ✅

### Step 5: Refresh Your App
1. Go back to your browser
2. **Refresh the page** (Cmd+R or Ctrl+R)
3. Check the console - the errors should be gone!

## 🔍 Understanding the Fix

### ❌ What Caused the Problem:
The recursion likely happened if you had:
1. A `profiles` table with a policy that references `auth.users()`
2. Complex JOINs in policies
3. Trigger functions that create circular references

### ✅ The Simple Solution:
Use **direct** comparisons with `auth.uid()` only:
```sql
USING (auth.uid() = user_id)  -- ✅ Good - direct comparison
```

Avoid complex subqueries or JOINs in policies:
```sql
USING (auth.uid() IN (SELECT id FROM profiles))  -- ❌ Bad - can cause recursion
```

## 🎉 After the Fix

You should see in browser console:
```
✅ Leads fetched: X records
✅ Aircraft fetched: X records
✅ Deals fetched: X records
✅ Tasks fetched: X records
```

## 🚨 If Still Not Working

### Check for other problematic tables:
```sql
-- See all tables with RLS enabled
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    SELECT tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  );
```

### Disable RLS temporarily to test:
```sql
-- ONLY for debugging - DO NOT use in production!
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

Then refresh the app. If data appears, the issue is definitely in the policies.

### Re-enable RLS after testing:
```sql
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

## 📋 Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Dropped all existing policies
- [ ] Created new policies using the script above
- [ ] Verified policies exist (`SELECT * FROM pg_policies`)
- [ ] Tested queries run without errors
- [ ] Refreshed browser
- [ ] Checked console - no more 42P17 errors
- [ ] Data now appears in app

## 💡 Pro Tip

**Keep policies simple!** The best RLS policies:
- Use direct comparisons (`auth.uid() = user_id`)
- Avoid subqueries
- Don't reference multiple tables
- Don't use recursive foreign keys

---

**Ready?** Go run that SQL script in Supabase and your data should start flowing! 🚀
