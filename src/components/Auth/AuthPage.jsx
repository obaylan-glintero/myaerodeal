import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Loader, Building } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import logoLight from '../../assets/MyAeroDeal_light.png';
import logoDark from '../../assets/MyAeroDeal_dark.png';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [invitationToken, setInvitationToken] = useState(null);
  const [invitationData, setInvitationData] = useState(null);
  const [checkingInvitation, setCheckingInvitation] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const { colors, isDark } = useTheme();
  const logo = isDark ? logoDark : logoLight;

  const { signIn, signUp, isConfigured } = useAuth();

  // Password validation function
  const validatePassword = (pwd) => {
    const feedback = [];
    let score = 0;

    // Minimum length
    if (pwd.length >= 8) {
      score++;
    } else {
      feedback.push('At least 8 characters');
    }

    // Has uppercase
    if (/[A-Z]/.test(pwd)) {
      score++;
    } else {
      feedback.push('One uppercase letter');
    }

    // Has lowercase
    if (/[a-z]/.test(pwd)) {
      score++;
    } else {
      feedback.push('One lowercase letter');
    }

    // Has number
    if (/\d/.test(pwd)) {
      score++;
    } else {
      feedback.push('One number');
    }

    // Has special character
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      score++;
    } else {
      feedback.push('One special character (!@#$%^&*)');
    }

    return { score, feedback, isValid: score === 5 };
  };

  // Update password strength on password change
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (!isLogin && newPassword.length > 0) {
      const validation = validatePassword(newPassword);
      setPasswordStrength(validation);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  };

  // Check for invitation token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invitation');

    if (token) {
      setInvitationToken(token);
      validateInvitation(token);
    } else {
      setCheckingInvitation(false);
    }
  }, []);

  const validateInvitation = async (token) => {
    try {
      const { data, error } = await supabase.rpc('validate_invitation_token', {
        invitation_token: token
      });

      if (error) throw error;

      if (data && data.valid) {
        setInvitationData(data);
        setEmail(data.email);
        setIsLogin(false); // Switch to signup mode
        setMessage(`You've been invited to join ${data.company_name}!`);
      } else {
        setError(data?.message || 'Invalid or expired invitation');
        setInvitationToken(null);
      }
    } catch (err) {
      console.error('Error validating invitation:', err);
      setError('Failed to validate invitation');
      setInvitationToken(null);
    } finally {
      setCheckingInvitation(false);
    }
  };

  // Demo mode bypass
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="max-w-md w-full p-8 rounded-lg" style={{ backgroundColor: colors.cardBg }}>
          <div className="mb-6 flex justify-center">
            <img src={logo} alt="MyAeroDeal" className="h-20" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>
              Demo Mode
            </h2>
            <p style={{ color: colors.textSecondary }} className="mb-4">
              Supabase is not configured. Running in demo mode.
            </p>
            <p style={{ color: colors.textSecondary }} className="text-sm">
              To enable authentication, add your Supabase credentials to the .env file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await signIn(email, password);
        if (error) throw error;
      } else {
        // Sign up
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Validate strong password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          throw new Error('Password does not meet security requirements: ' + passwordValidation.feedback.join(', '));
        }

        // Check if this is an invitation signup
        if (invitationToken) {
          // User was invited - proceed with normal signup
          const { data, error } = await signUp(email, password, {
            first_name: firstName,
            last_name: lastName
          });

          if (error) throw error;
          setMessage('Account created! Check your email to confirm.');
        } else {
          // No invitation - create account and redirect to Stripe payment
          console.log('🚀 Starting registration process...');

          // Step 1: Create Supabase auth user
          console.log('Step 1: Creating auth user...');
          const { data: authData, error: signUpError } = await signUp(email, password, {
            first_name: firstName,
            last_name: lastName,
            company_name: companyName
          });

          if (signUpError) {
            console.error('❌ Step 1 failed - Auth user creation:', signUpError);
            throw signUpError;
          }
          console.log('✅ Step 1 complete - User created:', authData.user.id);

          // Step 2: Create company record (approved=false, will be approved after payment)
          console.log('Step 2: Creating company record...');
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: companyName,
              email: email,
              approved: false // Will be set to true by webhook after payment
            })
            .select()
            .single();

          if (companyError) {
            console.error('❌ Step 2 failed - Company creation:', companyError);
            throw companyError;
          }
          console.log('✅ Step 2 complete - Company created:', companyData.id);

          // Step 3: Create user profile linking to company
          console.log('Step 3: Creating user profile...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              company_id: companyData.id,
              email: email,
              first_name: firstName,
              last_name: lastName,
              role: 'admin'
            });

          if (profileError) {
            console.error('❌ Step 3 failed - Profile creation:', profileError);
            throw profileError;
          }
          console.log('✅ Step 3 complete - Profile created');

          // Step 4: Redirect to Stripe checkout
          console.log('Step 4: Preparing Stripe redirect...');
          setMessage('Redirecting to payment...');

          // Add flag to prevent app initialization during redirect
          sessionStorage.setItem('payment_redirect_pending', 'true');

          // Get auth token from signUp response
          const session = authData.session;

          if (!session) {
            throw new Error('No active session. Email confirmation may be required.');
          }

          // Call Edge Function to create checkout session
          console.log('Calling Edge Function:', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`);

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('Edge Function response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Edge Function error:', errorText);
            throw new Error(`Failed to create checkout session: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log('Edge Function response:', data);

          if (data.error || !data.url) {
            throw new Error(data.error || 'Failed to create checkout session - no URL returned');
          }

          // Redirect to Stripe Checkout
          console.log('Redirecting to Stripe:', data.url);
          window.location.href = data.url;
        }
      }
    } catch (err) {
      console.error('💥 Registration error:', err);
      console.error('Error details:', err.message, err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking invitation
  if (checkingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={40} style={{ color: colors.primary }} />
          <p style={{ color: colors.textSecondary }}>Validating invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <div className="max-w-md w-full p-8 rounded-lg shadow-2xl" style={{ backgroundColor: colors.cardBg }}>
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img src={logo} alt="AeroBrokerOne" className="h-20" />
        </div>

        {/* Invitation Banner */}
        {invitationData && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.primary + '20', border: `2px solid ${colors.primary}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Building size={20} style={{ color: colors.primary }} />
              <p className="font-semibold" style={{ color: colors.primary }}>You're Invited!</p>
            </div>
            <p className="text-sm" style={{ color: colors.textPrimary }}>
              Join <strong>{invitationData.company_name}</strong> as a {invitationData.role}
            </p>
          </div>
        )}

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-2" style={{ color: colors.primary }}>
          {isLogin ? 'Welcome Back' : invitationToken ? 'Complete Your Account' : 'Request Access'}
        </h2>
        <p className="text-center mb-8" style={{ color: colors.textSecondary }}>
          {isLogin
            ? 'Sign in to your account'
            : invitationToken
              ? 'Create your password to join'
              : 'Submit a request to create a new company account'}
        </p>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.error + '20', color: colors.error }}>
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name (Sign Up Only - NOT for invitations) */}
          {!isLogin && !invitationToken && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Company Name *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`
                  }}
                  placeholder="AeroJet Brokers Inc."
                />
              </div>
            </div>
          )}

          {/* First Name (Sign Up Only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`
                  }}
                  placeholder="John"
                />
              </div>
            </div>
          )}

          {/* Last Name (Sign Up Only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`
                  }}
                  placeholder="Doe"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!invitationToken}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                  opacity: invitationToken ? 0.6 : 1,
                  cursor: invitationToken ? 'not-allowed' : 'text'
                }}
                placeholder="you@example.com"
              />
            </div>
            {invitationToken && (
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                Email is set by invitation
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`
                }}
                placeholder="••••••••"
              />
            </div>

            {/* Password Strength Indicator */}
            {!isLogin && password.length > 0 && (
              <div className="mt-2">
                {/* Strength Bar */}
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded"
                      style={{
                        backgroundColor: passwordStrength.score >= level
                          ? passwordStrength.score === 5
                            ? '#4CAF50'
                            : passwordStrength.score >= 3
                            ? '#ff9800'
                            : '#f44336'
                          : colors.border
                      }}
                    />
                  ))}
                </div>

                {/* Strength Label */}
                <p className="text-xs font-semibold mb-1" style={{
                  color: passwordStrength.score === 5
                    ? '#4CAF50'
                    : passwordStrength.score >= 3
                    ? '#ff9800'
                    : '#f44336'
                }}>
                  {passwordStrength.score === 5
                    ? 'Strong Password ✓'
                    : passwordStrength.score >= 3
                    ? 'Moderate Password'
                    : 'Weak Password'}
                </p>

                {/* Missing Requirements */}
                {passwordStrength.feedback.length > 0 && (
                  <div className="text-xs" style={{ color: colors.textSecondary }}>
                    <p className="font-semibold mb-1">Required:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password (Sign Up Only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: colors.textSecondary }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            style={{
              backgroundColor: colors.primary,
              color: colors.secondary,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading && <Loader size={20} className="animate-spin" />}
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Login/Signup (hide when invitation is present) */}
        {!invitationToken && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="font-medium"
              style={{ color: colors.primary }}
            >
              {isLogin ? "Don't have an account? Request access" : 'Already have an account? Sign in'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
