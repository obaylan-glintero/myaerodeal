import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const UserMenu = ({ setActiveTab }) => {
  const { user, signOut, isConfigured } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();

  // Don't show user menu if Supabase is not configured
  if (!isConfigured || !user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const userEmail = user.email || 'User';
  const userName = user.user_metadata?.full_name || userEmail.split('@')[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors w-full"
        style={{
          backgroundColor: isOpen ? colors.cardBg : 'transparent',
          color: colors.textPrimary
        }}
      >
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <User size={18} style={{ color: colors.secondary }} />
          </div>
          <div className="text-left flex-1 hidden lg:block">
            <p className="text-sm font-medium truncate" style={{ color: colors.textPrimary }}>
              {userName}
            </p>
            <p className="text-xs truncate" style={{ color: colors.textSecondary }}>
              {userEmail}
            </p>
          </div>
        </div>
        <ChevronDown
          size={16}
          style={{ color: colors.textSecondary }}
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className="absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-lg z-20 overflow-hidden"
            style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
          >
            <button
              onClick={() => {
                setActiveTab('settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 transition-colors hover:opacity-80"
              style={{ color: colors.textPrimary }}
            >
              <Settings size={18} />
              <span className="font-medium">Settings</span>
            </button>
            <div style={{ borderTop: `1px solid ${colors.border}` }} />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-3 transition-colors hover:opacity-80"
              style={{ color: colors.error }}
            >
              <LogOut size={18} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
