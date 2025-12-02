# Fix Custom Domain Issue - myaerodeal.com

## Problem
When accessing the app via myaerodeal.com, no data is visible (but it works on the Vercel domain).

## Root Cause
Supabase has CORS restrictions that need to be updated to allow your custom domain.

## Solution

### Step 1: Add Custom Domain to Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Scroll down to **"Allowed Origins"** or **"Additional Origins"**
5. Add the following URLs (one per line):
   ```
   https://myaerodeal.com
   https://www.myaerodeal.com
   ```
6. Click **Save**

### Step 2: Update Supabase Site URL

1. Still in **Settings** → **API**
2. Find **"Site URL"** field
3. Update it to: `https://myaerodeal.com`
4. Click **Save**

### Step 3: Update Redirect URLs (for Authentication)

1. Go to **Authentication** → **URL Configuration**
2. Find **"Redirect URLs"** section
3. Add these URLs:
   ```
   https://myaerodeal.com/**
   https://www.myaerodeal.com/**
   https://myaerodeal.vercel.app/**
   ```
4. Click **Save**

### Step 4: Check Vercel Domain Configuration

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Domains**
4. Verify that myaerodeal.com is properly configured
5. Check SSL certificate status (should be "Active")

### Step 5: Clear Browser Cache and Test

1. Open your browser in Incognito/Private mode
2. Go to https://myaerodeal.com
3. Try logging in
4. Check if data loads correctly

## Common Issues

### Issue 1: Still No Data After Configuration
- Wait 5-10 minutes for Supabase DNS/CORS changes to propagate
- Clear browser cache completely
- Try from a different browser

### Issue 2: Authentication Fails
- Make sure all redirect URLs are added in Supabase
- Check that Site URL matches your custom domain
- Verify email confirmation is disabled (Settings → Auth → Email Auth → Confirm Email = OFF)

### Issue 3: Mixed Content Warnings
- Ensure your custom domain has a valid SSL certificate in Vercel
- All assets should be loaded over HTTPS

## Verification Steps

After configuration, verify:

1. ✅ Can access https://myaerodeal.com (loads app)
2. ✅ Can login successfully
3. ✅ Can see dashboard data (leads, aircraft, deals)
4. ✅ Can create new records
5. ✅ No CORS errors in browser console (F12 → Console)

## Quick Test Script

Open browser console on myaerodeal.com and run:

```javascript
// Check if Supabase is accessible
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

// Check authentication
const { data: { user } } = await window.supabase.auth.getUser();
console.log('User:', user);

// Try to fetch data
const { data, error } = await window.supabase.from('leads').select('*');
console.log('Leads:', data);
console.log('Error:', error);
```

If you see CORS errors, the Supabase configuration needs to be updated as described above.

## Need Help?

If the issue persists after following these steps:

1. Check browser console (F12) for specific error messages
2. Verify Supabase project is accessible
3. Confirm environment variables in Vercel are correct
4. Check if the issue occurs on other devices/networks
