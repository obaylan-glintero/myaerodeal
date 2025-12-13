import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, MessageSquare, Send, ArrowUpDown, LayoutGrid, List, Loader2, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import ConfirmDialog from '../Common/ConfirmDialog';
import { NoLeadsEmpty, NoFilteredLeadsEmpty } from '../Common/EmptyState';
import { formatLeadDisplayName } from '../../utils/leadFormatters';
import { getLeadStatusColors } from '../../utils/colors';

const LeadsView = ({ openModal }) => {
  const { leads, aircraft, deleteLead, addNoteToLead, loadFullAircraftData, loadFullLeadData, leadsLoading } = useStore();
  const { colors, theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterAircraftType, setFilterAircraftType] = useState('all');
  const [filterPreferredModel, setFilterPreferredModel] = useState('');
  const [sortBy, setSortBy] = useState('statusAsc');
  const [viewMode, setViewMode] = useState('card');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, leadId: null, leadName: '' });

  // Helper to ensure full aircraft data is loaded before action
  const handleActionWithFullAircraftData = async (aircraftId, action) => {
    await loadFullAircraftData(aircraftId);
    // Get the updated aircraft directly from the store (not from the stale closure)
    const updatedAircraft = useStore.getState().aircraft.find(ac => ac.id === aircraftId);
    if (updatedAircraft) {
      action(updatedAircraft);
    }
  };

  // Helper to ensure full lead data is loaded before action
  const handleActionWithFullLeadData = async (leadId, action) => {
    await loadFullLeadData(leadId);
    // Get the updated lead directly from the store (not from the stale closure)
    const updatedLead = useStore.getState().leads.find(l => l.id === leadId);
    if (updatedLead) {
      action(updatedLead);
    }
  };

  // Delete confirmation handlers
  const handleDeleteClick = (lead) => {
    setDeleteConfirm({
      isOpen: true,
      leadId: lead.id,
      leadName: formatLeadDisplayName(lead) || 'this lead'
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.leadId) {
      deleteLead(deleteConfirm.leadId);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, leadId: null, leadName: '' });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('active');
    setFilterAircraftType('all');
    setFilterPreferredModel('');
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || filterStatus !== 'active' || filterAircraftType !== 'all' || filterPreferredModel;

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && lead.status !== 'Lost' && lead.status !== 'Deal Created') ||
      lead.status === filterStatus;
    const matchesAircraftType = filterAircraftType === 'all' || lead.aircraftType === filterAircraftType;
    const matchesPreferredModel = !filterPreferredModel ||
      lead.preferredModel?.toLowerCase().includes(filterPreferredModel.toLowerCase());
    return matchesSearch && matchesStatus && matchesAircraftType && matchesPreferredModel;
  });

  // Sort leads
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    switch (sortBy) {
      case 'nameAsc':
        return (a.name || '').localeCompare(b.name || '');
      case 'nameDesc':
        return (b.name || '').localeCompare(a.name || '');
      case 'dateNewest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'dateOldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case 'budgetHigh':
        return (b.budget || 0) - (a.budget || 0);
      case 'budgetLow':
        return (a.budget || 0) - (b.budget || 0);
      case 'company':
        return (a.company || '').localeCompare(b.company || '');
      case 'statusAsc':
        const statusOrder = { 'Inquiry': 1, 'Presented': 2, 'Interested': 3, 'Deal Created': 4, 'Lost': 5 };
        return (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
      case 'statusDesc':
        const statusOrderDesc = { 'Inquiry': 5, 'Presented': 4, 'Interested': 3, 'Deal Created': 2, 'Lost': 1 };
        return (statusOrderDesc[a.status] || 0) - (statusOrderDesc[b.status] || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Leads</h2>
        <div className="flex gap-2">
          <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
            <button
              onClick={() => setViewMode('card')}
              className="flex items-center gap-2 px-4 py-2 font-semibold"
              style={{
                backgroundColor: viewMode === 'card' ? colors.primary : colors.cardBg,
                color: viewMode === 'card' ? colors.secondary : colors.textPrimary
              }}
            >
              <LayoutGrid size={18} /> Card
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2 px-4 py-2 font-semibold"
              style={{
                backgroundColor: viewMode === 'list' ? colors.primary : colors.cardBg,
                color: viewMode === 'list' ? colors.secondary : colors.textPrimary,
                borderLeft: `1px solid ${colors.border}`
              }}
            >
              <List size={18} /> List
            </button>
          </div>
          <button
            onClick={() => openModal('lead')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: colors.primary, color: colors.secondary }}
          >
            <Plus size={20} /> Add Lead
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
            <input
              type="text"
              placeholder="Search by name or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg"
              style={{
                backgroundColor: colors.cardBg,
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
            style={{
              backgroundColor: showFilters ? colors.primary : colors.cardBg,
              color: showFilters ? colors.secondary : colors.textPrimary,
              border: `1px solid ${colors.border}`
            }}
          >
            <Filter size={18} />
            Filters
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: colors.cardBg,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`
            }}
          >
            <option value="dateNewest">Date: Newest First</option>
            <option value="dateOldest">Date: Oldest First</option>
            <option value="nameAsc">Name: A to Z</option>
            <option value="nameDesc">Name: Z to A</option>
            <option value="company">Company: A to Z</option>
            <option value="budgetHigh">Budget: High to Low</option>
            <option value="budgetLow">Budget: Low to High</option>
            <option value="statusAsc">Status: Inquiry to Lost</option>
            <option value="statusDesc">Status: Lost to Inquiry</option>
          </select>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 rounded-lg" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              >
                <option value="all">All Status</option>
                <option value="active">All Active Leads</option>
                <option value="Inquiry">Inquiry</option>
                <option value="Presented">Presented</option>
                <option value="Interested">Interested</option>
                <option value="Deal Created">Deal Created</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Aircraft Type</label>
              <select
                value={filterAircraftType}
                onChange={(e) => setFilterAircraftType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              >
                <option value="all">All Aircraft Types</option>
                <option value="Piston">Piston</option>
                <option value="Turboprop">Turboprop</option>
                <option value="Light Jet">Light Jet</option>
                <option value="Midsize Jet">Midsize Jet</option>
                <option value="Super-Mid Jet">Super-Mid Jet</option>
                <option value="Heavy Jet">Heavy Jet</option>
                <option value="Ultra-Long Range">Ultra-Long Range</option>
                <option value="Airliner">Airliner</option>
                <option value="Cargo">Cargo</option>
                <option value="Helicopter">Helicopter</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Preferred Model</label>
              <input
                type="text"
                placeholder="Search by model (e.g., G650, Citation)"
                value={filterPreferredModel}
                onChange={(e) => setFilterPreferredModel(e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              />
            </div>
            {hasActiveFilters && (
              <div className="flex items-end min-w-[120px]">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.error,
                    border: `1px solid ${colors.error}`
                  }}
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-sm" style={{ color: colors.textSecondary }}>
        Showing {sortedLeads.length} of {leads.length} leads
      </div>

      {/* Empty States */}
      {leads.length === 0 ? (
        <div className="rounded-lg shadow-lg" style={{ backgroundColor: colors.cardBg }}>
          <NoLeadsEmpty onAddLead={() => openModal('lead')} />
        </div>
      ) : sortedLeads.length === 0 ? (
        <div className="rounded-lg shadow-lg" style={{ backgroundColor: colors.cardBg }}>
          <NoFilteredLeadsEmpty onClearFilters={clearFilters} />
        </div>
      ) : viewMode === 'list' ? (
        <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: colors.cardBg }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: colors.secondary, borderBottom: `2px solid ${colors.border}` }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Lead</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Aircraft Type</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Preferred Model</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Budget</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Year Pref.</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Created</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Status</th>
                  <th className="text-right px-4 py-3 font-semibold" style={{ color: colors.primary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeads.map(lead => (
                  <tr
                    key={lead.id}
                    className="hover:opacity-80 cursor-pointer"
                    style={{ borderBottom: `1px solid ${colors.border}` }}
                    onClick={() => handleActionWithFullLeadData(lead.id, (updatedLead) => openModal('leadDetail', updatedLead))}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold" style={{ color: colors.primary }}>
                          {formatLeadDisplayName(lead)}
                        </p>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          {lead.company}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                      {lead.aircraftType || 'Not specified'}
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                      {lead.preferredModel || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium" style={{ color: colors.textPrimary }}>
                        {lead.budgetKnown && lead.budget ? `$${(lead.budget / 1000000).toFixed(1)}M` : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                      {lead.yearPreference?.oldest && lead.yearPreference?.newest
                        ? `${lead.yearPreference.oldest}-${lead.yearPreference.newest}`
                        : lead.yearPreference?.oldest
                        ? `${lead.yearPreference.oldest}+`
                        : lead.yearPreference?.newest
                        ? `-${lead.yearPreference.newest}`
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: getLeadStatusColors(lead.status, theme).bg,
                          color: getLeadStatusColors(lead.status, theme).text
                        }}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleActionWithFullLeadData(lead.id, (updatedLead) => openModal('lead', updatedLead))}
                          className="p-2 rounded hover:opacity-70"
                          style={{ color: colors.textPrimary }}
                          title="Edit"
                          disabled={leadsLoading.has(lead.id)}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(lead);
                          }}
                          className="p-2 rounded hover:opacity-70"
                          style={{ color: colors.error }}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {sortedLeads.map(lead => (
            <LeadSummaryCard
              key={lead.id}
              lead={lead}
              colors={colors}
              theme={theme}
              onViewDetails={() => handleActionWithFullLeadData(lead.id, (updatedLead) => openModal('leadDetail', updatedLead))}
              onEdit={() => handleActionWithFullLeadData(lead.id, (updatedLead) => openModal('lead', updatedLead))}
              onDelete={() => handleDeleteClick(lead)}
              isLoading={leadsLoading.has(lead.id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteConfirm.leadName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonStyle="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

const LeadSummaryCard = ({ lead, colors, theme, onViewDetails, onEdit, onDelete, isLoading }) => {
  const statusColors = getLeadStatusColors(lead.status, theme);

  return (
    <div className="rounded-lg shadow-lg overflow-hidden relative" style={{ backgroundColor: colors.cardBg }}>
      {/* Header with gradient background */}
      <div
        className="relative w-full h-32 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${statusColors.bg}dd, ${statusColors.bg}99)`
        }}
      >
        {/* Status Badge */}
        <div className="absolute top-4 right-4 px-4 py-2 rounded-lg font-bold text-sm" style={{
          backgroundColor: statusColors.bg,
          color: statusColors.text,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {lead.status}
        </div>

        {/* Lead Name and Company */}
        <div className="absolute bottom-0 left-0 right-0 py-6 px-28">
          <h3 className="text-2xl font-bold text-white drop-shadow-md">
            {formatLeadDisplayName(lead)}
          </h3>
          <p className="text-white text-sm opacity-90">{lead.company}</p>
        </div>

        {/* Edit and Delete Buttons */}
        <div className="absolute top-3 left-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2.5 rounded-full hover:opacity-80 min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ backgroundColor: colors.cardBg, opacity: 0.95 }}
            title="Edit"
            disabled={isLoading}
          >
            <Edit2 size={18} style={{ color: colors.primary }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2.5 rounded-full hover:opacity-80 min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ backgroundColor: colors.cardBg, opacity: 0.95 }}
            title="Delete"
          >
            <Trash2 size={18} style={{ color: colors.error }} />
          </button>
        </div>
      </div>

      {/* Info Boxes - Aircraft Type, Preferred Model, Budget, Year Preference */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Aircraft Type */}
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.secondary }}>
            <div className="text-xs mb-2" style={{ color: colors.textSecondary }}>Aircraft Type</div>
            <div className="text-sm font-bold" style={{ color: colors.textPrimary }}>
              {lead.aircraftType || 'Not specified'}
            </div>
          </div>

          {/* Preferred Model */}
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.secondary }}>
            <div className="text-xs mb-2" style={{ color: colors.textSecondary }}>Preferred Model</div>
            <div className="text-sm font-bold" style={{ color: colors.textPrimary }}>
              {lead.preferredModel || 'Not specified'}
            </div>
          </div>

          {/* Budget */}
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.secondary }}>
            <div className="text-xs mb-2" style={{ color: colors.textSecondary }}>Budget</div>
            <div className="text-sm font-bold" style={{ color: colors.textPrimary }}>
              {lead.budgetKnown && lead.budget ? `$${(lead.budget / 1000000).toFixed(1)}M` : 'Unknown'}
            </div>
          </div>

          {/* Year Preference */}
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.secondary }}>
            <div className="text-xs mb-2" style={{ color: colors.textSecondary }}>Year Pref.</div>
            <div className="text-sm font-bold" style={{ color: colors.textPrimary }}>
              {lead.yearPreference?.oldest && lead.yearPreference?.newest
                ? `${lead.yearPreference.oldest}-${lead.yearPreference.newest}`
                : lead.yearPreference?.oldest
                ? `${lead.yearPreference.oldest}+`
                : lead.yearPreference?.newest
                ? `-${lead.yearPreference.newest}`
                : 'N/A'}
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: colors.primary, color: colors.secondary }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Loading...
            </>
          ) : (
            <>
              View Details →
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const NotesSection = ({ notes, onAddNote }) => {
  const [noteText, setNoteText] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const { colors } = useTheme();

  const handleAddNote = () => {
    if (noteText.trim()) {
      onAddNote(noteText.trim());
      setNoteText('');
    }
  };

  return (
    <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
      <button
        onClick={() => setShowNotes(!showNotes)}
        className="flex items-center gap-2 font-semibold mb-2"
        style={{ color: colors.primary }}
      >
        <MessageSquare size={18} />
        Notes ({notes.length})
        <span className="text-xs" style={{ color: colors.textSecondary }}>{showNotes ? '▼' : '▶'}</span>
      </button>

      {showNotes && (
        <div className="space-y-3">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notes.length === 0 ? (
              <p className="text-sm italic" style={{ color: colors.textSecondary }}>No notes yet</p>
            ) : (
              notes.slice().reverse().map((note) => (
                <div key={note.id} className="text-sm p-3 rounded" style={{ backgroundColor: colors.secondary }}>
                  <p style={{ color: colors.textPrimary }}>{note.text}</p>
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                    {new Date(note.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
              placeholder="Add a note..."
              className="flex-1 px-3 py-2 text-sm rounded-lg"
              style={{
                backgroundColor: colors.secondary,
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`
              }}
            />
            <button
              onClick={handleAddNote}
              className="px-4 py-2 rounded-lg font-semibold"
              style={{ backgroundColor: colors.primary, color: colors.secondary }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsView;