# Stripe Payment Integration Plan

## Overview
Convert the manual company registration approval process to an automated Stripe payment-based system.

---

## Current Flow
1. User registers with email/password
2. Company profile created with `approved = false`
3. User waits for super admin manual approval
4. Super admin approves via RegistrationApproval panel
5. User gains access to app

## New Flow with Stripe
1. User enters company details (name, email, password)
2. User is redirected to **Stripe Checkout** for payment
3. After successful payment:
   - Webhook receives payment confirmation
   - Company automatically set to `approved = true`
   - User profile created with company_id
4. User can immediately sign in and access the app

---

## Technical Implementation Plan

### Phase 1: Stripe Setup & Configuration

#### 1.1 Install Stripe Dependencies
```bash
npm install @stripe/stripe-js stripe
```

#### 1.2 Environment Variables (Add to .env)
```env
# Stripe Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product Configuration
VITE_STRIPE_PRICE_ID=price_...  # Monthly or one-time price ID
```

#### 1.3 Stripe Account Setup
- Create Stripe account at https://stripe.com
- Create a Product in Stripe Dashboard
  - Name: "MyAeroDeal Company Registration"
  - Type: One-time payment or Subscription (your choice)
  - Price: Set your amount (e.g., $99/month or $999 one-time)
- Copy Price ID to VITE_STRIPE_PRICE_ID
- Get API keys from Developers > API Keys
- Set up webhook endpoint (see Phase 3)

---

### Phase 2: Frontend Changes

#### 2.1 Create Stripe Checkout Component
**File:** `src/components/Auth/StripeCheckout.jsx`

**Purpose:**
- Display company registration summary
- Initialize Stripe checkout session
- Handle redirect to Stripe hosted checkout page

**Key Features:**
- Show pricing information
- Create checkout session via Supabase Edge Function
- Redirect to Stripe with:
  - `success_url`: Redirect after payment
  - `cancel_url`: Return if user cancels
  - Metadata: `company_name`, `email`, `user_id`

#### 2.2 Modify AuthPage.jsx Registration Flow

**Changes:**
1. **Remove:** Manual approval messaging
2. **Add:** Pricing display and "Continue to Payment" button
3. **New Flow:**
   ```
   Step 1: Enter company info (name, email, password)
   ↓
   Step 2: Show pricing page
   ↓
   Step 3: Create Supabase auth user (approved=false)
   ↓
   Step 4: Redirect to Stripe Checkout
   ↓
   Step 5: After payment → Webhook activates account
   ↓
   Step 6: Redirect to success page → User can sign in
   ```

#### 2.3 Create Payment Success Page
**File:** `src/components/Auth/PaymentSuccess.jsx`

**Purpose:**
- Display success message after payment
- Show next steps (sign in)
- Optionally check payment status via Stripe

#### 2.4 Create Payment Cancel Page
**File:** `src/components/Auth/PaymentCancel.jsx`

**Purpose:**
- Handle user cancellation
- Offer to retry payment
- Show support contact

---

### Phase 3: Backend Changes (Supabase)

#### 3.1 Create Supabase Edge Function: `create-checkout-session`

**File:** `supabase/functions/create-checkout-session/index.ts`

**Purpose:**
- Validate request from authenticated user
- Create Stripe Checkout Session
- Return session ID and URL to frontend

**Flow:**
```typescript
1. Verify user authentication
2. Get company_id from user profile
3. Create Stripe checkout session with:
   - Price ID
   - Customer email
   - Success/cancel URLs
   - Metadata: { company_id, user_id, email }
4. Return { sessionId, url }
```

#### 3.2 Create Supabase Edge Function: `stripe-webhook`

**File:** `supabase/functions/stripe-webhook/index.ts`

**Purpose:**
- Receive Stripe webhook events
- Verify webhook signature
- Handle `checkout.session.completed` event
- Activate company account

**Flow:**
```typescript
1. Verify Stripe webhook signature
2. Parse event type
3. If checkout.session.completed:
   a. Extract metadata (company_id)
   b. Update companies table:
      - approved = true
      - stripe_customer_id = event.customer
      - stripe_subscription_id = event.subscription (if subscription)
      - subscription_status = 'active'
   c. Send welcome email (optional)
4. Return 200 OK
```

#### 3.3 Database Schema Changes

**Add columns to `companies` table:**
```sql
ALTER TABLE companies
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN subscription_start_date TIMESTAMPTZ,
ADD COLUMN subscription_end_date TIMESTAMPTZ;

CREATE INDEX idx_companies_stripe_customer
ON companies(stripe_customer_id);
```

