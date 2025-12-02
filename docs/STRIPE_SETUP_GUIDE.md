# Stripe Setup Guide for MyAeroDeal

This guide will help you set up Stripe payment integration for your CRM.

---

## 🎯 What We're Building

**Before Stripe:**
- User registers → Waits for admin approval → Gets access

**After Stripe:**
- User registers → Pays $99/month → Instant access ✨

---

## Step 1: Create Stripe Account

1. Go to: https://stripe.com
2. Click **"Sign up"**
3. Fill in your business details
4. Complete verification (may take 1-2 days for full approval)
5. **Start in Test Mode** - You can test everything before going live

---

## Step 2: Get Your API Keys

### Test Mode Keys (for development):

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

3. Add to your `.env` file:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

4. Add to Vercel environment variables:
   - Go to: https://vercel.com/your-project/settings/environment-variables
   - Add `VITE_STRIPE_PUBLISHABLE_KEY`
   - Add `VITE_STRIPE_PRICE_ID` (we'll get this next)

---

## Step 3: Create a Product and Price

1. **Go to Products:**
   - https://dashboard.stripe.com/test/products

2. **Click "Add product"**

3. **Fill in details:**
   ```
   Name: MyAeroDeal CRM Subscription
   Description: Professional CRM for Business Jet Brokers
   ```

4. **Set Pricing:**
   - **Pricing model:** Standard pricing
   - **Price:** $99.00 USD
   - **Billing period:** Monthly
   - **Payment type:** Recurring

5. **Click "Save product"**

6. **Copy the Price ID:**
   - Look for the price ID (starts with `price_`)
   - Example: `price_1ABC123xyz`
   - Copy this to your `.env` file:
   ```env
   VITE_STRIPE_PRICE_ID=price_your_price_id_here
   ```

---

## Step 4: Set Up Webhook for Production

### What is a Webhook?
A webhook lets Stripe notify your app when a payment succeeds, so you can automatically approve the company.

### Create Webhook Endpoint:

1. **Go to Webhooks:**
   - https://dashboard.stripe.com/test/webhooks

2. **Click "Add endpoint"**

3. **Enter your endpoint URL:**
   ```
   https://your-project.supabase.co/functions/v1/stripe-webhook
   ```

   Replace `your-project` with your actual Supabase project ID.

4. **Select events to listen to:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. **Click "Add endpoint"**

6. **Copy Webhook Signing Secret:**
   - Click on your webhook
   - Copy the **Signing secret** (starts with `whsec_`)
   - You'll need this for your Supabase Edge Function

---

## Step 5: Update Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Add Stripe columns to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer
ON companies(stripe_customer_id);

-- Create payments table (optional, for tracking)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_company ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
```

---

## Step 6: Test with Test Cards

Stripe provides test card numbers:

### Successful Payment:
```
Card: 4242 4242 4242 4242
Exp: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Declined Payment:
```
Card: 4000 0000 0000 0002
```

### More test cards: https://stripe.com/docs/testing

---

## Step 7: Go Live (When Ready)

### Switch to Production Mode:

1. **Get Production Keys:**
   - https://dashboard.stripe.com/apikeys
   - Copy **Live** keys (start with `pk_live_` and `sk_live_`)

2. **Update Environment Variables:**
   - Update `.env` with live keys
   - Update Vercel environment variables with live keys

3. **Create Production Product:**
   - Same as test, but in live mode

4. **Create Production Webhook:**
   - Same URL, but in live mode
   - Get new signing secret

5. **Update Bank Account:**
   - Add your bank account in Stripe dashboard
   - This is where payments will be deposited

---

## 💰 Pricing Recommendations

### Suggested Pricing Tiers:

**Tier 1: Starter - $49/month**
- 1 user
- Up to 25 leads
- Up to 10 aircraft
- Basic AI features

**Tier 2: Professional - $99/month** (Recommended)
- Up to 5 users
- Unlimited leads & aircraft
- Full AI features
- Priority support

**Tier 3: Enterprise - $299/month**
- Unlimited users
- Unlimited everything
- Dedicated support
- Custom integrations

---

## 🔐 Security Checklist

- [ ] Never commit API keys to Git (they're in .gitignore ✅)
- [ ] Use environment variables for all secrets
- [ ] Always verify webhook signatures
- [ ] Use HTTPS only (Vercel provides this ✅)
- [ ] Test thoroughly in test mode before going live

---

## 📊 Monitoring

### Stripe Dashboard Features:

1. **Payments:** See all transactions
2. **Customers:** View customer list
3. **Subscriptions:** Active/cancelled subscriptions
4. **Failed Payments:** Retry or contact customers
5. **Reports:** Revenue, MRR, churn rate

---

## 🆘 Troubleshooting

### "Payment requires authentication"
- This is 3D Secure (SCA)
- Stripe Checkout handles this automatically
- Make sure you're using the latest Stripe.js

### "Webhook not receiving events"
- Check endpoint URL is correct
- Verify webhook signing secret
- Check Supabase Edge Function logs

### "Customer already exists"
- Use `customer_email` in session creation
- Stripe will find or create customer

---

## 📚 Resources

- **Stripe Docs:** https://stripe.com/docs
- **Stripe Checkout:** https://stripe.com/docs/payments/checkout
- **Webhooks Guide:** https://stripe.com/docs/webhooks
- **Test Cards:** https://stripe.com/docs/testing

---

## ✅ Quick Start Checklist

- [ ] Create Stripe account
- [ ] Get test API keys
- [ ] Create product ($99/month subscription)
- [ ] Copy Price ID
- [ ] Add keys to .env file
- [ ] Update database schema
- [ ] Test with test card (4242 4242 4242 4242)
- [ ] Verify company approved after payment

---

Need help? Check the Stripe dashboard logs or Edge Function logs in Supabase!
