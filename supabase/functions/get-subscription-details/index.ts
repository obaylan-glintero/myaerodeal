import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Profile not found')
    }

    // Get company details
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('stripe_customer_id, stripe_subscription_id, subscription_status')
      .eq('id', profile.company_id)
      .single()

    if (companyError || !company) {
      throw new Error('Company not found')
    }

    if (!company.stripe_customer_id || !company.stripe_subscription_id) {
      return new Response(
        JSON.stringify({
          error: 'No subscription found',
          hasSubscription: false
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Fetch subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(company.stripe_subscription_id, {
      expand: ['default_payment_method', 'latest_invoice']
    })

    // Fetch customer details from Stripe
    const customer = await stripe.customers.retrieve(company.stripe_customer_id)

    // Extract payment method details
    let paymentMethod = null
    if (subscription.default_payment_method && typeof subscription.default_payment_method === 'object') {
      const pm = subscription.default_payment_method as Stripe.PaymentMethod
      paymentMethod = {
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year,
        } : null
      }
    }

    // Extract subscription details
    const subscriptionDetails = {
      id: subscription.id,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      trial_start: subscription.trial_start,
      trial_end: subscription.trial_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at,
      plan: {
        amount: subscription.items.data[0]?.price.unit_amount || 0,
        currency: subscription.items.data[0]?.price.currency || 'usd',
        interval: subscription.items.data[0]?.price.recurring?.interval || 'month',
      },
      paymentMethod,
    }

    // Calculate amount to be charged (if any)
    let upcomingInvoice = null
    if (subscription.status === 'trialing' || subscription.status === 'active') {
      try {
        const invoice = await stripe.invoices.retrieveUpcoming({
          customer: company.stripe_customer_id,
        })
        upcomingInvoice = {
          amount_due: invoice.amount_due,
          currency: invoice.currency,
          next_payment_attempt: invoice.next_payment_attempt,
          period_start: invoice.period_start,
          period_end: invoice.period_end,
        }
      } catch (e) {
        // Upcoming invoice might not exist
        console.log('No upcoming invoice found')
      }
    }

    return new Response(
      JSON.stringify({
        hasSubscription: true,
        subscription: subscriptionDetails,
        upcomingInvoice,
        customerEmail: typeof customer !== 'string' ? customer.email : null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error fetching subscription details:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
