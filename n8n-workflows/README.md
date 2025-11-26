# N8N Aircraft Lead Matcher Workflow

This n8n workflow automatically checks your Gmail for aircraft for sale emails every morning, compares them to your active leads in MyAeroDeal, and sends you notifications about matches.

## 🎯 What It Does

1. **Runs every morning at 8 AM** (configurable)
2. **Fetches unread emails** from Gmail with subjects containing aircraft-related keywords
3. **Parses aircraft details** from email content (manufacturer, model, year, price, category)
4. **Queries active leads** from your Supabase database (status: Inquiry, Presented, or Interested)
5. **Matches aircraft to leads** based on:
   - Aircraft type/category match
   - Budget compatibility
   - Year preference range
6. **Sends notifications** via Email and/or Telegram with match details
7. **Marks emails as read** after processing

## 📋 Prerequisites

### 1. N8N Installation

You can use n8n in several ways:

**Option A: N8N Cloud** (Easiest)
- Sign up at [n8n.cloud](https://n8n.cloud)
- No installation required

**Option B: Self-Hosted Docker**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Option C: NPM Installation**
```bash
npm install n8n -g
n8n start
```

### 2. Required Credentials

You'll need to set up the following credentials in n8n:

#### Gmail OAuth2
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5678/rest/oauth2-credential/callback`
6. In n8n: Create new credential → Gmail OAuth2
7. Enter Client ID and Client Secret
8. Authenticate with your Google account

#### Supabase API
1. Get your Supabase URL and API Key from your project settings
2. In n8n: Create new credential → HTTP Header Auth
3. Add header: `apikey` with your Supabase anon key
4. Add header: `Authorization` with value `Bearer YOUR_SUPABASE_ANON_KEY`

**Alternative:** Use Supabase Service Role Key for full access (recommended for automation)

#### Telegram Bot (Optional)
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot with `/newbot` command
3. Get your bot token
4. Get your Chat ID by messaging [@userinfobot](https://t.me/userinfobot)
5. In n8n: Create new credential → Telegram API
6. Enter your bot token

### 3. Environment Variables

Set these in your n8n environment:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
# OR
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🚀 Installation

### Step 1: Import Workflow

1. Open your n8n instance (usually http://localhost:5678)
2. Click **"Add workflow"** → **"Import from File"**
3. Select `aircraft-lead-matcher.json`
4. The workflow will be imported with all nodes configured

### Step 2: Configure Credentials

Update the following placeholder values in the workflow:

1. **Gmail nodes** (3 nodes):
   - Node: "Fetch Aircraft Emails"
   - Node: "Send Email Notification"
   - Node: "Mark Email as Read"
   - Set credential: Select your Gmail OAuth2 credential

2. **Supabase node**:
   - Node: "Fetch Active Leads"
   - Update URL: Replace `{{ $env.SUPABASE_URL }}` with your Supabase URL
   - Set credential: Select your Supabase API credential

3. **Email notification node**:
   - Node: "Send Email Notification"
   - Update `sendTo`: Replace `YOUR_EMAIL@example.com` with your email

4. **Telegram node** (Optional):
   - Node: "Send Telegram Notification"
   - Update `chatId`: Replace `YOUR_TELEGRAM_CHAT_ID` with your chat ID
   - Set credential: Select your Telegram API credential
   - If you don't want Telegram notifications, you can delete this node

### Step 3: Customize Search Query

In the **"Fetch Aircraft Emails"** node, you can customize the Gmail search query:

```
is:unread subject:(aircraft for sale OR aircraft available OR jet for sale OR plane for sale)
```

Add more keywords or filters as needed:
- Add specific manufacturers: `subject:(Gulfstream OR Bombardier)`
- Add sender filters: `from:broker@example.com`
- Add date filters: `after:2025/01/01`

### Step 4: Adjust Schedule

In the **"Every Morning at 8 AM"** node:
- Change `triggerAtHour` to your preferred time (0-23)
- Add multiple times if needed
- Change interval type if you want different scheduling

### Step 5: Test the Workflow

1. Click **"Execute Workflow"** to test manually
2. Check if it fetches emails correctly
3. Verify lead matching logic
4. Confirm notifications are sent
5. Once working, click **"Active"** to enable automatic execution

## 🔍 How the Matching Logic Works

The workflow uses a **scoring system** to match aircraft to leads:

### Match Score Breakdown (out of 100)

| Criteria | Points | Description |
|----------|--------|-------------|
| **Category Match** | 50 | Aircraft category exactly matches lead's aircraft_type |
| **Budget Match** | 0-30 | Within 10% = 30pts, Within 20% = 20pts, Under budget = 10pts |
| **Year Preference** | 0-20 | Within range = 20pts, Within ±2 years = 10pts |

**Minimum Match Score:** 50 points (requires at least category match)

### Matching Examples

**Example 1: Perfect Match (100 points)**
- Lead wants: Midsize Jet, $8-12M budget, 2018-2023 year range
- Email has: Bombardier Challenger 350 (Midsize Jet), $10M, 2020
- Score: 50 (category) + 30 (price perfect) + 20 (year perfect) = 100

**Example 2: Good Match (70 points)**
- Lead wants: Heavy Jet, $15M budget, 2015-2020 year range
- Email has: Gulfstream G450 (Heavy Jet), $13M, 2014
- Score: 50 (category) + 20 (price within 20%) + 10 (year close) = 80

**Example 3: No Match (40 points - filtered out)**
- Lead wants: Light Jet, $3M budget
- Email has: Heavy Jet, $18M
- Score: 0 (wrong category) + 0 (over budget) = 0 (no match)

## 📧 Email Parsing

The workflow automatically extracts:

- **Manufacturer**: Gulfstream, Bombardier, Cessna, Embraer, Dassault, etc.
- **Model**: G550, Challenger 350, Citation X, etc.
- **Year**: 4-digit year between 1980-2025
- **Price**: Supports formats like "$10.5M", "$10,500,000", "10.5 million"
- **Category**: Heavy Jet, Midsize Jet, Light Jet, Turboprop, Piston

### Improving Email Parsing

If aircraft details aren't being extracted correctly, you can customize the parsing logic in the **"Parse Aircraft Details"** node:

```javascript
// Add more manufacturers
const manufacturers = ['Gulfstream', 'Bombardier', 'YourManufacturer'];

// Add category detection patterns
if (fullText.match(/your-pattern/i)) {
  category = 'Your Category';
}
```

## 📊 Notification Format

### Email Notification

You'll receive an HTML email with:
- Total number of matches
- For each match:
  - Match score (0-100)
  - Lead details (name, company, type, budget, status)
  - Aircraft details (manufacturer, model, year, price, category)
  - Match reasons (why it matched)
  - Original email subject and snippet

### Telegram Notification

Simplified text format with:
- Match score
- Lead and aircraft summary
- Email subject

## 🎨 Customization Options

### 1. Filter Lead Status

Currently includes: `Inquiry`, `Presented`, `Interested`

To include other statuses, edit the **"Fetch Active Leads"** node:
```
status=in.(Inquiry,Presented,Interested,Deal Created)
```

### 2. Adjust Match Threshold

Currently requires 50+ points. To change, edit the **"Match Aircraft to Leads"** node:

```javascript
// Change this line:
if (matchScore >= 50) {
// To:
if (matchScore >= 30) { // Lower threshold
```

### 3. Add More Criteria

You can add additional matching criteria in the **"Match Aircraft to Leads"** node:

```javascript
// Example: Prefer specific locations
if (aircraft.location && aircraft.location.includes('California')) {
  matchScore += 5;
  matchReasons.push('○ Located in California');
}

// Example: Bonus for low hours
if (aircraft.totalTime && aircraft.totalTime < 1000) {
  matchScore += 5;
  matchReasons.push('○ Low hours: ' + aircraft.totalTime);
}
```

### 4. Multiple Check Times

Edit the **"Every Morning at 8 AM"** cron node to check multiple times:

```json
{
  "triggerAtHour": 8
},
{
  "triggerAtHour": 14
},
{
  "triggerAtHour": 18
}
```

### 5. Email Filters

Add more specific Gmail filters in **"Fetch Aircraft Emails"**:

```
is:unread subject:(aircraft for sale) from:(trusted-broker@example.com OR another@broker.com)
```

## 🔧 Troubleshooting

### No Emails Fetched

**Problem:** Workflow runs but no emails found

**Solutions:**
1. Check Gmail search query is not too restrictive
2. Verify you have unread emails matching the criteria
3. Test search in Gmail directly: Search for `is:unread subject:(aircraft for sale)`
4. Check Gmail API quota limits (shouldn't be an issue for personal use)

### No Leads Fetched

**Problem:** Supabase query returns empty

**Solutions:**
1. Verify Supabase credentials are correct
2. Check your Supabase URL format: `https://xxx.supabase.co`
3. Ensure you have active leads with status: Inquiry, Presented, or Interested
4. Check Row Level Security (RLS) policies - service role key bypasses RLS
5. Test the Supabase query directly:
   ```
   https://YOUR_PROJECT.supabase.co/rest/v1/leads?select=*&status=in.(Inquiry,Presented,Interested)
   ```

### No Matches Found

**Problem:** Emails and leads fetched but no matches

**Solutions:**
1. Lower the match threshold (see Customization Options #2)
2. Check if aircraft categories match your lead aircraft_type values exactly
3. Review the parsed aircraft data - might need to improve parsing logic
4. Check match scoring in the **"Match Aircraft to Leads"** node - add debug logging

### Email Parsing Issues

**Problem:** Aircraft details not extracted correctly

**Solutions:**
1. Check email format - workflow expects specific patterns
2. Add more manufacturer names to the manufacturers array
3. Improve regex patterns for price and year extraction
4. Add console.log statements in the parsing node to debug
5. Look at the `rawEmailBody` field to see what's being parsed

### Notifications Not Sent

**Problem:** Matches found but no email/telegram received

**Solutions:**
1. **Email:** Check Gmail credentials, verify sender email is authorized
2. **Telegram:** Check bot token and chat ID, ensure bot is not blocked
3. Check n8n execution logs for error messages
4. Test notification nodes individually with sample data

### Workflow Errors

**Problem:** Workflow fails with errors

**Solutions:**
1. Check execution logs in n8n (click on failed execution)
2. Verify all credentials are valid and not expired
3. Check Supabase is online and accessible
4. Ensure environment variables are set correctly
5. Try executing each node individually to isolate the issue

## 🔐 Security Best Practices

1. **Use Service Role Key carefully**: Only use in secure, server-side environments
2. **Environment Variables**: Never commit credentials to git
3. **Gmail OAuth**: Regularly review and revoke unused app access
4. **Telegram Bot**: Keep bot token secret, don't share publicly
5. **Row Level Security**: Even with service role key, ensure RLS policies are correct
6. **Email Filtering**: Be specific with search queries to avoid processing spam

## 📈 Advanced Usage

### Integration with MyAeroDeal

You can extend this workflow to:

1. **Auto-create Tasks**: When a high-score match is found (90+), create a follow-up task
2. **Update Presentations**: Automatically add matched aircraft to lead's presentations array
3. **Create Deals**: For perfect matches (100 points), auto-create a deal record
4. **Log Activity**: Track all matches in a separate table for analytics

### Example: Auto-create Task for High Matches

Add this node after the matching logic:

```javascript
// In a new Code node
const highMatches = $input.all().filter(item => item.json.matchScore >= 90);

const tasks = [];
for (const match of highMatches) {
  tasks.push({
    title: `Follow up: ${match.json.aircraft.manufacturer} ${match.json.aircraft.model} for ${match.json.lead.name}`,
    description: `High match (${match.json.matchScore}/100) found. Review aircraft details and contact ${match.json.lead.name}.`,
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    priority: 'high',
    status: 'pending',
    related_to: {
      type: 'lead',
      id: match.json.lead.id
    },
    auto_generated: true
  });
}

// Insert into Supabase tasks table
// ... Supabase insert logic
```

### Webhook Trigger Alternative

Instead of cron schedule, you can trigger this workflow via webhook when:
- A new email arrives (using Gmail filters + webhook)
- A new lead is created (using Supabase webhook)
- Manual trigger from MyAeroDeal UI

## 📝 Maintenance

### Regular Tasks

1. **Weekly**: Review match quality and adjust scoring if needed
2. **Monthly**: Check for new aircraft manufacturers to add to parsing
3. **Quarterly**: Review and update email search patterns
4. **As needed**: Update lead status filters based on your workflow

### Monitoring

- Check n8n execution history regularly
- Monitor notification delivery success rate
- Review false positives/negatives in matching
- Track parsing accuracy for aircraft details

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Gmail API Reference](https://developers.google.com/gmail/api)
- [Supabase API Documentation](https://supabase.com/docs/reference/javascript/introduction)
- [Telegram Bot API](https://core.telegram.org/bots/api)

## 🆘 Support

If you need help:
1. Check the troubleshooting section above
2. Review n8n execution logs for detailed error messages
3. Test each node individually to isolate issues
4. Consult n8n community forum for general n8n questions

## 📄 License

This workflow is part of the MyAeroDeal project. Use and modify as needed for your business.
