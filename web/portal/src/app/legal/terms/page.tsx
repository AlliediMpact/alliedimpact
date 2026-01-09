'use client';

import { FileText, Calendar, Mail } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  const lastUpdated = 'January 15, 2024';

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary/30 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-background rounded-xl border-2 border-muted p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Allied iMpact's platform and services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access our Services.
            </p>
          </section>

          {/* Use of Services */}
          <section>
            <h2 className="text-2xl font-bold mb-4">2. Use of Services</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong>2.1 Eligibility:</strong> You must be at least 18 years old to use our Services. By using our Services, you represent and warrant that you meet this age requirement.
              </p>
              <p>
                <strong>2.2 Account Registration:</strong> To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                <strong>2.3 Account Security:</strong> You are responsible for safeguarding your account credentials and for any activities or actions under your account. You must immediately notify us of any unauthorized use of your account.
              </p>
            </div>
          </section>

          {/* Products and Services */}
          <section>
            <h2 className="text-2xl font-bold mb-4">3. Products and Services</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Allied iMpact provides access to multiple products and services including, but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Coin Box:</strong> A peer-to-peer financial platform for managing transactions and savings</li>
                <li><strong>My Projects:</strong> A project management and collaboration tool</li>
                <li><strong>uMkhanyakude:</strong> An educational platform for community development</li>
                <li><strong>Drive Master:</strong> A driver training and education platform (coming soon)</li>
                <li><strong>Code Tech:</strong> A coding education platform (coming soon)</li>
                <li><strong>Cup Final:</strong> A sports management platform (coming soon)</li>
              </ul>
              <p className="mt-4">
                Each product may have additional terms specific to that service, which you agree to comply with when using that product.
              </p>
            </div>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-2xl font-bold mb-4">4. User Conduct</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Services for any illegal purpose or in violation of any laws</li>
                <li>Violate or infringe upon the rights of others, including privacy and intellectual property rights</li>
                <li>Transmit any harmful code, viruses, or malicious software</li>
                <li>Attempt to gain unauthorized access to any part of the Services</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use automated systems or bots without our express permission</li>
                <li>Interfere with or disrupt the Services or servers</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong>5.1 Our Content:</strong> All content, features, and functionality of the Services, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are owned by Allied iMpact and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                <strong>5.2 Your Content:</strong> You retain ownership of any content you submit to the Services. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content solely for the purpose of providing and improving our Services.
              </p>
            </div>
          </section>

          {/* Payment and Billing */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Payment and Billing</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong>6.1 Free Services:</strong> Many of our Services are currently offered free of charge. We reserve the right to introduce paid features or subscriptions in the future with prior notice.
              </p>
              <p>
                <strong>6.2 Paid Features:</strong> For any paid features, you agree to pay all fees and charges according to the pricing and payment terms presented to you for that service.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Termination</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We may terminate or suspend your account and access to the Services immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Services will immediately cease.
              </p>
              <p>
                You may also terminate your account at any time through your account settings or by contacting us.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Allied iMpact shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of or inability to use the Services.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Services are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied. We do not warrant that the Services will be uninterrupted, secure, or error-free.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Services after such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of South Africa, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
            <div className="p-6 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="flex items-center gap-2 text-primary">
                <Mail className="h-5 w-5" />
                <a href="mailto:legal@alliedimpact.com" className="hover:underline">
                  legal@alliedimpact.com
                </a>
              </div>
            </div>
          </section>

          {/* Related Links */}
          <div className="pt-8 border-t-2 border-muted">
            <h3 className="text-lg font-semibold mb-4">Related Policies</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/legal/privacy"
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Privacy Policy
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
