import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Mail, Building, User, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

const RegistrationApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { colors } = useTheme();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('company_registration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Failed to load registration requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setProcessing(requestId);
    setError('');
    setMessage('');

    try {
      const { data, error } = await supabase.rpc('approve_registration_request', {
        request_id: requestId
      });

      if (error) throw error;

      // Create invitation URL with actual app URL
      const invitationUrl = `${window.location.origin}?invitation=${data.invitation_token}`;

      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(invitationUrl);
        setMessage(
          `✅ Approved! Invitation link copied to clipboard.\n\nSend this link to ${data.email}:\n${invitationUrl}`
        );
      } catch (clipboardError) {
        setMessage(
          `✅ Approved! Send this invitation link to ${data.email}:\n${invitationUrl}`
        );
      }

      await loadRequests(); // Reload the list
    } catch (err) {
      console.error('Error approving request:', err);
      setError(err.message || 'Failed to approve request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Enter rejection reason (optional):');
    
    setProcessing(requestId);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.rpc('reject_registration_request', {
        request_id: requestId,
        reason: reason || 'No reason provided'
      });

      if (error) throw error;

      setMessage('Registration request rejected');
      await loadRequests(); // Reload the list
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError(err.message || 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: '#F0AD4E', text: 'Pending', icon: Clock },
      approved: { bg: '#5CB85C', text: 'Approved', icon: CheckCircle },
      rejected: { bg: '#D9534F', text: 'Rejected', icon: XCircle }
    };

    const { bg, text, icon: Icon } = config[status] || config.pending;

    return (
      <span
        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: bg, color: '#FFFFFF' }}
      >
        <Icon size={14} />
        {text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin" size={40} style={{ color: colors.primary }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            Registration Approvals
          </h2>
          <p style={{ color: colors.textSecondary }} className="mt-1">
            Review and approve company registration requests
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', color: colors.error }}>
          {error}
        </div>
      )}
      {message && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>
          <pre className="whitespace-pre-wrap font-sans text-sm">{message}</pre>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12 rounded-lg" style={{ backgroundColor: colors.cardBg }}>
          <Clock size={48} className="mx-auto mb-4" style={{ color: colors.textSecondary }} />
          <p style={{ color: colors.textSecondary }}>No registration requests</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-lg shadow-lg p-6"
              style={{ backgroundColor: colors.cardBg }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold" style={{ color: colors.primary }}>
                      {request.first_name} {request.last_name}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <Mail size={16} style={{ color: colors.textSecondary }} />
                      <span style={{ color: colors.textPrimary }}>{request.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building size={16} style={{ color: colors.textSecondary }} />
                      <span style={{ color: colors.textPrimary }}>{request.company_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: colors.textSecondary }} />
                      <span style={{ color: colors.textSecondary }}>
                        Requested: {new Date(request.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {request.rejection_reason && (
                    <div className="mt-4 p-3 rounded" style={{ backgroundColor: colors.secondary }}>
                      <p className="text-sm font-medium mb-1" style={{ color: colors.error }}>
                        Rejection Reason:
                      </p>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        {request.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {request.status === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processing === request.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold"
                    style={{
                      backgroundColor: '#5CB85C',
                      color: '#FFFFFF',
                      opacity: processing === request.id ? 0.5 : 1
                    }}
                  >
                    {processing === request.id ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processing === request.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold"
                    style={{
                      backgroundColor: colors.error,
                      color: '#FFFFFF',
                      opacity: processing === request.id ? 0.5 : 1
                    }}
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegistrationApproval;
