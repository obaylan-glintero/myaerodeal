# Troubleshooting: Can't See Supabase Data in App

## Quick Checks

### 1. Open Browser Console
**Press F12 or Right-click → Inspect → Console tab**

Look for these messages:

✅ **Good signs:**
```
User authenticated - fetching data from Supabase
✅ Gemini extracted X action items from LOI/APA
```

❌ **Problems:**
```
Supabase not configured - using demo mode
User not authenticated - using demo mode
Error fetching leads: {...}
```

### 2. Check Your .env File

Make sure your `.env` file has the correct credentials:

```bash
cd /Users/onurbaylan/Desktop/AeroBrokerOne
cat .env
```

Should show:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=AIzaSyC...
```

**If placeholders are still there**, you need to replace them with your actual Supabase credentials!

### 3. Verify You're Logged In

- Check bottom of navigation sidebar
- Do you see your email/name and user icon?
- If not, you're not authenticated!

### 4. Check Supabase Dashboard

1. Go to https://app.supabase.com
2. Open your project
3. Go to **Table Editor**
4. Check each table (leads, aircraft, deals, tasks)
5. Do you see data with your `user_id`?

## Common Issues & Solutions

### Issue 1: "User not authenticated - using demo mode"

**Cause:** You're not signed in or Supabase is not configured

**Solution:**
1. Make sure `.env` has your Supabase credentials
2. Restart dev server: `npm run dev`
3. Sign up or sign in to the app
4. Check that you see the user menu at bottom of navigation

### Issue 2: "Error fetching leads/aircraft/deals/tasks"

**Cause:** Row Level Security (RLS) policy issue

**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Run this query to check policies:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

3. If no policies exist, run the full SQL schema from `SUPABASE_SETUP.md`

### Issue 3: Tables Empty in Supabase

**Cause:** No data inserted yet, or data belongs to different user

**Solution:**
1. Check `user_id` in your test data matches your current user
2. Get your user ID:
```sql
SELECT id, email FROM auth.users;
```

3. Check if data exists for your user:
```sql
SELECT * FROM leads WHERE user_id = 'your-user-id-here';
SELECT * FROM aircraft WHERE user_id = 'your-user-id-here';
SELECT * FROM deals WHERE user_id = 'your-user-id-here';
SELECT * FROM tasks WHERE user_id = 'your-user-id-here';
```

### Issue 4: Data Shows in Supabase but Not in App

**Cause:** Data format mismatch between database and app

**Solution:** Check browser console for conversion errors. The app converts:
- `aircraft_type` → `aircraftType`
- `serial_number` → `serialNumber`
- `timestamped_notes` → `timestampedNotes`
- etc.

Make sure your database columns match the schema in `SUPABASE_SETUP.md`

### Issue 5: ".env not loading"

**Cause:** Server not restarted or wrong file location

**Solution:**
1. Stop server (Ctrl+C)
2. Verify `.env` is in project root:
```bash
ls -la .env
```
3. Start server again:
```bash
npm run dev
```

## Step-by-Step Debugging

### Step 1: Verify Supabase Configuration

Open browser console and look for:
```
Supabase not configured - using demo mode
```

If you see this:
- Your `.env` is missing or has placeholder values
- Add real Supabase credentials
- Restart server

### Step 2: Check Authentication

Open browser console and look for:
```
User not authenticated - using demo mode
```

If you see this:
- You're not signed in
- Click "Sign up" or "Sign in"
- Create account or login
- You should see user menu appear at bottom of navigation

### Step 3: Check Data Fetching

After signing in, you should see:
```
User authenticated - fetching data from Supabase
```

If you see errors like:
```
Error fetching leads: {...}
```

This means RLS policies are not set up. Run the SQL from `SUPABASE_SETUP.md`

### Step 4: Verify Data is There

In Supabase Dashboard → Table Editor:

**Check `leads` table:**
- Do rows exist?
- Does `user_id` match your authenticated user?
- Are column names in snake_case? (`aircraft_type`, not `aircraftType`)

**Check `aircraft` table:**
- Same checks as above

**Check `deals` table:**
- Same checks as above

**Check `tasks` table:**
- Same checks as above

### Step 5: Check Real-time Subscriptions

Open browser console and look for:
```
Subscription 'leads_changes' is ready
```

If you don't see this, real-time updates might not work, but regular fetching should still work.

## Manual Debug Test

Run this in browser console to test Supabase connection:

```javascript
// Test Supabase connection
const testSupabase = async () => {
  const { supabase } = await import('./src/lib/supabase.js');

  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log('User:', user);
  console.log('Auth Error:', authError);

  if (user) {
    // Try fetching leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id);

    console.log('Leads:', leads);
    console.log('Leads Error:', leadsError);
  }
};

testSupabase();
```

## Quick Fix Checklist

1. ☐ `.env` file exists in project root
2. ☐ `.env` has real Supabase URL (not placeholder)
3. ☐ `.env` has real Supabase anon key (not placeholder)
4. ☐ Dev server restarted after adding `.env`
5. ☐ User is signed up and logged in
6. ☐ User menu visible at bottom of navigation
7. ☐ Database tables exist in Supabase
8. ☐ RLS policies are enabled and configured
9. ☐ Test data has correct `user_id`
10. ☐ Browser console shows no errors

## Still Not Working?

### Get Detailed Logs

I've added enhanced logging to the app. Check browser console for:

```
=== SUPABASE DEBUG ===
Configured: true/false
User: { id: '...', email: '...' }
Fetching data...
Leads count: X
Aircraft count: X
Deals count: X
Tasks count: X
=====================
```

### Last Resort: Clear Everything and Start Fresh

```bash
# 1. Clear browser data
# In browser: Settings → Privacy → Clear browsing data → Cookies and cached files

# 2. Sign out and sign in again
# Click user menu → Sign out → Sign in

# 3. Restart server
npm run dev
```

## Need More Help?

1. **Copy console errors** and share them
2. **Check Supabase Logs**: Dashboard → Logs
3. **Verify table structure**: Dashboard → Table Editor → Check columns
4. **Test with SQL**: Dashboard → SQL Editor → Run test queries

---

**Most Common Issue:** `.env` file still has placeholder values like `your_supabase_url_here`. Replace these with your actual Supabase credentials from the dashboard!
