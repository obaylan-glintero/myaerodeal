import React, { useState } from 'react';
import { User, Mail, Save, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';

const UserSettings = () => {
  const { currentUserProfile, updateUserProfile } = useStore();
  const { colors } = useTheme();

  const [firstName, setFirstName] = useState(currentUserProfile?.first_name || '');
  const [lastName, setLastName] = useState(currentUserProfile?.last_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [wipeLoading, setWipeLoading] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      await updateUserProfile({
        first_name: firstName,
        last_name: lastName
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWipeData = async () => {
    setWipeLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.rpc('wipe_company_data');

      if (error) throw error;

      setMessage(
        `✅ Data wiped successfully!\n` +
        `Deleted: ${data.leads_deleted} leads, ${data.aircraft_deleted} aircraft, ` +
        `${data.deals_deleted} deals, ${data.tasks_deleted} tasks.\n` +
        `Users and company settings preserved.`
      );
      setShowWipeConfirm(false);

      // Refresh the page to show empty data
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setWipeLoading(false);
    }
  };

  if (!currentUserProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p style={{ color: colors.textSecondary }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
          Profile Settings
        </h2>
        <p style={{ color: colors.textSecondary }} className="mt-1">
          Update your personal information
        </p>
      </div>

      <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
        <div className="space-y-4">
          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
              <input
                type="email"
                value={currentUserProfile.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-lg cursor-not-allowed opacity-60"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Email cannot be changed
            </p>
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
              First Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
              Last Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              />
            </div>
          </div>

          {/* Company (Read-only) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
              Company
            </label>
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }}>
              <p style={{ color: colors.textPrimary }}>
                {currentUserProfile.company?.name || 'No company'}
              </p>
            </div>
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
              Role
            </label>
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }}>
              <span
                className="px-3 py-1 rounded font-semibold text-sm"
                style={{
                  backgroundColor: currentUserProfile.role === 'admin' ? colors.primary : colors.border,
                  color: currentUserProfile.role === 'admin' ? colors.secondary : colors.textPrimary
                }}
              >
                {currentUserProfile.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div
              className="p-3 rounded-lg font-medium"
              style={{
                backgroundColor: message.includes('Error') ? colors.error + '20' : colors.primary + '20',
                color: message.includes('Error') ? colors.error : colors.primary
              }}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm">{message}</pre>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading || !firstName || !lastName}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: colors.primary,
              color: colors.secondary,
              opacity: (loading || !firstName || !lastName) ? 0.5 : 1,
              cursor: (loading || !firstName || !lastName) ? 'not-allowed' : 'pointer'
            }}
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Data Management Section (Admin Only) */}
      {currentUserProfile.role === 'admin' && (
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={24} style={{ color: colors.error }} />
            <div>
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                Data Management
              </h3>
              <p style={{ color: colors.textSecondary }} className="mt-1">
                Administrative tools for managing company data
              </p>
            </div>
          </div>

          {/* Wipe Test Data Section */}
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }}>
            <h4 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>
              Wipe All Company Data
            </h4>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Remove all leads, aircraft, deals, and tasks from your company account.
              This is useful for clearing test data and starting fresh.
            </p>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 p-3 rounded" style={{ backgroundColor: colors.background }}>
                <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                  ⚠️ This action is permanent and cannot be undone!
                </p>
                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                  Users and company settings will be preserved.
                </p>
              </div>
            </div>

            {!showWipeConfirm ? (
              <button
                onClick={() => setShowWipeConfirm(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold"
                style={{
                  backgroundColor: colors.error,
                  color: '#FFFFFF'
                }}
              >
                <Trash2 size={18} />
                Wipe All Data
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', border: `2px solid ${colors.error}` }}>
                  <p className="font-bold mb-2" style={{ color: colors.error }}>
                    ⚠️ CONFIRM DATA WIPE
                  </p>
                  <p className="text-sm" style={{ color: colors.textPrimary }}>
                    Are you absolutely sure? This will permanently delete ALL leads, aircraft, deals, and tasks
                    for your company. Users will not be affected.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleWipeData}
                    disabled={wipeLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold"
                    style={{
                      backgroundColor: colors.error,
                      color: '#FFFFFF',
                      opacity: wipeLoading ? 0.5 : 1
                    }}
                  >
                    {wipeLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Wiping Data...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Yes, Wipe All Data
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowWipeConfirm(false)}
                    disabled={wipeLoading}
                    className="flex-1 px-4 py-3 rounded-lg font-semibold"
                    style={{
                      backgroundColor: colors.secondary,
                      color: colors.textPrimary,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;
