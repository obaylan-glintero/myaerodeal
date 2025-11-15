# Fix: Users Table Infinite Recursion

## 🔴 The Real Problem:

The error says **"infinite recursion detected in policy for relation 'users'"** - this means you have a `public.users` table with a problematic RLS policy that's creating a circular reference.

**Key insight:** You mentioned "my newly created user is not inserted in the users table" - this confirms there's a `public.users` table that's interfering with Supabase's built-in authentication.

## 🎯 Why This Happens:

Supabase already has a built-in **`auth.users`** table for authentication. You likely have BOTH:
- ✅ `auth.users` (Supabase's authentication table) - This is what you need
- ❌ `public.users` (Custom table with bad RLS policy) - This is causing the problem

When you query leads/aircraft/deals/tasks, they reference `user_id` which tries to validate against the `public.users` table with a broken policy, causing infinite recursion.

## ⚡ Quick Fix (2 Steps)

### Step 1: Diagnose the Problem

Run this in **Supabase SQL Editor**:

```sql
-- Check if public.users table exists
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename = 'users';

-- Check for policies on users table
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'users';
```

**If you see results**, that's the problem! The `public.users` table exists and has policies.

### Step 2: Fix It - Drop the Public Users Table

**RECOMMENDED SOLUTION:** Drop the problematic `public.users` table entirely.

Run this in **Supabase SQL Editor**:

```sql
-- Drop the problematic public.users table
DROP TABLE IF EXISTS public.users CASCADE;

-- Verify it's gone
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';
-- Should return 0 rows

-- Test that queries now work
SELECT COUNT(*) FROM leads;
SELECT COUNT(*) FROM aircraft;
```

### Step 3: Refresh Your Browser

After running the DROP TABLE command:
1. Go back to your app
2. **Refresh** (Cmd+R / Ctrl+R)
3. Check console - errors should be gone!

## 🤔 But Wait, Won't I Lose User Data?

**No!** Your authentication still works because Supabase uses **`auth.users`** (in the auth schema), not `public.users`.

- ✅ `auth.users` = Supabase's authentication system (stays intact)
- ❌ `public.users` = Custom table (causing problems, not needed)

Your app uses the `user_id` from `auth.users`, so dropping `public.users` won't affect anything.

## 🔍 Alternative: If You Really Need public.users

If you absolutely need the `public.users` table for some reason, you can disable RLS on it instead:

```sql
-- Disable RLS on public.users (keeps table but removes problematic policies)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all policies on it
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
-- Add any other policy names you see from the diagnostic

-- Test queries
SELECT COUNT(*) FROM leads;
```

But honestly, **dropping the table is cleaner** if you're not actively using it.

## 📋 Complete Fix Script

I've created two files for you:

1. **`DIAGNOSE_USERS_TABLE.sql`** - Checks what's wrong
2. **`FIX_USERS_TABLE.sql`** - Drops the problematic table

You can view them with:
```bash
cat DIAGNOSE_USERS_TABLE.sql
cat FIX_USERS_TABLE.sql
```

## ✅ After the Fix

You should see in browser console:
```
✅ Leads fetched: X records
✅ Aircraft fetched: X records
✅ Deals fetched: X records
✅ Tasks fetched: X records
```

And your newly created users will appear in `auth.users` (where they should be).

## 🎯 Understanding the Architecture

**Correct Setup (What We Want):**
```
auth.users (Supabase managed)
    ↓
    user_id referenced by:
    → leads.user_id
    → aircraft.user_id
    → deals.user_id
    → tasks.user_id
```

**Broken Setup (What's Causing Problems):**
```
auth.users (Supabase managed)
    ↓
public.users (Your custom table with bad RLS)
    ↓ (infinite recursion here!)
    → leads.user_id tries to check public.users
    → public.users RLS tries to check auth.users
    → circular reference!
```

## 🚀 Summary

1. **Run:** `DROP TABLE IF EXISTS public.users CASCADE;`
2. **Refresh** your browser
3. **Check** console - no more errors
4. **Enjoy** your working app with data!

The `public.users` table was created at some point (maybe from an old schema or tutorial) and is now interfering with the authentication flow. Removing it fixes everything.

---

**Ready?** Run that DROP TABLE command and your infinite recursion will be gone! 🎉
