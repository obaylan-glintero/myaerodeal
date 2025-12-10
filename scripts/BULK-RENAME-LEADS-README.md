# Bulk Rename Leads - Implementation Guide

## Overview

This guide provides **two script-based solutions** and **one UI-based alternative** for bulk renaming leads to the format:

```
{Lead Name} - {Preferred Model} - {Budget}
```

### Examples:
- `John Smith` → `John Smith - G650 - $5.5M`
- `Jane Doe` → `Jane Doe - Citation X - Unknown`
- `Bob Johnson` (no model/budget) → `Bob Johnson` (unchanged)

---

## ⚠️ Important Safety Notes

1. **Company Isolation**: Both scripts require a `company_id` to ensure you only update leads for a specific company
2. **Preview First**: Always run in preview/dry-run mode first to verify changes
3. **Backup**: Consider backing up your database before running bulk updates
4. **Undo Available**: Both scripts include undo functionality
5. **Already Renamed**: Scripts automatically skip leads that already contain ` - ` in the name

---

## Option 1: SQL Script (Fastest) ⚡

**Best for**: One-time bulk update, direct database access

### Prerequisites
- Access to Supabase SQL Editor
- Your company UUID

### How to Use

1. **Get your Company ID**:
   ```sql
   SELECT id, name FROM public.companies;
   ```

2. **Open the SQL script**:
   - Navigate to Supabase Dashboard → SQL Editor
   - Open `scripts/bulk-rename-leads.sql`

3. **Preview changes** (Step 1 in the script):
   - Replace `YOUR_COMPANY_ID_HERE` with your company UUID
   - Uncomment the preview SELECT query
   - Run it to see what will be changed

4. **Apply changes** (Step 2 in the script):
   - If the preview looks good, uncomment the UPDATE query
   - Replace `YOUR_COMPANY_ID_HERE` with your company UUID
   - Run the UPDATE query

5. **Verify**:
   - Refresh your application
   - Check that leads are renamed correctly

### Undo Changes
```sql
UPDATE public.leads
SET
  name = SPLIT_PART(name, ' - ', 1),
  updated_at = NOW()
WHERE company_id = 'YOUR_COMPANY_ID_HERE'
  AND name LIKE '% - %';
```

### Pros
✅ Very fast (updates all leads in one query)
✅ No additional dependencies
✅ Direct database access
✅ Easy to verify with preview query

### Cons
❌ Requires database access
❌ Less flexible for testing
❌ Manual process

---

## Option 2: Node.js Script (Recommended) 🎯

**Best for**: More control, testing, and repeatability

### Prerequisites
- Node.js installed
- `.env` file configured with Supabase credentials

### How to Use

1. **Get your Company ID**:
   You can find this in your Supabase database or by asking a team member.

2. **Preview changes** (Dry Run):
   ```bash
   node scripts/bulk-rename-leads.js --company-id=YOUR_COMPANY_UUID --dry-run
   ```

   This will show you all the changes that would be made without actually applying them.

3. **Apply changes**:
   ```bash
   node scripts/bulk-rename-leads.js --company-id=YOUR_COMPANY_UUID
   ```

4. **Undo changes** (if needed):
   ```bash
   node scripts/bulk-rename-leads.js --company-id=YOUR_COMPANY_UUID --undo
   ```

### Script Options

| Option | Description |
|--------|-------------|
| `--company-id=<UUID>` | **Required**. The UUID of the company to update |
| `--dry-run` | Preview changes without applying them |
| `--undo` | Restore original lead names |
| `--help` | Show help message |

### Example Output

```
🚀 Bulk Rename Leads Script

Company ID: 123e4567-e89b-12d3-a456-426614174000
Mode: DRY RUN

Found 15 leads

5 leads will be updated:

────────────────────────────────────────────────────────────────────────────────
1. "John Smith"
   → "John Smith - G650 - $5.5M"

2. "Jane Doe"
   → "Jane Doe - Citation X - Unknown"

3. "Bob Wilson"
   → "Bob Wilson - King Air 350 - $2.8M"

...
────────────────────────────────────────────────────────────────────────────────

✅ Dry run complete. No changes were made.
   Run without --dry-run to apply these changes.
```

### Pros
✅ Safe dry-run mode for testing
✅ Detailed preview of all changes
✅ Built-in undo functionality
✅ Easy to run multiple times
✅ No database access needed
✅ Uses existing Supabase client
✅ Respects RLS policies

