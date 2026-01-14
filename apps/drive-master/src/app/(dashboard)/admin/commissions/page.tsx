'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { AdminService } from '@/lib/services/AdminService';
import { CommissionStatement } from '@/lib/services/DrivingSchoolService';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';

export default function AdminCommissionsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [statements, setStatements] = useState<CommissionStatement[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadStatements();
  }, [user]);

  const loadStatements = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const adminService = new AdminService();
      const adminStatus = await adminService.isAdmin(user.uid);
      
      if (!adminStatus) {
        router.push('/dashboard');
        return;
      }

      const fetchedStatements = await adminService.getAllCommissionStatements();
      setStatements(fetchedStatements);
    } catch (error) {
      console.error('Error loading statements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStatements = async () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const confirmed = confirm(
      `Generate commission statements for ${month}? This will create statements for all schools with confirmed leads.`
    );
    
    if (!confirmed) return;

    setGenerating(true);
    try {
      const adminService = new AdminService();
      const count = await adminService.generateMonthlyStatements(month);
      alert(`Generated ${count} commission statements for ${month}`);
      loadStatements();
    } catch (error) {
      console.error('Error generating statements:', error);
      alert('Failed to generate statements.');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsPaid = async (statementId: string) => {
    const reference = prompt('Enter payment reference number:');
    if (!reference) return;

    try {
      const adminService = new AdminService();
      await adminService.markCommissionAsPaid(statementId, reference);
      alert('Commission marked as paid!');
      loadStatements();
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Failed to mark as paid.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const unpaidStatements = statements.filter((s) => !s.isPaid);
  const paidStatements = statements.filter((s) => s.isPaid);
  const totalUnpaid = unpaidStatements.reduce((sum, s) => sum + s.totalCommission, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Commission Management</h1>
              <p className="text-sm text-gray-600">Manage monthly commission payments to schools</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleGenerateStatements} disabled={generating}>
                {generating ? 'Generating...' : '📊 Generate Statements'}
              </Button>
              <Link href="/admin">
                <Button variant="secondary">← Admin Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-lg shadow-lg p-6">
            <div className="text-sm opacity-90 mb-2">Unpaid Commissions</div>
            <div className="text-3xl font-bold">R{totalUnpaid.toFixed(2)}</div>
            <div className="text-sm mt-2">{unpaidStatements.length} statements</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-lg shadow-lg p-6">
            <div className="text-sm opacity-90 mb-2">Paid This Month</div>
            <div className="text-3xl font-bold">
              R
              {paidStatements
                .filter((s) => {
                  const now = new Date();
                  const paidDate = s.paidAt;
                  return (
                    paidDate &&
                    paidDate.getMonth() === now.getMonth() &&
                    paidDate.getFullYear() === now.getFullYear()
                  );
                })
                .reduce((sum, s) => sum + s.totalCommission, 0)
                .toFixed(2)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg shadow-lg p-6">
            <div className="text-sm opacity-90 mb-2">Total Statements</div>
            <div className="text-3xl font-bold">{statements.length}</div>
            <div className="text-sm mt-2">All time</div>
          </div>
        </div>

        {/* Unpaid Statements */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Unpaid Commissions ({unpaidStatements.length})</h3>
          {unpaidStatements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">✅</div>
              <p>No unpaid commissions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unpaidStatements.map((statement) => (
                <StatementCard
                  key={statement.statementId}
                  statement={statement}
                  onMarkAsPaid={handleMarkAsPaid}
                />
              ))}
            </div>
          )}
        </div>

        {/* Paid Statements */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Paid Commissions ({paidStatements.length})</h3>
          {paidStatements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No paid commissions yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paidStatements.map((statement) => (
                <PaidStatementCard key={statement.statementId} statement={statement} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatementCard({
  statement,
  onMarkAsPaid,
}: {
  statement: CommissionStatement;
  onMarkAsPaid: (id: string) => void;
}) {
  return (
    <div className="border-2 border-orange-200 bg-orange-50 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg">School ID: {statement.schoolId}</h4>
          <div className="text-sm text-gray-600">Month: {statement.month}</div>
          <div className="text-xs text-gray-500 mt-1">
            Created: {new Date(statement.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Total Commission</div>
          <div className="text-3xl font-bold text-orange-600">
            R{statement.totalCommission.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <div className="text-gray-600">Total Leads</div>
          <div className="font-bold">{statement.totalLeads}</div>
        </div>
        <div>
          <div className="text-gray-600">Confirmed Leads</div>
          <div className="font-bold">{statement.confirmedLeads}</div>
        </div>
        <div>
          <div className="text-gray-600">Status</div>
          <div className="font-bold text-orange-600">⏳ Unpaid</div>
        </div>
      </div>

      <Button onClick={() => onMarkAsPaid(statement.statementId)} className="w-full">
        💳 Mark as Paid
      </Button>
    </div>
  );
}

function PaidStatementCard({ statement }: { statement: CommissionStatement }) {
  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold">School ID: {statement.schoolId}</h4>
          <div className="text-sm text-gray-600">Month: {statement.month}</div>
          <div className="text-xs text-gray-500 mt-1">
            Paid: {statement.paidAt && new Date(statement.paidAt).toLocaleDateString()}
          </div>
          {statement.paymentReference && (
            <div className="text-xs text-gray-500">Ref: {statement.paymentReference}</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Commission</div>
          <div className="text-xl font-bold text-green-600">
            R{statement.totalCommission.toFixed(2)}
          </div>
          <div className="text-xs text-green-600 mt-1">✓ Paid</div>
        </div>
      </div>
    </div>
  );
}
