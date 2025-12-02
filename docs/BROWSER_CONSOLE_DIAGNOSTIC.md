# Quick Diagnostic Script for Browser Console

Since `supabase` isn't globally available, use this alternative approach:

## Option 1: Use React DevTools (Easiest)

1. **Install React DevTools** browser extension if you haven't already
2. Open DevTools (F12) → **React** tab (or **Components** tab)
3. Find the **UserSettings** component in the tree
4. Click on it
5. Look at the **props** or **hooks** section
6. Check the values:
   - `currentUserProfile.company.stripe_subscription_id`
   - `subscriptionDetails`
   - `subscriptionLoading`
   - `subscriptionError`

**What to look for:**
- ❌ If `stripe_subscription_id` is `null` → That's the problem!
- ✅ If it has a value like `sub_xxxxx` → Check `subscriptionDetails`
- If `subscriptionLoading` is `true` forever → Request is failing
- If `subscriptionError` has a value → That's the error message

## Option 2: Create Supabase Client in Console

Paste this entire block into your browser console:

```javascript
// Create a Supabase client
const { createClient } = window.supabase || await import('https://esm.sh/@supabase/supabase-js@2');

// Get environment variables from the page
const VITE_SUPABASE_URL = document.querySelector('meta[name="supabase-url"]')?.content ||
                           localStorage.getItem('supabase.url') ||
                           prompt('Enter your Supabase URL (https://xxx.supabase.co)');

const VITE_SUPABASE_ANON_KEY = document.querySelector('meta[name="supabase-anon-key"]')?.content ||
                                localStorage.getItem('supabase.anon') ||
                                prompt('Enter your Supabase Anon Key');

// Create client
const sb = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

console.log('✅ Supabase client created');

// Now run diagnostic
async function diagnose() {
  console.log('=== DIAGNOSTIC START ===');

  try {
    // Check 1: User
    const { data: { user }, error: userError } = await sb.auth.getUser();
    console.log('1. User:', user?.email || 'Not logged in');

    if (!user) {
      console.error('❌ User not logged in!');
      return;
    }

    // Check 2: Profile
    const { data: profile, error: profileError } = await sb
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    console.log('2. Company ID:', profile?.company_id);

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return;
    }

    // Check 3: Company Subscription Data
    const { data: company, error: companyError } = await sb
      .from('companies')
      .select('stripe_subscription_id, stripe_customer_id, subscription_status, approved')
      .eq('id', profile.company_id)
      .single();

    console.log('3. Company data:', company);

    if (companyError) {
      console.error('❌ Company error:', companyError);
      return;
    }

    // Check 4: Will section render?
    console.log('\n=== RESULTS ===');
    console.log('stripe_subscription_id:', company.stripe_subscription_id || '❌ MISSING');
    console.log('stripe_customer_id:', company.stripe_customer_id || '❌ MISSING');
    console.log('subscription_status:', company.subscription_status || 'none');
    console.log('approved:', company.approved);

    const willRender = !!company.stripe_subscription_id;
    console.log('\n🎯 Will Subscription section render?', willRender ? '✅ YES' : '❌ NO');

    if (!willRender) {
      console.error('\n❌ PROBLEM: Missing stripe_subscription_id');
      console.log('The Subscription & Billing section will NOT show.');
      console.log('\nTO FIX: Get subscription ID from Stripe Dashboard');
      console.log('Then run this:');
      console.log(`
await sb.from('companies').update({
  stripe_subscription_id: 'sub_PASTE_FROM_STRIPE',
  stripe_customer_id: 'cus_PASTE_FROM_STRIPE',
  subscription_status: 'trialing',
  approved: true
}).eq('id', '${profile.company_id}');
      `);
    } else {
      console.log('✅ Database looks good!');
      console.log('Testing Edge Function...');

      // Test Edge Function
      const { data: { session } } = await sb.auth.getSession();
      const response = await fetch(
        `${VITE_SUPABASE_URL}/functions/v1/get-subscription-details`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Edge Function status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Edge Function response:', data);

        if (data.hasSubscription) {
          console.log('✅ Everything works! Section should show.');
          console.log('If not showing, check React DevTools for component state.');
        } else {
          console.log('⚠️ Function returns no subscription:', data.error);
        }
      } else {
        const error = await response.text();
        console.error('❌ Edge Function error:', error);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run it
diagnose();
```

## Option 3: Simple Network Tab Check

1. Open DevTools (F12) → **Network** tab
2. Clear all requests (trash icon)
3. Refresh the Settings page
4. Filter by: `get-subscription`
5. Look for the request to `get-subscription-details`

**If you see it:**
- Click on it
- Check **Status** (should be 200)
- Check **Response** tab (should have subscription data)
- Check **Preview** tab for formatted data

**If you DON'T see it:**
- The request isn't being made
- This means `stripe_subscription_id` is probably NULL
- The component condition fails, so it doesn't even try to fetch

## Option 4: Direct Database Check

**Easiest way to check:**

1. Go to **Supabase Dashboard**
2. Click **Table Editor** → **companies**
3. Find your company (search for your email)
4. Look at these columns:
   - `stripe_subscription_id` - **Should NOT be empty**
   - `stripe_customer_id` - **Should NOT be empty**
   - `subscription_status` - Should say `trialing` or `active`

**If `stripe_subscription_id` is empty/NULL**, that's definitely your problem!

## If stripe_subscription_id is Missing

Get the IDs from Stripe and update your database:

**In Stripe Dashboard:**
1. Go to **Subscriptions**
2. Find the subscription
3. Copy the Subscription ID (starts with `sub_`)
4. Click on customer name
5. Copy Customer ID (starts with `cus_`)

**In Supabase Dashboard:**
1. Go to **SQL Editor**
2. Run this query (replace with your actual values):

```sql
UPDATE companies
SET
  stripe_subscription_id = 'sub_YOUR_SUBSCRIPTION_ID',
  stripe_customer_id = 'cus_YOUR_CUSTOMER_ID',
  subscription_status = 'trialing',
  approved = true
WHERE email = 'your@email.com';  -- Your actual email
```

3. Click **Run**
4. Refresh your Settings page

---

**TL;DR:**
- Check Supabase → companies table → stripe_subscription_id column
- If empty, update it with the ID from Stripe Dashboard
- Then refresh Settings page
