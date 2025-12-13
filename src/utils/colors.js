// Aviation Elite Color Palettes

// Light Theme (Default)
export const lightTheme = {
  primary: '#C9A55A',      // Refined Gold - Primary buttons and highlighted items
  secondary: '#F0F2F5',    // Light Gray - Sidebars, headers, and UI separation (lighter for light mode)
  background: '#F8F9FA',   // Light Gray - Main app background
  cardBg: '#FFFFFF',       // White - Cards, modals, and input fields
  border: '#D6D9DD',       // Light Border - Borders and dividers
  textPrimary: '#0A1628',  // Deep Navy - Main text
  textSecondary: '#5A6B7D', // Muted Blue - Labels and secondary info
  error: '#D9534F',        // Warm Red - Alerts, warnings, and deletions
  accent: '#2E5A88',       // Aerospace Blue - Accent color for highlights
  // Aircraft status colors
  statusForSale: '#059669',      // Darker green for better contrast
  statusForSaleText: '#FFFFFF',  // White text
  statusUnderContract: '#D97706', // Darker amber for better contrast
  statusUnderContractText: '#FFFFFF', // White text
  statusNotForSale: '#DC2626',   // Red for better visibility
  statusNotForSaleText: '#FFFFFF', // White text
  // Lead status colors
  leadInquiry: '#0891B2',        // Cyan
  leadPresented: '#7C3AED',      // Purple
  leadInterested: '#D97706',     // Amber
  leadDealCreated: '#DC2626',    // Red
  leadLost: '#6B7280',           // Gray
  // Deal status colors
  dealActive: '#059669',         // Green
  dealClosedWon: '#059669',      // Green
  dealClosedLost: '#DC2626',     // Red
  // Task priority colors
  priorityHigh: { bg: '#FEE2E2', text: '#DC2626' },
  priorityMedium: { bg: '#FEF3C7', text: '#D97706' },
  priorityLow: { bg: '#DBEAFE', text: '#2563EB' },
  // Stat card semantic colors
  statLeads: '#7C3AED',          // Purple for leads
  statDeals: '#059669',          // Green for deals
  statAircraft: '#2E5A88',       // Blue for aircraft
  statTasks: '#D97706',          // Amber for tasks
};

// Dark Theme
export const darkTheme = {
  primary: '#C9A55A',      // Refined Gold - Primary buttons and highlighted items
  secondary: '#1A2E45',    // Medium Navy - Sidebars, headers, and UI separation (lighter for dark mode)
  background: '#050A14',   // Midnight Navy - Main app background
  cardBg: '#0F1B2E',       // Dark Navy - Cards, modals, and input fields
  border: '#1A2A42',       // Navy Gray - Borders and dividers
  textPrimary: '#F5F5F5',  // Off-White - Main text for dark backgrounds
  textSecondary: '#8A95A5', // Steel Gray - Labels and secondary info
  error: '#D9534F',        // Warm Red - Alerts, warnings, and deletions
  accent: '#2E5A88',       // Aerospace Blue - Accent color for highlights
  // Aircraft status colors
  statusForSale: '#10B981',      // Bright green for dark backgrounds
  statusForSaleText: '#FFFFFF',  // White text
  statusUnderContract: '#F59E0B', // Bright amber for dark backgrounds
  statusUnderContractText: '#FFFFFF', // White text
  statusNotForSale: '#EF4444',   // Bright red for better visibility
  statusNotForSaleText: '#FFFFFF', // White text
  // Lead status colors
  leadInquiry: '#22D3EE',        // Bright Cyan
  leadPresented: '#A78BFA',      // Bright Purple
  leadInterested: '#FBBF24',     // Bright Amber
  leadDealCreated: '#F87171',    // Bright Red
  leadLost: '#9CA3AF',           // Light Gray
  // Deal status colors
  dealActive: '#10B981',         // Bright Green
  dealClosedWon: '#10B981',      // Bright Green
  dealClosedLost: '#EF4444',     // Bright Red
  // Task priority colors
  priorityHigh: { bg: '#450A0A', text: '#FCA5A5' },
  priorityMedium: { bg: '#451A03', text: '#FCD34D' },
  priorityLow: { bg: '#1E3A5F', text: '#93C5FD' },
  // Stat card semantic colors
  statLeads: '#A78BFA',          // Bright Purple for leads
  statDeals: '#10B981',          // Bright Green for deals
  statAircraft: '#60A5FA',       // Bright Blue for aircraft
  statTasks: '#FBBF24',          // Bright Amber for tasks
};

// Default export (light theme)
export const colors = lightTheme;

// Helper function to get lead status colors
export const getLeadStatusColors = (status, theme) => {
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const statusMap = {
    'Inquiry': { bg: colors.leadInquiry, text: '#FFFFFF' },
    'Presented': { bg: colors.leadPresented, text: '#FFFFFF' },
    'Interested': { bg: colors.leadInterested, text: '#FFFFFF' },
    'Deal Created': { bg: colors.leadDealCreated, text: '#FFFFFF' },
    'Lost': { bg: colors.leadLost, text: '#FFFFFF' },
  };
  return statusMap[status] || statusMap['Inquiry'];
};

// Helper function to get task priority colors
export const getTaskPriorityColors = (priority, theme) => {
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const priorityMap = {
    'high': colors.priorityHigh,
    'medium': colors.priorityMedium,
    'low': colors.priorityLow,
  };
  return priorityMap[priority] || priorityMap['low'];
};

// Helper function to get stat card colors by type
export const getStatCardColor = (type, theme) => {
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const typeMap = {
    'leads': colors.statLeads,
    'deals': colors.statDeals,
    'aircraft': colors.statAircraft,
    'tasks': colors.statTasks,
  };
  return typeMap[type] || colors.primary;
};

export default colors;