'use client';

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  where,
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Download, 
  Eye, 
  Filter,
  Calendar,
  User,
  Activity,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { format, subDays } from 'date-fns';

interface AuditLog {
  id: string;
  timestamp: Timestamp;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'pending';
  errorMessage?: string;
}

interface AuditLogsViewerProps {
  defaultPageSize?: number;
}

const ACTION_TYPES = [
  'all',
  'user.create',
  'user.update',
  'user.delete',
  'user.suspend',
  'user.activate',
  'tournament.create',
  'tournament.update',
  'tournament.delete',
  'wallet.refund',
  'wallet.credit',
  'wallet.debit',
  'settings.update',
  'mfa.enable',
  'mfa.disable',
  'admin.login',
  'admin.logout',
];

const STATUS_TYPES = ['all', 'success', 'failure', 'pending'];

const DATE_RANGES = [
  { label: 'Last 24 hours', value: 1 },
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
];

export default function AuditLogsViewer({ defaultPageSize = 50 }: AuditLogsViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(7);
  const [userIdFilter, setUserIdFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(defaultPageSize);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [dateRange]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, actionFilter, statusFilter, userIdFilter]);

  const loadLogs = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const logsRef = collection(db, 'sportshub_admin_logs');
      const startDate = Timestamp.fromDate(subDays(new Date(), dateRange));
      
      let q = query(
        logsRef,
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc'),
        limit(pageSize)
      );

      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setHasMore(false);
        if (!loadMore) {
          setLogs([]);
        }
        return;
      }

      const newLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];

      if (loadMore) {
        setLogs(prev => [...prev, ...newLogs]);
      } else {
        setLogs(newLogs);
        setCurrentPage(1);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err: any) {
      console.error('Error loading audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.userEmail.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.resource.toLowerCase().includes(query) ||
        (log.resourceId && log.resourceId.toLowerCase().includes(query))
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // User ID filter
    if (userIdFilter) {
      filtered = filtered.filter(log => 
        log.userId.toLowerCase().includes(userIdFilter.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const exportToCSV = () => {
    const headers = [
      'Timestamp',
      'User Email',
      'User ID',
      'Action',
      'Resource',
      'Resource ID',
      'Status',
      'IP Address',
      'Error Message'
    ];

    const rows = filteredLogs.map(log => [
      format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss'),
      log.userEmail,
      log.userId,
      log.action,
      log.resource,
      log.resourceId || '',
      log.status,
      log.ipAddress || '',
      log.errorMessage || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const viewLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failure: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const getActionIcon = (action: string) => {
    if (action.includes('delete')) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (action.includes('create')) return <Activity className="h-4 w-4 text-green-500" />;
    if (action.includes('update')) return <Activity className="h-4 w-4 text-blue-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">
            Track all administrative actions and system events
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={filteredLogs.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Action type" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map(action => (
              <SelectItem key={action} value={action}>
                {action === 'all' ? 'All Actions' : action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_TYPES.map(status => (
              <SelectItem key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange.toString()} onValueChange={(v) => setDateRange(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map(range => (
              <SelectItem key={range.value} value={range.value.toString()}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by User ID..."
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Logs</p>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{filteredLogs.length}</p>
        </div>
        
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <Activity className="h-4 w-4 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {filteredLogs.length > 0
              ? Math.round((filteredLogs.filter(l => l.status === 'success').length / filteredLogs.length) * 100)
              : 0}%
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Failed Actions</p>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {filteredLogs.filter(l => l.status === 'failure').length}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading audit logs...</p>
                </TableCell>
              </TableRow>
            ) : paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No logs found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or date range
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {format(log.timestamp.toDate(), 'MMM dd, HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{log.userEmail}</p>
                      <p className="text-xs text-muted-foreground">{log.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm">{log.action}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{log.resource}</p>
                      {log.resourceId && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {log.resourceId.substring(0, 12)}...
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewLogDetails(log)}
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
            {Math.min(currentPage * pageSize, filteredLogs.length)} of{' '}
            {filteredLogs.length} logs
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
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
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this audit log entry
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                  <p className="text-sm font-mono">
                    {format(selectedLog.timestamp.toDate(), 'PPpp')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User Email</p>
                  <p className="text-sm">{selectedLog.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="text-sm font-mono">{selectedLog.userId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Action</p>
                  <p className="text-sm">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resource</p>
                  <p className="text-sm">{selectedLog.resource}</p>
                </div>
              </div>

              {selectedLog.resourceId && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resource ID</p>
                  <p className="text-sm font-mono break-all">{selectedLog.resourceId}</p>
                </div>
              )}

              {selectedLog.ipAddress && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                  <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                  <p className="text-sm break-all">{selectedLog.userAgent}</p>
                </div>
              )}

              {selectedLog.errorMessage && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Error Message</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {selectedLog.errorMessage}
                  </p>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Additional Details</p>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64">
                    {JSON.stringify(selectedLog.details, null, 2)}
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
