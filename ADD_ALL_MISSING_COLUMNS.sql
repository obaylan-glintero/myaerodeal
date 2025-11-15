-- Add ALL missing columns to companies table
-- Run this in your Supabase SQL Editor

-- Add all required columns
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_email
ON companies(email);

CREATE INDEX IF NOT EXISTS idx_companies_approved
ON companies(approved);

CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer
ON companies(stripe_customer_id);

-- Add helpful comments
COMMENT ON COLUMN companies.email IS 'Primary contact email for the company';
COMMENT ON COLUMN companies.approved IS 'Whether company has been approved (via payment or manual approval)';
COMMENT ON COLUMN companies.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN companies.stripe_subscription_id IS 'Current active subscription ID';
COMMENT ON COLUMN companies.subscription_status IS 'active, inactive, canceled, past_due';

-- Verify all columns exist
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'companies'
AND column_name IN ('name', 'email', 'approved', 'stripe_customer_id', 'stripe_subscription_id', 'subscription_status')
ORDER BY column_name;
