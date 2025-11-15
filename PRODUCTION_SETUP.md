# MyAeroDeal - Production Setup

This folder contains all the files needed for production deployment.

## 📦 What's Included

✅ **Source Code** (`src/`) - Complete React application
✅ **Landing Page** (`landing-page.html`) - Marketing page with screenshots
✅ **Images** (`images/`) - All screenshots and logos (2.1MB)
✅ **Configuration Files** - package.json, vite.config.js, tailwind.config.js
✅ **Environment Template** (`.env`) - Needs production values
✅ **Documentation** - All guides and SQL files

## 🚫 What's NOT Included (Intentionally)

❌ `node_modules/` - Will reinstall fresh (saves 300MB+)
❌ `dist/` - Will be rebuilt for production
❌ `.git/` - Clean slate for git repo
❌ Dev cache files

---

## 🚀 Quick Start for Production

### Step 1: Install Dependencies
```bash
cd /Users/onurbaylan/Desktop/MyAeroDeal
npm install
```

### Step 2: Update Environment Variables
Edit `.env` file with production Supabase credentials:
```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_GEMINI_API_KEY=your-api-key
```

### Step 3: Build for Production
```bash
npm run build
```

This creates optimized files in `dist/` folder.

### Step 4: Test Production Build Locally
```bash
npm run preview
```

### Step 5: Deploy
Choose one of these options:

#### Option A: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Option B: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Option C: Cloudflare Pages
- Push to GitHub
- Connect repo in Cloudflare dashboard
- Build: `npm run build`
- Output: `dist`

---

## 📄 Landing Page Deployment

The `landing-page.html` is standalone and can be deployed separately:

### Option 1: With Main App
- Just deploy the whole project
- Access at: `https://yourdomain.com/landing-page.html`

### Option 2: Separate Marketing Site
- Deploy only `landing-page.html` + `images/` folder
- Use Netlify Drop or Vercel
- Point `www.myaerodeal.com` to landing page
- Point `app.myaerodeal.com` to React app

---

## 🗄️ Database Setup

All SQL files are included. Run them in this order:

1. **SUPABASE_SETUP.md** - Follow complete database setup
2. **MULTI_TENANT_SETUP.sql** - Create all tables
3. **REGISTRATION_AND_INVITATION_SYSTEM.sql** - Setup auth
4. **TEST_DATA_SYSTEM.sql** (optional) - Add sample data

---

## 📋 Next Steps

- [ ] Install dependencies (`npm install`)
- [ ] Update `.env` with production credentials
- [ ] Test build locally (`npm run build && npm run preview`)
- [ ] Deploy to hosting platform
- [ ] Configure custom domain
- [ ] Set up SSL (automatic on Vercel/Netlify)
- [ ] Test production app thoroughly
- [ ] Deploy landing page
- [ ] Set up monitoring (optional)

---

## 📚 Important Documentation

- **DEPLOYMENT_GUIDE.md** - Complete deployment instructions
- **PUBLISHING_GUIDE.md** - Pre-launch checklist
- **STRIPE_IMPLEMENTATION_PLAN.md** - Payment integration
- **LANDING_PAGE_GUIDE.md** - Marketing page customization

---

## 🆘 Need Help?

- Check `TROUBLESHOOTING.md` for common issues
- All guides are in this folder
- Original app still at `/Users/onurbaylan/Desktop/AeroBrokerOne`

---

## 🎯 Production Checklist

Before going live:

- [ ] All screenshots added to landing page ✅
- [ ] Production Supabase project created
- [ ] Environment variables updated
- [ ] Build tested locally
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Test registration flow
- [ ] Test all CRUD operations
- [ ] Test on mobile devices
- [ ] Analytics added (Google Analytics)
- [ ] Error monitoring (Sentry)

---

**Ready to deploy?** Start with Step 1 above!
