# JetCRM - Business Jet Sales & Acquisition CRM

A comprehensive CRM system designed specifically for business jet sales and acquisition brokers.

## Features

- **Leads Management**: Track potential prospects with detailed preferences
- **Aircraft Inventory**: Manage your aircraft portfolio with complete specifications
- **Deals Pipeline**: Track deals through multiple stages with automated workflows
- **Tasks Management**: Auto-generated and manual tasks with calendar view
- **AI Assistant**: Natural language interface for quick actions
- **Presentations Tracking**: Record and track aircraft presentations to leads

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

## Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## License

Proprietary - All rights reserved