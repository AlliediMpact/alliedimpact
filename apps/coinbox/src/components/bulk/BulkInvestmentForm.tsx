'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Download
} from 'lucide-react';

interface InvestmentRow {
  ticketId: string;
  amount: number;
  status?: 'pending' | 'success' | 'error';
  error?: string;
}

export default function BulkInvestmentForm() {
  const { toast } = useToast();
  const [investments, setInvestments] = useState<InvestmentRow[]>([
    { ticketId: '', amount: 0 }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Add new row
  const addRow = () => {
    if (investments.length >= 20) {
      toast({
        title: 'Maximum Limit',
        description: 'You can add maximum 20 investments per batch',
        variant: 'destructive'
      });
      return;
    }
    setInvestments([...investments, { ticketId: '', amount: 0 }]);
  };

  // Remove row
  const removeRow = (index: number) => {
    if (investments.length === 1) return;
    setInvestments(investments.filter((_, i) => i !== index));
  };

  // Update row
  const updateRow = (index: number, field: keyof InvestmentRow, value: any) => {
    const updated = [...investments];
    updated[index] = { ...updated[index], [field]: value };
    setInvestments(updated);
  };

  // Handle CSV upload
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header if present
        const startIndex = lines[0].toLowerCase().includes('ticketid') ? 1 : 0;
        
        const parsed: InvestmentRow[] = [];
        for (let i = startIndex; i < lines.length && i < 20; i++) {
          const [ticketId, amount] = lines[i].split(',').map(s => s.trim());
          if (ticketId && amount) {
            parsed.push({
              ticketId,
              amount: parseFloat(amount)
            });
          }
        }

        if (parsed.length > 0) {
          setInvestments(parsed);
          toast({
            title: 'CSV Loaded',
            description: `${parsed.length} investments loaded from CSV`,
          });
        }
      } catch (error) {
        toast({
          title: 'CSV Parse Error',
          description: 'Failed to parse CSV file. Please check the format.',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
  };

  // Download CSV template
  const downloadTemplate = () => {
    const csv = 'ticketId,amount\nticket_123,1000\nticket_456,2000';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_investment_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Validate investments
  const validateInvestments = (): string | null => {
    if (investments.length === 0) {
      return 'At least one investment is required';
    }

    for (let i = 0; i < investments.length; i++) {
      const inv = investments[i];
      
      if (!inv.ticketId || inv.ticketId.trim() === '') {
        return `Row ${i + 1}: Ticket ID is required`;
      }

      if (!inv.amount || inv.amount <= 0) {
        return `Row ${i + 1}: Amount must be greater than 0`;
      }

      if (inv.amount < 100) {
        return `Row ${i + 1}: Minimum investment is R100`;
      }
    }

    return null;
  };

  // Submit bulk investments
  const handleSubmit = async () => {
    // Validate
    const error = validateInvestments();
    if (error) {
      toast({
        title: 'Validation Error',
        description: error,
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      const response = await fetch('/api/bulk/investments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investments: investments.map(({ ticketId, amount }) => ({ ticketId, amount }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process investments');
      }

      setResults(data);

      // Update row statuses
      const updatedInvestments = investments.map((inv, index) => {
        const result = data.results.find((r: any) => r.index === index);
        return {
          ...inv,
          status: result?.status === 'success' ? 'success' : 'error',
          error: data.errors.find((e: any) => e.index === index)?.error
        };
      });
      setInvestments(updatedInvestments);

      toast({
        title: data.success ? 'Success!' : 'Partial Success',
        description: `${data.successful} out of ${data.totalItems} investments processed successfully`,
        variant: data.success ? 'default' : 'destructive'
      });

    } catch (error: any) {
      console.error('Bulk investment error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate total
  const totalAmount = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Investments</CardTitle>
        <CardDescription>
          Create multiple investments in a single batch (max 20 per batch)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Upload Section */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="csv-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <Upload className="h-5 w-5" />
                <span>Upload CSV File</span>
              </div>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCSVUpload}
              />
            </Label>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>

        {/* Manual Entry Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Investment Details</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={investments.length >= 20}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </Button>
          </div>

          {/* Investment Rows */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {investments.map((investment, index) => (
              <div
                key={index}
                className={`flex gap-2 items-start p-3 rounded-lg border ${
                  investment.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : investment.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Ticket ID</Label>
                      <Input
                        placeholder="ticket_123"
                        value={investment.ticketId}
                        onChange={(e) => updateRow(index, 'ticketId', e.target.value)}
                        disabled={isProcessing || investment.status === 'success'}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Amount (R)</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={investment.amount || ''}
                        onChange={(e) => updateRow(index, 'amount', parseFloat(e.target.value) || 0)}
                        disabled={isProcessing || investment.status === 'success'}
                      />
                    </div>
                  </div>
                  
                  {investment.error && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {investment.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {investment.status === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {investment.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(index)}
                    disabled={investments.length === 1 || isProcessing || investment.status === 'success'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Investments</p>
            <p className="text-2xl font-bold">{investments.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">R{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Results Summary */}
        {results && (
          <Alert variant={results.success ? 'default' : 'destructive'}>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Batch Results</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold">{results.totalItems}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Successful</p>
                    <p className="font-bold text-green-600">{results.successful}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Failed</p>
                    <p className="font-bold text-red-600">{results.failed}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Processing time: {results.processingTimeMs}ms
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={isProcessing || investments.length === 0}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing {investments.length} Investments...
            </>
          ) : (
            `Process ${investments.length} Investment${investments.length > 1 ? 's' : ''}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
