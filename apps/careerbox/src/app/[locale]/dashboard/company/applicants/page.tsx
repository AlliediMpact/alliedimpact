'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  Calendar,
  MapPin,
  Briefcase,
  CheckCircle,
  XCircle,
  Eye,
  MessageCircle,
  AlertCircle,
  Download,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface Applicant {
  id: string;
  applicantName: string;
  applicantEmail: string;
  position: string;
  appliedDate: string;
  status: 'new' | 'reviewed' | 'interview' | 'rejected' | 'accepted';
  matchScore: number;
  experience: string;
  location: string;
  resumeUrl: string;
  coverLetter: string;
}

export default function ApplicantsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';

  const [isLoading, setIsLoading] = useState(true);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      // TODO: Call API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      setApplicants([
        {
          id: 'app-1',
          applicantName: 'Sarah Johnson',
          applicantEmail: 'sarah.j@email.com',
          position: 'Senior Software Engineer',
          appliedDate: '2026-01-10',
          status: 'new',
          matchScore: 94,
          experience: '5+ years',
          location: 'Johannesburg, GP',
          resumeUrl: '/resumes/sarah.pdf',
          coverLetter: 'I am excited to apply...',
        },
        {
          id: 'app-2',
          applicantName: 'Michael Chen',
          applicantEmail: 'michael.c@email.com',
          position: 'Senior Software Engineer',
          appliedDate: '2026-01-10',
          status: 'new',
          matchScore: 91,
          experience: '6 years',
          location: 'Pretoria, GP',
          resumeUrl: '/resumes/michael.pdf',
          coverLetter: 'With extensive experience...',
        },
        {
          id: 'app-3',
          applicantName: 'Jessica Williams',
          applicantEmail: 'jessica.w@email.com',
          position: 'Full Stack Developer',
          appliedDate: '2026-01-09',
          status: 'reviewed',
          matchScore: 87,
          experience: '4 years',
          location: 'Cape Town, WC',
          resumeUrl: '/resumes/jessica.pdf',
          coverLetter: 'I have been following your company...',
        },
        {
          id: 'app-4',
          applicantName: 'David Brown',
          applicantEmail: 'david.b@email.com',
          position: 'Full Stack Developer',
          appliedDate: '2026-01-09',
          status: 'interview',
          matchScore: 89,
          experience: '5 years',
          location: 'Cape Town, WC',
          resumeUrl: '/resumes/david.pdf',
          coverLetter: 'Your posting aligns perfectly...',
        },
        {
          id: 'app-5',
          applicantName: 'Emma Davis',
          applicantEmail: 'emma.d@email.com',
          position: 'Frontend Developer',
          appliedDate: '2026-01-08',
          status: 'reviewed',
          matchScore: 85,
          experience: '3 years',
          location: 'Johannesburg, GP',
          resumeUrl: '/resumes/emma.pdf',
          coverLetter: 'As a passionate frontend developer...',
        },
        {
          id: 'app-6',
          applicantName: 'James Wilson',
          applicantEmail: 'james.w@email.com',
          position: 'Senior Software Engineer',
          appliedDate: '2026-01-07',
          status: 'rejected',
          matchScore: 72,
          experience: '3 years',
          location: 'Durban, KZN',
          resumeUrl: '/resumes/james.pdf',
          coverLetter: 'I would like to join...',
        },
        {
          id: 'app-7',
          applicantName: 'Sophia Martinez',
          applicantEmail: 'sophia.m@email.com',
          position: 'Frontend Developer',
          appliedDate: '2026-01-06',
          status: 'accepted',
          matchScore: 92,
          experience: '4 years',
          location: 'Johannesburg, GP',
          resumeUrl: '/resumes/sophia.pdf',
          coverLetter: 'I am thrilled to apply...',
        },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: Applicant['status']) => {
    const configs = {
      new: { label: 'New', variant: 'default' as const, icon: AlertCircle },
      reviewed: { label: 'Reviewed', variant: 'secondary' as const, icon: Eye },
      interview: { label: 'Interview', variant: 'warning' as const, icon: Calendar },
      rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
      accepted: { label: 'Accepted', variant: 'success' as const, icon: CheckCircle },
    };
    return configs[status];
  };

  const handleStatusChange = (applicantId: string, newStatus: Applicant['status']) => {
    // TODO: API call
    setApplicants(prev =>
      prev.map(app => (app.id === applicantId ? { ...app, status: newStatus } : app))
    );
  };

  const handleViewProfile = (applicantId: string) => {
    router.push(`/${locale}/dashboard/company/applicants/${applicantId}`);
  };

  const handleSendMessage = (applicantEmail: string) => {
    router.push(`/${locale}/dashboard/company/messages?to=${applicantEmail}`);
  };

  const filteredApplicants = applicants
    .filter(app => {
      const matchesSearch =
        searchQuery === '' ||
        app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.position.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      } else {
        return b.matchScore - a.matchScore;
      }
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <LoadingSkeleton variant="text" width="200px" height="32px" className="mb-6" />
          <LoadingSkeleton variant="card" height="120px" count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Applicants</h1>
          <p className="text-gray-600">Manage all job applications</p>
        </div>

        {/* Filters & Search */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by name or position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All ({applicants.length})
                </Button>
                <Button
                  variant={filterStatus === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('new')}
                >
                  New ({applicants.filter(a => a.status === 'new').length})
                </Button>
                <Button
                  variant={filterStatus === 'reviewed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('reviewed')}
                >
                  Reviewed ({applicants.filter(a => a.status === 'reviewed').length})
                </Button>
                <Button
                  variant={filterStatus === 'interview' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('interview')}
                >
                  Interview ({applicants.filter(a => a.status === 'interview').length})
                </Button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Match Score</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Applicants List */}
        {filteredApplicants.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No applicants found"
            description={searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'No applications received yet'}
          />
        ) : (
          <div className="space-y-4">
            {filteredApplicants.map((applicant) => {
              const statusConfig = getStatusConfig(applicant.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={applicant.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-6">{" "}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Avatar */}
                        <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {applicant.applicantName.charAt(0)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {applicant.applicantName}
                              </h3>
                              <p className="text-gray-600 flex items-center gap-2 text-sm">
                                <Briefcase className="h-4 w-4" />
                                Applied for: {applicant.position}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                  {applicant.matchScore}%
                                </div>
                                <p className="text-xs text-gray-600">Match</p>
                              </div>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {applicant.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {applicant.experience}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewProfile(applicant.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendMessage(applicant.applicantEmail)}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message
                            </Button>

                            {/* Status Actions */}
                            {applicant.status === 'new' && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleStatusChange(applicant.id, 'interview')}
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Schedule Interview
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(applicant.id, 'rejected')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}

                            {applicant.status === 'interview' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleStatusChange(applicant.id, 'accepted')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Send Offer
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
