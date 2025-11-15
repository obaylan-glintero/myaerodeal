import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

function PaymentCancel() {
  const { colors } = useTheme();

  const handleRetry = () => {
    // Navigate back to auth page to retry payment
    window.location.href = '/?retry=true';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
            Payment Cancelled
          </h1>
          <p className="text-lg" style={{ color: colors.textSecondary }}>
            Your payment was not completed
          </p>
        </div>

        <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: colors.cardBackground }}>
          <p className="mb-4" style={{ color: colors.text }}>
            No charges have been made to your account.
          </p>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            You can retry payment anytime to activate your MyAeroDeal subscription and start managing your aircraft brokerage business.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all hover:opacity-90"
            style={{
              backgroundColor: colors.primary,
              color: colors.buttonText
            }}
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.href = '/landing-page.html'}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all hover:opacity-70"
            style={{
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            Return to Home
          </button>
        </div>

        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.cardBackground }}>
          <p className="text-sm font-medium mb-2" style={{ color: colors.text }}>
            Need Help?
          </p>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Contact us at <a href="mailto:support@myaerodeal.com" className="underline" style={{ color: colors.primary }}>support@myaerodeal.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;
