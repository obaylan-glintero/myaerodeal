# Troubleshooting: Subscription Details Not Showing

If you can't see subscription details in Settings, follow this guide to fix it.

## Quick Diagnostic Steps

### Step 1: Check Browser Console

1. Open Settings page in your app
2. Open Browser Developer Tools (F12)
3. Go to **Console** tab
4. Look for errors

**Common errors you might see:**

```
Failed to load subscription details
404 Not Found - get-subscription-details
Error fetching subscription details
```

### Step 2: Check What's Deployed

Run this command to see your deployed Edge Functions:

```bash
supabase functions list
```

**You should see:**
- ✅ create-checkout-session
- ✅ stripe-webhook
- ✅ **get-subscription-details** ← This one is REQUIRED

**If `get-subscription-details` is missing**, that's your problem!

## Solution: Deploy the Edge Function

### Method 1: Deploy Single Function (Fastest)

```bash
cd /home/user/myaerodeal
supabase functions deploy get-subscription-details
```

**Expected output:**
```
Deploying get-subscription-details (project ref: your-project-ref)
Bundled get-subscription-details in 234ms
Deployed get-subscription-details ✓
```

### Method 2: Deploy All Functions

```bash
supabase functions deploy
```

This deploys all functions in the `supabase/functions/` directory.

## Verify It Works

### Step 1: Test the Edge Function Directly

1. Go to **Supabase Dashboard**
2. Navigate to **Edge Functions**
3. Click on **get-subscription-details**
4. Click **Invoke function**
5. Leave the body empty (it uses your auth token)
6. Click **Run**

**Expected response:**
```json
{
  "hasSubscription": true,
  "subscription": {
    "status": "trialing",
    "plan": { ... },
    ...
  }
}
```

**Or if no subscription:**
```json
{
  "hasSubscription": false,
  "error": "No subscription found"
}
```

### Step 2: Test in Your App

1. Refresh the Settings page
2. You should now see the **Subscription & Billing** section
3. It should show:
   - Current plan
   - Trial status (if applicable)
   - Payment method
   - Next billing date

## If It Still Doesn't Work

### Check 1: Verify User Has Subscription

Open Supabase **Table Editor** → **companies** table

Find your company and check:
- ✅ `stripe_subscription_id` - Should have a value (starts with `sub_`)
- ✅ `subscription_status` - Should be `trialing` or `active`

**If these are empty**, the user doesn't have a subscription yet. Go through registration again.

### Check 2: Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Refresh Settings page
4. Look for request to `get-subscription-details`

**Click on it and check:**
- **Status Code**: Should be 200 (not 404, 401, or 500)
- **Response**: Should contain subscription data
- **Request Headers**: Should include Authorization token

### Check 3: Check Edge Function Logs

1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** → **get-subscription-details**
3. Click on **Logs** tab
4. Refresh your Settings page
5. Look for new log entries

**Common errors in logs:**
- "User not authenticated" - Auth token issue
- "Profile not found" - User profile doesn't exist
- "No subscription found" - Company doesn't have Stripe subscription
- Stripe API errors - Check Stripe secret key

### Check 4: Verify Environment Variables

The Edge Function needs these Supabase secrets:

```bash
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
```

**To check/set:**
1. Go to Supabase Dashboard
2. **Project Settings** → **Edge Functions**
3. Verify `STRIPE_SECRET_KEY` is set

**To add missing secret:**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
```

## Common Issues & Solutions

### Issue 1: "Failed to load subscription details"

**Cause:** Edge Function not deployed or failed to deploy

**Fix:**
```bash
supabase functions deploy get-subscription-details
```

### Issue 2: 404 Not Found

**Cause:** Function doesn't exist at that URL

**Fix:**
1. Verify function is deployed: `supabase functions list`
2. Check the URL in browser console matches your Supabase URL
3. Redeploy if needed

### Issue 3: 401 Unauthorized

**Cause:** Authentication token is missing or invalid

**Fix:**
1. Make sure user is logged in
2. Try logging out and back in
3. Check that session exists before calling function

### Issue 4: Shows Loading Forever

**Cause:** Request is failing silently

**Fix:**
1. Check browser console for errors
2. Check Network tab for failed requests
3. Add error handling logging:

```javascript
// In UserSettings.jsx, add this in the catch block:
console.error('Detailed error:', error);
console.error('Error stack:', error.stack);
```

### Issue 5: "No subscription details available"

**Cause:** User/company doesn't have a Stripe subscription

**Fix:**
1. Check `companies` table for `stripe_subscription_id`
2. If empty, user needs to complete registration with payment
3. If populated, check Stripe Dashboard to verify subscription exists

## Step-by-Step Deployment Checklist

- [ ] Navigate to project directory: `cd /home/user/myaerodeal`
- [ ] Ensure Supabase CLI is installed: `supabase --version`
- [ ] Link to your project (if not already): `supabase link`
- [ ] Deploy the function: `supabase functions deploy get-subscription-details`
- [ ] Verify deployment in Supabase Dashboard
- [ ] Set Stripe secret if not already set
- [ ] Test function in Supabase Dashboard
- [ ] Refresh Settings page in app
- [ ] Check browser console for errors
- [ ] Verify subscription details appear

## Quick Test Script

Run this in your browser console when on the Settings page:

```javascript
// Test if function is accessible
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
console.log('Supabase URL:', supabaseUrl);
console.log('Function URL:', `${supabaseUrl}/functions/v1/get-subscription-details`);

// Check if user has session
supabase.auth.getSession().then(({ data }) => {
  console.log('Has session:', !!data.session);
  console.log('Access token:', data.session?.access_token?.substring(0, 20) + '...');
});

// Check company subscription
console.log('Company subscription ID:', currentUserProfile?.company?.stripe_subscription_id);
```

## Need More Help?

If none of the above works:

1. **Share these details:**
   - Browser console errors (screenshot)
   - Network tab showing the request (screenshot)
   - Edge Function logs from Supabase
   - Result of `supabase functions list`

2. **Check that:**
   - ✅ You've deployed the function
   - ✅ User is logged in
   - ✅ User has completed payment flow
   - ✅ Stripe secret key is set
   - ✅ Company has `stripe_subscription_id` in database

3. **Last resort - Redeploy everything:**
   ```bash
   supabase functions deploy
   ```

---

**Most Common Fix:** Just deploy the Edge Function:
```bash
supabase functions deploy get-subscription-details
```

Then refresh your Settings page!
