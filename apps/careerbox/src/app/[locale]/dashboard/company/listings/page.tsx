'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Briefcase,
  Plus,
  Edit,
  Pause,
  Play,
  Trash2,
  MoreVertical,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useToastHelpers } from '@/components/ui/toast';

interface JobListing {
  id: string;
  title: string;
  employmentType: string;
  location: {
    city: string;
    province: string;
    remote: string;
  };
  salary: {
    min: number;
    max: number;
  };
  status: 'active' | 'paused' | 'closed';
  postedDate: string;
  applicantsCount: number;
  viewsCount: number;
}

export default function ListingsManagementPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { success: showSuccess, error: showError } = useToastHelpers();

  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<JobListing[]>([]);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      // TODO: Call API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      setListings([
        {
          id: '1',
          title: 'Senior Software Engineer',
          employmentType: 'full-time',
          location: {
            city: 'Johannesburg',
            province: 'GP',
            remote: 'hybrid',
          },
          salary: { min: 60000, max: 80000 },
          status: 'active',
          postedDate: '2026-01-05',
          applicantsCount: 23,
          viewsCount: 456,
        },
        {
          id: '2',
          title: 'Full Stack Developer',
          employmentType: 'full-time',
          location: {
            city: 'Cape Town',
            province: 'WC',
            remote: 'remote',
          },
          salary: { min: 50000, max: 70000 },
          status: 'active',
          postedDate: '2026-01-03',
          applicantsCount: 18,
          viewsCount: 387,
        },
        {
          id: '3',
          title: 'Frontend Developer',
          employmentType: 'contract',
          location: {
            city: 'Johannesburg',
            province: 'GP',
            remote: 'on-site',
          },
          salary: { min: 45000, max: 60000 },
          status: 'paused',
          postedDate: '2025-12-28',
          applicantsCount: 31,
          viewsCount: 512,
        },
        {
          id: '4',
          title: 'DevOps Engineer',
          employmentType: 'full-time',
          location: {
            city: 'Pretoria',
            province: 'GP',
            remote: 'hybrid',
          },
          salary: { min: 55000, max: 75000 },
          status: 'active',
          postedDate: '2026-01-08',
          applicantsCount: 12,
          viewsCount: 234,
        },
        {
          id: '5',
          title: 'Product Manager',
          employmentType: 'full-time',
          location: {
            city: 'Cape Town',
            province: 'WC',
            remote: 'hybrid',
          },
          salary: { min: 70000, max: 90000 },
          status: 'closed',
          postedDate: '2025-12-15',
          applicantsCount: 45,
          viewsCount: 823,
        },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setIsLoading(false);
    }
  };

  const handleCreateListing = () => {
    router.push(`/${locale}/dashboard/company/listings/create`);
  };

  const handleEditListing = (listingId: string) => {
    router.push(`/${locale}/dashboard/company/listings/${listingId}/edit`);
  };

  const handleTogglePause = (listingId: string, currentStatus: string) => {
    // TODO: API call
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setListings(prev =>
      prev.map(listing =>
        listing.id === listingId ? { ...listing, status: newStatus as any } : listing
      )
    );
    showSuccess(newStatus === 'active' ? 'Listing activated' : 'Listing paused');
  };

  const handleDeleteListing = (listingId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      // TODO: API call
      setListings(prev => prev.filter(listing => listing.id !== listingId));
      showSuccess('Listing deleted successfully');
    }
  };

  const handleViewApplicants = (listingId: string) => {
    router.push(`/${locale}/dashboard/company/applicants?listing=${listingId}`);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { label: 'Active', variant: 'success' as const },
      paused: { label: 'Paused', variant: 'warning' as const },
      closed: { label: 'Closed', variant: 'secondary' as const },
    };
    return configs[status as keyof typeof configs] || configs.closed;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <LoadingSkeleton variant="text" width="200px" height="32px" className="mb-6" />
          <LoadingSkeleton variant="card" height="150px" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Listings</h1>
            <p className="text-gray-600">Manage your active job postings</p>
          </div>
          <Button onClick={handleCreateListing}>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Listings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {listings.filter(l => l.status === 'active').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applicants</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {listings.reduce((sum, l) => sum + l.applicantsCount, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {listings.reduce((sum, l) => sum + l.viewsCount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings List */}
        {listings.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No job listings yet"
            description="Create your first job listing to start receiving applications"
            action={{ label: "Create Listing", onClick: handleCreateListing }}
          />
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => {
              const statusConfig = getStatusBadge(listing.status);

              return (
                <Card key={listing.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {listing.title}
                              </h3>
                              <Badge variant={statusConfig.variant}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {listing.location.city}, {listing.location.province} ({listing.location.remote})
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                R{listing.salary.min.toLocaleString()} - R{listing.salary.max.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Posted: {new Date(listing.postedDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{listing.applicantsCount}</span>
                            <span className="text-gray-600">applicants</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{listing.viewsCount}</span>
                            <span className="text-gray-600">views</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplicants(listing.id)}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            View Applicants ({listing.applicantsCount})
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditListing(listing.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>

                          {listing.status !== 'closed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePause(listing.id, listing.status)}
                            >
                              {listing.status === 'active' ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteListing(listing.id, listing.title)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
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
