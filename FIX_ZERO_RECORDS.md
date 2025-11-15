# Fix: Zero Records Showing (But Authenticated)

## 🎯 You're Here Because:
- ✅ Supabase is configured
- ✅ You're logged in and authenticated
- ❌ But you see 0 records even though test data exists in Supabase

## 🔍 Root Cause:
Your test data has a different `user_id` than your current logged-in user. Supabase's Row Level Security (RLS) only shows data that belongs to YOUR user_id.

## 📋 Quick Fix (5 minutes)

### Step 1: Check Browser Console
1. Open browser console (F12)
2. Look for the debug output that says:
   ```
   === SUPABASE DATA FETCH DEBUG ===
   User ID: abc-123-def-456...
   ```
3. **Copy your User ID** - you'll need it!

### Step 2: Go to Supabase SQL Editor
1. Open https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 3: Run Diagnostic Script

Paste and run this query (replace `YOUR-USER-ID-HERE` with the User ID from Step 1):

```sql
-- Get all users
SELECT id as user_id, email, created_at
FROM auth.users
ORDER BY created_at DESC;
```

You should see your email and user_id. **Confirm the user_id matches what you saw in the browser console.**

### Step 4: Check Where Your Test Data Is

```sql
-- See which user owns the test data
SELECT
  'leads' as table_name,
  COUNT(*) as records,
  user_id,
  (SELECT email FROM auth.users WHERE id = leads.user_id) as belongs_to_email
FROM leads
GROUP BY user_id

UNION ALL

SELECT
  'aircraft' as table_name,
  COUNT(*) as records,
  user_id,
  (SELECT email FROM auth.users WHERE id = aircraft.user_id) as belongs_to_email
FROM aircraft
GROUP BY user_id;
```

**If this shows:**
- Records exist but `belongs_to_email` is different from your email → Data belongs to wrong user
- No records at all → No test data in database yet

### Step 5: Fix the user_id (if needed)

If the data belongs to the wrong user, run this (replace `YOUR-USER-ID-HERE`):

```sql
-- Update all test data to YOUR user_id
UPDATE leads
SET user_id = 'YOUR-USER-ID-HERE';

UPDATE aircraft
SET user_id = 'YOUR-USER-ID-HERE';

UPDATE deals
SET user_id = 'YOUR-USER-ID-HERE';

UPDATE tasks
SET user_id = 'YOUR-USER-ID-HERE';
```

### Step 6: Refresh the App

After running the UPDATE queries:
1. Go back to your browser
2. **Refresh the page** (Cmd+R or Ctrl+R)
3. Check if data now appears!

## 🎯 Alternative: Insert NEW Test Data

If you prefer to add fresh test data for your user, here's a quick example:

```sql
-- Get your user_id first
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert a test lead (replace YOUR-USER-ID-HERE)
INSERT INTO leads (
  user_id,
  name,
  company,
  aircraft_type,
  status,
  notes
) VALUES (
  'YOUR-USER-ID-HERE',
  'Test Lead 1',
  'Acme Aviation',
  'Gulfstream G650',
  'Initial',
  'This is a test lead'
);

-- Insert a test aircraft
INSERT INTO aircraft (
  user_id,
  manufacturer,
  model,
  serial_number,
  year,
  total_time,
  status
) VALUES (
  'YOUR-USER-ID-HERE',
  'Gulfstream',
  'G650',
  'SN12345',
  2020,
  500,
  'Available'
);
```

After inserting, refresh the app and you should see the data!

## 🔧 If Still Not Working

### Check RLS Policies

Run this to verify RLS policies exist:

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

**If this returns 0 rows:**
- RLS policies are NOT set up
- Go to `SUPABASE_SETUP.md`
- Copy and run the entire SQL schema including the RLS policies

### Check for Errors in Console

Look in browser console for errors like:
```
❌ Error fetching leads: { code: 'PGRST...', message: '...' }
```

Common errors:
- **42501** = Permission denied → RLS policies not set up correctly
- **42P01** = Table doesn't exist → Run schema from SUPABASE_SETUP.md
- **23503** = Foreign key violation → user_id doesn't match any user

## 📝 Complete Diagnostic Script

For a comprehensive diagnosis, use the SQL file I created:
```bash
cat DIAGNOSE_DATA_ISSUE.sql
```

Copy the entire contents and run it in Supabase SQL Editor.

## ✅ Success Checklist

After fixing, you should see:
- ✅ Browser console shows: `✅ Leads fetched: X records` (where X > 0)
- ✅ Data appears in the app (Dashboard, Leads, Aircraft, etc.)
- ✅ You can add new leads/aircraft and they save to Supabase
- ✅ Changes are reflected immediately

## 💡 Understanding the Issue

**Why does this happen?**

When you create test data in Supabase, you might:
1. Insert data without specifying user_id
2. Use a hardcoded user_id from documentation
3. Create data before creating your user account

**Row Level Security (RLS)** ensures each user only sees their own data. The policy:
```sql
CREATE POLICY "Users can view their own leads"
ON public.leads FOR SELECT
USING (auth.uid() = user_id);
```

This means: "Only show leads where user_id matches the logged-in user's ID"

So if your test data has `user_id = 'abc-123'` but you're logged in as `user_id = 'xyz-789'`, the data won't appear.

## 🎉 Quick Win

The fastest fix:
1. Get your user_id from browser console
2. Run: `UPDATE leads SET user_id = 'YOUR-USER-ID'; UPDATE aircraft SET user_id = 'YOUR-USER-ID';`
3. Refresh browser
4. Data should appear!

---

**Still stuck?** Check browser console for the exact error message and let me know what you see!
