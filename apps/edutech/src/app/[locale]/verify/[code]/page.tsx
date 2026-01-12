'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Award, Calendar, User, BookOpen } from 'lucide-react';

interface VerificationResult {
  valid: boolean;
  certificate?: {
    certificateId: string;
    userName: string;
    courseTitle: string;
    completedAt: string;
    verificationCode: string;
  };
  error?: string;
}

export default function VerifyPage({
  params,
}: {
  params: { locale: string; code: string };
}) {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        // Call Cloud Function to verify certificate
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/verifyCertificate?code=${params.code}`
        );

        const data = await response.json();
        setResult(data);
        setLoading(false);
      } catch (error) {
        console.error('Error verifying certificate:', error);
        setResult({
          valid: false,
          error: 'Failed to verify certificate. Please try again later.',
        });
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [params.code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-blue mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Failed to verify certificate</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container max-w-2xl">
        <div className="text-center mb-8">
          <Award className="h-16 w-16 text-primary-blue mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Certificate Verification</h1>
          <p className="text-lg text-muted-foreground">
            Verify the authenticity of Allied iMpact EduTech certificates
          </p>
        </div>

        {result.valid && result.certificate ? (
          <div className="bg-white border-2 border-green-500 rounded-xl p-8 shadow-lg">
            {/* Success Header */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-700">Verified Certificate</h2>
                <p className="text-sm text-green-600">This certificate is authentic</p>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="space-y-4 bg-muted/30 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Learner Name</p>
                  <p className="text-lg font-semibold">{result.certificate.userName}</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-start space-x-3">
                <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Course Title</p>
                  <p className="text-lg font-semibold">{result.certificate.courseTitle}</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Completion Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(result.certificate.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-start space-x-3">
                <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Verification Code
                  </p>
                  <p className="text-lg font-mono font-semibold">
                    {result.certificate.verificationCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                This certificate was issued by Allied iMpact EduTech and is officially
                recognized.
              </p>
              <a
                href={`/${params.locale}/certificates/${result.certificate.certificateId}`}
                className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 font-semibold"
              >
                View Full Certificate
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-red-500 rounded-xl p-8 shadow-lg">
            {/* Error Header */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-700">Invalid Certificate</h2>
                <p className="text-sm text-red-600">This certificate could not be verified</p>
              </div>
            </div>

            {/* Error Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <p className="text-red-800">
                {result.error || 'The verification code provided does not match any certificate in our system.'}
              </p>
            </div>

            {/* Verification Code */}
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                Verification code attempted:
              </p>
              <p className="font-mono text-lg font-semibold">{params.code}</p>
            </div>

            {/* Possible Reasons */}
            <div className="bg-muted/30 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-3">Possible reasons:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>The verification code was entered incorrectly</li>
                <li>The certificate has been revoked or expired</li>
                <li>The certificate is not from Allied iMpact EduTech</li>
                <li>The QR code or link may be damaged or corrupted</li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                If you believe this is an error, please contact our support team.
              </p>
              <a
                href={`/${params.locale}/contact`}
                className="inline-block px-6 py-3 border border-primary-blue text-primary-blue rounded-lg hover:bg-primary-blue/5 font-semibold"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 All certificates are digitally signed and verified through our secure system
          </p>
        </div>
      </div>
    </div>
  );
}
