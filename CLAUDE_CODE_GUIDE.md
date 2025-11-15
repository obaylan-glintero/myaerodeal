# Using JetCRM with Claude Code - Step by Step Guide

This guide will walk you through setting up and running the JetCRM application using Claude Code, Anthropic's command-line tool for agentic coding.

## What is Claude Code?

Claude Code is a command-line interface that lets you delegate coding tasks directly to Claude from your terminal. It can read files, write code, execute commands, and help you build and debug applications.

---

## Prerequisites

Before starting, ensure you have:

1. **Node.js 18+** installed
   ```bash
   node --version  # Should show v18 or higher
   ```

2. **Claude Code installed**
   - Visit https://docs.claude.com/en/docs/claude-code for installation instructions
   - Or follow Anthropic's official installation guide

3. **An Anthropic API key**
   - Get one from https://console.anthropic.com
   - You'll need this to use Claude Code

---

## Step 1: Set Up Your Project Directory

### Option A: Using the Pre-built Project Files

If you have the project files already:

1. Copy the entire `jetcrm-project` folder to your desired location:
   ```bash
   cp -r /mnt/user-data/outputs/jetcrm-project ~/Desktop/jetcrm
   cd ~/Desktop/jetcrm
   ```

### Option B: Creating from Scratch

1. Create a new directory:
   ```bash
   mkdir ~/Desktop/jetcrm
   cd ~/Desktop/jetcrm
   ```

2. You can then ask Claude Code to help you set everything up (see Step 3).

---

## Step 2: Initialize Claude Code

1. Open your terminal in the project directory:
   ```bash
   cd ~/Desktop/jetcrm
   ```

2. Start Claude Code:
   ```bash
   claude-code
   ```

3. If this is your first time, you may need to authenticate with your API key.

---

## Step 3: Let Claude Code Help You Set Up

Once Claude Code is running, you can interact with it naturally. Here are example prompts:

### Initial Setup Prompts

**Prompt 1: Install Dependencies**
```
I need to install all the npm dependencies for this React project. 
Can you run npm install for me?
```

Claude Code will:
- Read your `package.json`
- Execute `npm install`
- Show you the installation progress

**Prompt 2: Verify Setup**
```
Can you verify that all dependencies are installed correctly 
and check if there are any missing files?
```

Claude Code will:
- Check `node_modules`
- Verify all required files exist
- Report any issues

---

## Step 4: Run the Development Server

**Prompt:**
```
Please start the development server for me.
```

