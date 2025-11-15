# How to Create and Configure .env File

## ✅ .env File Already Created!

I've created the `.env` file for you at the project root. Now you just need to add your API keys!

## 📍 File Location

The `.env` file is located at:
```
/Users/onurbaylan/Desktop/AeroBrokerOne/.env
```

## 🔑 How to Add Your API Keys

### Step 1: Open the .env File

**Option A: Using VS Code**
1. Open VS Code
2. Click File → Open File
3. Navigate to `/Users/onurbaylan/Desktop/AeroBrokerOne/.env`
4. Or simply open it from the file explorer in VS Code

**Option B: Using Terminal**
```bash
cd /Users/onurbaylan/Desktop/AeroBrokerOne
nano .env
```
(Press `Ctrl+X` to exit, `Y` to save)

**Option C: Using Mac TextEdit**
1. Open Finder
2. Go to `/Users/onurbaylan/Desktop/AeroBrokerOne`
3. Press `Cmd+Shift+.` to show hidden files
4. Double-click `.env` file
5. Choose TextEdit to open

### Step 2: Replace Placeholder Values

Current file contents:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini AI (for document parsing)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Replace with your actual values:**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini AI (for document parsing)
VITE_GEMINI_API_KEY=AIzaSyC_your_actual_key_here
```

### Step 3: Save the File

- **VS Code**: `Cmd+S` (Mac) or `Ctrl+S` (Windows)
- **Nano**: `Ctrl+X`, then `Y`, then `Enter`
- **TextEdit**: `Cmd+S`

### Step 4: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Start again
npm run dev
```

## 🔍 Where to Get Each API Key

### 1. Supabase URL and Key

1. **Go to**: https://app.supabase.com
2. **Sign in** or create account
3. **Create new project** (or select existing)
4. **Go to**: Settings (gear icon) → API
5. **Copy these values**:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public key** → Use for `VITE_SUPABASE_ANON_KEY`

Example:
```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MjAxNTU3NTk5OX0.abc123def456...
```

### 2. Google Gemini AI Key

1. **Go to**: https://aistudio.google.com/app/apikey
2. **Sign in** with Google account
3. **Click**: "Create API key"
4. **Copy** the key (starts with `AIza`)

Example:
```env
VITE_GEMINI_API_KEY=AIzaSyC_1234567890abcdefghijklmnopqrstuvwxyz
```

## ⚠️ Important Security Notes

### DO NOT:
- ❌ Share your `.env` file with anyone
- ❌ Commit `.env` to Git/GitHub
- ❌ Post API keys publicly
- ❌ Use service keys in frontend (use anon key only)

### DO:
- ✅ Keep `.env` file in project root only
- ✅ Add `.env` to `.gitignore` (already done)
- ✅ Use different keys for development/production
- ✅ Rotate keys regularly

## 🔒 Verify .gitignore

Make sure `.env` is ignored by Git:

```bash
cat .gitignore | grep .env
```

Should show:
```
.env
.env.local
.env.production
```

If not, add it:
```bash
echo ".env" >> .gitignore
```

## ✅ Verify It's Working

### Check if file exists:
```bash
ls -la .env
```

Should show something like:
```
-rw-r--r--  1 onurbaylan  staff  234 Nov 13 18:00 .env
```

### Check file contents (without revealing keys):
```bash
cat .env | grep "VITE_"
```

Should show your variables (but with your actual keys)

### Test in app:
```bash
npm run dev
```

**If Supabase is configured**: You'll see login page
**If not configured**: App runs in demo mode

## 🐛 Troubleshooting

### "Cannot find .env file"
```bash
# Make sure you're in the correct directory
cd /Users/onurbaylan/Desktop/AeroBrokerOne

# Check if file exists
ls -la | grep .env

# If missing, create it:
touch .env
```

### ".env file is hidden"
On Mac, press `Cmd+Shift+.` in Finder to show hidden files

### "Variables not loading"
1. Make sure file is named `.env` (not `env.txt` or `.env.txt`)
2. Make sure variables start with `VITE_`
3. No spaces around `=` sign
4. No quotes around values (unless value contains spaces)
5. Restart dev server after changes

### "Invalid API key" error
1. Double-check you copied the complete key
2. Make sure no extra spaces or line breaks
3. Verify you're using the **anon public** key (not service key)
4. Try regenerating the key in Supabase

## 📋 Complete .env Template

Copy this template and fill in your keys:

```env
# ==================================================
# AeroBrokerOne Environment Variables
# ==================================================

# --------------------------------------------------
# Supabase Configuration
# --------------------------------------------------
# Get these from: https://app.supabase.com
# Settings → API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here

# --------------------------------------------------
# Google Gemini AI
# --------------------------------------------------
# Get this from: https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=AIzaSyC_your_key_here

# --------------------------------------------------
# Optional: Other Services
# --------------------------------------------------
# Add more environment variables as needed
# VITE_ANALYTICS_ID=your_analytics_id
# VITE_SENTRY_DSN=your_sentry_dsn
```

## 🎯 Quick Reference

| Variable | Purpose | Where to Get | Required? |
|----------|---------|--------------|-----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → API | For auth |
| `VITE_SUPABASE_ANON_KEY` | Supabase public key | Supabase Dashboard → API | For auth |
| `VITE_GEMINI_API_KEY` | AI document parsing | Google AI Studio | For AI features |

## 🚀 What Happens Next

### With ALL keys configured:
- ✅ User authentication works
- ✅ Data stored in Supabase
- ✅ AI document parsing enabled
- ✅ Production ready

### With ONLY Gemini key:
- ✅ AI document parsing works
- ✅ Demo mode authentication
- ✅ Data in localStorage

### With NO keys:
- ✅ Full demo mode
- ✅ Great for testing
- ✅ All features work locally

## 💡 Pro Tips

1. **Different environments**: Create `.env.local` for local overrides
2. **Production**: Use environment variables in hosting platform
3. **Team sharing**: Share `.env.example` (without real keys)
4. **Key rotation**: Change keys periodically for security
5. **Backup**: Keep keys in secure password manager

## 📞 Need Help?

- File not working? Check file name is exactly `.env`
- Keys not loading? Restart dev server
- Still issues? Check browser console for errors

---

✅ **Your .env file is ready!** Just add your API keys and restart the server.
