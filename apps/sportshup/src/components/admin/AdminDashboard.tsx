'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Trophy, Wallet, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTournaments: number;
  activeTournaments: number;
  totalRevenue: number;
  pendingPayouts: number;
  totalVotes: number;
  avgVotesPerTournament: number;
}

interface ChartData {
  name: string;
  value: number;
  date?: string;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'tournament' | 'vote' | 'transaction';
  action: string;
  timestamp: Date;
  details: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTournaments: 0,
    activeTournaments: 0,
    totalRevenue: 0,
    pendingPayouts: 0,
    totalVotes: 0,
    avgVotesPerTournament: 0,
  });
  const [userGrowth, setUserGrowth] = useState<ChartData[]>([]);
  const [tournamentStats, setTournamentStats] = useState<ChartData[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUserGrowth(),
        loadTournamentStats(),
        loadRevenueData(),
        loadRecentActivity(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    // Load users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const totalUsers = usersSnapshot.size;

    // Active users (logged in last 30 days)
    const thirtyDaysAgo = Timestamp.fromDate(subDays(new Date(), 30));
    const activeUsersQuery = query(
      usersRef,
      where('lastLoginAt', '>=', thirtyDaysAgo)
    );
    const activeUsersSnapshot = await getDocs(activeUsersQuery);
    const activeUsers = activeUsersSnapshot.size;

    // Load tournaments
    const tournamentsRef = collection(db, 'tournaments');
    const tournamentsSnapshot = await getDocs(tournamentsRef);
    const totalTournaments = tournamentsSnapshot.size;

    const activeTournamentsQuery = query(
      tournamentsRef,
      where('status', '==', 'open')
    );
    const activeTournamentsSnapshot = await getDocs(activeTournamentsQuery);
    const activeTournaments = activeTournamentsSnapshot.size;

    // Load votes
    const votesRef = collection(db, 'votes');
    const votesSnapshot = await getDocs(votesRef);
    const totalVotes = votesSnapshot.size;

    // Load transactions
    const transactionsRef = collection(db, 'transactions');
    const transactionsSnapshot = await getDocs(transactionsRef);
    let totalRevenue = 0;
    let pendingPayouts = 0;

    transactionsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.type === 'credit' && data.status === 'completed') {
        totalRevenue += data.amount;
      }
      if (data.type === 'payout' && data.status === 'pending') {
        pendingPayouts += data.amount;
      }
    });

    setStats({
      totalUsers,
      activeUsers,
      totalTournaments,
      activeTournaments,
      totalRevenue,
      pendingPayouts,
      totalVotes,
      avgVotesPerTournament: totalTournaments > 0 ? totalVotes / totalTournaments : 0,
    });
  };

  const loadUserGrowth = async () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data: ChartData[] = [];

    const usersRef = collection(db, 'users');

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const startDate = Timestamp.fromDate(startOfDay(date));
      const endDate = Timestamp.fromDate(endOfDay(date));

      const dayQuery = query(
        usersRef,
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate)
      );

      const snapshot = await getDocs(dayQuery);

      data.push({
        name: format(date, 'MMM dd'),
        date: format(date, 'yyyy-MM-dd'),
        value: snapshot.size,
      });
    }

    setUserGrowth(data);
  };

  const loadTournamentStats = async () => {
    const tournamentsRef = collection(db, 'tournaments');
    const snapshot = await getDocs(tournamentsRef);

    const statusCounts: Record<string, number> = {
      draft: 0,
      open: 0,
      closed: 0,
      completed: 0,
    };

    snapshot.forEach((doc) => {
      const status = doc.data().status || 'draft';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const data: ChartData[] = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    setTournamentStats(data);
  };

  const loadRevenueData = async () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data: ChartData[] = [];

    const transactionsRef = collection(db, 'transactions');

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const startDate = Timestamp.fromDate(startOfDay(date));
      const endDate = Timestamp.fromDate(endOfDay(date));

      const dayQuery = query(
        transactionsRef,
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        where('type', '==', 'credit'),
        where('status', '==', 'completed')
      );

      const snapshot = await getDocs(dayQuery);
      let dayRevenue = 0;

      snapshot.forEach((doc) => {
        dayRevenue += doc.data().amount || 0;
      });

      data.push({
        name: format(date, 'MMM dd'),
        date: format(date, 'yyyy-MM-dd'),
        value: dayRevenue,
      });
    }

    setRevenueData(data);
  };

  const loadRecentActivity = async () => {
    const activities: RecentActivity[] = [];

    // Recent users
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const usersSnapshot = await getDocs(usersQuery);
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: 'user',
        action: 'New user registered',
        timestamp: data.createdAt?.toDate() || new Date(),
        details: data.email || 'Unknown',
      });
    });

    // Recent tournaments
    const tournamentsQuery = query(
      collection(db, 'tournaments'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const tournamentsSnapshot = await getDocs(tournamentsQuery);
    tournamentsSnapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: 'tournament',
        action: 'Tournament created',
        timestamp: data.createdAt?.toDate() || new Date(),
        details: data.name || 'Unknown',
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setRecentActivity(activities.slice(0, 10));
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'tournament':
        return <Trophy className="h-4 w-4" />;
      case 'vote':
        return <Activity className="h-4 w-4" />;
      case 'transaction':
        return <Wallet className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user':
        return 'bg-blue-500';
      case 'tournament':
        return 'bg-yellow-500';
      case 'vote':
        return 'bg-green-500';
      case 'transaction':
        return 'bg-purple-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of platform metrics and activity
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">{stats.activeUsers}</span> active (30d)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTournaments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">{stats.activeTournaments}</span> currently open
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600 font-medium">R{stats.pendingPayouts.toFixed(2)}</span> pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVotes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgVotesPerTournament.toFixed(1)} avg per tournament
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#0088FE" name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Daily revenue from transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#00C49F" name="Revenue (R)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tournament Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Status</CardTitle>
            <CardDescription>Distribution of tournaments by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tournamentStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tournamentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`mt-1 rounded-full p-2 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(activity.timestamp, 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900">Warning</Badge>
                <span className="text-sm">High pending payout volume detected</span>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <p className="text-sm text-muted-foreground text-center py-4">
              No other alerts at this time
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
