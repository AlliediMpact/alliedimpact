'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { AdminService } from '@/lib/services/AdminService';
import { DrivingSchool } from '@/lib/services/DrivingSchoolService';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';

export default function AdminSchoolsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<DrivingSchool[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadSchools();
  }, [user, filter]);

  const loadSchools = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const adminService = new AdminService();
      const adminStatus = await adminService.isAdmin(user.uid);
      
      if (!adminStatus) {
        router.push('/dashboard');
        return;
      }

      let fetchedSchools: DrivingSchool[];
      if (filter === 'pending') {
        fetchedSchools = await adminService.getPendingSchools();
      } else {
        fetchedSchools = await adminService.getAllSchools();
        if (filter === 'approved') {
          fetchedSchools = fetchedSchools.filter((s) => s.isApproved);
        }
      }

      setSchools(fetchedSchools);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (schoolId: string) => {
    try {
      const adminService = new AdminService();
      await adminService.approveSchool(schoolId);
      alert('School approved!');
      loadSchools();
    } catch (error) {
      console.error('Error approving school:', error);
      alert('Failed to approve school.');
    }
  };

  const handleReject = async (schoolId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const adminService = new AdminService();
      await adminService.rejectSchool(schoolId, reason);
      alert('School rejected.');
      loadSchools();
    } catch (error) {
      console.error('Error rejecting school:', error);
      alert('Failed to reject school.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const pendingCount = schools.filter((s) => !s.isApproved).length;
  const approvedCount = schools.filter((s) => s.isApproved).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">School Management</h1>
              <p className="text-sm text-gray-600">Review and approve driving school registrations</p>
            </div>
            <Link href="/admin">
              <Button variant="secondary">← Admin Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Schools ({schools.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'approved'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({approvedCount})
            </button>
          </div>

          {/* Schools List */}
          {schools.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🏫</div>
              <p>No schools found in this category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schools.map((school) => (
                <SchoolCard
                  key={school.schoolId}
                  school={school}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SchoolCard({
  school,
  onApprove,
  onReject,
}: {
  school: DrivingSchool;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div
      className={`border-2 rounded-lg p-6 ${
        school.isApproved ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
      }`}
    >
      <div className="flex items-start gap-6">
        {/* Logo */}
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

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                {school.name}
                {school.isApproved ? (
                  <span className="text-green-600 text-sm">✓ Approved</span>
                ) : (
                  <span className="text-yellow-600 text-sm">⏳ Pending</span>
                )}
              </h3>
              <div className="text-sm text-gray-600">
                {school.regions.join(', ')}
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>Created: {new Date(school.createdAt).toLocaleDateString()}</div>
              <div>Active: {school.isActive ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <p className="text-gray-700 mb-4">{school.description}</p>

          <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <div className="font-semibold mb-2">Contact Info:</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span>📧</span>
                  <span>{school.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{school.contactPhone}</span>
                </div>
                {school.website && (
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {school.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2">Address:</div>
              <div className="text-gray-700">{school.address}</div>
            </div>
          </div>

          {/* Actions */}
          {!school.isApproved && (
            <div className="flex gap-3">
              <Button onClick={() => onApprove(school.schoolId)} className="flex-1">
                ✓ Approve School
              </Button>
              <Button
                onClick={() => onReject(school.schoolId)}
                variant="destructive"
                className="flex-1"
              >
                ✗ Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
