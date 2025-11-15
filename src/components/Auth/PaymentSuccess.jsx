import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

function PaymentSuccess() {
  const { colors } = useTheme();

  useEffect(() => {
    // Clear payment redirect flag
    sessionStorage.removeItem('payment_redirect_pending');
    console.log('✅ Payment successful - cleared redirect flag');

    // Auto-redirect to app after 5 seconds
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
            Payment Successful!
          </h1>
          <p className="text-lg" style={{ color: colors.textSecondary }}>
            Welcome to MyAeroDeal
          </p>
        </div>

        <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: colors.cardBackground }}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <p className="font-medium" style={{ color: colors.text }}>Your account is now active</p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>You can sign in and start using MyAeroDeal</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <p className="font-medium" style={{ color: colors.text }}>Subscription activated</p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>$99/month - Cancel anytime</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <p className="font-medium" style={{ color: colors.text }}>Receipt emailed</p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Check your inbox for the payment receipt</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="w-full py-3 px-4 rounded-lg font-medium transition-all hover:opacity-90"
          style={{
            backgroundColor: colors.primary,
            color: colors.buttonText
          }}
        >
          Continue to Dashboard
        </button>

        <p className="mt-4 text-sm" style={{ color: colors.textSecondary }}>
          Redirecting automatically in 5 seconds...
        </p>
      </div>
    </div>
  );
}

export default PaymentSuccess;
