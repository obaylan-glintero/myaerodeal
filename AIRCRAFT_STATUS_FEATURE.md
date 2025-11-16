# Aircraft Status Feature

## Overview
Added a status field to aircraft with three options:
- **For Sale** (default)
- **Not for Sale**
- **Under Contract**

## Changes Made

### 1. Database Migration (`ADD_AIRCRAFT_STATUS.sql`)
- Added `status` column to `aircraft` table
- Set default value to "For Sale"
- Added constraint to only allow the three valid status values
- Updated all existing aircraft to have "For Sale" status

**To apply the migration:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `ADD_AIRCRAFT_STATUS.sql`
3. Click "Run"

### 2. Aircraft Form (`src/components/Common/Modal.jsx`)
- Added status dropdown in the aircraft form (Modal.jsx:439-448)
- Default value is "For Sale"
- User can select:
  - For Sale
  - Not for Sale
  - Under Contract

### 3. Aircraft Display (`src/components/Aircraft/AircraftView.jsx`)

#### Status Badge Display
- Added status badge in aircraft card (AircraftView.jsx:489-500)
- Color-coded badges:
  - **For Sale**: Green (`#10B981`)
  - **Under Contract**: Orange/Amber (`#F59E0B`)
  - **Not for Sale**: Gray (`#6B7280`)

#### Status Filter
- Added status filter dropdown (AircraftView.jsx:397-411)
- **Default filter: "For Sale"** - Only shows aircraft marked as "For Sale"
- Filter options:
  - All Status (shows all aircraft)
  - For Sale
  - Not for Sale
  - Under Contract

## Usage

### Adding/Editing Aircraft
1. Click "Add Aircraft" or edit existing aircraft
2. Fill in aircraft details
3. Select status from dropdown (defaults to "For Sale")
4. Save

### Viewing Aircraft
- Status is displayed as a colored badge in each aircraft card
- Green = For Sale
- Orange = Under Contract
- Gray = Not for Sale

### Filtering by Status
- Use the "Status" dropdown in the filters section
- **Default behavior**: Only "For Sale" aircraft are shown
- Select "All Status" to see all aircraft regardless of status
- Select specific status to filter by that status only

## Technical Details

### Files Modified
1. `ADD_AIRCRAFT_STATUS.sql` - Database migration
2. `src/components/Common/Modal.jsx` - Aircraft form
3. `src/components/Aircraft/AircraftView.jsx` - Aircraft display and filtering

### State Management
- Status filter state: `filterStatus` (default: "For Sale")
- Filter logic includes status matching (AircraftView.jsx:300)
- Status defaults to "For Sale" if not set on existing aircraft

### Database Schema
```sql
ALTER TABLE aircraft
ADD COLUMN status TEXT DEFAULT 'For Sale'
CHECK (status IN ('For Sale', 'Not for Sale', 'Under Contract'));
```

## Testing Checklist

- [ ] Run the SQL migration in Supabase
- [ ] Add new aircraft with "For Sale" status
- [ ] Add new aircraft with "Not for Sale" status
- [ ] Add new aircraft with "Under Contract" status
- [ ] Verify status badge appears in aircraft cards with correct colors
- [ ] Verify default filter shows only "For Sale" aircraft
- [ ] Change filter to "All Status" and verify all aircraft are shown
- [ ] Filter by "Not for Sale" and verify only those aircraft are shown
- [ ] Filter by "Under Contract" and verify only those aircraft are shown
- [ ] Edit existing aircraft and change status
- [ ] Verify status persists after page reload

## Next Steps

After running the migration:
1. Existing aircraft will have "For Sale" status by default
2. Users can edit aircraft to change their status
3. The aircraft list will show only "For Sale" aircraft by default
4. Users can use the filter to see aircraft with other statuses
