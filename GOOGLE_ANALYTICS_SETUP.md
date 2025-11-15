# Google Analytics 4 Setup Guide

## Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **"Start measuring"** or **"Admin"** → **"Create Account"**
3. Fill in account details:
   - Account name: `MyAeroDeal`
   - Check sharing settings as needed
4. Click **"Next"**

## Step 2: Create Property

1. Property name: `MyAeroDeal Production`
2. Time zone: Select your timezone
3. Currency: USD
4. Click **"Next"**

## Step 3: Configure Business Details

1. Industry category: **Business & Industrial Markets**
2. Business size: Select your size
3. How you intend to use Google Analytics: Check relevant options
4. Click **"Create"**
5. Accept Terms of Service

## Step 4: Set Up Data Stream

1. Choose platform: **Web**
2. Website URL: `https://myaerodeal.com` (or your custom domain)
3. Stream name: `MyAeroDeal Web App`
4. Click **"Create stream"**

## Step 5: Get Your Measurement ID

1. After creating the stream, you'll see your **Measurement ID** (format: `G-XXXXXXXXXX`)
2. Copy this ID - you'll need it for the next step

## Step 6: Add Measurement ID to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **MyAeroDeal** project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Key**: `VITE_GA_MEASUREMENT_ID`
   - **Value**: `G-XXXXXXXXXX` (your Measurement ID from step 5)
   - **Environment**: Check all (Production, Preview, Development)
5. Click **"Save"**
6. **Redeploy** your application (Deployments → click ••• → Redeploy)

## Step 7: Verify Tracking Works

### Test in Real-Time

1. Go to Google Analytics → **Reports** → **Real-time**
2. Open your deployed app: `https://myaerodeal.com`
3. Navigate around the app (view leads, aircraft, deals)
4. You should see activity appear in the Real-time report within 30 seconds

### Check Debug View (Optional)

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) Chrome extension
2. Enable the extension
3. Open browser console (F12)
4. Navigate your app - you'll see GA events being sent

## What Gets Tracked Automatically

✅ **Page Views** - Every page navigation
✅ **Sessions** - User sessions and duration
✅ **User Demographics** - Location, device, browser
✅ **Engagement** - Time on page, scroll depth

## Custom Events Being Tracked

The app tracks these custom events:

### Lead Management
- `lead_created` - When a new lead is added
- `lead_updated` - When a lead is modified
- `lead_deleted` - When a lead is removed
- `lead_converted_to_deal` - When a lead becomes a deal

### Aircraft Management
- `aircraft_created` - New aircraft added
- `aircraft_updated` - Aircraft details modified
- `aircraft_presented` - Aircraft shown to a lead

### Deal Tracking
- `deal_created` - New deal created (with value)
- `deal_updated` - Deal modified
- `deal_won` - Deal closed successfully (with value)
- `deal_lost` - Deal lost
- `deal_stage_changed` - Deal stage updated

### Tasks
- `task_created` - New task added
- `task_completed` - Task marked as done

### Documents
- `document_uploaded` - File uploaded
- `document_viewed` - Document opened
- `pdf_exported` - Report generated

### AI Features
- `ai_assistant_used` - AI assistant opened
- `ai_data_extracted` - AI extracted data from document

### Authentication
- `sign_up` - New user registered
- `login` - User logged in
- `logout` - User logged out

## Viewing Reports

### Key Reports to Check

**Acquisition Reports**
- How users find your app (direct, referral, etc.)
- Which marketing channels work best

**Engagement Reports**
- Most viewed pages
- User flow through the app
- Features used most

**Monetization Reports** (if you add ecommerce tracking)
- Subscription revenue
- Conversion rates

### Custom Event Reports

1. Go to **Explore** → **Blank**
2. Add dimensions: `event_name`, `page_path`
3. Add metrics: `event_count`, `total_users`
4. Build custom reports for your needs

## Privacy & Compliance

✅ **IP Anonymization**: Already enabled
✅ **Cookie Consent**: Consider adding a cookie banner
✅ **GDPR Compliance**: Review Google Analytics GDPR settings
✅ **Data Retention**: Set appropriate retention in GA Admin

## Troubleshooting

### Not seeing any data?

1. Check Measurement ID is correctly set in Vercel
2. Verify app is redeployed after adding env variable
3. Check browser console for errors (F12)
4. Ensure ad blockers are disabled for testing
5. Wait 24-48 hours for full reports to populate (real-time works immediately)

### Events not showing up?

1. Check **Reports** → **Real-time** → **Events**
2. Go to **Configure** → **Events** to see all tracked events
3. Custom events may take 24 hours to appear in standard reports

## Advanced: Adding More Tracking

If you want to track additional events, edit `/src/utils/analytics.js`:

```javascript
// Example: Track email sent
export const analytics = {
  // ...existing events...

  emailSent: (to, template) => trackEvent('email_sent', {
    event_category: 'emails',
    event_label: template,
    recipient: to
  }),
};
```

Then use in your code:

```javascript
import analytics from './utils/analytics';

// When sending email
await sendEmail(to, subject, body);
analytics.emailSent(to, 'welcome');
```

## Need Help?

- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [GA4 Reports Guide](https://support.google.com/analytics/answer/9212670)
