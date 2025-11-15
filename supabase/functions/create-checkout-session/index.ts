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
    // Get request body (for coupon code)
    let couponCode = null
    try {
      const body = await req.json()
      couponCode = body?.coupon_code
    } catch (e) {
      // No body or invalid JSON - that's okay, coupon is optional
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase client with user's auth token (for authentication)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Initialize Supabase admin client (bypasses RLS for reading profile/company)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from auth token (validates authentication)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get user profile using admin client (bypasses RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('company_id, email')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Profile not found')
    }

    // Get company details using admin client (bypasses RLS)
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, name, email')
      .eq('id', profile.company_id)
      .single()

    if (companyError || !company) {
      throw new Error('Company not found')
    }

    // Get frontend URL for redirects
    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || 'http://localhost:3002'

    // Use production URL if coming from production
    const baseUrl = origin.includes('myaerodeal') && !origin.includes('vercel.app')
      ? 'https://myaerodeal.vercel.app' // Use Vercel URL instead of custom domain
      : origin

    console.log('Origin:', origin, 'Using baseUrl:', baseUrl)
    console.log('Coupon code received:', couponCode)

    // Build checkout session options
    const sessionOptions: any = {
      line_items: [
        {
          price: Deno.env.get('STRIPE_PRICE_ID'),
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/payment-success`,
      cancel_url: `${baseUrl}/payment-cancel`,
      customer_email: company.email || profile.email,
      client_reference_id: company.id,
      // Only collect payment method if required (skip for 100% off coupons)
      payment_method_collection: 'if_required',
      metadata: {
        company_id: company.id,
        company_name: company.name,
        user_id: user.id,
      },
    }

    // Add coupon/promotion code if provided
    if (couponCode && couponCode.trim()) {
      try {
        // Try to retrieve the coupon to validate it exists
        await stripe.coupons.retrieve(couponCode)
        sessionOptions.discounts = [{
          coupon: couponCode
        }]
        console.log('✅ Valid coupon code applied:', couponCode)
      } catch (error) {
        // If coupon doesn't exist, try as promotion code
        try {
          const promotionCodes = await stripe.promotionCodes.list({
            code: couponCode,
            active: true,
            limit: 1
          })
          if (promotionCodes.data.length > 0) {
            sessionOptions.discounts = [{
              promotion_code: promotionCodes.data[0].id
            }]
            console.log('✅ Valid promotion code applied:', couponCode)
          } else {
            console.log('⚠️ Invalid coupon/promotion code, proceeding without discount')
          }
        } catch (promoError) {
          console.log('⚠️ Error checking promotion code:', promoError.message)
        }
      }
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionOptions)

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
