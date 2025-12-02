# JetCRM Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment Options](#production-deployment-options)
4. [Database Setup](#database-setup)
5. [Authentication & Multi-tenancy](#authentication--multi-tenancy)
6. [Environment Configuration](#environment-configuration)
7. [Deployment Platforms](#deployment-platforms)
8. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

### Required Tools
- Node.js (v18 or higher)
- npm or yarn package manager
- Git for version control
- A code editor (VS Code recommended)

### Required Accounts (for production)
- Hosting platform account (Vercel/Netlify/AWS)
- Database service (Supabase/Firebase/MongoDB Atlas)
- Domain registrar (optional, for custom domain)
- Email service (SendGrid/AWS SES for notifications)

---

## Local Development Setup

### Step 1: Create React Project

```bash
# Create a new React app with Vite (recommended for speed)
npm create vite@latest jetcrm -- --template react

# Or use Create React App
npx create-react-app jetcrm

# Navigate to project directory
cd jetcrm
```

### Step 2: Install Dependencies

```bash
# Install required packages
npm install lucide-react

# Install additional production dependencies
npm install axios
npm install react-router-dom
npm install date-fns

# For state management (optional but recommended)
npm install zustand

# For form handling
npm install react-hook-form

# For notifications
npm install react-hot-toast
```

### Step 3: Project Structure

Create the following folder structure:

```
jetcrm/
├── public/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── Leads/
│   │   ├── Aircraft/
│   │   ├── Deals/
│   │   ├── Tasks/
│   │   └── AI/
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── database.js
│   ├── store/
│   │   └── useStore.js
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .env.example
├── package.json
└── vite.config.js (or webpack.config.js)
```

### Step 4: Add the JetCRM Component

Replace `src/App.jsx` with the JetCRM component code provided, or break it into smaller components in the structure above.

### Step 5: Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA)

---

## Production Deployment Options

### Option 1: Vercel (Recommended for React/Next.js)

**Why Vercel?**
- Zero configuration deployment
- Automatic HTTPS
- Global CDN
- Serverless functions support
- Excellent for React applications

**Deployment Steps:**

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

# For production
vercel --prod
```

4. **Configure via Dashboard**
- Go to https://vercel.com/dashboard
- Connect your GitHub repository for automatic deployments
- Set environment variables in project settings

**Vercel Configuration File** (`vercel.json`):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Option 2: Netlify

**Deployment Steps:**

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login**
```bash
netlify login
```

3. **Initialize and Deploy**
```bash
netlify init
netlify deploy --prod
```

4. **Or Deploy via GitHub**
- Connect repository at https://app.netlify.com
- Configure build settings:
  - Build command: `npm run build`
  - Publish directory: `dist` (Vite) or `build` (CRA)

**Netlify Configuration File** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Option 3: AWS Amplify

**Deployment Steps:**

1. **Install AWS Amplify CLI**
```bash
npm install -g @aws-amplify/cli
```

2. **Initialize Amplify**
```bash
amplify init
```

3. **Add Hosting**
```bash
amplify add hosting
```

4. **Deploy**
```bash
amplify publish
```

### Option 4: Docker + Any Cloud Platform

**Dockerfile:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Deploy to Any Platform:**
```bash
# Build Docker image
docker build -t jetcrm:latest .

# Run locally to test
docker run -p 80:80 jetcrm:latest

# Push to container registry (AWS ECR, Google GCR, Docker Hub)
docker tag jetcrm:latest your-registry/jetcrm:latest
docker push your-registry/jetcrm:latest
```

---

## Database Setup

The current app uses in-memory state. For production, integrate a database:

### Option 1: Supabase (Recommended)

**Why Supabase?**
- PostgreSQL database
- Built-in authentication
- Real-time subscriptions
- Row-level security
- RESTful API auto-generated

**Setup Steps:**

1. **Create Project**
   - Go to https://supabase.com
   - Create new project
   - Note your API URL and anon key

2. **Create Tables**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_id UUID REFERENCES companies(id),
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Companies table (for multi-tenancy)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  company TEXT,
  aircraft_type TEXT,
  budget NUMERIC,
  budget_known BOOLEAN DEFAULT false,
  year_preference JSONB,
  status TEXT DEFAULT 'Cold',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Aircraft table
CREATE TABLE aircraft (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  yom INTEGER,
  serial_number TEXT,
  registration TEXT,
  category TEXT,
  location TEXT,
  price NUMERIC,
  access_type TEXT DEFAULT 'Direct',
  spec_sheet_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  deal_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  related_lead_id UUID REFERENCES leads(id),
  related_aircraft_id UUID REFERENCES aircraft(id),
  deal_value NUMERIC,
  estimated_closing DATE,
  status TEXT DEFAULT 'Lead',
  next_step TEXT,
  follow_up_date DATE,
  history JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  related_to_type TEXT,
  related_to_id UUID,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Presentations table
CREATE TABLE presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  lead_id UUID REFERENCES leads(id),
  aircraft_id UUID REFERENCES aircraft(id),
  price_given NUMERIC,
  notes TEXT,
  presented_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their company's data)
CREATE POLICY "Users can view their company's leads" ON leads
  FOR SELECT USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert leads for their company" ON leads
  FOR INSERT WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Repeat similar policies for other tables
```

3. **Install Supabase Client**
```bash
npm install @supabase/supabase-js
```

4. **Create Supabase Service** (`src/services/supabase.js`):
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Option 2: Firebase

**Setup Steps:**

1. **Install Firebase**
```bash
npm install firebase
```

2. **Initialize Firebase** (`src/services/firebase.js`):
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### Option 3: MongoDB Atlas

**Setup Steps:**

1. **Create Cluster** at https://cloud.mongodb.com

2. **Install Mongoose**
```bash
npm install mongoose
```

3. **Create API Backend** (Node.js/Express)
```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

const app = express();
app.use(express.json());

// Define schemas and routes
// ...

app.listen(3000);
```

---

## Authentication & Multi-tenancy

### Supabase Auth Integration

**Auth Service** (`src/services/auth.js`):
```javascript
import { supabase } from './supabase';

export const authService = {
  async signUp(email, password, companyName, fullName) {
    // Create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) throw authError;

    // Create company
    const { data: company } = await supabase
      .from('companies')
      .insert({ name: companyName })
      .select()
      .single();

    // Update user profile
    await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        company_id: company.id
      });

    return authData;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*, companies(*)')
      .eq('id', user.id)
      .single();

    return profile;
  }
};
```

### Adding Auth to App

```javascript
// src/App.jsx
import { useEffect, useState } from 'react';
import { supabase } from './services/supabase';
import JetCRM from './components/JetCRM';
import Login from './components/Login';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return <JetCRM session={session} />;
}

export default App;
```

---

## Environment Configuration

### Create `.env` File

```bash
# Vite (use VITE_ prefix)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://api.yourdomain.com

# Or for Create React App (use REACT_APP_ prefix)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=https://api.yourdomain.com

# AI/ML Services
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_OPENAI_API_KEY=your_openai_key

# Email Service
VITE_SENDGRID_API_KEY=your_sendgrid_key

# File Storage
VITE_AWS_S3_BUCKET=your_bucket_name
VITE_AWS_REGION=us-east-1
```

### Create `.env.example`

```bash
# Copy this file to .env and fill in your values
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
VITE_ANTHROPIC_API_KEY=
```

### Add to `.gitignore`

```
.env
.env.local
.env.production
```

---

## AI Features Integration

### Spec Sheet AI Extraction

**Using Anthropic Claude API:**

```javascript
// src/services/ai.js
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export async function extractAircraftInfo(file) {
  // Convert file to base64
  const base64 = await fileToBase64(file);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64
            }
          },
          {
            type: 'text',
            text: `Extract aircraft information from this spec sheet and return ONLY valid JSON with these fields:
            {
              "manufacturer": "",
              "model": "",
              "yom": 0,
              "serialNumber": "",
              "registration": "",
              "category": "",
              "location": "",
              "price": 0
            }`
          }
        ]
      }]
    })
  });

  const data = await response.json();
  return JSON.parse(data.content[0].text);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### AI Assistant with Real API

```javascript
// src/services/aiAssistant.js
export async function sendMessageToClaude(message, context) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are an AI assistant for a business jet CRM. 
        
Current context:
- Total leads: ${context.leadsCount}
- Total aircraft: ${context.aircraftCount}
- Active deals: ${context.dealsCount}
- Pending tasks: ${context.tasksCount}

User message: ${message}

Respond naturally and help with CRM operations.`
      }]
    })
  });

  const data = await response.json();
  return data.content[0].text;
}
```

---

## Deployment Platforms Comparison

| Platform | Best For | Pricing | Pros | Cons |
|----------|----------|---------|------|------|
| **Vercel** | Next.js/React | Free tier + $20/mo | Easy deployment, fast CDN | Can be expensive at scale |
| **Netlify** | Static sites | Free tier + $19/mo | Simple, great DX | Limited serverless functions |
| **AWS Amplify** | Full-stack | Pay-as-you-go | AWS integration | More complex setup |
| **Railway** | Full-stack | $5/mo + usage | Database included | Smaller CDN |
| **Render** | Full-stack | Free tier + $7/mo | Easy setup | Can be slow on free tier |
| **DigitalOcean** | Custom needs | From $4/mo | Full control | Requires more management |

---

## Post-Deployment Checklist

### Security
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Set up CORS policies
- [ ] Implement rate limiting
- [ ] Enable Row-Level Security (RLS) in database
- [ ] Set up API key rotation
- [ ] Configure Content Security Policy (CSP)

### Performance
- [ ] Enable CDN
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Enable gzip compression
- [ ] Set up performance monitoring (Sentry, LogRocket)

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics, Plausible)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure log aggregation

### Business
- [ ] Set up payment processing (Stripe)
- [ ] Configure email notifications (SendGrid)
- [ ] Create user documentation
- [ ] Set up customer support (Intercom)
- [ ] Configure backup strategy

### DNS & Domain
- [ ] Purchase domain
- [ ] Configure DNS records
- [ ] Set up SSL certificate (usually automatic)
- [ ] Configure www redirect

---

## Quick Deployment Commands

### Deploy to Vercel (Fastest)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Deploy with Docker
```bash
docker build -t jetcrm .
docker run -p 80:80 jetcrm
```

---

## Troubleshooting

### Common Issues

**Build fails:**
- Check Node version (should be 18+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for missing environment variables

**Database connection fails:**
- Verify environment variables
- Check database firewall rules
- Ensure correct connection string format

**Authentication not working:**
- Check API keys in environment
- Verify redirect URLs in auth provider
- Clear browser cache/cookies

**App loads but features don't work:**
- Check browser console for errors
- Verify API endpoints are accessible
- Check CORS configuration

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **React Router:** https://reactrouter.com
- **Vite Guide:** https://vitejs.dev/guide
- **Anthropic API:** https://docs.anthropic.com

---

## Next Steps

1. Choose your deployment platform
2. Set up your database (Supabase recommended)
3. Configure authentication
4. Deploy your application
5. Set up custom domain
6. Configure payment processing for SaaS
7. Launch! 🚀

For production SaaS deployment, consider:
- Implementing subscription management (Stripe)
- Adding user role management
- Setting up automated backups
- Creating admin dashboard
- Adding email notifications
- Implementing audit logs
- Setting up CI/CD pipeline

Good luck with your JetCRM deployment!