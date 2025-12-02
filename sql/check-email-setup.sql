-- Run this in Supabase SQL Editor to check if email system is set up

-- Check if tables exist
SELECT 'email_templates table exists' as status
FROM information_schema.tables
WHERE table_name = 'email_templates';

SELECT 'email_logs table exists' as status
FROM information_schema.tables
WHERE table_name = 'email_logs';

-- Check if templates are loaded
SELECT
  'Templates loaded: ' || count(*)::text as status,
  string_agg(name, ', ') as template_names
FROM email_templates
WHERE is_system = true;

-- Check recent email logs (if any)
SELECT
  'Recent emails: ' || count(*)::text as status,
  max(sent_at) as last_email_sent
FROM email_logs;
