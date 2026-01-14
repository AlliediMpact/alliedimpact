'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CertificateService, Certificate } from '@/lib/services/CertificateService';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';
import { CertificateShare } from '@/components/SocialShare';
import '@/styles/print.css';

export default function VerifyCertificatePage() {
  const params = useParams();
  const certificateNumber = params.certificateNumber as string;

  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    verifyCertificate();
  }, [certificateNumber]);

  const verifyCertificate = async () => {
    setLoading(true);
    try {
      const certificateService = new CertificateService();
      const result = await certificateService.verifyCertificate(certificateNumber);
      setValid(result.valid);
      setCertificate(result.certificate);
    } catch (error) {
      console.error('Error verifying certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!valid || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2 text-red-600">Certificate Not Found</h2>
          <p className="text-gray-600 mb-6">
            Certificate number <strong>{certificateNumber}</strong> could not be verified.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              This certificate may be invalid or does not exist in our system.
            </p>
            <Link href="/">
              <Button className="w-full">Go to Homepage</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Banner */}
        <div className="bg-green-500 text-white rounded-lg shadow-lg p-6 mb-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold mb-2">Certificate Verified</h1>
          <p className="text-green-100">
            This certificate is valid and authentic.
          </p>
        </div>

        {/* Certificate Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Certificate Details</h2>

          <div className="space-y-4">
            <DetailRow label="Certificate Number" value={certificate.certificateNumber} highlight />
            <DetailRow label="Recipient" value={certificate.userName} />
            <DetailRow
              label="Stage Completed"
              value={certificate.stage.charAt(0).toUpperCase() + certificate.stage.slice(1)}
            />
            <DetailRow label="Score Achieved" value={`${certificate.score}%`} />
            <DetailRow
              label="Completion Date"
              value={new Date(certificate.completionDate).toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
            <DetailRow
              label="Issued On"
              value={new Date(certificate.createdAt).toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
          </div>

          {/* Download, Share, and Print Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center no-print">
            <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full md:w-auto">
                📄 View Certificate PDF
              </Button>
            </a>
            
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              🖨️ Print Certificate
            </button>
            
            <CertificateShare
              certificateNumber={certificate.certificateNumber}
              stageName={certificate.stage.charAt(0).toUpperCase() + certificate.stage.slice(1)}
              userName={certificate.userName}
            />
          </div>
        </div>

        {/* Disclaimers */}
        <div className="bg-yellow-50 rounded-lg p-6 mb-8">
          <h3 className="font-bold mb-3 text-yellow-800">Important Disclaimers</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              1. This certificate is for educational purposes only and does not replace official K53
              learner's or driver's license testing.
            </p>
            <p>
              2. DriveMaster is a learning platform and is not affiliated with or endorsed by any
              official licensing authority.
            </p>
            <p>
              3. Passing all stages on DriveMaster does not guarantee passing the official license
              test.
            </p>
            <p>
              4. Users must still complete all legal requirements to obtain an official driver's
              license in South Africa.
            </p>
          </div>
        </div>

        {/* About DriveMaster */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h3 className="font-bold mb-2">About DriveMaster</h3>
          <p className="text-sm text-gray-600 mb-4">
            DriveMaster is South Africa's premier K53 learning platform, helping thousands of
            learners prepare for their driver's license through interactive, journey-based
            education.
          </p>
          <Link href="/">
            <Button variant="secondary">Visit DriveMaster</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200">
      <span className="font-semibold text-gray-700">{label}:</span>
      <span className={highlight ? 'font-bold text-primary-600 text-lg' : 'text-gray-900'}>
        {value}
      </span>
    </div>
  );
}
