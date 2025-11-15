import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Get webhook signing secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured')
    }

    // Get raw body
    const body = await req.text()

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        Stripe.createSubtleCryptoProvider()
      )
    } catch (err) {
      console.error('⚠️  Webhook signature verification failed.', err.message)
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('✅ Webhook verified:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('💳 Checkout completed for company:', session.metadata?.company_id)

        // Get company ID from metadata
        const companyId = session.metadata?.company_id || session.client_reference_id

        if (!companyId) {
          console.error('❌ No company ID in session metadata')
          break
        }

        // Update company to approved with Stripe info
        const { error: updateError } = await supabaseAdmin
          .from('companies')
          .update({
            approved: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
          })
          .eq('id', companyId)

        if (updateError) {
          console.error('❌ Error updating company:', updateError)
          throw updateError
        }

        // Create payment record
        const { error: paymentError } = await supabaseAdmin
          .from('payments')
          .insert({
            company_id: companyId,
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'succeeded',
          })

        if (paymentError) {
          console.error('⚠️  Error creating payment record:', paymentError)
        }

        // Send welcome email to the user
        try {
          // Get primary user for this company
          const { data: primaryUser } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('company_id', companyId)
            .order('created_at', { ascending: true })
            .limit(1)
            .single()

          if (primaryUser) {
            // Call send-welcome-email function
            const welcomeEmailResponse = await fetch(
              `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-welcome-email`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: primaryUser.id,
                  companyId: companyId
                })
              }
            )

            if (welcomeEmailResponse.ok) {
              console.log('✅ Welcome email sent to:', primaryUser.email)
            } else {
              console.error('⚠️  Error sending welcome email:', await welcomeEmailResponse.text())
            }
          }
        } catch (emailError) {
          console.error('⚠️  Error sending welcome email:', emailError)
          // Don't fail the webhook if email fails
        }

        console.log('✅ Company approved and subscription activated:', companyId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        console.log('🔄 Subscription updated:', subscription.id)

        // Find company by stripe_customer_id
        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (company) {
          await supabaseAdmin
            .from('companies')
            .update({
              subscription_status: subscription.status,
              subscription_end_date: subscription.cancel_at
                ? new Date(subscription.cancel_at * 1000).toISOString()
                : null,
            })
            .eq('id', company.id)

          console.log('✅ Subscription status updated:', subscription.status)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        console.log('❌ Subscription deleted:', subscription.id)

        // Find company by stripe_customer_id
        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (company) {
          await supabaseAdmin
            .from('companies')
            .update({
              subscription_status: 'canceled',
              approved: false, // Disable access when subscription ends
              subscription_end_date: new Date().toISOString(),
            })
            .eq('id', company.id)

          console.log('✅ Company subscription canceled:', company.id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice

        console.log('✅ Invoice paid:', invoice.id)

        // Find company by stripe_customer_id
        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('id')
          .eq('stripe_customer_id', invoice.customer)
          .single()

        if (company && invoice.subscription) {
          // Ensure subscription is active after successful payment
          await supabaseAdmin
            .from('companies')
            .update({
              subscription_status: 'active',
              approved: true,
            })
            .eq('id', company.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        console.log('⚠️  Invoice payment failed:', invoice.id)

        // Find company by stripe_customer_id
        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('id')
          .eq('stripe_customer_id', invoice.customer)
          .single()

        if (company) {
          // Mark subscription as past_due
          await supabaseAdmin
            .from('companies')
            .update({
              subscription_status: 'past_due',
            })
            .eq('id', company.id)

          console.log('⚠️  Company subscription marked past_due:', company.id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
