# Multi-Tenant Implementation Guide

## Overview
This guide explains how to implement the multi-tenant architecture for AeroBrokerOne, allowing the app to be sold to multiple companies with data isolation.

## Architecture

### Database Schema
- **companies** table: Stores company information
- **profiles** table: Extends auth.users with company_id and role
- All data tables (leads, aircraft, deals, tasks) now include company_id
- Row Level Security (RLS) ensures users only see their company's data

### User Roles
- **Admin**: First user of the company, can invite/manage users
- **User**: Regular team member, can access all company data but not manage users

## Implementation Steps

### Step 1: Run Database Migration
```sql
-- Run MULTI_TENANT_SETUP.sql in your Supabase SQL Editor
-- This creates:
-- 1. companies table
-- 2. profiles table
-- 3. Adds company_id to all data tables
-- 4. Sets up Row Level Security policies
-- 5. Creates triggers for automatic company creation on signup
```

### Step 2: Update Store (useStore.js)

Add these new state variables:
```javascript
companyUsers: [],
currentUserProfile: null,
```

Add these new functions:
```javascript
// Load current user's profile and company info
loadUserProfile: async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, company:companies(*)')
    .eq('id', user.id)
    .single();

  set({ currentUserProfile: profile });
  return profile;
},

// Load all users in the company (admin only)
loadCompanyUsers: async () => {
  const profile = get().currentUserProfile;
  if (!profile || profile.role !== 'admin') return;

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, user:auth.users(email)')
    .eq('company_id', profile.company_id);

  const users = profiles.map(p => ({
    id: p.id,
    email: p.user?.email,
    firstName: p.first_name,
    lastName: p.last_name,
    role: p.role,
    active: p.active
  }));

  set({ companyUsers: users });
},

// Invite new user to company
inviteUser: async (userData) => {
  const profile = get().currentUserProfile;
  if (!profile || profile.role !== 'admin') {
    throw new Error('Only admins can invite users');
  }

  // Create auth user with company metadata
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(
    userData.email,
    {
      data: {
        company_id: profile.company_id,
        role: userData.role,
        first_name: userData.firstName,
        last_name: userData.lastName
      }
    }
  );

  if (error) throw error;
  return data;
},

// Update user role (admin only)
updateUserRole: async (userId, newRole) => {
  const profile = get().currentUserProfile;
  if (!profile || profile.role !== 'admin') {
    throw new Error('Only admins can update user roles');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .eq('company_id', profile.company_id);

  if (error) throw error;
},

// Delete user (admin only)
deleteUser: async (userId) => {
  const profile = get().currentUserProfile;
  if (!profile || profile.role !== 'admin') {
    throw new Error('Only admins can delete users');
  }

  // Deactivate instead of delete to preserve data integrity
  const { error } = await supabase
    .from('profiles')
    .update({ active: false })
    .eq('id', userId)
    .eq('company_id', profile.company_id);

  if (error) throw error;
},
```

Update all INSERT queries to include company_id:
```javascript
// Example for leads
const { data, error } = await supabase
  .from('leads')
  .insert([{
    user_id: currentUser.id,
    company_id: profile.company_id, // Add this line
    // ... rest of fields
  }])
```

### Step 3: Update AuthPage.jsx

Add company name field to signup:
```javascript
const [companyName, setCompanyName] = useState('');

// In signup section:
<input
  type="text"
  placeholder="Company Name"
  value={companyName}
  onChange={(e) => setCompanyName(e.target.value)}
  required
/>

// In handleSignup:
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      first_name: firstName,
      last_name: lastName,
      company_name: companyName,
      // Don't include company_id - will be created by trigger
    }
  }
});
```

### Step 4: Update Navigation

Add user management link for admins:
```javascript
const { currentUserProfile } = useStore();

{currentUserProfile?.role === 'admin' && (
  <button
    onClick={() => setActiveTab('users')}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
  >
    <Users size={20} />
    <span>User Management</span>
  </button>
)}
```

### Step 5: Update App.jsx

Import and add UserManagement view:
```javascript
import UserManagement from './components/Admin/UserManagement';

{activeTab === 'users' && <UserManagement />}
```

Load user profile on auth:
```javascript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      await loadUserProfile();
      await initialize();
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

## Data Flow

### New Company Signup
1. User fills signup form with company name
2. Auth creates user account
3. Database trigger automatically:
   - Creates new company record
   - Creates profile with role='admin'
4. User logs in and has full admin access

### Adding Team Members
1. Admin navigates to User Management
2. Clicks "Invite User"
3. Enters email, name, and role
4. System sends invite email
5. New user clicks link, sets password
6. Database trigger creates profile with company_id
7. New user can immediately access company data

### Data Access
- All queries automatically filtered by company_id via RLS
- Users cannot see other companies' data
- Admins can only manage users in their company
- Complete data isolation between companies

## Security Features

✅ Row Level Security on all tables
✅ Company-based data isolation
✅ Role-based access control
✅ Secure triggers for automatic setup
✅ Server-side user validation
✅ No client-side company switching

## Testing

1. Create first account → Should create new company and be admin
2. Invite user → Should join same company
3. Try accessing data → Should only see company data
4. Try role changes → Admin should be able to update roles
5. Create second company → Data should be completely isolated

## Migration for Existing Data

If you have existing data, run this to assign it to a company:
```sql
-- Create a company for existing data
INSERT INTO companies (name) VALUES ('Legacy Company');

-- Update all existing records
UPDATE leads SET company_id = (SELECT id FROM companies WHERE name = 'Legacy Company');
UPDATE aircraft SET company_id = (SELECT id FROM companies WHERE name = 'Legacy Company');
UPDATE deals SET company_id = (SELECT id FROM companies WHERE name = 'Legacy Company');
UPDATE tasks SET company_id = (SELECT id FROM companies WHERE name = 'Legacy Company');
```

## Future Enhancements

- Company settings page
- Custom branding per company
- Usage analytics per company
- Billing integration per company
- Company-level permissions
- Data export per company
