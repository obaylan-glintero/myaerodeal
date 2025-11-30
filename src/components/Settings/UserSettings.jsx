import React, { useState, useEffect } from 'react';
import { User, Mail, Save, Trash2, AlertTriangle, Lock, XCircle, CreditCard, Calendar, RefreshCw } from 'lucide-react';
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

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  // Subscription cancellation state
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  // Subscription details state
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState(null);

  // Fetch subscription details from Stripe
  const fetchSubscriptionDetails = async () => {
    if (!currentUserProfile?.company?.stripe_subscription_id) {
      setSubscriptionLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscriptionLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription-details`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.hasSubscription) {
          setSubscriptionDetails(data);
        }
      } else {
        setSubscriptionError('Failed to load subscription details');
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      setSubscriptionError(error.message);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Load subscription details on mount
  useEffect(() => {
    fetchSubscriptionDetails();
  }, [currentUserProfile?.company?.stripe_subscription_id]);

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

  const handlePasswordChange = async () => {
    setPasswordLoading(true);
    setPasswordMessage('');

    // Validation
    if (newPassword.length < 8) {
      setPasswordMessage('Error: Password must be at least 8 characters long');
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Error: New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPasswordMessage('✅ Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(''), 5000);
    } catch (error) {
      setPasswordMessage(`Error: ${error.message}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setCancelMessage('');

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: currentUserProfile?.company?.stripe_subscription_id,
          companyId: currentUserProfile?.company_id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setCancelMessage('✅ Subscription canceled successfully. You will retain access until the end of your current billing period.');
      setShowCancelConfirm(false);

      // Refresh to update subscription status
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setCancelMessage(`Error: ${error.message}`);
    } finally {
      setCancelLoading(false);
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

      {/* Password Change Section */}
      <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
        <div className="flex items-start gap-3 mb-4">
          <Lock size={24} style={{ color: colors.primary }} />
          <div>
            <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              Change Password
            </h3>
            <p style={{ color: colors.textSecondary }} className="mt-1">
              Update your account password
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
              New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-4 py-3 rounded-lg"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Must be at least 8 characters
            </p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-10 pr-4 py-3 rounded-lg"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
              />
            </div>
          </div>

          {/* Password Message */}
          {passwordMessage && (
            <div
              className="p-3 rounded-lg font-medium"
              style={{
                backgroundColor: passwordMessage.includes('Error') ? colors.error + '20' : colors.primary + '20',
                color: passwordMessage.includes('Error') ? colors.error : colors.primary
              }}
            >
              {passwordMessage}
            </div>
          )}

          {/* Change Password Button */}
          <button
            onClick={handlePasswordChange}
            disabled={passwordLoading || !newPassword || !confirmPassword}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: colors.primary,
              color: colors.secondary,
              opacity: (passwordLoading || !newPassword || !confirmPassword) ? 0.5 : 1,
              cursor: (passwordLoading || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer'
            }}
          >
            <Lock size={20} />
            {passwordLoading ? 'Updating Password...' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* Subscription Management Section */}
      {currentUserProfile?.company?.stripe_subscription_id && (
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
          <div className="flex items-start gap-3 mb-4">
            <CreditCard size={24} style={{ color: colors.primary }} />
            <div>
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                Subscription & Billing
              </h3>
              <p style={{ color: colors.textSecondary }} className="mt-1">
                Manage your subscription plan and payment method
              </p>
            </div>
          </div>

          {subscriptionLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="animate-spin" size={24} style={{ color: colors.primary }} />
              <span className="ml-2" style={{ color: colors.textSecondary }}>Loading subscription details...</span>
            </div>
          ) : subscriptionError ? (
            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.error + '20', color: colors.error }}>
              {subscriptionError}
            </div>
          ) : subscriptionDetails ? (
            <div className="space-y-4">
              {/* Current Plan */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold" style={{ color: colors.textPrimary }}>Current Plan</h4>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                    style={{
                      backgroundColor: subscriptionDetails.subscription.status === 'active'
                        ? '#10B981'
                        : subscriptionDetails.subscription.status === 'trialing'
                        ? '#3B82F6'
                        : '#6B7280',
                      color: 'white'
                    }}
                  >
                    {subscriptionDetails.subscription.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Plan Type</p>
                    <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                      {subscriptionDetails.subscription.plan.interval === 'year' ? 'Annual' : 'Monthly'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Price</p>
                    <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                      ${(subscriptionDetails.subscription.plan.amount / 100).toFixed(0)}/{subscriptionDetails.subscription.plan.interval}
                    </p>
                  </div>
                </div>

                {/* Trial Information */}
                {subscriptionDetails.subscription.status === 'trialing' && subscriptionDetails.subscription.trial_end && (
                  <div className="mt-4 p-3 rounded" style={{ backgroundColor: colors.primary + '15' }}>
                    <div className="flex items-start gap-2">
                      <Calendar size={18} style={{ color: colors.primary, marginTop: '2px' }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: colors.primary }}>
                          Free Trial Active
                        </p>
                        <p className="text-xs mt-1" style={{ color: colors.textPrimary }}>
                          Your trial ends on {new Date(subscriptionDetails.subscription.trial_end * 1000).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}. Your payment method will be charged after the trial.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Billing Date */}
                {subscriptionDetails.upcomingInvoice && (
                  <div className="mt-4 flex items-center justify-between p-3 rounded" style={{ backgroundColor: colors.background }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Next Billing Date</p>
                      <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                        {new Date(subscriptionDetails.upcomingInvoice.period_end * 1000).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Amount</p>
                      <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                        ${(subscriptionDetails.upcomingInvoice.amount_due / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              {subscriptionDetails.subscription.paymentMethod?.card && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }}>
                  <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>Payment Method</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded flex items-center justify-center" style={{ backgroundColor: colors.background }}>
                        <CreditCard size={20} style={{ color: colors.primary }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: colors.textPrimary }}>
                          {subscriptionDetails.subscription.paymentMethod.card.brand.charAt(0).toUpperCase() +
                           subscriptionDetails.subscription.paymentMethod.card.brand.slice(1)} •••• {subscriptionDetails.subscription.paymentMethod.card.last4}
                        </p>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          Expires {subscriptionDetails.subscription.paymentMethod.card.exp_month}/{subscriptionDetails.subscription.paymentMethod.card.exp_year}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open('https://billing.stripe.com/p/login/test_00000000000000', '_blank')}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: colors.primary + '20',
                        color: colors.primary,
                        border: `1px solid ${colors.primary}`
                      }}
                    >
                      Update Card
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  onClick={fetchSubscriptionDetails}
                  disabled={subscriptionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                    opacity: subscriptionLoading ? 0.5 : 1
                  }}
                >
                  <RefreshCw size={18} className={subscriptionLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: colors.secondary }}>
              <p style={{ color: colors.textSecondary }}>No subscription details available</p>
            </div>
          )}
        </div>
      )}

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

          {/* Subscription Cancellation Section */}
          {currentUserProfile?.company?.stripe_subscription_id && (
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.border}` }}>
              <h4 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>
                Cancel Subscription
              </h4>
              <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                Cancel your company's subscription. You will retain access until the end of the current billing period.
              </p>

              {/* Current Subscription Info */}
              <div className="mb-4 p-3 rounded" style={{ backgroundColor: colors.background }}>
                <p className="text-sm" style={{ color: colors.textPrimary }}>
                  <strong>Current Status:</strong>{' '}
                  <span
                    className="px-2 py-1 rounded text-xs font-semibold ml-2"
                    style={{
                      backgroundColor: currentUserProfile?.company?.subscription_status === 'active' ? '#10B981' : '#6B7280',
                      color: 'white'
                    }}
                  >
                    {currentUserProfile?.company?.subscription_status || 'Unknown'}
                  </span>
                </p>
                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                  Subscription ID: {currentUserProfile?.company?.stripe_subscription_id}
                </p>
              </div>

              {/* Cancel Message */}
              {cancelMessage && (
                <div
                  className="mb-3 p-3 rounded-lg font-medium text-sm"
                  style={{
                    backgroundColor: cancelMessage.includes('Error') ? colors.error + '20' : colors.primary + '20',
                    color: cancelMessage.includes('Error') ? colors.error : colors.primary
                  }}
                >
                  {cancelMessage}
                </div>
              )}

              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={currentUserProfile?.company?.subscription_status !== 'active'}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold"
                  style={{
                    backgroundColor: colors.error,
                    color: '#FFFFFF',
                    opacity: currentUserProfile?.company?.subscription_status !== 'active' ? 0.5 : 1,
                    cursor: currentUserProfile?.company?.subscription_status !== 'active' ? 'not-allowed' : 'pointer'
                  }}
                >
                  <XCircle size={18} />
                  Cancel Subscription
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', border: `2px solid ${colors.error}` }}>
                    <p className="font-bold mb-2" style={{ color: colors.error }}>
                      ⚠️ CONFIRM CANCELLATION
                    </p>
                    <p className="text-sm" style={{ color: colors.textPrimary }}>
                      Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period, after which all users will lose access to the system.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold"
                      style={{
                        backgroundColor: colors.error,
                        color: '#FFFFFF',
                        opacity: cancelLoading ? 0.5 : 1
                      }}
                    >
                      {cancelLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Canceling...
                        </>
                      ) : (
                        <>
                          <XCircle size={18} />
                          Yes, Cancel Subscription
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={cancelLoading}
                      className="flex-1 px-4 py-3 rounded-lg font-semibold"
                      style={{
                        backgroundColor: colors.secondary,
                        color: colors.textPrimary,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      Keep Subscription
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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
