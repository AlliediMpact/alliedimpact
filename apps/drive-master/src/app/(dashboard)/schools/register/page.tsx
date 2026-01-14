'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { DrivingSchoolService } from '@/lib/services/DrivingSchoolService';
import { Button } from '@allied-impact/ui';

export default function SchoolRegisterPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    website: '',
    address: '',
    regions: [] as string[],
  });

  const provinces = [
    'Western Cape',
    'Eastern Cape',
    'Northern Cape',
    'Free State',
    'KwaZulu-Natal',
    'North West',
    'Gauteng',
    'Mpumalanga',
    'Limpopo',
  ];

  const handleRegionToggle = (region: string) => {
    setFormData({
      ...formData,
      regions: formData.regions.includes(region)
        ? formData.regions.filter((r) => r !== region)
        : [...formData.regions, region],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (formData.regions.length === 0) {
      alert('Please select at least one service region.');
      return;
    }

    setSubmitting(true);
    try {
      const drivingSchoolService = new DrivingSchoolService();
      const schoolId = await drivingSchoolService.createSchool(user.uid, formData);
      alert('School profile created! It will be reviewed by an admin before being activated.');
      router.push('/school-dashboard');
    } catch (error) {
      console.error('Error creating school:', error);
      alert('Failed to create school profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Register Your Driving School</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Create School Profile</h2>
            <p className="text-gray-600">
              Fill in your driving school details to start advertising to learners on DriveMaster.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Cape Town Driving Academy"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                placeholder="Tell learners about your driving school, experience, and what makes you unique..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                required
                placeholder="info@yourschool.co.za"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                required
                placeholder="0821234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Website (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-1">Website (Optional)</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourschool.co.za"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Physical Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                rows={2}
                placeholder="123 Main Street, Cape Town, 8001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Service Regions */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Service Regions <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Select all provinces where your school operates
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {provinces.map((province) => (
                  <label
                    key={province}
                    className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.regions.includes(province)}
                      onChange={() => handleRegionToggle(province)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{province}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Creating Profile...' : 'Create School Profile'}
              </Button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Your profile will be reviewed by our team before being published.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
