import { Calendar, Mail, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-secondary/10 py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Effective: February 25, 2026</span>
            </div>
            <span>•</span>
            <span>Last Updated: February 13, 2026</span>
          </div>
        </div>

        <div className="bg-background rounded-xl border-2 border-muted shadow-xl p-6 md:p-10 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-3xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Allied iMpact (Pty) Ltd operates a suite of digital platforms including CoinBox, DriveMaster, EduTech, CareerBox, MyProjects, SportsHub, ControlHub, and our main Portal. We are committed to protecting your personal information and your right to privacy.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Contact:</strong>{' '}
              <a href="mailto:privacy@alliedimpact.co.za" className="text-primary hover:underline">
                privacy@alliedimpact.co.za
              </a>
            </p>
          </section>

          {/* Information Collection */}
          <section>
            <h2 className="text-3xl font-bold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Account Information</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Full name, email address, phone number</li>
              <li>Date of birth, national ID (for KYC verification)</li>
              <li>Profile photos and biographical information</li>
              <li>Payment information (processed securely by Paystack)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Usage Data</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>IP address, browser type, operating system</li>
              <li>Pages visited, time spent, clickpatterns</li>
              <li>Firebase Analytics data (anonymized)</li>
              <li>Device identifiers, geolocation (with consent)</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-3xl font-bold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Service Delivery:</strong> Create and manage your account, process transactions, provide customer support</li>
              <li><strong>Security:</strong> Verify identity (KYC/AML compliance), prevent fraud, protect user safety</li>
              <li><strong>Improvement:</strong> Analyze usage patterns, conduct R&D, test new features</li>
              <li><strong>Communication:</strong> Send transactional emails, security alerts, product updates</li>
              <li><strong>Legal Compliance:</strong> Comply with legal obligations, enforce Terms of Service</li>
            </ul>
          </section>

          {/* Legal Basis (GDPR/POPIA) */}
          <section>
            <h2 className="text-3xl font-bold mb-4">4. Legal Basis (GDPR/POPIA)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We process your personal information under the following legal bases:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Consent:</strong> You have given explicit consent (e.g., marketing emails)</li>
              <li><strong>Contract Performance:</strong> Necessary to provide Services (e.g., transactions)</li>
              <li><strong>Legal Obligation:</strong> Required by law (e.g., KYC/AML regulations)</li>
              <li><strong>Legitimate Interest:</strong> Necessary for business operations (e.g., fraud prevention)</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-3xl font-bold mb-4">5. Data Sharing</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">We Share Information With:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Firebase (Google):</strong> Authentication, database, hosting</li>
              <li><strong>Paystack:</strong> Payment processing</li>
              <li><strong>Sentry:</strong> Error monitoring (sensitive data filtered)</li>
              <li><strong>SendGrid:</strong> Email delivery</li>
              <li><strong>Law enforcement:</strong> With valid legal requests</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">We Do NOT:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Sell your personal information to third parties</li>
              <li>Share your data for third-party advertising</li>
              <li>Use your financial information beyond transaction processing</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-3xl font-bold mb-4">6. Data Retention</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-muted">
                <thead className="bg-secondary/20">
                  <tr>
                    <th className="border border-muted px-4 py-2 text-left">Data Type</th>
                    <th className="border border-muted px-4 py-2 text-left">Retention Period</th>
                    <th className="border border-muted px-4 py-2 text-left">Reason</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr>
                    <td className="border border-muted px-4 py-2">Account Information</td>
                    <td className="border border-muted px-4 py-2">Active + 7 years</td>
                    <td className="border border-muted px-4 py-2">Legal compliance</td>
                  </tr>
                  <tr>
                    <td className="border border-muted px-4 py-2">Transaction Records</td>
                    <td className="border border-muted px-4 py-2">10 years</td>
                    <td className="border border-muted px-4 py-2">Financial regulations</td>
                  </tr>
                  <tr>
                    <td className="border border-muted px-4 py-2">KYC Documents</td>
                    <td className="border border-muted px-4 py-2">7 years</td>
                    <td className="border border-muted px-4 py-2">AML/CFT compliance</td>
                  </tr>
                  <tr>
                    <td className="border border-muted px-4 py-2">Usage Logs</td>
                    <td className="border border-muted px-4 py-2">90 days</td>
                    <td className="border border-muted px-4 py-2">Security monitoring</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-3xl font-bold mb-4">7. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We employ industry-standard security measures:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Encryption:</strong> TLS 1.3 for data in transit, AES-256 for data at rest</li>
              <li><strong>Authentication:</strong> JWT tokens, Firebase Authentication</li>
              <li><strong>Access Control:</strong> Role-based permissions (Admin, Support, User)</li>
              <li><strong>Monitoring:</strong> Real-time error tracking, security audits</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-3xl font-bold mb-4">8. Your Privacy Rights</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">GDPR Rights (EU Residents)</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Right to Access:</strong> Request copies of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate information</li>
                <li><strong>Right to Erasure:</strong> Request deletion ("right to be forgotten")</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in machine-readable format</li>
              <li><strong>Right to Object:</strong> Oppose processing based on legitimate interests</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">POPIA Rights (South African Residents)</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Access and correct your personal information</li>
              <li>Object to processing (with valid reasons)</li>
              <li>Request erasure of personal information</li>
              <li>Lodge complaints with the Information Regulator (CIPC)</li>
            </ul>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <strong>Exercise Your Rights:</strong> Email{' '}
                <a href="mailto:privacy@alliedimpact.co.za" className="text-primary hover:underline">
                  privacy@alliedimpact.co.za
                </a>
                . We will respond within 30 days (GDPR) or 21 days (POPIA).
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-3xl font-bold mb-4">9. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use cookies for authentication, preferences, and analytics. Types include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Essential:</strong> Authentication, security (cannot be disabled)</li>
              <li><strong>Functional:</strong> Language, theme preferences (1 year)</li>
              <li><strong>Analytics:</strong> Firebase Analytics (anonymized, 2 years)</li>
              <li><strong>Performance:</strong> Sentry error tracking (session)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              See our{' '}
              <Link href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </Link>{' '}
              for full details.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-3xl font-bold mb-4">10. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Services use Firebase (Google Cloud Platform) with data centers globally. Your data may be transferred to the European Union, United States, and South Africa. We ensure adequate safeguards through Standard Contractual Clauses (SCCs) and GDPR/POPIA compliance commitments.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-3xl font-bold mb-4">11. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Services are NOT intended for users under 18 years (except EduTech with parental consent). We delete accounts if we discover underage users. If you believe a child has provided personal information, contact us immediately.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-3xl font-bold mb-4">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically. Changes will be posted with an updated "Last Updated" date. Material changes will be sent via email with 30 days' notice. Continued use after changes constitutes acceptance.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-3xl font-bold mb-4">13. Contact Us</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong>Data Protection Officer:</strong><br />
                Allied iMpact (Pty) Ltd<br />
                Email:{' '}
                <a href="mailto:privacy@alliedimpact.co.za" className="text-primary hover:underline">
                  privacy@alliedimpact.co.za
                </a>
              </p>
              <p className="mt-4">
                <strong>Supervisory Authorities:</strong><br />
                GDPR Complaints: Your local Data Protection Authority<br />
                POPIA Complaints: Information Regulator (South Africa) —{' '}
                <a href="mailto:inforeg@justice.gov.za" className="text-primary hover:underline">
                  inforeg@justice.gov.za
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-muted-foreground italic">
            This Privacy Policy is compliant with GDPR (EU Regulation 2016/679) and POPIA (South Africa Act 4 of 2013).
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
