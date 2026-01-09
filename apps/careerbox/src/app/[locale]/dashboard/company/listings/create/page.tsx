'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Briefcase, MapPin, DollarSign, FileText, Save, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ListingData {
  title: string;
  employmentType: string;
  experienceLevel: string;
  location: {
    province: string;
    city: string;
    remote: string;
  };
  salaryMin: string;
  salaryMax: string;
  showSalary: boolean;
  description: string;
  responsibilities: string;
  requiredSkills: string[];
  preferredSkills: string[];
  benefits: string;
  applicationDeadline: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const [listingData, setListingData] = useState<ListingData>({
    title: '',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    location: {
      province: '',
      city: '',
      remote: 'hybrid',
    },
    salaryMin: '',
    salaryMax: '',
    showSalary: true,
    description: '',
    responsibilities: '',
    requiredSkills: [],
    preferredSkills: [],
    benefits: '',
    applicationDeadline: '',
  });

  // Temp states for skill inputs
  const [requiredSkillInput, setRequiredSkillInput] = useState('');
  const [preferredSkillInput, setPreferredSkillInput] = useState('');

  const updateListingData = (updates: Partial<ListingData>) => {
    setListingData(prev => ({ ...prev, ...updates }));
  };

  const updateLocation = (updates: Partial<ListingData['location']>) => {
    setListingData(prev => ({
      ...prev,
      location: { ...prev.location, ...updates },
    }));
  };

  const handleAddRequiredSkill = () => {
    if (requiredSkillInput.trim() && !listingData.requiredSkills.includes(requiredSkillInput.trim())) {
      updateListingData({ requiredSkills: [...listingData.requiredSkills, requiredSkillInput.trim()] });
      setRequiredSkillInput('');
    }
  };

  const handleRemoveRequiredSkill = (skill: string) => {
    updateListingData({ requiredSkills: listingData.requiredSkills.filter(s => s !== skill) });
  };

  const handleAddPreferredSkill = () => {
    if (preferredSkillInput.trim() && !listingData.preferredSkills.includes(preferredSkillInput.trim())) {
      updateListingData({ preferredSkills: [...listingData.preferredSkills, preferredSkillInput.trim()] });
      setPreferredSkillInput('');
    }
  };

  const handleRemovePreferredSkill = (skill: string) => {
    updateListingData({ preferredSkills: listingData.preferredSkills.filter(s => s !== skill) });
  };

  const handleSubmit = async (asDraft: boolean = false) => {
    setIsSubmitting(true);
    setIsDraft(asDraft);
    
    try {
      // TODO: Call API to create listing
      console.log('Submitting listing:', { ...listingData, isDraft: asDraft });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to company dashboard
      router.push(`/${locale}/dashboard/company`);
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsDraft(false);
    }
  };

  const isFormValid = () => {
    return (
      listingData.title &&
      listingData.location.province &&
      listingData.location.city &&
      listingData.description.length >= 100 &&
      listingData.responsibilities &&
      listingData.requiredSkills.length >= 3
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Position</h1>
              <p className="text-gray-600">Create a job listing to find your next great hire</p>
            </div>
            <Badge variant="tier.entry">Premium Feature</Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Essential details about the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={listingData.title}
                  onChange={(e) => updateListingData({ title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer, Marketing Manager"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type *</Label>
                  <select
                    id="employmentType"
                    value={listingData.employmentType}
                    onChange={(e) => updateListingData({ employmentType: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    required
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <select
                    id="experienceLevel"
                    value={listingData.experienceLevel}
                    onChange={(e) => updateListingData({ experienceLevel: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    required
                  >
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (2-5 years)</option>
                    <option value="senior">Senior Level (5-10 years)</option>
                    <option value="executive">Executive (10+ years)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
              <CardDescription>Where the role is based</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <select
                    id="province"
                    value={listingData.location.province}
                    onChange={(e) => updateLocation({ province: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    required
                  >
                    <option value="">Select province</option>
                    <option value="GP">Gauteng</option>
                    <option value="WC">Western Cape</option>
                    <option value="KZN">KwaZulu-Natal</option>
                    <option value="EC">Eastern Cape</option>
                    <option value="FS">Free State</option>
                    <option value="MP">Mpumalanga</option>
                    <option value="LP">Limpopo</option>
                    <option value="NW">North West</option>
                    <option value="NC">Northern Cape</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={listingData.location.city}
                    onChange={(e) => updateLocation({ city: e.target.value })}
                    placeholder="e.g., Johannesburg, Cape Town"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remote">Remote Work Option *</Label>
                <select
                  id="remote"
                  value={listingData.location.remote}
                  onChange={(e) => updateLocation({ remote: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  required
                >
                  <option value="office">Office Only</option>
                  <option value="hybrid">Hybrid (Office + Remote)</option>
                  <option value="remote">Fully Remote</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Salary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Salary Range
              </CardTitle>
              <CardDescription>Compensation details (optional but recommended)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Minimum (R/month)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={listingData.salaryMin}
                    onChange={(e) => updateListingData({ salaryMin: e.target.value })}
                    placeholder="e.g., 25000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Maximum (R/month)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={listingData.salaryMax}
                    onChange={(e) => updateListingData({ salaryMax: e.target.value })}
                    placeholder="e.g., 35000"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showSalary"
                  checked={listingData.showSalary}
                  onChange={(e) => updateListingData({ showSalary: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <Label htmlFor="showSalary" className="font-normal cursor-pointer">
                  Display salary range on listing (increases applications by 30%)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Details
              </CardTitle>
              <CardDescription>Describe the role and responsibilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={listingData.description}
                  onChange={(e) => updateListingData({ description: e.target.value })}
                  placeholder="Provide a detailed description of the role, including what the candidate will be doing, who they'll work with, and what the day-to-day looks like..."
                  rows={6}
                  maxLength={2000}
                  required
                />
                <p className="text-xs text-gray-500">
                  {listingData.description.length}/2000 characters (minimum 100 required)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Key Responsibilities *</Label>
                <Textarea
                  id="responsibilities"
                  value={listingData.responsibilities}
                  onChange={(e) => updateListingData({ responsibilities: e.target.value })}
                  placeholder="• Manage and lead software development projects&#10;• Collaborate with cross-functional teams&#10;• Conduct code reviews and mentor junior developers&#10;• ..."
                  rows={5}
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-gray-500">Use bullet points for better readability</p>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Requirements</CardTitle>
              <CardDescription>What you're looking for in candidates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Required Skills * (minimum 3)</Label>
                <div className="flex gap-2">
                  <Input
                    value={requiredSkillInput}
                    onChange={(e) => setRequiredSkillInput(e.target.value)}
                    placeholder="e.g., JavaScript, Project Management, SQL"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequiredSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddRequiredSkill} variant="outline">
                    Add
                  </Button>
                </div>
                {listingData.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {listingData.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveRequiredSkill(skill)}
                          className="hover:text-red-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Preferred Skills (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={preferredSkillInput}
                    onChange={(e) => setPreferredSkillInput(e.target.value)}
                    placeholder="e.g., TypeScript, Agile, Docker"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPreferredSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddPreferredSkill} variant="outline">
                    Add
                  </Button>
                </div>
                {listingData.preferredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {listingData.preferredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemovePreferredSkill(skill)}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">Nice-to-have skills that would be a bonus</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits & Perks</Label>
                <Textarea
                  id="benefits"
                  value={listingData.benefits}
                  onChange={(e) => updateListingData({ benefits: e.target.value })}
                  placeholder="• Medical aid and retirement fund&#10;• Annual performance bonuses&#10;• Flexible working hours&#10;• Professional development budget&#10;• ..."
                  rows={4}
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline (optional)</Label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  value={listingData.applicationDeadline}
                  onChange={(e) => updateListingData({ applicationDeadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500">Leave blank for ongoing recruitment</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 pb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting || !listingData.title}
              >
                <Save className="h-4 w-4 mr-2" />
                {isDraft ? 'Saving Draft...' : 'Save as Draft'}
              </Button>

              <Button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting || !isFormValid()}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting && !isDraft ? 'Publishing...' : 'Publish Listing'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