**Add new table: `payments`** (optional, for tracking)
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- succeeded, pending, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_company ON payments(company_id);
CREATE INDEX idx_payments_status ON payments(status);
```

---

### Phase 4: Security & RLS Updates

#### 4.1 Update RLS Policies

Ensure only approved companies can access data:

```sql
-- Already exists, but verify:
CREATE POLICY "Users can only access their company data"
ON leads FOR ALL
USING (company_id = (
  SELECT company_id FROM user_profiles
  WHERE user_id = auth.uid()
  AND (SELECT approved FROM companies WHERE id = company_id) = true
));
```

Apply to all tables: `leads`, `aircraft`, `deals`, `tasks`

#### 4.2 Add Approved Check in Frontend

**File:** `src/App.jsx`

Add company approval check:
```javascript
// After authentication, check company approval
const checkCompanyApproval = async () => {
  const profile = await getCurrentUserProfile();
  if (profile && !profile.company_approved) {
    // Show "Waiting for payment" message
    // Or redirect to payment page
  }
};
```

---

### Phase 5: Webhook Configuration

#### 5.1 Deploy Supabase Edge Functions
```bash
# Deploy create-checkout-session
supabase functions deploy create-checkout-session

# Deploy stripe-webhook
supabase functions deploy stripe-webhook
```

#### 5.2 Configure Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Set URL: `https://[YOUR-PROJECT-REF].supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created` (if using subscriptions)
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

### Phase 6: Remove Manual Approval System

#### 6.1 Remove RegistrationApproval Component
- Delete `src/components/Admin/RegistrationApproval.jsx`
- Remove from navigation in `src/components/Common/Navigation.jsx`
- Remove from `src/App.jsx` routing

#### 6.2 Update Database Functions (Optional)

Remove or archive the manual approval functions:
- `approve_company_registration()`
- `reject_company_registration()`

---

## Subscription vs One-Time Payment

### Option A: One-Time Payment
- **Use Case:** Lifetime access after single payment
- **Stripe Setup:** Create "One-time" product
- **Benefits:** Simple, no recurring billing
- **Implementation:** After payment, set `approved = true` permanently

### Option B: Subscription (Recommended for SaaS)
- **Use Case:** Monthly/annual recurring revenue
- **Stripe Setup:** Create "Subscription" product
- **Benefits:** Recurring revenue, easier to manage
- **Implementation:**
  - Set `approved = true` while subscription is active
  - Handle cancellations (set `approved = false`)
  - Handle failed payments (grace period)
  - Send renewal reminders

**Recommendation:** Use Subscription model for predictable revenue.

---

## Pricing Strategy Recommendations

### Suggested Pricing Tiers:

#### Tier 1: Starter - $49/month
- 1 user
- Up to 25 leads
- Up to 10 aircraft
- Basic support

#### Tier 2: Professional - $99/month
- Up to 5 users
- Unlimited leads & aircraft
- Priority support
- API access

#### Tier 3: Enterprise - $299/month
- Unlimited users
- Unlimited everything
- Dedicated support
- Custom integrations

---

## Testing Checklist

### Stripe Test Mode
- [ ] Use test API keys initially
- [ ] Test card: `4242 4242 4242 4242`
- [ ] Test successful payment flow
- [ ] Test failed payment (card: `4000 0000 0000 0002`)
- [ ] Test webhook delivery
- [ ] Verify company approval after payment
- [ ] Test subscription cancellation (if applicable)

### Edge Cases
- [ ] User closes browser during payment
- [ ] Webhook fails (retry mechanism)
- [ ] Duplicate payments
- [ ] User tries to register multiple companies
- [ ] Payment refund handling

---

## Timeline Estimate

- **Phase 1 (Setup):** 1-2 hours
- **Phase 2 (Frontend):** 4-6 hours
- **Phase 3 (Backend):** 4-6 hours
- **Phase 4 (Security):** 2-3 hours
- **Phase 5 (Webhooks):** 2-3 hours
- **Phase 6 (Cleanup):** 1-2 hours
- **Testing:** 3-4 hours

**Total:** 17-26 hours

---

## Questions to Clarify

1. **Pricing Model:**
   - One-time payment or subscription?
   - If subscription: Monthly or Annual?
   - Price point? (Suggested: $99/month)

2. **Features:**
   - Offer free trial? (e.g., 14 days)
   - Multiple pricing tiers?
   - Usage limits per tier?

3. **Payment:**
   - Accept only credit cards or also ACH/bank transfer?
   - Support multiple currencies?
   - Offer coupons/discounts?

4. **Account Management:**
   - Allow users to upgrade/downgrade plans?
   - Self-service subscription management (customer portal)?
   - Refund policy?

---

## Security Considerations

1. **PCI Compliance:**
   - Never store card details (Stripe handles this)
   - Use Stripe Checkout (hosted page) - fully PCI compliant

2. **Webhook Security:**
   - Always verify webhook signatures
   - Use HTTPS only
   - Log all webhook events for audit

3. **Rate Limiting:**
   - Add rate limits to checkout session creation
   - Prevent abuse of free trial (if offered)

4. **User Data:**
   - Store only metadata in your database
   - Reference Stripe IDs, not payment details
   - Comply with GDPR (allow data export/deletion)

---

## Post-Implementation

### Monitoring
- Set up Stripe Dashboard alerts
- Monitor failed payments
- Track conversion rate (signups → paid)
- Set up error logging (Sentry, etc.)

### Customer Support
- Create FAQ for billing questions
- Set up support email for payment issues
- Provide clear refund policy
- Enable Stripe Customer Portal for self-service

### Analytics
- Track MRR (Monthly Recurring Revenue)
- Monitor churn rate
- Track payment success rate
- Analyze pricing tier distribution
