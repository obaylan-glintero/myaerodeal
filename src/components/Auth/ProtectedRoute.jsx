import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthPage from './AuthPage';
import { Loader } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isConfigured } = useAuth();
  const { colors } = useTheme();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <Loader size={48} className="animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
          <p style={{ color: colors.textSecondary }}>Loading...</p>
        </div>
      </div>
    );
  }

  // If Supabase is not configured, allow access (demo mode)
  if (!isConfigured) {
    return children;
  }

  // If user is not authenticated, show auth page
  if (!user) {
    return <AuthPage />;
  }

  // User is authenticated, show protected content
  return children;
};

export default ProtectedRoute;
