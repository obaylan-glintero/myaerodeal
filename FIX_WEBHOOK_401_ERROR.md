# Fix Webhook 401 Error - Missing Authorization Header

## The Problem

Stripe is sending webhooks directly to Supabase, but getting 401 error:
```json
{
  "code": 401,
  "message": "Missing authorization header"
}
```

## Why This Happens

Supabase Edge Functions require authentication when called externally. Stripe webhooks use **signature verification** (not Authorization headers), so they fail.

## The Solution

Use your **Vercel proxy** which adds the required Authorization header.

### Step 1: Update Stripe Webhook URL

**Current (Wrong):**
```
https://abcdefgh.supabase.co/functions/v1/stripe-webhook
```

**Correct:**
```
https://your-domain.vercel.app/api/stripe-webhook
```

**To update:**
1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **...** (three dots) → **Update details**
4. Change URL to your Vercel URL
5. Click **Update endpoint**

### Step 2: Ensure Vercel Environment Variables

Make sure these are set in Vercel:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Verify these exist:
   ```
   VITE_SUPABASE_URL=https://yourproject.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ... (your service role key)
   ```

3. If missing, add them:
   - Get values from Supabase Dashboard → Project Settings → API
   - Add to Vercel
   - Redeploy your app

### Step 3: Test Webhook

1. In Stripe Dashboard → Webhooks → Your endpoint
2. Click **Send test webhook**
3. Select `checkout.session.completed`
4. Click **Send test webhook**

**Expected result:** ✅ Success (200 OK)

## How It Works

```
Stripe
  ↓ (sends webhook with Stripe-Signature)
Your Vercel Domain
  ↓ (api/stripe-webhook.js receives it)
  ↓ (adds Authorization: Bearer SERVICE_ROLE_KEY)
Supabase Edge Function
  ↓ (verifies signature, processes webhook)
  ↓ (updates database)
✅ Done!
```

## Alternative: Make Supabase Function Public

If you don't want to use Vercel proxy, make the Edge Function public:

**Not recommended** because you lose the proxy layer, but if needed:

1. Supabase Dashboard → Edge Functions → stripe-webhook
2. Check if there's a setting to make it public
3. Or modify the function to not require auth (it already uses signature verification)

**But using Vercel proxy is better** because:
- ✅ Keeps Edge Function protected
- ✅ Adds extra logging layer
- ✅ Already set up and working

## Troubleshooting

### Error: "Configuration error"

**Cause:** Vercel doesn't have Supabase credentials

**Fix:** Add environment variables to Vercel (see Step 2)

### Error: "Invalid signature"

**Cause:** Webhook secret doesn't match

**Fix:**
1. Get signing secret from Stripe webhook configuration
2. Set in Supabase:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Webhook Succeeds but Database Not Updated

**Check Vercel logs:**
1. Vercel Dashboard → Your Project → **Logs**
2. Look for webhook requests
3. Check for errors in forwarding

**Check Supabase Edge Function logs:**
1. Supabase Dashboard → Edge Functions → stripe-webhook → **Logs**
2. Look for errors processing the webhook

## Quick Reference

### Correct Webhook URLs

| Environment | Webhook URL | Notes |
|------------|-------------|-------|
| Development (Local) | `http://localhost:3000/api/stripe-webhook` | Use ngrok for testing |
| Production (Vercel) | `https://your-domain.vercel.app/api/stripe-webhook` | ✅ Use this |
| Production (Custom Domain) | `https://myaerodeal.com/api/stripe-webhook` | If using custom domain |

### ❌ Don't Use These URLs

- `https://xxx.supabase.co/functions/v1/stripe-webhook` → Returns 401
- `https://xxx.vercel.app/functions/v1/stripe-webhook` → Wrong path

### ✅ Use This URL

- `https://xxx.vercel.app/api/stripe-webhook` → Correct!

## Verify It's Working

After updating webhook URL:

1. **Register new test user**
2. **Complete checkout**
3. **Check Stripe Dashboard:**
   - Webhooks → Your endpoint → **Events**
   - Should show 200 OK response
4. **Check database:**
   - Supabase → Table Editor → companies
   - Should have `stripe_subscription_id` and `stripe_customer_id`

If all green, you're done! 🎉

## Summary

**Problem:** Pointing Stripe directly to Supabase (requires auth)
**Solution:** Point Stripe to Vercel proxy (adds auth automatically)
**Result:** Webhooks work, database auto-updates!

---

**Quick Fix:**
1. Change Stripe webhook URL to: `https://YOUR-DOMAIN.vercel.app/api/stripe-webhook`
2. Test webhook in Stripe Dashboard
3. Should return 200 OK
4. Done!
