# Stripe Payment Integration - Testing Guide

## ✅ What's Been Deployed

### Code Changes:
1. **AuthPage.jsx** - Registration now creates full account and redirects to Stripe
2. **App.jsx** - Added routes for `/payment-success` and `/payment-cancel`
3. **Payment Pages** - Success and cancel pages ready
4. **Edge Functions** - Deployed to Supabase (create-checkout-session, stripe-webhook)

### Automatic Deployment:
- ✅ Changes pushed to GitHub
- ✅ Vercel deployment triggered automatically
- ⏳ Wait 2-3 minutes for deployment to complete

---

## 🎯 Complete Payment Flow

```
User Journey:
1. User visits landing page or app
2. Clicks "Start Free Trial" or "Sign Up"
3. Enters company details (company name, email, password, name)
4. Submits registration form
5. → Backend creates auth user (approved=false)
6. → Backend creates company record (approved=false)
7. → Backend creates user profile (role='admin')
8. → Backend calls Edge Function to create Stripe session
9. → User redirected to Stripe Checkout page
10. User enters payment info (test card: 4242 4242 4242 4242)
11. User completes payment
12. → Stripe sends webhook to stripe-webhook Edge Function
13. → Edge Function verifies webhook signature
14. → Edge Function auto-approves company (approved=true)
15. → Edge Function sets subscription_status='active'
16. → User redirected to /payment-success page
17. User sees success message (auto-redirects to login in 5 seconds)
18. User logs in with their credentials
19. → User can access app immediately (no manual approval needed!)
```

---

## 🧪 Testing Checklist

