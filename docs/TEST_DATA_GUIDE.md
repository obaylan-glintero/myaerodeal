# Test Data System Guide

## Overview

New companies automatically receive sample data to help users understand the platform. Company admins can wipe this test data when ready to use real data.

---

## What Test Data is Created?

When a new company is approved, the system automatically creates:

### 3 Sample Leads:
1. **John Mitchell** - TechCorp Aviation
   - Type: Midsize Jet
   - Budget: $8.5M (known)
   - Status: Interested
   - Note: Looking for immediate delivery

2. **Sarah Williams** - Global Ventures LLC
   - Type: Light Jet
   - Budget: $4.5M (known)
   - Status: Inquiry
   - Note: First-time buyer

3. **Michael Chen** - Pacific Holdings
   - Type: Heavy Jet
   - Budget: Unknown
   - Status: Presented
   - Note: Flexible on specifications

### 3 Sample Aircraft:
1. **Gulfstream G550** (2019)
   - Price: $18.5M
   - Location: Van Nuys, CA
   - Total Time: 2,450 hours
   - Access: Direct

2. **Bombardier Challenger 350** (2021)
   - Price: $11.2M
   - Location: Teterboro, NJ
   - Total Time: 850 hours
   - Access: Direct

3. **Cessna Citation M2** (2022)
   - Price: $4.75M
   - Location: Scottsdale, AZ
   - Total Time: 420 hours
   - Access: Broker

### 3 Sample Deals:
1. **TechCorp G550 Acquisition**
   - Value: $18.25M
   - Status: APA Signed
   - Closing: ~45 days
   - Next Step: Schedule PPI

2. **Global Ventures M2 Deal**
   - Value: $4.65M
   - Status: LOI Signed
   - Closing: ~30 days
   - Next Step: Await deposit

3. **Pacific Holdings Challenger**
   - Value: $11M
   - Status: Deposit Paid
   - Closing: ~60 days
   - Next Step: Draft purchase agreement

### 3 Sample Tasks:
1. **Follow up with John Mitchell** (High Priority)
   - Due: 2 days from now
   - Description: Call to discuss PPI scheduling

2. **Send comps to Sarah Williams** (Medium Priority)
   - Due: 1 day from now
   - Description: Prepare comparable sales data

3. **Update Challenger 350 listing** (Low Priority)
   - Due: 5 days from now
   - Description: Refresh photos and description

---

## When is Test Data Created?

Test data is automatically created when:
1. A super admin approves a new company registration
2. The `approve_registration_request()` function runs
3. Before the invitation is sent to the new company admin

**Note:** The test data is created BEFORE the user completes signup, so it's ready when they first log in.

---

## How to Wipe Test Data (Admin Only)

### Step 1: Navigate to Settings
1. Sign in as a company admin
2. Click on your user avatar
3. Select **"Settings"** from the dropdown

### Step 2: Find Data Management Section
- Scroll down to the **"Data Management"** section
- Only visible to company admins
- Shows warning: "This action is permanent and cannot be undone!"

### Step 3: Initiate Wipe
1. Click **"Wipe All Data"** button
2. A confirmation dialog appears with red warning

### Step 4: Confirm Wipe
1. Review the warning message
2. Click **"Yes, Wipe All Data"** to proceed
3. Or click **"Cancel"** to abort

### Step 5: Completion
- Success message shows counts of deleted items
- Page automatically refreshes after 2 seconds
- Dashboard now shows empty state

---

## What Gets Deleted?

When you wipe company data:

✅ **Deleted:**
- All Leads
- All Aircraft
- All Deals
- All Tasks

❌ **Preserved:**
- User accounts
- User profiles
- Company settings
- User invitations

---

## Security & Permissions

### Who Can Wipe Data?
- **Only company admins** can wipe data
- Regular users don't see this option
- RLS policies enforce this at database level

### Safety Checks:
1. Two-step confirmation required
2. Permanent warning displayed
3. Database function validates admin role
4. RLS ensures only company's data is affected

### Database Function:
```sql
-- Only affects current user's company
-- Requires admin role
DELETE FROM tasks WHERE company_id = user_company_id;
DELETE FROM deals WHERE company_id = user_company_id;
DELETE FROM aircraft WHERE company_id = user_company_id;
DELETE FROM leads WHERE company_id = user_company_id;
```

