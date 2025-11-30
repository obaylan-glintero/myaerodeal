# Deploy Subscription Details Edge Function

## Quick Steps to Deploy

### Option 1: Using Supabase CLI (Recommended)

**Prerequisites:**
- Supabase CLI installed
- Logged into Supabase CLI
- Project linked

**Steps:**

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Navigate to your project:**
   ```bash
   cd /home/user/myaerodeal
   ```

3. **Login to Supabase** (if not already logged in):
   ```bash
   supabase login
   ```

4. **Link your project** (if not already linked):
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

   Find your project ref in Supabase Dashboard → Project Settings → General

5. **Deploy the function:**
   ```bash
   supabase functions deploy get-subscription-details
   ```

   **Expected output:**
   ```
   Deploying get-subscription-details...
   Bundled get-subscription-details in 234ms
   Deployed get-subscription-details in 1.2s
   ```

### Option 2: Using Supabase Dashboard (Manual Upload)

1. Go to **Supabase Dashboard** → Your Project
2. Click **Edge Functions** in left sidebar
3. Click **Deploy a new function**
4. Name: `get-subscription-details`
5. Copy and paste the code from:
   `/home/user/myaerodeal/supabase/functions/get-subscription-details/index.ts`
6. Click **Deploy function**

## Verify Deployment

### Step 1: Check Function List

In Supabase Dashboard:
1. Go to **Edge Functions**
2. You should see **get-subscription-details** in the list
3. Status should show green checkmark

### Step 2: Test the Function

1. In Supabase Dashboard, click on **get-subscription-details**
2. Click **Invoke function** button
3. Leave request body empty (it uses auth from headers)
4. Click **Run**

**Expected Response (if you have a subscription):**
```json
{
  "hasSubscription": true,
  "subscription": {
    "id": "sub_...",
    "status": "trialing",
    "current_period_start": 1234567890,
    "current_period_end": 1234567890,
    "trial_end": 1234567890,
    "plan": {
      "amount": 4900,
      "currency": "usd",
      "interval": "month"
    },
    "paymentMethod": {
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      }
    }
  },
  "upcomingInvoice": {
    "amount_due": 4900,
    "currency": "usd",
    "next_payment_attempt": 1234567890
  },
  "customerEmail": "user@example.com"
}
```

### Step 3: Test in Your App

1. Open your app
2. Go to **Settings** page (⚙️ icon)
3. Open browser console (F12)
4. Refresh the page
5. Check for errors

**What you should see:**
- Loading spinner appears briefly
- **Subscription & Billing** section appears
- Current plan details displayed
- Payment method shown
- Trial information (if in trial)

## Troubleshooting

### Error: "Failed to load subscription details"

**Check browser console for specific error:**

#### 404 Not Found
**Cause:** Function not deployed
**Fix:** Deploy the function using steps above

#### 401 Unauthorized
**Cause:** Authentication issue
**Fix:**
- Log out and log back in
- Clear browser cache
- Check that user is logged in

#### 500 Internal Server Error
**Cause:** Function error (check function logs)
**Fix:**
1. Go to Supabase Dashboard → Edge Functions → get-subscription-details
2. Click **Logs** tab
3. Look for error messages
4. Common issues:
   - `STRIPE_SECRET_KEY` not set → Add it to Supabase secrets
   - Invalid subscription ID → Check companies table
   - Stripe API error → Verify Stripe key is correct

### Error: "No subscription details available"

**Possible causes:**

1. **User doesn't have a subscription in database**
   - Check Supabase → Table Editor → companies
   - Look for `stripe_subscription_id` field
   - Should have a value starting with `sub_`
   - If empty, user needs to complete payment flow

2. **Subscription exists but not linked to company**
   - Check Stripe Dashboard for the subscription
   - Note the subscription ID
   - Update companies table with correct `stripe_subscription_id`

3. **Subscription exists in Stripe but not accessible**
   - Verify `STRIPE_SECRET_KEY` in Supabase secrets
   - Make sure it's the production key (sk_live_) if in production
   - Or test key (sk_test_) if in test mode

### Edge Function Logs Show Errors

**Check Stripe Secret Key:**

1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Check if `STRIPE_SECRET_KEY` is set
3. If missing, add it:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
   ```

**Verify Subscription in Stripe:**

1. Go to Stripe Dashboard → Customers
2. Find your customer by email
3. Check they have an active subscription
4. Note the subscription ID
5. Compare with `stripe_subscription_id` in companies table

## Environment Variables Needed

### Supabase Edge Function Secrets

```bash
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
```

**To set:**
```bash
supabase secrets set STRIPE_SECRET_KEY=your_actual_key
```

**To verify:**
```bash
supabase secrets list
```

## Complete Deployment Checklist

- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Logged into CLI (`supabase login`)
- [ ] Project linked (`supabase link`)
- [ ] STRIPE_SECRET_KEY set in Supabase secrets
- [ ] Function deployed (`supabase functions deploy get-subscription-details`)
- [ ] Function visible in Supabase Dashboard
- [ ] Function tested in Dashboard (returns subscription data)
- [ ] Settings page shows subscription details
- [ ] Browser console shows no errors

## Still Not Working?

### Debug Checklist

1. **Open browser console (F12) on Settings page**
   - Look for network request to `get-subscription-details`
   - Check status code (should be 200)
   - Check response data

2. **Check Supabase function logs**
   - Dashboard → Edge Functions → get-subscription-details → Logs
   - Look for error messages

3. **Verify data in database**
   ```sql
   SELECT
     id,
     name,
     stripe_subscription_id,
     stripe_customer_id,
     subscription_status
   FROM companies
   WHERE stripe_subscription_id IS NOT NULL;
   ```

4. **Test Stripe connection**
   - Use Stripe Dashboard to verify subscription exists
   - Check that subscription ID matches database

### Get Help

If still not working, provide:
- [ ] Screenshot of browser console errors
- [ ] Screenshot of Edge Function logs
- [ ] Output of `supabase functions list`
- [ ] Confirmation that subscription exists in Stripe
- [ ] Value of `stripe_subscription_id` from companies table

---

**Most Common Solution:** Just deploy the function and refresh:

```bash
supabase functions deploy get-subscription-details
```

Then refresh your Settings page in the browser!
