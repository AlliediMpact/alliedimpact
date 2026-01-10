'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { User, Briefcase, MessageSquare, Settings, Heart, TrendingUp, MapPin, Clock, Check } from 'lucide-react';
import { DashboardStatsSkeleton, MatchCardSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function IndividualDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string || 'en';

  const [isLoading, setIsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [matchCount, setMatchCount] = useState(37); // Mock data
  const [tier, setTier] = useState<'free' | 'entry' | 'classic'>('free');

  // Simulate loading dashboard data
  useEffect(() => {
    // TODO: Fetch user profile and match data from Firestore
    const loadDashboard = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
    };
    loadDashboard();
  }, []);

  // Mock data for matches
  const recentMatches = [
    {
      id: '1',
      company: 'TechCorp SA',
      position: 'Senior Software Engineer',
      location: 'Johannesburg, GP',
      matchScore: 92,
      posted: '2 days ago',
    },
    {
      id: '2',
      company: 'FinServe Ltd',
      position: 'Full Stack Developer',
      location: 'Cape Town, WC',
      matchScore: 88,
      posted: '3 days ago',
    },
    {
      id: '3',
      company: 'Innovation Hub',
      position: 'Lead Developer',
      location: 'Durban, KZN',
      matchScore: 85,
      posted: '5 days ago',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CareerBox</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/dashboard/individual/matches`} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              <span>Matches</span>
            </Link>
            <Link href={`/${locale}/dashboard/individual/messages`} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>Messages</span>
            </Link>
            <Link href={`/${locale}/dashboard/individual/settings`} className="text-gray-600 hover:text-gray-900">
              <Settings className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2 pl-4 border-l">
              <User className="h-8 w-8 text-gray-400 rounded-full bg-gray-200 p-1" />
              <span className="text-sm font-medium">John Doe</span>
            </div>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Completion Banner */}
        {!profileComplete && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Complete Your Profile to See Matches
                </h3>
                <p className="text-gray-600 mb-4">
                  Add your skills, experience, and preferences to get personalized job matches.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">40% Complete</span>
                </div>
                <Link
                  href={`/${locale}/dashboard/individual/profile`}
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Complete Profile
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            {isLoading ? (
              <DashboardStatsSkeleton />
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Total Matches</span>
                  <Heart className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{matchCount}</div>
                {tier === 'free' && (
                  <p className="text-xs text-gray-500 mt-1">Upgrade to view profiles</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Messages</span>
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {tier === 'free' ? '—' : '3'}
                </div>
                {tier === 'free' && (
                  <p className="text-xs text-gray-500 mt-1">Available on paid plans</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Profile Views</span>
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {tier === 'free' ? '—' : '12'}
                </div>
                {tier === 'free' && (
                  <p className="text-xs text-gray-500 mt-1">Available on paid plans</p>
                )}
              </div>
            </div>
            )}

            {/* Recent Matches */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Matches</h2>
                  <Link
                    href={`/${locale}/dashboard/individual/matches`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
              </div>

              {isLoading ? (
                <div className="p-6 space-y-4">
                  <MatchCardSkeleton />
                  <MatchCardSkeleton />
                  <MatchCardSkeleton />
                </div>
              ) : (
              <div className="divide-y">
                {tier === 'free' ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-600 mb-4">
                      You have <span className="font-bold text-2xl text-blue-600">{matchCount}</span> potential matches!
                    </p>
                    <p className="text-gray-500 mb-6">
                      Upgrade to see full company profiles and connect with employers.
                    </p>
                    <Link
                      href={`/${locale}/pricing`}
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Upgrade to View Matches
                    </Link>
                  </div>
                ) : (
                  recentMatches.map((match) => (
                    <div key={match.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{match.position}</h3>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              {match.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-gray-600 font-medium mb-2">{match.company}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {match.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {match.posted}
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/${locale}/dashboard/individual/matches/${match.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Plan</h3>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full capitalize">
                  {tier}
                </span>
              </div>
              {tier === 'free' && (
                <>
                  <p className="text-gray-600 mb-4">
                    Unlock unlimited matches, messaging, and advanced features.
                  </p>
                  <Link
                    href={`/${locale}/pricing`}
                    className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center"
                  >
                    Upgrade Now
                  </Link>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/${locale}/dashboard/individual/profile`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Edit Profile</span>
                </Link>
                <Link
                  href={`/${locale}/dashboard/individual/matches`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                  <span>Browse Matches</span>
                </Link>
                <Link
                  href={`/${locale}/dashboard/individual/messages`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Messages</span>
                </Link>
                <Link
                  href={`/${locale}/dashboard/individual/settings`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Tip of the Day</h3>
              <p className="text-gray-700 text-sm">
                Complete your profile with specific skills and experience to get better matches.
                Companies are 3x more likely to contact candidates with complete profiles!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
