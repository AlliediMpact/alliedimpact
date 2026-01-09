'use client';

import { Shield, Calendar, Mail, Lock, Eye, Database, Globe } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const lastUpdated = 'January 15, 2024';

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary/30 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-background rounded-xl border-2 border-muted p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Our Commitment to Your Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              At Allied iMpact, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services. Please read this policy carefully to understand our practices regarding your personal data.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <div>
                <h3 className="font-semibold text-foreground mb-2">1.1 Information You Provide</h3>
                <p className="mb-2">We collect information that you voluntarily provide when you:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Create an account (name, email address, password)</li>
                  <li>Update your profile (display name, profile photo, bio)</li>
                  <li>Use our services (project data, financial transactions, educational progress)</li>
                  <li>Contact us for support</li>
                  <li>Participate in surveys or promotional activities</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">1.2 Information Collected Automatically</h3>
                <p className="mb-2">When you use our Services, we may automatically collect:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device information (browser type, operating system, device identifiers)</li>
                  <li>Usage data (pages visited, features used, time spent)</li>
                  <li>IP address and location data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">1.3 Information from Third Parties</h3>
                <p>We may receive information about you from third-party services if you choose to connect your account with them, such as social media platforms or authentication providers.</p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>We use the collected information for various purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Provide and maintain our Services:</strong> To operate and deliver the features you request</li>
                <li><strong>Improve our Services:</strong> To understand how users interact with our platform and enhance user experience</li>
                <li><strong>Personalization:</strong> To customize content and features based on your preferences</li>
                <li><strong>Communication:</strong> To send you updates, notifications, and respond to your inquiries</li>
                <li><strong>Security:</strong> To protect against fraud, abuse, and unauthorized access</li>
                <li><strong>Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
                <li><strong>Analytics:</strong> To analyze trends and gather demographic information</li>
              </ul>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">3. How We Share Your Information</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">3.1 With Your Consent</h3>
                <p>We may share your information when you explicitly consent to such sharing.</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3.2 Service Providers</h3>
                <p>We may share information with third-party service providers who perform services on our behalf, such as:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Cloud hosting services (Firebase, Google Cloud)</li>
                  <li>Analytics providers</li>
                  <li>Email delivery services</li>
                  <li>Payment processors (for paid features)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3.3 Legal Requirements</h3>
                <p>We may disclose your information if required by law, court order, or governmental request, or when we believe disclosure is necessary to protect our rights or comply with legal obligations.</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3.4 Business Transfers</h3>
                <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">4. Data Security</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>We implement appropriate technical and organizational security measures to protect your personal information, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data storage with Firebase and Google Cloud</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold mb-4">5. Your Privacy Rights</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Opt-out of marketing communications at any time</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where consent is the legal basis</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately so we can delete such information.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-bold mb-4">8. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws different from those in your country. By using our Services, you consent to the transfer of your information to our facilities and service providers worldwide.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Cookies and Tracking Technologies</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>We use cookies and similar tracking technologies to enhance your experience. These help us:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our Services</li>
                <li>Improve our Services and develop new features</li>
                <li>Provide personalized content</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. For more information, please see our{' '}
                <Link href="/legal/cookies" className="text-primary hover:underline">
                  Cookie Policy
                </Link>.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
            <div className="p-6 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Mail className="h-5 w-5" />
                  <a href="mailto:privacy@alliedimpact.com" className="hover:underline">
                    privacy@alliedimpact.com
                  </a>
                </div>
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
                href="/legal/cookies"
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
