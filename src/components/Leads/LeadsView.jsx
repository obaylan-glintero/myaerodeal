import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, MessageSquare, Send, ArrowUpDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';

const LeadsView = ({ openModal }) => {
  const { leads, aircraft, deleteLead, addNoteToLead } = useStore();
  const { colors } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAircraftType, setFilterAircraftType] = useState('all');
  const [sortBy, setSortBy] = useState('dateNewest');

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesAircraftType = filterAircraftType === 'all' || lead.aircraftType === filterAircraftType;
    return matchesSearch && matchesStatus && matchesAircraftType;
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
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Leads</h2>
        <button
          onClick={() => openModal('lead')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
          style={{ backgroundColor: colors.primary, color: colors.secondary }}
        >
          <Plus size={20} /> Add Lead
        </button>
      </div>

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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg"
          style={{
            backgroundColor: colors.cardBg,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`
          }}
        >
          <option value="all">All Status</option>
          <option value="Inquiry">Inquiry</option>
          <option value="Presented">Presented</option>
          <option value="Interested">Interested</option>
          <option value="Deal Created">Deal Created</option>
          <option value="Lost">Lost</option>
        </select>
        <select
          value={filterAircraftType}
          onChange={(e) => setFilterAircraftType(e.target.value)}
          className="px-4 py-2 rounded-lg"
          style={{
            backgroundColor: colors.cardBg,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`
          }}
        >
          <option value="all">All Aircraft Types</option>
          <option value="Light Jet">Light Jet</option>
          <option value="Midsize Jet">Midsize Jet</option>
          <option value="Super-Mid Jet">Super-Mid Jet</option>
          <option value="Heavy Jet">Heavy Jet</option>
          <option value="Ultra-Long Range">Ultra-Long Range</option>
        </select>
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
        </select>
      </div>

      <div className="text-sm" style={{ color: colors.textSecondary }}>
        Showing {sortedLeads.length} of {leads.length} leads
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedLeads.map(lead => (
          <div key={lead.id} className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold" style={{ color: colors.primary }}>{lead.name}</h3>
                <p style={{ color: colors.textSecondary }}>{lead.company}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal('lead', lead)}
                  className="p-2 rounded"
                  style={{ color: colors.textPrimary }}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteLead(lead.id)}
                  className="p-2 rounded"
                  style={{ color: colors.error }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Aircraft Type:</span>
                <span className="font-medium" style={{ color: colors.textPrimary }}>{lead.aircraftType || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Budget:</span>
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  {lead.budgetKnown && lead.budget ? `$${(lead.budget / 1000000).toFixed(1)}M` : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Year Preference:</span>
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  {lead.yearPreference?.oldest && lead.yearPreference?.newest
                    ? `${lead.yearPreference.oldest} - ${lead.yearPreference.newest}`
                    : 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold`}
                  style={{
                    backgroundColor:
                      lead.status === 'Inquiry' ? '#5BC0DE' :
                      lead.status === 'Presented' ? '#7C3AED' :
                      lead.status === 'Interested' ? '#F0AD4E' :
                      lead.status === 'Deal Created' ? '#D9534F' :
                      lead.status === 'Lost' ? '#6B7280' : '#5BC0DE',
                    color: '#FFFFFF'
                  }}>
                  {lead.status}
                </span>
              </div>
            </div>

            {lead.presentations.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                <h4 className="font-semibold mb-2" style={{ color: colors.primary }}>
                  Presentations ({lead.presentations.length})
                </h4>
                <div className="space-y-2">
                  {lead.presentations.map((pres, idx) => {
                    const ac = aircraft.find(a => a.id === pres.aircraftId);
                    return (
                      <div key={idx} className="text-sm p-3 rounded" style={{ backgroundColor: colors.secondary }}>
                        <p className="font-medium">
                          <button
                            onClick={() => openModal('aircraft', ac)}
                            className="hover:underline cursor-pointer text-left"
                            style={{ color: colors.primary }}
                          >
                            {ac?.manufacturer} {ac?.model}
                          </button>
                          {ac?.serialNumber && (
                            <span className="font-normal" style={{ color: colors.textSecondary }}> (S/N: {ac.serialNumber})</span>
                          )}
                        </p>
                        <p style={{ color: colors.textSecondary }}>Price: ${(pres.priceGiven / 1000000).toFixed(1)}M</p>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>{new Date(pres.date).toLocaleDateString()}</p>
                        {pres.notes && (
                          <p className="text-xs mt-2 italic" style={{ color: colors.textSecondary }}>
                            Note: {pres.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <NotesSection
              notes={lead.timestampedNotes || []}
              onAddNote={(noteText) => addNoteToLead(lead.id, noteText)}
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => openModal('presentation', lead)}
                className="flex-1 px-4 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: colors.primary, color: colors.secondary }}
              >
                Present Aircraft
              </button>
              <button
                onClick={() => openModal('dealFromLead', lead)}
                className="flex-1 px-4 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: colors.secondary, color: colors.primary, border: `1px solid ${colors.primary}` }}
              >
                Create Deal
              </button>
            </div>
          </div>
        ))}
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