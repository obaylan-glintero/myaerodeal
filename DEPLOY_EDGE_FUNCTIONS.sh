#!/bin/bash

# Supabase Edge Functions Deployment Script
# Run this in your Terminal

echo "🚀 Supabase Edge Functions Deployment"
echo "======================================"
echo ""

# Step 1: Login
echo "📝 Step 1: Login to Supabase"
echo "This will open your browser for authentication..."
npx supabase login

# Step 2: Get Project Reference
echo ""
echo "📝 Step 2: Find your Project Reference"
echo "Go to: https://app.supabase.com/project/_/settings/general"
echo "Copy the 'Reference ID' (looks like: abcdefghijklmnop)"
echo ""
read -p "Enter your Project Reference ID: " PROJECT_REF

# Step 3: Link Project
echo ""
echo "🔗 Step 3: Linking to your project..."
npx supabase link --project-ref $PROJECT_REF

# Step 4: Get Stripe Keys
echo ""
echo "📝 Step 4: We need your Stripe keys"
echo "Get them from: https://dashboard.stripe.com/test/apikeys"
echo ""
read -p "Enter your Stripe Secret Key (sk_test_...): " STRIPE_SECRET
read -p "Enter your Stripe Price ID (price_...): " PRICE_ID

# Step 5: Set Secrets
echo ""
echo "🔐 Step 5: Setting environment secrets..."
npx supabase secrets set STRIPE_SECRET_KEY=$STRIPE_SECRET
npx supabase secrets set STRIPE_PRICE_ID=$PRICE_ID

# Step 6: Deploy Functions
echo ""
echo "🚀 Step 6: Deploying Edge Functions..."
echo "Deploying create-checkout-session..."
npx supabase functions deploy create-checkout-session

echo ""
echo "Deploying stripe-webhook..."
npx supabase functions deploy stripe-webhook

# Step 7: Get URLs
echo ""
echo "✅ Deployment Complete!"
echo "======================================"
echo ""
echo "Your Edge Function URLs:"
echo "https://$PROJECT_REF.supabase.co/functions/v1/create-checkout-session"
echo "https://$PROJECT_REF.supabase.co/functions/v1/stripe-webhook"
echo ""
echo "📝 Next Steps:"
echo "1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/webhooks"
echo "2. Add endpoint: https://$PROJECT_REF.supabase.co/functions/v1/stripe-webhook"
echo "3. Select these events:"
echo "   - checkout.session.completed"
echo "   - customer.subscription.updated"
echo "   - customer.subscription.deleted"
echo "   - invoice.payment_succeeded"
echo "   - invoice.payment_failed"
echo "4. Copy the webhook signing secret (starts with whsec_)"
echo "5. Run: npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret"
echo ""
echo "🎉 Done! Ready to integrate with your app."
