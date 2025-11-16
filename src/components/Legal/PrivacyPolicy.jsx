import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react';
import logoLight from '../../assets/MyAeroDeal_light.png';
import logoDark from '../../assets/MyAeroDeal_dark.png';

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>Privacy Policy</h1>
          <p className="text-sm mb-8" style={{ color: colors.textSecondary }}>Last Updated: November 16, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>1. Introduction</h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              Welcome to MyAeroDeal ("we," "our," or "us"). We are committed to protecting your personal data and respecting your privacy rights. This Privacy Policy explains how Glintero LLC-FZ collects, uses, shares, and protects your personal information when you use our business jet sales and acquisition CRM platform available at myaerodeal.com (the "Service").
            </p>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              This Privacy Policy applies to all users of MyAeroDeal, including free trial users, subscribers, and visitors to our website.
            </p>
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: colors.secondary }}>
              <p className="font-semibold mb-2" style={{ color: colors.textPrimary }}>Data Controller:</p>
              <p style={{ color: colors.textSecondary }}>Glintero LLC-FZ</p>
              <p style={{ color: colors.textSecondary }}>Meydan Grandstand 6th Floor, Meydan Road, Nad Al Sheba, Dubai, UAE</p>
              <p style={{ color: colors.textSecondary }}>Email: privacy@myaerodeal.com</p>
              <p style={{ color: colors.textSecondary }}>Phone: +971 4 330 1528</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>2. Legal Basis for Processing (GDPR)</h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              We process your personal data based on the following legal grounds under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2" style={{ color: colors.textSecondary }}>
              <li><strong>Contract Performance:</strong> Processing is necessary for the performance of our contract with you (Article 6(1)(b) GDPR)</li>
              <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests (Article 6(1)(f) GDPR)</li>
              <li><strong>Legal Obligation:</strong> Processing is necessary to comply with legal obligations (Article 6(1)(c) GDPR)</li>
              <li><strong>Consent:</strong> Where you have given explicit consent for specific processing activities (Article 6(1)(a) GDPR)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>3. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>3.1 Information You Provide Directly</h3>
            <p className="mb-3" style={{ color: colors.textSecondary }}><strong>Account Information:</strong></p>
            <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: colors.textSecondary }}>
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Company name and details</li>
              <li>Job title and role</li>
              <li>Billing information (processed by our payment provider)</li>
              <li>Profile photograph (optional)</li>
            </ul>

            <p className="mb-3" style={{ color: colors.textSecondary }}><strong>CRM Data You Input:</strong></p>
            <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: colors.textSecondary }}>
              <li>Lead information (names, companies, contact details, preferences)</li>
              <li>Aircraft details (specifications, pricing, locations)</li>
              <li>Deal information (values, closing dates, statuses)</li>
              <li>Task and calendar data</li>
              <li>Notes and communications</li>
              <li>File uploads (specifications, documents)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3" style={{ color: colors.textPrimary }}>3.2 Information Collected Automatically</h3>
            <p className="mb-3" style={{ color: colors.textSecondary }}><strong>Technical Information:</strong></p>
            <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: colors.textSecondary }}>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Operating system</li>
              <li>Time zone and locale settings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>4. How We Use Your Information</h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2" style={{ color: colors.textSecondary }}>
              <li><strong>Service Provision:</strong> Creating and managing your account, providing access to CRM features, storing and syncing your data</li>
              <li><strong>Communication:</strong> Sending transactional emails, responding to support requests, providing important service updates</li>
              <li><strong>Service Improvement:</strong> Analyzing usage patterns to improve features, conducting research and development</li>
              <li><strong>Legal and Security:</strong> Preventing fraud and abuse, enforcing our Terms and Conditions, complying with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>5. Data Sharing and Disclosure</h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              We do not sell your personal data. We share your information only with trusted third-party service providers:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: colors.textSecondary }}>
              <li><strong>Supabase:</strong> Database and authentication (USA)</li>
              <li><strong>Vercel:</strong> Hosting (USA)</li>
              <li><strong>Stripe:</strong> Payment processing (USA/EU, PCI DSS compliant)</li>
              <li><strong>Anthropic:</strong> AI assistant features (USA)</li>
            </ul>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              All service providers are bound by data processing agreements and must comply with GDPR requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>6. Your Rights Under GDPR</h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              As a data subject in the EU/EEA, you have the following rights:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2" style={{ color: colors.textSecondary }}>
              <li><strong>Right to Access:</strong> You can request a copy of all personal data we hold about you</li>
              <li><strong>Right to Rectification:</strong> You can request correction of inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> You can request deletion of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> You can request that we limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> You can request your data in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> You can object to processing based on legitimate interests or for direct marketing</li>
              <li><strong>Right to Lodge a Complaint:</strong> You can lodge a complaint with your local data protection authority</li>
            </ul>
            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.secondary }}>
              <p className="font-semibold mb-2" style={{ color: colors.textPrimary }}>How to Exercise Your Rights:</p>
              <p style={{ color: colors.textSecondary }}>Email: privacy@myaerodeal.com</p>
              <p style={{ color: colors.textSecondary }}>Subject: GDPR Rights Request</p>
              <p style={{ color: colors.textSecondary }}>We will respond to your request within 30 days.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>7. Data Security</h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: colors.textSecondary }}>
              <li>AES-256 encryption at rest</li>
              <li>TLS 1.3 encryption in transit</li>
              <li>Regular security audits</li>
              <li>Multi-factor authentication (MFA)</li>
              <li>Role-based access control (RBAC)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>8. Contact Us</h2>
            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.secondary }}>
              <p className="mb-2" style={{ color: colors.textSecondary }}><strong>For Privacy-Related Inquiries:</strong></p>
              <p style={{ color: colors.textSecondary }}>Email: privacy@myaerodeal.com</p>
              <p style={{ color: colors.textSecondary }}>Data Protection Officer: dpo@myaerodeal.com</p>
              <p className="mt-3" style={{ color: colors.textSecondary }}>
                <strong>Postal Address:</strong><br />
                Glintero LLC-FZ<br />
                Meydan Grandstand 6th Floor, Meydan Road, Nad Al Sheba, Dubai<br />
                United Arab Emirates
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>9. Acceptance</h2>
            <p style={{ color: colors.textSecondary }}>
              By using MyAeroDeal, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
            </p>
          </section>

          <div className="mt-12 pt-6 border-t" style={{ borderColor: colors.border, color: colors.textSecondary }}>
            <p className="text-sm">Document Version: 1.0</p>
            <p className="text-sm">Effective Date: November 16, 2025</p>
            <p className="text-sm">© 2025 Glintero LLC-FZ. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
