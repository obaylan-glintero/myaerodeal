# JetCRM Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Download the Project
Download the `jetcrm-project` folder from the outputs and place it anywhere on your computer.

### Step 2: Open Terminal
Navigate to the project folder:
```bash
cd path/to/jetcrm-project
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start the App
```bash
npm run dev
```

### Step 5: Open in Browser
Visit: **http://localhost:3000**

That's it! The app is now running. 🎉

---

## 📁 Project Structure Quick Reference

```
jetcrm-project/
├── src/
│   ├── components/          # All UI components
│   │   ├── AI/             # AI Assistant
│   │   ├── Aircraft/       # Aircraft management
│   │   ├── Common/         # Shared components
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── Deals/          # Deal management
│   │   ├── Leads/          # Lead management
│   │   └── Tasks/          # Task management
│   ├── store/              # State management (Zustand)
│   ├── utils/              # Utilities and constants
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── package.json            # Dependencies
├── vite.config.js         # Vite configuration
└── tailwind.config.js     # Tailwind CSS config
```

---

## 🛠️ Using with Claude Code

### Quick Start
```bash
# In your project directory
claude-code
```

### Example Prompts
```
"Help me understand the project structure"
"Add a new field to the lead form"
"Fix the styling on mobile devices"
"Integrate with Supabase"
"Deploy to Vercel"
```

See **CLAUDE_CODE_GUIDE.md** for detailed instructions.

---

## 🎨 Customization Tips

### Change Colors
Edit `src/utils/colors.js`:
```javascript
export const colors = {
  primary: '#1A2B45',    // Your color here
  secondary: '#D4AF37',  // Your color here
  // ... etc
};
```

### Add New Components
Ask Claude Code:
```
"Create a new Reports component that shows sales analytics"
```

### Modify Existing Features
Ask Claude Code:
```
"Add email field to the lead form"
```

---

## 📦 Building for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## 🔧 Troubleshooting

**Port already in use?**
```bash
# Change port in vite.config.js
server: {
  port: 3001  // Change this
}
```

**Dependencies not installing?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Vite not found?**
```bash
npm install -g vite
```

---

## 📚 Additional Resources

- **Full Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Claude Code Guide**: See `CLAUDE_CODE_GUIDE.md`
- **Component Documentation**: See `README.md`

---

## 🎯 Next Steps

1. ✅ Run the app locally
2. ⚙️ Customize for your needs
3. 🗄️ Add a database (Supabase recommended)
4. 🔐 Add authentication
5. 🚀 Deploy to production

---

## 💡 Pro Tips

- Use Claude Code for all modifications - it understands the entire codebase
- Start with small changes to understand the architecture
- Test frequently with `npm run dev`
- Commit changes regularly to git

---

## ⚡ Common Tasks

### Add a new lead:
Click "Add Lead" button → Fill form → Create

### Present aircraft to lead:
Aircraft view → Click "Present to Lead" → Select lead

### Create a deal:
Leads view → Select lead → Click "Create Deal"

### View tasks:
Tasks tab → See list or calendar view

### Use AI Assistant:
Click chat icon (bottom right) → Type command

---

## 🆘 Need Help?

1. Ask Claude Code: It can debug and explain anything
2. Check the guides in the outputs folder
3. Review component code - it's well organized and commented

Happy developing! 🎊