# Landing Page Guide

## Overview
I've created a professional landing page for MyAeroDeal that showcases all features and emphasizes AI capabilities.

**File:** `landing-page.html`

---

## How to View

1. **Open locally:**
   ```bash
   open landing-page.html
   ```
   Or just double-click the file in Finder.

2. **Test on different devices:**
   - Desktop: Full width
   - Tablet: Responsive grid
   - Mobile: Single column layout

---

## Adding Real Screenshots

### Step 1: Take Screenshots

For best results, take screenshots at **1920x1080** resolution:

#### Screenshot 1: Dashboard
- Navigate to Dashboard
- Make sure you have some data (leads, aircraft, deals)
- Take a full-screen screenshot
- Save as: `screenshot-dashboard.png`

#### Screenshot 2: Leads Management
- Go to Leads tab
- Show the list view with multiple leads
- Highlight different statuses (colors)
- Save as: `screenshot-leads.png`

#### Screenshot 3: Aircraft Inventory
- Go to Aircraft tab
- Show the gallery view with aircraft cards
- Include aircraft images and pricing
- Save as: `screenshot-aircraft.png`

#### Screenshot 4: Deals Pipeline
- Go to Deals tab
- Show deals in different stages
- Display the Gantt chart if possible
- Save as: `screenshot-deals.png`

#### Screenshot 5: AI Document Upload
- Open the Add Aircraft modal
- Show the spec sheet upload section
- If possible, capture during/after AI extraction
- Save as: `screenshot-ai-upload.png`

#### Screenshot 6: Tasks & Checklists
- Go to Tasks tab
- Show pending tasks
- Or screenshot a deal checklist
- Save as: `screenshot-tasks.png`

### Step 2: Optimize Screenshots

Use online tools to optimize:
- **TinyPNG.com** - Compress without quality loss
- **Squoosh.app** - Advanced compression options

Target: Keep each screenshot under 200KB

### Step 3: Replace Placeholders

In `landing-page.html`, find and replace these sections:

```html
<!-- OLD -->
<div class="screenshot-placeholder">
    📊 Dashboard Screenshot
</div>

<!-- NEW -->
<img src="images/screenshot-dashboard.png"
     alt="MyAeroDeal Dashboard"
     style="width: 100%; height: 300px; object-fit: cover;">
```

Repeat for all 6 screenshots.

### Step 4: Create Images Folder

```bash
mkdir images
# Move all screenshots to this folder
mv screenshot-*.png images/
```

---

## Deploying the Landing Page

### Option 1: Netlify (Easiest)

1. **Drag & Drop:**
   - Go to https://app.netlify.com/drop
   - Drag the `landing-page.html` and `images/` folder
   - Get instant URL: `https://random-name.netlify.app`

2. **Custom Domain:**
   - Buy domain (e.g., myaerodeal.com)
   - In Netlify: Domain settings > Add custom domain
   - Update DNS records

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel landing-page.html

# Add custom domain
vercel domains add myaerodeal.com
```

### Option 3: GitHub Pages (Free)

1. Create repository: `myaerodeal-landing`
2. Rename `landing-page.html` to `index.html`
3. Push to GitHub
4. Enable GitHub Pages in repository settings
5. Access at: `https://yourusername.github.io/myaerodeal-landing`

---

## Customization Tips

### Change Colors

Edit the CSS variables at the top:

```css
:root {
    --primary: #C5A572;        /* Aviation Elite Gold */
    --primary-dark: #B89456;
    --navy: #1E293B;
    --navy-light: #334155;
    --text-light: #F8FAFC;
    --text-gray: #94A3B8;
    --bg-light: #F1F5F9;
}
```

### Update Pricing

Find the pricing section and change:
```html
<div class="price">$99<span class="price-period">/month</span></div>
```

### Add More Features

Copy a feature card and modify:
```html
<div class="feature-card">
    <div class="feature-icon">🎯</div>
    <h3>Your Feature Name</h3>
    <p>Your feature description...</p>
</div>
```

### Change Call-to-Action URLs

Update all signup links:
```html
<!-- Find and replace -->
href="#signup"
<!-- With -->
href="https://app.myaerodeal.com/signup"
```

---

## SEO Optimization

### Add to `<head>` section:

```html
<!-- Open Graph (Facebook) -->
<meta property="og:title" content="MyAeroDeal - AI-Powered Jet Brokerage CRM">
<meta property="og:description" content="Transform your aircraft brokerage business with AI-powered lead management">
<meta property="og:image" content="https://myaerodeal.com/images/og-image.png">
<meta property="og:url" content="https://myaerodeal.com">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="MyAeroDeal - AI-Powered Jet Brokerage CRM">
<meta name="twitter:description" content="Transform your aircraft brokerage business with AI">
<meta name="twitter:image" content="https://myaerodeal.com/images/twitter-card.png">

<!-- Favicon -->
<link rel="icon" type="image/png" href="images/favicon.png">
```

