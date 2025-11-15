# AI Document Parsing Integration Guide

## Overview
The system now extracts action items from your actual LOI and APA documents using AI-powered parsing. This guide explains how it works and how to enable full AI capabilities.

## Current Features

### ✅ Implemented
1. **PDF Text Extraction** - Extracts all text from uploaded PDF documents
2. **Intelligent Parser** - Analyzes document structure and content
3. **Date Detection** - Finds deadlines and milestone dates in documents
4. **Priority Assignment** - Determines task priorities based on document language
5. **Demo Mode** - Works immediately with smart fallback parsing

### 🔧 How It Works

#### Step 1: Upload Document
- Upload your LOI or APA as a PDF to a deal
- System stores document in base64 format

#### Step 2: Generate Action Items
- Click "Generate Action Items & Timeline" button
- Select document type (LOI or APA)
- System extracts all text from PDF using PDF.js

#### Step 3: AI Parsing
The system uses three parsing methods in order:

1. **Google Gemini 1.5 Pro** (if API key configured)
   - Sends document text to Google Gemini
   - AI extracts all action items with dates
   - Returns structured JSON with tasks
   - Uses advanced language understanding

2. **Smart Text Parsing** (if text extracted successfully)
   - Analyzes document structure
   - Detects dates, clauses, and obligations
   - Generates tasks based on document content

3. **Intelligent Demo Mode** (fallback)
   - Uses industry-standard templates
   - Provides comprehensive task list
   - Still better than manual creation

#### Step 4: Task Generation
- Creates tasks with extracted due dates
- Assigns priorities based on document urgency
- Links all tasks to the deal
- Displays timeline on deal card

## Enable Full AI Integration

### Google Gemini 1.5 Pro (Active Integration)

The system is configured to use Google Gemini AI for document parsing. Follow these steps:

1. **Get API Key**
   - Go to https://aistudio.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API key"
   - Copy your API key

2. **Create Environment File**
   ```bash
   # Create .env file in project root
   echo "VITE_GEMINI_API_KEY=your-api-key-here" > .env
   ```

   Or manually create `.env` file with:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key
   ```

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

4. **Test the Integration**
   - Upload a PDF document to a deal
   - Click "Generate Action Items & Timeline"
   - Select document type (LOI or APA)
   - Check browser console for "✅ Gemini extracted X action items"

### Why Gemini?

- **Free tier**: 15 requests per minute, 1,500 requests per day
- **Large context**: 1 million token context window
- **High quality**: State-of-the-art language understanding
- **Fast**: Quick response times
- **Cost-effective**: Free for most use cases, very affordable paid tier

### Alternative Options

#### Option 1: Claude API (Anthropic)

If you prefer Claude AI:
```javascript
// In src/store/useStore.js, replace Gemini code with:
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Parse this ${documentType} and extract action items...`
    }]
  })
});
```

#### Option 2: OpenAI GPT-4

If you prefer OpenAI:
```javascript
// In src/store/useStore.js, replace Gemini code with:
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4-turbo',
    messages: [{
      role: 'user',
      content: `Parse this ${documentType} and extract action items...`
    }]
  })
});
```

#### Option 3: Local AI Model

Use a local model for privacy and cost savings:

1. **Install Ollama**
   ```bash
   curl https://ollama.ai/install.sh | sh
   ollama pull llama2
   ```

2. **Update API Call**
   ```javascript
   const response = await fetch('http://localhost:11434/api/generate', {
     method: 'POST',
     body: JSON.stringify({
       model: 'llama2',
       prompt: `Extract action items from this ${documentType}:\n${documentText}`
     })
   });
   ```

## What The AI Extracts

### From LOI Documents:
- Deposit amounts and due dates
- Inspection periods and deadlines
- Financing contingencies
- Acceptance/rejection timeframes
- Due diligence requirements
- Closing date estimates

### From APA Documents:
- Payment schedules
- Pre-purchase inspection timeline
- Registration transfer deadlines
- Insurance requirements
- Delivery conditions
- Post-closing obligations
- Warranty periods

## Example AI Prompt

The system uses this prompt for Google Gemini:

```
You are an expert in aircraft transactions. Parse this [LOI/APA] document
and extract ALL action items with dates, priorities, and descriptions.

Document Text:
[Extracted PDF text]

Extract every action item, deadline, obligation, and requirement from this document.
Return ONLY a valid JSON object with this exact format (no markdown, no code blocks):

{
  "actionItems": [
    {
      "title": "Submit earnest money deposit",
      "description": "Transfer $50,000 to escrow per Section 2.1",
      "dueDate": "2024-01-15",
      "priority": "high"
    },
    ...
  ]
}

Priority levels:
- high: Critical deadlines, payments, inspections
- medium: Important but flexible items
- low: Nice-to-have or informational items
```

## Testing

1. **Test with Sample PDF**
   - Create a simple LOI PDF with clear dates
   - Upload to a deal
   - Generate action items
   - Verify tasks match document content

2. **Check Console Logs**
   ```javascript
   // Logs appear in browser console
   console.log('Extracted text:', extractedText);
   console.log('AI response:', parsed);
   ```

3. **Verify Task Creation**
   - Go to Tasks page
   - Check for auto-generated tasks
   - Verify dates match document
   - Confirm priorities are appropriate

## Cost Considerations

### Google Gemini 1.5 Pro Pricing (as of 2025):

**Free Tier (Perfect for this application):**
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per request
- 4 million tokens per day
- **Cost: $0.00**

**Paid Tier (if you need more):**
- Input: $0.00125 per 1K tokens (up to 128K)
- Output: $0.005 per 1K tokens
- Average LOI: ~1000 tokens = $0.0062
- Average APA: ~2000 tokens = $0.0124

### Cost Comparison:
- **Gemini Free**: $0.00 for typical usage
- **Gemini Paid**: ~$0.006 per LOI, ~$0.012 per APA
- **OpenAI GPT-4**: ~$0.09 per LOI, ~$0.18 per APA (15x more expensive)
- **Claude**: ~$0.015 per LOI, ~$0.030 per APA (2-3x more expensive)

### Cost Saving Tips:
1. Use free tier for most scenarios (more than enough)
2. Cache document parsing results
3. Only parse when document changes
4. Batch multiple requests if needed

## Troubleshooting

### "Document extraction error"
- Ensure document is a PDF
- Check PDF is not password-protected
- Verify PDF contains actual text (not scanned images)

### "AI parsing error"
- Check API key is valid
- Verify internet connection
- Check API rate limits
- Review console for detailed errors

### Tasks seem generic
- AI might have failed, using fallback mode
- Check if API key is configured
- Verify PDF text was extracted
- Try re-uploading document

## Security Notes

1. **API Keys**
   - Never commit `.env` file to git
   - Use environment variables only
   - Rotate keys regularly

2. **Document Privacy**
   - Documents are sent to AI service
   - Use local AI for sensitive documents
   - Consider data residency requirements

3. **Data Storage**
   - Documents stored in browser localStorage
   - Clear browser data to remove documents
   - No server-side storage

## Support

For issues or questions:
1. Check browser console for errors
2. Verify PDF contains text (not images)
3. Test with sample document first
4. Review AI API documentation

## Future Enhancements

Coming soon:
- ✨ OCR for scanned PDFs
- ✨ Multi-document analysis
- ✨ Automatic date conflict detection
- ✨ Task dependency mapping
- ✨ Progress tracking against timeline
- ✨ Email reminders for due dates
