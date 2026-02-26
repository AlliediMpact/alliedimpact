'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, Users, TrendingUp, DollarSign, 
  BarChart, Clock, Award, Activity 
} from 'lucide-react';

interface DashboardStats {
  totalTournaments: number;
  activeTournaments: number;
  totalVotes: number;
  totalRevenue: number;
  totalUsers: number;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { cupfinalUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTournaments: 0,
    activeTournaments: 0,
    totalVotes: 0,
    totalRevenue: 0,
    totalUsers: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  const CUPFINAL_PROJECT_ID = 'cupfinal';

  useEffect(() => {
    if (cupfinalUser && cupfinalUser.globalRole === 'sportshub_super_admin') {
      fetchDashboardStats();
    }
  }, [cupfinalUser]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch tournaments
      const tournamentsRef = collection(db, 'sportshub_projects', CUPFINAL_PROJECT_ID, 'tournaments');
      const tournamentsSnapshot = await getDocs(tournamentsRef);
      const totalTournaments = tournamentsSnapshot.size;
      
      let activeTournaments = 0;
      tournamentsSnapshot.forEach(doc => {
        if (doc.data().status === 'open') activeTournaments++;
      });

      // Fetch votes
      const votesRef = collection(db, 'sportshub_projects', CUPFINAL_PROJECT_ID, 'votes');
      const votesSnapshot = await getDocs(votesRef);
      const totalVotes = votesSnapshot.size;
      const totalRevenue = totalVotes * 200; // R2 per vote

      // Fetch users
      const usersRef = collection(db, 'sportshub_users');
      const usersSnapshot = await getDocs(usersRef);
      const totalUsers = usersSnapshot.size;

      // Fetch recent activity (last 10 admin logs)
      const logsRef = collection(db, 'sportshub_admin_logs');
      const logsQuery = query(logsRef, orderBy('timestamp', 'desc'), limit(10));
      const logsSnapshot = await getDocs(logsQuery);
      
      const recentActivity = logsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          type: data.action,
          message: `${data.action} by ${data.adminUserId}`,
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      });

      setStats({
        totalTournaments,
        activeTournaments,
        totalVotes,
        totalRevenue,
        totalUsers,
        recentActivity,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!cupfinalUser || cupfinalUser.globalRole !== 'sportshub_super_admin') {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          SportsHub platform analytics and management
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Tournaments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{stats.totalTournaments}</p>
                    <p className="text-sm text-green-600 mt-1">
                      {stats.activeTournaments} active
                    </p>
                  </div>
                  <Trophy className="w-10 h-10 text-purple-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Votes Cast</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{stats.totalVotes.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">All time</p>
                  </div>
                  <BarChart className="w-10 h-10 text-pink-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">R{(stats.totalRevenue / 100).toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">From voting</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Registered</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => router.push('/admin/tournaments/create')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Create Tournament
                </Button>
                <Button
                  onClick={() => router.push('/admin/users')}
                  variant="outline"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button
                  onClick={() => router.push('/admin/audit-logs')}
                  variant="outline"
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Audit Logs
                </Button>
                <Button
                  onClick={() => router.push('/admin/system-health')}
                  variant="outline"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  System Health
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest admin actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentActivity.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{activity.type.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
