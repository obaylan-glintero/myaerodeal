# Stripe Coupon Setup Guide

## Overview
This guide shows you how to create coupons in Stripe to offer MyAeroDeal for free or at a discount to selected companies.

## Step 1: Create Coupons in Stripe Dashboard

### Option A: 100% Off Coupon (Free Access)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Products** → **Coupons**
2. Click **"+ New"** or **"Create coupon"**
3. Fill in the details:
   - **Name**: `MyAeroDeal - Free Access`
   - **Coupon ID**: `MYAERODEAL_FREE` (or custom code like `PARTNER2024`)
   - **Type**: Select **"Percentage discount"**
   - **Percent off**: Enter `100`
   - **Duration**: Choose one:
     - `Forever` - Free forever (recommended for partners)
     - `Once` - First payment only (then regular price)
     - `Repeating` - Free for X months
   - **Redemption limits** (optional):
     - Max redemptions: Leave blank for unlimited, or set a limit
     - First-time orders only: Check if desired
4. Click **"Create coupon"**

### Option B: Discount Coupon (50% off, etc.)

1. Follow same steps as above
2. Set **Percent off** to your desired discount (e.g., `50` for 50% off)
3. Or choose **"Fixed amount"** and enter dollar amount (e.g., `49.50` for $49.50 off)

### Option C: Trial Period

Instead of a coupon, you can also set up a trial:
1. Go to your Price (`$99/month`)
2. Edit the price
3. Add a **Trial period** (e.g., 30 days free)
4. All new customers get the trial automatically

## Step 2: Get Your Coupon Code

After creating the coupon:
1. Note the **Coupon ID** (e.g., `MYAERODEAL_FREE` or `PARTNER2024`)
2. This is what users will enter during registration

## Step 3: Share Coupon Codes

### For Individual Companies:
- Email them the coupon code: `PARTNER2024`
- They enter it during registration

### For Many Companies:
Create multiple promotion codes in Stripe:
1. Go to **Products** → **Promotion codes**
2. Create codes linked to your coupon:
   - `COMPANY1-FREE`
   - `COMPANY2-FREE`
   - etc.
3. Set expiration dates if needed
4. Track usage per code

## Coupon Code Examples

### Free Forever (Partners/VIPs)
- Code: `VIP2024`
- 100% off forever
- Good for: Strategic partners, investors, advisors

### Free for 3 Months (Trial Customers)
- Code: `TRIAL3M`
- 100% off for 3 months
- Then regular $99/month billing

### 50% Off First Year
- Code: `LAUNCH50`
- 50% off repeating for 12 months
- Then regular $99/month billing

### $50 Off (One-time)
- Code: `SAVE50`
- $50 off first payment only
- Pay $49 first month, then $99/month

## How Users Apply Coupons

After registration implementation:
1. User clicks "Sign Up" on landing page
2. Fills in registration form
3. **NEW**: Sees optional "Promo Code" field
4. Enters coupon code (e.g., `VIP2024`)
5. Redirected to Stripe Checkout
6. Stripe validates code and applies discount
7. User completes checkout (or clicks subscribe if 100% off)
8. Webhook auto-approves company

## Webhook Handling for Free Coupons

For 100% off coupons, Stripe creates a subscription immediately without payment.
Your webhook already handles this via `checkout.session.completed` event.

## Admin: View Coupon Usage

### In Stripe Dashboard:
1. Go to **Products** → **Coupons**
2. Click on your coupon
3. See **"Times redeemed"** and list of customers

### Create Usage Report:
1. Go to **Reports** → **Coupons**
2. Select date range
3. See all redemptions

## Best Practices

### Security:
- Don't publish codes publicly
- Use one-time codes for single companies
- Set expiration dates
- Monitor redemption counts

### Organization:
- Name coupons descriptively: `"Partner - Company Name - 2024"`
- Use consistent ID format: `PARTNER_COMPANYNAME_2024`
- Add notes in Stripe for each coupon's purpose

### Testing:
1. Create a test coupon: `TEST100`
2. Use in test mode first
3. Verify webhook receives correct data
4. Then create production coupons

## Troubleshooting

### Coupon not applying:
- Check coupon is active (not expired/reached limit)
- Verify coupon ID is correct (case-sensitive)
- Ensure currency matches (USD)
- Check product restrictions

### Free users not getting access:
- Verify webhook is receiving events
- Check company `approved` column is set to `true`
- Ensure `subscription_status` is set to `active`

## Alternative: Manual Approval

If you prefer manual control instead of coupons:

1. **Option 1**: Don't use Stripe at all for free companies
   - Manually create company in Supabase
   - Set `approved = true` directly
   - Set `subscription_status = 'active'`

2. **Option 2**: Use a secret registration link
   - Create special link: `myaerodeal.com/register?free=true&token=SECRET`
   - Check token in registration, bypass Stripe
   - Auto-approve company

3. **Option 3**: Admin approval dashboard
   - Add admin panel
   - Manually review and approve companies
   - Toggle `approved` flag

## Next Steps

After creating coupons in Stripe:
1. I'll modify the registration form to include coupon code field
2. Update Edge Function to accept and apply coupon
3. Test with your created coupon codes
4. Deploy to production

Ready to implement? Let me know which approach you prefer!
