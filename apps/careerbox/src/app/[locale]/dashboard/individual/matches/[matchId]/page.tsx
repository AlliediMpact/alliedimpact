'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  MessageCircle,
  Bookmark,
  Flag,
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  Target,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function IndividualMatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params?.matchId as string;
  const locale = params?.locale as string || 'en';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);

  useEffect(() => {
    // TODO: Fetch match data from API
    const fetchMatchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock data
        setMatchData({
          id: matchId,
          score: 90,
          company: {
            id: 'company-123',
            name: 'TechCorp Solutions',
            logo: null,
            industry: 'Technology',
            size: '51-200 employees',
            description:
              'TechCorp Solutions is a leading software development company specializing in cloud-based enterprise solutions. We help businesses transform digitally with innovative technology.',
            website: 'https://techcorp.example.com',
            locations: [
              { city: 'Johannesburg', province: 'GP' },
              { city: 'Cape Town', province: 'WC' },
            ],
          },
          listing: {
            id: 'listing-456',
            title: 'Senior Software Engineer',
            employmentType: 'full-time',
            experienceLevel: 'senior',
            location: {
              city: 'Johannesburg',
              province: 'GP',
              remote: 'hybrid',
            },
            salary: {
              min: 60000,
              max: 80000,
              currency: 'ZAR',
            },
            description:
              'We are looking for a Senior Software Engineer to join our growing engineering team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies.',
            responsibilities: [
              'Lead technical design and architecture decisions',
              'Develop and maintain high-quality code',
              'Mentor junior developers and conduct code reviews',
              'Collaborate with product managers and designers',
              'Optimize application performance and scalability',
            ],
            requiredSkills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
            preferredSkills: ['TypeScript', 'Docker', 'Kubernetes', 'GraphQL'],
            benefits: [
              'Medical aid and retirement fund',
              'Annual performance bonuses',
              'Flexible working hours',
              'Professional development budget',
              'Latest tech equipment',
            ],
            postedDate: '2026-01-05',
            applicationDeadline: '2026-02-05',
          },
          matchBreakdown: {
            roleMatch: 92,
            roleExplanation: 'Your experience aligns perfectly with the senior role requirements',
            locationMatch: 85,
            locationExplanation: 'Hybrid work in Johannesburg matches your preferences',
            industryMatch: 100,
            industryExplanation: 'Technology sector matches your career focus',
            skillsMatch: 88,
            skillsExplanation: 'You have 4 out of 5 required skills and 2 out of 4 preferred skills',
            availabilityMatch: 100,
            availabilityExplanation: 'Your immediate availability fits their hiring timeline',
          },
          whyThisMatch:
            'This position is an excellent match for your profile. Your 5+ years of experience in software engineering, combined with your strong JavaScript and React skills, make you an ideal candidate. The company offers remote flexibility and competitive compensation that aligns with your expectations.',
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching match data:', error);
        setIsLoading(false);
      }
    };

    fetchMatchData();
  }, [matchId]);

  const handleSaveMatch = () => {
    // TODO: API call to save match
    setIsSaved(!isSaved);
  };

  const handleSendMessage = () => {
    // TODO: Navigate to messaging or open modal
    router.push(`/${locale}/dashboard/individual/messages?recipientId=${matchData.company.id}`);
  };

  const handleNotInterested = () => {
    // TODO: API call to mark as not interested
    if (confirm('Are you sure you want to hide this match?')) {
      router.push(`/${locale}/dashboard/individual`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Match not found</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { company, listing, matchBreakdown, whyThisMatch } = matchData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matches
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
                <Badge variant="success" className="text-base px-3 py-1">
                  {matchData.score}% Match
                </Badge>
              </div>
              <p className="text-lg text-gray-600">{company.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company & Listing Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Profile */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{company.name}</CardTitle>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary">{company.industry}</Badge>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {company.size}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{company.description}</p>

                <div className="flex flex-wrap gap-3">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {company.locations.map((loc: any, idx: number) => (
                    <span key={idx} className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {loc.city}, {loc.province}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Job Listing Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Position Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Employment Type</p>
                    <Badge variant="outline" className="capitalize">
                      {listing.employmentType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Experience Level</p>
                    <Badge variant="outline" className="capitalize">
                      {listing.experienceLevel}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <Badge variant="outline" className="capitalize">
                      {listing.location.remote}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Salary Range</p>
                    <p className="font-semibold text-gray-900">
                      R{listing.salary.min.toLocaleString()} - R{listing.salary.max.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
                  <p className="text-gray-700">{listing.description}</p>
                </div>

                {/* Responsibilities */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Key Responsibilities</h3>
                  <ul className="space-y-2">
                    {listing.responsibilities.map((resp: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.requiredSkills.map((skill: string) => (
                      <Badge key={skill} variant="destructive">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {listing.preferredSkills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Preferred Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.preferredSkills.map((skill: string) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Benefits & Perks</h3>
                  <ul className="space-y-2">
                    {listing.benefits.map((benefit: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <Award className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Posted: {new Date(listing.postedDate).toLocaleDateString()}
                  </span>
                  {listing.applicationDeadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Deadline: {new Date(listing.applicationDeadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Match Score & Actions */}
          <div className="space-y-6">
            {/* Match Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Match Analysis
                </CardTitle>
                <CardDescription>How well this position fits your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Overall Score */}
                <div className="text-center pb-4 border-b">
                  <div className="text-5xl font-bold text-blue-600 mb-2">{matchData.score}%</div>
                  <p className="text-sm text-gray-600">Overall Match Score</p>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-4">
                  {/* Role Match */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Role Match</span>
                      <span className="text-sm font-bold text-gray-900">
                        {matchBreakdown.roleMatch}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
                        style={{ width: `${matchBreakdown.roleMatch}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{matchBreakdown.roleExplanation}</p>
                  </div>

                  {/* Location Match */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Location Match</span>
                      <span className="text-sm font-bold text-gray-900">
                        {matchBreakdown.locationMatch}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full"
                        style={{ width: `${matchBreakdown.locationMatch}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {matchBreakdown.locationExplanation}
                    </p>
                  </div>

                  {/* Industry Match */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Industry Match</span>
                      <span className="text-sm font-bold text-gray-900">
                        {matchBreakdown.industryMatch}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                        style={{ width: `${matchBreakdown.industryMatch}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {matchBreakdown.industryExplanation}
                    </p>
                  </div>

                  {/* Skills Match */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Skills Match</span>
                      <span className="text-sm font-bold text-gray-900">
                        {matchBreakdown.skillsMatch}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-600 to-red-600 h-2 rounded-full"
                        style={{ width: `${matchBreakdown.skillsMatch}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{matchBreakdown.skillsExplanation}</p>
                  </div>

                  {/* Availability Match */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Availability Match</span>
                      <span className="text-sm font-bold text-gray-900">
                        {matchBreakdown.availabilityMatch}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 h-2 rounded-full"
                        style={{ width: `${matchBreakdown.availabilityMatch}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {matchBreakdown.availabilityExplanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Why This Match */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Why This Match?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">{whyThisMatch}</p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Take Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleSendMessage}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>

                <Button
                  variant={isSaved ? 'secondary' : 'outline'}
                  className="w-full"
                  onClick={handleSaveMatch}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save Match'}
                </Button>

                <Button variant="outline" className="w-full" onClick={handleNotInterested}>
                  Not Interested
                </Button>

                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700">
                  <Flag className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
