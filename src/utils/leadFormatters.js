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
 * Formats as: {Lead Name} - {Preferred Model or Aircraft Type} - {Budget}
 *
 * @param {Object} lead - Lead object with name, preferredModel, aircraftType, and budget
 * @returns {string} Formatted display name
 *
 * Examples:
 *   formatLeadDisplayName({ name: "John Smith", preferredModel: "G650", budget: 5500000 })
 *   // Returns: "John Smith - G650 - $5.5M"
 *
 *   formatLeadDisplayName({ name: "Jane Doe", preferredModel: "Citation X", budget: null })
 *   // Returns: "Jane Doe - Citation X - Unknown"
 *
 *   formatLeadDisplayName({ name: "Bob Wilson", preferredModel: null, aircraftType: "Light Jet", budget: 2800000 })
 *   // Returns: "Bob Wilson - Light Jet - $2.8M"
 *
 *   formatLeadDisplayName({ name: "Alice Brown", preferredModel: null, aircraftType: "Heavy Jet", budget: null })
 *   // Returns: "Alice Brown - Heavy Jet - Unknown"
 *
 *   formatLeadDisplayName({ name: "Charlie Davis", preferredModel: null, aircraftType: null, budget: null })
 *   // Returns: "Charlie Davis"
 */
export function formatLeadDisplayName(lead) {
  if (!lead || !lead.name) {
    return 'Unknown';
  }

  const parts = [lead.name];

  // Add preferred model if available, otherwise use aircraft type
  const aircraftInfo = lead.preferredModel || lead.aircraftType;
  if (aircraftInfo) {
    parts.push(aircraftInfo);
  }

  // Add budget (or "Unknown" if we have aircraft info but no budget)
  if (lead.budget) {
    parts.push(formatBudget(lead.budget));
  } else if (aircraftInfo) {
    // Only add "Unknown" if we have aircraft info but no budget
    parts.push('Unknown');
  }

  return parts.join(' - ');
}

/**
 * Format lead display name with company
 * Formats as: {Lead Name} - {Preferred Model or Aircraft Type} - {Budget} ({Company})
 *
 * @param {Object} lead - Lead object with name, preferredModel, aircraftType, budget, and company
 * @returns {string} Formatted display name with company
 *
 * Examples:
 *   formatLeadWithCompany({ name: "John Smith", preferredModel: "G650", budget: 5500000, company: "Acme Corp" })
 *   // Returns: "John Smith - G650 - $5.5M (Acme Corp)"
 *
 *   formatLeadWithCompany({ name: "Jane Doe", preferredModel: null, aircraftType: "Light Jet", budget: 3000000, company: "Tech Co" })
 *   // Returns: "Jane Doe - Light Jet - $3.0M (Tech Co)"
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
