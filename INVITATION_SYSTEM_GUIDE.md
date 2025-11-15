# User Invitation & Registration System Guide

## Overview

This system implements a secure registration and invitation flow where:
1. **New companies** require manual approval before creating accounts
2. **Super admins** (you) approve/reject registration requests
3. **Company admins** can invite team members to their company
4. **Invited users** join existing companies automatically

---

## Setup Instructions

### Step 1: Run the Database Migration

1. Open your **Supabase Dashboard** → **SQL Editor**
2. Run the script: `REGISTRATION_AND_INVITATION_SYSTEM.sql`
3. This creates:
   - `company_registration_requests` table
   - `user_invitations` table
   - Approval/rejection functions
   - Updated signup trigger

### Step 2: Make Yourself Super Admin

After running the migration, execute this SQL (replace with your email):

```sql
UPDATE public.profiles 
SET is_super_admin = true 
WHERE email = 'your-email@example.com';
```

Now you'll see a **"Registrations"** link in your sidebar.

---

## How It Works

### 1. New Company Registration (Manual Approval)

**User Flow:**
1. User visits the app and clicks "Request access"
2. Fills in: Company Name, First Name, Last Name, Email, Password
3. Clicks "Create Account"
4. Sees message: "Registration request submitted! You will receive an email once approved."
5. **NO PROFILE IS CREATED YET** - they must wait for approval

**Your Flow (Super Admin):**
1. Go to **Registrations** page in your dashboard
2. See pending registration requests
3. Review company name, user details
4. Click **Approve** or **Reject**
5. If approved:
   - Company is created automatically
   - User receives notification (manual for now)
   - User can now sign up with their email/password
6. If rejected:
   - Request is marked as rejected
   - Optional rejection reason saved

**After Approval:**
- User signs up with the same email they used in the request
- The trigger detects the approved request
- Creates their profile as company admin
- They can now access the app

---

### 2. Inviting Team Members (Company Admins)

**How to Invite:**
1. Go to **User Management** (admins only)
2. Click **"Invite User"**
3. Enter:
   - Email address
   - First name
   - Last name
   - Role (user or admin)
4. Click **"Invite User"**
5. **Invitation link is copied to clipboard**
6. Send the link to the invitee via email/Slack/etc.

**Invitation URL Format:**
```
https://yourapp.com?invitation=abc-123-def-456
```

**Invited User Flow:**
1. Receives invitation link
2. Clicks link → redirected to signup page
3. Sees banner: "You're invited to join [Company Name]!"
4. Email field is pre-filled and disabled
5. Sets their password and name
6. Clicks "Create Account"
7. **Automatically joins the company** (no approval needed)
8. Can immediately access the app

---

### 3. Invitation Expiration

- Invitations expire after **7 days**
- Expired invitations show error: "Invitation not found or expired"
- Admin must create a new invitation

---

## Database Tables

### `company_registration_requests`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | User's email |
| company_name | TEXT | Requested company name |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| status | TEXT | pending/approved/rejected |
| created_at | TIMESTAMPTZ | Request timestamp |
| reviewed_at | TIMESTAMPTZ | Approval/rejection timestamp |
| reviewed_by | UUID | Super admin who reviewed |
| rejection_reason | TEXT | Optional reason for rejection |

### `user_invitations`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| company_id | UUID | Company they're invited to |
| email | TEXT | Invitee's email |
| invited_by | UUID | Admin who invited |
| role | TEXT | user or admin |
| token | TEXT | Unique invitation token |
| status | TEXT | pending/accepted/expired |
| created_at | TIMESTAMPTZ | Invitation timestamp |
| expires_at | TIMESTAMPTZ | Expiration (7 days) |
| accepted_at | TIMESTAMPTZ | When they signed up |

---

## Security Features

### Row Level Security (RLS)

**Registration Requests:**
- Anyone can CREATE (public signup)
- Only super admins can SELECT/UPDATE

**Invitations:**
- Company admins can CREATE for their company
- Users can SELECT invitations for their company
- Company admins can UPDATE/DELETE their company's invitations

**Profile Trigger:**
The `handle_new_user()` trigger checks:
1. Is there a valid invitation for this email? → Join that company
2. Is there an approved registration for this email? → Create new company admin
3. Neither? → No profile created (user must wait for approval)

---

## Features to Add Later

### Email Notifications (Recommended)

Currently, invitation links are copied to clipboard. For production:

1. Use **Supabase Edge Functions** to send emails
2. Trigger on:
   - Registration approval → "Your account has been approved!"
   - Invitation created → "You've been invited to join [Company]!"
   - Invitation expiring soon → "Your invitation expires in 24 hours"

3. Email template example:
```html
Subject: You've been invited to join [Company Name] on AeroBrokerOne!

Hi,

You've been invited to join [Company Name] on AeroBrokerOne.

Click here to create your account:
[Invitation Link]

This link expires in 7 days.
```

### Resend Invitation

Add a "Resend" button in User Management:
```javascript
const resendInvitation = async (invitationId) => {
  // Extend expiration date
  await supabase
    .from('user_invitations')
    .update({ expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
    .eq('id', invitationId);
  
  // Re-send email
};
```

### Invitation List in User Management

Show pending invitations with status:
- Email
- Invited by
- Invited on
- Expires on
- Status (Pending/Accepted/Expired)
- Actions (Resend, Cancel)

---

## Testing the System

### Test Scenario 1: New Company Registration

1. **Sign out** from your current account
2. Go to signup page
3. Fill in company registration form
4. Submit → see "waiting for approval" message
5. **Sign back in** as super admin
6. Go to **Registrations** page
7. See your test request
8. Click **Approve**
9. **Sign out** again
10. Sign up with the same email → you're now the admin of the test company!

### Test Scenario 2: Invite Team Member

1. Go to **User Management**
2. Click **Invite User**
3. Enter test email (use a temp email service)
4. Copy invitation link
5. Open link in **incognito window**
6. See invitation banner
7. Complete signup
8. User is immediately added to your company

---

## Troubleshooting

### "Only super admins can approve registration requests"

**Solution:** Run this SQL with your email:
```sql
UPDATE public.profiles 
SET is_super_admin = true 
WHERE email = 'your-email@example.com';
```

### "Registration request not found or already processed"

**Cause:** Request was already approved/rejected or doesn't exist

**Solution:** Check the requests table:
```sql
SELECT * FROM company_registration_requests 
WHERE email = 'user@example.com';
```

### "Invitation not found or expired"

**Cause:** Invitation expired (>7 days old) or already accepted

**Solution:** Create a new invitation

### User signed up but has no access

**Cause:** No approved registration and no invitation

**Solution:** 
1. Check if registration was approved
2. Ensure trigger is working:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

---

## Summary

✅ **New companies** → Manual approval required
✅ **Super admin** → Approve/reject registrations
✅ **Company admins** → Invite team members
✅ **Invitations** → Automatic company join
✅ **Security** → RLS policies enforce access control
✅ **Expiration** → 7-day invitation validity

**Next Steps:**
1. Run the SQL migration
2. Make yourself super admin
3. Test registration approval flow
4. Test invitation flow
5. (Optional) Add email notifications
