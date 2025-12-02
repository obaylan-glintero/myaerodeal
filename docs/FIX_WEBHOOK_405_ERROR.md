# Fix 405 Method Not Allowed Error

The 405 error means the endpoint exists but isn't accepting POST requests. This is usually a Vercel deployment issue.

## Quick Checks

### Check 1: Verify Webhook URL Format

Make sure your Stripe webhook URL is **exactly**:
```
https://your-domain.vercel.app/api/stripe-webhook
```

**Common mistakes:**
- ❌ `/api/stripe-webhook/` (trailing slash)
- ❌ `/api/stripe-webhooks` (plural)
- ❌ `/stripe-webhook` (missing /api/)
- ✅ `/api/stripe-webhook` (correct!)

### Check 2: Test Endpoint Directly

Open this URL in your browser:
```
https://your-domain.vercel.app/api/stripe-webhook
```

**Expected response:**
```json
{"error": "Method not allowed"}
```

**If you see this**, the endpoint exists! It's rejecting GET requests (which is correct). POST should work.

**If you see 404**, the function isn't deployed.

## Solution 1: Redeploy to Vercel

The function might not be deployed or is cached.

### Option A: Redeploy via Git

```bash
cd /home/user/myaerodeal
git add .
git commit -m "Trigger redeploy"
git push
```

Vercel will automatically redeploy.

### Option B: Manual Redeploy in Vercel Dashboard

1. Go to **Vercel Dashboard**
2. Click on your project
3. Go to **Deployments** tab
4. Click **...** on latest deployment → **Redeploy**
5. Check **Use existing Build Cache** → Uncheck it
6. Click **Redeploy**

### Option C: Vercel CLI

```bash
npm i -g vercel
cd /home/user/myaerodeal
vercel --prod
```

## Solution 2: Fix Function Export Format

The function might not be exporting correctly for Vercel.

### Check Current Format

Your `api/stripe-webhook.js` should have:

```javascript
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Function code...
}
```

### Alternative Format (Try This)

If still getting 405, try this format:

```javascript
// api/stripe-webhook.js

// Disable body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Main handler
module.exports = async function handler(req, res) {
  console.log('📥 Webhook received:', req.method, req.url);

  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rest of your code...
}
```

## Solution 3: Check Vercel Logs

1. **Go to Vercel Dashboard** → Your Project
2. Click **Logs** tab
3. Send a test webhook from Stripe
4. Watch the logs in real-time

**What to look for:**
- Does the request appear in logs?
- What error messages do you see?
- Is the function being invoked?

## Solution 4: Use Vercel CLI to Test Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project
cd /home/user/myaerodeal

# Run locally
vercel dev
```

Then test locally:
```bash
curl -X POST http://localhost:3000/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Expected:** Should NOT return 405, should return "No signature" (400) or similar.

## Solution 5: Check vercel.json Configuration

Create or update `vercel.json` in your project root:

```json
{
  "functions": {
    "api/stripe-webhook.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/stripe-webhook",
      "destination": "/api/stripe-webhook.js"
    }
  ]
}
```

Then commit and push:
```bash
git add vercel.json
git commit -m "Add Vercel configuration"
git push
```

## Solution 6: Simplify for Testing

Create a minimal test version to verify Vercel is working:

### Create `api/test-webhook.js`:

```javascript
export default function handler(req, res) {
  console.log('Method:', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      method: req.method,
      allowed: 'POST'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Test webhook works!'
  });
}
```

Deploy and test:
```
https://your-domain.vercel.app/api/test-webhook
```

If this works with POST but `stripe-webhook` doesn't, there's an issue with the stripe-webhook function specifically.

## Debugging Steps

### Step 1: Check Vercel Function List

Vercel Dashboard → Your Project → **Functions** tab

You should see:
- ✅ `api/stripe-webhook.js`
- ✅ `api/cancel-subscription.js`

If missing, they aren't deployed.

### Step 2: Check Build Logs

Vercel Dashboard → Your Project → **Deployments** → Latest deployment → **Build Logs**

Look for:
- Errors during build
- Warnings about API routes
- Function detection messages

### Step 3: Test with curl

```bash
curl -X POST https://your-domain.vercel.app/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test" \
  -d '{"test": "data"}'
```

**If 405:** Function isn't accepting POST
**If 400 or 500:** Function is working, just rejecting invalid data (good!)

## Common Causes

| Cause | Fix |
|-------|-----|
| Function not deployed | Redeploy |
| Wrong export format | Use `export default` or `module.exports` |
| Cached old version | Redeploy without cache |
| vercel.json misconfiguration | Check/remove vercel.json |
| Wrong URL path | Verify exact path: `/api/stripe-webhook` |
| CORS blocking | Add OPTIONS handler |

## If Nothing Works: Alternative Approach

### Use Supabase Edge Function Directly

Instead of Vercel proxy, configure Stripe to call Supabase directly:

**1. Make Edge Function handle auth differently:**

In `supabase/functions/stripe-webhook/index.ts`, the function already uses signature verification, so it doesn't need the Authorization header from external calls.

**2. Update Stripe webhook URL to:**
```
https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
```

**3. Ensure webhook secret is set:**
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

This bypasses Vercel entirely.

## Summary

Most likely fix:
1. ✅ Redeploy to Vercel (without cache)
2. ✅ Verify exact URL: `/api/stripe-webhook`
3. ✅ Check Vercel logs for actual error
4. ✅ Test with curl to see real response

**Quick test:**
```bash
curl -X POST https://your-domain.vercel.app/api/stripe-webhook
```

Should NOT return 405 for POST request.

---

**Need immediate fix?** Use Supabase Edge Function directly (bypass Vercel proxy). See "Alternative Approach" above.
