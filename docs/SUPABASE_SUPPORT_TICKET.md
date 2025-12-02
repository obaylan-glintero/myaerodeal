# Supabase Support Ticket

## Issue: Edge Functions Returning 401 for Webhook Requests

**Project ID:** dpqjgogloaokggvafrsw

**Problem:**
All Edge Functions in my project return `401 {"code":401,"message":"Missing authorization header"}` even for simple POST requests without authentication. This blocks Stripe webhooks from working.

**Steps to Reproduce:**
1. Deploy any Edge Function (e.g., stripe-webhook)
2. Send POST request without Authorization header:
```bash
curl -X POST https://dpqjgogloaokggvafrsw.supabase.co/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```
3. Response: 401 "Missing authorization header"

**Expected Behavior:**
Edge Functions should accept POST requests from external webhooks (like Stripe) without requiring authorization headers.

**What I've Tried:**
- Added `?apikey=ANON_KEY` query parameter → still 401
- Deployed multiple test functions → all return 401
- Checked all dashboard settings → no obvious auth requirement toggle

**Question:**
Is there a project-level setting that requires authentication for ALL Edge Functions? How can I allow public access to webhook endpoints while keeping other functions secure?

**Use Case:**
Need to receive Stripe webhook events at `/functions/v1/stripe-webhook` endpoint. Stripe cannot send Authorization headers.

**Request:**
Please help configure my project to allow unauthenticated POST requests to Edge Functions for webhook endpoints.
