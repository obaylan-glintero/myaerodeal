/**
 * Lead formatting utilities
 *
 * These functions format lead data for display in the UI while keeping
 * the database records clean and normalized.
 */

/**
 * Format budget amount for display
 * @param {number|null} budget - Budget amount in dollars
 * @returns {string} Formatted budget string (e.g., "$5.5M" or "Unknown")
 */
export function formatBudget(budget) {
  if (!budget || budget === 0) {
    return 'Unknown';
  }

  const millions = budget / 1000000;
  return `$${millions.toFixed(1)}M`;
}

/**
 * Format lead display name for UI
 * Formats as: {Lead Name} - {Preferred Model} - {Budget}
 *
 * @param {Object} lead - Lead object with name, preferredModel, and budget
 * @returns {string} Formatted display name
 *
 * Examples:
 *   formatLeadDisplayName({ name: "John Smith", preferredModel: "G650", budget: 5500000 })
 *   // Returns: "John Smith - G650 - $5.5M"
 *
 *   formatLeadDisplayName({ name: "Jane Doe", preferredModel: "Citation X", budget: null })
 *   // Returns: "Jane Doe - Citation X - Unknown"
 *
 *   formatLeadDisplayName({ name: "Bob Wilson", preferredModel: null, budget: 2800000 })
 *   // Returns: "Bob Wilson - $2.8M"
 *
 *   formatLeadDisplayName({ name: "Alice Brown", preferredModel: null, budget: null })
 *   // Returns: "Alice Brown"
 */
export function formatLeadDisplayName(lead) {
  if (!lead || !lead.name) {
    return 'Unknown';
  }

  const parts = [lead.name];

  // Add preferred model if available
  if (lead.preferredModel) {
    parts.push(lead.preferredModel);
  }

  // Add budget (or "Unknown" if we have a model but no budget)
  if (lead.budget) {
    parts.push(formatBudget(lead.budget));
  } else if (lead.preferredModel) {
    // Only add "Unknown" if we have a model but no budget
    parts.push('Unknown');
  }

  return parts.join(' - ');
}

/**
 * Format lead display name with company
 * Formats as: {Lead Name} - {Preferred Model} - {Budget} ({Company})
 *
 * @param {Object} lead - Lead object with name, preferredModel, budget, and company
 * @returns {string} Formatted display name with company
 *
 * Example:
 *   formatLeadWithCompany({ name: "John Smith", preferredModel: "G650", budget: 5500000, company: "Acme Corp" })
 *   // Returns: "John Smith - G650 - $5.5M (Acme Corp)"
 */
export function formatLeadWithCompany(lead) {
  if (!lead) {
    return 'Unknown';
  }

  const displayName = formatLeadDisplayName(lead);

  if (lead.company) {
    return `${displayName} (${lead.company})`;
  }

  return displayName;
}

/**
 * Format lead for dropdown options
 * Shorter format suitable for dropdowns
 * Formats as: {Lead Name} - {Preferred Model} - {Budget}
 *
 * @param {Object} lead - Lead object
 * @returns {string} Formatted option label
 */
export function formatLeadOption(lead) {
  return formatLeadDisplayName(lead);
}
