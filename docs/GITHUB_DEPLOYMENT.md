# GitHub + Automatic Deployment Guide

This guide will help you set up GitHub and configure automatic deployments.

---

## 📋 Prerequisites

- [ ] Git initialized (✅ Done)
- [ ] GitHub account (create at https://github.com)
- [ ] GitHub CLI (optional but recommended)

---

## 🚀 Step 1: Initial Git Commit (Local)

The git repository is already initialized. Now make your first commit:

```bash
cd /Users/onurbaylan/Desktop/MyAeroDeal

# Check what will be committed
git status

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: MyAeroDeal CRM with landing page"
```

---

## 📦 Step 2: Create GitHub Repository

### Option A: Using GitHub Website (Easier)

1. Go to https://github.com/new
2. Repository name: `myaerodeal`
3. Description: `AI-Powered Business Jet Brokerage CRM`
4. **Important:** Leave repository EMPTY
   - ❌ Don't add README
   - ❌ Don't add .gitignore
   - ❌ Don't add license
5. Click **Create repository**

6. Copy the commands shown and run them:
```bash
git remote add origin https://github.com/YOUR-USERNAME/myaerodeal.git
git branch -M main
git push -u origin main
```

### Option B: Using GitHub CLI (Faster)

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Login to GitHub
gh auth login

# Create repository and push
gh repo create myaerodeal --public --source=. --remote=origin --push

# Or private repository:
# gh repo create myaerodeal --private --source=. --remote=origin --push
```

---

## 🔄 Step 3: Set Up Automatic Deployment

Choose one platform below. All support automatic deployments from GitHub.

---

### Option A: Vercel (Recommended - Easiest)

**Why Vercel:**
- Instant deployments (< 1 minute)
- Automatic preview deployments for branches
- Free SSL + CDN
- Zero configuration for Vite apps
- Free tier is generous

**Setup:**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Link to GitHub repo:**
```bash
vercel
# Follow prompts:
# - Link to existing project? No
# - Project name: myaerodeal
# - Link to Git? Yes
# - Select your GitHub repo
```

4. **Configure environment variables in Vercel dashboard:**
   - Go to: https://vercel.com/dashboard
   - Click your project
   - Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GEMINI_API_KEY`

5. **Automatic deployments are now active!**
   - Push to `main` branch → Production deployment
   - Push to any branch → Preview deployment
   - Every PR → Preview URL

**Commands:**
```bash
# Deploy to production
git push origin main

# Create preview deployment
git checkout -b feature/new-feature
git push origin feature/new-feature
# Vercel automatically creates preview URL
```

---

### Option B: Netlify

**Why Netlify:**
- Similar to Vercel
- Great for static sites
- Form handling built-in
- Free tier

**Setup:**

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login:**
```bash
netlify login
```

3. **Initialize:**
```bash
netlify init

# Follow prompts:
# - Create new site
# - Connect to Git: Yes
# - Build command: npm run build
# - Publish directory: dist
```

4. **Add environment variables:**
```bash
netlify env:set VITE_SUPABASE_URL "your-value"
netlify env:set VITE_SUPABASE_ANON_KEY "your-value"
netlify env:set VITE_GEMINI_API_KEY "your-value"
```

5. **Or add via dashboard:**
   - https://app.netlify.com
   - Site settings → Environment variables

**Auto-deploy:** Push to main branch automatically deploys.

---

### Option C: Cloudflare Pages

**Why Cloudflare:**
- Fastest CDN
- Unlimited bandwidth (free)
- Great performance

**Setup:**

1. Go to https://dash.cloudflare.com/
2. Pages → Create a project
3. Connect to GitHub → Select `myaerodeal` repo
4. Build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
6. Click **Save and Deploy**

**Auto-deploy:** Every push to main deploys automatically.

---

### Option D: GitHub Pages (Free, Basic)

**Why GitHub Pages:**
- 100% free
- Simple
- Good for testing

**Setup:**

1. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

2. **Update package.json:**
```json
{
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://YOUR-USERNAME.github.io/myaerodeal"
}
```

3. **Deploy:**
```bash
npm run deploy
```

**Note:** GitHub Pages doesn't support environment variables well. Not recommended for production.

---

## 🔐 Step 4: Secure Your Environment Variables

**IMPORTANT:** Never commit `.env` file to GitHub!

✅ **What's protected:**
- `.gitignore` includes `.env` ✅
- `.env.example` shows what's needed (safe to commit)

✅ **For team members:**
1. Clone repository
2. Copy `.env.example` to `.env`
3. Fill in their own API keys

---

## 🔄 Daily Workflow After Setup

### Making changes and deploying:

```bash
# 1. Make changes to your code
# Edit files in src/...

# 2. Test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "Add new feature: X"

# 4. Push to GitHub
git push origin main

# 5. Automatic deployment happens!
# Check deployment status in Vercel/Netlify/Cloudflare dashboard
```

### Creating a new feature:

```bash
# 1. Create branch
git checkout -b feature/my-new-feature

# 2. Make changes and commit
git add .
git commit -m "Implement my new feature"

# 3. Push branch
git push origin feature/my-new-feature

# 4. Preview deployment created automatically!

# 5. When ready, merge to main:
git checkout main
git merge feature/my-new-feature
git push origin main

# 6. Production deployment happens automatically
```

---

## 📊 Monitoring Deployments

### Vercel Dashboard:
- https://vercel.com/dashboard
- See all deployments
- View logs
- Rollback if needed

### Netlify Dashboard:
- https://app.netlify.com
- Deploy logs
- Preview deploys

### Cloudflare Dashboard:
- https://dash.cloudflare.com
- Analytics
- Deployment history

---

## 🐛 Troubleshooting

### Build fails on deployment:

**1. Check build logs in dashboard**

**2. Test build locally:**
```bash
npm run build
```

**3. Common issues:**
- Missing environment variables
- Dependency issues: `npm install` in dashboard
- Build command wrong: Should be `npm run build`
- Output directory wrong: Should be `dist`

### Environment variables not working:

**Vite requires `VITE_` prefix:**
```bash
# ✅ Correct
VITE_SUPABASE_URL=...

# ❌ Wrong
SUPABASE_URL=...
```

### Deployment is slow:

- Vercel: Usually < 1 minute
- Netlify: 1-2 minutes
- Cloudflare: 1-2 minutes
- GitHub Pages: 2-5 minutes

---

## 🎯 Recommended Setup

**For production:** Use Vercel or Cloudflare Pages
**For testing:** Use Vercel (has best preview deployments)
**For cost:** All are free for small projects!

---

## 🔗 Setting Up Custom Domain

### After deploying, add your domain:

**Vercel:**
1. Project Settings → Domains
2. Add domain: `myaerodeal.com`
3. Add DNS records (Vercel provides them)

**Netlify:**
1. Domain settings → Add custom domain
2. Update DNS

**Cloudflare:**
1. Already managing DNS
2. Pages → Custom domains → Add

**Typical setup:**
- `myaerodeal.com` → Landing page
- `app.myaerodeal.com` → React app

---

## ✅ Quick Start Checklist

- [ ] Make initial commit (`git add . && git commit -m "Initial commit"`)
- [ ] Create GitHub repository
- [ ] Push to GitHub (`git push -u origin main`)
- [ ] Choose deployment platform (Vercel recommended)
- [ ] Connect GitHub repo to platform
- [ ] Add environment variables in dashboard
- [ ] First deployment completes
- [ ] Test the deployed app
- [ ] Set up custom domain (optional)

---

## 🎉 You're Done!

From now on:
1. Make changes locally
2. Commit: `git commit -m "Your message"`
3. Push: `git push`
4. Automatic deployment! ✨

Every push to `main` = New production deployment
Every new branch = Preview deployment

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Cloudflare Pages:** https://developers.cloudflare.com/pages
- **Git Guide:** https://git-scm.com/book/en/v2

---

Need help? Check deployment logs in your platform's dashboard!
