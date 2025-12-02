# Supabase Edge Functions Deployment Guide

This guide explains how to deploy the Stripe payment Edge Functions to Supabase.

---

## 📋 Prerequisites

- Supabase CLI installed
- Supabase project created
- Stripe account with API keys

---

## Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase

# Verify installation
supabase --version
```

---

## Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate.

---

## Step 3: Link to Your Project

```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Find your project ref at:
# https://app.supabase.com/project/YOUR_PROJECT/settings/general
```

---

## Step 4: Set Environment Secrets

The Edge Functions need these environment variables:

```bash
# Set Stripe Secret Key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Set Stripe Price ID
supabase secrets set STRIPE_PRICE_ID=price_your_price_id_here

# Set Stripe Webhook Secret (get this after creating webhook)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Verify secrets are set
supabase secrets list
```

---

## Step 5: Deploy Edge Functions

```bash
# Deploy create-checkout-session function
supabase functions deploy create-checkout-session

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook
```

---

## Step 6: Get Function URLs

After deployment, your functions will be available at:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-checkout-session
https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

---

## Step 7: Configure Stripe Webhook

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/test/webhooks

2. **Click "Add endpoint"**

3. **Enter your webhook URL:**
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```

4. **Select events to listen to:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. **Copy Webhook Signing Secret**
   - After creating the webhook, copy the signing secret (starts with `whsec_`)
   - Set it as an environment secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

---

## Step 8: Test Edge Functions

### Test create-checkout-session:

```bash
# Get your anon key from Supabase dashboard
# Get a user auth token (you'll need to be logged in)

curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-checkout-session \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "apikey: YOUR_ANON_KEY"
```

### Test webhook (from Stripe dashboard):

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook
3. Click "Send test webhook"
4. Select `checkout.session.completed`
5. Check Edge Function logs for processing

---

## Step 9: View Function Logs

```bash
# View logs for create-checkout-session
supabase functions logs create-checkout-session

# View logs for stripe-webhook
supabase functions logs stripe-webhook

# Follow logs in real-time
supabase functions logs create-checkout-session --tail
```

---

## 🔒 Required Environment Variables Summary

| Variable | Where to Get It | Purpose |
|----------|----------------|---------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys | Authenticates with Stripe API |
| `STRIPE_PRICE_ID` | Stripe Dashboard → Products → Your product | Specifies which product/price to charge |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → Your endpoint | Verifies webhook authenticity |
| `SUPABASE_URL` | Auto-provided | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Auto-provided | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided | Admin key for webhook |

---

## 🐛 Troubleshooting

### Function deployment fails:

```bash
# Check for syntax errors
deno check supabase/functions/create-checkout-session/index.ts

# Check function status
supabase functions list
```

### Webhook not working:

1. **Check webhook is receiving events:**
   - Stripe Dashboard → Webhooks → Your endpoint → "Recent deliveries"

2. **Check function logs:**
   ```bash
   supabase functions logs stripe-webhook
   ```

3. **Verify webhook secret is set:**
   ```bash
   supabase secrets list
   ```

### "No authorization header" error:

- Make sure you're sending the user's auth token in the Authorization header
- Token format: `Bearer eyJ...`

---

## 🔄 Update Functions

If you make changes to the Edge Functions:

```bash
# Redeploy specific function
supabase functions deploy create-checkout-session

# Redeploy all functions
supabase functions deploy
```

---

## 📊 Monitoring

### Check function invocations:

1. Go to: https://app.supabase.com/project/YOUR_PROJECT/functions
2. Click on function name
3. View invocations, errors, and logs

### Set up alerts:

- Configure email alerts for function errors
- Monitor webhook delivery success rate in Stripe

---

## ✅ Deployment Checklist

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Project linked
- [ ] Environment secrets set (STRIPE_SECRET_KEY, STRIPE_PRICE_ID)
- [ ] create-checkout-session deployed
- [ ] stripe-webhook deployed
- [ ] Stripe webhook endpoint created
- [ ] Webhook secret set
- [ ] Webhook events selected
- [ ] Functions tested
- [ ] Logs verified

---

## 🚀 Ready to Test

Once all steps are complete, you can test the complete flow:

1. Register a new company
2. Redirected to Stripe checkout
3. Complete payment (use test card: 4242 4242 4242 4242)
4. Webhook fires and approves company
5. User can login immediately

---

Need help? Check the Supabase Edge Functions docs: https://supabase.com/docs/guides/functions
