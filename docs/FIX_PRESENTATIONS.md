# Fix: Presentations Showing Non-Relevant Data

## 🔴 The Problem

You're experiencing:
1. **Presented to section in aircraft view** shows incorrect/missing lead names
2. **Presentations section in leads view** shows incorrect/missing aircraft
3. Presentations created from aircraft view don't appear in leads view (and vice versa)

## 🎯 Root Cause

When you updated the `user_id` in your test data to match your account, the **presentations arrays** inside those records still contain references to leads/aircraft from the previous owner.

Example:
```json
// Your lead (ID: 123) has:
{
  "presentations": [
    {
      "aircraftId": 999,  // ❌ This aircraft belongs to someone else!
      "priceGiven": 5000000,
      "date": "2024-01-01"
    }
  ]
}
```

When the app tries to look up `aircraftId: 999`, it doesn't find it in YOUR aircraft list, so it shows blank/missing data.

## ⚡ Quick Fix: Clear All Presentations

The simplest solution is to clear all presentations and start fresh.

### Step 1: Get Your User ID

From browser console, look for:
```
=== SUPABASE DATA FETCH DEBUG ===
User ID: abc-123-def...
```

Or run in Supabase SQL Editor:
```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;
```

### Step 2: Clear Presentations

In **Supabase SQL Editor**, run (replace `YOUR-USER-ID`):

```sql
-- Clear all presentations from leads
UPDATE leads
SET presentations = '[]'::jsonb
WHERE user_id = 'YOUR-USER-ID';

-- Clear all presentations from aircraft
UPDATE aircraft
SET presentations = '[]'::jsonb
WHERE user_id = 'YOUR-USER-ID';

-- Verify they're cleared
SELECT
  'leads' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN jsonb_array_length(presentations) > 0 THEN 1 ELSE 0 END) as with_presentations
FROM leads
WHERE user_id = 'YOUR-USER-ID'

UNION ALL

SELECT
  'aircraft' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN jsonb_array_length(presentations) > 0 THEN 1 ELSE 0 END) as with_presentations
FROM aircraft
WHERE user_id = 'YOUR-USER-ID';
```

### Step 3: Refresh Browser

1. **Refresh** your browser (Cmd+R / Ctrl+R)
2. The "Presentations" and "Presented to" sections should now be empty
3. **Create new presentations** - they will now work correctly!

## 🔧 Alternative: Manual Fix (Advanced)

If you want to keep some presentations, you need to manually update the IDs to match YOUR data.

### Step 1: Get YOUR valid IDs

```sql
-- Get YOUR lead IDs
SELECT id, name FROM leads WHERE user_id = 'YOUR-USER-ID';

-- Get YOUR aircraft IDs
SELECT id, manufacturer, model FROM aircraft WHERE user_id = 'YOUR-USER-ID';
```

### Step 2: Check current presentations

```sql
-- See what's in leads presentations
SELECT id, name, presentations
FROM leads
WHERE user_id = 'YOUR-USER-ID'
  AND jsonb_array_length(presentations) > 0;

-- See what's in aircraft presentations
SELECT id, manufacturer, model, presentations
FROM aircraft
WHERE user_id = 'YOUR-USER-ID'
  AND jsonb_array_length(presentations) > 0;
```

### Step 3: Manually update IDs

This is complex and error-prone. **Recommended: Just clear and recreate instead!**

## 🎓 Understanding the Data Structure

### Lead Presentations Format:
```json
{
  "presentations": [
    {
      "aircraftId": 123,      // Must be YOUR aircraft ID
      "priceGiven": 5000000,
      "date": "2024-01-15T10:30:00",
      "notes": "Client interested"
    }
  ]
}
```

### Aircraft Presentations Format:
```json
{
  "presentations": [
    {
      "leadId": 456,          // Must be YOUR lead ID
      "date": "2024-01-15T10:30:00",
      "notes": "Presented via email"
    }
  ]
}
```

## ✅ After the Fix

Once presentations are cleared and you create new ones:

1. ✅ Creating presentation from **Leads View**:
   - Select an aircraft to present
   - It updates BOTH the lead AND the aircraft
   - Aircraft will show "Presented to: [Lead Name]"

2. ✅ Creating presentation from **Aircraft View**:
   - Select a lead to present to
   - It updates BOTH the aircraft AND the lead
   - Lead will show "Presentations: [Aircraft Name]"

3. ✅ Data syncs correctly between both views
4. ✅ No more missing or non-relevant data

## 🧪 Test After Fix

1. Go to **Leads View**
2. Click **"Present Aircraft"** on any lead
3. Select an aircraft, enter price, save
4. ✅ Lead should show the presentation
5. Go to **Aircraft View**
6. ✅ That aircraft should show "Presented to: [Lead Name]"

Both views should now show matching data!

## 📋 Quick Checklist

- [ ] Get your user_id from console or SQL
- [ ] Run UPDATE query to clear presentations
- [ ] Verify presentations are cleared (count = 0)
- [ ] Refresh browser
- [ ] Create test presentation from Leads view
- [ ] Check it appears in both Leads and Aircraft views
- [ ] ✅ Done!

## 💡 Why This Happened

When test data was migrated:
1. ✅ Lead and aircraft `user_id` were updated to YOUR user
2. ❌ But `presentations` arrays still had IDs from previous owner
3. ❌ App tried to look up those IDs and found nothing

The fix ensures all presentation references use YOUR lead and aircraft IDs.

---

**Ready?** Just run those two UPDATE queries and you'll be all set! 🚀
