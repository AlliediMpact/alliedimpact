'use client';
import { motion } from 'framer-motion';
import { Cookie, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-secondary/10 py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
              <h2 className="text-3xl font-bold mb-4">1. What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files stored on your device when you use CoinBox. They help us provide authentication, remember preferences, and analytics.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">2. Types of Cookies We Use</h2>

              <h3 className="text-2xl font-semibold mt-6 mb-4 text-primary">Essential Cookies (Always Active)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-muted">
                  <thead className="bg-primary/10">
                    <tr>
                      <th className="border border-muted px-4 py-2 text-left">Cookie</th>
                      <th className="border border-muted px-4 py-2 text-left">Purpose</th>
                      <th className="border border-muted px-4 py-2 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr>
                      <td className="border border-muted px-4 py-2 font-mono">__session</td>
                      <td className="border border-muted px-4 py-2">Authentication, session management</td>
                      <td className="border border-muted px-4 py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="border border-muted px-4 py-2 font-mono">csrf-token</td>
                      <td className="border border-muted px-4 py-2">Security protection</td>
                      <td className="border border-muted px-4 py-2">1 hour</td>
                    </tr>
                    <tr>
                      <td className="border border-muted px-4 py-2 font-mono">auth-token</td>
                      <td className="border border-muted px-4 py-2">JWT authentication</td>
                      <td className="border border-muted px-4 py-2">30 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Functional Cookies (Optional)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-muted">
                  <thead className="bg-secondary/20">
                    <tr>
                      <th className="border border-muted px-4 py-2 text-left">Cookie</th>
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
                      <td className="border border-muted px-4 py-2 font-mono">currency</td>
                      <td className="border border-muted px-4 py-2">Currency selection (ZAR/USD/BTC)</td>
                      <td className="border border-muted px-4 py-2">90 days</td>
                    </tr>
                    <tr>
                      <td className="border border-muted px-4 py-2 font-mono">theme</td>
                      <td className="border border-muted px-4 py-2">Dark/light mode</td>
                      <td className="border border-muted px-4 py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Analytics Cookies (Optional)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-muted">
                  <thead className="bg-secondary/20">
                    <tr>
                      <th className="border border-muted px-4 py-2 text-left">Cookie</th>
                      <th className="border border-muted px-4 py-2 text-left">Purpose</th>
                      <th className="border border-muted px-4 py-2 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr>
                      <td className="border border-muted px-4 py-2 font-mono">_ga</td>
                      <td className="border border-muted px-4 py-2">Google Analytics user tracking</td>
                      <td className="border border-muted px-4 py-2">2 years</td>
                    </tr>
                    <tr>
                      <td className="border border-muted px-4 py-2 font-mono">_gid</td>
                      <td className="border border-muted px-4 py-2">Google Analytics session tracking</td>
                      <td className="border border-muted px-4 py-2">24 hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Privacy:</strong> IP addresses anonymized, no PII collected, data is aggregated.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">3. Third-Party Cookies</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <strong>Firebase (Google):</strong> Authentication, database<br />
                  <span className="text-sm">Privacy: <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener">https://policies.google.com/privacy</a></span>
                </li>
                <li>
                  <strong>Paystack:</strong> Payment processing<br />
                  <span className="text-sm">Privacy: <a href="https://paystack.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener">https://paystack.com/privacy</a></span>
                </li>
                <li>
                  <strong>Sentry:</strong> Error monitoring<br />
                  <span className="text-sm">Privacy: <a href="https://sentry.io/privacy/" className="text-primary hover:underline" target="_blank" rel="noopener">https://sentry.io/privacy/</a></span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">4. Managing Cookies</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Cookie Consent Banner</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                On your first visit, you can choose to Accept All, Reject Non-Essential, or Customize your preferences.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Browser Settings</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Chrome:</strong> Settings → Privacy & Security → Cookies</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security</li>
                <li><strong>Safari:</strong> Preferences → Privacy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">5. Contact Us</h2>
              <p className="text-muted-foreground">
                Questions about cookies? Email{' '}
                <a href="mailto:privacy@alliedimpact.co.za" className="text-primary hover:underline">
                  privacy@alliedimpact.co.za
                </a>
              </p>
            </section>
          </div>

          <div className="text-center mt-8 space-y-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/en/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              <Link href="/en/terms" className="text-primary hover:underline">Terms of Service</Link>
            </div>
            <Link
              href="/en"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
