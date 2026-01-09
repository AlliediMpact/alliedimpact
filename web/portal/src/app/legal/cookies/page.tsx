'use client';

import { Cookie, Calendar, Mail, Settings, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CookiesPage() {
  const lastUpdated = 'January 15, 2024';
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false,
  });

  const handleSavePreferences = () => {
    // TODO: Implement saving cookie preferences to local storage or backend
    alert('Cookie preferences saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary/30 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <Cookie className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-background rounded-xl border-2 border-muted p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, understanding how you use our services, and improving our platform. This Cookie Policy explains what cookies are, how we use them, and how you can manage your cookie preferences.
            </p>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>
            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="p-6 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <h3 className="text-xl font-bold">Necessary Cookies</h3>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm rounded-full whitespace-nowrap">
                    Always Active
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Examples:</strong> Authentication cookies, session management, security tokens
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="p-6 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-xl font-bold">Functional Cookies</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences, language settings, and customization options.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Examples:</strong> Language preferences, theme settings, user interface customization
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="p-6 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <h3 className="text-xl font-bold">Analytics Cookies</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our services and user experience.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Examples:</strong> Google Analytics, page views, session duration, bounce rate
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="p-6 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    <h3 className="text-xl font-bold">Marketing Cookies</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  These cookies are used to deliver advertisements that are relevant to you and your interests. They also help measure the effectiveness of marketing campaigns.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Examples:</strong> Advertising networks, retargeting pixels, conversion tracking
                </p>
              </div>
            </div>

            {/* Save Preferences Button */}
            <div className="mt-6">
              <button
                onClick={handleSavePreferences}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Save Cookie Preferences
              </button>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We may also use third-party services that set cookies on your device. These services include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Google Analytics:</strong> To analyze website traffic and user behavior</li>
                <li><strong>Firebase:</strong> For authentication and database services</li>
                <li><strong>Google Cloud:</strong> For hosting and infrastructure services</li>
              </ul>
              <p className="mt-4">
                These third parties have their own privacy policies and cookie policies. We recommend reviewing their policies to understand how they use cookies.
              </p>
            </div>
          </section>

          {/* Managing Cookies */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Managing Your Cookie Preferences</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>You can manage your cookie preferences in several ways:</p>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">1. Cookie Preference Tool</h3>
                <p>Use the cookie preference toggles above to enable or disable specific types of cookies (except necessary cookies).</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">2. Browser Settings</h3>
                <p className="mb-2">Most web browsers allow you to control cookies through their settings. You can:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>View what cookies are stored and delete them individually</li>
                  <li>Block third-party cookies</li>
                  <li>Block all cookies from specific websites</li>
                  <li>Delete all cookies when you close your browser</li>
                </ul>
                <p className="mt-2 text-sm">
                  Note: Blocking or deleting cookies may impact your experience on our website and prevent you from accessing certain features.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Browser-Specific Instructions</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookie Duration */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Cookie Duration</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>We use both session cookies and persistent cookies:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Session Cookies:</strong> These are temporary cookies that expire when you close your browser. They help us maintain your session as you navigate through our website.
                </li>
                <li>
                  <strong>Persistent Cookies:</strong> These remain on your device for a set period or until you delete them. They help us remember your preferences and settings across multiple visits.
                </li>
              </ul>
            </div>
          </section>

          {/* Do Not Track */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Do Not Track Signals</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked. Currently, there is no uniform standard for recognizing and responding to DNT signals. As such, we do not respond to DNT browser signals at this time.
            </p>
          </section>

          {/* Updates to Policy */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on this page and updating the "Last updated" date.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Questions About Cookies?</h2>
            <div className="p-6 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground mb-4">
                If you have any questions about our use of cookies, please contact us:
              </p>
              <div className="flex items-center gap-2 text-primary">
                <Mail className="h-5 w-5" />
                <a href="mailto:privacy@alliedimpact.com" className="hover:underline">
                  privacy@alliedimpact.com
                </a>
              </div>
            </div>
          </section>

          {/* Related Links */}
          <div className="pt-8 border-t-2 border-muted">
            <h3 className="text-lg font-semibold mb-4">Related Policies</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/legal/terms"
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/legal/privacy"
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
