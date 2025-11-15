# Automatic Email System for Registration Approvals

## Current Limitation

The database cannot send emails directly. When you approve a registration:
1. ✅ Company is created
2. ✅ Test data is populated
3. ✅ Invitation link is generated
4. ❌ Email must be sent manually (clipboard copy)

## Solutions to Enable Automatic Emails

### Option 1: Supabase Edge Function (Recommended)

Create a Supabase Edge Function that sends emails automatically:

#### Step 1: Create Edge Function

```bash
# In your terminal
supabase functions new send-approval-email
```

#### Step 2: Function Code (`supabase/functions/send-approval-email/index.ts`)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { email, invitationUrl, firstName, companyName } = await req.json()

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Send invitation email using Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: invitationUrl,
      data: {
        first_name: firstName,
        company_name: companyName
      }
    })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

#### Step 3: Deploy Function

```bash
supabase functions deploy send-approval-email
```

#### Step 4: Update Frontend to Call Function

In `RegistrationApproval.jsx`, after approval:

```javascript
// After getting invitation data
const { data: emailData, error: emailError } = await supabase.functions.invoke(
  'send-approval-email',
  {
    body: {
      email: data.email,
      invitationUrl: invitationUrl,
      firstName: data.first_name,
      companyName: data.company_name
    }
  }
)
```

---

### Option 2: Email Service Integration (Resend, SendGrid, etc.)

Use a third-party email service:

#### Using Resend (Recommended for simplicity)

1. **Sign up at resend.com** (Free tier: 3,000 emails/month)

2. **Get API Key** from dashboard

3. **Create Edge Function:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { email, invitationUrl, firstName, companyName } = await req.json()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
    },
    body: JSON.stringify({
      from: 'AeroBrokerOne <onboarding@yourdomain.com>',
      to: [email],
      subject: `Welcome to AeroBrokerOne - ${companyName}`,
      html: `
        <h2>Your Company Registration Has Been Approved!</h2>
        <p>Hi ${firstName},</p>
        <p>Great news! Your company "${companyName}" has been approved for AeroBrokerOne.</p>
        <p>Click the link below to complete your account setup:</p>
        <p><a href="${invitationUrl}">Complete Registration</a></p>
        <p>This link expires in 30 days.</p>
        <p>Best regards,<br>The AeroBrokerOne Team</p>
      `
    })
  })

  const data = await res.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

4. **Set Environment Variable:**
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key
```

---

### Option 3: Gmail/SMTP Integration

Use Gmail or any SMTP service:

```typescript
import { SMTPClient } from 'https://deno.land/x/denomailer/mod.ts'

const client = new SMTPClient({
  connection: {
    hostname: 'smtp.gmail.com',
    port: 465,
    tls: true,
    auth: {
      username: Deno.env.get('GMAIL_USER'),
      password: Deno.env.get('GMAIL_APP_PASSWORD')
    }
  }
})

await client.send({
  from: 'your-email@gmail.com',
  to: email,
  subject: 'Welcome to AeroBrokerOne',
  content: `Your invitation: ${invitationUrl}`
})
```

---

### Option 4: Manual Email (Current System)

For now, use the current system with improved UX:

#### Email Template for Manual Sending:

```
Subject: Welcome to AeroBrokerOne - Your Company Has Been Approved!

Hi [First Name],

Great news! Your company "[Company Name]" has been approved for AeroBrokerOne.

Click the link below to complete your account setup and access your dashboard:

[Invitation URL]

What's Next?
1. Click the link above
2. Create your password
3. Access your pre-populated dashboard with sample data
4. Explore the platform and start managing your leads

Your account includes:
• 3 sample leads
• 3 sample aircraft
• 3 sample deals
• 3 sample tasks

You can wipe this test data anytime from Settings.

The invitation link expires in 30 days.

Need help? Reply to this email.

Best regards,
The AeroBrokerOne Team
```

---

## Quick Start: Manual Emails with Better UX

Update the approval UI to show a pre-formatted email:

```javascript
// In RegistrationApproval.jsx
const emailTemplate = `
Subject: Welcome to AeroBrokerOne - ${data.company_name} Approved!

Hi ${data.first_name},

Your company "${data.company_name}" has been approved!

Complete your registration here:
${invitationUrl}

Best regards,
AeroBrokerOne Team
`;

// Copy both URL and email template
await navigator.clipboard.writeText(emailTemplate);
```

---

## Comparison

| Option | Difficulty | Cost | Time | Automatic |
|--------|-----------|------|------|-----------|
| **Supabase Edge Function** | Medium | Free* | 1-2 hours | ✅ Yes |
| **Resend API** | Easy | Free tier | 30 min | ✅ Yes |
| **SMTP/Gmail** | Medium | Free | 1 hour | ✅ Yes |
| **Manual Email** | Easy | Free | 2 min/user | ❌ No |

*Free within Supabase limits

---

## Recommended: Resend for Production

1. Sign up at resend.com
2. Verify your domain
3. Create Edge Function (see Option 2 above)
4. Deploy and test

**Total setup time: ~30 minutes**

---

## For Development/Testing

Use manual emails for now:
1. Approve registration
2. Copy invitation URL
3. Send via your email client
4. User completes signup

This is sufficient for MVP/testing with a few users.

---

## Security Notes

- ✅ Never expose service role key in frontend code
- ✅ Always use Edge Functions for admin operations
- ✅ Use environment variables for API keys
- ✅ Validate inputs in Edge Functions
- ✅ Rate limit email sending to prevent abuse

---

## Next Steps

1. **For MVP:** Use manual emails (current system)
2. **For Production:** Set up Resend or Supabase Edge Function
3. **Long term:** Add email templates, tracking, and analytics
