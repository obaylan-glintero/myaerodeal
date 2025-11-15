import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navigation from './components/Common/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import LeadsView from './components/Leads/LeadsView';
import AircraftView from './components/Aircraft/AircraftView';
import DealsView from './components/Deals/DealsView';
import TasksView from './components/Tasks/TasksView';
import UserManagement from './components/Admin/UserManagement';
import RegistrationApproval from './components/Admin/RegistrationApproval';
import UserSettings from './components/Settings/UserSettings';
import AIAssistant from './components/AI/AIAssistant';
import Modal from './components/Common/Modal';
import { useStore } from './store/useStore';

// Inner component that has access to auth context
function AppContent() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Initialize store on mount and when auth changes
  const initialize = useStore(state => state.initialize);
  const loading = useStore(state => state.loading);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Re-initialize when user changes (including after login)
      initialize();
    }
  }, [user?.id, initialize]); // Re-initialize when user ID changes

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  };

  // Show loading screen while initializing
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: colors.primary }}></div>
            <p className="text-lg" style={{ color: colors.textSecondary }}>Loading MyAeroDeal...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex" style={{ backgroundColor: colors.background }}>
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Mobile Navigation (rendered inside Navigation component) */}
        <div className="lg:hidden">
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard openModal={openModal} />}
          {activeTab === 'leads' && <LeadsView openModal={openModal} />}
          {activeTab === 'aircraft' && <AircraftView openModal={openModal} />}
          {activeTab === 'deals' && <DealsView openModal={openModal} />}
          {activeTab === 'tasks' && <TasksView openModal={openModal} />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'registrations' && <RegistrationApproval />}
          {activeTab === 'settings' && <UserSettings />}
        </div>

        <AIAssistant setActiveTab={setActiveTab} openModal={openModal} />

        {showModal && (
          <Modal
            modalType={modalType}
            editingItem={editingItem}
            closeModal={closeModal}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;