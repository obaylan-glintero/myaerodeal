# Redeploy with Correct Stripe Price ID

## ✅ What You've Done:
- Updated `.env` with correct Price ID: `price_1STirrCkgXs0RyxnIG7unsn4`

## 🚀 Deployment Steps:

### 1. Update Supabase Secrets (REQUIRED)
Run these commands in your terminal:

```bash
cd /Users/onurbaylan/Desktop/MyAeroDeal

# Set the correct Price ID in Supabase
npx supabase secrets set STRIPE_PRICE_ID=price_1STirrCkgXs0RyxnIG7unsn4

# Verify it's set correctly
npx supabase secrets list
```

You should see:
```
STRIPE_PRICE_ID
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

### 2. Redeploy Edge Functions (REQUIRED)
```bash
# Redeploy the checkout function with new secret
npx supabase functions deploy create-checkout-session

# Verify deployment
npx supabase functions list
```

### 3. Update Vercel Environment Variables

Go to: https://vercel.com/your-project/settings/environment-variables

Update these variables:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51STiqrCkgXs0Ryxn20NW57oiU1SgAgTby2vfan0c3da4vnRFKowGZLKquSqN9U66GOxw9QjIdiHhmuSjVGG16JnP00A8nkrsBa
VITE_STRIPE_PRICE_ID=price_1STirrCkgXs0RyxnIG7unsn4
```

Click **Save**, then **Redeploy** your latest deployment.

### 4. Clean Up Orphaned Users (REQUIRED)

Run this in Supabase SQL Editor:
```sql
-- Delete users without profiles (from failed attempts)
DELETE FROM auth.users
WHERE id IN (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  WHERE p.id IS NULL
);
```

### 5. Restart Local Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Verification Checklist

Before testing, verify:
- [ ] Supabase secrets updated (check with `npx supabase secrets list`)
- [ ] Edge Function redeployed (`npx supabase functions list` shows recent deployment)
- [ ] Vercel environment variables updated
- [ ] Vercel redeployed (check dashboard)
- [ ] Orphaned users cleaned up
- [ ] Local dev server restarted with new .env

---

## 🧪 Test Registration

Once everything is deployed:

1. **Open browser console** (F12)
2. **Go to Console tab**
3. **Navigate to your app**
4. **Click Sign Up**
5. **Fill form and submit**
6. **Watch console logs:**
   - ✅ "Calling Edge Function: ..."
   - ✅ "Edge Function response status: 200"
   - ✅ "Edge Function response: {url: 'https://checkout.stripe.com/...'}"
   - ✅ "Redirecting to Stripe: ..."
7. **Should redirect to Stripe Checkout page**
8. **Use test card: 4242 4242 4242 4242**
9. **Complete payment**
10. **Should redirect to success page**
11. **Login and verify access**

---

## 🐛 If You See Errors

### "No such price: 'price_...'"
- Price ID doesn't exist in Stripe
- Double-check the ID in Stripe Dashboard

### "Invalid API Key"
- Stripe Secret Key not set or wrong
- Check: `npx supabase secrets list`
- Update: `npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...`

### "404 Not Found"
- Edge Function not deployed
- Run: `npx supabase functions deploy create-checkout-session`

---

## 📞 Need Help?

Check Edge Function logs:
```bash
npx supabase functions logs create-checkout-session --tail
```

This shows real-time errors when you try to register.

---

**Run the commands above in order, then test registration!** ✅
