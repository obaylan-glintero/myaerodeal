# Quick Fix: Welcome Emails Not Sending

## Problem
Welcome emails are not being sent after user registration.

## Root Causes & Solutions

### 1. Database Tables Don't Exist

**Check if tables exist:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **Table Editor**
3. Look for `email_logs` and `email_templates` tables

**If tables DON'T exist:**

1. Go to **SQL Editor**
2. Click **"New query"**
3. Copy **ENTIRE** contents of `supabase/migrations/20250115_create_email_logs.sql`
4. Paste and click **"Run"**
5. Should see success message

**Verify:**
```sql
SELECT * FROM email_templates WHERE is_system = true;
```
You should see 3 templates: "Welcome Email", "Task Reminder", "Lead Follow-up"

### 2. Resend API Key Not Configured

**Add to Vercel:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your MyAeroDeal project
3. **Settings** → **Environment Variables**
4. Add (if missing):
   - Key: `RESEND_API_KEY`
   - Value: `re_xxxxx` (from [Resend Dashboard](https://resend.com/api-keys))
   - Environment: Check all boxes
5. Add (if missing):
   - Key: `RESEND_FROM_EMAIL`
   - Value: `MyAeroDeal <onboarding@resend.dev>` (or your verified domain)
   - Environment: Check all boxes
6. Click **Save**
7. **Redeploy** your app (Deployments → ••• → Redeploy)

### 3. Edge Functions Not Deployed or Have Errors

**Check deployment:**
1. Go to Supabase Dashboard
2. Go to **Edge Functions**
3. Verify you see:
   - `send-email`
   - `send-welcome-email`
   - `send-task-reminders`
   - `stripe-webhook`

**Check for errors:**
1. Click on `stripe-webhook` function
2. Go to **Logs** tab
3. Look for recent errors when a payment was completed

### 4. Stripe Webhook Not Calling Function

**Check Stripe webhook:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click your webhook
3. Check recent events for `checkout.session.completed`
4. Look for any failed deliveries or errors

## Quick Test

### Test Welcome Email Manually:

1. Get your user ID and company ID from Supabase
2. Run this curl command (replace values):

```bash
curl -X POST \
  'https://dpqjgogloaokggvafrsw.supabase.co/functions/v1/send-welcome-email' \
  -H 'Authorization: Bearer [YOUR_SUPABASE_SERVICE_ROLE_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "[YOUR_USER_ID]",
    "companyId": "[YOUR_COMPANY_ID]"
  }'
```

Replace:
- `[YOUR_SUPABASE_SERVICE_ROLE_KEY]` - From Supabase → Settings → API → service_role key
- `[YOUR_USER_ID]` - From Supabase → Authentication → Users
- `[YOUR_COMPANY_ID]` - From Supabase → Table Editor → companies

### Expected Response:

**Success:**
```json
{"success":true,"emailId":"xyz123"}
```

**Error Examples:**

```json
{"error":"Profile not found"}
```
→ User ID is wrong

```json
{"error":"Resend API key not configured"}
```
→ Add RESEND_API_KEY to Vercel environment variables

```json
{"error":"Welcome email template not found"}
```
→ Run the database migration SQL

```json
{"error":"Resend error: {...}"}
```
→ Check Resend API key is valid, from address is correct

## Check Email Logs

After sending a test email, check if it was logged:

```sql
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 5;
```

If you see the email logged with status 'sent', the function is working!

## Still Not Working?

### Get Detailed Logs:

1. **Supabase Edge Function Logs:**
   - Dashboard → Edge Functions → send-welcome-email → Logs
   - Look for error messages

2. **Stripe Webhook Logs:**
   - Dashboard → Edge Functions → stripe-webhook → Logs
   - Check if welcome email call is even being attempted

3. **Resend Logs:**
   - [Resend Dashboard](https://resend.com) → Emails
   - See if any emails were attempted

### Common Issues:

**Email sent but not received:**
- Check spam folder
- Verify "from" email address
- If using custom domain, verify DNS records in Resend

**Function timeout:**
- Check Edge Function logs for timeout errors
- Resend API might be slow - increase timeout if needed

**Database error:**
- Verify RLS policies allow inserting to email_logs
- Check all foreign key references are valid

## Minimum Required Setup:

To get welcome emails working, you MUST have:

1. ✅ Database tables created (run migration SQL)
2. ✅ Resend account with API key
3. ✅ `RESEND_API_KEY` in Vercel environment variables
4. ✅ `RESEND_FROM_EMAIL` in Vercel environment variables
5. ✅ Edge Functions deployed (`send-welcome-email`, `stripe-webhook`)
6. ✅ Stripe webhook configured and calling your webhook URL

If ANY of these are missing, welcome emails won't work.

## Need More Help?

Share the following info:
- Error message from Edge Function logs
- Response from manual curl test above
- Whether email_templates table has 3 rows
- Whether RESEND_API_KEY is set in Vercel

This will help diagnose the exact issue!
