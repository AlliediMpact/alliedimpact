'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  MessageCircle,
  Star,
  Flag,
  ArrowLeft,
  FileText,
  Download,
  TrendingUp,
  Target,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';

export default function CompanyMatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params?.matchId as string;
  const locale = params?.locale as string || 'en';

  const [isLoading, setIsLoading] = useState(true);
  const [isShortlisted, setIsShortlisted] = useState(false);
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
          score: 92,
          candidate: {
            id: 'candidate-123',
            displayName: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            phone: '+27 82 345 6789',
            profilePicture: null,
            currentRole: 'Senior Software Engineer',
            yearsExperience: '5-10',
            bio: 'Passionate software engineer with 7 years of experience building scalable web applications. Strong expertise in full-stack development with a focus on React and Node.js ecosystems. Love working in collaborative environments and mentoring junior developers.',
            skills: [
              'JavaScript',
              'TypeScript',
              'React',
              'Node.js',
              'PostgreSQL',
              'AWS',
              'Docker',
              'Git',
            ],
            education: 'bachelors',
            location: {
              province: 'GP',
              city: 'Johannesburg',
            },
            remoteWork: 'hybrid',
            willingToRelocate: false,
            availability: 'immediate',
            expectedSalary: 'R60,000 - R75,000 per month',
            resumeUrl: null, // Would be actual URL if uploaded
            hasResume: true,
          },
          listing: {
            id: 'listing-456',
            title: 'Senior Software Engineer',
            employmentType: 'full-time',
            experienceLevel: 'senior',
          },
          matchBreakdown: {
            roleMatch: 95,
            roleExplanation: 'Candidate\'s current role and experience level perfectly match the position',
            locationMatch: 90,
            locationExplanation: 'Based in Johannesburg with hybrid preference, matching the role location',
            skillsMatch: 88,
            skillsExplanation: 'Has 5 out of 5 required skills and 3 out of 4 preferred skills',
            experienceMatch: 100,
            experienceExplanation: '7 years of experience fits the senior level requirement perfectly',
            availabilityMatch: 95,
            availabilityExplanation: 'Immediate availability aligns with your hiring timeline',
          },
          whyThisCandidate:
            'Sarah is an exceptional match for your Senior Software Engineer role. With 7 years of experience and strong proficiency in all required technologies (JavaScript, React, Node.js, PostgreSQL, AWS), she brings the exact skill set you need. Her current role demonstrates leadership capabilities, and her hybrid work preference aligns with your office policy. Her immediate availability means you can onboard quickly.',
          workHistory: [
            {
              title: 'Senior Software Engineer',
              company: 'Digital Innovations Ltd',
              duration: '2022 - Present',
              description:
                'Leading a team of 4 developers building enterprise SaaS platform. Architected microservices infrastructure on AWS.',
            },
            {
              title: 'Software Engineer',
              company: 'StartupCo',
              duration: '2019 - 2022',
              description:
                'Full-stack development using React and Node.js. Implemented CI/CD pipelines and improved deployment frequency by 300%.',
            },
          ],
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching match data:', error);
        setIsLoading(false);
      }
    };

    fetchMatchData();
  }, [matchId]);

  const handleShortlist = () => {
    // TODO: API call to shortlist candidate
    setIsShortlisted(!isShortlisted);
  };

  const handleSendMessage = () => {
    // TODO: Navigate to messaging or open modal
    router.push(`/${locale}/dashboard/company/messages?recipientId=${matchData.candidate.id}`);
  };

  const handleNotAFit = () => {
    // TODO: API call to mark as not a fit
    if (confirm('Are you sure this candidate is not a fit?')) {
      router.push(`/${locale}/dashboard/company`);
    }
  };

  const handleViewResume = () => {
    // TODO: Open resume in new tab or modal
    if (matchData.candidate.resumeUrl) {
      window.open(matchData.candidate.resumeUrl, '_blank');
    } else {
      alert('Resume viewing available for Entry and Classic tier members. Upgrade to access full candidate profiles.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate details...</p>
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

  const { candidate, listing, matchBreakdown, whyThisCandidate, workHistory } = matchData;

  const educationLabels: Record<string, string> = {
    'high-school': 'High School',
    diploma: 'Diploma',
    bachelors: "Bachelor's Degree",
    masters: "Master's Degree",
    phd: 'PhD',
  };

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
                <h1 className="text-3xl font-bold text-gray-900">{candidate.displayName}</h1>
                <Badge variant="success" className="text-base px-3 py-1">
                  {matchData.score}% Match
                </Badge>
                {isShortlisted && (
                  <Badge variant="tier.classic">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Shortlisted
                  </Badge>
                )}
              </div>
              <p className="text-lg text-gray-600">
                {candidate.currentRole} • Applying for: {listing.title}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Candidate Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {getInitials(candidate.displayName)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                          {candidate.displayName}
                        </h2>
                        <p className="text-lg text-gray-700 mb-2">{candidate.currentRole}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {candidate.location.city}, {candidate.location.province}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {candidate.yearsExperience} years
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            {educationLabels[candidate.education] || candidate.education}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bio */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">{candidate.bio}</p>
                </div>

                {/* Contact Info (Tier-gated) */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Email:</strong> {candidate.email}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Phone:</strong> {candidate.phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Resume */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume
                </CardTitle>
                <CardDescription>Candidate's professional resume</CardDescription>
              </CardHeader>
              <CardContent>
                {candidate.hasResume ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {candidate.displayName.replace(' ', '_')}_Resume.pdf
                          </p>
                          <p className="text-sm text-gray-600">Updated recently</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleViewResume}>
                          View Resume
                        </Button>
                        <Button variant="outline" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No resume uploaded</p>
                    <Badge variant="tier.entry">Upgrade to view all candidate details</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
                <CardDescription>Technical and professional skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill: string) => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Work History */}
            {workHistory && workHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </CardTitle>
                  <CardDescription>Professional background</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {workHistory.map((job: any, idx: number) => (
                    <div key={idx} className="relative pl-6 pb-6 border-l-2 border-gray-200 last:pb-0">
                      <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-blue-600 border-2 border-white" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">{job.company}</p>
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {job.duration}
                        </p>
                        <p className="text-sm text-gray-700">{job.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Work Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Remote Work</p>
                    <Badge variant="outline" className="capitalize">
                      {candidate.remoteWork}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Willing to Relocate</p>
                    <Badge variant="outline">{candidate.willingToRelocate ? 'Yes' : 'No'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Availability</p>
                    <Badge variant="outline" className="capitalize">
                      {candidate.availability}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Expected Salary</p>
                    <p className="font-semibold text-gray-900">{candidate.expectedSalary}</p>
                  </div>
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
                <CardDescription>How well this candidate fits your role</CardDescription>
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

                  {/* Experience Match */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Experience Match</span>
                      <span className="text-sm font-bold text-gray-900">
                        {matchBreakdown.experienceMatch}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                        style={{ width: `${matchBreakdown.experienceMatch}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {matchBreakdown.experienceExplanation}
                    </p>
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

            {/* Why This Candidate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Why This Candidate?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">{whyThisCandidate}</p>
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
                  variant={isShortlisted ? 'secondary' : 'outline'}
                  className="w-full"
                  onClick={handleShortlist}
                >
                  <Star className={`h-4 w-4 mr-2 ${isShortlisted ? 'fill-current' : ''}`} />
                  {isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
                </Button>

                <Button variant="outline" className="w-full" onClick={handleNotAFit}>
                  Not a Fit
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
