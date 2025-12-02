# Google Gemini AI Setup - Quick Start

Your JetCRM is now configured to use Google Gemini 1.5 Pro for intelligent document parsing!

## Setup in 3 Minutes

### Step 1: Get Your Free Gemini API Key

1. Visit: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API key"** button
4. Copy the API key (starts with "AIza...")

### Step 2: Add API Key to Your Project

Create a `.env` file in your project root folder:

```bash
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env
```

Or manually create a file named `.env` with this content:
```
VITE_GEMINI_API_KEY=AIzaSyC...your_actual_key_here
```

**Important**: Replace `your_api_key_here` with your actual Gemini API key!

### Step 3: Restart the Development Server

```bash
npm run dev
```

## Test It Out

1. Go to **Deals** page
2. Upload a PDF document (LOI or APA) to any deal
3. Click **"Generate Action Items & Timeline"**
4. Select document type (LOI or APA)
5. Watch as Gemini extracts action items from your document!

## Check If It's Working

Open your browser console (F12 → Console tab) and look for:
- ✅ `Gemini extracted X action items from LOI/APA`

If you see `No Gemini API key found`, check that:
1. Your `.env` file is in the project root folder
2. The variable name is exactly `VITE_GEMINI_API_KEY`
3. You restarted the dev server after creating the file

## Why Gemini?

- **100% Free** for typical usage (1,500 requests/day)
- **Super smart** - state-of-the-art AI from Google
- **Fast** - quick response times
- **Accurate** - excellent at understanding legal/business documents
- **Generous** - 1 million token context window

## Free Tier Limits

- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per request

**This is more than enough** for your JetCRM usage. You'd need to process hundreds of documents per day to hit these limits!

## What Happens Without API Key?

If you don't add the API key, the system will still work using:
- Intelligent text parsing (analyzes document structure)
- Smart demo templates (industry-standard action items)

But with Gemini, you get:
- Actual extraction from YOUR document text
- Precise dates and amounts from YOUR documents
- Custom action items specific to YOUR deals

## Troubleshooting

### "No Gemini API key found"
- Check `.env` file exists in project root
- Variable name is exactly `VITE_GEMINI_API_KEY`
- Restart dev server after creating `.env`

### "Gemini API error: 400"
- API key might be invalid
- Regenerate key at https://aistudio.google.com/app/apikey

### "Gemini API error: 429"
- You've exceeded free tier limits (rare)
- Wait a minute and try again
- Consider paid tier if needed

## Next Steps

Once set up, Gemini will:
- ✅ Extract actual deadlines from your documents
- ✅ Find specific payment amounts and dates
- ✅ Identify inspection requirements
- ✅ Parse closing conditions
- ✅ Create comprehensive task lists
- ✅ Assign appropriate priorities

All automatically from your uploaded LOI and APA documents!

## Questions?

See the full guide in **AI_INTEGRATION_GUIDE.md** for advanced options and troubleshooting.

---

**Ready to use AI-powered document parsing!** 🚀
