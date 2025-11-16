# Settings Page New Features

## Overview
Added two new features to the User Settings page:
1. **Password Change** - Available to all users
2. **Subscription Cancellation** - Available to admins only

## Changes Made

### 1. Password Change Feature

**Location:** User Settings page - Available to all users

**Features:**
- Change password without entering current password (Supabase handles auth)
- Password validation (minimum 8 characters)
- Confirmation field to prevent typos
- Success/error messaging
- Clear form after successful change

**Implementation:**
- Uses Supabase `auth.updateUser()` method
- Client-side validation before API call
- Automatic form reset after success

**User Experience:**
- Simple 2-field form (New Password, Confirm Password)
- Real-time validation
- Clear error messages
- Success confirmation

### 2. Subscription Cancellation (Admin Only)

**Location:** User Settings page - Data Management section (admins only)

**Features:**
- Only visible if company has an active subscription
- Shows current subscription status and ID
- Cancel at period end (users retain access until billing period ends)
- Confirmation dialog to prevent accidental cancellation
- Updates both Stripe and database

**Implementation:**
- New Vercel API endpoint: `/api/cancel-subscription.js`
- Calls Stripe API to cancel subscription
- Updates company record in Supabase
- Sets `cancel_at_period_end: true` for graceful cancellation

**User Experience:**
- Displays subscription status badge (active/canceled/etc.)
- Shows subscription ID for reference
- Two-step confirmation process
- Clear messaging about when access ends
- Loading states during cancellation
- Success/error messaging

## Files Modified

### 1. `/src/components/Settings/UserSettings.jsx`

**Added:**
- Password change section with form and handler
- Subscription cancellation section with confirmation flow
- New state variables for both features
- Error handling and success messaging
- New icons: `Lock`, `XCircle`

**Key Functions:**
- `handlePasswordChange()` - Updates user password via Supabase Auth
- `handleCancelSubscription()` - Calls API to cancel Stripe subscription

### 2. `/api/cancel-subscription.js` (NEW)

**Purpose:** Vercel serverless function to cancel Stripe subscriptions

**Features:**
- Validates request data
- Cancels subscription in Stripe with `cancel_at_period_end: true`
- Updates company record in Supabase
- Returns subscription details
- Comprehensive error handling and logging

**Environment Variables Needed:**
- `STRIPE_SECRET_KEY` - Stripe API key
- `VITE_SUPABASE_URL` or `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## Usage

### Password Change (All Users)

1. Navigate to Settings page
2. Scroll to "Change Password" section
3. Enter new password (min 8 characters)
4. Confirm new password
5. Click "Change Password"
6. Success message displayed
7. Form cleared automatically

**Validation:**
- New password must be at least 8 characters
- New password and confirmation must match
- Button disabled until both fields filled

### Subscription Cancellation (Admins Only)

1. Navigate to Settings page
2. Scroll to "Data Management" section
3. Find "Cancel Subscription" section
4. Review current subscription status
5. Click "Cancel Subscription"
6. Confirm cancellation in dialog
7. Subscription canceled at period end
8. Database updated
9. Success message displayed

**Conditions:**
- Only visible if company has a subscription
- Only enabled if subscription status is "active"
- Requires admin role
- Cannot cancel already-canceled subscription

## Technical Details

### Password Change Flow

```
User enters new password
  ↓
Client-side validation
  ↓
Call supabase.auth.updateUser({ password })
  ↓
Success → Clear form, show message
Error → Show error message
```

### Subscription Cancellation Flow

```
Admin clicks Cancel Subscription
  ↓
Confirmation dialog shown
  ↓
Admin confirms
  ↓
POST /api/cancel-subscription
  ↓
Stripe: Update subscription (cancel_at_period_end: true)
  ↓
Supabase: Update company (subscription_status: 'canceling')
  ↓
Success → Reload page, show message
Error → Show error message
```

## Database Changes

### Companies Table

The subscription cancellation updates the `subscription_status` field:
- `active` → Subscription is active
- `canceling` → Subscription set to cancel at period end
- `canceled` → Subscription has ended (set by webhook)
- `past_due` → Payment failed

**No database migration needed** - these columns already exist.

## Security

### Password Change
- Uses Supabase Auth API (secure by default)
- No need to verify current password (Supabase handles session auth)
- Password must meet minimum requirements

### Subscription Cancellation
- Admin role required (checked in UI)
- Server-side validation in API endpoint
- Requires valid subscription ID and company ID
- Uses service role key for Supabase updates
- Stripe API key kept on server

## Testing Checklist

### Password Change
- [ ] Navigate to Settings page as regular user
- [ ] See "Change Password" section
- [ ] Try changing password with < 8 characters (should fail)
- [ ] Try mismatched passwords (should fail)
- [ ] Change password successfully
- [ ] Log out and log in with new password
- [ ] Form clears after success

### Subscription Cancellation (Admin)
- [ ] Navigate to Settings as admin
- [ ] See "Data Management" section
- [ ] See "Cancel Subscription" section (if subscription exists)
- [ ] See current subscription status badge
- [ ] Click "Cancel Subscription"
- [ ] See confirmation dialog
- [ ] Click "Keep Subscription" (should close dialog)
- [ ] Click "Cancel Subscription" again
- [ ] Click "Yes, Cancel Subscription"
- [ ] See success message
- [ ] Check Stripe dashboard - subscription should be set to cancel at period end
- [ ] Check database - subscription_status should be 'canceling'
- [ ] Verify access is retained until period end

### Non-Admin User
- [ ] Navigate to Settings as non-admin
- [ ] See "Change Password" section
- [ ] Do NOT see "Data Management" section
- [ ] Do NOT see subscription cancellation

## Important Notes

1. **Password Change:**
   - Users do NOT need to enter current password
   - This is standard for authenticated sessions
   - Supabase validates the user session automatically

2. **Subscription Cancellation:**
   - Cancellation is "at period end" not immediate
   - Users keep access until current billing period ends
   - Database shows 'canceling' status during grace period
   - Stripe webhook will update to 'canceled' when period ends

3. **Admin Access:**
   - Only users with `role = 'admin'` see admin sections
   - This is checked in the component
   - API endpoint does not check role (relies on company_id)

4. **Environment Variables:**
   - Ensure all Stripe and Supabase env vars are set in Vercel
   - Service role key needed for subscription cancellation API

## Next Steps

After deployment:
1. Test password change with a regular user account
2. Test subscription cancellation with an admin account
3. Monitor Vercel function logs for the cancel-subscription endpoint
4. Verify Stripe webhook updates status to 'canceled' when period ends
5. Consider adding email notifications for subscription cancellations
6. Consider adding ability to reactivate before period ends

## Troubleshooting

**Password change not working:**
- Check browser console for errors
- Verify user is logged in
- Verify password meets requirements (8+ chars)

**Subscription cancellation not visible:**
- Verify user has admin role
- Verify company has a subscription (stripe_subscription_id exists)
- Check currentUserProfile.company is loaded correctly

**Cancellation API fails:**
- Check Vercel function logs
- Verify STRIPE_SECRET_KEY is set
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Check subscription ID is valid in Stripe
- Check company ID exists in database
