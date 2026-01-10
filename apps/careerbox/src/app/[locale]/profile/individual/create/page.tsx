'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Briefcase, MapPin, Settings, User, CheckCircle, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToastHelpers } from '@/components/ui/toast';
import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateMinLength,
  validateNumber,
} from '@/utils/validation';

// Steps configuration
const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Tell us about yourself' },
  { id: 2, title: 'Skills & Experience', description: 'Your expertise' },
  { id: 3, title: 'Location & Preferences', description: 'Where you want to work' },
  { id: 4, title: 'Review & Submit', description: 'Confirm your profile' },
];

interface ProfileData {
  // Step 1: Basic Info
  displayName: string;
  email: string;
  phone: string;
  bio: string;

  // Step 2: Skills & Experience
  currentRole: string;
  yearsExperience: string;
  skills: string[];
  education: string;

  // Step 3: Location & Preferences
  province: string;
  city: string;
  willingToRelocate: boolean;
  remoteWork: string;
  availability: string;
  expectedSalary: string;
}

export default function IndividualProfileWizard() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { error: showError, success: showSuccess } = useToastHelpers();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    currentRole: '',
    yearsExperience: '',
    skills: [],
    education: '',
    province: '',
    city: '',
    willingToRelocate: false,
    remoteWork: 'no-preference',
    availability: 'immediate',
    expectedSalary: '',
  });

  // Validation errors and touched fields
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Temp state for skills input
  const [skillInput, setSkillInput] = useState('');

  const updateProfileData = (updates: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...updates }));
  };

  // Validation functions
  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'displayName':
        const nameValidation = validateRequired(value, 'Full name');
        if (!nameValidation.isValid) return nameValidation.error!;
        const minLengthValidation = validateMinLength(value, 2, 'Full name');
        if (!minLengthValidation.isValid) return minLengthValidation.error!;
        return null;
      
      case 'email':
        const emailValidation = validateEmail(value);
        return emailValidation.isValid ? null : emailValidation.error!;
      
      case 'phone':
        if (!value) return null; // Optional field
        const phoneValidation = validatePhone(value);
        return phoneValidation.isValid ? null : phoneValidation.error!;
      
      case 'bio':
        const bioValidation = validateRequired(value, 'Bio');
        if (!bioValidation.isValid) return bioValidation.error!;
        const bioMinLength = validateMinLength(value, 50, 'Bio');
        if (!bioMinLength.isValid) return bioMinLength.error!;
        return null;
      
      case 'currentRole':
        const roleValidation = validateRequired(value, 'Current role');
        return roleValidation.isValid ? null : roleValidation.error!;
      
      case 'yearsExperience':
        if (!value) return null; // Optional
        const yearsValidation = validateNumber(value, 'Years of experience');
        return yearsValidation.isValid ? null : yearsValidation.error!;
      
      case 'city':
        const cityValidation = validateRequired(value, 'City');
        return cityValidation.isValid ? null : cityValidation.error!;
      
      case 'province':
        const provinceValidation = validateRequired(value, 'Province');
        return provinceValidation.isValid ? null : provinceValidation.error!;
      
      default:
        return null;
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      const fields = ['displayName', 'email', 'phone', 'bio'];
      fields.forEach(field => {
        const error = validateField(field, profileData[field as keyof ProfileData]);
        if (error) newErrors[field] = error;
      });
    } else if (step === 2) {
      const fields = ['currentRole', 'yearsExperience'];
      fields.forEach(field => {
        const error = validateField(field, profileData[field as keyof ProfileData]);
        if (error) newErrors[field] = error;
      });
      if (profileData.skills.length === 0) {
        newErrors.skills = 'Please add at least one skill';
      }
    } else if (step === 3) {
      const fields = ['city', 'province'];
      fields.forEach(field => {
        const error = validateField(field, profileData[field as keyof ProfileData]);
        if (error) newErrors[field] = error;
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, profileData[field as keyof ProfileData]);
    setErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(curr => curr + 1);
      }
    } else {
      showError('Please fix the errors before continuing');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !profileData.skills.includes(skillInput.trim())) {
      updateProfileData({ skills: [...profileData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    updateProfileData({ skills: profileData.skills.filter(s => s !== skill) });
  };

  const handleSubmit = async () => {
    // Validate all steps before submitting
    const allStepsValid = [1, 2, 3].every(step => validateStep(step));
    if (!allStepsValid) {
      showError('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to save profile
      console.log('Submitting profile:', profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Profile created successfully!');
      
      // Redirect to dashboard
      router.push(`/${locale}/dashboard/individual`);
    } catch (error) {
      console.error('Error submitting profile:', error);
      showError('Failed to save profile. Please try again.');
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
              <Label htmlFor="displayName">Full Name *</Label>
              <div className="relative">
                <Input
                  id="displayName"
                  value={profileData.displayName}
                  onChange={(e) => updateProfileData({ displayName: e.target.value })}
                  onBlur={() => handleBlur('displayName')}
                  placeholder="John Doe"
                  required
                  className={errors.displayName && touched.displayName ? 'border-red-500' : touched.displayName && !errors.displayName ? 'border-green-500' : ''}
                />
                {touched.displayName && !errors.displayName && profileData.displayName && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              {errors.displayName && touched.displayName && (
                <p className="text-sm text-red-600">{errors.displayName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => updateProfileData({ email: e.target.value })}
                  onBlur={() => handleBlur('email')}
                  placeholder="john@example.com"
                  required
                  className={errors.email && touched.email ? 'border-red-500' : touched.email && !errors.email ? 'border-green-500' : ''}
                />
                {touched.email && !errors.email && profileData.email && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              {errors.email && touched.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => updateProfileData({ phone: e.target.value })}
                placeholder="+27 12 345 6789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => updateProfileData({ bio: e.target.value })}
                placeholder="Tell us about yourself, your career goals, and what you're looking for..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500">{profileData.bio.length}/500 characters</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentRole">Current/Desired Role *</Label>
              <Input
                id="currentRole"
                value={profileData.currentRole}
                onChange={(e) => updateProfileData({ currentRole: e.target.value })}
                placeholder="e.g., Software Engineer, Marketing Manager"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience *</Label>
              <select
                id="yearsExperience"
                value={profileData.yearsExperience}
                onChange={(e) => updateProfileData({ yearsExperience: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                required
              >
                <option value="">Select experience level</option>
                <option value="0-1">0-1 years (Entry Level)</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years (Senior/Executive)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Skills *</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g., JavaScript, Project Management"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddSkill} variant="outline">
                  Add
                </Button>
              </div>
              {profileData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profileData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">Add at least 3 skills relevant to your role</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Highest Education Level</Label>
              <select
                id="education"
                value={profileData.education}
                onChange={(e) => updateProfileData({ education: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="">Select education level</option>
                <option value="high-school">High School</option>
                <option value="diploma">Diploma/Certificate</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="phd">PhD/Doctorate</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <select
                  id="province"
                  value={profileData.province}
                  onChange={(e) => updateProfileData({ province: e.target.value })}
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
                  value={profileData.city}
                  onChange={(e) => updateProfileData({ city: e.target.value })}
                  placeholder="e.g., Johannesburg, Cape Town"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Remote Work Preference</Label>
              <select
                value={profileData.remoteWork}
                onChange={(e) => updateProfileData({ remoteWork: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="no-preference">No Preference</option>
                <option value="remote-only">Remote Only</option>
                <option value="hybrid">Hybrid (Remote + Office)</option>
                <option value="office-only">Office Only</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="willingToRelocate"
                checked={profileData.willingToRelocate}
                onChange={(e) => updateProfileData({ willingToRelocate: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <Label htmlFor="willingToRelocate" className="font-normal cursor-pointer">
                I'm willing to relocate for the right opportunity
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability *</Label>
              <select
                id="availability"
                value={profileData.availability}
                onChange={(e) => updateProfileData({ availability: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                required
              >
                <option value="immediate">Immediate (0-2 weeks)</option>
                <option value="1-month">1 Month Notice</option>
                <option value="2-months">2 Months Notice</option>
                <option value="3-months">3+ Months Notice</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedSalary">Expected Salary (Optional)</Label>
              <Input
                id="expectedSalary"
                type="text"
                value={profileData.expectedSalary}
                onChange={(e) => updateProfileData({ expectedSalary: e.target.value })}
                placeholder="e.g., R25,000 - R35,000 per month"
              />
              <p className="text-xs text-gray-500">Providing salary expectations helps with better matches</p>
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
                  <h3 className="font-semibold text-blue-900">Almost done!</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Review your profile information below. You can edit any section by clicking "Previous".
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{profileData.displayName || 'Not provided'}</span>
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{profileData.email || 'Not provided'}</span>
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{profileData.phone || 'Not provided'}</span>
                </div>
                {profileData.bio && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600">Bio:</span>
                    <p className="mt-1">{profileData.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills & Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">{profileData.currentRole || 'Not provided'}</span>
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{profileData.yearsExperience || 'Not provided'}</span>
                  <span className="text-gray-600">Education:</span>
                  <span className="font-medium">{profileData.education || 'Not provided'}</span>
                </div>
                {profileData.skills.length > 0 && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600">Skills:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{profileData.city}, {profileData.province}</span>
                  <span className="text-gray-600">Relocation:</span>
                  <span className="font-medium">{profileData.willingToRelocate ? 'Yes' : 'No'}</span>
                  <span className="text-gray-600">Remote Work:</span>
                  <span className="font-medium capitalize">{profileData.remoteWork.replace('-', ' ')}</span>
                  <span className="text-gray-600">Availability:</span>
                  <span className="font-medium capitalize">{profileData.availability.replace('-', ' ')}</span>
                  {profileData.expectedSalary && (
                    <>
                      <span className="text-gray-600">Expected Salary:</span>
                      <span className="font-medium">{profileData.expectedSalary}</span>
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
        return profileData.displayName && profileData.email;
      case 2:
        return profileData.currentRole && profileData.yearsExperience && profileData.skills.length >= 3;
      case 3:
        return profileData.province && profileData.city && profileData.availability;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Let's get you matched with amazing opportunities</p>
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
              {currentStep === 1 && <User className="h-5 w-5" />}
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
