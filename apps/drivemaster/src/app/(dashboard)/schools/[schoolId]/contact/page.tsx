'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { DrivingSchoolService, DrivingSchool } from '@/lib/services/DrivingSchoolService';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';

export default function ContactSchoolPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;

  const [school, setSchool] = useState<DrivingSchool | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadSchool();
  }, [user, schoolId]);

  const loadSchool = async () => {
    try {
      const drivingSchoolService = new DrivingSchoolService();
      const fetchedSchool = await drivingSchoolService.getSchool(schoolId);
      setSchool(fetchedSchool);
    } catch (error) {
      console.error('Error loading school:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !school) return;

    setSubmitting(true);
    try {
      const drivingSchoolService = new DrivingSchoolService();
      await drivingSchoolService.createLead(
        schoolId,
        user.uid,
        formData,
        'discovery'
      );
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">School Not Found</h2>
          <Link href="/schools">
            <Button>Back to Schools</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
          <p className="text-gray-600 mb-6">
            Your message has been sent to {school.name}. They will contact you soon.
          </p>
          <div className="space-y-3">
            <Link href="/schools">
              <Button variant="secondary" className="w-full">
                Browse More Schools
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="w-full">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/schools">
            <Button variant="secondary">← Back to Schools</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* School Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Logo and Name */}
            <div className="flex items-center gap-4 mb-6">
              {school.logoUrl ? (
                <img
                  src={school.logoUrl}
                  alt={school.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
                  🚗
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{school.name}</h1>
                <div className="text-sm text-gray-600">
                  {school.regions.join(', ')}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-gray-700 text-sm">{school.description}</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📞</span>
                  <span>{school.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📧</span>
                  <span>{school.contactEmail}</span>
                </div>
                {school.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>🌐</span>
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      {school.website}
                    </a>
                  </div>
                )}
                <div className="flex items-start gap-2 text-gray-600">
                  <span>📍</span>
                  <span>{school.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="e.g., 0821234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  placeholder="Tell us about your driving lesson needs..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By contacting this school, you agree to share your contact information with them.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
