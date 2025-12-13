import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, MessageSquare, Send, FileText, Download, Search, ListChecks, CheckCircle2, ListTodo, BarChart3, LayoutGrid, List, Loader2, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../assets/MyAeroDeal_dark.png';
import ConfirmDialog from '../Common/ConfirmDialog';

// Helper to get deal status colors
const getDealStatusColors = (status) => {
  switch (status) {
    case 'LOI Signed':
      return { bg: '#5BC0DE', text: '#FFFFFF' };
    case 'Deposit Paid':
      return { bg: '#7C3AED', text: '#FFFFFF' };
    case 'APA Drafted':
      return { bg: '#3B82F6', text: '#FFFFFF' };
    case 'APA Signed':
      return { bg: '#10B981', text: '#FFFFFF' };
    case 'PPI Started':
      return { bg: '#F59E0B', text: '#FFFFFF' };
    case 'Defect Rectifications':
      return { bg: '#EF4444', text: '#FFFFFF' };
    case 'Closing':
      return { bg: '#8B5CF6', text: '#FFFFFF' };
    case 'Closed Won':
      return { bg: '#059669', text: '#FFFFFF' };
    case 'Closed Lost':
      return { bg: '#6B7280', text: '#FFFFFF' };
    default:
      return { bg: '#5BC0DE', text: '#FFFFFF' };
  }
};

