# Supabase Setup Guide - AeroBrokerOne

Complete guide to set up Supabase authentication and database for your AeroBrokerOne CRM.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- AeroBrokerOne project ready

## Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Click "New Project"**
3. **Fill in project details**:
   - Name: `AeroBrokerOne` (or your preferred name)
   - Database Password: Choose a strong password (save this!)
   - Region: Choose closest to your location
4. **Click "Create new project"** (this takes ~2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click **"Settings"** (gear icon in sidebar)
2. Click **"API"** in the left menu
3. Find and copy these two values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (under "Project API keys")

## Step 3: Add Credentials to Your App

1. Create a `.env` file in your project root (if it doesn't exist):
   ```bash
   touch .env
   ```

2. Add your Supabase credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_GEMINI_API_KEY=your_gemini_key_here
   ```

3. **Important**: Make sure `.env` is in your `.gitignore` file!

## Step 4: Create Database Schema

Go to your Supabase project dashboard:

1. Click **"SQL Editor"** in the left sidebar
2. Click **"+ New query"**
3. Copy and paste the SQL below
4. Click **"Run"** to execute

### Database Schema SQL

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  aircraft_type TEXT,
  budget BIGINT,
  budget_known BOOLEAN DEFAULT false,
  year_preference JSONB DEFAULT '{"oldest": null, "newest": null}'::jsonb,
  status TEXT DEFAULT 'Initial',
  presentations JSONB DEFAULT '[]'::jsonb,
  timestamped_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes TEXT
);

-- Create aircraft table
CREATE TABLE IF NOT EXISTS public.aircraft (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  yom INTEGER,
  category TEXT,
  serial_number TEXT,
  registration TEXT,
  location TEXT,
  price BIGINT,
  access_type TEXT,
  spec_sheet TEXT,
  spec_sheet_data TEXT,
  spec_sheet_type TEXT,
  image_data TEXT,
  image_url TEXT,
  presentations JSONB DEFAULT '[]'::jsonb,
  timestamped_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create deals table
CREATE TABLE IF NOT EXISTS public.deals (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  deal_name TEXT NOT NULL,
  client_name TEXT,
  related_lead INTEGER REFERENCES public.leads(id) ON DELETE SET NULL,
  related_aircraft INTEGER REFERENCES public.aircraft(id) ON DELETE SET NULL,
  deal_value BIGINT,
  status TEXT DEFAULT 'Lead',
  next_step TEXT,
  follow_up_date DATE,
  estimated_closing DATE,
  document TEXT,
  document_data TEXT,
  document_type TEXT,
  document_parsed BOOLEAN DEFAULT false,
  timeline JSONB DEFAULT '[]'::jsonb,
  timeline_generated TIMESTAMP WITH TIME ZONE,
  history JSONB DEFAULT '[]'::jsonb,
  timestamped_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  related_to JSONB,
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policies for leads
CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
  ON public.leads FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for aircraft
CREATE POLICY "Users can view their own aircraft"
  ON public.aircraft FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own aircraft"
  ON public.aircraft FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aircraft"
  ON public.aircraft FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own aircraft"
  ON public.aircraft FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for deals
CREATE POLICY "Users can view their own deals"
  ON public.deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deals"
  ON public.deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals"
  ON public.deals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals"
  ON public.deals FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to profiles
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## Step 5: Configure Email Authentication

1. In Supabase dashboard, go to **"Authentication"** → **"Providers"**
2. Make sure **"Email"** provider is enabled
3. Configure email templates (optional):
   - Click **"Email Templates"** in Authentication section
   - Customize confirmation and password reset emails

## Step 6: Test the Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **You should see the login page** when you open the app

3. **Create a test account**:
   - Click "Don't have an account? Sign up"
   - Enter your email and password (min 6 characters)
   - Check your email for confirmation link
   - Click the confirmation link
   - You'll be redirected back to the app

4. **Try signing in** with your new account

## Step 7: Verify Database Connection

1. After signing in, try creating a lead, aircraft, or deal
2. Go back to Supabase dashboard → **"Table Editor"**
3. Check that your data appears in the tables

## Environment Variables Summary

Your `.env` file should have:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini AI (for document parsing)
VITE_GEMINI_API_KEY=your-gemini-key-here
```

## Features Now Available

✅ **User Authentication**
- Sign up with email/password
- Sign in
- Email confirmation
- Password reset
- Secure session management

✅ **Multi-tenant Database**
- Each user has their own data
- Row Level Security enabled
- Data isolated between users

✅ **User Profile**
- Automatic profile creation on signup
- User menu in navigation
- Sign out functionality

## Demo Mode

If you haven't configured Supabase yet, the app runs in **demo mode**:
- No authentication required
- Data stored in localStorage
- Perfect for testing UI/UX

## Troubleshooting

### "Invalid API Key" Error
- Double-check your `.env` file has the correct credentials
- Make sure you're using the **anon public** key, not the service key
- Restart your dev server after changing `.env`

### Email Not Sending
- Check your Supabase project's email settings
- For development, check spam folder
- Consider using a custom SMTP provider in production

### "RLS Policy" Errors
- Make sure you ran all the SQL in Step 4
- Check that Row Level Security is enabled
- Verify policies are created for all tables

### Data Not Showing
- Check browser console for errors
- Verify you're signed in
- Check Supabase logs (Dashboard → Logs)

## Next Steps

1. **Migrate Existing Data** (if you have demo data):
   - Export from localStorage
   - Import into Supabase tables
   - Update store to fetch from Supabase

2. **Enable Real-time** (optional):
   - Go to Database → Replication
   - Enable replication for tables you want real-time updates

3. **Set up Storage** (for images/documents):
   - Go to Storage in Supabase dashboard
   - Create buckets for aircraft images and documents
   - Update upload functions to use Supabase Storage

## Security Best Practices

1. ✅ **Never commit `.env` file**
2. ✅ **Use environment variables for all secrets**
3. ✅ **Enable Row Level Security on all tables**
4. ✅ **Use the anon key in frontend (never service key)**
5. ✅ **Validate all user inputs**
6. ✅ **Keep Supabase client library updated**

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **AeroBrokerOne Issues**: Check your implementation

---

🎉 **You're all set!** Your AeroBrokerOne CRM now has secure authentication and a cloud database!
