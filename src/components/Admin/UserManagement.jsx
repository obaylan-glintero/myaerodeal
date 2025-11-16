import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users as UsersIcon, Shield, User, Mail, X, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';

const UserManagement = () => {
  const {
    companyUsers,
    currentUserProfile,
    loadCompanyUsers,
    inviteUser,
    updateUserRole,
    deleteUser
  } = useStore();
  const { colors } = useTheme();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);

  // Constants for user limits
  const MAX_USERS = 5;
  const activeUserCount = companyUsers.filter(u => u.active).length;
  const isAtLimit = activeUserCount >= MAX_USERS;

  useEffect(() => {
    loadCompanyUsers();
  }, []);

  const handleInviteUser = async () => {
    if (!inviteData.email || !inviteData.firstName || !inviteData.lastName) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await inviteUser(inviteData);
      // Success message is shown by inviteUser function
      setShowInviteModal(false);
      setInviteData({ email: '', firstName: '', lastName: '', role: 'user' });
      loadCompanyUsers();
    } catch (error) {
      alert(`Error inviting user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        await updateUserRole(userId, newRole);
        loadCompanyUsers();
      } catch (error) {
        alert(`Error updating role: ${error.message}`);
      }
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (window.confirm(`Are you sure you want to remove ${userEmail} from your company? This cannot be undone.`)) {
      try {
        await deleteUser(userId);
        loadCompanyUsers();
      } catch (error) {
        alert(`Error removing user: ${error.message}`);
      }
    }
  };

  if (!currentUserProfile || currentUserProfile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield size={64} className="mx-auto mb-4" style={{ color: colors.error }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            Access Denied
          </h2>
          <p style={{ color: colors.textSecondary }}>
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>User Management</h2>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            {activeUserCount} of {MAX_USERS} users
            {isAtLimit && (
              <span className="ml-2 text-xs px-2 py-1 rounded font-semibold" style={{ backgroundColor: colors.error, color: 'white' }}>
                Limit Reached
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          disabled={isAtLimit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-opacity"
          style={{
            backgroundColor: isAtLimit ? colors.border : colors.primary,
            color: colors.secondary,
            opacity: isAtLimit ? 0.6 : 1,
            cursor: isAtLimit ? 'not-allowed' : 'pointer'
          }}
          title={isAtLimit ? 'User limit reached. Please contact support to increase your limit.' : 'Invite a new user'}
        >
          <Plus size={20} /> Invite User
        </button>
      </div>

      {/* User Limit Warning */}
      {isAtLimit && (
        <div className="rounded-lg p-4 flex items-start gap-3" style={{ backgroundColor: `${colors.error}15`, border: `1px solid ${colors.error}` }}>
          <AlertTriangle size={20} style={{ color: colors.error, flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="font-semibold" style={{ color: colors.error }}>User Limit Reached</p>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              Your company has reached the maximum limit of {MAX_USERS} users.
              Please contact support to increase your user limit if you need to add more team members.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
        <div className="flex items-center gap-2 mb-4">
          <UsersIcon size={24} style={{ color: colors.primary }} />
          <h3 className="text-xl font-semibold" style={{ color: colors.primary }}>
            Active Users ({activeUserCount})
          </h3>
        </div>

        <div className="space-y-3">
          {companyUsers.filter(u => u.active).map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ backgroundColor: colors.secondary }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  {user.role === 'admin' ? (
                    <Shield size={24} style={{ color: colors.secondary }} />
                  ) : (
                    <User size={24} style={{ color: colors.secondary }} />
                  )}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {user.firstName} {user.lastName}
                    {user.id === currentUserProfile.id && (
                      <span className="ml-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: colors.primary, color: colors.secondary }}>
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-sm flex items-center gap-2" style={{ color: colors.textSecondary }}>
                    <Mail size={14} />
                    {user.email}
                  </p>
                  <p className="text-xs mt-1">
                    <span
                      className="px-2 py-1 rounded font-semibold"
                      style={{
                        backgroundColor: user.role === 'admin' ? colors.primary : colors.border,
                        color: user.role === 'admin' ? colors.secondary : colors.textPrimary
                      }}
                    >
                      {user.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  </p>
                </div>
              </div>

              {user.id !== currentUserProfile.id && (
                <div className="flex gap-2">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: colors.cardBg,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    className="p-2 rounded hover:opacity-80"
                    style={{ color: colors.error }}
                    title="Remove user"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-xl max-w-md w-full" style={{ backgroundColor: colors.cardBg }}>
            <div className="p-6 rounded-t-lg flex justify-between items-center" style={{ backgroundColor: colors.primary }}>
              <h3 className="text-xl font-semibold" style={{ color: colors.secondary }}>
                Invite New User
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded"
                style={{ color: colors.secondary }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={inviteData.firstName}
                  onChange={(e) => setInviteData({ ...inviteData, firstName: e.target.value })}
                  placeholder="John"
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={inviteData.lastName}
                  onChange={(e) => setInviteData({ ...inviteData, lastName: e.target.value })}
                  placeholder="Doe"
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                  Administrators can invite and manage users
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold"
                  style={{
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.secondary,
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
