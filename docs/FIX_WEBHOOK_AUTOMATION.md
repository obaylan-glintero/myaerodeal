# Fix Automatic Stripe Webhook Integration

Your webhook code is correct, but it's not firing. This guide will fix it so subscription IDs are automatically added to the database.

## The Problem

When users complete payment:
1. ✅ Stripe creates subscription
2. ❌ Webhook doesn't fire (or fails)
3. ❌ Database doesn't get updated
4. ❌ You have to manually add IDs

**After this fix:** Everything happens automatically!

## Step 1: Check Webhook Endpoint

Your webhook should be accessible at one of these URLs:

**Option A: Direct Supabase Edge Function**
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

**Option B: Via Vercel Proxy** (if deployed on Vercel)
```
https://your-domain.vercel.app/api/stripe-webhook
```

### Test if Endpoint is Accessible

Run this in your terminal:

```bash
# Replace with your actual URL
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Expected response:** `No signature` (400 error) - This is good! It means the endpoint exists.

**Bad response:** `404 Not Found` - Endpoint doesn't exist, need to deploy.

## Step 2: Deploy Webhook Function

```bash
cd /home/user/myaerodeal
supabase functions deploy stripe-webhook
```

**Verify deployment:**
```bash
supabase functions list
```

Should show `stripe-webhook` in the list.

## Step 3: Set Webhook Secret in Supabase

The webhook needs `STRIPE_WEBHOOK_SECRET` environment variable:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

**Where to get the secret:** We'll create it in Step 4.

## Step 4: Configure Webhook in Stripe Dashboard

### For Test Mode (Development)

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint** (or **+ Add an endpoint**)
3. Enter endpoint URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
4. Click **Select events**
5. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Click **Add endpoint**
7. **IMPORTANT:** Copy the **Signing secret** (starts with `whsec_test_`)
8. Save this secret - you'll need it!

### For Production Mode

**Repeat the same steps** but:
- Make sure you're in **Production** mode (toggle at top-left)
- Use production webhook URL
- Get the **production** signing secret (starts with `whsec_`)

## Step 5: Update Supabase Secrets

```bash
# For test mode
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx

# For production (when ready)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Verify it's set:**
```bash
supabase secrets list
```

Should show:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_MONTHLY_PRICE_ID
- STRIPE_ANNUAL_PRICE_ID

## Step 6: Test the Webhook

### Method 1: Send Test Event from Stripe

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **Send test webhook**
4. Select `checkout.session.completed`
5. Click **Send test webhook**

**Check the result:**
- ✅ **Succeeded** - Webhook is working!
- ❌ **Failed** - Check the error message

### Method 2: Test with Real Checkout

1. Do a real test registration in your app
2. Complete Stripe checkout
3. Check Stripe Dashboard → Webhooks → Your endpoint → **Events**
4. You should see `checkout.session.completed` event
5. Click on it to see delivery status

**If successful:**
- Check your Supabase companies table
- Should now have `stripe_subscription_id` and `stripe_customer_id`!

## Step 7: Check Edge Function Logs

If webhook fails, check logs:

1. Go to **Supabase Dashboard**
2. **Edge Functions** → **stripe-webhook**
3. Click **Logs** tab
4. Look for recent entries

**Common errors in logs:**

| Error | Cause | Fix |
|-------|-------|-----|
| "Webhook secret not configured" | Secret not set | Run `supabase secrets set STRIPE_WEBHOOK_SECRET=...` |
| "Invalid signature" | Wrong secret | Update secret with correct value from Stripe |
| "No company ID in session metadata" | Checkout session doesn't have company_id | Check create-checkout-session includes metadata |
| "Error updating company" | Database error | Check RLS policies, check company exists |

## Step 8: Verify Webhook is Working

### Complete Test Checklist

- [ ] Webhook endpoint deployed (`supabase functions list`)
- [ ] Webhook secret set in Supabase (`supabase secrets list`)
- [ ] Webhook configured in Stripe Dashboard
- [ ] Test event sent from Stripe shows "Succeeded"
- [ ] Edge Function logs show no errors
- [ ] Real registration test adds IDs to database automatically

### Test Registration Flow

1. Create new test user account
2. Complete Stripe checkout
3. **Immediately check Supabase companies table**
4. Should see:
   - ✅ `stripe_subscription_id` = `sub_xxxxx`
   - ✅ `stripe_customer_id` = `cus_xxxxx`
   - ✅ `subscription_status` = `trialing`
   - ✅ `approved` = `true`

