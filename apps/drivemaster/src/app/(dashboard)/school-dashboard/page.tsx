'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  DrivingSchoolService,
  DrivingSchool,
  Lead,
  AdSubscription,
} from '@/lib/services/DrivingSchoolService';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';

export default function SchoolDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [school, setSchool] = useState<DrivingSchool | null>(null);
  const [subscription, setSubscription] = useState<AdSubscription | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadSchoolData();
  }, [user]);

  const loadSchoolData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const drivingSchoolService = new DrivingSchoolService();

      // Get school by owner
      const schools = await drivingSchoolService.getSchoolsByOwner(user.uid);
      if (schools.length > 0) {
        const mySchool = schools[0];
        setSchool(mySchool);

        // Get subscription
        const sub = await drivingSchoolService.getActiveSubscription(mySchool.schoolId);
        setSubscription(sub);

        // Get leads
        const schoolLeads = await drivingSchoolService.getSchoolLeads(mySchool.schoolId);
        setLeads(schoolLeads);
      }
    } catch (error) {
      console.error('Error loading school data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLead = async (leadId: string) => {
    try {
      const drivingSchoolService = new DrivingSchoolService();
      await drivingSchoolService.confirmLead(leadId);
      loadSchoolData(); // Reload
      alert('Lead confirmed! Commission will be calculated.');
    } catch (error) {
      console.error('Error confirming lead:', error);
      alert('Failed to confirm lead.');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🏫</div>
          <h2 className="text-2xl font-bold mb-2">No School Profile</h2>
          <p className="text-gray-600 mb-6">
            You haven't created a driving school profile yet.
          </p>
          <Link href="/schools/register">
            <Button className="w-full">Create School Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  const pendingLeads = leads.filter((l) => l.status === 'pending');
  const confirmedLeads = leads.filter((l) => l.status === 'confirmed');
  const totalCommission = confirmedLeads.reduce((sum, l) => sum + l.commissionAmount, 0);
  const unpaidCommission = confirmedLeads
    .filter((l) => !l.commissionPaid)
    .reduce((sum, l) => sum + l.commissionAmount, 0);

  const daysRemaining = subscription
    ? Math.ceil((subscription.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">School Dashboard</h1>
              <p className="text-sm text-gray-600">{school.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/schools/${school.schoolId}/edit`}>
                <Button variant="secondary">Edit Profile</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Learner Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Subscription Status"
            value={subscription ? 'Active' : 'Inactive'}
            icon={subscription ? '✅' : '❌'}
            color={subscription ? 'green' : 'red'}
          />
          <StatCard
            label="Days Remaining"
            value={subscription ? daysRemaining : 0}
            icon="📅"
            suffix="days"
          />
          <StatCard label="Total Leads" value={leads.length} icon="📊" />
          <StatCard label="Confirmed Leads" value={confirmedLeads.length} icon="✓" />
        </div>

        {/* Commission Summary */}
        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Commission Summary</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm opacity-90">Total Commission Earned</div>
              <div className="text-3xl font-bold">R{totalCommission.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm opacity-90">Unpaid Commission</div>
              <div className="text-3xl font-bold">R{unpaidCommission.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm opacity-90">Conversion Rate</div>
              <div className="text-3xl font-bold">
                {leads.length > 0 ? ((confirmedLeads.length / leads.length) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        {!subscription && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">No Active Subscription</h3>
                <p className="text-gray-700 mb-4">
                  Your ads are not being displayed to learners. Subscribe to activate your school profile.
                </p>
                <Link href={`/schools/${school.schoolId}/subscribe`}>
                  <Button>Subscribe Now</Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Pending Leads */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">
            Pending Leads ({pendingLeads.length})
          </h3>
          {pendingLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending leads at the moment.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLeads.map((lead) => (
                <LeadCard key={lead.leadId} lead={lead} onConfirm={handleConfirmLead} />
              ))}
            </div>
          )}
        </div>

        {/* Confirmed Leads */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            Confirmed Leads ({confirmedLeads.length})
          </h3>
          {confirmedLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No confirmed leads yet.
            </div>
          ) : (
            <div className="space-y-4">
              {confirmedLeads.map((lead) => (
                <ConfirmedLeadCard key={lead.leadId} lead={lead} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  suffix,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  suffix?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : ''}`}>
        {value}
        {suffix && <span className="text-sm ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function LeadCard({ lead, onConfirm }: { lead: Lead; onConfirm: (id: string) => void }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-lg">{lead.learnerName}</h4>
          <div className="text-sm text-gray-600">
            {new Date(lead.createdAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Source: {lead.source.replace('_', ' ')}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Commission</div>
          <div className="text-xl font-bold text-green-600">
            R{lead.commissionAmount.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2">
          <span>📧</span>
          <span>{lead.learnerEmail}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📞</span>
          <span>{lead.learnerPhone}</span>
        </div>
        <div className="bg-gray-50 p-3 rounded mt-2">
          <div className="font-semibold mb-1">Message:</div>
          <div className="text-gray-700">{lead.message}</div>
        </div>
      </div>

      <Button onClick={() => onConfirm(lead.leadId)} className="w-full">
        Confirm Conversion
      </Button>
    </div>
  );
}

function ConfirmedLeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold">{lead.learnerName}</h4>
            <span className="text-green-600 text-sm">✓ Confirmed</span>
          </div>
          <div className="text-sm text-gray-600">
            {lead.confirmedAt && new Date(lead.confirmedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Commission</div>
          <div className="font-bold text-green-600">
            R{lead.commissionAmount.toFixed(2)}
            {lead.commissionPaid && <span className="text-xs ml-1">(Paid)</span>}
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        {lead.learnerEmail} • {lead.learnerPhone}
      </div>
    </div>
  );
}
