# Fix 404 Redirect After Stripe Payment

## 🔍 Diagnose the Issue

### 1. Check what URL Stripe is redirecting to:

After you complete a test payment and get the 404, look at the browser address bar. What URL is it trying to reach?

**Possible URLs:**
- ❌ `www.myaerodeal.com/payment-success` - Wrong (custom domain)
- ❌ `https://myaerodeal.com/payment-success` - Wrong (custom domain)
- ✅ `https://myaerodeal.vercel.app/payment-success` - Correct (Vercel domain)
- ✅ `http://localhost:5173/payment-success` - Correct (local)

---

## 🔧 Fix #1: Check Vercel Deployment

Make sure your app is deployed to Vercel with the `/payment-success` route:

1. Go to: https://myaerodeal.vercel.app
2. Try accessing: https://myaerodeal.vercel.app/payment-success
3. Should show the "Payment Successful!" page

If you get 404 here, wait for Vercel deployment to complete (2-3 min).

---

## 🔧 Fix #2: Update Edge Function URL Logic

If Stripe is redirecting to the wrong domain, we need to fix the Edge Function.

**Check Edge Function logs:**
```bash
npx supabase functions logs create-checkout-session --tail
```

Look for this log line:
```
Origin: ... Using baseUrl: ...
```

It should show:
- If testing locally: `http://localhost:3002` or `http://localhost:5173`
- If testing production: `https://myaerodeal.vercel.app`

If it shows `www.myaerodeal.com` or just `myaerodeal.com`, that's the problem.

---

## 🔧 Fix #3: Manually Set Correct URL

Let's update the Edge Function to explicitly use the correct URL:

**Option A: For local testing:**
Keep using: `http://localhost:5173`

**Option B: For production testing:**
Use Vercel URL explicitly: `https://myaerodeal.vercel.app`

---

## 🧪 Test the Fix:

1. **Clean up previous test data:**
```sql
-- Delete test companies/users
DELETE FROM companies WHERE email = 'your-test-email@example.com';
DELETE FROM profiles WHERE email = 'your-test-email@example.com';
DELETE FROM auth.users WHERE email = 'your-test-email@example.com';
```

2. **Register again** with a fresh email

3. **Complete payment** with test card

4. **Should redirect to:**
   - Local: `http://localhost:5173/payment-success`
   - Production: `https://myaerodeal.vercel.app/payment-success`

5. **Should show:** "Payment Successful!" page with auto-redirect countdown

---

## 🔍 Check Stripe Checkout Session

To see what URLs Stripe is using:

1. Go to: https://dashboard.stripe.com/test/payments
2. Click on your recent payment
3. Look for "Checkout Session"
4. Check "Success URL" and "Cancel URL"

These should match your app's domain (Vercel URL).

---

## 📋 Current Configuration:

**Your Vercel URL:** `https://myaerodeal.vercel.app`
**Payment Success URL:** `https://myaerodeal.vercel.app/payment-success`
**Payment Cancel URL:** `https://myaerodeal.vercel.app/payment-cancel`

**Your Custom Domain:** `www.myaerodeal.com` (if configured)
- Custom domain might not have the routes configured properly
- Always use Vercel URL for testing

---

## ✅ When It's Working:

After payment completion:
1. ✅ Redirects to correct domain
2. ✅ Shows "Payment Successful!" page
3. ✅ Auto-redirects to dashboard after 5 seconds
4. ✅ User can login immediately
5. ✅ Company is approved in database

---

## 🆘 Still Getting 404?

Tell me:
1. What exact URL is showing in the browser when you get 404?
2. Are you testing locally or on production?
3. What do the Edge Function logs show? (`npx supabase functions logs create-checkout-session`)

This will help me pinpoint the exact issue!
