'use client';

import { useParams } from 'next/navigation';
import { FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Last updated: January 10, 2026</span>
          </div>
        </div>

        {/* Content */}
        <Card className="mb-8">
          <CardContent className="p-8 prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using CareerBox ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-700">
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Allied Impact ("Company," "we," "us," or "our"), concerning your access to and use of the CareerBox platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily access the materials (information or software) on CareerBox for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial)</li>
                <li>Attempt to decompile or reverse engineer any software contained on CareerBox</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
              <p className="text-gray-700 mb-4">
                To use certain features of the Service, you must register for an account. When you register, you must provide accurate and complete information. You are solely responsible for the activity that occurs on your account, and you must keep your account password secure.
              </p>
              <p className="text-gray-700">
                You must notify us immediately of any breach of security or unauthorized use of your account. We will not be liable for any losses caused by any unauthorized use of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Content</h2>
              <p className="text-gray-700 mb-4">
                Users may post, upload, or otherwise contribute content to the Service ("User Content"). You retain ownership of any intellectual property rights that you hold in that content. By posting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display that content in connection with the Service.
              </p>
              <p className="text-gray-700">
                You are responsible for the User Content that you post to the Service, including its legality, reliability, and appropriateness. You represent and warrant that you own or have the necessary rights to post the User Content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">
                You may not access or use the Service for any purpose other than that for which we make the Service available. The Service may not be used in connection with any commercial endeavors except those specifically endorsed or approved by us.
              </p>
              <p className="text-gray-700 mb-2">As a user of the Service, you agree not to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Systematically retrieve data or other content from the Service to create or compile a collection, database, or directory</li>
                <li>Make improper use of our support services or submit false reports of abuse or misconduct</li>
                <li>Use the Service in a manner inconsistent with any applicable laws or regulations</li>
                <li>Engage in unauthorized framing of or linking to the Service</li>
                <li>Upload or transmit viruses, Trojan horses, or other malicious material</li>
                <li>Engage in any automated use of the system, such as using scripts or bots</li>
                <li>Harass, annoy, intimidate, or threaten any of our employees or agents</li>
                <li>Attempt to impersonate another user or person</li>
                <li>Use any information obtained from the Service to harass, abuse, or harm another person</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Job Listings and Applications</h2>
              <p className="text-gray-700 mb-4">
                <strong>For Employers:</strong> You represent and warrant that all job listings you post are accurate, lawful, and comply with all applicable employment laws. You agree not to discriminate based on race, color, religion, sex, national origin, age, disability, or any other protected characteristic.
              </p>
              <p className="text-gray-700">
                <strong>For Job Seekers:</strong> You represent and warrant that all information provided in your profile and applications is accurate and truthful. Misrepresentation of qualifications or experience may result in immediate termination of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy, which outlines how we collect, use, and protect your personal information.
              </p>
              <p className="text-gray-700">
                We comply with the Protection of Personal Information Act (POPIA) and take appropriate measures to protect your personal data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property Rights</h2>
              <p className="text-gray-700 mb-4">
                The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of Allied Impact and its licensors. The Service is protected by copyright, trademark, and other laws of both South Africa and foreign countries.
              </p>
              <p className="text-gray-700">
                Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Allied Impact.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall Allied Impact, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use or alteration of your transmissions or content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="text-gray-700">
                If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed and construed in accordance with the laws of South Africa, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of South Africa.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              <p className="text-gray-700">
                By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 mb-2">
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-none text-gray-700 space-y-1">
                <li>Email: legal@alliedimpact.co.za</li>
                <li>Phone: +27 (0) 11 123 4567</li>
                <li>Address: 123 Business Street, Sandton, Johannesburg, 2196, South Africa</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
