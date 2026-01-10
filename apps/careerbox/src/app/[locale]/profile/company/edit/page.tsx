'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, Mail, Phone, Globe, MapPin, Users, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useToastHelpers } from '@/components/ui/toast';
import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateUrl,
  validateMinLength,
} from '@/utils/validation';

interface CompanyProfile {
  companyName: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  companySize: string;
  industry: string;
  specializations: string[];
  locations: Array<{
    city: string;
    province: string;
  }>;
  foundedYear: string;
}

export default function EditCompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string || 'en';
  const { success: showSuccess, error: showError } = useToastHelpers();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    companySize: '',
    industry: '',
    specializations: [],
    locations: [],
    foundedYear: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // TODO: Call API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      setProfile({
        companyName: 'Tech Solutions SA',
        email: 'info@techsolutions.co.za',
        phone: '+27 11 123 4567',
        website: 'https://techsolutions.co.za',
        description: 'Leading technology solutions provider in South Africa, specializing in cloud computing, software development, and digital transformation services.',
        companySize: '51-200',
        industry: 'Information Technology',
        specializations: ['Cloud Computing', 'Software Development', 'DevOps', 'AI/ML'],
        locations: [
          { city: 'Johannesburg', province: 'Gauteng' },
          { city: 'Cape Town', province: 'Western Cape' },
        ],
        foundedYear: '2015',
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showError('Failed to load profile');
      setIsLoading(false);
    }
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'companyName':
        return validateRequired(value, 'Company Name')?.error || validateMinLength(value, 2, 'Company Name')?.error || '';
      case 'email':
        return validateRequired(value, 'Email')?.error || validateEmail(value)?.error || '';
      case 'phone':
        return value ? validatePhone(value)?.error || '' : '';
      case 'website':
        return value ? validateUrl(value)?.error || '' : '';
      case 'description':
        return validateRequired(value, 'Description')?.error || validateMinLength(value, 50, 'Description')?.error || '';
      case 'companySize':
        return validateRequired(value, 'Company Size')?.error || '';
      case 'industry':
        return validateRequired(value, 'Industry')?.error || '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSave = async () => {
    // Validate all fields
    const fieldsToValidate = ['companyName', 'email', 'description', 'companySize', 'industry'];
    const newErrors: Record<string, string> = {};
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, profile[field as keyof CompanyProfile] as string);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    const newTouched: Record<string, boolean> = {};
    fieldsToValidate.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    if (Object.keys(newErrors).length > 0) {
      showError('Please fix all errors before saving');
      return;
    }

    setIsSaving(true);

    try {
      // TODO: Call API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Company profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      showError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Reset to original data
    setErrors({});
    setTouched({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <LoadingSkeleton variant="text" width="200px" height="32px" className="mb-6" />
          <LoadingSkeleton variant="card" height="400px" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? 'Edit Company Profile' : 'Company Profile'}
            </h1>
            <p className="text-gray-600">Manage your company information and preferences</p>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        {/* Company Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              {isEditing ? (
                <>
                  <Input
                    name="companyName"
                    value={profile.companyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.companyName && touched.companyName ? 'border-red-500' : ''}
                  />
                  {errors.companyName && touched.companyName && (
                    <p className="text-sm text-red-600 mt-1">{errors.companyName}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {profile.companyName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Email *
              </label>
              {isEditing ? (
                <>
                  <Input
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.email && touched.email ? 'border-red-500' : ''}
                  />
                  {errors.email && touched.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {profile.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <>
                  <Input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+27 11 123 4567"
                    className={errors.phone && touched.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && touched.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {profile.phone}
                </p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              {isEditing ? (
                <>
                  <Input
                    name="website"
                    value={profile.website}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="https://example.com"
                    className={errors.website && touched.website ? 'border-red-500' : ''}
                  />
                  {errors.website && touched.website && (
                    <p className="text-sm text-red-600 mt-1">{errors.website}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    {profile.website}
                  </a>
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description *
              </label>
              {isEditing ? (
                <>
                  <textarea
                    name="description"
                    value={profile.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && touched.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    {profile.description.length}/50 minimum characters
                  </p>
                </>
              ) : (
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              )}
            </div>

            {/* Company Size & Industry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size *
                </label>
                {isEditing ? (
                  <>
                    <select
                      name="companySize"
                      value={profile.companySize}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.companySize && touched.companySize ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                    {errors.companySize && touched.companySize && (
                      <p className="text-sm text-red-600 mt-1">{errors.companySize}</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-900 flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    {profile.companySize} employees
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                {isEditing ? (
                  <>
                    <select
                      name="industry"
                      value={profile.industry}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.industry && touched.industry ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select industry</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Finance & Banking">Finance & Banking</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Telecommunications">Telecommunications</option>
                      <option value="Professional Services">Professional Services</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.industry && touched.industry && (
                      <p className="text-sm text-red-600 mt-1">{errors.industry}</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-900">{profile.industry}</p>
                )}
              </div>
            </div>

            {/* Founded Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Founded Year
              </label>
              {isEditing ? (
                <Input
                  name="foundedYear"
                  type="number"
                  value={profile.foundedYear}
                  onChange={handleChange}
                  placeholder="2015"
                  min="1900"
                  max="2026"
                />
              ) : (
                <p className="text-gray-900">Established in {profile.foundedYear}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Specializations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.specializations.map((spec, index) => (
                <Badge key={index} variant="default">
                  {spec}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <p className="text-sm text-gray-600 mt-4">
                To edit specializations, use the specializations management section in your dashboard
              </p>
            )}
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Office Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.locations.map((location, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{location.city}</p>
                    <p className="text-sm text-gray-600">{location.province}</p>
                  </div>
                </div>
              ))}
            </div>
            {isEditing && (
              <p className="text-sm text-gray-600 mt-4">
                To edit office locations, use the locations management section in your dashboard
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
