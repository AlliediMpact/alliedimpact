'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { ArrowRight, Lightbulb, Clock, DollarSign, FileText } from 'lucide-react';

type ProjectType = 'web-app' | 'mobile-app' | 'web-mobile' | 'api-integration' | 'custom' | '';
type BudgetRange = 'under-50k' | '50k-100k' | '100k-250k' | '250k-500k' | '500k-plus' | '';
type Timeline = '1-3-months' | '3-6-months' | '6-12-months' | '12-plus-months' | '';

interface DiscoveryFormData {
  projectType: ProjectType;
  customProjectType?: string;
  budgetRange: BudgetRange;
  timeline: Timeline;
  description: string;
  organizationName?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
}

export default function SolutionDiscoveryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<DiscoveryFormData>({
    projectType: '',
    budgetRange: '',
    timeline: '',
    description: '',
    contactName: '',
    contactEmail: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectTypes = [
    { value: 'web-app', label: 'Web Application', description: 'Browser-based platform' },
    { value: 'mobile-app', label: 'Mobile App', description: 'iOS/Android application' },
    { value: 'web-mobile', label: 'Web + Mobile', description: 'Full cross-platform solution' },
    { value: 'api-integration', label: 'API/Integration', description: 'Connect systems together' },
    { value: 'custom', label: 'Custom Solution', description: 'Something unique' }
  ];

  const budgetRanges = [
    { value: 'under-50k', label: 'Under R50,000', description: 'Small projects' },
    { value: '50k-100k', label: 'R50,000 - R100,000', description: 'Standard projects' },
    { value: '100k-250k', label: 'R100,000 - R250,000', description: 'Medium projects' },
    { value: '250k-500k', label: 'R250,000 - R500,000', description: 'Large projects' },
    { value: '500k-plus', label: 'R500,000+', description: 'Enterprise projects' }
  ];

  const timelines = [
    { value: '1-3-months', label: '1-3 Months', description: 'Quick turnaround' },
    { value: '3-6-months', label: '3-6 Months', description: 'Standard timeline' },
    { value: '6-12-months', label: '6-12 Months', description: 'Complex project' },
    { value: '12-plus-months', label: '12+ Months', description: 'Long-term development' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Encode discovery data for URL
      const discoveryData = {
        projectType: formData.projectType,
        customProjectType: formData.customProjectType,
        budgetRange: formData.budgetRange,
        timeline: formData.timeline,
        description: formData.description,
        organizationName: formData.organizationName,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone
      };

      // Create discovery session
      const response = await fetch('/api/solutions/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discoveryData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit discovery form');
      }

      const { discoveryId } = await response.json();

      // Redirect to My Projects signup with discovery ID
      const myProjectsUrl = process.env.NEXT_PUBLIC_MYPROJECTS_URL || 'http://localhost:3006';
      window.location.href = `${myProjectsUrl}/signup?discovery=${discoveryId}`;
    } catch (error) {
      console.error('Discovery submission error:', error);
      alert('Failed to submit discovery form. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Lightbulb className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-3">Start Your Project</h1>
        <p className="text-xl text-gray-600">
          Tell us about your vision and we'll create a tailored development plan
        </p>
      </div>

      {/* Discovery Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              What are you building?
            </CardTitle>
            <CardDescription>Select the type of solution you need</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectTypes.map((type) => (
              <label
                key={type.value}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.projectType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="projectType"
                  value={type.value}
                  checked={formData.projectType === type.value}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                  className="mt-1"
                  required
                />
                <div>
                  <div className="font-semibold">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </div>
              </label>
            ))}
            {formData.projectType === 'custom' && (
              <input
                type="text"
                placeholder="Describe your custom solution..."
                value={formData.customProjectType || ''}
                onChange={(e) => setFormData({ ...formData, customProjectType: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            )}
          </CardContent>
        </Card>

        {/* Budget Range */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              What's your budget?
            </CardTitle>
            <CardDescription>This helps us recommend the right approach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {budgetRanges.map((budget) => (
              <label
                key={budget.value}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.budgetRange === budget.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="budgetRange"
                  value={budget.value}
                  checked={formData.budgetRange === budget.value}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value as BudgetRange })}
                  className="mt-1"
                  required
                />
                <div>
                  <div className="font-semibold">{budget.label}</div>
                  <div className="text-sm text-gray-600">{budget.description}</div>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              When do you need it?
            </CardTitle>
            <CardDescription>Expected project timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {timelines.map((time) => (
              <label
                key={time.value}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.timeline === time.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="timeline"
                  value={time.value}
                  checked={formData.timeline === time.value}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value as Timeline })}
                  className="mt-1"
                  required
                />
                <div>
                  <div className="font-semibold">{time.label}</div>
                  <div className="text-sm text-gray-600">{time.description}</div>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Project Description */}
        <Card>
          <CardHeader>
            <CardTitle>Tell us more</CardTitle>
            <CardDescription>Describe your project vision, goals, and key features</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Example: We need a platform where schools can manage student records, track attendance, and communicate with parents..."
              className="w-full px-4 py-3 border rounded-lg min-h-32"
              required
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>How should we contact you?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Organization Name (Optional)</label>
              <input
                type="text"
                value={formData.organizationName || ''}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                placeholder="Your company or organization"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Name *</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Your full name"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
              <input
                type="tel"
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+27 XX XXX XXXX"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 text-lg"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                Continue to My Projects
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
