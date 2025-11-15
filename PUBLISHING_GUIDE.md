# MyAeroDeal Publishing Guide

Complete guide to deploy MyAeroDeal to production.

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Supabase Production Setup](#supabase-production-setup)
5. [Frontend Deployment](#frontend-deployment)
6. [Domain & SSL Setup](#domain--ssl-setup)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Scaling Considerations](#scaling-considerations)

---

## Pre-Deployment Checklist

### Code Preparation
- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] Remove all `console.log()` debug statements (or use production logging)
- [ ] Update package.json name and version
- [ ] Verify all dependencies are in package.json
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Test with production environment variables

### Security Audit
- [ ] All API keys moved to environment variables
- [ ] No hardcoded secrets in code
- [ ] RLS policies tested and verified
- [ ] Strong password requirements enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] SQL injection prevention verified

### Performance Optimization
- [ ] Build and check bundle size: `npm run build`
- [ ] Optimize images (compress, use WebP)
- [ ] Enable lazy loading for routes
- [ ] Minify CSS/JS (Vite handles this)
- [ ] Configure caching headers

### Legal & Compliance
- [ ] Terms of Service written
- [ ] Privacy Policy written
- [ ] Cookie consent banner (if needed)
- [ ] GDPR compliance (if serving EU)
- [ ] Data retention policy
- [ ] Refund policy

---

## Environment Setup

### 1. Update package.json

```json
{
  "name": "myaerodeal",
  "version": "1.0.0",
  "description": "AI-Powered Jet Brokerage CRM",
  "private": true
}
```

### 2. Create Production Environment Variables

Create `.env.production`:

```env
# Supabase Production
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-production-key

# Gemini AI (if using)
VITE_GEMINI_API_KEY=your-production-gemini-key

# Stripe Production Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PRICE_ID=price_live_...

# Application URLs
VITE_APP_URL=https://myaerodeal.com
VITE_API_URL=https://api.myaerodeal.com
```

**⚠️ IMPORTANT:** Never commit `.env.production` to Git!

Add to `.gitignore`:
```
.env
.env.local
.env.production
.env.*.local
```

---

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Pros:**
- Free tier available
- Automatic SSL
- CDN included
- Git integration (auto-deploy on push)
- Serverless functions for API

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # From project root
   vercel

   # Follow prompts:
   # - Set up new project
   # - Link to Git repository (optional)
   # - Set environment variables
   ```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add all variables from `.env.production`
   - Redeploy if needed

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

**Custom Domain:**
- Go to Vercel Dashboard > Domains
- Add your domain (e.g., myaerodeal.com)
- Follow DNS configuration instructions

---

### Option 2: Netlify

**Pros:**
- Free tier available
- Easy Git integration
- Built-in form handling
- Serverless functions

**Steps:**

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and Deploy**
   ```bash
   netlify login
   netlify init
   netlify deploy --prod
   ```

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables in Netlify Dashboard

4. **Custom Domain**
   - Go to Domain settings in Netlify
   - Add custom domain
   - Configure DNS

---

### Option 3: AWS (S3 + CloudFront)

**Pros:**
- Highly scalable
- Pay-as-you-go
- Full control
- Global CDN

**Steps:**

1. **Build the App**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://myaerodeal-app
   ```

3. **Upload Build**
   ```bash
   aws s3 sync dist/ s3://myaerodeal-app --delete
   ```

4. **Configure S3 for Static Hosting**
   - Enable static website hosting
   - Set index.html as index document
   - Configure bucket policy for public read

5. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Enable HTTPS
   - Configure custom domain
   - Set cache behaviors

---

### Option 4: DigitalOcean App Platform

**Pros:**
- Simple deployment
- Managed infrastructure
- Built-in CI/CD
- Good pricing

**Steps:**

1. Create new App in DigitalOcean
2. Connect GitHub repository
3. Configure:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables
4. Deploy

---

## Supabase Production Setup

### 1. Create Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project (Production)
3. Note down:
   - Project URL
   - Anon/Public key
   - Service role key (keep secret!)

### 2. Set Up Database

**Option A: Manual Migration**
1. Go to SQL Editor in Supabase
2. Run all SQL scripts from development:
   - Table creation scripts
   - RLS policies
   - Functions
   - Triggers

**Option B: Use Supabase CLI** (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to production project
supabase link --project-ref [your-production-ref]

# Push local migrations
supabase db push

# Deploy functions
supabase functions deploy
```

### 3. Configure Production Database

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Apply all RLS policies from development
```

### 4. Configure Authentication

In Supabase Dashboard > Authentication:

- **Email Settings:**
  - Enable email confirmations
  - Configure SMTP (or use Supabase's)
  - Set up email templates

- **Security:**
  - Set minimum password length: 8
  - Enable password strength requirements
  - Configure session timeout

- **URL Configuration:**
  - Site URL: `https://myaerodeal.com`
  - Redirect URLs: Add all allowed callback URLs

### 5. Enable Realtime (if needed)

```sql
-- Enable realtime for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE aircraft;
ALTER PUBLICATION supabase_realtime ADD TABLE deals;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

### 6. Set Up Backups

In Supabase Dashboard:
- Configure automated daily backups
- Set retention period
- Test restore process

---

## Frontend Deployment

### 1. Build for Production

```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Run production build
npm run build

# Test production build locally
npm run preview
```

### 2. Verify Build Output

Check `dist/` folder:
- All assets generated
- Images optimized
- No source maps (unless intentional)
- index.html loads correctly

### 3. Configure Web Server

**For SPA (Single Page Application):**

All routes should redirect to `index.html`

**Vercel (automatic)**

Create `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Netlify (automatic)**

Create `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Nginx:**
```nginx
server {
    listen 80;
    server_name myaerodeal.com;
    root /var/www/myaerodeal/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Domain & SSL Setup

### 1. Purchase Domain

Recommended registrars:
- Namecheap
- Google Domains
- Cloudflare

### 2. Configure DNS

Point domain to your hosting:

**For Vercel:**
```
Type  Name  Value
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

**For Netlify:**
```
Type  Name  Value
A     @     75.2.60.5
CNAME www   [your-site].netlify.app
```

**For CloudFront:**
```
Type  Name  Value
A     @     (CloudFront distribution)
CNAME www   d1234.cloudfront.net
```

### 3. SSL Certificate

Most modern hosting platforms (Vercel, Netlify) provide automatic SSL via Let's Encrypt.

**For custom server:**
```bash
# Using Certbot
sudo certbot --nginx -d myaerodeal.com -d www.myaerodeal.com
```

### 4. Verify HTTPS

- Test: https://myaerodeal.com
- Check SSL rating: https://www.ssllabs.com/ssltest/
- Ensure HTTP redirects to HTTPS

---

## Post-Deployment Configuration

### 1. Update Stripe Settings

In Stripe Dashboard:

- **Account settings:**
  - Add business details
  - Upload logo
  - Set business address

- **Checkout settings:**
  - Success URL: `https://myaerodeal.com/payment-success`
  - Cancel URL: `https://myaerodeal.com/payment-cancel`

- **Customer Portal:**
  - Enable customer portal
  - Allow subscription cancellation
  - Allow payment method updates

- **Webhook endpoints:**
  - Update to production URLs
  - Verify webhook signing secrets

### 2. Configure Email Service

**Supabase SMTP:**
- Go to Project Settings > Auth
- Add custom SMTP settings:
  - Host: smtp.sendgrid.net (or your provider)
  - Port: 587
  - Username: apikey
  - Password: [your-sendgrid-api-key]

**Email Templates:**
- Customize welcome email
- Password reset email
- Subscription confirmation

### 3. Set Up Analytics

**Google Analytics:**
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Alternative:** Use Plausible, PostHog, or Mixpanel

### 4. Error Tracking

**Install Sentry:**
```bash
npm install @sentry/react
```

**Configure:**
```javascript
// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### 5. Set Up Monitoring

**Uptime Monitoring:**
- UptimeRobot (free)
- Pingdom
- Better Uptime

**Application Monitoring:**
- Sentry (errors)
- LogRocket (session replay)
- New Relic (performance)

### 6. Create Status Page

Use:
- status.io
- statuspage.io
- cState (self-hosted)

---

## Security Hardening

### 1. Content Security Policy (CSP)

Add to index.html or configure in hosting:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' 'unsafe-eval' *.stripe.com *.google.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' *.supabase.co *.stripe.com;">
```

### 2. Security Headers

Configure in hosting platform:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 3. Rate Limiting

Implement at:
- Supabase Edge Functions
- API endpoints
- Login attempts (use Supabase auth settings)

### 4. DDoS Protection

Use:
- Cloudflare (free tier includes protection)
- AWS Shield
- Vercel/Netlify (built-in)

---

## Performance Optimization

### 1. Enable Compression

Most hosting platforms enable Gzip/Brotli automatically.

### 2. CDN Configuration

- Cache static assets (JS, CSS, images)
- Set proper Cache-Control headers
- Use CDN for images

### 3. Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_leads_company_id ON leads(company_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_deals_company_id ON deals(company_id);
CREATE INDEX idx_deals_status ON deals(status);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM leads WHERE company_id = 'xxx';
```

### 4. Image Optimization

- Use WebP format
- Implement lazy loading
- Use image CDN (Cloudinary, imgix)
- Optimize logo files

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Check error logs (Sentry)
- [ ] Monitor uptime status
- [ ] Check Stripe dashboard for failed payments

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check database size/usage
- [ ] Review user feedback
- [ ] Monitor conversion rates

### Monthly Tasks
- [ ] Security audit
- [ ] Database backup verification
- [ ] Update dependencies (`npm outdated`)
- [ ] Review and optimize slow queries
- [ ] Analyze user behavior (analytics)

### Quarterly Tasks
- [ ] Major dependency updates
- [ ] Security penetration testing
- [ ] Disaster recovery test
- [ ] Review and update Terms of Service
- [ ] Review and update Privacy Policy

---

## Scaling Considerations

### Database Scaling

**When to scale:**
- Query response time > 500ms
- Database CPU > 80%
- Storage > 80% capacity

**Options:**
- Upgrade Supabase plan
- Add read replicas
- Optimize queries and indexes
- Implement caching (Redis)

### Application Scaling

Vercel/Netlify handle this automatically.

For custom servers:
- Horizontal scaling (load balancer + multiple instances)
- Vertical scaling (bigger server)

### Cost Optimization

**Monitor usage:**
- Supabase: Database size, API calls
- Stripe: Transaction volume, fees
- Hosting: Bandwidth, build minutes
- AI APIs: Token usage

**Optimize:**
- Implement caching
- Optimize database queries
- Compress assets
- Use CDN for static files

---

## Rollback Plan

### If deployment fails:

1. **Vercel/Netlify:**
   - Go to Dashboard > Deployments
   - Click on previous successful deployment
   - Click "Promote to Production"

2. **Manual deployment:**
   ```bash
   # Revert to previous version
   git log  # Find previous commit
   git revert [commit-hash]
   git push origin main
   ```

3. **Database issues:**
   ```bash
   # Restore from backup
   supabase db restore [backup-id]
   ```

### Emergency Contacts

Create a document with:
- Hosting provider support
- Domain registrar support
- Payment processor support
- Database administrator contacts

---

## Launch Checklist

### T-7 Days (1 Week Before)
- [ ] Complete all development
- [ ] Test all features thoroughly
- [ ] Run security audit
- [ ] Prepare marketing materials
- [ ] Write blog post/announcement
- [ ] Set up social media accounts

### T-3 Days
- [ ] Deploy to staging environment
- [ ] Full end-to-end testing
- [ ] Load testing
- [ ] Invite beta users (optional)
- [ ] Fix any critical bugs

### T-1 Day
- [ ] Deploy to production
- [ ] Verify all services working
- [ ] Test payment flow
- [ ] Monitor error logs
- [ ] Prepare customer support

### Launch Day
- [ ] Final smoke test
- [ ] Send announcement emails
- [ ] Post on social media
- [ ] Monitor closely for first 24 hours
- [ ] Be ready for support requests

### T+1 Week
- [ ] Analyze metrics
- [ ] Collect user feedback
- [ ] Fix any reported bugs
- [ ] Optimize based on usage patterns
- [ ] Send follow-up emails

---

## Production Environment Variables Summary

Create a secure document (1Password, LastPass) with:

```
# Production URLs
App URL: https://myaerodeal.com
API URL: https://[project-ref].supabase.co

# Supabase
Project Ref: [ref]
URL: https://[ref].supabase.co
Anon Key: [public-key]
Service Role Key: [SECRET - never expose!]

# Stripe
Publishable Key: pk_live_...
Secret Key: sk_live_... [SECRET]
Webhook Secret: whsec_... [SECRET]
Price ID: price_...

# Other
Gemini API Key: [if using]
Sentry DSN: [if using]
Google Analytics ID: G-...
```

---

## Support Resources

### Documentation
- Vite: https://vitejs.dev/
- React: https://react.dev/
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- Vercel: https://vercel.com/docs

### Community
- Supabase Discord
- React Discord
- Stack Overflow

### Paid Support
- Consider Supabase paid support plan
- Stripe support (included)
- Hosting provider support

---

## Cost Estimates (Monthly)

### Minimum (0-100 users)
- Hosting (Vercel/Netlify): $0 (free tier)
- Supabase: $0-25 (free/pro tier)
- Stripe: 2.9% + $0.30 per transaction
- Domain: $1-2/month
- **Total: ~$50-100/month** (including transactions)

### Growing (100-1000 users)
- Hosting: $20-50
- Supabase: $25-100
- Stripe fees: ~$300-3000
- CDN/monitoring: $20-50
- **Total: ~$500-3500/month**

### Scaling (1000+ users)
- Hosting: $100-500
- Supabase: $100-500+
- Stripe fees: $3000+
- Additional services: $100-500
- **Total: $3500+/month**

---

## Next Steps

1. Review this guide completely
2. Answer questions in STRIPE_IMPLEMENTATION_PLAN.md
3. Set up Stripe account and test mode
4. Create Supabase production project
5. Choose hosting platform
6. Start with staging deployment first
7. Test thoroughly before production launch

Good luck with your launch! 🚀
