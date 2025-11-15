# MyAeroDeal

**AI-Powered Business Jet Brokerage CRM**

![React](https://img.shields.io/badge/react-18-blue.svg)
![Supabase](https://img.shields.io/badge/supabase-powered-green.svg)
![Vite](https://img.shields.io/badge/vite-5-purple.svg)

A comprehensive CRM system designed specifically for business jet brokers, featuring AI-powered document processing, multi-tenant architecture, and automated workflows.

## ✨ Features

### 🧠 AI-Powered Intelligence
- **Automatic Document Parsing**: Upload aircraft spec sheets (PDF/Word/Images) and let AI extract all details
- **Smart Contract Analysis**: AI extracts action items and deadlines from LOIs and APAs
- **Intelligent Matching**: AI suggests which aircraft to present to which leads
- **Auto-Generated Summaries**: Professional summaries of aircraft specs and deal terms

### 👥 Lead Management
- Track inquiries from first contact to closed deal
- Automatic status updates based on actions (Inquiry → Presented → Interested → Deal Created)
- Timestamped notes and activity history
- Budget tracking and requirements management

### ✈️ Aircraft Inventory
- Beautiful gallery view with filtering and search
- AI-powered spec sheet upload for instant data entry
- Track which aircraft have been presented to which leads
- Availability management and pricing

### 📊 Deal Pipeline
- Visual Gantt chart for timeline tracking
- Automated checklists for each deal stage
- Document upload and AI-powered task extraction
- PDF export for client sharing

### ✅ Task Management
- Automatic task creation from deal stages
- Priority levels and due dates
- Email reminders
- Complete/incomplete tracking

### 🔐 Multi-Tenant Security
- Company-level data isolation
- Row-level security (RLS) policies
- User invitation system
- Role-based access control (Admin, User)

### 🎨 Modern UI
- Light/Dark theme toggle
- Aviation Elite color scheme (#C5A572 gold + Navy)
- Fully responsive (mobile/tablet/desktop)
- Professional design built for brokers

## Project Structure

```
jetcrm/
├── src/
│   ├── components/
│   │   ├── AI/
│   │   │   └── AIAssistant.jsx
│   │   ├── Aircraft/
│   │   │   └── AircraftView.jsx
│   │   ├── Common/
│   │   │   ├── Modal.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── StatCard.jsx
│   │   ├── Dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── Deals/
│   │   │   └── DealsView.jsx
│   │   ├── Leads/
│   │   │   └── LeadsView.jsx
│   │   └── Tasks/
│   │       └── TasksView.jsx
│   ├── store/
│   │   └── useStore.js (Zustand state management)
│   ├── utils/
│   │   └── colors.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## State Management

The app uses Zustand for state management. All state is located in `src/store/useStore.js`.

## Color Palette

- Primary: #1A2B45 (Deep Midnight Blue)
- Secondary: #D4AF37 (Champagne Gold)
- Tertiary: #8E8D8A (Warm Grey)
- Dark: #2F02F (Charcoal Black)
- Silver: #C01620 (Subtle Silver)
- Accent: #1400F (Sihler)

## Key Components

### Dashboard
Overview of all CRM metrics and recent activity

### Leads
Manage potential prospects with detailed tracking

### Aircraft
Inventory management with presentation tracking

### Deals
Pipeline management with automated next steps

### Tasks
Task management with calendar view and auto-generation

### AI Assistant
Natural language interface for quick CRM actions

## Technologies Used

- React 18
- Vite
- Zustand (State Management)
- Tailwind CSS
- Lucide React (Icons)

## 🌐 Deployment with Automatic Updates

### Quick Setup (5 minutes):

1. **Push to GitHub:**
```bash
# Create repository on GitHub (https://github.com/new)
# Then run:
git remote add origin https://github.com/YOUR-USERNAME/myaerodeal.git
git push -u origin main
```

2. **Deploy to Vercel (Recommended):**
```bash
npm install -g vercel
vercel
# Connect to your GitHub repo
# Add environment variables in dashboard
```

3. **Every future change automatically deploys:**
```bash
git add .
git commit -m "Add new feature"
git push
# ✨ Automatic deployment happens!
```

**See:** `GITHUB_DEPLOYMENT.md` for complete guide with Netlify and Cloudflare options.

---

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [GITHUB_DEPLOYMENT.md](GITHUB_DEPLOYMENT.md) | Set up Git + automatic deployments |
| [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) | Production deployment checklist |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | Database configuration |
| [STRIPE_IMPLEMENTATION_PLAN.md](STRIPE_IMPLEMENTATION_PLAN.md) | Payment system setup |
| [LANDING_PAGE_GUIDE.md](LANDING_PAGE_GUIDE.md) | Marketing page customization |

---

## 🔑 Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
```

---

## 🆘 Support

- **Documentation:** See comprehensive guides in root directory
- **Troubleshooting:** Check `TROUBLESHOOTING.md`
- **Issues:** Create an issue on GitHub

---

## 🎯 Roadmap

- [x] Multi-tenant architecture
- [x] AI document processing
- [x] Deal checklists with PDF export
- [x] Gantt chart visualization
- [x] Landing page with screenshots
- [ ] Stripe payment integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Email integration

---

**Built with ❤️ for Business Jet Brokers**
