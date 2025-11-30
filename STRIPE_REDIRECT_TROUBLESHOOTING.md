# Stripe Redirect Troubleshooting Guide

If you're experiencing issues where the registration gets stuck at "Redirecting to payment..." and doesn't redirect to Stripe, follow this guide to diagnose and fix the problem.

## Symptoms

- Registration form submits successfully
- Page shows "Redirecting to payment..." message
- User gets stuck on this screen
- No redirect to Stripe happens
- After page reload, user is logged in to the app

## Quick Fix: Clear Stuck State

If you're currently stuck:

1. Open browser Developer Tools (F12 or Cmd+Option+I on Mac)
2. Go to Console tab
3. Run this command:
   ```javascript
   sessionStorage.removeItem('payment_redirect_pending');
   window.location.reload();
   ```

This will clear the stuck state and let you access the app.

---

## Diagnostic Steps

### Step 1: Check Browser Console

1. Open Developer Tools (F12)
2. Go to Console tab
3. Try to register again
4. Look for error messages

**What to look for:**
- ❌ Red error messages
- Look for messages starting with "❌"
- Look for "Failed to create checkout session"
- Look for "Network error"
- Look for "Missing Supabase configuration"

**Common Console Errors:**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Missing Supabase configuration" | Environment variables not set | Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY |
| "Failed to create checkout session (400)" | Edge Function error | Check Edge Function logs in Supabase |
| "Failed to create checkout session (404)" | Edge Function not deployed | Deploy create-checkout-session function |
| "No checkout URL returned" | Stripe price IDs not configured | Set Stripe environment variables |
| "Network error" | Can't reach Edge Function | Check Supabase URL and network |

### Step 2: Verify Environment Variables

Check that these are set in your deployment:

#### Frontend (.env or deployment platform)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
VITE_STRIPE_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_ANNUAL_PRICE_ID=price_...
```

**How to verify in browser:**
1. Open Developer Tools Console
2. Run:
   ```javascript
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
   console.log('Has Stripe Key:', !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
   console.log('Monthly Price ID:', import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID);
   console.log('Annual Price ID:', import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID);
   ```

If any show `undefined`, those variables aren't set!

#### Supabase Edge Function Secrets

In Supabase Dashboard → Project Settings → Edge Functions, verify these are set:
```bash
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...
```

### Step 3: Check Edge Function Deployment

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Verify `create-checkout-session` is listed
4. Check deployment status (should show green checkmark)

**Not deployed?** Run:
```bash
supabase functions deploy create-checkout-session
```

### Step 4: Test Edge Function Directly

1. Go to Supabase Dashboard → Edge Functions
2. Click on `create-checkout-session`
3. Click "Invoke function"
4. Use this test payload:
   ```json
   {
     "plan": "monthly"
   }
   ```
5. Check the response

**Expected response:**
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

**If you get an error:**
- Check the error message in function logs
- Verify Stripe secret key is set correctly
- Verify price IDs are set correctly

### Step 5: Check Stripe Configuration

1. Log into Stripe Dashboard
2. Make sure you're in the correct mode (Test or Production)
3. Go to Products
4. Verify your subscription products exist
5. Copy the Price IDs (start with `price_`)
6. Make sure they match your environment variables

### Step 6: Check Network

1. Open Developer Tools → Network tab
2. Try to register again
3. Look for a request to `create-checkout-session`
4. Click on it to see details

**What to check:**
- Request Status: Should be 200 OK
- Request Headers: Should include Authorization token
- Response: Should contain a `url` field

---

## Common Issues and Solutions

### Issue 1: "No active session" Error

**Cause:** Email confirmation is enabled in Supabase

**Solution:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Enable email confirmations"
3. Disable it for easier testing (or set up SMTP for production)

### Issue 2: Edge Function Returns 400 Error

**Cause:** Missing or invalid Stripe configuration

**Solution:**
1. Check Edge Function logs in Supabase
2. Verify `STRIPE_SECRET_KEY` is set correctly
3. Verify price IDs match actual Stripe products
4. Make sure you're using the right mode (test vs production)

### Issue 3: Edge Function Returns 401 Error

**Cause:** Authentication issue

**Solution:**
1. User session might have expired during registration
2. Try clearing browser cache and cookies
3. Check that `SUPABASE_ANON_KEY` is set in Edge Function invocation

### Issue 4: Redirect Happens But Stripe Shows Error

**Cause:** Stripe checkout session configuration issue

**Solution:**
1. Check that success_url and cancel_url are accessible
2. Verify price IDs exist in Stripe
3. Check that trial period is compatible with price settings

### Issue 5: User Created But No Company/Profile

**Cause:** Database operation failed partway through

**Solution:**
1. Check Supabase logs for database errors
2. Verify RLS policies allow inserts
3. Check that all required columns exist in tables

---

## Testing Checklist

Before going live, test this flow:

- [ ] Can successfully access registration page
- [ ] Can fill out registration form
- [ ] Can select a plan (Monthly or Annual)
- [ ] Form submits without errors
- [ ] Console shows "✅ Session found, access_token available"
- [ ] Console shows "📞 Calling Edge Function"
- [ ] Console shows "📨 Edge Function response status: 200"
- [ ] Console shows "✅ Redirecting to Stripe"
- [ ] Browser redirects to checkout.stripe.com
- [ ] Stripe checkout page loads correctly
- [ ] Can complete payment (test mode)
- [ ] After payment, redirects to /payment-success
- [ ] User can access the app

---

## Still Stuck?

If you've tried everything above:

1. **Check all logs:**
   - Browser console
   - Supabase Edge Function logs
   - Stripe Dashboard → Events
   - Your deployment platform logs (Vercel, etc.)

2. **Test in incognito mode:**
   - Rules out browser extension issues
   - Fresh state with no cached data

3. **Test with different plan:**
   - Try Monthly instead of Annual (or vice versa)
   - Helps identify if it's plan-specific

4. **Verify Stripe webhook is NOT interfering:**
   - This shouldn't affect checkout creation
   - But check Stripe Dashboard → Webhooks for errors

5. **Clear everything and start fresh:**
   ```javascript
   // In browser console
   sessionStorage.clear();
   localStorage.clear();
   location.reload();
   ```

---

## Getting Help

When asking for help, provide:

1. **Browser console logs** (copy all red errors)
2. **Network tab screenshot** showing the checkout session request
3. **Edge Function logs** from Supabase
4. **Environment variables** you've set (hide actual keys!)
5. **Stripe Dashboard** - which mode you're using

---

## Preventive Measures

To avoid this issue:

1. ✅ Always set environment variables before deploying
2. ✅ Test Edge Functions in Supabase Dashboard before testing frontend
3. ✅ Use Stripe test mode first, then switch to production
4. ✅ Check browser console regularly during development
5. ✅ Keep Edge Function logs open while testing

---

**Last Updated:** 2024-11-30
