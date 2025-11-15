# JetCRM Component Architecture

## Component Hierarchy

```
App.jsx (Main Container)
├── Navigation.jsx (Sidebar)
│   └── Tab switching logic
│
├── Dashboard.jsx
│   ├── StatCard.jsx (x4)
│   ├── Recent Leads List
│   ├── Upcoming Tasks List
│   └── Deal Pipeline Chart
│
├── LeadsView.jsx
│   ├── Search & Filter Bar
│   └── Lead Cards (multiple)
│       ├── Lead Information
│       ├── Presentations List
│       └── Action Buttons
│           ├── Edit (→ Modal)
│           ├── Delete
│           ├── Present Aircraft (→ Modal)
│           └── Create Deal (→ Modal)
│
├── AircraftView.jsx
│   └── Aircraft Cards (multiple)
│       ├── Aircraft Details
│       ├── Presentations List
│       └── Action Buttons
│           ├── Edit (→ Modal)
│           ├── Delete
│           └── Present to Lead (→ Modal)
│
├── DealsView.jsx
│   └── Deal Cards (multiple)
│       ├── Deal Information
│       ├── Status Dropdown
│       ├── Next Step Display
│       ├── History Timeline
│       └── Action Buttons
│           ├── Edit (→ Modal)
│           └── Delete
│
├── TasksView.jsx
│   ├── View Toggle (List/Calendar)
│   ├── Task List View
│   │   ├── Pending Tasks
│   │   │   └── TaskCard (multiple)
│   │   └── Completed Tasks
│   │       └── TaskCard (multiple)
│   └── Calendar View
│       └── TasksCalendarView
│           ├── Month Navigation
│           └── Calendar Grid
│               └── Task Pills
│
├── AIAssistant.jsx (Fixed Bottom Right)
│   ├── Chat Header
│   ├── Message List
│   │   ├── User Messages
│   │   └── Assistant Messages
│   └── Input Bar
│       ├── Text Input
│       └── Send Button
│
└── Modal.jsx (Conditional Render)
    ├── Lead Form
    ├── Aircraft Form
    ├── Deal Form
    ├── Task Form
    └── Presentation Form
```

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│                   Zustand Store                      │
│                  (useStore.js)                       │
│                                                      │
│  State:                    Actions:                  │
│  • leads[]                 • addLead()              │
│  • aircraft[]              • updateLead()           │
│  • deals[]                 • deleteLead()           │
│  • tasks[]                 • addAircraft()          │
│                           • updateAircraft()        │
│                           • deleteAircraft()        │
│                           • addDeal()               │
│                           • updateDealStatus()      │
│                           • addTask()               │
│                           • updateTask()            │
│                           • deleteTask()            │
│                           • presentAircraftToLead() │
│                           • createAutoTask()        │
└─────────────────────────────────────────────────────┘
                          ↑↓
        ┌─────────────────┴─────────────────┐
        │                                    │
        ↓                                    ↓
┌──────────────┐                   ┌──────────────┐
│  Components  │                   │     Modal    │
│   Read/Write │←─── Actions ────→ │ Create/Edit  │
│     State    │                   │     Forms    │
└──────────────┘                   └──────────────┘
        ↓
┌──────────────┐
│   UI Update  │
│  (Re-render) │
└──────────────┘
```

## State Management Flow

### Example: Creating a Lead

```
User Action: Click "Add Lead"
     ↓
App.jsx: openModal('lead')
     ↓
Modal.jsx: Renders LeadForm
     ↓
User: Fills form and clicks "Create"
     ↓
Modal.jsx: Calls addLead(formData)
     ↓
useStore.js: 
  - Creates new lead with ID
  - Adds to leads array
  - Calls createAutoTask()
     ↓
Components: Re-render with new data
  - LeadsView shows new lead
  - Dashboard updates counts
  - TasksView shows new auto-task
```

### Example: Presenting Aircraft to Lead

```
User Action: Click "Present to Lead" on aircraft
     ↓
AircraftView: openModal('presentationFromAircraft', aircraft)
     ↓
Modal: Renders PresentationForm with aircraft pre-selected
     ↓
User: Selects lead, enters price and notes
     ↓
Modal: Calls presentAircraftToLead(leadId, aircraftId, notes, price)
     ↓
useStore.js:
  - Updates lead.presentations[]
  - Updates aircraft.presentations[]
  - Calls createAutoTask('presentation', leadId, title)
     ↓
Components: Re-render
  - LeadsView shows presentation in lead card
  - AircraftView shows presentation in aircraft card
  - TasksView shows new follow-up task
```

### Example: Updating Deal Status

```
User Action: Changes status dropdown in deal card
     ↓
DealsView: Calls updateDealStatus(dealId, newStatus)
     ↓
