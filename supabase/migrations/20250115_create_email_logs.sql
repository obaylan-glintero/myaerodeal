-- Email logs table for tracking all sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sent_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Email details
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  template_name TEXT, -- e.g., 'welcome', 'task_reminder', 'lead_follow_up'

  -- Related records
  related_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  related_deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Email service response
  email_service_id TEXT, -- ID from Resend/SendGrid/etc
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'

  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- NULL = system template
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Template details
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,

  -- Template variables (JSON array of variable names)
  variables JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  category TEXT, -- 'welcome', 'follow_up', 'reminder', 'custom'
  is_system BOOLEAN DEFAULT false, -- system templates can't be deleted
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_company ON email_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_by ON email_logs(sent_by);
CREATE INDEX IF NOT EXISTS idx_email_logs_lead ON email_logs(related_lead_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_deal ON email_logs(related_deal_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

CREATE INDEX IF NOT EXISTS idx_email_templates_company ON email_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- RLS Policies for email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own email logs"
  ON email_logs
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their company email logs"
  ON email_logs
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company email logs"
  ON email_logs
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system and their company templates"
  ON email_templates
  FOR SELECT
  USING (
    is_system = true OR
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their company templates"
  ON email_templates
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company templates"
  ON email_templates
  FOR UPDATE
  USING (
    is_system = false AND
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their company templates"
  ON email_templates
  FOR DELETE
  USING (
    is_system = false AND
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_email_logs_updated_at
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER trigger_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

-- Insert default system email templates
INSERT INTO email_templates (name, subject, body_html, body_text, category, is_system, variables) VALUES
(
  'Welcome Email',
  'Welcome to MyAeroDeal!',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: linear-gradient(135deg, #0A1628 0%, #1a2f4a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;"><img src="https://myaerodeal.com/logo.png" alt="MyAeroDeal" style="height: 40px;"><h1 style="color: #D4AF37; margin: 15px 0 0 0; font-size: 24px;">Welcome to MyAeroDeal</h1></div><div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;"><p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi {{firstName}},</p><p style="color: #374151; font-size: 16px; line-height: 1.6;">Welcome to MyAeroDeal! We''re excited to have you on board.</p><p style="color: #374151; font-size: 16px; line-height: 1.6;">Your account for <strong>{{companyName}}</strong> has been successfully created. You can now start managing your leads, aircraft inventory, and deals all in one place.</p><div style="margin: 30px 0;"><a href="https://myaerodeal.com" style="background: #D4AF37; color: #0A1628; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Get Started</a></div><p style="color: #374151; font-size: 14px; line-height: 1.6; margin-top: 30px;">If you have any questions, just reply to this email or visit our help center.</p><p style="color: #374151; font-size: 14px;">Best regards,<br>The MyAeroDeal Team</p></div></body></html>',
  'Hi {{firstName}},\n\nWelcome to MyAeroDeal! We''re excited to have you on board.\n\nYour account for {{companyName}} has been successfully created. You can now start managing your leads, aircraft inventory, and deals all in one place.\n\nGet started: https://myaerodeal.com\n\nIf you have any questions, just reply to this email or visit our help center.\n\nBest regards,\nThe MyAeroDeal Team',
  'welcome',
  true,
  '["firstName", "companyName"]'::jsonb
),
(
  'Task Reminder',
  'Task Reminder: {{taskTitle}}',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: #0A1628; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;"><h2 style="color: #D4AF37; margin: 0;">Task Reminder</h2></div><div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;"><p style="color: #374151; font-size: 16px;">Hi {{firstName}},</p><p style="color: #374151; font-size: 16px;">This is a reminder about your upcoming task:</p><div style="background: #f9fafb; padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0;"><h3 style="color: #0A1628; margin: 0 0 10px 0;">{{taskTitle}}</h3><p style="color: #6b7280; margin: 5px 0;"><strong>Due:</strong> {{dueDate}}</p><p style="color: #6b7280; margin: 5px 0;"><strong>Priority:</strong> {{priority}}</p>{{#if description}}<p style="color: #374151; margin: 10px 0 0 0;">{{description}}</p>{{/if}}</div><a href="https://myaerodeal.com/tasks" style="background: #D4AF37; color: #0A1628; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View Task</a></div></body></html>',
  'Hi {{firstName}},\n\nThis is a reminder about your upcoming task:\n\nTask: {{taskTitle}}\nDue: {{dueDate}}\nPriority: {{priority}}\n\n{{description}}\n\nView your tasks: https://myaerodeal.com/tasks',
  'reminder',
  true,
  '["firstName", "taskTitle", "dueDate", "priority", "description"]'::jsonb
),
(
  'Lead Follow-up',
  'Following up on {{aircraftModel}}',
  '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><p>Hi {{leadName}},</p><p>I wanted to follow up regarding the {{aircraftManufacturer}} {{aircraftModel}} we discussed.</p><p>{{customMessage}}</p><p>Please let me know if you have any questions or would like to schedule a call to discuss further.</p><p>Best regards,<br>{{senderName}}<br>{{companyName}}</p></body></html>',
  'Hi {{leadName}},\n\nI wanted to follow up regarding the {{aircraftManufacturer}} {{aircraftModel}} we discussed.\n\n{{customMessage}}\n\nPlease let me know if you have any questions or would like to schedule a call to discuss further.\n\nBest regards,\n{{senderName}}\n{{companyName}}',
  'follow_up',
  true,
  '["leadName", "aircraftManufacturer", "aircraftModel", "customMessage", "senderName", "companyName"]'::jsonb
);
