import { Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-secondary/10 py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
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
            <h2 className="text-3xl font-bold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing our digital platforms (CoinBox, DriveMaster, EduTech, CareerBox, MyProjects, SportsHub, ControlHub, Portal), you agree to be bound by these Terms. If you do not agree, do not use the Services.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Registered Office:</strong> South Africa<br />
              <strong>Contact:</strong>{' '}
              <a href="mailto:legal@alliedimpact.co.za" className="text-primary hover:underline">
                legal@alliedimpact.co.za
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You must be at least 18 years old to use most Services (EduTech users aged 13-17 may use with parental consent). You represent that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>You have legal capacity to enter binding contracts</li>
              <li>All registration information you provide is accurate</li>
              <li>You are not prohibited from using the Services under applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">3. Account Registration & Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To use certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Provide accurate, complete registration information</li>
              <li>Maintain and update your information</li>
              <li>Keep your password secure and confidential</li>
              <li>Be responsible for all activities under your account</li>
              <li>Notify us immediately of unauthorized use: security@alliedimpact.co.za</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>KYC Verification (CoinBox):</strong> For financial services, you must complete identity verification. Failure to complete KYC limits account functionality.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">4. Fees and Payments</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Current fees are listed on each Service's pricing page. Key terms:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>All fees are in South African Rand (ZAR) unless otherwise stated</li>
              <li>Payments processed via Paystack (credit card, debit card, EFT)</li>
              <li>Subscription fees billed in advance (monthly/annually)</li>
              <li>We may change fees with 30 days' notice</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Refund Policy</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Digital Products:</strong> No refunds after access/download (per Consumer Protection Act exceptions)</li>
              <li><strong>Subscription Services:</strong> Pro-rated refunds at our discretion</li>
              <li><strong>CoinBox Transactions:</strong> Refunds only via dispute resolution process</li>
              <li><strong>Cancellations:</strong> Cancel subscriptions anytime; access until period end</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">5. Intellectual Property Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All Platform content (text, graphics, logos, code) is owned by Allied iMpact or our licensors and protected by copyright, trademark, and trade secret laws.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">You May NOT:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Copy, modify, or distribute our content without permission</li>
              <li>Reverse engineer or decompile our software</li>
              <li>Remove copyright notices or watermarks</li>
              <li>Use our trademarks without authorization</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">User-Generated Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of content you create but grant us a worldwide, non-exclusive, royalty-free license to host, store, reproduce, and display your content to provide Services.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">6. Prohibited Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Violate any local, national, or international laws</li>
              <li>Engage in fraud, money laundering, or illegal activities</li>
              <li>Use bots, scrapers, or automated tools without permission</li>
              <li>Attempt to gain unauthorized access (hacking, phishing)</li>
              <li>Post illegal, harmful, or offensive content</li>
              <li>Harass, bully, or threaten other users</li>
              <li>Spam users with unsolicited marketing</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Consequences</h3>
            <p className="text-muted-foreground leading-relaxed">
              Violations may result in content removal, account suspension/termination, forfeiture of paid fees (no refund), legal action, and reporting to authorities.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">7. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our Platform integrates with third-party services: Firebase (Google), Paystack, SendGrid, Google Gemini AI. We are not responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Third-party service availability or performance</li>
              <li>Third-party privacy practices (see their policies)</li>
              <li>Losses from third-party service failures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">8. Disclaimers & Limitations</h2>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
              <p className="text-sm font-semibold mb-2">THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES</p>
              <p className="text-sm text-muted-foreground">
                We do not guarantee platform availability, accuracy of content, achievement of specific results, or security against all threats.
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Limitation of Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, ALLIED IMPACT SHALL NOT BE LIABLE FOR indirect, incidental, special, or consequential damages, or damages exceeding fees paid to us in the 12 months prior to claim.
            </p>

            <p className="text-sm text-muted-foreground mt-4 italic">
              Note: Nothing in these Terms limits your rights under the South African Consumer Protection Act (CPA), including the right to safe, good quality services.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">9. Termination</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">By You</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may close your account anytime via account settings or by emailing support@alliedimpact.co.za. You remain liable for outstanding fees.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">By Us</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may suspend or terminate your account immediately if:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>You violate these Terms</li>
              <li>You engage in fraudulent or illegal activity</li>
              <li>Required by law or regulatory request</li>
              <li>We discontinue the Services (with 30 days' notice)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Effect of Termination</h3>
            <p className="text-muted-foreground leading-relaxed">
              Upon termination, your access ceases immediately. We may delete your data after 90 days (unless legally required to retain). You lose access to paid subscriptions (no refunds for violations).
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">10. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Governing Law:</strong> These Terms are governed by the laws of South Africa.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Negotiation:</strong> For any dispute, contact legal@alliedimpact.co.za. We will attempt resolution through good-faith negotiation within 30 days.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Arbitration/Litigation:</strong> If negotiation fails, disputes may be submitted to AFSA (Arbitration Foundation of Southern Africa) or resolved in South African courts.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms at any time. Changes will be posted with an updated "Last Updated" date. Material changes will receive 30 days' email notice. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">12. Contact Information</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong>Allied iMpact (Pty) Ltd</strong><br />
                Email:{' '}
                <a href="mailto:legal@alliedimpact.co.za" className="text-primary hover:underline">
                  legal@alliedimpact.co.za
                </a><br />
                Support:{' '}
                <a href="mailto:support@alliedimpact.co.za" className="text-primary hover:underline">
                  support@alliedimpact.co.za
                </a>
              </p>
            </div>
          </section>
        </div>

        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-muted-foreground italic">
            These Terms comply with the South African Consumer Protection Act (CPA), Electronic Communications and Transactions Act (ECTA), and Protection of Personal Information Act (POPIA).
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
