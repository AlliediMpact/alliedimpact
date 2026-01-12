'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Download, Share2, Award, CheckCircle, Calendar, Clock } from 'lucide-react';
import type { Certificate } from '@/types';

interface CertificateViewProps {
  params: {
    locale: string;
    certificateId: string;
  };
}

export default function CertificatePage({ params }: CertificateViewProps) {
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const certificateRef = doc(db, 'edutech_certificates', params.certificateId);
        const certificateDoc = await getDoc(certificateRef);

        if (!certificateDoc.exists()) {
          setError('Certificate not found');
          setLoading(false);
          return;
        }

        const certificateData = {
          certificateId: certificateDoc.id,
          ...certificateDoc.data(),
        } as Certificate;

        // Check if user owns this certificate (or allow public viewing)
        // For now, allowing public viewing for verification purposes
        setCertificate(certificateData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching certificate:', err);
        setError('Failed to load certificate');
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [params.certificateId]);

  const handleDownload = () => {
    if (certificate?.pdfUrl) {
      window.open(certificate.pdfUrl, '_blank');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `I've earned a certificate for completing ${certificate?.courseTitle}!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Certificate',
          text,
          url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4" />
          <p className="text-muted-foreground">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{error || 'Certificate not found'}</h1>
          <p className="text-muted-foreground mb-6">
            This certificate may have been removed or the link is invalid.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const completedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
            <Award className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Certificate of Completion</h1>
          <p className="text-lg text-muted-foreground">
            Awarded by Allied iMpact EduTech
          </p>
        </div>

        {/* Certificate Preview */}
        <div className="max-w-4xl mx-auto">
          {/* Actions Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Verified Certificate</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-muted"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Certificate Card */}
          <div className="bg-white border-4 border-primary-blue rounded-xl p-12 shadow-2xl">
            <div className="border-2 border-primary-blue/30 rounded-lg p-8">
              {/* Certificate Content */}
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-primary-blue">
                  CERTIFICATE OF COMPLETION
                </h2>

                <div className="space-y-2">
                  <p className="text-muted-foreground">This certifies that</p>
                  <h3 className="text-4xl font-bold">{certificate.learnerName}</h3>
                  <div className="h-px bg-primary-blue/30 w-2/3 mx-auto" />
                </div>

                <p className="text-muted-foreground">
                  has successfully completed the course
                </p>

                <h4 className="text-2xl font-bold text-primary-blue">
                  {certificate.courseTitle}
                </h4>

                {certificate.totalHours && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {certificate.totalHours} hours</span>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Completed on {completedDate}</span>
                </div>

                {/* Verification Code */}
                <div className="pt-8">
                  <p className="text-xs text-muted-foreground mb-2">
                    Verification Code
                  </p>
                  <p className="font-mono text-sm font-semibold">
                    {certificate.verificationCode}
                  </p>
                </div>

                {/* QR Code would go here */}
                <div className="pt-4">
                  <div className="inline-block p-4 bg-muted rounded-lg">
                    <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      QR Code
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Scan to verify authenticity
                  </p>
                </div>

                {/* Signatures */}
                <div className="pt-12 flex justify-between items-end">
                  <div className="text-left">
                    {certificate.instructorName && (
                      <>
                        <div className="h-px bg-black w-32 mb-2" />
                        <p className="text-sm font-medium">{certificate.instructorName}</p>
                        <p className="text-xs text-muted-foreground">Course Instructor</p>
                      </>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="h-px bg-black w-32 mb-2 ml-auto" />
                    <p className="text-sm font-bold text-primary-blue">Allied iMpact</p>
                    <p className="text-xs text-muted-foreground">Education Platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="mt-8 bg-white border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Certificate Details</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Certificate ID</dt>
                <dd className="text-sm font-mono mt-1">{certificate.certificateId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Issued Date</dt>
                <dd className="text-sm mt-1">{completedDate}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Learner</dt>
                <dd className="text-sm mt-1">{certificate.learnerName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Course</dt>
                <dd className="text-sm mt-1">{certificate.courseTitle}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Verification Code
                </dt>
                <dd className="text-sm font-mono mt-1">{certificate.verificationCode}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="text-sm mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Share on LinkedIn */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold mb-1">Share your achievement!</h3>
                <p className="text-sm text-muted-foreground">
                  Let your network know about your new skills
                </p>
              </div>
              <button
                onClick={handleShareLinkedIn}
                className="px-6 py-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] font-semibold"
              >
                Share on LinkedIn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
