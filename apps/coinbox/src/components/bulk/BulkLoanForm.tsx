'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Plus, Trash2, CheckCircle2, XCircle, Loader2, FileText } from 'lucide-react';
import Papa from 'papaparse';

interface LoanEntry {
  id: string;
  amount: string;
  duration: string;
  interestRate: string;
  status?: 'pending' | 'success' | 'error';
  error?: string;
  ticketId?: string;
}

interface BulkLoanResult {
  batchId: string;
  totalProcessed: number;
  successful: number;
  failed: number;
  results: Array<{
    index: number;
    success: boolean;
    ticketId?: string;
    error?: string;
  }>;
}

export default function BulkLoanForm() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<LoanEntry[]>([
    { id: crypto.randomUUID(), amount: '', duration: '', interestRate: '' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BulkLoanResult | null>(null);
  const [error, setError] = useState<string>('');

  const durations = ['30', '60', '90', '180', '360'];

  const addLoan = () => {
    if (loans.length >= 20) {
      setError('Maximum 20 loans per batch');
      return;
    }
    setLoans([...loans, { id: crypto.randomUUID(), amount: '', duration: '', interestRate: '' }]);
    setError('');
  };

  const removeLoan = (id: string) => {
    if (loans.length === 1) {
      setError('At least one loan is required');
      return;
    }
    setLoans(loans.filter(loan => loan.id !== id));
    setError('');
  };

  const updateLoan = (id: string, field: keyof LoanEntry, value: string) => {
    setLoans(loans.map(loan => 
      loan.id === id ? { ...loan, [field]: value } : loan
    ));
    setError('');
  };

  const validateLoan = (loan: LoanEntry): string | null => {
    const amount = parseFloat(loan.amount);
    const interestRate = parseFloat(loan.interestRate);

    if (!loan.amount || isNaN(amount) || amount <= 0) {
      return 'Invalid amount';
    }
    if (!loan.duration) {
      return 'Duration is required';
    }
    if (!loan.interestRate || isNaN(interestRate) || interestRate < 15 || interestRate > 25) {
      return 'Interest rate must be between 15% and 25%';
    }
    return null;
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedLoans: LoanEntry[] = results.data
          .slice(0, 20)
          .map((row: any) => ({
            id: crypto.randomUUID(),
            amount: row.amount?.toString() || '',
            duration: row.duration?.toString() || '',
            interestRate: row.interestRate?.toString() || row.interest_rate?.toString() || '',
          }));

        if (parsedLoans.length > 0) {
          setLoans(parsedLoans);
          setError('');
        } else {
          setError('No valid loans found in CSV file');
        }
      },
      error: (error) => {
        setError(`CSV parsing error: ${error.message}`);
      }
    });

    event.target.value = '';
  }, []);

  const downloadTemplate = () => {
    const template = [
      { amount: '1000', duration: '30', interestRate: '20' },
      { amount: '5000', duration: '60', interestRate: '18' },
      { amount: '10000', duration: '90', interestRate: '22' }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk_loans_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in');
      return;
    }

    // Validate all loans
    const validationErrors: string[] = [];
    loans.forEach((loan, index) => {
      const error = validateLoan(loan);
      if (error) {
        validationErrors.push(`Loan ${index + 1}: ${error}`);
      }
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      const loanRequests = loans.map(loan => ({
        amount: parseFloat(loan.amount),
        duration: parseInt(loan.duration),
        interestRate: parseFloat(loan.interestRate)
      }));

      const response = await fetch('/api/bulk/loans/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loans: loanRequests })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create loans');
      }

      // Update loan statuses
      const updatedLoans = loans.map((loan, index) => {
        const result = data.results.find((r: any) => r.index === index);
        return {
          ...loan,
          status: result?.success ? 'success' as const : 'error' as const,
          error: result?.error,
          ticketId: result?.ticketId
        };
      });

      setLoans(updatedLoans);
      setResult(data);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalAmount = () => {
    return loans.reduce((sum, loan) => {
      const amount = parseFloat(loan.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  const getAverageInterestRate = () => {
    const validRates = loans
      .map(loan => parseFloat(loan.interestRate))
      .filter(rate => !isNaN(rate));
    
    if (validRates.length === 0) return 0;
    return validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Bulk Loan Creation
        </CardTitle>
        <CardDescription>
          Create multiple loan tickets at once (max 20 per batch)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Upload Section */}
        <div className="mb-6 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('csv-upload')?.click()}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </Button>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={downloadTemplate}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Loans List */}
          <div className="space-y-4 mb-6">
            {loans.map((loan, index) => (
              <Card key={loan.id} className={`
                ${loan.status === 'success' ? 'border-green-500 bg-green-50' : ''}
                ${loan.status === 'error' ? 'border-red-500 bg-red-50' : ''}
              `}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Loan Number */}
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-lg">
                          #{index + 1}
                        </Badge>
                      </div>

                      {/* Amount */}
                      <div>
                        <Label htmlFor={`amount-${loan.id}`}>Amount (FCFA)</Label>
                        <Input
                          id={`amount-${loan.id}`}
                          type="number"
                          step="0.01"
                          value={loan.amount}
                          onChange={(e) => updateLoan(loan.id, 'amount', e.target.value)}
                          placeholder="10000"
                          disabled={isProcessing || loan.status === 'success'}
                          required
                        />
                      </div>

                      {/* Duration */}
                      <div>
                        <Label htmlFor={`duration-${loan.id}`}>Duration (Days)</Label>
                        <Select
                          value={loan.duration}
                          onValueChange={(value) => updateLoan(loan.id, 'duration', value)}
                          disabled={isProcessing || loan.status === 'success'}
                        >
                          <SelectTrigger id={`duration-${loan.id}`}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {durations.map(duration => (
                              <SelectItem key={duration} value={duration}>
                                {duration} days
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Interest Rate */}
                      <div>
                        <Label htmlFor={`interestRate-${loan.id}`}>Interest Rate (%)</Label>
                        <Input
                          id={`interestRate-${loan.id}`}
                          type="number"
                          step="0.01"
                          min="15"
                          max="25"
                          value={loan.interestRate}
                          onChange={(e) => updateLoan(loan.id, 'interestRate', e.target.value)}
                          placeholder="20"
                          disabled={isProcessing || loan.status === 'success'}
                          required
                        />
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-2">
                      {loan.status === 'success' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm">Created</span>
                        </div>
                      )}
                      {loan.status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-5 w-5" />
                          <span className="text-sm">Failed</span>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLoan(loan.id)}
                        disabled={isProcessing || loans.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {loan.error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>{loan.error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Success Message */}
                  {loan.ticketId && (
                    <Alert className="mt-4 border-green-500 bg-green-50">
                      <AlertDescription>
                        Loan ticket created: <strong>{loan.ticketId}</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Loan Button */}
          {loans.length < 20 && (
            <Button
              type="button"
              variant="outline"
              onClick={addLoan}
              disabled={isProcessing}
              className="w-full mb-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Loan
            </Button>
          )}

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Loans</p>
              <p className="text-2xl font-bold">{loans.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold">{getTotalAmount().toLocaleString()} FCFA</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Interest Rate</p>
              <p className="text-2xl font-bold">{getAverageInterestRate().toFixed(2)}%</p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isProcessing || loans.length === 0}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Loans...
              </>
            ) : (
              `Create ${loans.length} Loan${loans.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </form>

        {/* Results Summary */}
        {result && (
          <Alert className="mt-6 border-blue-500 bg-blue-50">
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Batch {result.batchId}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Processed</p>
                    <p className="text-lg font-bold">{result.totalProcessed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="text-lg font-bold text-green-600">{result.successful}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-lg font-bold text-red-600">{result.failed}</p>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