### Cons
❌ Slower than SQL (updates one at a time)
❌ Requires Node.js environment

---

## Option 3: Admin UI Feature (Recommended for Production) 🎨

**Best for**: Long-term solution, non-technical users

For a more sustainable and user-friendly solution, consider adding a bulk rename feature to the admin UI.

### Proposed Implementation

#### Location
Add to the Leads view as an admin action:
- `src/components/Leads/LeadsView.jsx`

#### Features
- ✅ Checkbox to select leads
- ✅ "Bulk Rename" button in the action bar
- ✅ Preview modal showing before/after names
- ✅ Confirmation step
- ✅ Progress indicator
- ✅ Undo capability
- ✅ Filter by status, aircraft type, etc.
- ✅ Only visible to admin users

#### User Flow
1. User selects leads to rename (or "Select All")
2. Clicks "Bulk Rename" button
3. Preview modal shows current → new names
4. User confirms
5. Progress bar shows updates
6. Success message with option to undo

#### Benefits
✅ No database access needed
✅ Visual preview of changes
✅ Selective renaming (choose specific leads)
✅ Integrated with existing UI
✅ Audit trail (who renamed what)
✅ Can be reused in the future
✅ Role-based access control

#### Estimated Implementation Time
- Basic version: 2-3 hours
- With filters and advanced features: 4-6 hours

---

## Comparison Matrix

| Feature | SQL Script | Node.js Script | Admin UI |
|---------|-----------|----------------|----------|
| **Speed** | ⚡⚡⚡ Very Fast | ⚡⚡ Fast | ⚡ Moderate |
| **Safety** | ⚠️ Manual | ✅ Built-in | ✅✅ Best |
| **Preview** | ✅ Manual query | ✅ Automatic | ✅✅ Visual |
| **Undo** | ⚠️ Manual | ✅ Built-in | ✅✅ Built-in |
| **Repeatability** | ❌ | ✅ | ✅✅ |
| **User-Friendly** | ❌ | ⚠️ Technical | ✅✅ Yes |
| **Database Access** | ❌ Required | ✅ Not needed | ✅ Not needed |
| **Future Use** | ❌ | ⚠️ | ✅✅ |

---

## Recommendation

### For Immediate Use (Today/Tomorrow):
**Use the Node.js Script** (Option 2)
- Safe with dry-run mode
- Easy to test
- Can be undone easily
- No database access needed

### For Long-Term (Next Sprint):
**Build the Admin UI Feature** (Option 3)
- Best user experience
- Reusable for future bulk operations
- Integrated with your application
- Proper access control

---

## Getting Your Company ID

### Method 1: From Supabase Dashboard
1. Go to Supabase Dashboard → Table Editor
2. Open the `companies` table
3. Find your company and copy the `id` column

### Method 2: From SQL Editor
```sql
SELECT id, name FROM public.companies ORDER BY name;
```

### Method 3: From Your Application
Open the browser console on your application and run:
```javascript
// Get current user's company_id
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles')
  .select('company_id, companies(name)')
  .eq('id', user.id)
  .single();
console.log('Company ID:', profile.company_id);
console.log('Company Name:', profile.companies.name);
```

---

## Troubleshooting

### Script says "No leads found"
- Verify the company ID is correct
- Check that leads exist in the database for that company

### Script fails with "Missing Supabase configuration"
- Ensure `.env` file exists in the project root
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### Changes don't appear in the app
- Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check if real-time subscriptions need to be refreshed

### Some leads weren't updated
- Leads without `preferred_model` or `budget` will be skipped
- Leads already containing ` - ` in the name will be skipped

---

## Next Steps

1. **Today**: Run the Node.js script with `--dry-run` to preview
2. **If satisfied**: Run without `--dry-run` to apply changes
3. **Future**: Consider implementing the Admin UI feature for long-term sustainability

---

## Support

If you encounter any issues or need help:
1. Check the Troubleshooting section above
2. Review the script output for error messages
3. Verify your company ID is correct
4. Check Supabase dashboard for any database errors

---

## Files Created

- `scripts/bulk-rename-leads.sql` - SQL script for direct database updates
- `scripts/bulk-rename-leads.js` - Node.js script with dry-run and undo features
- `scripts/BULK-RENAME-LEADS-README.md` - This documentation file
