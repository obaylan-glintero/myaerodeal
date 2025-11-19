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
import PaymentSuccess from './components/Auth/PaymentSuccess';
import PaymentCancel from './components/Auth/PaymentCancel';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import TermsConditions from './components/Legal/TermsConditions';
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

  // Check if payment redirect is pending
  const paymentRedirectPending = sessionStorage.getItem('payment_redirect_pending');

  // If payment redirect is pending, show loading screen and don't initialize
  useEffect(() => {
    if (paymentRedirectPending) {
      console.log('⏳ Payment redirect pending, skipping app initialization...');
      return; // Don't initialize
    }

    if (user) {
      // Re-initialize when user changes (including after login)
      initialize();
    }
  }, [user?.id, initialize, paymentRedirectPending]); // Re-initialize when user ID changes

  // Show loading screen if payment redirect is pending
  if (paymentRedirectPending) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: colors.primary }}></div>
            <p className="text-lg" style={{ color: colors.textSecondary }}>Redirecting to payment...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
          {activeTab === 'dashboard' && <Dashboard openModal={openModal} setActiveTab={setActiveTab} />}
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
            openModal={openModal}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

// Main App component with AuthProvider
function App() {
  // Check if we're on a payment page (these don't require authentication)
  const pathname = window.location.pathname;

  if (pathname === '/payment-success') {
    return (
      <AuthProvider>
        <PaymentSuccess />
      </AuthProvider>
    );
  }

  if (pathname === '/payment-cancel') {
    return (
      <AuthProvider>
        <PaymentCancel />
      </AuthProvider>
    );
  }

  if (pathname === '/privacy') {
    return (
      <AuthProvider>
        <PrivacyPolicy />
      </AuthProvider>
    );
  }

  if (pathname === '/terms') {
    return (
      <AuthProvider>
        <TermsConditions />
      </AuthProvider>
    );
  }

  // Default: render main app content
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;