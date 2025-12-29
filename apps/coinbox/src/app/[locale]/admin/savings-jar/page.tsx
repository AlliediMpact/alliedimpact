'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PiggyBank, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Search,
  RefreshCw,
  Download,
  AlertCircle
} from 'lucide-react';

interface AdminStats {
  totalJars: number;
  activeUsers: number;
  totalBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalFees: number;
  avgBalancePerUser: number;
  last24hDeposits: number;
  last24hWithdrawals: number;
}

interface UserJar {
  userId: string;
  userEmail: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  autoThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RecentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  type: 'auto_deposit' | 'manual_deposit' | 'withdrawal';
  amount: number;
  fee?: number;
  source: string;
  createdAt: Date;
  status: string;
}

export default function AdminSavingsJarPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserJar[]>([]);
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load stats
      const statsRes = await fetch('/api/admin/savings-jar/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Load users
      const usersRes = await fetch('/api/admin/savings-jar/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Load transactions
      const txRes = await fetch('/api/admin/savings-jar/transactions?limit=50');
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userId.includes(searchTerm)
  );

  const exportData = () => {
    const csv = [
      ['User Email', 'Balance', 'Total Deposited', 'Total Withdrawn', 'Threshold', 'Created'].join(','),
      ...filteredUsers.map(u => [
        u.userEmail,
        u.balance.toFixed(2),
        u.totalDeposited.toFixed(2),
        u.totalWithdrawn.toFixed(2),
        u.autoThreshold.toFixed(2),
        new Date(u.createdAt).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `savings-jar-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Savings Jar Admin</h1>
          <p className="text-muted-foreground">
            Monitor and manage the Savings Jar feature
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{stats?.totalBalance.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {stats?.totalJars || 0} jars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg: R{stats?.avgBalancePerUser.toFixed(2) || '0.00'} each
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{stats?.totalDeposited.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24h: R{stats?.last24hDeposits.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fees Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{stats?.totalFees.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              From withdrawals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Current system status and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Deposits (24h)</span>
                  <Badge variant="outline">{stats?.last24hDeposits.toFixed(2)} R</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Withdrawals (24h)</span>
                  <Badge variant="outline">{stats?.last24hWithdrawals.toFixed(2)} R</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Net Flow (24h)</span>
                  <Badge variant="default">
                    {((stats?.last24hDeposits || 0) - (stats?.last24hWithdrawals || 0)).toFixed(2)} R
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={exportData}>
                <Download className="mr-2 h-4 w-4" />
                Export User Data
              </Button>
              <Button className="w-full" variant="outline" onClick={loadData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh All Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                  <CardDescription>Manage user savings jars</CardDescription>
                </div>
                <Button onClick={exportData} size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or user ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Deposited</TableHead>
                      <TableHead className="text-right">Withdrawn</TableHead>
                      <TableHead className="text-right">Threshold</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.userEmail}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.userId.substring(0, 12)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            R{user.balance.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            R{user.totalDeposited.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            R{user.totalWithdrawn.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            R{user.autoThreshold.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 50 transactions across all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No transactions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div className="text-sm">{tx.userEmail}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={tx.type === 'withdrawal' ? 'destructive' : 'default'}>
                              {tx.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{tx.source}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            R{tx.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {tx.fee ? `R${tx.fee.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>
                            {new Date(tx.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{tx.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Analytics</CardTitle>
              <CardDescription>Usage patterns and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Adoption Rate</h4>
                  <div className="text-2xl font-bold">
                    {stats ? ((stats.activeUsers / stats.totalJars) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Users with balance &gt; R0
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Average Deposit</h4>
                  <div className="text-2xl font-bold">
                    R{stats ? (stats.totalDeposited / Math.max(stats.activeUsers, 1)).toFixed(2) : '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per active user
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Total Revenue</h4>
                  <div className="text-2xl font-bold">
                    R{stats?.totalFees.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From 1% withdrawal fees
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
