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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: Deno.env.get('STRIPE_PRICE_ID'),
          quantity: 1,
        },
      ],
      mode: 'subscription', // or 'payment' for one-time
      success_url: `${baseUrl}/payment-success`,
      cancel_url: `${baseUrl}/payment-cancel`,
      customer_email: company.email || profile.email,
      client_reference_id: company.id,
      metadata: {
        company_id: company.id,
        company_name: company.name,
        user_id: user.id,
      },
    })

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
