# Quick Start Guide - Aircraft Lead Matcher

Get the workflow running in 15 minutes!

## Step 1: Install n8n (Choose One)

**Cloud (Easiest):**
```bash
# Sign up at https://n8n.cloud
# No installation needed!
```

**Docker (Recommended for Self-Hosting):**
```bash
docker run -d --restart unless-stopped \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Access at http://localhost:5678
```

**NPM:**
```bash
npm install n8n -g
n8n start
```

## Step 2: Set Up Credentials (5 minutes)

### Gmail OAuth2
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Gmail API
3. Create OAuth 2.0 credentials
4. In n8n: Settings → Credentials → Add → Gmail OAuth2
5. Authenticate

### Supabase API
1. Get your Supabase URL and Service Role Key from project settings
2. In n8n: Settings → Credentials → Add → HTTP Header Auth
3. Name: `Supabase API`
4. Add two headers:
   - `apikey`: `YOUR_SERVICE_ROLE_KEY`
   - `Authorization`: `Bearer YOUR_SERVICE_ROLE_KEY`

### Telegram (Optional)
1. Message [@BotFather](https://t.me/botfather) → `/newbot`
2. Get bot token
3. Message [@userinfobot](https://t.me/userinfobot) → Get your chat ID
4. In n8n: Settings → Credentials → Add → Telegram API

## Step 3: Import Workflow (2 minutes)

1. Open n8n at http://localhost:5678
2. Click "Add workflow" → "Import from File"
3. Select `aircraft-lead-matcher.json`
4. Workflow imported! ✓

## Step 4: Configure (5 minutes)

### Update These Values:

**1. Supabase URL** (in "Fetch Active Leads" node):
```
https://YOUR_PROJECT_ID.supabase.co/rest/v1/leads
```

**2. Email Recipient** (in "Send Email Notification" node):
```
your-email@example.com
```

**3. Telegram Chat ID** (in "Send Telegram Notification" node):
```
YOUR_CHAT_ID
```
Or delete this node if you don't want Telegram notifications.

**4. Select Credentials** for each node:
- "Fetch Aircraft Emails" → Gmail OAuth2
- "Fetch Active Leads" → Supabase API
- "Send Email Notification" → Gmail OAuth2
- "Send Telegram Notification" → Telegram API
- "Mark Email as Read" → Gmail OAuth2

## Step 5: Test (3 minutes)

1. Make sure you have:
   - Unread emails with aircraft for sale keywords
   - Active leads in your database (status: Inquiry, Presented, or Interested)

2. Click "Execute Workflow"

3. Check the output of each node:
   - ✓ Emails fetched?
   - ✓ Aircraft details parsed?
   - ✓ Leads fetched?
   - ✓ Matches found?
   - ✓ Notifications sent?

4. If everything works → Click "Active" to enable!

## Common Setup Issues

### "No emails found"
- Make sure search query matches your emails
- Check you have unread aircraft emails in Gmail
- Test Gmail search directly: `is:unread subject:(aircraft for sale)`

### "Supabase error"
- Verify your Supabase URL format: `https://xxx.supabase.co`
- Check Service Role Key is correct (not anon key)
- Ensure you have active leads in database

### "No matches"
- Check if aircraft categories match lead aircraft_type exactly
- Lower match threshold in code (see README.md)
- Verify leads have correct budget and year_preference data

## Next Steps

Once working:
- Customize the schedule (default: 8 AM daily)
- Adjust email search query for your brokers
- Tune matching logic and scoring
- Add more aircraft manufacturers to parser

## Need Help?

See full README.md for:
- Detailed troubleshooting
- Customization options
- Advanced features
- Security best practices

---

🎉 That's it! Your workflow is now automatically matching aircraft to leads every morning.
