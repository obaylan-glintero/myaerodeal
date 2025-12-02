# Setup Stripe Webhook for Auto-Approval

## 🎯 What the Webhook Does:
When a user completes payment in Stripe, the webhook automatically:
- Approves the company (sets `approved = true`)
- Sets subscription status to 'active'
- Saves Stripe customer ID and subscription ID
- User can login immediately - no manual approval needed!

---

## 📝 Step-by-Step Setup:

### 1. Go to Stripe Webhooks Dashboard
https://dashboard.stripe.com/test/webhooks

### 2. Click "Add endpoint"

### 3. Enter your webhook URL:
```
https://dpqjgogloaokggvafrsw.supabase.co/functions/v1/stripe-webhook
```

**Your Project Reference:** `dpqjgogloaokggvafrsw`

### 4. Select events to listen to:
Check these events:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### 5. Click "Add endpoint"

### 6. Copy the Signing Secret
- After creating the webhook, click on it
- Look for **"Signing secret"** (starts with `whsec_`)
- Click "Reveal" and copy it

### 7. Set the Signing Secret in Supabase
Run this command in your terminal:
```bash
cd /Users/onurbaylan/Desktop/MyAeroDeal
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

Replace `whsec_your_secret_here` with your actual signing secret.

### 8. Verify the Secret is Set
```bash
npx supabase secrets list
```

Should show:
- STRIPE_SECRET_KEY
- STRIPE_PRICE_ID
- STRIPE_WEBHOOK_SECRET ✅

---

## ✅ Test the Webhook

### Option 1: Make a test payment
1. Register a new user
2. Complete payment with test card (4242 4242 4242 4242)
3. Check Stripe Dashboard → Webhooks → Recent deliveries
4. Should show successful delivery

### Option 2: Send test webhook from Stripe
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Select event: `checkout.session.completed`
5. Click "Send test webhook"
6. Check for success (200 response)

---

## 🐛 View Webhook Logs

To see what's happening in the webhook:
```bash
npx supabase functions logs stripe-webhook --tail
```

This shows real-time logs when webhooks fire.

---

## 🔍 Verify Company Auto-Approval

After a successful payment, check the database:
```sql
SELECT
  id,
  name,
  email,
  approved,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status
FROM companies
WHERE email = 'user@example.com';
```

Should show:
- approved: `true` ✅
- stripe_customer_id: `cus_...`
- stripe_subscription_id: `sub_...`
- subscription_status: `active`

---

## 📌 Important Notes:

- **Test mode webhook** only works with test payments
- **Production webhook** needs separate setup for live mode
- Webhook secret is different for test vs live mode
- Keep signing secret secure (never commit to Git)

---

## ✅ Webhook Setup Complete When:

- [ ] Webhook endpoint created in Stripe
- [ ] 6 events selected
- [ ] Signing secret copied
- [ ] Secret set in Supabase: `STRIPE_WEBHOOK_SECRET`
- [ ] Test payment auto-approves company
- [ ] User can login immediately after payment

---

**Set up the webhook, then test a payment!** 🎉
