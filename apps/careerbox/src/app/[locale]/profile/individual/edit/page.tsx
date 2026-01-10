'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit, Save, X } from 'lucide-react';
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
  validateMinLength,
} from '@/utils/validation';

interface IndividualProfile {
  displayName: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  bio: string;
  currentRole: string;
  yearsExperience: string;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  workHistory: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
}

export default function EditIndividualProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string || 'en';
  const { success: showSuccess, error: showError } = useToastHelpers();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<IndividualProfile>({
    displayName: '',
    email: '',
    phone: '',
    city: '',
    province: '',
    bio: '',
    currentRole: '',
    yearsExperience: '',
    skills: [],
    education: [],
    workHistory: [],
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
        displayName: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+27 82 123 4567',
        city: 'Johannesburg',
        province: 'Gauteng',
        bio: 'Passionate software engineer with 5+ years of experience building scalable web applications. Skilled in React, Node.js, and cloud technologies.',
        currentRole: 'Senior Software Engineer',
        yearsExperience: '5',
        skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
        education: [
          {
            degree: 'BSc Computer Science',
            institution: 'University of Johannesburg',
            year: '2018',
          },
        ],
        workHistory: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Solutions SA',
            startDate: '2021-01',
            endDate: 'Present',
            description: 'Leading development of cloud-based applications',
          },
          {
            title: 'Software Engineer',
            company: 'StartupCo',
            startDate: '2019-06',
            endDate: '2020-12',
            description: 'Built full-stack web applications using React and Node.js',
          },
        ],
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
      case 'displayName':
        return validateRequired(value, 'Display Name')?.error || validateMinLength(value, 2, 'Display Name')?.error || '';
      case 'email':
        return validateRequired(value, 'Email')?.error || validateEmail(value)?.error || '';
      case 'phone':
        return value ? validatePhone(value)?.error || '' : '';
      case 'city':
        return validateRequired(value, 'City')?.error || '';
      case 'province':
        return validateRequired(value, 'Province')?.error || '';
      case 'bio':
        return validateRequired(value, 'Bio')?.error || validateMinLength(value, 50, 'Bio')?.error || '';
      case 'currentRole':
        return validateRequired(value, 'Current Role')?.error || '';
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
    const fieldsToValidate = ['displayName', 'email', 'city', 'province', 'bio', 'currentRole'];
    const newErrors: Record<string, string> = {};
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, profile[field as keyof IndividualProfile] as string);
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
      
      showSuccess('Profile updated successfully!');
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
              {isEditing ? 'Edit Profile' : 'My Profile'}
            </h1>
            <p className="text-gray-600">Manage your personal information and work history</p>
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

        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              {isEditing ? (
                <>
                  <Input
                    name="displayName"
                    value={profile.displayName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.displayName && touched.displayName ? 'border-red-500' : ''}
                  />
                  {errors.displayName && touched.displayName && (
                    <p className="text-sm text-red-600 mt-1">{errors.displayName}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900">{profile.displayName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
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
                    placeholder="+27 82 123 4567"
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

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                {isEditing ? (
                  <>
                    <Input
                      name="city"
                      value={profile.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.city && touched.city ? 'border-red-500' : ''}
                    />
                    {errors.city && touched.city && (
                      <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-900">{profile.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province *
                </label>
                {isEditing ? (
                  <>
                    <select
                      name="province"
                      value={profile.province}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.province && touched.province ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select province</option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="Western Cape">Western Cape</option>
                      <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                      <option value="Eastern Cape">Eastern Cape</option>
                      <option value="Free State">Free State</option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">Mpumalanga</option>
                      <option value="Northern Cape">Northern Cape</option>
                      <option value="North West">North West</option>
                    </select>
                    {errors.province && touched.province && (
                      <p className="text-sm text-red-600 mt-1">{errors.province}</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {profile.province}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Role *
              </label>
              {isEditing ? (
                <>
                  <Input
                    name="currentRole"
                    value={profile.currentRole}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.currentRole && touched.currentRole ? 'border-red-500' : ''}
                  />
                  {errors.currentRole && touched.currentRole && (
                    <p className="text-sm text-red-600 mt-1">{errors.currentRole}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  {profile.currentRole}
                </p>
              )}
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              {isEditing ? (
                <Input
                  name="yearsExperience"
                  type="number"
                  value={profile.yearsExperience}
                  onChange={handleChange}
                  placeholder="5"
                />
              ) : (
                <p className="text-gray-900">{profile.yearsExperience} years</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Bio *
              </label>
              {isEditing ? (
                <>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bio && touched.bio ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.bio && touched.bio && (
                    <p className="text-sm text-red-600 mt-1">{errors.bio}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    {profile.bio.length}/50 minimum characters
                  </p>
                </>
              ) : (
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="default">
                    {skill}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <p className="text-sm text-gray-600 mt-2">
                  To edit skills, use the skills management section in your dashboard
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Work History */}
        <Card>
          <CardHeader>
            <CardTitle>Work History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.workHistory.map((job, index) => (
                <div key={index} className="border-l-2 border-blue-600 pl-4 py-2">
                  <h4 className="font-bold text-gray-900">{job.title}</h4>
                  <p className="text-gray-700">{job.company}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {job.startDate} - {job.endDate}
                  </p>
                  <p className="text-gray-700 mt-2">{job.description}</p>
                </div>
              ))}
            </div>
            {isEditing && (
              <p className="text-sm text-gray-600 mt-4">
                To edit work history, use the work history management section in your dashboard
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
