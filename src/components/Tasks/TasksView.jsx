import React, { useState } from 'react';
import { Plus, Calendar, Trash2, Check, Edit2, Download, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../Common/ConfirmDialog';
import { NoTasksEmpty } from '../Common/EmptyState';
import { formatLeadDisplayName } from '../../utils/leadFormatters';
import { getTaskPriorityColors } from '../../utils/colors';

const TasksView = ({ openModal, setActiveTab }) => {
  const { tasks, updateTask, deleteTask, leads, deals } = useStore();
  const { colors, theme } = useTheme();
  const toast = useToast();
  const [calendarView, setCalendarView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, taskId: null, taskTitle: '' });

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const pendingTasks = sortedTasks.filter(t => t.status === 'pending');
  const completedTasks = sortedTasks.filter(t => t.status === 'completed');

  // Delete confirmation handlers
  const handleDeleteClick = (task) => {
    setDeleteConfirm({
      isOpen: true,
      taskId: task.id,
      taskTitle: task.title || 'this task'
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.taskId) {
      deleteTask(deleteConfirm.taskId);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, taskId: null, taskTitle: '' });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterPriority('all');
    setFilterStatus('all');
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || filterPriority !== 'all' || filterStatus !== 'all';

  const exportTasks = () => {
    // Create CSV content
    const headers = ['Title', 'Description', 'Due Date', 'Priority', 'Status', 'Created'];
    const rows = tasks.map(task => [
      task.title || '',
      task.description || '',
      task.dueDate || '',
      task.priority || '',
      task.status || '',
      task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (calendarView) {
    return <TasksCalendarView tasks={pendingTasks} onBack={() => setCalendarView(false)} updateTask={updateTask} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Tasks</h2>
        <div className="flex gap-2">
          <button
            onClick={exportTasks}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
            style={{ border: `1px solid ${colors.primary}`, color: colors.primary, backgroundColor: colors.secondary }}
            title="Export tasks to CSV"
          >
            <Download size={20} /> Export
          </button>
          <button
            onClick={() => setCalendarView(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
            style={{ border: `1px solid ${colors.primary}`, color: colors.primary, backgroundColor: colors.secondary }}
          >
            <Calendar size={20} /> Calendar View
          </button>
          <button
            onClick={() => openModal('task')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: colors.primary, color: colors.secondary }}
          >
            <Plus size={20} /> Add Task
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
            <input
              type="text"
              placeholder="Search by title or description..."
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
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
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
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
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
        Showing {sortedTasks.length} of {tasks.length} tasks
      </div>

      <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primary }}>
          Pending Tasks ({pendingTasks.length})
        </h3>
        <div className="space-y-3">
          {pendingTasks.length > 0 ? (
            pendingTasks.map(task => (
              <TaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={handleDeleteClick} openModal={openModal} setActiveTab={setActiveTab} leads={leads} deals={deals} theme={theme} toast={toast} />
            ))
          ) : (
            <NoTasksEmpty onAddTask={() => openModal('task')} />
          )}
        </div>
      </div>

      {completedTasks.length > 0 && (
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primary }}>
            Completed Tasks ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.slice(0, 10).map(task => (
              <TaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={handleDeleteClick} openModal={openModal} setActiveTab={setActiveTab} leads={leads} deals={deals} theme={theme} toast={toast} />
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteConfirm.taskTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonStyle="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

const TaskCard = ({ task, onUpdate, onDelete, openModal, setActiveTab, leads, deals, theme, toast }) => {
  const { colors, isDark } = useTheme();
  const isOverdue = new Date(task.dueDate) < new Date() && task.status === 'pending';
  const priorityColors = getTaskPriorityColors(task.priority, theme);

  // Get related lead or deal info
  const getRelatedInfo = () => {
    if (!task.relatedTo) return null;

    if (task.relatedTo.type === 'lead') {
      const lead = leads.find(l => l.id === task.relatedTo.id);
      return lead ? { type: 'Lead', name: formatLeadDisplayName(lead), company: lead.company, item: lead } : null;
    } else if (task.relatedTo.type === 'deal') {
      const deal = deals.find(d => d.id === task.relatedTo.id);
      return deal ? { type: 'Deal', name: deal.dealName, item: deal } : null;
    }
    return null;
  };

  const relatedInfo = getRelatedInfo();

  // Handle clicking on related item to navigate
  const handleRelatedClick = (e) => {
    e.stopPropagation();
    if (!relatedInfo || !setActiveTab) return;

    if (relatedInfo.type === 'Lead') {
      setActiveTab('leads');
      setTimeout(() => openModal('leadDetail', relatedInfo.item), 100);
    } else if (relatedInfo.type === 'Deal') {
      setActiveTab('deals');
      setTimeout(() => openModal('dealDetail', relatedInfo.item), 100);
    }
  };

  // Theme-aware background colors
  const getBackgroundColor = () => {
    if (task.status === 'completed') {
      return isDark ? '#2d4a2e' : '#d1fae5'; // Dark green for dark mode, light green for light mode
    }
    if (isOverdue) {
      return isDark ? '#4a2d2d' : '#fee2e2'; // Dark red for dark mode, light red for light mode
    }
    return colors.secondary;
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg" style={{
      backgroundColor: getBackgroundColor()
    }}>
      <button
        onClick={() => onUpdate(task.id, { status: task.status === 'pending' ? 'completed' : 'pending' })}
        className="p-2 rounded border-2"
        style={{
          backgroundColor: task.status === 'completed' ? '#5BC0DE' : 'transparent',
          borderColor: task.status === 'completed' ? '#5BC0DE' : (isDark ? colors.textSecondary : colors.border)
        }}
      >
        {task.status === 'completed' && <Check size={16} style={{ color: '#FFFFFF' }} />}
      </button>

      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <p className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`} style={{ color: task.status === 'completed' ? colors.textSecondary : colors.textPrimary }}>
              {task.title}
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>{task.description}</p>
            <div className="flex gap-3 mt-2 text-xs flex-wrap" style={{ color: colors.textSecondary }}>
              <span>Due: {task.dueDate}</span>
              <span
                className="px-2 py-1 rounded font-medium"
                style={{ backgroundColor: priorityColors.bg, color: priorityColors.text }}
              >
                {task.priority}
              </span>
              {task.autoGenerated && (
                <span
                  className="px-2 py-1 rounded"
                  style={{ backgroundColor: isDark ? '#4C1D95' : '#EDE9FE', color: isDark ? '#C4B5FD' : '#6D28D9' }}
                >
                  Auto
                </span>
              )}
              {relatedInfo && (
                <span
                  onClick={handleRelatedClick}
                  className="px-2 py-1 rounded cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isDark ? '#164E63' : '#CFFAFE',
                    color: isDark ? '#67E8F9' : '#0E7490'
                  }}
                  title={relatedInfo.company ? `Click to view: ${relatedInfo.name} (${relatedInfo.company})` : `Click to view: ${relatedInfo.name}`}
                >
                  {relatedInfo.type}: {relatedInfo.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openModal('task', task)}
              className="p-2 rounded"
              style={{ color: colors.textPrimary }}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(task)}
              className="p-2 rounded"
              style={{ color: colors.error }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksCalendarView = ({ tasks, onBack, updateTask }) => {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  const getTasksForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const getDateString = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e, day) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const dateStr = getDateString(day);
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the cell entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverDate(null);
    }
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    const newDueDate = getDateString(day);

    if (draggedTask && draggedTask.dueDate !== newDueDate) {
      updateTask(draggedTask.id, { dueDate: newDueDate });
    }

    setDraggedTask(null);
    setDragOverDate(null);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
          style={{ border: `1px solid ${colors.primary}`, color: colors.primary, backgroundColor: colors.secondary }}
        >
          ← Back to List
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Task Calendar</h2>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Drag tasks to reschedule</p>
        </div>
        <div className="w-32"></div>
      </div>

      <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            className="p-2 rounded"
            style={{ color: colors.textPrimary }}
          >
            ←
          </button>
          <h3 className="text-xl font-semibold" style={{ color: colors.primary }}>
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            className="p-2 rounded"
            style={{ color: colors.textPrimary }}
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold p-2" style={{ color: colors.primary }}>
              {day}
            </div>
          ))}

          {blanks.map(i => (
            <div
              key={`blank-${i}`}
              className="p-2 h-24"
              onDragOver={(e) => e.preventDefault()}
            ></div>
          ))}

          {days.map(day => {
            const dayTasks = getTasksForDate(day);
            const isToday = new Date().getDate() === day &&
                           new Date().getMonth() === month &&
                           new Date().getFullYear() === year;
            const dateStr = getDateString(day);
            const isDragOver = dragOverDate === dateStr;

            return (
              <div
                key={day}
                className={`p-2 h-24 rounded-lg transition-all duration-200 ${isToday ? 'border-2' : ''}`}
                style={{
                  ...(isToday
                    ? { borderColor: colors.primary, backgroundColor: colors.secondary, border: `2px solid ${colors.primary}` }
                    : { backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }),
                  ...(isDragOver && {
                    backgroundColor: colors.primary + '20',
                    border: `2px dashed ${colors.primary}`,
                    transform: 'scale(1.02)'
                  })
                }}
                onDragOver={(e) => handleDragOver(e, day)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day)}
              >
                <div className="font-medium mb-1" style={{ color: colors.textPrimary }}>{day}</div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className="text-xs p-1 rounded truncate cursor-grab active:cursor-grabbing transition-opacity"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.secondary,
                        opacity: draggedTask?.id === task.id ? 0.5 : 1
                      }}
                      title={`${task.title} - Drag to reschedule`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs" style={{ color: colors.textSecondary }}>+{dayTasks.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TasksView;