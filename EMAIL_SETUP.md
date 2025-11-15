# Email Integration Setup Guide

## Part 1: Database Setup

### Step 1: Run SQL Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Click **"New query"**
5. Copy the entire contents of `supabase/migrations/20250115_create_email_logs.sql`
6. Paste and click **"Run"**

This creates:
- `email_logs` table - Tracks all sent emails
- `email_templates` table - Stores email templates
- 3 default system templates (Welcome, Task Reminder, Lead Follow-up)

## Part 2: Resend Email Service Setup

### Step 2: Create Resend Account

1. Go to [Resend](https://resend.com/)
2. Sign up for free account
3. Verify your email

### Step 3: Add Sending Domain

**Option A: Use Your Custom Domain (Recommended for production)**
1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `myaerodeal.com`
4. Add DNS records shown (SPF, DKIM, DMARC) to your domain registrar
5. Wait for verification (usually 1-24 hours)

**Option B: Use Resend's Test Domain (Good for development)**
- Skip this step
- Emails will be sent from `onboarding@resend.dev`
- Limited to 100 emails/day
- Only send to your own email for testing

### Step 4: Create API Key

1. Go to **API Keys** in Resend dashboard
2. Click **"Create API Key"**
3. Name: `MyAeroDeal Production`
4. Permission: **Full access** (or **Sending access** if you prefer limited)
5. Click **"Add"**
6. **Copy the API key** (starts with `re_...`) - you won't see it again!

### Step 5: Add API Key to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **MyAeroDeal** project
3. Go to **Settings** → **Environment Variables**
4. Add variable:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_xxxxxxxxxxxxx` (your key from step 4)
   - **Environment**: Check all (Production, Preview, Development)
5. Click **"Save"**

### Step 6: Add Sender Email

1. Still in Vercel Environment Variables
2. Add another variable:
   - **Key**: `RESEND_FROM_EMAIL`
   - **Value**:
     - If using custom domain: `MyAeroDeal <hello@myaerodeal.com>`
     - If using test domain: `MyAeroDeal <onboarding@resend.dev>`
   - **Environment**: Check all
3. Click **"Save"**

### Step 7: Deploy Edge Functions

From your project directory, run:

```bash
npx supabase functions deploy send-email
npx supabase functions deploy send-welcome-email
npx supabase functions deploy send-task-reminders
```

### Step 8: Add Resend Key to Supabase

1. Go to Supabase Dashboard → **Settings** → **Vault**
2. Click **"New secret"**
3. Name: `resend_api_key`
4. Secret: Your Resend API key (`re_...`)
5. Click **"Save"**

## Part 3: Testing

### Test Welcome Email

1. Register a new test user in your app
2. Check your email inbox
3. You should receive a welcome email within seconds

### Test Email Manually

You can test by calling the Edge Function directly:

```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your@email.com",
    "template": "welcome",
    "variables": {
      "firstName": "John",
      "companyName": "Test Company"
    }
  }'
```

### Check Email Logs

```sql
-- In Supabase SQL Editor
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;
```

## Part 4: Email Features

### A. Welcome Emails ✅

**Automatically sent when:**
- New user registers and completes payment
- Triggered by Stripe webhook after subscription created

**Template variables:**
- `{{firstName}}` - User's first name
- `{{companyName}}` - Company name

### B. Task Reminder Emails ✅

**Automatically sent:**
- Daily at 9 AM (user's timezone)
- For tasks due today or overdue
- Only sent to assigned user

**Template variables:**
- `{{firstName}}` - User's name
- `{{taskTitle}}` - Task name
- `{{dueDate}}` - When it's due
- `{{priority}}` - high/medium/low
- `{{description}}` - Task details

### C. Email Logging 📝

**Tracks every sent email:**
- Who sent it
- Who received it
- When it was sent/delivered/opened
- Related lead/deal/task
- Email content and template used

**View in app:**
- Lead detail page shows all emails sent to that lead
- Deal page shows deal-related emails
- Activity feed shows recent email activity

### D. Email Templates 📧

**System Templates (included):**
1. Welcome Email
2. Task Reminder
3. Lead Follow-up

**Custom Templates:**
- Add via Settings → Email Templates
- Use variables like `{{leadName}}`, `{{aircraftModel}}`
- HTML and text versions

**Using Templates:**
```javascript
// In your code
import { sendEmail } from './utils/email';

await sendEmail({
  to: lead.email,
  template: 'lead_follow_up',
  variables: {
    leadName: lead.name,
    aircraftManufacturer: 'Gulfstream',
    aircraftModel: 'G650',
    customMessage: 'Just wanted to check in...',
    senderName: currentUser.name,
    companyName: company.name
  },
  relatedLeadId: lead.id
});
```

## Part 5: Monitoring

### Check Email Delivery Status

1. **In Resend Dashboard:**
   - Go to **Emails** to see all sent emails
   - Click any email to see delivery status
   - Check opens and clicks

2. **In MyAeroDeal:**
   - Each lead/deal shows email history
   - Status updates automatically via webhooks

### Set Up Webhooks (Optional but Recommended)

1. In Resend → **Webhooks**
2. Add webhook URL: `https://YOUR_PROJECT.supabase.co/functions/v1/resend-webhook`
3. Subscribe to events:
   - `email.delivered`
   - `email.opened`
   - `email.clicked`
   - `email.bounced`
4. This updates email_logs with real-time status

## Troubleshooting

### Emails not sending?

1. Check Resend API key is correct in Vercel
2. Verify domain is verified in Resend (if using custom domain)
3. Check Edge Function logs in Supabase dashboard
4. Ensure `resend_api_key` is in Supabase Vault

### Emails going to spam?

1. Verify your domain in Resend
2. Add all DNS records (SPF, DKIM, DMARC)
3. Start with low volume and gradually increase
4. Avoid spam trigger words in subject/body
5. Use a professional from-address

### Welcome emails not sent on signup?

1. Check Stripe webhook is configured
2. Verify Edge Function `send-welcome-email` is deployed
3. Check function logs for errors
4. Test webhook manually via Stripe dashboard

## Usage Limits

**Resend Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Good for testing and small teams

**Paid Plans:**
- $20/month for 50,000 emails
- $80/month for 500,000 emails

## Next Steps

Once email is working:

1. ✅ Customize email templates with your branding
2. ✅ Add more custom templates for common scenarios
3. ✅ Set up email sequences (follow-up automation)
4. ✅ Create email performance reports
5. ✅ Add unsubscribe functionality (legally required)

## Need Help?

- [Resend Documentation](https://resend.com/docs)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- Email me for support: [your-email]
