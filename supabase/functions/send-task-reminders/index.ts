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
    // Initialize Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all pending tasks due today or overdue
    const today = new Date().toISOString().split('T')[0]

    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        assigned_to:profiles!tasks_assignedTo_fkey(id, first_name, last_name, email, company_id),
        companies!tasks_company_id_fkey(name)
      `)
      .eq('status', 'pending')
      .lte('dueDate', today)

    if (tasksError) {
      throw tasksError
    }

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No tasks due today' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Get task reminder template
    const { data: template } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('name', 'Task Reminder')
      .eq('is_system', true)
      .single()

    if (!template) {
      throw new Error('Task reminder template not found')
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('Resend API key not configured')
    }

    const emailsSent = []
    const errors = []

    // Send reminder email for each task
    for (const task of tasks) {
      try {
        const assignee = task.assigned_to

        if (!assignee || !assignee.email) {
          continue
        }

        // Prepare variables
        const variables = {
          firstName: assignee.first_name || 'there',
          taskTitle: task.title,
          dueDate: new Date(task.dueDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
          description: task.description || 'No description provided'
        }

        // Replace variables in template
        let emailSubject = template.subject
        let emailHtml = template.body_html
        let emailText = template.body_text

        for (const [key, value] of Object.entries(variables)) {
          const placeholder = `{{${key}}}`
          emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), value)
          emailHtml = emailHtml.replace(new RegExp(placeholder, 'g'), value)
          if (emailText) {
            emailText = emailText.replace(new RegExp(placeholder, 'g'), value)
          }
        }

        // Remove conditional blocks for simplicity (Handlebars-like syntax)
        // Remove {{#if description}}...{{/if}} blocks
        emailHtml = emailHtml.replace(/{{#if.*?}}(.*?){{\/if}}/gs, '$1')
        if (emailText) {
          emailText = emailText.replace(/{{#if.*?}}(.*?){{\/if}}/gs, '$1')
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
            to: [assignee.email],
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
          }),
        })

        const resendData = await resendResponse.json()

        if (!resendResponse.ok) {
          errors.push({
            taskId: task.id,
            error: resendData
          })
          continue
        }

        // Log email
        await supabaseAdmin
          .from('email_logs')
          .insert({
            company_id: task.company_id,
            sent_by: assignee.id, // System sent on behalf of user
            recipient_email: assignee.email,
            subject: emailSubject,
            template_name: 'Task Reminder',
            related_task_id: task.id,
            email_service_id: resendData.id,
            status: 'sent',
          })

        emailsSent.push({
          taskId: task.id,
          emailId: resendData.id,
          to: assignee.email
        })
      } catch (error) {
        errors.push({
          taskId: task.id,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailsSent.length,
        errors: errors.length,
        details: { emailsSent, errors }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending task reminders:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