---

## Testing the System

### Test 1: New Company Gets Test Data

1. **Sign out** from your account
2. Request access for a new company
3. **As super admin:** Approve the request
4. **As new user:** Click invitation link and complete signup
5. **Verify:** Dashboard shows 3 leads, 3 aircraft, 3 deals, 3 tasks

### Test 2: Wipe Test Data

1. **As company admin:** Go to Settings
2. Scroll to Data Management section
3. Click "Wipe All Data"
4. Confirm the action
5. **Verify:** All data is deleted, users remain

### Test 3: Start Fresh After Wipe

1. After wiping, go to Leads
2. Click "Add Lead" and create a new lead
3. **Verify:** Only your new lead appears (no test data)

---

## SQL Commands

### Check test data for a company:
```sql
SELECT 
  (SELECT COUNT(*) FROM leads WHERE company_id = 'YOUR_COMPANY_ID') as leads,
  (SELECT COUNT(*) FROM aircraft WHERE company_id = 'YOUR_COMPANY_ID') as aircraft,
  (SELECT COUNT(*) FROM deals WHERE company_id = 'YOUR_COMPANY_ID') as deals,
  (SELECT COUNT(*) FROM tasks WHERE company_id = 'YOUR_COMPANY_ID') as tasks;
```

### Manually populate test data for a company:
```sql
SELECT public.populate_test_data('YOUR_COMPANY_ID');
```

### Manually wipe data (as super admin):
```sql
-- Only do this as a last resort
DELETE FROM tasks WHERE company_id = 'YOUR_COMPANY_ID';
DELETE FROM deals WHERE company_id = 'YOUR_COMPANY_ID';
DELETE FROM aircraft WHERE company_id = 'YOUR_COMPANY_ID';
DELETE FROM leads WHERE company_id = 'YOUR_COMPANY_ID';
```

---

## Customizing Test Data

To customize the test data, edit the `populate_test_data()` function in `TEST_DATA_SYSTEM.sql`:

### Add More Leads:
```sql
INSERT INTO public.leads (
  company_id, name, company, aircraft_type, budget, status, notes
) VALUES (
  target_company_id,
  'Your Custom Lead Name',
  'Custom Company',
  'Custom Type',
  5000000,
  'Inquiry',
  'Custom notes here'
);
```

### Change Aircraft Details:
```sql
INSERT INTO public.aircraft (
  company_id, manufacturer, model, yom, price, location
) VALUES (
  target_company_id,
  'Custom Manufacturer',
  'Custom Model',
  2023,
  10000000,
  'Custom Location, State'
);
```

After editing, re-run the SQL migration to update the function.

---

## Troubleshooting

### "Only company admins can wipe company data"
**Cause:** User is not an admin
**Solution:** Check role in profiles table or contact super admin

### Test data not appearing for new company
**Cause:** Function failed or wasn't called
**Solution:** Check if `populate_test_data()` function exists:
```sql
SELECT * FROM pg_proc WHERE proname = 'populate_test_data';
```

### Wipe button not showing
**Cause:** User is not logged in as admin
**Solution:** Only admins see the Data Management section in Settings

### Wipe fails with error
**Cause:** RLS policy issue or database constraint
**Solution:** Check error message and verify RLS policies are correctly set up

---

## Best Practices

1. **Keep Test Data Initially**
   - Use test data to explore features
   - Practice workflows before using real data
   - Train team members with sample data

2. **Wipe Before Going Live**
   - Clear test data before adding real clients
   - Start fresh for production use
   - Avoid confusion between test and real data

3. **Don't Wipe Real Data**
   - Be absolutely sure before wiping
   - No undo or backup system (by design)
   - Consider exporting important data first

4. **Use for Demos**
   - Test data is perfect for demos
   - Shows platform capabilities
   - Professional-looking sample data

---

## Summary

✅ New companies get 3 leads, 3 aircraft, 3 deals, 3 tasks automatically
✅ Test data created when registration is approved
✅ Admins can wipe all company data except users
✅ Two-step confirmation prevents accidents
✅ Database functions ensure security and isolation

**The system is ready to use!** New companies can explore the platform immediately with sample data, then wipe it when ready for production.
