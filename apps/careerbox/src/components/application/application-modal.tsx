'use client';

import { useState } from 'react';
import { X, FileText, Send, CheckCircle } from 'lucide-react';
import { AnimatedModal } from '@/components/ui/animated/animated-modal';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToastHelpers } from '@/components/ui/toast';
import { validateRequired, validateMinLength, validateFile } from '@/utils/validation';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
  listingId: string;
  onSubmitSuccess?: () => void;
}

interface ApplicationData {
  coverLetter: string;
  resumeFile: File | null;
  portfolioUrl: string;
  availability: string;
  expectedSalary: string;
  additionalInfo: string;
}

export function ApplicationModal({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  listingId,
  onSubmitSuccess,
}: ApplicationModalProps) {
  const { success: showSuccess, error: showError } = useToastHelpers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    coverLetter: '',
    resumeFile: null,
    portfolioUrl: '',
    availability: 'immediate',
    expectedSalary: '',
    additionalInfo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const updateData = (updates: Partial<ApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...updates }));
  };

  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'coverLetter':
        const coverLetterValidation = validateRequired(value, 'Cover letter');
        if (!coverLetterValidation.isValid) return coverLetterValidation.error!;
        const minLengthValidation = validateMinLength(value, 100, 'Cover letter');
        if (!minLengthValidation.isValid) return minLengthValidation.error!;
        return null;

      case 'resumeFile':
        if (!value) return 'Please upload your resume';
        const fileValidation = validateFile(value, {
          required: true,
          maxSize: 5 * 1024 * 1024, // 5MB in bytes
          allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        });
        return fileValidation.isValid ? null : fileValidation.error!;

      default:
        return null;
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, applicationData[field as keyof ApplicationData]);
    setErrors(prev => ({ ...prev, [field]: error || '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    updateData({ resumeFile: file });
    setTouched(prev => ({ ...prev, resumeFile: true }));
    const error = validateField('resumeFile', file);
    setErrors(prev => ({ ...prev, resumeFile: error || '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const coverLetterError = validateField('coverLetter', applicationData.coverLetter);
    if (coverLetterError) newErrors.coverLetter = coverLetterError;

    const resumeError = validateField('resumeFile', applicationData.resumeFile);
    if (resumeError) newErrors.resumeFile = resumeError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please complete all required fields correctly');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to submit application
      const formData = new FormData();
      formData.append('listingId', listingId);
      formData.append('coverLetter', applicationData.coverLetter);
      if (applicationData.resumeFile) {
        formData.append('resume', applicationData.resumeFile);
      }
      formData.append('portfolioUrl', applicationData.portfolioUrl);
      formData.append('availability', applicationData.availability);
      formData.append('expectedSalary', applicationData.expectedSalary);
      formData.append('additionalInfo', applicationData.additionalInfo);

      console.log('Submitting application:', Object.fromEntries(formData));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      showSuccess('Application submitted successfully!');
      onSubmitSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      showError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
          <p className="text-sm text-gray-600 mt-1">
            {jobTitle} at {companyName}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              value={applicationData.coverLetter}
              onChange={(e) => updateData({ coverLetter: e.target.value })}
              onBlur={() => handleBlur('coverLetter')}
              placeholder="Tell us why you're a great fit for this role..."
              rows={6}
              required
              className={errors.coverLetter && touched.coverLetter ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-500">
              {applicationData.coverLetter.length} / 100 minimum characters
            </p>
            {errors.coverLetter && touched.coverLetter && (
              <p className="text-sm text-red-600">{errors.coverLetter}</p>
            )}
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume">Resume / CV *</Label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('resume')?.click()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              {applicationData.resumeFile && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {applicationData.resumeFile.name}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
            {errors.resumeFile && touched.resumeFile && (
              <p className="text-sm text-red-600">{errors.resumeFile}</p>
            )}
          </div>

          {/* Portfolio URL */}
          <div className="space-y-2">
            <Label htmlFor="portfolioUrl">Portfolio / LinkedIn URL (Optional)</Label>
            <Input
              id="portfolioUrl"
              type="url"
              value={applicationData.portfolioUrl}
              onChange={(e) => updateData({ portfolioUrl: e.target.value })}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <select
              id="availability"
              value={applicationData.availability}
              onChange={(e) => updateData({ availability: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">Immediate</option>
              <option value="2-weeks">2 Weeks Notice</option>
              <option value="1-month">1 Month Notice</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>

          {/* Expected Salary */}
          <div className="space-y-2">
            <Label htmlFor="expectedSalary">Expected Salary (Optional)</Label>
            <Input
              id="expectedSalary"
              type="text"
              value={applicationData.expectedSalary}
              onChange={(e) => updateData({ expectedSalary: e.target.value })}
              placeholder="e.g., R50,000 - R70,000 per month"
            />
          </div>

          {/* Additional Info */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
            <Textarea
              id="additionalInfo"
              value={applicationData.additionalInfo}
              onChange={(e) => updateData({ additionalInfo: e.target.value })}
              placeholder="Any other information you'd like to share..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
