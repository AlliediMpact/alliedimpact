'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Building2, Briefcase, MessageSquare, Settings, Users, TrendingUp, PlusCircle, MapPin, Clock } from 'lucide-react';

export default function CompanyDashboardPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';

  const [tier, setTier] = useState<'free' | 'entry' | 'classic'>('free');
  const [activeListings, setActiveListings] = useState(2);
  const [matchCount, setMatchCount] = useState(45);

  // Mock listings
  const listings = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      location: 'Johannesburg, GP',
      matches: 23,
      status: 'active',
      posted: '5 days ago',
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      location: 'Cape Town, WC',
      matches: 22,
      status: 'active',
      posted: '1 week ago',
    },
  ];

  // Mock recent matches
  const recentMatches = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      experience: '5 years',
      location: 'Johannesburg, GP',
      matchScore: 94,
      listingId: '1',
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Full Stack Developer',
      experience: '3 years',
      location: 'Johannesburg, GP',
      matchScore: 89,
      listingId: '1',
    },
    {
      id: '3',
      name: 'Jessica Williams',
      role: 'Frontend Developer',
      experience: '4 years',
      location: 'Cape Town, WC',
      matchScore: 87,
      listingId: '2',
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
            <Link href={`/${locale}/dashboard/company/listings`} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <span>Listings</span>
            </Link>
            <Link href={`/${locale}/dashboard/company/matches`} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Candidates</span>
            </Link>
            <Link href={`/${locale}/dashboard/company/messages`} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>Messages</span>
            </Link>
            <Link href={`/${locale}/dashboard/company/settings`} className="text-gray-600 hover:text-gray-900">
              <Settings className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2 pl-4 border-l">
              <Building2 className="h-8 w-8 text-gray-400 rounded-full bg-gray-200 p-1" />
              <span className="text-sm font-medium">TechCorp SA</span>
            </div>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Active Listings</span>
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{activeListings}</div>
                <Link href={`/${locale}/dashboard/company/listings/create`} className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-block">
                  Create new listing →
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Total Matches</span>
                  <Users className="h-5 w-5 text-blue-600" />
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
                  {tier === 'free' ? '—' : '7'}
                </div>
                {tier === 'free' && (
                  <p className="text-xs text-gray-500 mt-1">Available on paid plans</p>
                )}
              </div>
            </div>

            {/* Active Listings */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Your Listings</h2>
                  <Link
                    href={`/${locale}/dashboard/company/listings/create`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    <PlusCircle className="h-5 w-5" />
                    New Listing
                  </Link>
                </div>
              </div>

              <div className="divide-y">
                {listings.map((listing) => (
                  <div key={listing.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full capitalize">
                            {listing.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {listing.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {listing.posted}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {listing.matches} matches
                          </div>
                        </div>
                        <Link
                          href={`/${locale}/dashboard/company/listings/${listing.id}/matches`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Candidates →
                        </Link>
                      </div>
                      <Link
                        href={`/${locale}/dashboard/company/listings/${listing.id}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Matches */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Top Matched Candidates</h2>
                  <Link
                    href={`/${locale}/dashboard/company/matches`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
              </div>

              <div className="divide-y">
                {tier === 'free' ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-600 mb-4">
                      You have <span className="font-bold text-2xl text-blue-600">{matchCount}</span> potential candidates!
                    </p>
                    <p className="text-gray-500 mb-6">
                      Upgrade to see full candidate profiles and contact them directly.
                    </p>
                    <Link
                      href={`/${locale}/pricing`}
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Upgrade to View Candidates
                    </Link>
                  </div>
                ) : (
                  recentMatches.map((match) => (
                    <div key={match.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{match.name}</h3>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                {match.matchScore}% Match
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{match.role} • {match.experience} experience</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {match.location}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/${locale}/dashboard/company/matches/${match.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
                    Unlock unlimited candidate viewing and messaging.
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
                  href={`/${locale}/dashboard/company/listings/create`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Post New Position</span>
                </Link>
                <Link
                  href={`/${locale}/dashboard/company/profile`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Building2 className="h-5 w-5" />
                  <span>Edit Company Profile</span>
                </Link>
                <Link
                  href={`/${locale}/dashboard/company/matches`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Users className="h-5 w-5" />
                  <span>Browse Candidates</span>
                </Link>
                <Link
                  href={`/${locale}/dashboard/company/messages`}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Messages</span>
                </Link>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Hiring Tip</h3>
              <p className="text-gray-700 text-sm">
                Listings with clear role requirements and detailed descriptions get 5x more quality matches!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
