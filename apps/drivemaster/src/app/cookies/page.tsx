import { Calendar, Cookie } from 'lucide-react';
import Link from 'next/link';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-secondary/10 py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <Cookie className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
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
          <section>
            <h2 className="text-3xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Cookie Policy explains how Allied iMpact uses cookies and similar tracking technologies on our platforms. By using our Services, you consent to the use of cookies as described here. You can control cookie preferences through our consent banner or browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">2. What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, authenticate your identity, analyze usage, and improve performance.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Similar Technologies:</strong> Local Storage, Session Storage, Web Beacons, Device Fingerprinting.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">3. Types of Cookies We Use</h2>

            <h3 className="text-2xl font-semibold mt-6 mb-4 text-primary">Essential Cookies (Always Active)</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies are necessary for the Platform to function and cannot be disabled.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-muted">
                <thead className="bg-primary/10">
                  <tr>
                    <th className="border border-muted px-4 py-2 text-left">Cookie Name</th>
                    <th className="border border-muted px-4 py-2 text-left">Purpose</th>
                    <th className="border border-muted px-4 py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr>
                    <td className="border border-muted px-4 py-2 font-mono">__session</td>
                    <td className="border border-muted px-4 py-2">User authentication, session management</td>
                    <td className="border border-muted px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-muted px-4 py-2 font-mono">csrf-token</td>
                    <td className="border border-muted px-4 py-2">Cross-Site Request Forgery protection</td>
                    <td className="border border-muted px-4 py-2">1 hour</td>
                  </tr>
                  <tr>
                    <td className="border border-muted px-4 py-2 font-mono">auth-token</td>
                    <td className="border border-muted px-4 py-2">JWT authentication token</td>
                    <td className="border border-muted px-4 py-2">30 days</td>
                  </tr>
                  <tr>
                    <td className="border border-muted px-4 py-2 font-mono">cookie-consent</td>
                    <td className="border border-muted px-4 py-2">Remembers your cookie preferences</td>
                    <td className="border border-muted px-4 py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Functional Cookies (Optional)</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies enhance functionality and personalization.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-muted">
                <thead className="bg-secondary/20">
                  <tr>
                    <th className="border border-muted px-4 py-2 text-left">Cookie Name</th>
                    <th className="border border-muted px-4 py-2 text-left">Purpose</th>
                    <th className="border border-muted px-4 py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr>
                    <td className="border border-muted px-4 py-2 font-mono">language</td>
                    <td className="border border-muted px-4 py-2">Language preference (EN/ZU/AF)</td>
                    <td className="border border-muted px-4 py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-muted px-4 py-2 font-mono">theme</td>
                    <td className="border border-muted px-4 py-2">Dark/light mode preference</td>
                    <td className="border border-muted px-4 py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-muted px-4 py-2 font-mono">currency</td>
                    <td className="border border-muted px-4 py-2">Currency selection (ZAR/USD/EUR)</td>
                    <td className="border border-muted px-4 py-2">90 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-2xl font-semibold mt-8 mb-4">Analytics Cookies (Optional)</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies help us understand how visitors use our Platform.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-muted">
                <thead className="bg-secondary/20">
                  <tr>
                    <th className="border border-muted px-4 py-2 text-left">Cookie Name</th>
                    <th className="border border-muted px-4 py-2 text-left">Purpose</th>
                    <th className="border border-muted px-4 py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr>
                    <td className="border border-muted px-4 py-2 font-mono">_ga</td>
                    <td className="border border-muted px-4 py-2">Distinguishes users (Google Analytics)</td>
                    <td className="border border-muted px-4 py-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-muted px-4 py-2 font-mono">_gid</td>
                    <td className="border border-muted px-4 py-2">Distinguishes users</td>
                    <td className="border border-muted px-4 py-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Privacy Protection:</strong> IP addresses are anonymized (last octet removed). No personally identifiable information (PII) is collected. Data is aggregated and statistical.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">4. Third-Party Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our Platform uses services from trusted third parties:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <strong>Firebase (Google):</strong> Authentication, database,analytics<br />
                <span className="text-sm">Privacy: <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener">https://policies.google.com/privacy</a></span>
              </li>
              <li>
                <strong>Paystack:</strong> Payment processing (CoinBox only)<br />
                <span className="text-sm">Privacy: <a href="https://paystack.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener">https://paystack.com/privacy</a></span>
              </li>
              <li>
                <strong>Sentry:</strong> Error monitoring<br />
                <span className="text-sm">Privacy: <a href="https://sentry.io/privacy/" className="text-primary hover:underline" target="_blank" rel="noopener">https://sentry.io/privacy/</a></span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">5. How to Manage Cookies</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">Cookie Consent Banner</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              On your first visit, you'll see a cookie consent banner with options:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Accept All:</strong> Enable all cookies (essential, functional, analytics, performance)</li>
              <li><strong>Reject Non-Essential:</strong> Only essential cookies (authentication, security)</li>
              <li><strong>Customize:</strong> Choose which cookie categories to accept</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Browser Settings</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can control cookies directly in your browser:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Chrome:</strong> Settings → Privacy & Security → Cookies</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4 italic">
              Note: Blocking essential cookies will prevent you from logging in or using the Platform.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Do Not Track (DNT)</h3>
            <p className="text-muted-foreground leading-relaxed">
              We respect "Do Not Track" browser signals. When DNT is enabled, we will not set analytics or performance cookies.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">6. Legal Basis (GDPR/POPIA)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Essential Cookies:</strong> No consent required (necessary for service delivery)<br />
              <strong>Non-Essential Cookies:</strong> Explicit consent required before setting cookies
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Your Rights:</strong> Withdraw consent anytime, access cookie data, request erasure, lodge complaints with supervisory authorities.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">7. Updates to This Cookie Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy to reflect new cookies or technologies, changes in legal requirements, or service improvements. Changes will be posted with an updated "Last Updated" date. Material changes will receive 30 days' email notice.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">8. Contact Us</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong>Questions about cookies?</strong><br />
                Allied iMpact (Pty) Ltd<br />
                Email:{' '}
                <a href="mailto:privacy@alliedimpact.co.za" className="text-primary hover:underline">
                  privacy@alliedimpact.co.za
                </a>
              </p>
            </div>
          </section>
        </div>

        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-muted-foreground italic">
            This Cookie Policy complies with GDPR (EU Regulation 2016/679), POPIA (South Africa Act 4 of 2013), and ePrivacy Directive (2002/58/EC).
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </div>
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
