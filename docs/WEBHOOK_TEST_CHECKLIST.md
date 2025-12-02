# Webhook Testing Checklist

## ✅ Pre-Test Verification

### 1. Vercel Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Verify these are set:
- ✅ `VITE_SUPABASE_URL` or `SUPABASE_URL` = `https://dpqjgogloaokggvafrsw.supabase.co`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbG...` (your service role key)

### 2. Stripe Webhook Configuration
Go to Stripe Dashboard → Webhooks

Verify:
- ✅ Webhook URL: `https://myaerodeal.vercel.app/api/stripe-webhook`
- ✅ Status: **Enabled**
- ✅ Events: `checkout.session.completed` is in the list

### 3. Supabase Edge Function Secrets
Go to Supabase Dashboard → Settings → Edge Functions → Function Secrets

Verify these are set:
- ✅ `STRIPE_WEBHOOK_SECRET` = `whsec_...` (from Stripe webhook signing secret)
- ✅ `RESEND_API_KEY` = `re_...` (from Resend)
- ✅ `RESEND_FROM_EMAIL` = `onboarding@resend.dev` (or your custom domain)

## 🧪 Testing Steps

### Step 1: Send Test Webhook from Stripe

1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook endpoint
3. Click **"Send test webhook"** button
4. Select event: **"checkout.session.completed"**
5. Click **"Send test event"**

### Step 2: Check Stripe Response

Look at the response in Stripe:
- ✅ **Status Code: 200** (Success!)
- ❌ **Status Code: 307** → Body parsing issue (should be fixed now)
- ❌ **Status Code: 401** → Auth issue
- ❌ **Status Code: 500** → Server error

### Step 3: Check Vercel Logs

Go to Vercel Dashboard → Your Project → Deployments → Latest → Functions

Look for logs from `/api/stripe-webhook`:
```
📥 Webhook received: POST /api/stripe-webhook
📦 Body length: 1234
🔑 Stripe signature present: true
🚀 Forwarding to Supabase: https://dpqjgogloaokggvafrsw.supabase.co/functions/v1/stripe-webhook
📨 Supabase response: 200 {"received":true}
```

### Step 4: Check Supabase Edge Function Logs

Go to Supabase Dashboard → Edge Functions → stripe-webhook → Logs

Look for:
```
✅ Webhook verified: checkout.session.completed
💳 Checkout completed for company: abc-123
✅ Company approved and subscription activated
✅ Welcome email sent to: user@example.com
```

### Step 5: Check Email

- Check the email inbox specified in the test event
- Check spam folder if not in inbox
- Or check Resend Dashboard → Emails to see if it was sent

## 🐛 Troubleshooting

### Issue: Still getting 307

**Cause:** Vercel deployment hasn't completed or old version is cached

**Fix:**
1. Go to Vercel Dashboard → Deployments
2. Check that latest deployment (with commit "Fix webhook proxy") is "Ready"
3. Wait 1-2 minutes for CDN cache to clear
4. Try again

### Issue: Getting 401 from Supabase

**Cause:** `SUPABASE_SERVICE_ROLE_KEY` not set in Vercel environment variables

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `SUPABASE_SERVICE_ROLE_KEY` with your service role key
3. Redeploy: `vercel --prod`

### Issue: Getting 500 from Vercel

**Cause:** Check Vercel function logs for error details

**Fix:**
1. Vercel Dashboard → Deployments → Latest → Functions
2. Look for error messages in `/api/stripe-webhook` logs
3. Common errors:
   - Missing env vars
   - Network timeout to Supabase
   - Invalid JSON response

### Issue: Webhook works but no email sent

**Cause:** Check Supabase stripe-webhook logs for email errors

**Fix:**
1. Supabase Dashboard → Edge Functions → stripe-webhook → Logs
2. Look for email errors:
   - "Resend API key not configured" → Re-check Supabase secrets
   - "Welcome email template not found" → Run `SETUP_EMAIL_DATABASE.sql` again
   - "Profile not found" → Check if user exists in database

## 📊 Success Criteria

All of these should be true:
- ✅ Stripe webhook shows **200 response**
- ✅ Vercel logs show **"Forwarding to Supabase"** and **"Supabase response: 200"**
- ✅ Supabase logs show **"✅ Webhook verified"** and **"✅ Welcome email sent"**
- ✅ Email received in inbox (or visible in Resend dashboard)

## 🎉 Next Steps After Success

Once webhooks are working:

1. **Test with real signup:**
   - Go to your signup page
   - Complete registration and payment
   - Verify welcome email is sent automatically

2. **Monitor in production:**
   - Check Stripe webhook logs daily for failures
   - Monitor Supabase function error rates
   - Check Resend dashboard for email delivery rates

3. **Optional enhancements:**
   - Set up custom domain for emails (replace `onboarding@resend.dev`)
   - Add email open/click tracking
   - Enable task reminder cron job
   - Customize welcome email template

## 🆘 Still Having Issues?

Provide these details:
1. Screenshot of Stripe webhook response
2. Copy of Vercel function logs
3. Copy of Supabase stripe-webhook logs
4. Confirm all environment variables are set correctly
