'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { AdminService } from '@/lib/services/AdminService';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    checkAdminAndLoadData();
  }, [user]);

  const checkAdminAndLoadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const adminService = new AdminService();
      const adminStatus = await adminService.isAdmin(user.uid);
      
      if (!adminStatus) {
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-100">DriveMaster Management Console</p>
            </div>
            <Link href="/dashboard">
              <Button variant="secondary">User Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Schools"
            value={stats.totalSchools}
            icon="🏫"
            color="blue"
          />
          <StatCard
            label="Active Schools"
            value={stats.activeSchools}
            icon="✅"
            color="green"
          />
          <StatCard
            label="Pending Approvals"
            value={stats.pendingSchools}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            label="Total Leads"
            value={stats.totalLeads}
            icon="📊"
            color="purple"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Revenue Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                <div className="text-3xl font-bold text-green-600">
                  R{stats.totalRevenue.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">This Month</div>
                <div className="text-2xl font-bold text-blue-600">
                  R{stats.monthlyRevenue.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Pending Commissions</div>
                <div className="text-2xl font-bold text-orange-600">
                  R{stats.pendingCommissions.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Lead Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Leads</div>
                <div className="text-3xl font-bold">{stats.totalLeads}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Confirmed Leads</div>
                <div className="text-2xl font-bold text-green-600">{stats.confirmedLeads}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Conversion Rate</div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalLeads > 0
                    ? ((stats.confirmedLeads / stats.totalLeads) * 100).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ActionCard
            title="School Approvals"
            description={`${stats.pendingSchools} pending review`}
            icon="🏫"
            buttonText="Review Schools"
            onClick={() => router.push('/admin/schools')}
            variant="purple"
          />
          <ActionCard
            title="Lead Management"
            description="Monitor all leads and conversions"
            icon="📊"
            buttonText="View Leads"
            onClick={() => router.push('/admin/leads')}
            variant="blue"
          />
          <ActionCard
            title="Commission Payments"
            description={`R${stats.pendingCommissions.toFixed(2)} pending`}
            icon="💰"
            buttonText="Manage Payments"
            onClick={() => router.push('/admin/commissions')}
            variant="green"
          />
        </div>

        {/* Alerts */}
        {stats.pendingSchools > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Action Required</h3>
                <p className="text-gray-700 mb-4">
                  You have {stats.pendingSchools} school registration{stats.pendingSchools > 1 ? 's' : ''} waiting for approval.
                </p>
                <Link href="/admin/schools">
                  <Button>Review Now</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    yellow: 'from-yellow-500 to-yellow-700',
    purple: 'from-purple-500 to-purple-700',
    orange: 'from-orange-500 to-orange-700',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm opacity-90">{label}</span>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  buttonText,
  onClick,
  variant,
}: {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  onClick: () => void;
  variant: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <Button onClick={onClick} className="w-full">
        {buttonText}
      </Button>
    </div>
  );
}
