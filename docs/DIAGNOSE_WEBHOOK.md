# Diagnose: Why Welcome Emails Aren't Sent After Stripe Payment

## ✅ Test Works, But Real Signup Doesn't

This means:
- ✅ Database is set up correctly
- ✅ Resend is configured correctly
- ✅ Edge Functions are deployed
- ❌ **Stripe webhook is not triggering the email**

## 🔍 Step 1: Check Stripe Webhook Configuration

### A. Find Your Webhook URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project
2. Go to **Edge Functions** → **stripe-webhook**
3. Copy the **Function URL** (looks like: `https://dpqjgogloaokggvafrsw.supabase.co/functions/v1/stripe-webhook`)

### B. Check Stripe Webhook Settings

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click on your webhook endpoint
3. **Verify:**
   - ✅ Endpoint URL matches your Supabase function URL
   - ✅ Status is **"Enabled"**
   - ✅ Events being listened to includes: `checkout.session.completed`

### C. Check Recent Webhook Deliveries

1. Still in Stripe → Webhooks → Click your endpoint
2. Click **"Logs"** or **"Recent events"** tab
3. Look for recent `checkout.session.completed` events
4. Click on one to see:
   - **Status**: Should be "succeeded" (not "failed")
   - **Response code**: Should be 200 (not 400, 500, etc.)
   - **Response body**: Check for any error messages

**Common Issues:**

❌ **Status: Failed, Response: 401 Unauthorized**
→ Webhook signing secret is wrong or missing

❌ **Status: Failed, Response: 500 Error**
→ Check Supabase Edge Function logs for the error

❌ **Status: Succeeded, but no email**
→ Webhook worked but email function failed (check Step 2)

## 🔍 Step 2: Check Supabase Edge Function Logs

### View Stripe Webhook Logs

1. Go to Supabase Dashboard → **Edge Functions**
2. Click **stripe-webhook**
3. Go to **Logs** tab
4. Filter by recent time (last hour)
5. Look for entries with `checkout.session.completed`

**What to look for:**

✅ **Good Log:**
```
✅ Webhook verified: checkout.session.completed
💳 Checkout completed for company: abc-123-def
✅ Company approved and subscription activated: abc-123-def
✅ Welcome email sent to: user@example.com
```

❌ **Bad Logs:**

**Error: "No company ID in session metadata"**
```
❌ No company ID in session metadata
```
→ The checkout session doesn't have company metadata. This is a bug in the checkout creation.

**Error: Profile/User not found:**
```
⚠️ Error sending welcome email: Profile not found
```
→ Can't find the user in the database. Check if user was created properly.

**Error: Template not found:**
```
⚠️ Error sending welcome email: Welcome email template not found
```
→ Database migration wasn't run. Re-run `SETUP_EMAIL_DATABASE.sql`

**Error: Resend API key:**
```
⚠️ Error sending welcome email: Resend API key not configured
```
→ Even though test works, the webhook can't access the env var. Redeploy functions.

## 🔍 Step 3: Check Recent Signups in Database

Let's verify the data flow:

Run this in Supabase SQL Editor:

```sql
-- Check recent companies and their users
SELECT
  c.id as company_id,
  c.name as company_name,
  c.approved,
  c.stripe_customer_id,
  c.subscription_status,
  p.id as user_id,
  p.email as user_email,
  p.first_name,
  p.last_name,
  c.created_at
FROM companies c
LEFT JOIN profiles p ON p.company_id = c.id
ORDER BY c.created_at DESC
LIMIT 5;
```

**Check:**
1. Are new companies being created?
2. Do they have `approved = true` after payment?
3. Do they have a `stripe_customer_id`?
4. Does the profile exist with correct email?

```sql
-- Check if any welcome emails were attempted
SELECT
  el.*,
  p.email as recipient
FROM email_logs el
LEFT JOIN profiles p ON p.id = el.sent_by
WHERE el.template_name = 'Welcome Email'
ORDER BY el.created_at DESC
LIMIT 10;
```

**Check:**
- Are there ANY rows? If yes, emails are being attempted
- If no rows, the email function is never being called
- Check `status` column for failures

## 🔧 Step 4: Fix Common Issues

### Issue A: Webhook Secret Missing or Wrong

**Check if secret exists:**
1. Supabase → Settings → Edge Functions
2. Look for `STRIPE_WEBHOOK_SECRET` in secrets

**Get correct secret from Stripe:**
1. Stripe Dashboard → Webhooks → Click your webhook
2. Click **"Reveal"** next to "Signing secret"
3. Copy the secret (starts with `whsec_...`)
4. Add to Supabase Edge Functions secrets as `STRIPE_WEBHOOK_SECRET`
5. Redeploy: `npx supabase functions deploy stripe-webhook`

### Issue B: Email Function Not Being Called

**Add more verbose logging:**

Edit the stripe webhook to add this after line 108:

```typescript
console.log('🔍 Found primary user:', primaryUser)
console.log('🔍 Calling welcome email function...')
```

Then redeploy and test again.

### Issue C: Webhook Not Receiving Events

**Test webhook manually from Stripe:**

1. Stripe Dashboard → Webhooks → Your endpoint
2. Click **"Send test webhook"**
3. Select **"checkout.session.completed"**
4. Click **"Send test event"**
5. Check if email is sent

If email IS sent from test but NOT from real payment:
- Your test event might have different data structure
- Real payment might not have `company_id` in metadata

## 🧪 Quick Fix: Trigger Email Manually

While debugging, you can manually send welcome emails to recent signups:

1. Find user ID and company ID from the SQL query above
2. Use `test-email.html` to send the email manually
3. Or run this curl:

```bash
curl -X POST \
  'https://dpqjgogloaokggvafrsw.supabase.co/functions/v1/send-welcome-email' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"userId":"USER_ID","companyId":"COMPANY_ID"}'
```

## 📋 Complete Debugging Checklist

Run through this in order:

1. [ ] **Stripe webhook URL** is correct and enabled
2. [ ] **Stripe webhook** listens to `checkout.session.completed`
3. [ ] **Recent webhook deliveries** in Stripe show "succeeded" (not failed)
4. [ ] **Supabase function logs** show checkout event being received
5. [ ] **Supabase function logs** show "✅ Welcome email sent" message
6. [ ] **Database** shows new companies have `approved = true`
7. [ ] **Database** shows profiles exist with correct email
8. [ ] **email_logs table** has welcome email entries

If ALL are checked but still no email:
- Check email spam folder
- Verify Resend dashboard shows email was sent
- Check "from" email address is correct

## 🆘 Still Not Working?

**Get me this info:**

1. **From Stripe webhook logs tab:**
   - Screenshot or copy the most recent `checkout.session.completed` event
   - Response code and response body

2. **From Supabase stripe-webhook logs:**
   - Copy the log entries for the most recent signup

3. **From Supabase SQL:**
   - Run the company/profile query above
   - Copy the most recent row

4. **From email_logs:**
   - Run: `SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 5;`
   - Tell me how many rows you see

With this info, I can pinpoint the exact issue!