**If IDs are automatically added:** ✅ Webhook is working!

**If IDs are still NULL:** ❌ Continue to troubleshooting below.

## Troubleshooting

### Issue 1: Webhook Shows "Failed" in Stripe

**Check Stripe webhook logs:**
1. Stripe Dashboard → Webhooks → Your endpoint
2. Click on failed event
3. Look at **Response** tab

**Common failures:**
- `500 Internal Server Error` → Check Edge Function logs
- `401 Unauthorized` → Authentication issue (but webhook uses signature, not auth)
- `Timeout` → Function taking too long
- `Invalid signature` → Wrong webhook secret

### Issue 2: Webhook Succeeds but Database Not Updated

**Check Edge Function logs:**
1. Supabase Dashboard → Edge Functions → stripe-webhook → Logs
2. Look for the event
3. Check for error messages

**Common causes:**
- Company ID not in metadata → Check create-checkout-session
- RLS policies blocking update → Webhook uses service role key (should work)
- Company doesn't exist → Registration flow didn't create company

### Issue 3: No Events Showing Up

**Webhook not configured correctly:**
- Verify URL is exactly: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
- Check you're in correct mode (test vs production)
- Ensure events are selected in webhook config

### Issue 4: Different Webhook Endpoint (Using Vercel)

If you're using the Vercel proxy (`/api/stripe-webhook`):

**Vercel proxy should forward to Supabase:**
```javascript
// api/stripe-webhook.js should forward to:
const response = await fetch(`${supabaseUrl}/functions/v1/stripe-webhook`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseKey}`,
    'Stripe-Signature': req.headers['stripe-signature'],
  },
  body: rawBody,
});
```

**Webhook URL in Stripe should be:**
```
https://your-domain.vercel.app/api/stripe-webhook
```

## Quick Fix: Manual Webhook Trigger

If webhook still not working but you need to fix current users:

**Option 1: Run SQL for Each User**

```sql
-- Get subscription details from Stripe first
-- Then update database:

UPDATE companies
SET
  stripe_subscription_id = 'sub_FROM_STRIPE',
  stripe_customer_id = 'cus_FROM_STRIPE',
  subscription_status = 'trialing',
  approved = true,
  subscription_start_date = NOW()
WHERE email = 'user@email.com';
```

**Option 2: Create Admin Script**

Create a one-time script to sync all Stripe subscriptions to database.

## Webhook Flow Diagram

```
User completes checkout
         ↓
Stripe creates subscription
         ↓
Stripe fires checkout.session.completed event
         ↓
Stripe sends POST to your webhook URL
         ↓
Your stripe-webhook Edge Function receives it
         ↓
Verifies signature with STRIPE_WEBHOOK_SECRET
         ↓
Extracts company_id from session.metadata
         ↓
Updates companies table with:
  - stripe_subscription_id
  - stripe_customer_id
  - subscription_status = 'active' or 'trialing'
  - approved = true
         ↓
User can now access app with subscription details!
```

## Production Checklist

Before going live, ensure:

- [ ] Webhook endpoint is publicly accessible
- [ ] Webhook configured in Stripe **Production** mode
- [ ] Production webhook secret set in Supabase
- [ ] Edge Function deployed to production
- [ ] All required events selected in webhook
- [ ] Test webhook delivery successful
- [ ] Test real checkout - IDs appear in database
- [ ] Webhook logs show no errors

## Monitoring Webhooks

**Set up alerts:**
1. Check webhook failures daily in Stripe Dashboard
2. Monitor Edge Function error rates in Supabase
3. Set up error notifications (Sentry, etc.)

**Regular checks:**
- Webhook delivery success rate (should be >99%)
- Average response time (should be <2 seconds)
- Failed events (investigate and retry)

---

## Summary

After completing this guide:

✅ Webhook automatically fires after checkout
✅ Database automatically updated with subscription IDs
✅ Users can access app immediately
✅ No manual intervention needed

**Most common fixes:**
1. Deploy webhook function: `supabase functions deploy stripe-webhook`
2. Set webhook secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx`
3. Configure webhook in Stripe Dashboard with correct URL
4. Test it!

---

**Need help?** Check Edge Function logs and Stripe webhook delivery logs to see exactly where it's failing.
