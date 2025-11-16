// Vercel Serverless Function: Cancel Stripe Subscription
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log('📥 Cancel subscription request received');

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscriptionId, companyId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Missing subscription ID' });
    }

    if (!companyId) {
      return res.status(400).json({ error: 'Missing company ID' });
    }

    console.log('🔍 Canceling subscription:', subscriptionId, 'for company:', companyId);

    // Cancel the subscription in Stripe
    // at_period_end: true means access continues until the end of the billing period
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    console.log('✅ Stripe subscription canceled:', canceledSubscription.id);

    // Update the company record in Supabase
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        subscription_status: 'canceling', // Will be 'canceled' after period ends
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (updateError) {
      console.error('⚠️  Error updating company:', updateError);
      throw new Error(`Failed to update company: ${updateError.message}`);
    }

    console.log('✅ Company record updated');

    return res.status(200).json({
      success: true,
      message: 'Subscription canceled successfully',
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancel_at_period_end: canceledSubscription.cancel_at_period_end,
        current_period_end: canceledSubscription.current_period_end
      }
    });

  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to cancel subscription',
      details: error.toString()
    });
  }
}
