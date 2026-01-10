'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Building2,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  AlertCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface Application {
  id: string;
  listingId: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'accepted' | 'withdrawn';
  appliedDate: string;
  lastUpdate: string;
  coverLetter: string;
  resumeUrl: string;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';

  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      // TODO: Call API to fetch applications
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      setApplications([
        {
          id: 'app-1',
          listingId: 'listing-456',
          jobTitle: 'Senior Software Engineer',
          companyName: 'TechCorp Solutions',
          status: 'interview',
          appliedDate: '2026-01-05',
          lastUpdate: '2026-01-08',
          coverLetter: 'I am excited to apply for...',
          resumeUrl: '/resumes/resume.pdf',
        },
        {
          id: 'app-2',
          listingId: 'listing-789',
          jobTitle: 'Full Stack Developer',
          companyName: 'Innovate Digital',
          status: 'reviewed',
          appliedDate: '2026-01-03',
          lastUpdate: '2026-01-04',
          coverLetter: 'With over 5 years of experience...',
          resumeUrl: '/resumes/resume.pdf',
        },
        {
          id: 'app-3',
          listingId: 'listing-123',
          jobTitle: 'Frontend Developer',
          companyName: 'Creative Studios',
          status: 'rejected',
          appliedDate: '2025-12-28',
          lastUpdate: '2026-01-02',
          coverLetter: 'I am passionate about...',
          resumeUrl: '/resumes/resume.pdf',
        },
        {
          id: 'app-4',
          listingId: 'listing-321',
          jobTitle: 'React Developer',
          companyName: 'StartUp Inc',
          status: 'pending',
          appliedDate: '2026-01-09',
          lastUpdate: '2026-01-09',
          coverLetter: 'Your job posting caught my attention...',
          resumeUrl: '/resumes/resume.pdf',
        },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Application['status']) => {
    const variants: Record<Application['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' }> = {
      pending: { label: 'Pending Review', variant: 'secondary' },
      reviewed: { label: 'Reviewed', variant: 'default' },
      interview: { label: 'Interview Stage', variant: 'warning' },
      rejected: { label: 'Not Selected', variant: 'destructive' },
      accepted: { label: 'Offer Received', variant: 'success' },
      withdrawn: { label: 'Withdrawn', variant: 'secondary' },
    };

    return variants[status];
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'reviewed':
        return <Eye className="h-4 w-4" />;
      case 'interview':
        return <AlertCircle className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'withdrawn':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleWithdraw = (applicationId: string) => {
    if (confirm('Are you sure you want to withdraw this application?')) {
      // TODO: API call to withdraw application
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: 'withdrawn' as const } : app
        )
      );
    }
  };

  const handleViewDetails = (listingId: string) => {
    router.push(`/${locale}/dashboard/individual/matches/${listingId}`);
  };

  const filteredApplications = filterStatus === 'all'
    ? applications
    : applications.filter(app => app.status === filterStatus);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <LoadingSkeleton variant="text" width="200px" height="32px" className="mb-6" />
          <div className="space-y-4">
            <LoadingSkeleton variant="card" height="120px" count={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">
            Track all your job applications in one place
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({applications.length})
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                Pending ({applications.filter(a => a.status === 'pending').length})
              </Button>
              <Button
                variant={filterStatus === 'reviewed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('reviewed')}
              >
                Reviewed ({applications.filter(a => a.status === 'reviewed').length})
              </Button>
              <Button
                variant={filterStatus === 'interview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('interview')}
              >
                Interview ({applications.filter(a => a.status === 'interview').length})
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('rejected')}
              >
                Rejected ({applications.filter(a => a.status === 'rejected').length})
              </Button>
              <Button
                variant={filterStatus === 'accepted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('accepted')}
              >
                Accepted ({applications.filter(a => a.status === 'accepted').length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            description="Start applying to jobs to see your applications here"
            action={{ label: "Browse Matches", onClick: () => router.push(`/${locale}/dashboard/individual/matches`) }}
          />
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const statusInfo = getStatusBadge(application.status);
              
              return (
                <Card key={application.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Company Logo */}
                        <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {application.companyName.charAt(0)}
                        </div>

                        {/* Application Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                                {application.jobTitle}
                              </h3>
                              <p className="text-gray-600 flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {application.companyName}
                              </p>
                            </div>
                            <Badge 
                              variant={statusInfo.variant}
                              className="flex items-center gap-1"
                            >
                              {getStatusIcon(application.status)}
                              {statusInfo.label}
                            </Badge>
                          </div>

                          {/* Dates */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Applied: {new Date(application.appliedDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Updated: {new Date(application.lastUpdate).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(application.listingId)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Job
                            </Button>
                            
                            {application.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWithdraw(application.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Withdraw
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
