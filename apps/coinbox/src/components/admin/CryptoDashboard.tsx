'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import type { CryptoAsset, TransactionStatus } from '@/lib/types/crypto-custody';

interface DashboardStats {
  totalVolume24h: number;
  totalFees24h: number;
  activeOrders: number;
  activeUsers: number;
  totalTrades: number;
  avgTradeSize: number;
}

interface AssetBalance {
  asset: CryptoAsset;
  custodyBalance: number;
  tradingBalance: number;
  lockedBalance: number;
  lunoBalance: number;
  mismatch: boolean;
}

interface RecentTrade {
  id: string;
  timestamp: Date;
  asset: CryptoAsset;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  fee: number;
  status: TransactionStatus;
}

export function CryptoDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [balances, setBalances] = useState<AssetBalance[]>([]);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // TODO: Call API to fetch dashboard data
      // const response = await fetch('/api/admin/crypto/dashboard');
      // const data = await response.json();

      // Mock data
      const mockStats: DashboardStats = {
        totalVolume24h: 2450000,
        totalFees24h: 12250,
        activeOrders: 47,
        activeUsers: 234,
        totalTrades: 156,
        avgTradeSize: 15705,
      };

      const mockBalances: AssetBalance[] = [
        {
          asset: 'BTC',
          custodyBalance: 2.45678,
          tradingBalance: 1.23456,
          lockedBalance: 0.45678,
          lunoBalance: 2.45678,
          mismatch: false,
        },
        {
          asset: 'ETH',
          custodyBalance: 45.6789,
          tradingBalance: 23.4567,
          lockedBalance: 8.9012,
          lunoBalance: 45.6799, // Slight mismatch
          mismatch: true,
        },
        {
          asset: 'USDT',
          custodyBalance: 125000,
          tradingBalance: 67000,
          lockedBalance: 23000,
          lunoBalance: 125000,
          mismatch: false,
        },
      ];

      const mockTrades: RecentTrade[] = Array.from({ length: 10 }, (_, i) => ({
        id: `trade-${i}`,
        timestamp: new Date(Date.now() - i * 300000),
        asset: ['BTC', 'ETH', 'USDT'][i % 3] as CryptoAsset,
        type: i % 2 === 0 ? 'BUY' : 'SELL',
        price: [1250000, 42000, 18.5][i % 3],
        amount: [0.01, 0.5, 1000][i % 3],
        fee: [62.5, 105, 92.5][i % 3],
        status: 'COMPLETED',
      }));

      setStats(mockStats);
      setBalances(mockBalances);
      setRecentTrades(mockTrades);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
  };

  const handleSyncBalances = async () => {
    setSyncing(true);
    try {
      // TODO: Call API to sync with Luno
      // await lunoCustodyService.syncBalances();
      await new Promise(resolve => setTimeout(resolve, 2000));
      loadDashboardData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleExportData = () => {
    // TODO: Generate and download CSV
    console.log('Exporting data...');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crypto Trading Dashboard</h1>
          <p className="text-muted-foreground">Monitor P2P crypto trading activity and balances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalVolume24h)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTrades} trades executed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fee Revenue (24h)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalFees24h)}
              </div>
              <p className="text-xs text-muted-foreground">
                0.5% platform fee
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">
                Pending execution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Traders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="balances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="balances">Balance Reconciliation</TabsTrigger>
          <TabsTrigger value="trades">Recent Trades</TabsTrigger>
        </TabsList>

        {/* Balance Reconciliation Tab */}
        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custody Balance Reconciliation</CardTitle>
                  <CardDescription>
                    Compare internal balances with Luno custody balances
                  </CardDescription>
                </div>
                <Button onClick={handleSyncBalances} disabled={syncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  Sync with Luno
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {balances.some(b => b.mismatch) && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Balance mismatch detected! Please reconcile with Luno.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {balances.map((balance) => (
                  <div
                    key={balance.asset}
                    className={`border rounded-lg p-4 ${
                      balance.mismatch ? 'border-red-500 bg-red-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{balance.asset}</span>
                        {balance.mismatch ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Mismatch
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Synced
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Custody</span>
                        <p className="font-semibold">{balance.custodyBalance.toFixed(8)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trading</span>
                        <p className="font-semibold">{balance.tradingBalance.toFixed(8)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Locked</span>
                        <p className="font-semibold">{balance.lockedBalance.toFixed(8)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Luno Balance</span>
                        <p className={`font-semibold ${balance.mismatch ? 'text-red-600' : ''}`}>
                          {balance.lunoBalance.toFixed(8)}
                        </p>
                      </div>
                    </div>

                    {balance.mismatch && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-red-600 font-medium">
                          Difference: {(balance.lunoBalance - balance.custodyBalance).toFixed(8)} {balance.asset}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Trades Tab */}
        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>Last 10 executed trades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {trade.type === 'BUY' ? (
                        <ChevronUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{trade.asset}</span>
                          <Badge variant={trade.type === 'BUY' ? 'default' : 'secondary'}>
                            {trade.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(trade.timestamp)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        {trade.amount.toFixed(8)} @ {formatCurrency(trade.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fee: {formatCurrency(trade.fee)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