const DealsView = ({ openModal }) => {
  const { deals, leads, aircraft, tasks, updateDeal, updateDealStatus, deleteDeal, addNoteToDeal, generateActionItemsFromDocument, updateTask, addTask, currentUserProfile, loadFullDealData, dealsLoading } = useStore();
  const { colors } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [showDocTypeModal, setShowDocTypeModal] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [showFilters, setShowFilters] = useState(false);
  const [showTimeline, setShowTimeline] = useState({});
  const [editingTimelineItem, setEditingTimelineItem] = useState(null); // { dealId, itemIndex }
  const [editingTimelineDueDate, setEditingTimelineDueDate] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, dealId: null, dealName: '' });

  // Helper to ensure full deal data is loaded before action
  const handleActionWithFullDealData = async (dealId, action) => {
    await loadFullDealData(dealId);
    // Get the updated deal directly from the store (not from the stale closure)
    const updatedDeal = useStore.getState().deals.find(d => d.id === dealId);
    if (updatedDeal) {
      action(updatedDeal);
    }
  };

  // Delete confirmation handlers
  const handleDeleteClick = (deal) => {
    const dealName = deal.clientName || deal.dealName || 'this deal';
    setDeleteConfirm({
      isOpen: true,
      dealId: deal.id,
      dealName: dealName
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.dealId) {
      deleteDeal(deleteConfirm.dealId);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, dealId: null, dealName: '' });
  };

  const handleViewDocument = (deal) => {
    if (deal.documentData) {
      if (deal.documentType && deal.documentType.includes('pdf')) {
        try {
          // Convert data URL to Blob for better browser compatibility
          const base64Data = deal.documentData.split(',')[1];
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
                  <title>${deal.document || 'Document'}</title>
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
                      <h3>${deal.document || 'Document'}</h3>
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
        link.href = deal.documentData;
        link.download = deal.document;
        link.click();
      }
    }
  };

  const handleGenerateActionItems = async (dealId, docType) => {
    try {
      setShowDocTypeModal(false);
      setSelectedDealId(null);

      // Show loading indicator
      const loadingAlert = alert('Parsing document and extracting action items with AI...\n\nPlease wait...You can close this alert window...');

      const count = await generateActionItemsFromDocument(dealId, docType);

      alert(`✓ Successfully generated ${count} action items from your ${docType} document!\n\n• Action items extracted from actual document content\n• Tasks created with AI-detected dates and priorities\n• Timeline added to deal card\n\nCheck the Tasks page to see all generated action items.`);
    } catch (error) {
      alert(`Error generating action items: ${error.message}\n\nPlease ensure:\n1. A document is uploaded to this deal\n2. The document is a PDF file\n3. Try again or contact support`);
    }
  };

  const handleEditTimelineDueDate = (dealId, itemIndex, currentDueDate) => {
    setEditingTimelineItem({ dealId, itemIndex });
    setEditingTimelineDueDate(currentDueDate || '');
  };

  const handleSaveTimelineDueDate = async (dealId, itemIndex) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal || !deal.timeline) return;

    const updatedTimeline = [...deal.timeline];
    updatedTimeline[itemIndex] = {
      ...updatedTimeline[itemIndex],
      dueDate: editingTimelineDueDate
    };

    await updateDeal(dealId, { timeline: updatedTimeline });
    setEditingTimelineItem(null);
    setEditingTimelineDueDate('');
  };

  const handleCancelTimelineEdit = () => {
    setEditingTimelineItem(null);
    setEditingTimelineDueDate('');
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.dealName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all'
      ? true
      : filterStatus === 'active'
        ? deal.status !== 'Closed Won' && deal.status !== 'Closed Lost'
        : deal.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Deals</h2>
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
            onClick={() => openModal('deal')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: colors.primary, color: colors.secondary }}
          >
            <Plus size={20} /> Add Deal
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
            <input
              type="text"
              placeholder="Search by deal name or client..."
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
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 rounded-lg" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Stage</label>
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
                <option value="active">Active Deals</option>
                <option value="all">All Stages</option>
                <option value="LOI Signed">LOI Signed</option>
                <option value="Deposit Paid">Deposit Paid</option>
                <option value="APA Drafted">APA Drafted</option>
                <option value="APA Signed">APA Signed</option>
                <option value="PPI Started">PPI Started</option>
                <option value="Defect Rectifications">Defect Rectifications</option>
                <option value="Closing">Closing</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="text-sm" style={{ color: colors.textSecondary }}>
        Showing {filteredDeals.length} of {deals.length} deals
      </div>

      {viewMode === 'list' ? (
        <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: colors.cardBg }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: colors.secondary, borderBottom: `2px solid ${colors.border}` }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Deal</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Aircraft</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Seller</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>YoM</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Deal Value</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Created</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Est. Closing</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: colors.primary }}>Status</th>
                  <th className="text-right px-4 py-3 font-semibold" style={{ color: colors.primary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map(deal => {
                  const lead = leads.find(l => l.id === deal.relatedLead);
                  const ac = aircraft.find(a => a.id === deal.relatedAircraft);

                  return (
                    <tr
                      key={deal.id}
                      className="hover:opacity-80 cursor-pointer"
                      style={{ borderBottom: `1px solid ${colors.border}` }}
                      onClick={() => handleActionWithFullDealData(deal.id, (updatedDeal) => openModal('dealDetail', updatedDeal))}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold" style={{ color: colors.primary }}>
                            {deal.dealName}
                          </p>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            {deal.clientName}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                        {ac ? `${ac.manufacturer} ${ac.model}` : 'N/A'}
                      </td>
                      <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                        {ac?.seller || 'N/A'}
                      </td>
                      <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                        {ac?.yom || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-lg" style={{ color: colors.primary }}>
                          {deal.dealValue ? `$${(deal.dealValue / 1000000).toFixed(1)}M` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                        {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3" style={{ color: colors.textPrimary }}>
                        {deal.estimatedClosing || 'Not set'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-semibold" style={{
                          backgroundColor: getDealStatusColors(deal.status).bg,
                          color: getDealStatusColors(deal.status).text
                        }}>
                          {deal.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleActionWithFullDealData(deal.id, (updatedDeal) => openModal('deal', updatedDeal))}
                            className="p-2 rounded hover:opacity-70"
                            style={{ color: colors.textPrimary }}
                            title="Edit"
                            disabled={dealsLoading.has(deal.id)}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(deal);
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDeals.map(deal => {
            const ac = aircraft.find(a => a.id === deal.relatedAircraft);

            return (
            <DealSummaryCard
              key={deal.id}
              deal={deal}
              aircraft={ac}
              colors={colors}
              onViewDetails={() => handleActionWithFullDealData(deal.id, (updatedDeal) => openModal('dealDetail', updatedDeal))}
              onEdit={() => handleActionWithFullDealData(deal.id, (updatedDeal) => openModal('deal', updatedDeal))}
              onDelete={() => handleDeleteClick(deal)}
              isLoading={dealsLoading.has(deal.id)}
              getStatusColors={getDealStatusColors}
            />
          );
          })}
        </div>
      )}

      {showDocTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-xl max-w-md w-full p-6" style={{ backgroundColor: colors.cardBg }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>
              Select Document Type
            </h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              Choose the type of document to generate appropriate action items and timeline:
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleGenerateActionItems(selectedDealId, 'LOI')}
                className="w-full p-4 border-2 rounded-lg text-left"
                style={{ borderColor: colors.primary, backgroundColor: colors.secondary }}
              >
                <p className="font-semibold" style={{ color: colors.primary }}>Letter of Intent (LOI)</p>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  9 action items • 15-day timeline • Initial deal phase
                </p>
              </button>
              <button
                onClick={() => handleGenerateActionItems(selectedDealId, 'APA')}
                className="w-full p-4 border-2 rounded-lg text-left"
                style={{ borderColor: colors.primary, backgroundColor: colors.secondary }}
              >
                <p className="font-semibold" style={{ color: colors.primary }}>Aircraft Purchase Agreement (APA)</p>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  12 action items • 31-day timeline • Full transaction process
                </p>
              </button>
            </div>
            <button
              onClick={() => {
                setShowDocTypeModal(false);
                setSelectedDealId(null);
              }}
              className="w-full mt-4 px-4 py-2 rounded-lg"
              style={{ border: `1px solid ${colors.border}`, color: colors.textPrimary }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Deal"
        message={`Are you sure you want to delete the deal with "${deleteConfirm.dealName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonStyle="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

const DealTaskActions = ({ deal, tasks, currentUserProfile }) => {
  const { colors } = useTheme();
  const [showGantt, setShowGantt] = useState(false);

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header with branding
      doc.setFillColor(201, 165, 90); // #C9A55A - Refined Gold
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Add logo to header (left side)
      try {
        const img = new Image();
        img.src = logo;
        doc.addImage(img, 'PNG', 14, 10, 30, 20);
      } catch (e) {
        console.error('Error adding logo to PDF:', e);
      }

      doc.setTextColor(10, 22, 40); // #0A1628 - Deep Navy
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('MyAeroDeal', 50, 20);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Deal Task Checklist', 50, 30);

      // Deal information
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(deal.dealName, 14, 55);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Client: ${deal.clientName}`, 14, 62);
      doc.text(`Status: ${deal.status}`, 14, 68);
      if (deal.dealValue) {
        doc.text(`Deal Value: $${(deal.dealValue / 1000000).toFixed(1)}M`, 14, 74);
      }
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 80);

      // Task summary
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalTasks = tasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Progress: ${completedTasks}/${totalTasks} tasks completed (${progress}%)`, 14, 92);

      // Progress bar
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(14, 95, pageWidth - 28, 6);
      doc.setFillColor(201, 165, 90); // #C9A55A - Refined Gold
      doc.rect(14, 95, (pageWidth - 28) * (progress / 100), 6, 'F');

      // Tasks table - sort by due date (earliest first, tasks without dates last)
      const sortedTasks = [...tasks].sort((a, b) => {
        // Tasks without due dates go to the end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        // Sort by due date (earliest first)
        return new Date(a.dueDate) - new Date(b.dueDate);
      });

      const tableData = sortedTasks.map(task => [
        task.status === 'completed' ? '☑' : '☐',
        task.title,
        task.dueDate || 'N/A',
        task.priority.toUpperCase(),
        task.status === 'completed' ? 'Completed' : 'Pending'
      ]);

      autoTable(doc, {
        startY: 110,
        head: [['', 'Task', 'Due Date', 'Priority', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [201, 165, 90], // #C9A55A - Refined Gold
          textColor: [10, 22, 40],    // #0A1628 - Deep Navy
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          2: { cellWidth: 25 },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' }
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        didDrawCell: (data) => {
          if (data.cell.section === 'body') {
            const task = sortedTasks[data.row.index];
            if (task.status === 'completed') {
              // For checkbox column, use green color
              if (data.column.index === 0) {
                doc.setTextColor(76, 175, 80);
              }
              // For all columns, add strikethrough
              if (data.column.index >= 1) {
                const cellX = data.cell.x;
                const cellY = data.cell.y + data.cell.height / 2;
                const cellWidth = data.cell.width;

                doc.setDrawColor(128, 128, 128);
                doc.setLineWidth(0.3);
                doc.line(cellX + 2, cellY, cellX + cellWidth - 2, cellY);
              }
            }
          }
        }
      });

      // Add Gantt chart if there are tasks with due dates
      const tasksWithDates = tasks.filter(t => t.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      if (tasksWithDates.length > 0) {
        const currentY = (doc.lastAutoTable?.finalY || 110) + 15;

        // Check if we need a new page
        if (currentY > doc.internal.pageSize.getHeight() - 80) {
          doc.addPage();
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Task Timeline (Gantt Chart)', 14, 20);
        } else {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Task Timeline (Gantt Chart)', 14, currentY);
        }

        renderGanttChartToPDF(doc, tasksWithDates, currentY > 200 ? 30 : currentY + 10);
      }

      // Footer
      const userName = currentUserProfile?.first_name && currentUserProfile?.last_name
        ? `${currentUserProfile.first_name} ${currentUserProfile.last_name}`
        : 'User';
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `MyAeroDeal - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
        doc.text(
          `Exported by: ${userName}`,
          pageWidth - 14,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'right' }
        );
      }

      doc.save(`${deal.dealName.replace(/[^a-z0-9]/gi, '_')}_checklist.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error.message}\n\nPlease check the browser console for details.`);
    }
  };

  const renderGanttChartToPDF = (doc, tasks, startY) => {
    const chartX = 14;
    const chartWidth = doc.internal.pageSize.getWidth() - 28;
    const rowHeight = 8;
    const chartHeight = Math.min(tasks.length * rowHeight, 100);

    // Find date range
    const dates = tasks.map(t => new Date(t.dueDate));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const dateRange = maxDate - minDate || 1;

    // Calculate dimensions
    const labelWidth = 60;
    const timelineWidth = chartWidth - labelWidth - 10;

    // Draw tasks
    tasks.forEach((task, index) => {
      const y = startY + index * rowHeight;

      // Task label
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      const taskLabel = task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title;
      doc.text(taskLabel, chartX, y + 5);

      // Timeline bar
      const taskDate = new Date(task.dueDate);
      const position = ((taskDate - minDate) / dateRange) * timelineWidth;
      const barX = chartX + labelWidth + position;

      // Color based on status and priority
      if (task.status === 'completed') {
        doc.setFillColor(76, 175, 80); // Green
      } else if (task.priority === 'high') {
        doc.setFillColor(244, 67, 54); // Red
      } else if (task.priority === 'medium') {
        doc.setFillColor(255, 152, 0); // Orange
      } else {
        doc.setFillColor(33, 150, 243); // Blue
      }

      doc.circle(barX, y + 3, 2, 'F');

      // Date label
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(new Date(task.dueDate).toLocaleDateString(), barX + 4, y + 4);
    });

    // Draw timeline axis
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(chartX + labelWidth, startY - 3, chartX + labelWidth + timelineWidth, startY - 3);

    // Date markers
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(minDate.toLocaleDateString(), chartX + labelWidth, startY - 5);
    doc.text(maxDate.toLocaleDateString(), chartX + labelWidth + timelineWidth - 15, startY - 5);

    // Add Legend
    const legendY = startY + (tasks.length * rowHeight) + 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Legend:', chartX, legendY);

    // Legend items
    const legendItems = [
      { color: [76, 175, 80], label: 'Completed' },
      { color: [244, 67, 54], label: 'High Priority' },
      { color: [255, 152, 0], label: 'Medium Priority' },
      { color: [33, 150, 243], label: 'Low Priority / Pending' }
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    legendItems.forEach((item, index) => {
      const legendItemX = chartX + (index * 45);
      const legendItemY = legendY + 6;

      // Draw colored circle
      doc.setFillColor(...item.color);
      doc.circle(legendItemX, legendItemY, 1.5, 'F');

      // Draw label
      doc.setTextColor(0, 0, 0);
      doc.text(item.label, legendItemX + 4, legendItemY + 1);
    });
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowGantt(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
          style={{ border: `1px solid ${colors.primary}`, color: colors.primary, backgroundColor: colors.secondary }}
        >
          <BarChart3 size={18} />
          View Gantt Chart
        </button>
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
          style={{ backgroundColor: colors.primary, color: colors.secondary }}
        >
          <Download size={18} />
          Export Task Checklist PDF
        </button>
      </div>

      {showGantt && (
        <GanttChartModal
          deal={deal}
          tasks={tasks}
          onClose={() => setShowGantt(false)}
        />
      )}
    </div>
  );
};

const GanttChartModal = ({ deal, tasks, onClose }) => {
  const { colors } = useTheme();
  const tasksWithDates = tasks.filter(t => t.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (tasksWithDates.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-lg shadow-xl max-w-4xl w-full p-6" style={{ backgroundColor: colors.cardBg }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>
            Task Timeline - {deal.dealName}
          </h3>
          <p style={{ color: colors.textSecondary }}>No tasks with due dates to display in Gantt chart.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 rounded-lg"
            style={{ border: `1px solid ${colors.border}`, color: colors.textPrimary }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Calculate date range
  const dates = tasksWithDates.map(t => new Date(t.dueDate));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const dateRange = maxDate - minDate || 1;

  // Generate month labels
  const monthLabels = [];
  const currentDate = new Date(minDate);
  while (currentDate <= maxDate) {
    monthLabels.push({
      date: new Date(currentDate),
      label: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto p-6" style={{ backgroundColor: colors.cardBg }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold" style={{ color: colors.primary }}>
              Task Timeline - {deal.dealName}
            </h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {minDate.toLocaleDateString()} - {maxDate.toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg"
            style={{ border: `1px solid ${colors.border}`, color: colors.textPrimary }}
          >
            Close
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Timeline header */}
            <div className="flex mb-2">
              <div className="w-48 flex-shrink-0"></div>
              <div className="flex-1 flex justify-between px-4" style={{ borderBottom: `2px solid ${colors.border}` }}>
                {monthLabels.map((month, idx) => (
                  <div key={idx} className="text-xs font-semibold pb-2" style={{ color: colors.textSecondary }}>
                    {month.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              {tasksWithDates.map((task) => {
                const taskDate = new Date(task.dueDate);
                const position = ((taskDate - minDate) / dateRange) * 100;

                let barColor = colors.primary;
                if (task.status === 'completed') {
                  barColor = '#4CAF50';
                } else if (task.priority === 'high') {
                  barColor = '#f44336';
                } else if (task.priority === 'medium') {
                  barColor = '#ff9800';
                }

                return (
                  <div key={task.id} className="flex items-center py-2">
                    <div className="w-48 flex-shrink-0 pr-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          readOnly
                          className="w-4 h-4"
                          style={{ accentColor: colors.primary }}
                        />
                        <span className={`text-sm ${task.status === 'completed' ? 'line-through' : ''}`} style={{ color: colors.textPrimary }}>
                          {task.title.length > 30 ? task.title.substring(0, 30) + '...' : task.title}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-1 ml-6">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 relative h-8 rounded" style={{ backgroundColor: colors.secondary }}>
                      <div
                        className="absolute top-0 h-full flex items-center justify-center rounded"
                        style={{
                          left: `${position}%`,
                          width: '8px',
                          backgroundColor: barColor,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <div
                          className="absolute whitespace-nowrap text-xs font-medium px-2 py-1 rounded shadow-sm"
                          style={{
                            backgroundColor: barColor,
                            color: colors.secondary,
                            top: '-100%',
                            left: '50%',
                            transform: 'translateX(-50%)'
                          }}
                        >
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
              <p className="text-sm font-semibold mb-2" style={{ color: colors.textPrimary }}>Legend:</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#4CAF50' }}></div>
                  <span style={{ color: colors.textSecondary }}>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f44336' }}></div>
                  <span style={{ color: colors.textSecondary }}>High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ff9800' }}></div>
                  <span style={{ color: colors.textSecondary }}>Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.primary }}></div>
                  <span style={{ color: colors.textSecondary }}>Low Priority / Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksSection = ({ dealId, dealName, tasks, onToggleComplete, onUpdateTask, onAddTask }) => {
  const { colors } = useTheme();
  const [showTasks, setShowTasks] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingDueDate, setEditingDueDate] = useState('');

  // Sort tasks by due date (earliest first, tasks without dates at the end)
  const sortByDueDate = (a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  };

  const sortedTasks = [...tasks].sort(sortByDueDate);
  const pendingTasks = sortedTasks.filter(t => t.status === 'pending');

  const handleAddTask = () => {
    if (taskTitle.trim()) {
      onAddTask({
        title: taskTitle.trim(),
        description: `Task for ${dealName}`,
        dueDate: taskDueDate || null,
        priority: taskPriority,
        status: 'pending'
      });
      setTaskTitle('');
      setTaskDueDate('');
      setTaskPriority('medium');
    }
  };

  const handleEditDueDate = (taskId, currentDueDate) => {
    setEditingTaskId(taskId);
    setEditingDueDate(currentDueDate || '');
  };

  const handleSaveDueDate = (taskId) => {
    onUpdateTask(taskId, { dueDate: editingDueDate || null });
    setEditingTaskId(null);
    setEditingDueDate('');
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingDueDate('');
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
      <button
        onClick={() => setShowTasks(!showTasks)}
        className="flex items-center gap-2 font-semibold mb-2"
        style={{ color: colors.primary }}
      >
        <ListTodo size={18} />
        Tasks ({sortedTasks.length})
        {pendingTasks.length > 0 && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700 font-bold">
            {pendingTasks.length} pending
          </span>
        )}
        <span className="text-xs" style={{ color: colors.textSecondary }}>{showTasks ? '▼' : '▶'}</span>
      </button>

      {showTasks && (
        <div className="space-y-3">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sortedTasks.length === 0 ? (
              <p className="text-sm italic" style={{ color: colors.textSecondary }}>No tasks yet</p>
            ) : (
              sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded"
                  style={{ backgroundColor: colors.secondary }}
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => onToggleComplete(task.id, task.status)}
                    className="mt-1 w-4 h-4 cursor-pointer"
                    style={{ accentColor: colors.primary }}
                  />
                  <div className="flex-1">
                    <p
                      className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}
                      style={{ color: task.status === 'completed' ? colors.textSecondary : colors.textPrimary }}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {editingTaskId === task.id ? (
                        <>
                          <input
                            type="date"
                            value={editingDueDate}
                            onChange={(e) => setEditingDueDate(e.target.value)}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: colors.cardBg,
                              color: colors.textPrimary,
                              border: `1px solid ${colors.border}`
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveDueDate(task.id)}
                            className="text-xs px-2 py-1 rounded font-semibold"
                            style={{ backgroundColor: colors.primary, color: colors.secondary }}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-xs px-2 py-1 rounded"
                            style={{ border: `1px solid ${colors.border}`, color: colors.textSecondary }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <p
                          className="text-xs cursor-pointer hover:underline"
                          style={{ color: colors.textSecondary }}
                          onClick={() => handleEditDueDate(task.id, task.dueDate)}
                          title="Click to edit due date"
                        >
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date set'} ✏️
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${getPriorityBadgeClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 p-3 rounded" style={{ backgroundColor: colors.secondary }}>
            <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Quick Add Task</p>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Task title..."
              className="w-full px-3 py-2 text-sm rounded-lg"
              style={{
                backgroundColor: colors.cardBg,
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`
              }}
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg"
                style={{
                  backgroundColor: colors.cardBg,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              />
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg"
                style={{
                  backgroundColor: colors.cardBg,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: colors.primary, color: colors.secondary }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DealSummaryCard = ({ deal, aircraft, colors, onViewDetails, onEdit, onDelete, isLoading, getStatusColors }) => {
  return (
    <div className="rounded-lg shadow-lg overflow-hidden relative" style={{ backgroundColor: colors.cardBg }}>
      {/* Header with gradient background */}
      <div
        className="relative w-full h-32 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${getStatusColors(deal.status).bg}dd, ${getStatusColors(deal.status).bg}99)`
        }}
      >
        {/* Status Badge */}
        <div className="absolute top-4 right-4 px-4 py-2 rounded-lg font-bold text-sm" style={{
          backgroundColor: getStatusColors(deal.status).bg,
          color: getStatusColors(deal.status).text,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {deal.status}
        </div>

        {/* Edit and Delete Buttons */}
        <div className="absolute top-16 right-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 rounded-full hover:opacity-80 min-w-[40px] min-h-[40px] flex items-center justify-center"
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
            className="p-2 rounded-full hover:opacity-80 min-w-[40px] min-h-[40px] flex items-center justify-center"
            style={{ backgroundColor: colors.cardBg, opacity: 0.95 }}
            title="Delete"
          >
            <Trash2 size={18} style={{ color: colors.error }} />
          </button>
        </div>

        {/* Deal Name and Client */}
        <div className="absolute bottom-0 left-0 right-0 py-6 px-6 pr-16">
          <h3 className="text-2xl font-bold text-white drop-shadow-md">
            {deal.dealName}
          </h3>
          <p className="text-white text-sm opacity-90">{deal.clientName}</p>
        </div>
      </div>

      {/* Info Boxes - Aircraft, Deal Value, Est. Closing */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Aircraft */}
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.secondary }}>
            <div className="text-xs mb-2" style={{ color: colors.textSecondary }}>Aircraft</div>
            <div className="text-sm font-bold" style={{ color: colors.textPrimary }}>
              {aircraft ? (
                <>
                  <div>{aircraft.model}</div>
                  {aircraft.serialNumber && (
                    <div className="text-xs font-normal mt-1" style={{ color: colors.textSecondary }}>
                      S/N: {aircraft.serialNumber}
                    </div>
                  )}
                </>
              ) : 'Not specified'}
            </div>
          </div>

          {/* Deal Value */}
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.secondary }}>
            <div className="text-xs mb-2" style={{ color: colors.textSecondary }}>Deal Value</div>
            <div className="text-sm font-bold" style={{ color: colors.primary }}>
              {deal.dealValue ? `$${(deal.dealValue / 1000000).toFixed(1)}M` : 'Not set'}
            </div>
          </div>

          {/* Est. Closing */}
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.secondary }}>
            <div className="text-xs mb-2" style={{ color: colors.textSecondary }}>Est. Closing</div>
            <div className="text-sm font-bold" style={{ color: colors.textPrimary }}>
              {deal.estimatedClosing || 'Not set'}
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

export default DealsView;
export { DealTaskActions };