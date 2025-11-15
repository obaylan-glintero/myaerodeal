import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // This function is called by Stripe webhook after subscription created
    const { userId, companyId } = await req.json()

    if (!userId || !companyId) {
      throw new Error('Missing userId or companyId')
    }

    // Initialize Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user and company details
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*, companies(*)')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new Error('Profile not found')
    }

    const { data: template } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('name', 'Welcome Email')
      .eq('is_system', true)
      .single()

    if (!template) {
      throw new Error('Welcome email template not found')
    }

    // Prepare email content
    const variables = {
      firstName: profile.first_name || 'there',
      companyName: profile.companies?.name || 'your company'
    }

    let emailSubject = template.subject
    let emailHtml = template.body_html
    let emailText = template.body_text

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`
      emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), value)
      emailHtml = emailHtml.replace(new RegExp(placeholder, 'g'), value)
      if (emailText) {
        emailText = emailText.replace(new RegExp(placeholder, 'g'), value)
      }
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('Resend API key not configured')
    }

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'MyAeroDeal <onboarding@resend.dev>',
        to: [profile.email],
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      throw new Error(`Resend error: ${JSON.stringify(resendData)}`)
    }

    // Log email
    await supabaseAdmin
      .from('email_logs')
      .insert({
        company_id: companyId,
        sent_by: userId,
        recipient_email: profile.email,
        subject: emailSubject,
        template_name: 'Welcome Email',
        email_service_id: resendData.id,
        status: 'sent',
      })

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