### Prerequisites:
- [ ] Vercel deployment complete (check: https://vercel.com/dashboard)
- [ ] Stripe webhook configured (check: https://dashboard.stripe.com/test/webhooks)
- [ ] Edge Functions deployed (check: `npx supabase functions list`)
- [ ] Environment variables set:
  - [ ] Local: `.env` has VITE_STRIPE_PUBLISHABLE_KEY and VITE_STRIPE_PRICE_ID
  - [ ] Vercel: Dashboard has both Stripe variables set

### Test 1: Registration Flow
1. **Go to your production app** (or localhost:5173)
2. **Click "Sign Up" or "Start Free Trial"**
3. **Fill in the registration form:**
   - Company Name: Test Company 1
   - Email: test1@example.com
   - Password: TestPass123!
   - First Name: John
   - Last Name: Doe
4. **Click "Create Account"**
5. **Expected:**
   - ✅ Page should show "Redirecting to payment..."
   - ✅ Should redirect to Stripe Checkout page (stripe.com)

### Test 2: Stripe Checkout
1. **On Stripe Checkout page, verify:**
   - Company name is displayed
   - Email is pre-filled (test1@example.com)
   - Price shows $99/month
   - Product name is correct
2. **Enter test card details:**
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/34)
   CVC: Any 3 digits (e.g., 123)
   Name: John Doe
   Country: United States
   ZIP: 12345
   ```
3. **Click "Subscribe"**
4. **Expected:**
   - ✅ Payment processing spinner
   - ✅ Redirect to your app's /payment-success page

### Test 3: Payment Success Page
1. **On success page, verify:**
   - ✅ Shows green checkmark icon
   - ✅ Shows "Payment Successful!"
   - ✅ Shows countdown timer (5 seconds)
   - ✅ Shows 3 success items:
     - Your account is now active
     - Subscription activated
     - Receipt sent to email
   - ✅ After 5 seconds, auto-redirects to login page (/)

### Test 4: Webhook Verification
**Check Stripe Dashboard:**
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Click "Recent deliveries" tab
4. **Expected:**
   - ✅ Should see recent event: `checkout.session.completed`
   - ✅ Status: Success (200 response)
   - ✅ Response body should show success

**Check Edge Function Logs:**
```bash
npx supabase functions logs stripe-webhook
```
**Expected output:**
```
Webhook verified: checkout.session.completed
Company approved: [company-id]
Subscription activated
```

### Test 5: Database Verification
**Check companies table:**
```sql
SELECT
  id,
  name,
  email,
  approved,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  subscription_start_date
FROM companies
WHERE email = 'test1@example.com';
```
**Expected:**
- approved: `true` ✅
- stripe_customer_id: `cus_...` (starts with cus_)
- stripe_subscription_id: `sub_...` (starts with sub_)
- subscription_status: `active` ✅
- subscription_start_date: Current timestamp

**Check profiles table:**
```sql
SELECT
  id,
  email,
  first_name,
  last_name,
  company_id,
  role
FROM profiles
WHERE email = 'test1@example.com';
```
**Expected:**
- first_name: `John`
- last_name: `Doe`
- role: `admin` ✅
- company_id: Should match company record

### Test 6: Login & Access
1. **Go to login page** (/)
2. **Enter credentials:**
   - Email: test1@example.com
   - Password: TestPass123!
3. **Click "Sign In"**
4. **Expected:**
   - ✅ Successfully logs in
   - ✅ Dashboard loads immediately
   - ✅ Can access all features
   - ✅ Company name shows in navigation
   - ✅ No "waiting for approval" message

---

## 🔧 Additional Tests

### Test 7: Payment Cancellation
1. **Register new user** (test2@example.com)
2. **On Stripe Checkout page, click "Back" or close tab**
3. **Expected:**
   - ✅ Redirected to /payment-cancel page
   - ✅ Shows "Payment Cancelled" message
   - ✅ "Try Again" button works (returns to /?retry=true)
   - ✅ User account created but not approved
   - ✅ Cannot login until payment completed

### Test 8: Failed Payment
1. **Register new user** (test3@example.com)
2. **Use declined test card:**
   ```
   Card Number: 4000 0000 0000 0002
   ```
3. **Expected:**
   - ✅ Shows "Your card was declined" error
   - ✅ Can try different card
   - ✅ Company remains unapproved until successful payment

### Test 9: Existing Email
1. **Try to register with same email** (test1@example.com)
2. **Expected:**
   - ✅ Shows error: "User already registered"
   - ✅ Doesn't charge Stripe
   - ✅ Suggests login instead

---

## 🐛 Troubleshooting

### Issue: "Redirecting to payment..." but no redirect happens

**Check:**
1. Browser console for errors (F12 → Console)
2. Network tab for failed requests
3. Edge Function logs: `npx supabase functions logs create-checkout-session`

**Possible causes:**
- Edge Function not deployed
- Environment variables not set (STRIPE_SECRET_KEY, STRIPE_PRICE_ID)
- User not authenticated properly

**Fix:**
```bash
# Verify Edge Function deployed
npx supabase functions list

# Verify secrets set
npx supabase secrets list

# Redeploy if needed
npx supabase functions deploy create-checkout-session
```

---

### Issue: Webhook not firing

**Check:**
1. Stripe Dashboard → Webhooks → Recent deliveries
2. Verify URL is correct: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
3. Verify events selected (checkout.session.completed, etc.)

**Fix:**
```bash
# Check webhook secret is set
npx supabase secrets list

# View webhook logs
npx supabase functions logs stripe-webhook --tail
```

---

### Issue: Company not auto-approved after payment

**Check:**
1. Webhook delivery in Stripe Dashboard
2. Edge Function logs for errors
3. Database company record

**Fix:**
```bash
# View webhook logs
npx supabase functions logs stripe-webhook

# Manually approve if needed (temporary fix)
# Run in Supabase SQL Editor:
UPDATE companies
SET approved = true, subscription_status = 'active'
WHERE email = 'user@example.com';
```

---

### Issue: Can't login after successful payment

**Check:**
1. User exists in auth.users: Supabase Dashboard → Authentication → Users
2. Profile exists in profiles table
3. Company approved in companies table

**Verify:**
```sql
-- Check user
SELECT * FROM auth.users WHERE email = 'user@example.com';

-- Check profile
SELECT * FROM profiles WHERE email = 'user@example.com';

-- Check company
SELECT approved, subscription_status FROM companies WHERE email = 'user@example.com';
```

---

## 📊 Success Metrics

After successful test, you should have:

✅ User can register without manual intervention
✅ Payment redirects to Stripe Checkout
✅ Test card payment succeeds
✅ Webhook fires and approves company automatically
✅ User receives success page
✅ User can login immediately
✅ All data recorded in database:
   - Auth user created
   - Company approved
   - Profile created with admin role
   - Subscription active
   - Stripe IDs stored

---

## 🎉 Next Steps After Testing

Once all tests pass:

1. **Switch to live mode** (when ready for production):
   - Get Stripe live API keys
   - Update environment variables
   - Update webhook endpoint to live mode
   - Create live product/price
   - Test with real card (will charge real money!)

2. **Monitor production:**
   - Set up Stripe email alerts for failed payments
   - Monitor Edge Function logs: `npx supabase functions logs stripe-webhook --tail`
   - Check Supabase dashboard for errors

3. **Optional enhancements:**
   - Add invoice PDF generation
   - Add subscription management page
   - Add plan upgrade/downgrade
   - Add cancellation flow
   - Add payment method update

---

## 🆘 Need Help?

**Common Resources:**
- Stripe Test Cards: https://stripe.com/docs/testing
- Supabase Functions Logs: `npx supabase functions logs [function-name]`
- Stripe Webhook Events: https://dashboard.stripe.com/test/webhooks

**Debug Commands:**
```bash
# Check all Edge Functions
npx supabase functions list

# View function logs (live)
npx supabase functions logs create-checkout-session --tail
npx supabase functions logs stripe-webhook --tail

# Check secrets
npx supabase secrets list

# Test webhook manually from Stripe Dashboard:
# Stripe Dashboard → Webhooks → Your endpoint → "Send test webhook"
```

---

## ✅ Final Verification

Run through this quick checklist:

- [ ] Can register new user
- [ ] Redirects to Stripe Checkout
- [ ] Payment with test card succeeds
- [ ] Redirects to success page
- [ ] Company auto-approved in database
- [ ] User can login immediately
- [ ] Dashboard loads with data
- [ ] No manual approval needed
- [ ] Webhook logs show success
- [ ] Stripe dashboard shows payment

**All green? Congratulations! 🎉 Your Stripe integration is working perfectly!**

---

**Ready to test? Start with Test 1 and work through the checklist.**