Claude Code will:
- Run `npm run dev`
- Show you the local URL (usually http://localhost:3000)
- Keep the server running

**Alternative prompt:**
```
Start the app in development mode and tell me what URL to visit.
```

---

## Step 5: Making Changes with Claude Code

### Example: Adding a New Feature

**Prompt:**
```
I want to add a filter to the Aircraft view that lets me 
filter by aircraft category (Light Jet, Midsize Jet, etc.). 
Can you implement this?
```

Claude Code will:
1. Read the current `AircraftView.jsx` file
2. Understand the existing code structure
3. Add the filter functionality
4. Update the component
5. Show you what it changed

### Example: Fixing a Bug

**Prompt:**
```
The task calendar view isn't showing tasks correctly for dates 
in the next month. Can you debug and fix this?
```

Claude Code will:
1. Read the relevant component
2. Analyze the date logic
3. Identify the issue
4. Implement a fix
5. Test the changes

### Example: Styling Changes

**Prompt:**
```
Can you make the modal dialogs wider and add some 
animation when they open?
```

Claude Code will:
1. Find the Modal component
2. Update the styling
3. Add CSS transitions
4. Show you the changes

---

## Step 6: Common Tasks with Claude Code

### Task 1: Adding Environment Variables

**Prompt:**
```
I need to add environment variables for the Supabase connection. 
Can you create a .env file with placeholders for:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
```

### Task 2: Integrating a Backend

**Prompt:**
```
Can you help me integrate Supabase as the backend? 
I want to replace the Zustand store with real database calls.
```

Claude Code will:
- Install Supabase client
- Create service files
- Update components to use the API
- Guide you through the migration

### Task 3: Adding New Components

**Prompt:**
```
I need a new component for user settings where users can 
update their profile and notification preferences. 
Can you create this?
```

### Task 4: Debugging

**Prompt:**
```
The AI Assistant isn't responding when I click send. 
Can you help me debug this?
```

Claude Code will:
- Check the AIAssistant component
- Look for console errors
- Test the functionality
- Identify and fix the issue

### Task 5: Building for Production

**Prompt:**
```
Can you build the app for production and tell me what 
files I need to deploy?
```

Claude Code will:
- Run `npm run build`
- Explain what's in the `dist` folder
- Give you deployment instructions

---

## Step 7: Testing Features

### Testing the AI Assistant

**Prompt to Claude Code:**
```
Can you help me test the AI Assistant? I want to make sure 
it responds correctly to different user commands.
```

### Testing Forms

**Prompt:**
```
Can you create a test script that validates all the 
form inputs in the Modal component?
```

### Testing State Management

**Prompt:**
```
I want to verify that when I delete a lead, all related 
presentations and deals are handled correctly. Can you help?
```

---

## Step 8: Optimizing and Refactoring

### Code Quality

**Prompt:**
```
Can you review the codebase and suggest any improvements 
for performance or code quality?
```

### Adding Error Handling

**Prompt:**
```
Can you add proper error handling to all the components, 
especially for form submissions and API calls?
```

### Adding Loading States

**Prompt:**
```
Can you add loading spinners to all components that fetch 
or save data?
```

---

## Step 9: Deployment Preparation

### Building the App

**Prompt:**
```
I'm ready to deploy this app. Can you help me build it 
and prepare it for deployment to Vercel?
```

Claude Code will:
- Run the build command
- Check for errors
- Optimize the build
- Provide deployment instructions

### Environment Setup

**Prompt:**
```
Can you create a .env.example file with all the 
environment variables I need to set for production?
```

---

## Step 10: Troubleshooting with Claude Code

### Common Issues and How to Ask for Help

**Issue: Build Errors**
```
I'm getting build errors. Can you read the error 
messages and help me fix them?
```

**Issue: Dependencies**
```
I'm getting a warning about peer dependencies. 
Can you resolve this?
```

**Issue: Styling Problems**
```
The layout breaks on mobile devices. Can you make 
the app fully responsive?
```

**Issue: State Not Updating**
```
When I update a lead, the changes don't show up 
immediately. Can you debug this?
```

---

## Advanced Usage

### Creating New Features

**Prompt for Email Notifications:**
```
Can you integrate SendGrid to send email notifications 
when a new deal is created or a task is due?
```

**Prompt for Export Functionality:**
```
Can you add a feature to export all leads to a CSV file?
```

**Prompt for Search:**
```
Can you add a global search feature that searches 
across leads, aircraft, and deals?
```

### Integrating AI Features

**Prompt:**
```
Can you integrate the Anthropic API to make the AI Assistant 
actually use Claude to respond to user queries?
```

Claude Code will:
- Install the Anthropic SDK
- Create an API service
- Update the AIAssistant component
- Add proper error handling
- Test the integration

---

## Best Practices When Using Claude Code

### 1. Be Specific
✅ Good: "Can you add a date picker to the deal creation form for the estimated closing date?"
❌ Bad: "Can you improve the form?"

### 2. Provide Context
✅ Good: "The Modal component in src/components/Common/Modal.jsx needs validation for required fields."
❌ Bad: "Add validation."

### 3. Ask for Explanations
```
Can you explain what changes you made to the store and why?
```

### 4. Request Testing
```
After making those changes, can you test that the feature 
works correctly?
```

### 5. Iterative Development
```
That looks good, but can you also add a confirmation dialog 
before deleting?
```

---

## Example Development Session

Here's what a typical session might look like:

```
You: Hi Claude Code! I just downloaded the JetCRM project. 
     Can you help me set it up?

Claude: I'll help you set up the project. Let me first check 
        what files we have...
        [Reads directory structure]
        I can see you have a complete React project with Vite. 
        Let me install the dependencies...
        [Runs npm install]
        ✓ Dependencies installed successfully!
        
        Would you like me to start the development server?

You: Yes please!

Claude: [Runs npm run dev]
        ✓ Development server started!
        You can now visit http://localhost:3000
        
        The app should now be running. Would you like me to 
        explain the project structure or help you with anything else?

You: Can you explain the main components?

Claude: Sure! Here's an overview of the architecture...
        [Explains component structure]

You: I want to add a feature to export leads to PDF. Can you help?

Claude: I can help you add PDF export functionality. 
        I'll need to...
        [Implements the feature]
        
You: That's perfect! Now can you help me deploy this to Vercel?

Claude: Let's deploy to Vercel. First, I'll build the app...
        [Walks through deployment]
```

---

## Quick Reference Commands

### Starting Claude Code
```bash
claude-code
```

### Common Prompts
```
"Install dependencies"
"Start the development server"
"Show me the project structure"
"Explain how [component] works"
"Add [feature] to [component]"
"Debug [issue]"
"Build for production"
"Help me deploy"
```

### Exiting Claude Code
```
Type: exit
Or: Ctrl+C
```

---

## Tips for Success

1. **Keep Claude Code in Context**: Work on one feature at a time so Claude maintains context.

2. **Review Changes**: Always review what Claude Code changes before committing.

3. **Save Your Work**: Claude Code can help you commit to git:
   ```
   Can you create a git commit with a message describing 
   the changes we just made?
   ```

4. **Ask for Documentation**: 
   ```
   Can you add comments to explain this complex function?
   ```

5. **Learn as You Go**:
   ```
   Can you explain how Zustand state management works in this project?
   ```

---

## Next Steps

After getting comfortable with Claude Code:

1. **Integrate a Database**: Ask Claude Code to help you integrate Supabase
2. **Add Authentication**: Request help setting up user authentication
3. **Deploy to Production**: Let Claude Code guide you through deployment
4. **Add More Features**: Use Claude Code to build new features iteratively

---

## Getting Help

If you get stuck:

1. **Ask Claude Code**: It can read documentation and help you understand errors
2. **Check the README**: Located in the project root
3. **Review the Deployment Guide**: Comprehensive guide for production setup
4. **Anthropic Documentation**: https://docs.claude.com/en/docs/claude-code

---

## Summary

Claude Code makes developing with the JetCRM application intuitive and efficient:

- ✅ Natural language commands
- ✅ Understands your codebase
- ✅ Can read, write, and execute code
- ✅ Helps debug and test
- ✅ Guides you through deployment

Just start Claude Code in your project directory and ask it to help!

Happy coding! 🚀