-- Add Stripe columns to companies table
-- Run this in your Supabase SQL Editor

-- Add Stripe-related columns to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Create index for faster Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer
ON companies(stripe_customer_id);

-- Create payments table for tracking payment history
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- succeeded, pending, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_company ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(stripe_session_id);

-- Add RLS policies for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Companies can view their own payments
CREATE POLICY "Companies can view own payments"
ON payments FOR SELECT
USING (company_id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
));

-- Only authenticated users can insert payments (via Edge Functions)
CREATE POLICY "Allow authenticated inserts"
ON payments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Update companies RLS to check subscription status (optional)
-- Uncomment if you want to require active subscription for app access
/*
DROP POLICY IF EXISTS "Users can only access their company data" ON leads;
CREATE POLICY "Users can only access their company data"
ON leads FOR ALL
USING (company_id = (
  SELECT company_id FROM profiles
  WHERE id = auth.uid()
  AND (SELECT subscription_status FROM companies WHERE id = company_id) = 'active'
));

-- Apply similar policy to other tables: aircraft, deals, tasks
*/

-- Add helpful comments
COMMENT ON COLUMN companies.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN companies.stripe_subscription_id IS 'Current active subscription ID';
COMMENT ON COLUMN companies.subscription_status IS 'active, inactive, canceled, past_due';
COMMENT ON TABLE payments IS 'Payment history for audit and tracking';
