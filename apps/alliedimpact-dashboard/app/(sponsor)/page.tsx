'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '../../lib/dashboard-context';
import { getSponsorSponsorships, getSponsorshipMetrics, getSponsorshipBeneficiaries, getSponsorshipStats, type Sponsorship, type ImpactMetric, type Beneficiary } from '@allied-impact/sponsorships';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Heart, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function SponsorDashboard() {
  const { platformUser, loading } = useDashboard();
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [selectedSponsorship, setSelectedSponsorship] = useState<Sponsorship | null>(null);
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (platformUser) {
      loadSponsorshipData();
    }
  }, [platformUser]);

  const loadSponsorshipData = async () => {
    if (!platformUser) return;
    
    setLoadingData(true);
    try {
      const sponsorSponsorships = await getSponsorSponsorships(platformUser.uid);
      setSponsorships(sponsorSponsorships);
      
      if (sponsorSponsorships.length > 0) {
        setSelectedSponsorship(sponsorSponsorships[0]);
        const [sponsorshipMetrics, sponsorshipBeneficiaries, sponsorshipStats] = await Promise.all([
          getSponsorshipMetrics(sponsorSponsorships[0].id),
          getSponsorshipBeneficiaries(sponsorSponsorships[0].id),
          getSponsorshipStats(sponsorSponsorships[0].id)
        ]);
        setMetrics(sponsorshipMetrics);
        setBeneficiaries(sponsorshipBeneficiaries);
        setStats(sponsorshipStats);
      }
    } catch (error) {
      console.error('Error loading sponsorship data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (sponsorships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Sponsorships Found</h2>
        <p className="text-muted-foreground mb-6">
          You haven't sponsored any initiatives yet. Start making an impact today!
        </p>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Browse Opportunities
        </button>
      </div>
    );
  }

  const activeSponsorship = selectedSponsorship || sponsorships[0];
  const totalInvested = sponsorships.reduce((sum, s) => sum + s.amount, 0);
  const totalBeneficiaries = sponsorships.reduce((sum, s) => sum + s.currentBeneficiaries, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Sponsor Dashboard</h1>
        <p className="text-muted-foreground">
          Track your impact and see how you're changing lives
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSponsorship?.currency} {totalInvested.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sponsorships.filter(s => s.status === 'active').length} active sponsorships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lives Impacted</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBeneficiaries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Direct beneficiaries reached
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.completionRate ? Math.round(stats.completionRate) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average progress: {stats?.averageProgress ? Math.round(stats.averageProgress) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sponsorships.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sponsorships.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Sponsorships */}
      <Card>
        <CardHeader>
          <CardTitle>Your Sponsorships</CardTitle>
          <CardDescription>Initiatives you're supporting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sponsorships.map(sponsorship => (
              <div key={sponsorship.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{sponsorship.initiativeName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {sponsorship.initiativeDescription}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    sponsorship.status === 'active' ? 'bg-green-100 text-green-800' :
                    sponsorship.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    sponsorship.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sponsorship.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-3 bg-muted rounded">
                  <div>
                    <p className="text-xs text-muted-foreground">Investment</p>
                    <p className="font-medium">{sponsorship.currency} {sponsorship.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Disbursed</p>
                    <p className="font-medium">{sponsorship.currency} {sponsorship.disbursed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Beneficiaries</p>
                    <p className="font-medium">{sponsorship.currentBeneficiaries}/{sponsorship.targetBeneficiaries}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {new Date(sponsorship.startDate).toLocaleDateString()} - 
                      {sponsorship.endDate ? new Date(sponsorship.endDate).toLocaleDateString() : 'Ongoing'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Impact Metrics</CardTitle>
            <CardDescription>Measure your social return on investment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map(metric => (
                <div key={metric.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{metric.name}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{metric.value}</span>
                    <span className="text-muted-foreground">/ {metric.target} {metric.unit}</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  {metric.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{metric.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Beneficiaries */}
      {beneficiaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Beneficiaries</CardTitle>
            <CardDescription>People you're helping</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {beneficiaries.slice(0, 10).map(beneficiary => (
                <div key={beneficiary.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{beneficiary.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {beneficiary.location && `${beneficiary.location} • `}
                      Enrolled {new Date(beneficiary.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{beneficiary.progressPercentage}% Complete</p>
                    {beneficiary.completedAt && (
                      <p className="text-xs text-green-600">Completed!</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
