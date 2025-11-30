# Stripe Customer Portal Setup

The Stripe Customer Portal allows your users to manage their own subscriptions and payment methods without contacting support.

## What Users Can Do

In the Customer Portal, users can:
- ✅ Update payment method (credit card)
- ✅ View billing history and invoices
- ✅ Download invoices
- ✅ View upcoming charges
- ✅ Cancel subscription (if enabled)
- ✅ Update billing email and address

## Setup Instructions

### Step 1: Enable Customer Portal

1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Settings** → **Billing** → **Customer portal**
3. Click **Activate** button

### Step 2: Configure Portal Settings

#### Features to Enable:
- ✅ **Update payment method** - REQUIRED (Let users update their credit card)
- ✅ **View billing history** - Recommended
- ✅ **Invoice history** - Recommended

#### Features to Consider:
- ⚠️ **Cancel subscriptions** - Your choice (allows self-service cancellation)
  - If enabled: Set cancellation mode to "Cancel at period end"
  - If disabled: Users must contact you to cancel

### Step 3: Customize Branding

1. In Customer Portal settings, go to **Branding**
2. Upload your logo
3. Set brand colors to match your app
4. Set business name: "MyAeroDeal"
5. Set support email: support@myaerodeal.com

### Step 4: Set Terms of Service (Optional)

1. In Customer Portal settings, go to **Business information**
2. Add link to Terms of Service
3. Add link to Privacy Policy

### Step 5: Get Portal URL

The Customer Portal URL is dynamically generated per customer. There are two ways to implement it:

#### Option A: Use Session URL (Current Implementation)

The "Update Card" button currently uses a test URL. You need to either:

1. **Create a portal session via API** (Recommended)
2. **Use the universal portal link** (Simpler but less secure)

#### Option B: Universal Portal Link (Quick Setup)

1. Go to **Settings** → **Billing** → **Customer portal**
2. Copy the universal link (looks like: `https://billing.stripe.com/p/login/XXXXXXX`)
3. Update the button in `UserSettings.jsx`:

```javascript
// Replace this line (around line 566):
onClick={() => window.open('https://billing.stripe.com/p/login/test_00000000000000', '_blank')}

// With your actual portal URL:
onClick={() => window.open('https://billing.stripe.com/p/login/YOUR_ACTUAL_LINK', '_blank')}
```

**For Production:** Use the production portal link, not the test link!

#### Option C: Generate Portal Session (Most Secure - Recommended)

Create a new Edge Function to generate portal sessions:

```typescript
// supabase/functions/create-portal-session/index.ts
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '')

// Get customer ID from your database
// Create portal session
const session = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: 'https://yourdomain.com/settings',
})

// Return session.url
```

Then update the button to call this function and redirect to the returned URL.

### Step 6: Test the Portal

1. Start a trial subscription (or use test mode)
2. Go to Settings in your app
3. Click "Update Card" button
4. Verify you're redirected to Stripe Customer Portal
5. Test updating payment method
6. Verify changes appear in Stripe Dashboard

## Production Checklist

Before going live:

- [ ] Customer Portal is activated in Stripe
- [ ] Branding is configured (logo, colors)
- [ ] Update payment method is enabled
- [ ] Correct portal URL is used (production, not test)
- [ ] Return URL points to your production domain
- [ ] Terms of Service link is set
- [ ] Support email is configured
- [ ] Test the portal with a real card in test mode
- [ ] Verify portal works on mobile

## Security Notes

- ✅ Portal sessions are automatically authenticated via Stripe
- ✅ Users can only access their own subscription data
- ✅ Sessions expire after a period of inactivity
- ✅ All changes are logged in Stripe Dashboard

## Customization Options

### Custom Return URLs

Set where users return after portal actions:

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: 'https://yourdomain.com/settings?portal=success',
})
```

### Allowed Actions

Control what users can do:
- Payment method updates
- Subscription cancellations
- Plan changes (upgrade/downgrade)
- Invoice downloads

Configure these in: **Settings** → **Billing** → **Customer portal** → **Features**

## Alternative: In-App Payment Management

If you prefer to handle payment updates in your app instead of using Stripe Portal:

1. Use Stripe Elements to collect card details
2. Call `stripe.customers.updateSource()` API
3. Show payment methods in your Settings page
4. Allow adding/removing payment methods

This requires more development but gives you full control over the UX.

## Support

If users report issues accessing the portal:
1. Check that portal is activated in Stripe
2. Verify correct URL is being used
3. Check Stripe Dashboard logs for errors
4. Ensure customer exists in Stripe with valid subscription

---

**Recommendation:** For MVP, use the universal portal link (Option B). It's the quickest to set up and Stripe handles all the security and UI for you.
