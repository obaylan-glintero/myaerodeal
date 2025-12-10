#!/usr/bin/env node
/**
 * Bulk Rename Leads Script
 *
 * This script renames leads to the format:
 * {Lead Name} - {Preferred Model} - {Budget}
 *
 * Usage:
 *   node scripts/bulk-rename-leads.js --company-id=<UUID> [--dry-run] [--undo]
 *
 * Options:
 *   --company-id    Required. The UUID of the company to update leads for
 *   --dry-run       Preview changes without applying them
 *   --undo          Restore original lead names (removes everything after first " - ")
 *   --help          Show this help message
 *
 * Examples:
 *   # Preview changes
 *   node scripts/bulk-rename-leads.js --company-id=123e4567-e89b-12d3-a456-426614174000 --dry-run
 *
 *   # Apply changes
 *   node scripts/bulk-rename-leads.js --company-id=123e4567-e89b-12d3-a456-426614174000
 *
 *   # Undo changes
 *   node scripts/bulk-rename-leads.js --company-id=123e4567-e89b-12d3-a456-426614174000 --undo
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    return envVars;
  } catch (error) {
    console.error('Warning: Could not load .env file');
    return {};
  }
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  companyId: null,
  dryRun: false,
  undo: false,
  help: false
};

args.forEach(arg => {
  if (arg.startsWith('--company-id=')) {
    options.companyId = arg.split('=')[1];
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--undo') {
    options.undo = true;
  } else if (arg === '--help') {
    options.help = true;
  }
});

// Show help
if (options.help || !options.companyId) {
  console.log(`
Bulk Rename Leads Script
=========================

Renames leads to the format: {Lead Name} - {Preferred Model} - {Budget}

Usage:
  node scripts/bulk-rename-leads.js --company-id=<UUID> [--dry-run] [--undo]

Options:
  --company-id    Required. The UUID of the company to update leads for
  --dry-run       Preview changes without applying them
  --undo          Restore original lead names (removes everything after first " - ")
  --help          Show this help message

Examples:
  # Preview changes
  node scripts/bulk-rename-leads.js --company-id=123e4567-e89b-12d3-a456-426614174000 --dry-run

  # Apply changes
  node scripts/bulk-rename-leads.js --company-id=123e4567-e89b-12d3-a456-426614174000

  # Undo changes
  node scripts/bulk-rename-leads.js --company-id=123e4567-e89b-12d3-a456-426614174000 --undo
`);
  process.exit(options.help ? 0 : 1);
}

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing Supabase configuration');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Format budget for display
 */
function formatBudget(budget) {
  if (!budget) return 'Unknown';
  const millions = budget / 1000000;
  return `$${millions.toFixed(1)}M`;
}

/**
 * Generate new lead name
 */
function generateNewName(lead) {
  const { name, preferred_model, budget } = lead;

  const parts = [name];

  if (preferred_model) {
    parts.push(preferred_model);
  }

  if (budget) {
    parts.push(formatBudget(budget));
  } else if (preferred_model) {
    // Only add "Unknown" if we have preferred_model but no budget
    parts.push('Unknown');
  }

  return parts.join(' - ');
}

/**
 * Restore original name (undo operation)
 */
function restoreOriginalName(name) {
  // Split by " - " and take the first part
  return name.split(' - ')[0];
}

/**
 * Main script execution
 */
async function main() {
  console.log('\n🚀 Bulk Rename Leads Script\n');
  console.log(`Company ID: ${options.companyId}`);
  console.log(`Mode: ${options.undo ? 'UNDO' : options.dryRun ? 'DRY RUN' : 'LIVE UPDATE'}\n`);

  try {
    // Fetch leads for the specified company
    const { data: leads, error: fetchError } = await supabase
      .from('leads')
      .select('id, name, preferred_model, budget, company_id')
      .eq('company_id', options.companyId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching leads:', fetchError.message);
      process.exit(1);
    }

    if (!leads || leads.length === 0) {
      console.log('ℹ️  No leads found for this company');
      process.exit(0);
    }

    console.log(`Found ${leads.length} leads\n`);

    // Filter leads that need updating
    const leadsToUpdate = options.undo
      ? leads.filter(lead => lead.name.includes(' - '))
      : leads.filter(lead => {
          // Skip if already renamed
          if (lead.name.includes(' - ')) return false;
          // Only update if we have preferred_model or budget
          return lead.preferred_model || lead.budget;
        });

    if (leadsToUpdate.length === 0) {
      console.log('ℹ️  No leads need updating');
      process.exit(0);
    }

    console.log(`${leadsToUpdate.length} leads will be updated:\n`);

    // Preview changes
    const updates = leadsToUpdate.map(lead => {
      const newName = options.undo
        ? restoreOriginalName(lead.name)
        : generateNewName(lead);

      return {
        id: lead.id,
        currentName: lead.name,
        newName: newName
      };
    });

    // Display preview
    console.log('─'.repeat(80));
    updates.forEach((update, index) => {
      console.log(`${index + 1}. "${update.currentName}"`);
      console.log(`   → "${update.newName}"\n`);
    });
    console.log('─'.repeat(80));

    if (options.dryRun) {
      console.log('\n✅ Dry run complete. No changes were made.');
      console.log('   Run without --dry-run to apply these changes.\n');
      process.exit(0);
    }

    // Confirm before proceeding
    console.log(`\n⚠️  About to update ${updates.length} leads.`);

    // Apply updates
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          name: update.newName,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.id);

      if (updateError) {
        console.error(`❌ Error updating lead ${update.id}:`, updateError.message);
        errorCount++;
      } else {
        successCount++;
      }
    }

    console.log(`\n✅ Update complete!`);
    console.log(`   Success: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount}`);
    }
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
