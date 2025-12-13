import React from 'react';
import { Users, FileText, Plane, ListTodo, Check, LayoutDashboard } from 'lucide-react';
import StatCard from '../Common/StatCard';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { formatLeadDisplayName } from '../../utils/leadFormatters';
import { getLeadStatusColors, getStatCardColor } from '../../utils/colors';

const Dashboard = ({ openModal, setActiveTab }) => {
  const { leads, aircraft, deals, tasks, updateTask, loadFullLeadData } = useStore();
  const { colors, theme } = useTheme();
  const toast = useToast();

  const hotLeads = leads.filter(l => l.status === 'Presented').length;
  const activeDeals = deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.status)).length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const totalInventory = aircraft.length;

  // Helper to ensure full lead data is loaded before opening detail view
  const handleActionWithFullLeadData = async (leadId, action) => {
    await loadFullLeadData(leadId);
    const updatedLead = useStore.getState().leads.find(l => l.id === leadId);
    if (updatedLead) {
      action(updatedLead);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users size={32} />}
          title="Hot Leads"
          subtitle="Presented"
          value={hotLeads}
          total={leads.length}
          color={getStatCardColor('leads', theme)}
          onClick={() => setActiveTab('leads')}
        />
        <StatCard
          icon={<FileText size={32} />}
          title="Active Deals"
          value={activeDeals}
          total={deals.length}
          color={getStatCardColor('deals', theme)}
          onClick={() => setActiveTab('deals')}
        />
        <StatCard
          icon={<Plane size={32} />}
          title="Aircraft Inventory"
          value={totalInventory}
          color={getStatCardColor('aircraft', theme)}
          onClick={() => setActiveTab('aircraft')}
        />
        <StatCard
          icon={<ListTodo size={32} />}
          title="Pending Tasks"
          value={pendingTasks}
          total={tasks.length}
          color={getStatCardColor('tasks', theme)}
          onClick={() => setActiveTab('tasks')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>Recent Leads</h3>
          <div className="space-y-3">
            {leads
              .filter(lead => lead.status !== 'Lost')
              .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
              .slice(0, 5)
              .map(lead => (
                <button
                  key={lead.id}
                  onClick={() => handleActionWithFullLeadData(lead.id, (updatedLead) => openModal('leadDetail', updatedLead))}
                  className="w-full flex justify-between items-center p-3 rounded hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ backgroundColor: colors.secondary }}
                >
                  <div className="text-left">
                    <p className="font-medium" style={{ color: colors.textPrimary }}>{formatLeadDisplayName(lead)}</p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>{lead.company}</p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: getLeadStatusColors(lead.status, theme).bg,
                      color: getLeadStatusColors(lead.status, theme).text
                    }}
                  >
                    {lead.status}
                  </span>
                </button>
              ))}
          </div>
        </div>

        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>Upcoming Tasks</h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'pending')
              .sort((a, b) => {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
              })
              .slice(0, 5)
              .map(task => {
              // Get related lead or deal info
              let relatedInfo = null;
              if (task.relatedTo) {
                if (task.relatedTo.type === 'lead') {
                  const lead = leads.find(l => l.id === task.relatedTo.id);
                  if (lead) relatedInfo = { type: 'Lead', name: formatLeadDisplayName(lead) };
                } else if (task.relatedTo.type === 'deal') {
                  const deal = deals.find(d => d.id === task.relatedTo.id);
                  if (deal) relatedInfo = { type: 'Deal', name: deal.dealName };
                }
              }

              return (
                <div key={task.id} className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: colors.secondary }}>
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: colors.textPrimary }}>{task.title}</p>
                    <div className="flex gap-2 items-center flex-wrap">
                      <p className="text-sm" style={{ color: colors.textSecondary }}>{task.dueDate}</p>
                      {relatedInfo && (
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan-100 text-cyan-700">
                          {relatedInfo.type}: {relatedInfo.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await updateTask(task.id, { status: 'completed' });
                        toast.success('Task marked as completed');
                      } catch (error) {
                        console.error('Failed to update task:', error);
                        toast.error('Failed to update task. Please try again.');
                      }
                    }}
                    className="ml-2 p-1 rounded"
                    style={{ color: colors.primary }}
                  >
                    <Check size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-lg shadow-lg p-4 md:p-6" style={{ backgroundColor: colors.cardBg }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>Deal Pipeline</h3>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 min-w-max md:min-w-0">
            {['LOI Signed', 'Deposit Paid', 'APA Drafted', 'APA Signed', 'PPI Started', 'Defect Rectifications', 'Closing', 'Closed Won', 'Closed Lost'].map(status => {
              const count = deals.filter(d => d.status === status).length;
              return (
                <div key={status} className="text-center p-4 rounded min-w-[100px] md:min-w-0" style={{ backgroundColor: colors.secondary }}>
                  <p className="text-2xl font-bold" style={{ color: colors.primary }}>{count}</p>
                  <p className="text-xs mt-1 font-medium whitespace-nowrap" style={{ color: colors.textPrimary }}>{status}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;