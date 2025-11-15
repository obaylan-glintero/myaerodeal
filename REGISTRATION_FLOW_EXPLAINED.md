# How the Registration & Approval Flow Works

## The Issue You Experienced

When you approved a registration request, no user account was created automatically. This is by design for security - we don't store passwords during the registration request phase.

## The Correct Flow (Now Fixed)

### Step 1: User Requests Access
1. User fills out the registration form (company name, email, name, password)
2. **Only the request data is stored** (company name, email, name)
3. **Password is NOT stored** - this is for security
4. User sees: "Registration request submitted! You will receive notification once approved"

### Step 2: You Approve the Request
1. Go to **Registrations** page
2. Click **Approve** on pending request
3. System automatically:
   - ✅ Creates the company
   - ✅ Creates an invitation token (30-day expiry)
   - ✅ Copies invitation link to clipboard
4. You see a message with the invitation URL

### Step 3: Send Invitation to User
**You need to manually send the invitation link to the user via:**
- Email
- Slack
- WhatsApp
- Any communication method

The link looks like:
```
http://localhost:5173?invitation=abc-123-def-456
```

### Step 4: User Completes Signup
1. User clicks the invitation link
2. Redirected to signup page with banner: "You're invited to join [Company Name]!"
3. Email is pre-filled (locked)
4. User enters their name and **creates their password**
5. Clicks "Create Account"
6. ✅ Account created in Supabase Auth
7. ✅ Profile created and linked to company
8. ✅ User can now log in!

---

## Why This Design?

**Security:** We never store passwords in plaintext or in the registration request table. Passwords only go to Supabase Auth when the user completes signup via the invitation link.

**Flexibility:** You can review company requests before creating any accounts, preventing spam/abuse.

---

## Testing the Complete Flow

### 1. Create a Test Registration Request

Sign out and go to: http://localhost:5173

Click "Request access" and fill in:
- Company: Test Company
- Name: Test User
- Email: test@example.com
- Password: anything (will be ignored)

### 2. Approve the Request

Sign back in as super admin, go to **Registrations**, click **Approve**.

The invitation link will be copied to clipboard.

### 3. Use the Invitation Link

Open an **incognito window** and paste the invitation URL.

You'll see the invitation banner. Complete the signup with a password.

### 4. Verify

The user should now:
- Be in the auth.users table (Supabase Auth)
- Have a profile in the profiles table
- Belong to "Test Company"
- Have role = 'admin' (first user of company)

---

## SQL Commands to Check Everything

### Check registration requests:
```sql
SELECT * FROM company_registration_requests 
ORDER BY created_at DESC;
```

### Check invitations:
```sql
SELECT 
  i.*,
  c.name as company_name
FROM user_invitations i
JOIN companies c ON c.id = i.company_id
ORDER BY i.created_at DESC;
```

### Check if user was created:
```sql
SELECT 
  u.email,
  u.created_at,
  p.first_name,
  p.last_name,
  p.role,
  c.name as company
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN companies c ON c.id = p.company_id
ORDER BY u.created_at DESC;
```

---

## What If You Already Approved Someone?

If you already approved a request but didn't send the invitation:

### Option 1: Find the Invitation Token

```sql
SELECT 
  email,
  token,
  'http://localhost:5173?invitation=' || token as invitation_url
FROM user_invitations
WHERE email = 'their-email@example.com'
  AND status = 'pending'
  AND expires_at > now();
```

Copy that URL and send it to them.

### Option 2: Create a New Invitation

Go to **User Management** → **Invite User** and manually invite them to your company.

---

## Future Enhancement: Automated Emails

For production, you should set up automated emails:

1. **When you approve:** Automatically email the invitation link
2. **When they sign up:** Welcome email
3. **Before expiry:** Reminder email if invitation not used

This requires setting up:
- Supabase Edge Functions
- Email service (SendGrid, Postmark, Resend, etc.)
- Email templates

---

## Summary

✅ Registration request = Just a request (no auth user)
✅ Approval = Creates company + invitation
✅ You must send invitation link manually (for now)
✅ User clicks link and completes signup
✅ User is automatically added to the company

The system is working correctly - it just requires you to manually send the invitation link after approval!
