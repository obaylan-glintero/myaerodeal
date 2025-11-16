import React, { useState } from 'react';
import { Plus, Edit2, Trash2, MessageSquare, Send, FileText, Download, Search, FileBarChart } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import logo from '../../assets/MyAeroDeal_dark.png';

const AircraftView = ({ openModal }) => {
  const { aircraft, leads, deleteAircraft, addNoteToAircraft, currentUserProfile } = useStore();
  const { colors } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('For Sale');
  const [sortBy, setSortBy] = useState('dateNewest');

  // Helper function to get status colors
  const getStatusColors = (status) => {
    switch (status) {
      case 'For Sale':
        return { bg: colors.statusForSale, text: colors.statusForSaleText };
      case 'Under Contract':
        return { bg: colors.statusUnderContract, text: colors.statusUnderContractText };
      case 'Not for Sale':
        return { bg: colors.statusNotForSale, text: colors.statusNotForSaleText };
      default:
        return { bg: colors.statusForSale, text: colors.statusForSaleText };
    }
  };

  // Debug: Check aircraft data
  React.useEffect(() => {
    console.log('🛩️ Aircraft data:', aircraft);
    if (aircraft.length > 0) {
      console.log('🛩️ First aircraft summary:', aircraft[0].summary);
      console.log('🛩️ First aircraft full data:', aircraft[0]);
    }
  }, [aircraft]);

  const handleViewSpec = (ac) => {
    if (ac.specSheetData) {
      if (ac.specSheetType && ac.specSheetType.includes('pdf')) {
        try {
          // Convert data URL to Blob for better browser compatibility
          const base64Data = ac.specSheetData.split(',')[1];
          const binaryData = atob(base64Data);
          const bytes = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);

          // Detect mobile devices
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

          if (isMobile) {
            // Mobile: Open blob URL directly (triggers native viewer)
            window.open(blobUrl, '_blank');
          } else {
            // Desktop: Create viewer window with iframe
            const newWindow = window.open('', '_blank');
            if (newWindow) {
              newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>${ac.specSheet || 'Document'}</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    html, body { width: 100%; height: 100%; overflow: hidden; }
                    .container { width: 100%; height: 100%; display: flex; flex-direction: column; }
                    .toolbar {
                      background: #0A1628;
                      color: white;
                      padding: 12px 20px;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                      z-index: 10;
                    }
                    .toolbar h3 { font-size: 14px; font-weight: 500; }
                    .toolbar button {
                      color: #D4AF37;
                      background: transparent;
                      text-decoration: none;
                      font-size: 13px;
                      padding: 6px 12px;
                      border: 1px solid #D4AF37;
                      border-radius: 4px;
                      cursor: pointer;
                      transition: all 0.2s;
                    }
                    .toolbar button:hover {
                      background: #D4AF37;
                      color: #0A1628;
                    }
                    iframe {
                      flex: 1;
                      width: 100%;
                      height: 100%;
                      border: none;
                      background: #525252;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="toolbar">
                      <h3>${ac.specSheet || 'Document'}</h3>
                      <button onclick="window.open('${blobUrl}', '_blank')">Download PDF</button>
                    </div>
                    <iframe src="${blobUrl}"></iframe>
                  </div>
                </body>
                </html>
              `);
              newWindow.document.close();
            }
          }
        } catch (error) {
          console.error('Error viewing PDF:', error);
          alert('Error opening PDF. Please try downloading it instead.');
        }
      } else {
        // For other file types, trigger download
        const link = document.createElement('a');
        link.href = ac.specSheetData;
        link.download = ac.specSheet;
        link.click();
      }
    }
  };

  const generateMarketingReport = (ac) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let y = margin;

    // Helper function to add text with word wrapping
    const addText = (text, x, fontSize = 10, maxWidth = pageWidth - 2 * margin) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach(line => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, x, y);
        y += fontSize * 0.5;
      });
    };

    // Header
    doc.setFillColor(26, 43, 69); // colors.primary
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Add logo to header (left side)
    try {
      const img = new Image();
      img.src = logo;
      doc.addImage(img, 'PNG', margin, 10, 30, 20);
    } catch (e) {
      console.error('Error adding logo to PDF:', e);
    }

    doc.setTextColor(212, 175, 55); // colors.secondary
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Marketing Report', margin + 35, 25);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('MyAeroDeal', pageWidth - margin - 30, 25);

    // Reset text color
    doc.setTextColor(0, 0, 0);
    y = 50;

    // Aircraft Details Section
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Aircraft Information', margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const aircraftInfo = [
      `Manufacturer: ${ac.manufacturer || 'N/A'}`,
      `Model: ${ac.model || 'N/A'}`,
      `Year of Manufacture: ${ac.yom || 'N/A'}`,
      `Serial Number: ${ac.serialNumber || 'N/A'}`,
      `Registration: ${ac.registration || 'N/A'}`,
      `Category: ${ac.category || 'N/A'}`,
      `Location: ${ac.location || 'N/A'}`,
      `Price: $${ac.price ? (ac.price / 1000000).toFixed(2) + 'M' : 'N/A'}`,
      `Total Time: ${ac.totalTime ? ac.totalTime + ' hours' : 'N/A'}`
    ];

    aircraftInfo.forEach(info => {
      addText(info, margin, 10);
      y += 2;
    });

    // Summary Section
    if (ac.summary) {
      y += 10;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Description', margin, y);
      y += 8;
      doc.setFont(undefined, 'normal');
      addText(ac.summary, margin, 10);
      y += 5;
    }

    // Marketing Activity Section
    y += 10;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Marketing Activity', margin, y);
    y += 10;

    if (ac.presentations && ac.presentations.length > 0) {
      doc.setFontSize(12);
      doc.text(`Total Presentations: ${ac.presentations.length}`, margin, y);
      y += 10;

      // Presentations Details
      ac.presentations.forEach((pres, idx) => {
        const lead = leads.find(l => l.id === pres.leadId);

        if (y > pageHeight - 60) {
          doc.addPage();
          y = margin;
        }

        // Presentation number
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Presentation #${idx + 1}`, margin, y);
        y += 8;

        // Presentation details
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        const presDetails = [
          `Lead: ${lead?.name || 'Unknown'} (${lead?.company || 'N/A'})`,
          `Date: ${new Date(pres.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
          `Price Given: $${pres.priceGiven ? (pres.priceGiven / 1000000).toFixed(2) + 'M' : 'N/A'}`,
          `Lead Status: ${lead?.status || 'Unknown'}`
        ];

        presDetails.forEach(detail => {
          addText(detail, margin + 5, 10);
          y += 2;
        });

        // Notes
        if (pres.notes && pres.notes.trim()) {
          y += 3;
          doc.setFont(undefined, 'bold');
          addText('Notes:', margin + 5, 10);
          y += 2;
          doc.setFont(undefined, 'italic');
          addText(pres.notes, margin + 5, 9);
          y += 2;
          doc.setFont(undefined, 'normal');
        }

        // Separator line
        y += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      });
    } else {
      doc.setFontSize(10);
      doc.setFont(undefined, 'italic');
      doc.text('No presentations recorded yet.', margin, y);
      y += 10;
    }

    // Footer
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const userName = currentUserProfile?.first_name && currentUserProfile?.last_name
      ? `${currentUserProfile.first_name} ${currentUserProfile.last_name}`
      : 'User';
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Report Generated: ${currentDate}`, margin, pageHeight - 10);
    doc.text(`Exported by: ${userName}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('MyAeroDeal CRM', pageWidth - margin - 30, pageHeight - 10);

    // Save the PDF
    const fileName = `Marketing_Report_${ac.manufacturer}_${ac.model}_${ac.serialNumber || ac.registration || 'Aircraft'}.pdf`;
    doc.save(fileName);
  };

  // Filter aircraft
  const filteredAircraft = aircraft.filter(ac => {
    const matchesSearch = ac.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ac.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ac.registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ac.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ac.category === filterCategory;
    const matchesLocation = filterLocation === 'all' || ac.location?.includes(filterLocation);
    const matchesStatus = filterStatus === 'all' || (ac.status || 'For Sale') === filterStatus;
    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  // Sort aircraft
  const sortedAircraft = [...filteredAircraft].sort((a, b) => {
    switch (sortBy) {
      case 'manufacturerAsc':
        return (a.manufacturer || '').localeCompare(b.manufacturer || '');
      case 'manufacturerDesc':
        return (b.manufacturer || '').localeCompare(a.manufacturer || '');
      case 'modelAsc':
        return (a.model || '').localeCompare(b.model || '');
      case 'modelDesc':
        return (b.model || '').localeCompare(a.model || '');
      case 'priceHigh':
        return (b.price || 0) - (a.price || 0);
      case 'priceLow':
        return (a.price || 0) - (b.price || 0);
      case 'yearNew':
        return (b.yom || 0) - (a.yom || 0);
      case 'yearOld':
        return (a.yom || 0) - (b.yom || 0);
      case 'dateNewest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'dateOldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      default:
        return 0;
    }
  });

  // Get unique locations for filter
  const locations = [...new Set(aircraft.map(ac => ac.location).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Aircraft Inventory</h2>
        <button
          onClick={() => openModal('aircraft')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
          style={{ backgroundColor: colors.primary, color: colors.secondary }}
        >
          <Plus size={20} /> Add Aircraft
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
          <input
            type="text"
            placeholder="Search by manufacturer, model, registration..."
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
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 rounded-lg"
          style={{
            backgroundColor: colors.cardBg,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`
          }}
        >
          <option value="all">All Categories</option>
          <option value="Light Jet">Light Jet</option>
          <option value="Midsize Jet">Midsize Jet</option>
          <option value="Heavy Jet">Heavy Jet</option>
          <option value="Ultra-Long Range">Ultra-Long Range</option>
        </select>
        {locations.length > 0 && (
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: colors.cardBg,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`
            }}
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        )}
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
          <option value="For Sale">For Sale</option>
          <option value="Not for Sale">Not for Sale</option>
          <option value="Under Contract">Under Contract</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg"
          style={{
            backgroundColor: colors.cardBg,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`
          }}
        >
          <option value="dateNewest">Date: Newest First</option>
          <option value="dateOldest">Date: Oldest First</option>
          <option value="manufacturerAsc">Manufacturer: A to Z</option>
          <option value="manufacturerDesc">Manufacturer: Z to A</option>
          <option value="modelAsc">Model: A to Z</option>
          <option value="modelDesc">Model: Z to A</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="yearNew">Year: Newest First</option>
          <option value="yearOld">Year: Oldest First</option>
        </select>
      </div>

      <div className="text-sm" style={{ color: colors.textSecondary }}>
        Showing {sortedAircraft.length} of {aircraft.length} aircraft
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedAircraft.map(ac => (
          <div key={ac.id} className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: colors.cardBg }}>
            {ac.imageData && (
              <div className="w-full h-48 overflow-hidden" style={{ backgroundColor: colors.secondary }}>
                <img
                  src={ac.imageData}
                  alt={`${ac.manufacturer} ${ac.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: colors.primary }}>
                    {ac.manufacturer} {ac.model}
                  </h3>
                  <p style={{ color: colors.textSecondary }}>{ac.yom}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('aircraft', ac)}
                    className="p-2 rounded"
                    style={{ color: colors.textPrimary }}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteAircraft(ac.id)}
                    className="p-2 rounded"
                    style={{ color: colors.error }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {ac.summary && (
                <div className="mb-4 pb-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <p className="text-sm italic leading-relaxed" style={{ color: colors.textSecondary }}>
                    {ac.summary}
                  </p>
                </div>
              )}
{ac.seller && ( <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: colors.textSecondary }}>Seller:</span>
                    <span className="font-medium" style={{ color: colors.textPrimary }}>{ac.seller}</span>
                  </div>
                )}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: colors.textSecondary }}>Category:</span>
                  <span className="font-medium" style={{ color: colors.textPrimary }}>{ac.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: colors.textSecondary }}>Serial Number:</span>
                  <span className="font-medium" style={{ color: colors.textPrimary }}>{ac.serialNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: colors.textSecondary }}>Registration:</span>
                  <span className="font-medium" style={{ color: colors.textPrimary }}>{ac.registration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: colors.textSecondary }}>Location:</span>
                  <span className="font-medium" style={{ color: colors.textPrimary }}>{ac.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: colors.textSecondary }}>Access Type:</span>
                  <span className="font-medium" style={{ color: colors.textPrimary }}>{ac.accessType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: colors.textSecondary }}>Status:</span>
                  <span
                    className="font-semibold px-3 py-1 rounded text-sm"
                    style={{
                      backgroundColor: getStatusColors(ac.status || 'For Sale').bg,
                      color: getStatusColors(ac.status || 'For Sale').text
                    }}
                  >
                    {ac.status || 'For Sale'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <span style={{ color: colors.primary }}>Price:</span>
                  <span style={{ color: colors.primary }}>${(ac.price / 1000000).toFixed(1)}M</span>
                </div>
              </div>

              {ac.specSheet && ac.specSheetData && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={18} style={{ color: colors.primary }} />
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>{ac.specSheet}</span>
                    </div>
                    <button
                      onClick={() => handleViewSpec(ac)}
                      className="flex items-center gap-1 px-3 py-1 text-sm rounded font-semibold hover:opacity-90"
                      style={{ backgroundColor: colors.primary, color: colors.secondary }}
                    >
                      <Download size={14} />
                      View
                    </button>
                  </div>
                </div>
              )}

              {ac.presentations.length > 0 && (
                <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <h4 className="font-semibold mb-2" style={{ color: colors.primary }}>
                    Presented to ({ac.presentations.length})
                  </h4>
                  <div className="space-y-2">
                    {ac.presentations.map((pres, idx) => {
                      const lead = leads.find(l => l.id === pres.leadId);
                      return (
                        <div key={idx} className="text-sm p-3 rounded" style={{ backgroundColor: colors.secondary }}>
                          <button
                            onClick={() => openModal('lead', lead)}
                            className="font-medium hover:underline cursor-pointer text-left"
                            style={{ color: colors.primary }}
                          >
                            {lead?.name}
                          </button>
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
                notes={ac.timestampedNotes || []}
                onAddNote={(noteText) => addNoteToAircraft(ac.id, noteText)}
              />

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => openModal('presentationFromAircraft', ac)}
                  className="w-full px-4 py-2 rounded-lg font-semibold"
                  style={{ backgroundColor: colors.primary, color: colors.secondary }}
                >
                  Present to Lead
                </button>

                {ac.presentations && ac.presentations.length > 0 && (
                  <button
                    onClick={() => generateMarketingReport(ac)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold hover:opacity-90"
                    style={{
                      backgroundColor: colors.secondary,
                      color: colors.primary,
                      border: `2px solid ${colors.primary}`
                    }}
                  >
                    <FileBarChart size={18} />
                    Generate Marketing Report
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotesSection = ({ notes, onAddNote }) => {
  const { colors } = useTheme();
  const [noteText, setNoteText] = useState('');
  const [showNotes, setShowNotes] = useState(false);

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

export default AircraftView;
