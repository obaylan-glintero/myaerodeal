# Stripe Production Setup Guide

This guide will help you switch from Stripe sandbox/test mode to production mode with two subscription tiers.

## Overview

Your application now supports two subscription plans with a 14-day free trial:
- **Monthly Plan**: $49/month (14-day free trial)
- **Annual Plan**: $499/year (14-day free trial, 15% savings)

All new users get a **14-day free trial** - they won't be charged until the trial period ends.

## Prerequisites

- Active Stripe account
- Access to Stripe Dashboard
- Access to Supabase project settings
- Access to your deployment platform (Vercel, etc.)

---

## Step 1: Switch to Stripe Production Mode

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Look for the toggle in the top-left corner
3. Switch from "Test mode" to "Production mode"
4. You'll see a warning - confirm the switch

---

## Step 2: Create Monthly Subscription Product

1. In Stripe Dashboard (Production mode), go to **Products**
2. Click **+ Add product**
3. Fill in the details:
   - **Name**: MyAeroDeal Monthly
   - **Description**: Monthly subscription to MyAeroDeal platform
   - **Pricing Model**: Standard pricing
   - **Price**: $49.00 USD
   - **Billing period**: Monthly
   - **Recurring**: Yes
4. Click **Save product**
5. **IMPORTANT**: Copy the **Price ID** (starts with `price_...`)
   - Example: `price_1A2B3C4D5E6F7G8H9I0J`
   - Save this for later

---

## Step 3: Create Annual Subscription Product

1. Still in **Products**, click **+ Add product** again
2. Fill in the details:
   - **Name**: MyAeroDeal Annual
   - **Description**: Annual subscription to MyAeroDeal platform (Save 15%)
   - **Pricing Model**: Standard pricing
   - **Price**: $499.00 USD
   - **Billing period**: Yearly
   - **Recurring**: Yes
3. Click **Save product**
4. **IMPORTANT**: Copy the **Price ID** (starts with `price_...`)
   - Example: `price_9J0I8H7G6F5E4D3C2B1A`
   - Save this for later

---

## Step 4: Get Your API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy the following keys:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`) - Click "Reveal test key token"

⚠️ **IMPORTANT**: Keep your Secret key confidential. Never commit it to version control.

---

## Step 5: Configure Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Set the endpoint URL:
   - For Vercel: `https://your-domain.vercel.app/api/stripe-webhook`
   - Or your custom domain: `https://yourdomain.com/api/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. **IMPORTANT**: Copy the **Signing secret** (starts with `whsec_...`)

---

## Step 6: Update Environment Variables

### Frontend Environment Variables (.env file)

Create or update your `.env` file:

```env
# Stripe Configuration (PRODUCTION)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_key_here
VITE_STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id_here
VITE_STRIPE_ANNUAL_PRICE_ID=price_your_annual_price_id_here
```

Replace the placeholder values with the actual keys you copied in previous steps.

### Supabase Edge Function Secrets

1. Go to your Supabase project
2. Navigate to **Project Settings** → **Edge Functions**
3. Add the following secrets:

```bash
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id_here
STRIPE_ANNUAL_PRICE_ID=price_your_annual_price_id_here
```

### Deployment Platform Environment Variables

If using Vercel:
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key

---

## Step 7: Deploy Updated Code

1. Commit your changes:
```bash
git add .
git commit -m "Switch to Stripe production with dual pricing"
git push
```

2. Your deployment platform should automatically redeploy
3. If not, trigger a manual deployment

---

## Step 8: Test the Production Setup

### Test Registration Flow

1. Go to your production website
2. Click "Sign Up" or "Request Access"
3. Fill in the registration form
4. Select either Monthly or Annual plan
5. Complete the Stripe checkout
6. Use a real credit card (you can cancel the subscription immediately after testing)
7. **Note**: The card won't be charged for 14 days (trial period)

### Verify in Stripe Dashboard

1. Go to **Customers** - you should see the new customer
2. Go to **Subscriptions** - you should see the active subscription
3. Go to **Payments** - you should see the payment

### Verify in Supabase

1. Go to your Supabase project
2. Navigate to **Table Editor** → **companies**
3. Find the company you just created
4. Verify that:
   - `approved` is `true`
   - `stripe_customer_id` is set
   - `stripe_subscription_id` is set
   - `subscription_status` is `active`

---

## Step 9: Test Webhook Delivery

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click on **Send test webhook**
4. Select `checkout.session.completed`
5. Verify that it shows as "Succeeded"

---

## Step 10: Cancel Test Subscription (Optional)

If you created a test subscription with a real card:

1. In Stripe Dashboard, go to **Subscriptions**
2. Find the test subscription
3. Click **Cancel subscription**
4. Choose "Cancel immediately" or "Cancel at period end"

---

## Troubleshooting

### Webhook Not Working

- Verify the webhook URL is correct
- Check that the webhook secret matches in Supabase
- Review webhook logs in Stripe Dashboard
- Check Vercel function logs

### Subscription Not Activating

- Check Supabase Edge Function logs
- Verify all environment variables are set correctly
- Ensure RLS policies allow the webhook to update companies table

### Price Not Found Error

- Verify the Price IDs are correct
- Make sure you're using Production Price IDs, not Test ones
- Check that environment variables are deployed

---

## Security Checklist

- [ ] Secret key is stored securely (not in code)
- [ ] Webhook signature is being verified
- [ ] Using HTTPS for all endpoints
- [ ] Environment variables are set on server only
- [ ] Test mode toggle is disabled in production

---

## Pricing Summary

| Plan | Price | Trial Period | Billing | Monthly Equivalent | Savings |
|------|-------|--------------|---------|-------------------|---------|
| Monthly | $49 | 14 days free | Monthly | $49/month | - |
| Annual | $499 | 14 days free | Yearly | $41.58/month | 15% |

**Trial Period Details:**
- All subscriptions include a 14-day free trial
- Users provide payment details upfront but aren't charged until trial ends
- Full access to all features during the trial
- Users can cancel anytime during the trial without being charged

---

## Support

If you encounter issues:
1. Check Stripe Dashboard logs
2. Check Supabase Edge Function logs
3. Check your deployment platform logs
4. Verify all environment variables are set
5. Test webhook delivery in Stripe Dashboard

---

**✅ You're all set!** Your Stripe production integration is now live with dual pricing.
