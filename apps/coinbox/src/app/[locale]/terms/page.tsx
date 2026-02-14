'use client';

import { motion } from 'framer-motion';
import { FileText, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-secondary/10 py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
              <h2 className="text-3xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing CoinBox ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">2. Eligibility & Account Registration</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To use CoinBox, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Be at least 18 years of age with legal capacity</li>
                <li>Provide accurate and complete registration information</li>
                <li>Complete KYC verification (national ID, proof of address, selfie)</li>
                <li>Maintain account security and confidentiality</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">3. CoinBox Services</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">P2P Trading</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Create buy/sell offers for peer-to-peer cryptocurrency trading</li>
                <li>All trades protected by escrow system</li>
                <li>Transaction fees: 1% for Free tier, 0.5% for Premium, 0.25% for Enterprise</li>
                <li>Disputes must be raised within 14 days of trade</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Savings Jars</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Set savings goals with optional lock periods (1-12 months)</li>
                <li>Early withdrawal penalties apply (5-15% based on time remaining)</li>
                <li>Interest rates (if applicable) subject to change with 30 days' notice</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Wallet Services</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Multi-currency wallet (ZAR, USD, BTC, ETH)</li>
                <li>Deposits via bank transfer (EFT) or cryptocurrency transfer</li>
                <li>Withdrawals processed within 1-3 business days</li>
                <li>Minimum withdrawal: R100 (ZAR), $10 (USD), 0.001 BTC</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">4. Fees and Payments</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>All fees are in South African Rand (ZAR) unless otherwise stated</li>
                <li>Transaction fees deducted automatically from trade amount</li>
                <li>Deposit fees: Free for bank transfers, 1% for credit cards</li>
                <li>Withdrawal fees: R20 (EFT), 1% (crypto network fees apply)</li>
                <li>Monthly subscriptions: R99 (Premium), R299 (Enterprise)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">5. Prohibited Activities</h2>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                <p className="text-sm font-semibold mb-2">The following are strictly PROHIBITED:</p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Money Laundering:</strong> Structuring transactions to evade detection</li>
                <li><strong>Terrorist Financing:</strong> Using platform to fund illegal activities</li>
                <li><strong>Fraud:</strong> False advertising, chargebacks after receiving goods</li>
                <li><strong>Market Manipulation:</strong> Wash trading, pump and dump schemes</li>
                <li><strong>Multiple Accounts:</strong> Creating accounts to circumvent limits</li>
                <li><strong>Automated Trading:</strong> Bots or scripts without authorization</li>
                <li><strong>Harassment:</strong> Threatening, bullying, or abusing other users</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Violations result in immediate account suspension, fund seizure, and reporting to authorities.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">6. Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If a P2P trade dispute arises:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li>Report dispute within 14 days via "Open Dispute" button</li>
                <li>Provide evidence (payment proofs, screenshots, chat logs)</li>
                <li>Both parties present their case within 48 hours</li>
                <li>CoinBox mediator reviews evidence and makes decision within 7 days</li>
                <li>Decision is final and binding; funds released accordingly</li>
              </ol>
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Appeal:</strong> Available within 7 days if new evidence emerges (R500 appeal fee, refunded if successful).
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">7. Disclaimers & Limitations</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES. WE ARE NOT LIABLE FOR:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Cryptocurrency price volatility or market losses</li>
                <li>Third-party payment processor failures (Paystack)</li>
                <li>Network congestion or delayed transactions</li>
                <li>User disputes or counterparty non-performance</li>
                <li>Indirect, consequential, or punitive damages</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Maximum Liability:</strong> Fees paid to us in the 12 months prior to claim.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">8. Termination</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">By You</h3>
              <p className="text-muted-foreground leading-relaxed">
                Close your account anytime via Settings → Account → Close Account. Pending transactions must be completed first. Funds will be returned to your bank account within 5 business days.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">By Us</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may suspend or terminate your account immediately if:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>You violate these Terms</li>
                <li>KYC verification fails or documents are fraudulent</li>
                <li>Suspicious activity detected (money laundering, fraud)</li>
                <li>Required by law enforcement or regulator</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">9. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by the laws of South Africa. Disputes will be resolved through negotiation, then arbitration (AFSA), or South African courts.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">10. Contact Information</h2>
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
              Compliant with SA Consumer Protection Act, ECTA, POPIA, and Financial Intelligence Centre Act (FICA).
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
