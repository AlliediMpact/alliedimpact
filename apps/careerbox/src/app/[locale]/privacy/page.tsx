'use client';

import { useParams } from 'next/navigation';
import { Shield, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Last updated: January 10, 2026</span>
          </div>
        </div>

        {/* Content */}
        <Card className="mb-8">
          <CardContent className="p-8 prose prose-green max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Allied Impact ("Company," "we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use CareerBox ("the Service").
              </p>
              <p className="text-gray-700">
                This Privacy Policy complies with the Protection of Personal Information Act (POPIA) of South Africa and the General Data Protection Regulation (GDPR) where applicable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-2">We collect the following personal information:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password, phone number</li>
                <li><strong>Profile Information:</strong> Work experience, education, skills, bio, location, profile picture</li>
                <li><strong>Company Information:</strong> Company name, size, industry, website, logo</li>
                <li><strong>Application Data:</strong> Resumes, cover letters, portfolio links</li>
                <li><strong>Communication Data:</strong> Messages, feedback, support requests</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Cookies:</strong> We use cookies and similar tracking technologies (see Cookie Policy below)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your personal information for the following purposes:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Service Delivery:</strong> To provide, maintain, and improve the Service</li>
                <li><strong>Matching:</strong> To match job seekers with relevant opportunities and employers with qualified candidates</li>
                <li><strong>Communication:</strong> To send notifications, updates, and respond to inquiries</li>
                <li><strong>Personalization:</strong> To customize your experience and provide relevant recommendations</li>
                <li><strong>Analytics:</strong> To analyze usage patterns and improve our Service</li>
                <li><strong>Security:</strong> To detect, prevent, and address technical issues and fraud</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
                <li><strong>Marketing:</strong> To send promotional materials (with your consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Legal Basis for Processing (GDPR)</h2>
              <p className="text-gray-700 mb-2">We process your personal data under the following legal bases:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Consent:</strong> You have given explicit consent for specific purposes</li>
                <li><strong>Contract:</strong> Processing is necessary to perform our contract with you</li>
                <li><strong>Legal Obligation:</strong> Processing is required to comply with the law</li>
                <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate interests (e.g., improving our Service)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">5.1 With Employers and Job Seekers</h3>
              <p className="text-gray-700 mb-4">
                When you apply for a job, your profile information, resume, and cover letter are shared with the employer. When employers post jobs, their company information is visible to job seekers.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">5.2 Service Providers</h3>
              <p className="text-gray-700 mb-4">
                We may share your information with third-party service providers who perform services on our behalf, such as hosting, analytics, email delivery, and payment processing. These providers are contractually obligated to protect your data.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">5.3 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">
                We may disclose your information if required by law or in response to valid requests by public authorities (e.g., a court or government agency).
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">5.4 Business Transfers</h3>
              <p className="text-gray-700">
                If we are involved in a merger, acquisition, or asset sale, your personal information may be transferred. We will provide notice before your data is transferred and becomes subject to a different Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="text-gray-700 mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                <li><strong>Deleted Accounts:</strong> Most data deleted within 30 days; some data retained for legal/security reasons</li>
                <li><strong>Application Data:</strong> Retained for 2 years after application or until you request deletion</li>
                <li><strong>Communication Data:</strong> Retained for 1 year or as required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Data Protection Rights</h2>
              <p className="text-gray-700 mb-4">Under POPIA and GDPR, you have the following rights:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Right to Access:</strong> Request copies of your personal data</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to Restrict Processing:</strong> Request limitation of how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Request transfer of your data to another organization</li>
                <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time (where processing is based on consent)</li>
                <li><strong>Right to Lodge a Complaint:</strong> Complain to the Information Regulator (South Africa) or your local data protection authority</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, please contact us at privacy@alliedimpact.co.za. We will respond within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
              <p className="text-gray-700 mb-2">Types of cookies we use:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the Service to function</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Track visits across websites to display relevant ads (with consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and maintained on computers located outside of your country where data protection laws may differ. We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p className="text-gray-700">
                We encourage you to review this Privacy Policy periodically for any changes. Changes are effective when posted on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 mb-2">
                If you have any questions about this Privacy Policy or wish to exercise your data protection rights, please contact us:
              </p>
              <ul className="list-none text-gray-700 space-y-1">
                <li><strong>Data Protection Officer:</strong> privacy@alliedimpact.co.za</li>
                <li><strong>Email:</strong> legal@alliedimpact.co.za</li>
                <li><strong>Phone:</strong> +27 (0) 11 123 4567</li>
                <li><strong>Address:</strong> 123 Business Street, Sandton, Johannesburg, 2196, South Africa</li>
              </ul>
              <p className="text-gray-700 mt-4">
                <strong>Information Regulator (South Africa):</strong><br />
                JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001<br />
                Email: inforeg@justice.gov.za
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
