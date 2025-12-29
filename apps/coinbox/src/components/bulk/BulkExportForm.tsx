'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Download, Loader2, FileText, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react';

interface ExportResult {
  exportId: string;
  recordCount: number;
  fileSize: number;
  downloadUrl: string;
  expiresAt: string;
  format: string;
}

interface ExportHistoryItem {
  exportId: string;
  exportType: string;
  format: string;
  recordCount: number;
  fileSize: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: { _seconds: number };
  expiresAt?: { _seconds: number };
  error?: string;
}

const EXPORT_TYPES = [
  { value: 'loans', label: 'Loan Tickets', description: 'All your loan tickets' },
  { value: 'investments', label: 'Investments', description: 'All your investments' },
  { value: 'transactions', label: 'Transactions', description: 'All your transactions' },
  { value: 'crypto_orders', label: 'Crypto Orders', description: 'All your crypto orders' },
];

const FORMATS = [
  { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
  { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
  { value: 'excel', label: 'Excel', description: 'Microsoft Excel format' },
];

export default function BulkExportForm() {
  const { user } = useAuth();
  const [exportType, setExportType] = useState('loans');
  const [format, setFormat] = useState('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxRecords, setMaxRecords] = useState('10000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user) {
      loadExportHistory();
    }
  }, [user]);

  const loadExportHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/bulk/export/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.exports || []);
      }
    } catch (err) {
      console.error('Failed to load export history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      const filters: any = {};
      
      if (startDate) {
        filters.startDate = new Date(startDate).toISOString();
      }
      
      if (endDate) {
        filters.endDate = new Date(endDate).toISOString();
      }

      const requestBody = {
        exportType,
        format,
        filters,
        maxRecords: parseInt(maxRecords) || 10000,
      };

      const response = await fetch('/api/bulk/export/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create export');
      }

      setResult(data);
      
      // Reload history
      await loadExportHistory();

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (seconds: number): string => {
    return new Date(seconds * 1000).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Export Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bulk Data Export
          </CardTitle>
          <CardDescription>
            Export your data in various formats (max 10,000 records per export)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Export Type */}
            <div>
              <Label htmlFor="export-type">Data Type</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger id="export-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Format */}
            <div>
              <Label htmlFor="format">Export Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map(fmt => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      <div>
                        <p className="font-medium">{fmt.label}</p>
                        <p className="text-xs text-gray-500">{fmt.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date (Optional)</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date (Optional)</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Max Records */}
            <div>
              <Label htmlFor="max-records">Maximum Records</Label>
              <Select value={maxRecords} onValueChange={setMaxRecords}>
                <SelectTrigger id="max-records">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 records</SelectItem>
                  <SelectItem value="500">500 records</SelectItem>
                  <SelectItem value="1000">1,000 records</SelectItem>
                  <SelectItem value="5000">5,000 records</SelectItem>
                  <SelectItem value="10000">10,000 records</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Export...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Create Export
                </>
              )}
            </Button>
          </form>

          {/* Export Result */}
          {result && (
            <Alert className="mt-6 border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-semibold">Export Created Successfully!</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Export ID</p>
                      <p className="font-mono">{result.exportId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Records</p>
                      <p className="font-bold">{result.recordCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">File Size</p>
                      <p className="font-bold">{formatBytes(result.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expires</p>
                      <p className="font-bold">{new Date(result.expiresAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => downloadFile(result.downloadUrl, `${result.exportId}.${result.format}`)}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Export History
          </CardTitle>
          <CardDescription>
            Your recent exports (files expire after 24 hours)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No exports yet</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <Card key={item.exportId} className={`
                  ${item.status === 'completed' ? 'border-green-500' : ''}
                  ${item.status === 'failed' ? 'border-red-500' : ''}
                `}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {EXPORT_TYPES.find(t => t.value === item.exportType)?.label || item.exportType}
                          </Badge>
                          <Badge variant="outline">{item.format.toUpperCase()}</Badge>
                          {item.status === 'completed' && (
                            <Badge className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {item.status === 'failed' && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Records</p>
                            <p className="font-bold">{item.recordCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Size</p>
                            <p className="font-bold">{formatBytes(item.fileSize)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Created</p>
                            <p className="font-bold">{formatDate(item.createdAt._seconds)}</p>
                          </div>
                          {item.expiresAt && (
                            <div>
                              <p className="text-gray-600">Expires</p>
                              <p className="font-bold">{formatDate(item.expiresAt._seconds)}</p>
                            </div>
                          )}
                        </div>
                        {item.error && (
                          <Alert variant="destructive" className="mt-3">
                            <AlertDescription>{item.error}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
