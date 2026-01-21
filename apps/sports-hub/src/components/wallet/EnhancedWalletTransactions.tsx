'use client';

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download, 
  Eye, 
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: 'topup' | 'vote' | 'refund' | 'debit';
  amountInCents: number;
  balanceAfterInCents: number;
  timestamp: Timestamp;
  status: 'completed' | 'pending' | 'failed';
  paymentId?: string;
  tournamentId?: string;
  tournamentName?: string;
  refundReason?: string;
  metadata?: Record<string, any>;
}

interface ChartData {
  date: string;
  balance: number;
  income: number;
  expenses: number;
}

interface EnhancedWalletTransactionsProps {
  userId: string;
  defaultPageSize?: number;
  showAdminActions?: boolean;
}

const TRANSACTION_TYPES = ['all', 'topup', 'vote', 'refund', 'debit'];
const TRANSACTION_STATUSES = ['all', 'completed', 'pending', 'failed'];

export default function EnhancedWalletTransactions({ 
  userId, 
  defaultPageSize = 20,
  showAdminActions = false 
}: EnhancedWalletTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(defaultPageSize);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Detail modal
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Chart data
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [balanceTrend, setBalanceTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    loadTransactions();
  }, [userId]);

  useEffect(() => {
    filterTransactions();
    generateChartData();
  }, [transactions, searchQuery, typeFilter, statusFilter, startDate, endDate]);

  const loadTransactions = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const transactionsRef = collection(db, 'sportshub_wallets', userId, 'transactions');
      
      let q = query(
        transactionsRef,
        orderBy('timestamp', 'desc'),
        limit(100) // Load last 100 transactions
      );

      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setHasMore(false);
        if (!loadMore) {
          setTransactions([]);
        }
        return;
      }

      const newTransactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];

      if (loadMore) {
        setTransactions(prev => [...prev, ...newTransactions]);
      } else {
        setTransactions(newTransactions);
        setCurrentPage(1);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 100);
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.userEmail?.toLowerCase().includes(query) ||
        tx.tournamentName?.toLowerCase().includes(query) ||
        tx.paymentId?.toLowerCase().includes(query) ||
        tx.id.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Date range filter
    if (startDate) {
      const start = startOfDay(new Date(startDate));
      filtered = filtered.filter(tx => tx.timestamp.toDate() >= start);
    }

    if (endDate) {
      const end = endOfDay(new Date(endDate));
      filtered = filtered.filter(tx => tx.timestamp.toDate() <= end);
    }

    setFilteredTransactions(filtered);
  };

  const generateChartData = () => {
    if (transactions.length === 0) {
      setChartData([]);
      return;
    }

    // Generate 30-day chart
    const days = 30;
    const chartPoints: ChartData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayTransactions = transactions.filter(tx => {
        const txDate = tx.timestamp.toDate();
        return txDate >= dayStart && txDate <= dayEnd;
      });

      const income = dayTransactions
        .filter(tx => tx.type === 'topup' || tx.type === 'refund')
        .reduce((sum, tx) => sum + tx.amountInCents, 0);
        
      const expenses = dayTransactions
        .filter(tx => tx.type === 'vote' || tx.type === 'debit')
        .reduce((sum, tx) => sum + tx.amountInCents, 0);

      // Get balance at end of day (last transaction's balance)
      const lastTx = dayTransactions[dayTransactions.length - 1];
      const balance = lastTx ? lastTx.balanceAfterInCents : 
        (chartPoints.length > 0 ? chartPoints[chartPoints.length - 1].balance : 0);

      chartPoints.push({
        date: format(date, 'MMM dd'),
        balance: balance / 100,
        income: income / 100,
        expenses: expenses / 100
      });
    }

    setChartData(chartPoints);

    // Calculate trend
    if (chartPoints.length >= 2) {
      const firstBalance = chartPoints[0].balance;
      const lastBalance = chartPoints[chartPoints.length - 1].balance;
      const change = ((lastBalance - firstBalance) / firstBalance) * 100;
      
      if (change > 5) setBalanceTrend('up');
      else if (change < -5) setBalanceTrend('down');
      else setBalanceTrend('stable');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Type',
      'Amount',
      'Balance After',
      'Status',
      'Payment ID',
      'Tournament',
      'Notes'
    ];

    const rows = filteredTransactions.map(tx => [
      format(tx.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss'),
      tx.type,
      (tx.amountInCents / 100).toFixed(2),
      (tx.balanceAfterInCents / 100).toFixed(2),
      tx.status,
      tx.paymentId || '',
      tx.tournamentName || '',
      tx.refundReason || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'refund':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      case 'vote':
      case 'debit':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {status}
      </Badge>
    );
  };

  const formatAmount = (cents: number, type: string) => {
    const amount = (cents / 100).toFixed(2);
    const prefix = (type === 'topup' || type === 'refund') ? '+' : '-';
    return `${prefix}R${amount}`;
  };

  // Statistics
  const stats = {
    totalIncome: filteredTransactions
      .filter(tx => tx.type === 'topup' || tx.type === 'refund')
      .reduce((sum, tx) => sum + tx.amountInCents, 0),
    totalExpenses: filteredTransactions
      .filter(tx => tx.type === 'vote' || tx.type === 'debit')
      .reduce((sum, tx) => sum + tx.amountInCents, 0),
    transactionCount: filteredTransactions.length,
    averageTransaction: filteredTransactions.length > 0
      ? filteredTransactions.reduce((sum, tx) => sum + tx.amountInCents, 0) / filteredTransactions.length
      : 0
  };

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

  return (
    <div className="space-y-6">
      {/* Balance Trend Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Balance Trend - Last 30 Days</CardTitle>
                <CardDescription>Your wallet balance over time</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-5 w-5 ${
                  balanceTrend === 'up' ? 'text-green-500' :
                  balanceTrend === 'down' ? 'text-red-500' :
                  'text-gray-500'
                }`} />
                <span className="text-sm font-medium">
                  {balanceTrend === 'up' && 'Growing'}
                  {balanceTrend === 'down' && 'Declining'}
                  {balanceTrend === 'stable' && 'Stable'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Balance (R)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Income</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R{(stats.totalIncome / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R{(stats.totalExpenses / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactionCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{(stats.averageTransaction / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm" disabled={filteredTransactions.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction type" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start date"
            />

            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End date"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance After</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">No transactions found</p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your filters
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">
                        {format(tx.timestamp.toDate(), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(tx.type)}
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`font-medium ${
                        tx.type === 'topup' || tx.type === 'refund' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatAmount(tx.amountInCents, tx.type)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        R{(tx.balanceAfterInCents / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewTransactionDetails(tx)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredTransactions.length)} of{' '}
                {filteredTransactions.length} transactions
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about this transaction
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                  <p className="text-sm font-mono">
                    {format(selectedTransaction.timestamp.toDate(), 'PPpp')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                  <p className="text-sm font-mono break-all">{selectedTransaction.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedTransaction.type)}
                    <span className="text-sm capitalize">{selectedTransaction.type}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className={`text-lg font-bold ${
                    selectedTransaction.type === 'topup' || selectedTransaction.type === 'refund' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatAmount(selectedTransaction.amountInCents, selectedTransaction.type)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Balance After</p>
                  <p className="text-lg font-bold">
                    R{(selectedTransaction.balanceAfterInCents / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedTransaction.paymentId && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                  <p className="text-sm font-mono break-all">{selectedTransaction.paymentId}</p>
                </div>
              )}

              {selectedTransaction.tournamentName && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tournament</p>
                  <p className="text-sm">{selectedTransaction.tournamentName}</p>
                  {selectedTransaction.tournamentId && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {selectedTransaction.tournamentId}
                    </p>
                  )}
                </div>
              )}

              {selectedTransaction.refundReason && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Refund Reason</p>
                  <p className="text-sm">{selectedTransaction.refundReason}</p>
                </div>
              )}

              {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Additional Details</p>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-48">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
