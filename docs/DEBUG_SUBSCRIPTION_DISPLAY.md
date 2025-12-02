# Debug Subscription Details Not Showing

Run these commands in your browser console (F12) while on the Settings page to diagnose the issue.

## Step 1: Check if Section Should Render

```javascript
// Check if the Subscription & Billing section should even show
console.log('=== RENDER CHECK ===');
console.log('Current user profile:', window.currentUserProfile || 'Not available in window');

// Try to get from React DevTools or store
const profile = window.currentUserProfile;
if (profile) {
  console.log('Company:', profile.company);
  console.log('Has stripe_subscription_id:', !!profile.company?.stripe_subscription_id);
  console.log('stripe_subscription_id value:', profile.company?.stripe_subscription_id);
} else {
  console.log('⚠️ Cannot access currentUserProfile from window');
  console.log('Try this: Open React DevTools, find UserSettings component');
}
```

## Step 2: Check Network Request

```javascript
// Monitor if the fetch is being called
console.log('=== NETWORK CHECK ===');
console.log('Expected fetch URL:',
  import.meta.env.VITE_SUPABASE_URL + '/functions/v1/get-subscription-details'
);

// Check if request was made
// Go to Network tab, filter by "get-subscription-details"
```

## Step 3: Manually Test the Function

```javascript
// Manually call the function to see what happens
console.log('=== MANUAL TEST ===');

async function testSubscriptionFetch() {
  try {
    // Get session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('❌ No session found - user not logged in');
      return;
    }

    console.log('✅ Session found');

    // Call the function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription-details`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Response status:', response.status);

    const data = await response.json();
    console.log('Response data:', data);

    if (data.hasSubscription) {
      console.log('✅ Subscription found!');
      console.log('Status:', data.subscription.status);
      console.log('Plan:', data.subscription.plan);
    } else {
      console.log('⚠️ No subscription found');
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testSubscriptionFetch();
```

## Step 4: Check Database Directly

In Supabase Dashboard:

1. Go to **Table Editor** → **companies** table
2. Find your company (search by email or name)
3. Check these columns:
   - `stripe_subscription_id` - Should have value like `sub_xxxxx`
   - `stripe_customer_id` - Should have value like `cus_xxxxx`
   - `subscription_status` - Should be `trialing` or `active`

**If these are NULL/empty**, that's your problem!

## Common Issues & Solutions

### Issue 1: stripe_subscription_id is NULL

**This is the most common issue!**

The section won't render if `stripe_subscription_id` is missing.

**Cause:** Webhook didn't update the database after payment

**Fix:**
1. Get subscription ID from Stripe Dashboard
2. Update database manually:

```sql
UPDATE companies
SET
  stripe_subscription_id = 'sub_xxxxx',  -- From Stripe
  stripe_customer_id = 'cus_xxxxx',      -- From Stripe
  subscription_status = 'trialing',
  approved = true
WHERE email = 'your@email.com';
```

### Issue 2: Section Not Rendering (No Errors)

**Check in browser console:**

```javascript
// Is the component checking the right thing?
console.log('Component should show subscription section:',
  !!window.currentUserProfile?.company?.stripe_subscription_id
);
```

If this returns `false`, the section won't show because the condition fails.

### Issue 3: Stuck on Loading

**Check state:**

```javascript
// Check if it's stuck loading
console.log('Subscription loading state should be visible as spinner');
// Look for "Loading subscription details..." text on page
```

If you see loading forever, the fetch is failing silently.

### Issue 4: Function Returns Error

**If manual test (Step 3) shows error:**

- "User not authenticated" → Try logging out and back in
- "Profile not found" → Check profiles table has your user
- "Company not found" → Check companies table
- "No subscription found" → subscription_id is NULL in database

## Quick Fix Script

If subscription exists in Stripe but not in database:

```javascript
// 1. Get subscription ID from Stripe Dashboard
const subId = 'sub_xxxxx'; // Your actual subscription ID
const cusId = 'cus_xxxxx'; // Your actual customer ID

// 2. Get your company ID
const { data: profile } = await supabase
  .from('profiles')
  .select('company_id')
  .eq('id', (await supabase.auth.getUser()).data.user.id)
  .single();

console.log('Company ID:', profile.company_id);

// 3. Update company with subscription info
const { data, error } = await supabase
  .from('companies')
  .update({
    stripe_subscription_id: subId,
    stripe_customer_id: cusId,
    subscription_status: 'trialing',
    approved: true
  })
  .eq('id', profile.company_id)
  .select();

if (error) {
  console.error('Error updating:', error);
} else {
  console.log('✅ Updated:', data);
  console.log('Now refresh the page!');
}
```

## Verification Checklist

After running diagnostics:

- [ ] `stripe_subscription_id` exists in companies table
- [ ] `stripe_customer_id` exists in companies table
- [ ] `subscription_status` is set (trialing/active)
- [ ] `approved` is true
- [ ] Browser console shows no errors
- [ ] Network tab shows fetch to get-subscription-details
- [ ] Fetch returns 200 status
- [ ] Response has `hasSubscription: true`
- [ ] Section renders on page

## Still Not Working?

Provide these details:

1. **Output of Step 1** (render check)
2. **Output of Step 3** (manual test)
3. **Screenshot of companies table** (hide sensitive data)
4. **Network tab screenshot** showing the request
5. **Browser console screenshot**

---

**Most likely fix:** Update companies table with subscription ID from Stripe, then refresh page.
