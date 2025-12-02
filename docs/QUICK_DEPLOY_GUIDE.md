# Quick Edge Functions Deployment Guide

## 🎯 Simple Copy-Paste Steps

Open your **Terminal** and run these commands one by one:

---

### Step 1: Login to Supabase

```bash
npx supabase login
```

This will open your browser. Click "Authorize" to login.

---

### Step 2: Find Your Project Reference

1. Go to: https://app.supabase.com/project/_/settings/general
2. Copy the **Reference ID** (looks like: `abcdefghijklmnop`)

---

### Step 3: Link Your Project

```bash
# Replace YOUR_PROJECT_REF with your actual reference ID
npx supabase link --project-ref YOUR_PROJECT_REF
```

Example:
```bash
npx supabase link --project-ref abcdefghijklmnop
```

---

### Step 4: Set Stripe Environment Secrets

Get your keys from Stripe Dashboard:
- Secret Key: https://dashboard.stripe.com/test/apikeys
- Price ID: https://dashboard.stripe.com/test/products (your product)

```bash
# Replace with your actual keys
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here
npx supabase secrets set STRIPE_PRICE_ID=price_your_price_id_here
```

---

### Step 5: Deploy Edge Functions

```bash
# Navigate to project directory
cd /Users/onurbaylan/Desktop/MyAeroDeal

# Deploy create-checkout-session function
npx supabase functions deploy create-checkout-session

# Deploy stripe-webhook function
npx supabase functions deploy stripe-webhook
```

---

### Step 6: Verify Deployment

```bash
# List deployed functions
npx supabase functions list

# Check secrets are set
npx supabase secrets list
```

You should see:
- ✅ create-checkout-session (deployed)
- ✅ stripe-webhook (deployed)
- ✅ STRIPE_SECRET_KEY (set)
- ✅ STRIPE_PRICE_ID (set)

---

### Step 7: Configure Stripe Webhook

1. **Go to Stripe Webhooks:**
   https://dashboard.stripe.com/test/webhooks

2. **Click "Add endpoint"**

3. **Enter your webhook URL:**
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```

   Replace `YOUR_PROJECT_REF` with your actual project reference.

4. **Select events to listen to:**
   - ✅ checkout.session.completed
   - ✅ customer.subscription.created
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
   - ✅ invoice.payment_succeeded
   - ✅ invoice.payment_failed

5. **Click "Add endpoint"**

6. **Copy the Signing Secret:**
   - Click on your webhook
   - Copy the **Signing secret** (starts with `whsec_`)

7. **Set the webhook secret:**
   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

---

### Step 8: Update Local Environment

Add to your `.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_STRIPE_PRICE_ID=price_your_price_id_here
```

---

### Step 9: Update Vercel Environment

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add both variables above
3. Click "Save"
4. Redeploy your app

---

## ✅ Verification Checklist

- [ ] Supabase CLI working (`npx supabase --version`)
- [ ] Logged into Supabase
- [ ] Project linked
- [ ] Stripe secrets set (SECRET_KEY, PRICE_ID)
- [ ] create-checkout-session deployed
- [ ] stripe-webhook deployed
- [ ] Stripe webhook endpoint created
- [ ] Webhook signing secret set
- [ ] Local .env updated
- [ ] Vercel environment variables updated

---

## 🧪 Test the Webhook

1. **Go to your Stripe webhook:**
   https://dashboard.stripe.com/test/webhooks

2. **Click on your endpoint**

3. **Click "Send test webhook"**

4. **Select event:** `checkout.session.completed`

5. **Click "Send test webhook"**

6. **Check logs:**
   ```bash
   npx supabase functions logs stripe-webhook
   ```

You should see:
```
✅ Webhook verified: checkout.session.completed
```

---

## 🆘 Troubleshooting

### Command not found:
```bash
# Make sure you're in the project directory
cd /Users/onurbaylan/Desktop/MyAeroDeal

# Try with full path
npx supabase --version
```

### Function deployment fails:
```bash
# Check you're in the right directory
pwd
# Should show: /Users/onurbaylan/Desktop/MyAeroDeal

# Check functions exist
ls -la supabase/functions/
```

### Webhook not firing:
1. Check Stripe Dashboard → Webhooks → Recent deliveries
2. Verify URL is correct
3. Check function logs: `npx supabase functions logs stripe-webhook --tail`

---

## 🎉 Success!

Once all steps are complete, you should see:

✅ Edge Functions deployed
✅ Webhook configured
✅ Secrets set
✅ Environment variables updated

**Let me know when done, and I'll finish the registration flow integration!**

---

## 📞 Need Help?

If you get stuck, share the error message and I'll help you fix it!
