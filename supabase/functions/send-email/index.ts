import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  templateName?: string
  subject?: string
  htmlBody?: string
  textBody?: string
  variables?: Record<string, any>
  relatedLeadId?: string
  relatedDealId?: string
  relatedTaskId?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request data
    const body: EmailRequest = await req.json()
    const {
      to,
      templateName,
      subject,
      htmlBody,
      textBody,
      variables = {},
      relatedLeadId,
      relatedDealId,
      relatedTaskId
    } = body

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get user profile and company
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*, companies(*)')
      .eq('id', user.id)
      .single()

    if (!profile) {
      throw new Error('Profile not found')
    }

    let emailSubject = subject
    let emailHtml = htmlBody
    let emailText = textBody
    let usedTemplateName = templateName

    // If template name provided, fetch template
    if (templateName) {
      const { data: template, error: templateError } = await supabaseAdmin
        .from('email_templates')
        .select('*')
        .or(`is_system.eq.true,company_id.eq.${profile.company_id}`)
        .eq('name', templateName)
        .eq('is_active', true)
        .single()

      if (templateError || !template) {
        throw new Error(`Template "${templateName}" not found`)
      }

      emailSubject = template.subject
      emailHtml = template.body_html
      emailText = template.body_text

      // Replace variables in template
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`
        emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), value)
        emailHtml = emailHtml.replace(new RegExp(placeholder, 'g'), value)
        if (emailText) {
          emailText = emailText.replace(new RegExp(placeholder, 'g'), value)
        }
      }
    }

    if (!emailSubject || !emailHtml) {
      throw new Error('Email subject and body are required')
    }

    // Get Resend API key from Vault
    const { data: secrets } = await supabaseAdmin.rpc('get_secret', {
      secret_name: 'resend_api_key'
    })
    const resendApiKey = secrets || Deno.env.get('RESEND_API_KEY')

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
        to: [to],
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      throw new Error(`Resend error: ${JSON.stringify(resendData)}`)
    }

    // Log email in database
    const { error: logError } = await supabaseAdmin
      .from('email_logs')
      .insert({
        company_id: profile.company_id,
        sent_by: user.id,
        recipient_email: to,
        subject: emailSubject,
        template_name: usedTemplateName,
        related_lead_id: relatedLeadId || null,
        related_deal_id: relatedDealId || null,
        related_task_id: relatedTaskId || null,
        email_service_id: resendData.id,
        status: 'sent',
      })

    if (logError) {
      console.error('Error logging email:', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailId: resendData.id,
        message: 'Email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
