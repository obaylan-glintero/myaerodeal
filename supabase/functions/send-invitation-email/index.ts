import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationEmailRequest {
  invitationId: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request data
    const body: InvitationEmailRequest = await req.json()
    const { invitationId } = body

    if (!invitationId) {
      throw new Error('invitationId is required')
    }

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

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('user_invitations')
      .select(`
        *,
        companies (
          id,
          name
        ),
        invited_by_profile:profiles!user_invitations_invited_by_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', invitationId)
      .single()

    if (invitationError || !invitation) {
      throw new Error('Invitation not found')
    }

    // Verify the user has permission to send this invitation
    if (invitation.invited_by !== user.id) {
      throw new Error('Unauthorized to send this invitation')
    }

    // Build invitation URL
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
    const invitationUrl = `${appUrl}?invitation=${invitation.token}`

    // Prepare email variables
    const inviterName = invitation.invited_by_profile
      ? `${invitation.invited_by_profile.first_name} ${invitation.invited_by_profile.last_name}`.trim()
      : 'Your administrator'

    const companyName = invitation.companies?.name || 'the team'

    // Get the email template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('name', 'user-invitation')
      .eq('is_system', true)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      throw new Error('Email template not found')
    }

    // Replace variables in template
    const variables = {
      company_name: companyName,
      inviter_name: inviterName,
      invitation_url: invitationUrl
    }

    let emailSubject = template.subject
    let emailHtml = template.body_html
    let emailText = template.body_text

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g')
      emailSubject = emailSubject.replace(placeholder, value)
      emailHtml = emailHtml.replace(placeholder, value)
      if (emailText) {
        emailText = emailText.replace(placeholder, value)
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
        to: [invitation.email],
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
        company_id: invitation.company_id,
        sent_by: user.id,
        recipient_email: invitation.email,
        subject: emailSubject,
        template_name: 'user-invitation',
        email_service_id: resendData.id,
        status: 'sent',
      })

    if (logError) {
      console.error('Error logging email:', logError)
    }

    // Update invitation to track that email was sent
    await supabaseAdmin
      .from('user_invitations')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId)

    return new Response(
      JSON.stringify({
        success: true,
        emailId: resendData.id,
        message: `Invitation email sent to ${invitation.email}`,
        invitationUrl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending invitation email:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