useStore.js:
  - Looks up next step based on status
  - Calculates new follow-up date
  - Updates deal with new status, next step, and date
  - Adds history entry
  - Calls createAutoTask() with next step
     ↓
Components: Re-render
  - DealsView updates deal card
  - Dashboard updates pipeline counts
  - TasksView shows new auto-task
```

## Component Communication

### Props Flow

```
App.jsx
  │
  ├─→ Navigation (activeTab, setActiveTab)
  │
  ├─→ Dashboard (openModal)
  │     └─→ StatCard (icon, title, value, total, color) ×4
  │
  ├─→ LeadsView (openModal)
  │     └─ Uses: leads, aircraft, deleteLead from store
  │
  ├─→ AircraftView (openModal)
  │     └─ Uses: aircraft, leads, deleteAircraft from store
  │
  ├─→ DealsView (openModal)
  │     └─ Uses: deals, leads, aircraft, updateDealStatus, deleteDeal
  │
  ├─→ TasksView (openModal)
  │     └─ Uses: tasks, updateTask, deleteTask from store
  │           └─→ TaskCard (task, onUpdate, onDelete) ×N
  │
  ├─→ AIAssistant (setActiveTab, openModal)
  │     └─ Uses: leads, aircraft, deals, tasks from store
  │
  └─→ Modal (modalType, editingItem, closeModal)
        └─ Uses: All store actions based on modalType
```

### Store Hook Usage by Component

```
Dashboard:
  - Read: leads, aircraft, deals, tasks
  - Write: updateTask

LeadsView:
  - Read: leads, aircraft
  - Write: deleteLead

AircraftView:
  - Read: aircraft, leads
  - Write: deleteAircraft

DealsView:
  - Read: deals, leads, aircraft
  - Write: updateDealStatus, deleteDeal

TasksView:
  - Read: tasks
  - Write: updateTask, deleteTask

AIAssistant:
  - Read: leads, aircraft, deals, tasks
  - Write: None (triggers via openModal)

Modal:
  - Read: leads, aircraft, deals (for dropdowns)
  - Write: addLead, updateLead, addAircraft, updateAircraft,
           addDeal, addTask, updateTask, presentAircraftToLead
```

## File Dependencies

```
App.jsx
  ├── Navigation.jsx
  │     └── colors.js
  │
  ├── Dashboard/Dashboard.jsx
  │     ├── StatCard.jsx
  │     ├── useStore.js
  │     └── colors.js
  │
  ├── Leads/LeadsView.jsx
  │     ├── useStore.js
  │     └── colors.js
  │
  ├── Aircraft/AircraftView.jsx
  │     ├── useStore.js
  │     └── colors.js
  │
  ├── Deals/DealsView.jsx
  │     ├── useStore.js
  │     └── colors.js
  │
  ├── Tasks/TasksView.jsx
  │     ├── useStore.js
  │     └── colors.js
  │
  ├── AI/AIAssistant.jsx
  │     ├── useStore.js
  │     └── colors.js
  │
  └── Common/Modal.jsx
        ├── useStore.js
        └── colors.js

main.jsx
  ├── App.jsx
  └── index.css
```

## Key Design Patterns

### 1. Container/Presentation Pattern
- **App.jsx**: Container managing routing and modal state
- **View Components**: Present data and handle user interactions
- **Modal.jsx**: Handles all form presentations

### 2. State Management Pattern
- **Zustand Store**: Single source of truth
- **No prop drilling**: Components access store directly
- **Automatic updates**: Store changes trigger re-renders

### 3. Modal Pattern
- **Single Modal Component**: Handles all form types
- **Dynamic Forms**: Renders different forms based on `modalType`
- **Controlled by App**: App manages open/close state

### 4. Auto-Task Pattern
- **Automatic Creation**: Tasks auto-generated on key actions
- **Configurable**: Next steps calculated based on deal status
- **Linked**: Tasks linked to their source (lead, deal, etc.)

### 5. Presentation Tracking Pattern
- **Bidirectional**: Both leads and aircraft track presentations
- **Timestamped**: All presentations include date/time
- **Detailed**: Includes price, notes, and related entities

## Performance Considerations

1. **Zustand**: Lightweight state management, minimal re-renders
2. **Component Splits**: Each view is separate, only active view renders
3. **Filtered Lists**: Client-side filtering without API calls
4. **Lazy Loading**: Can be added for large datasets
5. **Memoization**: Can be added to expensive calculations

## Future Enhancement Points

1. **Services Layer**: Add `src/services/` for API calls
2. **Custom Hooks**: Extract reusable logic to `src/hooks/`
3. **Context Providers**: Add auth context, theme context
4. **Route Management**: Add React Router for URL-based navigation
5. **Error Boundaries**: Add error handling components
6. **Loading States**: Add loading indicators for async operations
7. **Optimistic Updates**: Update UI before backend confirms
8. **Undo/Redo**: Add action history and undo capability