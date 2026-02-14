'use client';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-secondary/10 py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
            <section>
              <h2 className="text-3xl font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Allied iMpact (Pty) Ltd operates CoinBox as part of our suite of digital platforms. We are committed to protecting your personal information and your right to privacy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Contact:</strong>{' '}
                <a href="mailto:privacy@alliedimpact.co.za" className="text-primary hover:underline">
                  privacy@alliedimpact.co.za
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Account & KYC Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Full name, email address, phone number</li>
                <li>Date of birth, national ID number (for KYC verification)</li>
                <li>Proof of address, government-issued ID documents</li>
                <li>Selfie for identity verification</li>
                <li>Bank account details (for withdrawals)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Transaction Data</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>P2P trades, wallet transactions, payment history</li>
                <li>Savings jar contributions and withdrawals</li>
                <li>Escrow transactions and dispute records</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Usage Data</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>IP address, device type, browser information</li>
                <li>Pages visited, features used, session duration</li>
                <li>Firebase Analytics data (anonymized)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Service Delivery:</strong> Process P2P transactions, manage savings jars, provide dispute resolution</li>
                <li><strong>KYC/AML Compliance:</strong> Verify identity, prevent money laundering, comply with financial regulations</li>
                <li><strong>Security:</strong> Detect fraud, prevent unauthorized access, monitor suspicious activity</li>
                <li><strong>Communication:</strong> Send transaction receipts, security alerts, account updates</li>
                <li><strong>Legal Compliance:</strong> Respond to legal requests, enforce Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">4. Data Sharing</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">We Share Information With:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Paystack:</strong> Payment processing (bank transfers, card payments)</li>
                <li><strong>Firebase (Google):</strong> Authentication, database, hosting</li>
                <li><strong>KYC Providers:</strong> Identity verification services</li>
                <li><strong>Law Enforcement:</strong> With valid legal requests for investigations</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">We Do NOT:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Sell your personal or financial information</li>
                <li>Share transaction details with advertisers</li>
                <li>Disclose your identity to other CoinBox users without consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">5. Data Retention</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-muted">
                  <thead className="bg-secondary/20">
                    <tr>
                      <th className="border border-muted px-4 py-2 text-left">Data Type</th>
                      <th className="border border-muted px-4 py-2 text-left">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr>
                      <td className="border border-muted px-4 py-2">Transaction Records</td>
                      <td className="border border-muted px-4 py-2">10 years (financial regulations)</td>
                    </tr>
                    <tr>
                      <td className="border border-muted px-4 py-2">KYC Documents</td>
                      <td className="border border-muted px-4 py-2">7 years after last transaction</td>
                    </tr>
                    <tr>
                      <td className="border border-muted px-4 py-2">Account Information</td>
                      <td className="border border-muted px-4 py-2">Active + 7 years after closure</td>
                    </tr>
                    <tr>
                      <td className="border border-muted px-4 py-2">Usage Logs</td>
                      <td className="border border-muted px-4 py-2">90 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">6. Data Security</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Encryption:</strong> TLS 1.3 for data in transit, AES-256 for data at rest</li>
                <li><strong>Authentication:</strong> JWT tokens, Firebase Authentication</li>
                <li><strong>Access Control:</strong> Role-based permissions, admin-only access to KYC data</li>
                <li><strong>Firestore Rules:</strong> 615 lines of security rules preventing unauthorized access</li>
                <li><strong>Escrow Protection:</strong> Funds held securely during P2P trades</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">7. Your Privacy Rights</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">GDPR Rights (EU Residents)</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Right to Access:</strong> Request copies of your data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate information</li>
                <li><strong>Right to Erasure:</strong> Request deletion (subject to legal retention)</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in machine-readable format</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">POPIA Rights (South African Residents)</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Access and correct personal information</li>
                <li>Object to processing (with valid reasons)</li>
                <li>Lodge complaints with Information Regulator</li>
              </ul>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Exercise Your Rights:</strong> Email{' '}
                  <a href="mailto:privacy@alliedimpact.co.za" className="text-primary hover:underline">
                    privacy@alliedimpact.co.za
                  </a>
                  . Response within 30 days (GDPR) or 21 days (POPIA).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">8. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies for authentication, preferences, and analytics. See our{' '}
                <Link href="/en/cookies" className="text-primary hover:underline">
                  Cookie Policy
                </Link>{' '}
                for full details.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                CoinBox is NOT intended for users under 18 years. We do not knowingly collect information from minors. If you believe a child has provided information, contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">10. Contact Us</h2>
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
                  POPIA Complaints: Information Regulator (South Africa) —{' '}
                  <a href="mailto:inforeg@justice.gov.za" className="text-primary hover:underline">
                    inforeg@justice.gov.za
                  </a>
                </p>
              </div>
            </section>
          </div>

          <div className="text-center mt-8 space-y-4">
            <p className="text-sm text-muted-foreground italic">
              This Privacy Policy is compliant with GDPR (EU Regulation 2016/679) and POPIA (South Africa Act 4 of 2013).
            </p>
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
