import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react';
import logoLight from '../../assets/MyAeroDeal_light.png';
import logoDark from '../../assets/MyAeroDeal_dark.png';

const TermsConditions = () => {
  const { colors, isDark } = useTheme();
  const logo = isDark ? logoDark : logoLight;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            style={{ color: colors.primary }}
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <img src={logo} alt="MyAeroDeal" className="h-8" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none" style={{ color: colors.textPrimary }}>
          <h1 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>Terms and Conditions</h1>
          <p className="text-sm mb-8" style={{ color: colors.textSecondary }}>Last Updated: November 16, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>1. Introduction and Acceptance</h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              Welcome to MyAeroDeal, a business jet sales and acquisition CRM platform operated by Glintero LLC-FZ ("we," "us," "our," or "Company").
            </p>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              These Terms and Conditions ("Terms," "Agreement") govern your access to and use of MyAeroDeal, including our website at myaerodeal.com, web application, mobile applications, and all related services (collectively, the "Service").
            </p>
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: colors.error + '20', borderLeft: `4px solid ${colors.error}` }}>
              <p className="font-semibold" style={{ color: colors.textPrimary }}>
                By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
              </p>
            </div>
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: colors.secondary }}>
              <p className="font-semibold mb-2" style={{ color: colors.textPrimary }}>Legal Entity:</p>
              <p style={{ color: colors.textSecondary }}>Glintero LLC-FZ</p>
              <p style={{ color: colors.textSecondary }}>Meydan Grandstand 6th Floor, Meydan Road, Nad Al Sheba, Dubai, UAE</p>
              <p style={{ color: colors.textSecondary }}>Email: legal@myaerodeal.com</p>
              <p style={{ color: colors.textSecondary }}>Support: support@myaerodeal.com</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>2. Definitions</h2>
            <ul className="space-y-2 mb-4" style={{ color: colors.textSecondary }}>
              <li><strong>"Account"</strong> means your registered user account on MyAeroDeal.</li>
              <li><strong>"Company Account"</strong> means an organizational account that may have multiple User seats.</li>
              <li><strong>"Content"</strong> means any data, information, text, graphics, images, or other materials uploaded, posted, or stored through the Service.</li>
              <li><strong>"User Content"</strong> means Content that you upload, submit, or transmit through the Service.</li>
              <li><strong>"Subscription"</strong> means your paid access to the Service under a selected pricing plan.</li>
              <li><strong>"Service"</strong> means the MyAeroDeal CRM platform and all associated features and functionality.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>3. Eligibility</h2>
            <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>3.1 Age Requirement</h3>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you are at least 18 years old.
            </p>
            <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>3.2 Authority</h3>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>4. Account Registration and Security</h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              To use the Service, you must:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: colors.textSecondary }}>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Not share your account credentials with others</li>
              <li>Immediately notify us of any unauthorized use of your account</li>
            </ul>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              You are responsible for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>5. Subscription Plans and Pricing</h2>
            <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>5.1 Free Trial</h3>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              We offer a 14-day free trial with the following terms:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: colors.textSecondary }}>
              <li>Available to new users only</li>
              <li>Limited to 14 days</li>
              <li>May have feature limitations</li>
              <li>Data retention: 30 days after trial expiration</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>5.2 Billing</h3>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              <strong>Payment Terms:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: colors.textSecondary }}>
              <li>Subscriptions are billed monthly in advance</li>
              <li>Payments are processed through Stripe</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>Prices are exclusive of applicable taxes</li>
              <li>Subscriptions automatically renew unless canceled</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>6. Use of the Service</h2>
            <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>6.1 License Grant</h3>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your internal business purposes.
            </p>

            <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>6.2 Restrictions</h3>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              You agree NOT to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: colors.textSecondary }}>
              <li>Use the Service for any illegal purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Upload viruses, malware, or harmful code</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Reverse engineer, decompile, or disassemble the Service</li>
              <li>Use the Service to compete with us</li>
              <li>Resell, sublicense, or transfer your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>7. User Content and Data</h2>
            <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>7.1 Ownership</h3>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              You retain all ownership rights to your User Content. You do not grant us any ownership rights to your Content.
            </p>

            <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>7.2 Your Responsibilities</h3>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              You are solely responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: colors.textSecondary }}>
              <li>The accuracy and legality of your User Content</li>
              <li>Ensuring you have rights to upload Content</li>
              <li>Compliance with data protection laws (GDPR, etc.)</li>
              <li>Obtaining necessary consents for personal data</li>
              <li>Backing up your Content (we recommend regular exports)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>8. Intellectual Property Rights</h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              All rights, title, and interest in the Service, including software, design, trademarks, logos, and documentation, remain our exclusive property.
            </p>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              "MyAeroDeal," our logo, and other marks are our trademarks. You may not use them without our prior written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>9. Warranties and Disclaimers</h2>
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: colors.secondary }}>
              <p className="font-semibold mb-2" style={{ color: colors.textPrimary }}>IMPORTANT DISCLAIMER:</p>
              <p style={{ color: colors.textSecondary }}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>10. Limitation of Liability</h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY SHALL NOT EXCEED THE FEES YOU PAID TO US IN THE 12 MONTHS BEFORE THE CLAIM AROSE, OR €100 (ONE HUNDRED EUROS), WHICHEVER IS GREATER.
            </p>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              These limitations do not apply to death or personal injury caused by our negligence, fraud, or liabilities that cannot be limited by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>11. Term and Termination</h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              You may terminate by canceling your subscription. We may terminate or suspend your access if you violate these Terms.
            </p>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              Upon termination, your right to use the Service immediately ceases. We will delete your data after the retention period (90 days).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>12. Governing Law</h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              These Terms are governed by the laws of the United Arab Emirates. For business users, disputes shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.
            </p>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              For EU consumers, nothing in this choice of law provision affects your rights under mandatory consumer protection laws of your country of residence.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>13. Contact Information</h2>
            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.secondary }}>
              <p className="mb-2" style={{ color: colors.textSecondary }}><strong>General Inquiries:</strong> support@myaerodeal.com</p>
              <p className="mb-2" style={{ color: colors.textSecondary }}><strong>Legal/Terms Questions:</strong> legal@myaerodeal.com</p>
              <p className="mb-2" style={{ color: colors.textSecondary }}><strong>Privacy Questions:</strong> privacy@myaerodeal.com</p>
              <p className="mt-3" style={{ color: colors.textSecondary }}>
                <strong>Mailing Address:</strong><br />
                Glintero LLC-FZ<br />
                Meydan Grandstand 6th Floor, Meydan Road, Nad Al Sheba, Dubai<br />
                UAE
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>14. Acknowledgment</h2>
            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.primary + '20', borderLeft: `4px solid ${colors.primary}` }}>
              <p className="font-semibold mb-2" style={{ color: colors.textPrimary }}>
                BY CLICKING "I ACCEPT," REGISTERING FOR AN ACCOUNT, OR USING THE SERVICE, YOU ACKNOWLEDGE THAT:
              </p>
              <ol className="list-decimal pl-6 space-y-1" style={{ color: colors.textSecondary }}>
                <li>You have read and understood these Terms</li>
                <li>You agree to be bound by these Terms</li>
                <li>You have the authority to enter into this Agreement</li>
                <li>You meet the eligibility requirements</li>
                <li>You understand your rights and obligations</li>
              </ol>
              <p className="mt-3 font-semibold" style={{ color: colors.textPrimary }}>
                If you do not agree to these Terms, you may not use the Service.
              </p>
            </div>
          </section>

          <div className="mt-12 pt-6 border-t" style={{ borderColor: colors.border, color: colors.textSecondary }}>
            <p className="text-sm">Document Version: 1.0</p>
            <p className="text-sm">Effective Date: November 16, 2025</p>
            <p className="text-sm">© 2025 Glintero LLC-FZ. All rights reserved.</p>
            <p className="text-sm">MyAeroDeal is a trademark of Glintero LLC-FZ.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
