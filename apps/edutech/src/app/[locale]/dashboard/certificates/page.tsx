'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Award, Download, Eye, Calendar, ExternalLink, Share2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { Certificate } from '@/types';

function CertificatesContent({ params }: { params: { locale: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const certificatesRef = collection(db, 'edutech_certificates');
        const q = query(
          certificatesRef,
          where('userId', '==', user.uid),
          orderBy('issuedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const certificatesData = querySnapshot.docs.map(
          (doc) =>
            ({
              certificateId: doc.id,
              ...doc.data(),
            } as Certificate)
        );

        setCertificates(certificatesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  const handleView = (certificateId: string) => {
    router.push(`/${params.locale}/certificates/${certificateId}`);
  };

  const handleDownload = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  const handleShare = async (certificate: Certificate) => {
    const url = `${window.location.origin}/${params.locale}/certificates/${certificate.certificateId}`;
    const text = `I've earned a certificate for completing ${certificate.courseTitle}!`;

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
      navigator.clipboard.writeText(url);
      alert('Certificate link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your certificates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Certificates</h1>
        <p className="text-lg text-muted-foreground">
          View and download your earned certificates
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-8 w-8 text-yellow-600" />
            <span className="text-3xl font-bold text-yellow-700">
              {certificates.length}
            </span>
          </div>
          <p className="font-semibold text-yellow-900">Total Certificates</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-green-600" />
            <span className="text-3xl font-bold text-green-700">
              {certificates.filter(
                (c) =>
                  new Date(c.issuedAt).getMonth() === new Date().getMonth() &&
                  new Date(c.issuedAt).getFullYear() === new Date().getFullYear()
              ).length}
            </span>
          </div>
          <p className="font-semibold text-green-900">This Month</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-primary-blue/10 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <ExternalLink className="h-8 w-8 text-primary-blue" />
            <span className="text-3xl font-bold text-primary-blue">
              {certificates.length}
            </span>
          </div>
          <p className="font-semibold text-blue-900">Shareable Links</p>
        </div>
      </div>

      {/* Certificates Grid */}
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => {
            const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={certificate.certificateId}
                className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Certificate Preview */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white relative">
                  <div className="absolute top-4 right-4">
                    <Award className="h-8 w-8 opacity-50" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs opacity-80">CERTIFICATE OF COMPLETION</p>
                    <h3 className="font-bold text-lg line-clamp-2">
                      {certificate.courseTitle}
                    </h3>
                    <p className="text-sm opacity-90">{certificate.learnerName}</p>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>Issued {issuedDate}</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Verification Code</p>
                    <p className="font-mono text-sm font-semibold">
                      {certificate.verificationCode}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(certificate.certificateId)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-blue text-white text-sm rounded-lg hover:bg-primary-blue/90"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>

                    {certificate.pdfUrl && (
                      <button
                        onClick={() => handleDownload(certificate.pdfUrl!)}
                        className="flex items-center justify-center p-2 border rounded-lg hover:bg-muted"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleShare(certificate)}
                      className="flex items-center justify-center p-2 border rounded-lg hover:bg-muted"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Award className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No certificates yet</h2>
          <p className="text-muted-foreground mb-6">
            Complete courses to earn certificates and showcase your skills
          </p>
          <button
            onClick={() => router.push(`/${params.locale}/courses`)}
            className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90"
          >
            Browse Courses
          </button>
        </div>
      )}
    </div>
  );
}

export default function CertificatesPage({ params }: { params: { locale: string } }) {
  return (
    <ProtectedRoute>
      <CertificatesContent params={params} />
    </ProtectedRoute>
  );
}