### Create OG Image

Design a 1200x630px image with:
- MyAeroDeal logo
- Tagline: "AI-Powered Jet Brokerage CRM"
- Key feature highlight
- Save as `og-image.png`

---

## Analytics & Tracking

### Google Analytics

Add before `</head>`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Track Button Clicks

Add to CTA buttons:

```html
<a href="#signup"
   class="cta-button"
   onclick="gtag('event', 'click', {
     'event_category': 'CTA',
     'event_label': 'Start Free Trial'
   })">
   Start Free Trial
</a>
```

---

## Adding Video Demo

### Option 1: YouTube Embed

Replace demo button with:

```html
<a href="#" class="hero-button-secondary"
   onclick="openVideoModal(); return false;">
   Watch Demo
</a>

<!-- Add modal -->
<div id="videoModal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.9); z-index:9999; padding:2rem;">
    <iframe width="100%" height="80%"
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
            frameborder="0" allowfullscreen>
    </iframe>
    <button onclick="closeVideoModal()" style="position:absolute; top:1rem; right:1rem; color:white; font-size:2rem; background:none; border:none; cursor:pointer;">×</button>
</div>

<script>
function openVideoModal() {
    document.getElementById('videoModal').style.display = 'flex';
}
function closeVideoModal() {
    document.getElementById('videoModal').style.display = 'none';
}
</script>
```

### Option 2: Loom Video

1. Record screen demo with Loom
2. Get embed code
3. Replace demo button

---

## Content Checklist

Before going live:

- [ ] All screenshots replaced with real ones
- [ ] Pricing updated to match Stripe
- [ ] Signup URLs point to real app
- [ ] Contact email added
- [ ] Privacy Policy & Terms of Service links work
- [ ] All images optimized (< 200KB each)
- [ ] Tested on mobile devices
- [ ] Analytics tracking added
- [ ] OG images created
- [ ] Favicon added
- [ ] Spelling/grammar checked

---

## A/B Testing Ideas

After launch, test:

1. **Headline variations:**
   - "Transform Your Jet Brokerage with AI"
   - "Close More Aircraft Deals with AI-Powered CRM"
   - "The Only CRM Built for Aircraft Brokers"

2. **CTA button text:**
   - "Start Free Trial"
   - "Try It Free"
   - "Get Started Free"
   - "See It In Action"

3. **Pricing display:**
   - Show monthly price
   - Show annual savings
   - Add "Most Popular" badge

4. **Social proof:**
   - Add testimonials
   - Show number of users
   - Display company logos

---

## Marketing Launch Plan

### Week Before Launch:

1. **Create social media accounts:**
   - LinkedIn company page
   - Twitter/X account
   - Facebook page

2. **Prepare content:**
   - 5-10 social media posts
   - Blog announcement post
   - Email to beta users

3. **Set up tracking:**
   - Google Analytics
   - Conversion tracking
   - Heat mapping (Hotjar)

### Launch Day:

1. Deploy landing page
2. Post on social media
3. Send announcement email
4. Post in relevant communities:
   - Aviation forums
   - Business aviation groups
   - LinkedIn groups

### Week After Launch:

1. Monitor analytics daily
2. Respond to inquiries quickly
3. Collect feedback
4. Fix any issues immediately

---

## Support Setup

### Create Help Resources:

1. **FAQ Page** - Common questions
2. **Knowledge Base** - How-to guides
3. **Video Tutorials** - Screen recordings
4. **Contact Form** - For inquiries

### Support Channels:

- Email: support@myaerodeal.com
- Live chat (Intercom, Crisp)
- Phone (optional for enterprise)

---

## Converting Landing Page Visitors

### Add Trust Signals:

```html
<section class="trust-signals">
    <div class="container">
        <p>Trusted by aircraft brokers worldwide</p>
        <div class="stats">
            <div class="stat">
                <strong>500+</strong>
                <span>Aircraft Managed</span>
            </div>
            <div class="stat">
                <strong>$2B+</strong>
                <span>In Transactions</span>
            </div>
            <div class="stat">
                <strong>99.9%</strong>
                <span>Uptime</span>
            </div>
        </div>
    </div>
</section>
```

### Add Testimonials:

```html
<section class="testimonials">
    <h2>What Brokers Say</h2>
    <div class="testimonial">
        <p>"MyAeroDeal cut our admin time by 60%. The AI document processing alone is worth the price."</p>
        <cite>- John Smith, Elite Aviation</cite>
    </div>
</section>
```

---

## Next Steps

1. **Review the landing page** in your browser
2. **Take high-quality screenshots** of your app
3. **Replace the placeholder divs** with real images
4. **Deploy to Netlify or Vercel**
5. **Share the link** and collect feedback
6. **Iterate based on feedback**

Once you're happy with it, we can proceed with implementing Stripe payments and launching!
