'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAnalytics, AnalyticsData, formatCurrency, formatPercentage } from '@/lib/savings-jar-analytics';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity } from 'lucide-react';

export default function SavingsJarAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, period]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getAnalytics(user.uid, period);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <p>No analytics data available.</p>
      </div>
    );
  }

  const netChange = analytics.totalDeposited - analytics.totalWithdrawn;
  const savingsRate = analytics.totalDeposited > 0 
    ? (netChange / analytics.totalDeposited) * 100 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Savings Jar Analytics</h1>
          <p className="text-muted-foreground">Track your savings performance and trends</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod(7)}
            className={`px-4 py-2 rounded ${period === 7 ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`px-4 py-2 rounded ${period === 30 ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            30 Days
          </button>
          <button
            onClick={() => setPeriod(90)}
            className={`px-4 py-2 rounded ${period === 90 ? 'bg-primary text-white' : 'bg-gray-100'}`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {netChange >= 0 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{formatCurrency(netChange)} net
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  {formatCurrency(netChange)} net
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalDeposited)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.avgDepositsPerUser} deposits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(analytics.totalWithdrawn)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.avgWithdrawalsPerUser} withdrawals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(savingsRate)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(analytics.totalFeesCollected)} in fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="deposits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Trends</CardTitle>
              <CardDescription>Daily deposits over the last {period} days</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.depositTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Deposits"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Trends</CardTitle>
              <CardDescription>Daily withdrawals over the last {period} days</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.withdrawalTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Withdrawals"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deposits vs Withdrawals</CardTitle>
              <CardDescription>Compare your saving and spending patterns</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.depositTrends.map((d, i) => ({
                  date: d.date,
                  deposits: d.value,
                  withdrawals: analytics.withdrawalTrends[i]?.value || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="deposits" fill="#10b981" name="Deposits" />
                  <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Insights</CardTitle>
          <CardDescription>Personalized recommendations based on your behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {savingsRate >= 80 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900">🎉 Excellent savings rate!</p>
              <p className="text-sm text-green-700 mt-1">
                You're keeping {formatPercentage(savingsRate)} of your deposits. Keep up the great work!
              </p>
            </div>
          )}

          {savingsRate < 50 && analytics.totalWithdrawn > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-900">💡 Tip: Reduce withdrawals</p>
              <p className="text-sm text-yellow-700 mt-1">
                Try to withdraw less frequently to build up your savings faster. Consider setting a weekly withdrawal limit.
              </p>
            </div>
          )}

          {analytics.avgDepositsPerUser > 10 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">⭐ Great saving habit!</p>
              <p className="text-sm text-blue-700 mt-1">
                You've made {analytics.avgDepositsPerUser} deposits in the last {period} days. Consistent savings lead to financial success!
              </p>
            </div>
          )}

          {analytics.totalBalance === 0 && analytics.totalWithdrawn > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900">⚠️ Zero balance</p>
              <p className="text-sm text-red-700 mt-1">
                You've withdrawn all your savings. Consider rebuilding your emergency fund.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
