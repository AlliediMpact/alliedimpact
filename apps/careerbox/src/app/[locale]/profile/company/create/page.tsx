'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building2, Briefcase, MapPin, Settings, CheckCircle, ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Steps configuration
const STEPS = [
  { id: 1, title: 'Company Info', description: 'Basic company details' },
  { id: 2, title: 'Industry & Culture', description: 'What you do' },
  { id: 3, title: 'Locations & Team', description: 'Where you operate' },
  { id: 4, title: 'Review & Submit', description: 'Confirm company profile' },
];

interface Location {
  city: string;
  province: string;
}

interface ProfileData {
  // Step 1: Company Info
  companyName: string;
  email: string;
  website: string;
  phone: string;
  companySize: string;
  description: string;

  // Step 2: Industry & Culture
  industry: string;
  specializations: string[];
  companyValues: string;
  benefits: string[];

  // Step 3: Locations & Team
  locations: Location[];
  remotePolicy: string;
  teamSize: string;
}

export default function CompanyProfileWizard() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    companyName: '',
    email: '',
    website: '',
    phone: '',
    companySize: '',
    description: '',
    industry: '',
    specializations: [],
    companyValues: '',
    benefits: [],
    locations: [{ city: '', province: '' }],
    remotePolicy: 'hybrid',
    teamSize: '',
  });

  // Temp states
  const [specializationInput, setSpecializationInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  const updateProfileData = (updates: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(curr => curr + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleAddSpecialization = () => {
    if (specializationInput.trim() && !profileData.specializations.includes(specializationInput.trim())) {
      updateProfileData({ specializations: [...profileData.specializations, specializationInput.trim()] });
      setSpecializationInput('');
    }
  };

  const handleRemoveSpecialization = (spec: string) => {
    updateProfileData({ specializations: profileData.specializations.filter(s => s !== spec) });
  };

  const handleAddBenefit = () => {
    if (benefitInput.trim() && !profileData.benefits.includes(benefitInput.trim())) {
      updateProfileData({ benefits: [...profileData.benefits, benefitInput.trim()] });
      setBenefitInput('');
    }
  };

  const handleRemoveBenefit = (benefit: string) => {
    updateProfileData({ benefits: profileData.benefits.filter(b => b !== benefit) });
  };

  const handleAddLocation = () => {
    updateProfileData({ locations: [...profileData.locations, { city: '', province: '' }] });
  };

  const handleRemoveLocation = (index: number) => {
    if (profileData.locations.length > 1) {
      const newLocations = [...profileData.locations];
      newLocations.splice(index, 1);
      updateProfileData({ locations: newLocations });
    }
  };

  const handleLocationChange = (index: number, field: 'city' | 'province', value: string) => {
    const newLocations = [...profileData.locations];
    newLocations[index][field] = value;
    updateProfileData({ locations: newLocations });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Call API to save profile
      console.log('Submitting company profile:', profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to company dashboard
      router.push(`/${locale}/dashboard/company`);
    } catch (error) {
      console.error('Error submitting profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={profileData.companyName}
                onChange={(e) => updateProfileData({ companyName: e.target.value })}
                placeholder="TechCorp SA"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Company Email *</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => updateProfileData({ email: e.target.value })}
                placeholder="hr@techcorp.co.za"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={profileData.website}
                  onChange={(e) => updateProfileData({ website: e.target.value })}
                  placeholder="https://www.techcorp.co.za"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => updateProfileData({ phone: e.target.value })}
                  placeholder="+27 11 123 4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size *</Label>
              <select
                id="companySize"
                value={profileData.companySize}
                onChange={(e) => updateProfileData({ companySize: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                required
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees (Startup)</option>
                <option value="11-50">11-50 employees (Small)</option>
                <option value="51-200">51-200 employees (Medium)</option>
                <option value="201-1000">201-1000 employees (Large)</option>
                <option value="1000+">1000+ employees (Enterprise)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company Description *</Label>
              <Textarea
                id="description"
                value={profileData.description}
                onChange={(e) => updateProfileData({ description: e.target.value })}
                placeholder="Tell candidates about your company, what you do, and what makes you unique..."
                rows={5}
                maxLength={1000}
                required
              />
              <p className="text-xs text-gray-500">{profileData.description.length}/1000 characters</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <select
                id="industry"
                value={profileData.industry}
                onChange={(e) => updateProfileData({ industry: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                required
              >
                <option value="">Select industry</option>
                <option value="technology">Technology & Software</option>
                <option value="finance">Finance & Banking</option>
                <option value="healthcare">Healthcare</option>
                <option value="retail">Retail & E-commerce</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="education">Education</option>
                <option value="consulting">Consulting</option>
                <option value="media">Media & Entertainment</option>
                <option value="hospitality">Hospitality & Tourism</option>
                <option value="construction">Construction</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Specializations/Services</Label>
              <div className="flex gap-2">
                <Input
                  value={specializationInput}
                  onChange={(e) => setSpecializationInput(e.target.value)}
                  placeholder="e.g., Mobile App Development, Cloud Computing"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialization();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddSpecialization} variant="outline">
                  Add
                </Button>
              </div>
              {profileData.specializations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profileData.specializations.map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialization(spec)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyValues">Company Values & Culture</Label>
              <Textarea
                id="companyValues"
                value={profileData.companyValues}
                onChange={(e) => updateProfileData({ companyValues: e.target.value })}
                placeholder="Describe your company culture, values, and what it's like to work here..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500">{profileData.companyValues.length}/500 characters</p>
            </div>

            <div className="space-y-2">
              <Label>Employee Benefits & Perks</Label>
              <div className="flex gap-2">
                <Input
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  placeholder="e.g., Medical Aid, Flexible Hours, Remote Work"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddBenefit} variant="outline">
                  Add
                </Button>
              </div>
              {profileData.benefits.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profileData.benefits.map((benefit) => (
                    <span
                      key={benefit}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(benefit)}
                        className="hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">Add benefits that make your company stand out</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Office Locations *</Label>
                <Button type="button" size="sm" variant="outline" onClick={handleAddLocation}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Location
                </Button>
              </div>

              {profileData.locations.map((location, index) => (
                <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`province-${index}`}>Province</Label>
                      <select
                        id={`province-${index}`}
                        value={location.province}
                        onChange={(e) => handleLocationChange(index, 'province', e.target.value)}
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
                    <div className="space-y-1">
                      <Label htmlFor={`city-${index}`}>City</Label>
                      <Input
                        id={`city-${index}`}
                        value={location.city}
                        onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
                        placeholder="e.g., Johannesburg"
                        required
                      />
                    </div>
                  </div>
                  {profileData.locations.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveLocation(index)}
                      className="mt-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="remotePolicy">Remote Work Policy *</Label>
              <select
                id="remotePolicy"
                value={profileData.remotePolicy}
                onChange={(e) => updateProfileData({ remotePolicy: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                required
              >
                <option value="office-only">Office Only</option>
                <option value="hybrid">Hybrid (Office + Remote)</option>
                <option value="remote-first">Remote First</option>
                <option value="fully-remote">Fully Remote</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamSize">Hiring Team Size</Label>
              <select
                id="teamSize"
                value={profileData.teamSize}
                onChange={(e) => updateProfileData({ teamSize: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="">Select team size</option>
                <option value="1">Just me</option>
                <option value="2-5">2-5 team members</option>
                <option value="6-10">6-10 team members</option>
                <option value="11-20">11-20 team members</option>
                <option value="20+">20+ team members</option>
              </select>
              <p className="text-xs text-gray-500">How many people will be involved in hiring?</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Ready to start hiring!</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Review your company profile below. You can edit any section by clicking "Previous".
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Company Name:</span>
                  <span className="font-medium">{profileData.companyName || 'Not provided'}</span>
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{profileData.email || 'Not provided'}</span>
                  <span className="text-gray-600">Website:</span>
                  <span className="font-medium">{profileData.website || 'Not provided'}</span>
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{profileData.phone || 'Not provided'}</span>
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{profileData.companySize || 'Not provided'}</span>
                </div>
                {profileData.description && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600">Description:</span>
                    <p className="mt-1">{profileData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Industry & Culture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium capitalize">{profileData.industry.replace('-', ' ') || 'Not provided'}</span>
                </div>
                {profileData.specializations.length > 0 && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600">Specializations:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.specializations.map((spec) => (
                        <span key={spec} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profileData.companyValues && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600">Values & Culture:</span>
                    <p className="mt-1">{profileData.companyValues}</p>
                  </div>
                )}
                {profileData.benefits.length > 0 && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600">Benefits:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.benefits.map((benefit) => (
                        <span key={benefit} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Locations & Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="space-y-1">
                  <span className="text-gray-600">Office Locations:</span>
                  {profileData.locations.map((loc, idx) => (
                    <p key={idx} className="font-medium">{loc.city}, {loc.province}</p>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <span className="text-gray-600">Remote Policy:</span>
                  <span className="font-medium capitalize">{profileData.remotePolicy.replace('-', ' ')}</span>
                  {profileData.teamSize && (
                    <>
                      <span className="text-gray-600">Team Size:</span>
                      <span className="font-medium">{profileData.teamSize}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return profileData.companyName && profileData.email && profileData.companySize && profileData.description.length >= 100;
      case 2:
        return profileData.industry;
      case 3:
        return profileData.locations.every(loc => loc.city && loc.province) && profileData.remotePolicy;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Company Profile</h1>
          <p className="text-gray-600">Let's get your company set up to find great talent</p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-12">
          <ProgressStepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            allowClickPrevious={true}
          />
        </div>

        {/* Form Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <Building2 className="h-5 w-5" />}
              {currentStep === 2 && <Briefcase className="h-5 w-5" />}
              {currentStep === 3 && <MapPin className="h-5 w-5" />}
              {currentStep === 4 && <Settings className="h-5 w-5" />}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
            >
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
