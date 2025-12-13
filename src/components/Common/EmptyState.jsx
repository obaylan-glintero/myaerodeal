import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, Search, FileText, Users, Plane, ListTodo, Calendar } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FileText,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) => {
  const { colors } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: `${colors.primary}15` }}
      >
        <Icon size={40} style={{ color: colors.primary }} />
      </div>

      <h3
        className="text-xl font-semibold mb-2"
        style={{ color: colors.textPrimary }}
      >
        {title}
      </h3>

      <p
        className="text-sm max-w-md mb-6"
        style={{ color: colors.textSecondary }}
      >
        {description}
      </p>

      <div className="flex gap-3">
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: colors.primary, color: colors.secondary }}
          >
            <Plus size={18} />
            {actionLabel}
          </button>
        )}

        {onSecondaryAction && secondaryActionLabel && (
          <button
            onClick={onSecondaryAction}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-80"
            style={{
              backgroundColor: 'transparent',
              color: colors.primary,
              border: `1px solid ${colors.primary}`
            }}
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

// Preset empty states for common scenarios
export const NoLeadsEmpty = ({ onAddLead }) => (
  <EmptyState
    icon={Users}
    title="No leads yet"
    description="Start building your pipeline by adding your first lead. Track prospects from initial inquiry to closed deal."
    actionLabel="Add Your First Lead"
    onAction={onAddLead}
  />
);

export const NoFilteredLeadsEmpty = ({ onClearFilters }) => (
  <EmptyState
    icon={Search}
    title="No matching leads"
    description="No leads match your current filters. Try adjusting your search criteria or clear all filters."
    actionLabel="Clear Filters"
    onAction={onClearFilters}
  />
);

export const NoAircraftEmpty = ({ onAddAircraft }) => (
  <EmptyState
    icon={Plane}
    title="No aircraft in inventory"
    description="Add aircraft to your inventory to start matching them with leads and creating deals."
    actionLabel="Add Aircraft"
    onAction={onAddAircraft}
  />
);

export const NoFilteredAircraftEmpty = ({ onClearFilters }) => (
  <EmptyState
    icon={Search}
    title="No matching aircraft"
    description="No aircraft match your current filters. Try adjusting your search criteria or clear all filters."
    actionLabel="Clear Filters"
    onAction={onClearFilters}
  />
);

export const NoDealsEmpty = ({ onAddDeal, onViewLeads }) => (
  <EmptyState
    icon={FileText}
    title="No deals yet"
    description="Create a deal when you have a lead interested in an aircraft. Deals help you track the transaction from LOI to closing."
    actionLabel="Create Deal"
    onAction={onAddDeal}
    secondaryActionLabel="View Leads"
    onSecondaryAction={onViewLeads}
  />
);

export const NoTasksEmpty = ({ onAddTask }) => (
  <EmptyState
    icon={ListTodo}
    title="No pending tasks"
    description="You're all caught up! Add a task to track follow-ups, deadlines, or action items."
    actionLabel="Add Task"
    onAction={onAddTask}
  />
);

export const NoCalendarTasksEmpty = () => (
  <EmptyState
    icon={Calendar}
    title="No tasks scheduled"
    description="Tasks with due dates will appear on the calendar. Add tasks with due dates to see them here."
  />
);

export default EmptyState;
