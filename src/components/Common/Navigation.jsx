import React, { useState } from 'react';
import { Plane, FileText, Users, ListTodo, Menu, X, Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import logoLight from '../../assets/MyAeroDeal_light.png';
import logoDark from '../../assets/MyAeroDeal_dark.png';
import UserMenu from '../Auth/UserMenu';
import { useStore } from '../../store/useStore';

const Navigation = ({ activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUserProfile = useStore(state => state.currentUserProfile);
  const { colors, toggleTheme, isDark } = useTheme();
  const logo = isDark ? logoDark : logoLight;

  const navItems = [
    { id: 'dashboard', icon: <FileText size={20} />, label: 'Dashboard' },
    { id: 'leads', icon: <Users size={20} />, label: 'Leads' },
    { id: 'aircraft', icon: <Plane size={20} />, label: 'Aircraft' },
    { id: 'deals', icon: <FileText size={20} />, label: 'Deals' },
    { id: 'tasks', icon: <ListTodo size={20} />, label: 'Tasks' }
  ];

  // Add User Management for admins
  if (currentUserProfile?.role === 'admin') {
    navItems.push({ id: 'users', icon: <Shield size={20} />, label: 'User Management' });
  }

  // Add Registration Approvals for super admins
  if (currentUserProfile?.is_super_admin) {
    navItems.push({ id: 'registrations', icon: <Shield size={20} />, label: 'Registrations' });
  }

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4"
        style={{ backgroundColor: colors.secondary }}
      >
        <img src={logo} alt="MyAeroDeal" className="h-10" />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg"
            style={{ color: colors.primary }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg"
            style={{ color: colors.primary }}
            aria-label="Open menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-[60]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <nav
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 z-[70] transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } p-6 flex flex-col`}
        style={{ backgroundColor: colors.secondary }}
      >
        <div className="mb-8">
          <div className="p-3 rounded-xl mb-4" style={{
            backgroundColor: isDark ? 'transparent' : colors.cardBg,
            boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.2)',
            border: `3px solid ${colors.primary}`
          }}>
            <img src={logo} alt="MyAeroDeal" className="w-full h-auto" />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-lg"
            style={{ color: colors.primary }}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-2 flex-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: activeTab === item.id ? colors.cardBg : 'transparent',
                color: activeTab === item.id ? colors.primary : colors.textPrimary
              }}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Theme Toggle - Mobile */}
        <div className="mb-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: colors.textPrimary
            }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {/* User Menu - Mobile */}
        <div className="pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
          <UserMenu setActiveTab={setActiveTab} />
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav
        className="hidden lg:flex flex-col p-6 h-screen"
        style={{ backgroundColor: colors.secondary, color: colors.textPrimary }}
      >
        <div className="mb-8 p-4 rounded-xl" style={{
          backgroundColor: isDark ? 'transparent' : colors.cardBg,
          boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.2)',
          border: `3px solid ${colors.primary}`
        }}>
          <img src={logo} alt="MyAeroDeal" className="w-full h-auto" />
        </div>

        <div className="space-y-2 flex-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: activeTab === item.id ? colors.cardBg : 'transparent',
                color: activeTab === item.id ? colors.primary : colors.textPrimary
              }}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Theme Toggle - Desktop */}
        <div className="mt-auto mb-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: colors.textPrimary
            }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {/* User Menu - Desktop */}
        <div className="pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
          <UserMenu setActiveTab={setActiveTab} />
        </div>
      </nav>
    </>
  );
};

export default Navigation;