'use client';

import { useDashboard } from '../lib/dashboard-context';
import { analytics, AnalyticsEvents } from '../lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Clock,
  ArrowUpRight,
  Download,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserTransactions } from '@allied-impact/billing';
import { format } from 'date-fns';
import type { ProductEntitlement } from '@allied-impact/types';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  productId: string;
  description: string;
}

interface SubscriptionCardProps {
  entitlement: ProductEntitlement;
}

function SubscriptionCard({ entitlement }: SubscriptionCardProps) {
  const getProductName = (productId: string) => {
    const names: Record<string, string> = {
      'coinbox': 'Coin Box',
      'drive-master': 'Drive Master',
      'codetech': 'CodeTech',
      'umkhanyakude': 'Umkhanyakude',
    };
    return names[productId] || productId;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{getProductName(entitlement.productId)}</CardTitle>
            <CardDescription className="mt-1">
              Subscription ID: {entitlement.subscriptionId || 'N/A'}
            </CardDescription>
          </div>
          {getStatusBadge(entitlement.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">
              {entitlement.startDate ? format(new Date(entitlement.startDate), 'MMM dd, yyyy') : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">End Date</p>
            <p className="font-medium">
              {entitlement.endDate ? format(new Date(entitlement.endDate), 'MMM dd, yyyy') : 'No expiry'}
            </p>
          </div>
        </div>

        {entitlement.tier && (
          <div>
            <p className="text-sm text-muted-foreground">Plan Tier</p>
            <p className="font-medium capitalize">{entitlement.tier}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {entitlement.status === 'active' && (
            <>
              <Button variant="outline" size="sm" className="flex-1">
                Upgrade
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Cancel
              </Button>
            </>
          )}
          {entitlement.status === 'expired' && (
            <Button className="w-full" size="sm">
              Renew Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentHistoryTable({ transactions }: { transactions: Transaction[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProductName = (productId: string) => {
    const names: Record<string, string> = {
      'coinbox': 'Coin Box',
      'drive-master': 'Drive Master',
      'codetech': 'CodeTech',
      'umkhanyakude': 'Umkhanyakude',
    };
    return names[productId] || productId;
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No payment history</p>
          <p className="text-sm text-muted-foreground">
            Your payment transactions will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment History</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Description</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Product</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b last:border-0 hover:bg-accent/50">
                  <td className="py-3 px-4 text-sm">
                    {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-sm">{transaction.description}</td>
                  <td className="py-3 px-4 text-sm">{getProductName(transaction.productId)}</td>
                  <td className="py-3 px-4 text-sm font-medium">
                    {transaction.currency.toUpperCase()} {transaction.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium capitalize ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionsPage() {
  const { user, entitlements, loading } = useDashboard();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {    if (platformUser) {
      analytics.page('Subscriptions', {
        userId: platformUser.uid,
        subscriptionCount: entitlements.length,
      });
    }
  }, [platformUser, entitlements]);

  useEffect(() => {    const loadTransactions = async () => {
      if (!user) return;
      
      try {
        setLoadingTransactions(true);
        const userTransactions = await getUserTransactions(user.uid);
        setTransactions(userTransactions as Transaction[]);
      } catch (error) {
        console.error('Failed to load transactions:', error);
        setTransactions([]);
      } finally {
        setLoadingTransactions(false);
      }
    };

    loadTransactions();
  }, [user]);

  const activeSubscriptions = entitlements.filter(e => e.status === 'active');
  const inactiveSubscriptions = entitlements.filter(e => e.status !== 'active');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Subscriptions</h1>
        <p className="text-muted-foreground text-lg">
          Manage your product subscriptions and billing
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R {transactions
                .filter(t => t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">
              Saved methods
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Subscriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSubscriptions.map((entitlement) => (
              <SubscriptionCard key={entitlement.id} entitlement={entitlement} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Previous Subscriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inactiveSubscriptions.map((entitlement) => (
              <SubscriptionCard key={entitlement.id} entitlement={entitlement} />
            ))}
          </div>
        </div>
      )}

      {/* No Subscriptions Message */}
      {entitlements.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No active subscriptions</p>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to products to get started
            </p>
            <Button>
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Payment History</h2>
        {loadingTransactions ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <PaymentHistoryTable transactions={transactions} />
        )}
      </div>
    </div>
  );
}
