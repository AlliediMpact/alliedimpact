'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Download,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface CryptoOrderRow {
  asset: 'BTC' | 'ETH' | 'USDT' | 'USDC' | '';
  type: 'BUY' | 'SELL' | '';
  amount: number;
  price: number;
  status?: 'pending' | 'success' | 'error';
  error?: string;
}

const CRYPTO_ASSETS = [
  { value: 'BTC', label: 'Bitcoin (BTC)', color: 'bg-orange-500' },
  { value: 'ETH', label: 'Ethereum (ETH)', color: 'bg-blue-500' },
  { value: 'USDT', label: 'Tether (USDT)', color: 'bg-green-500' },
  { value: 'USDC', label: 'USD Coin (USDC)', color: 'bg-blue-600' },
];

export default function BulkCryptoOrderForm() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<CryptoOrderRow[]>([
    { asset: '', type: '', amount: 0, price: 0 }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Add new row
  const addRow = () => {
    if (orders.length >= 20) {
      toast({
        title: 'Maximum Limit',
        description: 'You can add maximum 20 orders per batch',
        variant: 'destructive'
      });
      return;
    }
    setOrders([...orders, { asset: '', type: '', amount: 0, price: 0 }]);
  };

  // Remove row
  const removeRow = (index: number) => {
    if (orders.length === 1) return;
    setOrders(orders.filter((_, i) => i !== index));
  };

  // Update row
  const updateRow = (index: number, field: keyof CryptoOrderRow, value: any) => {
    const updated = [...orders];
    updated[index] = { ...updated[index], [field]: value };
    setOrders(updated);
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
        const startIndex = lines[0].toLowerCase().includes('asset') ? 1 : 0;
        
        const parsed: CryptoOrderRow[] = [];
        for (let i = startIndex; i < lines.length && i < 20; i++) {
          const [asset, type, amount, price] = lines[i].split(',').map(s => s.trim());
          if (asset && type && amount && price) {
            parsed.push({
              asset: asset.toUpperCase() as any,
              type: type.toUpperCase() as any,
              amount: parseFloat(amount),
              price: parseFloat(price)
            });
          }
        }

        if (parsed.length > 0) {
          setOrders(parsed);
          toast({
            title: 'CSV Loaded',
            description: `${parsed.length} orders loaded from CSV`,
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
    const csv = 'asset,type,amount,price\nBTC,BUY,0.01,1250000\nETH,SELL,0.5,45000';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_crypto_orders_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Validate orders
  const validateOrders = (): string | null => {
    if (orders.length === 0) {
      return 'At least one order is required';
    }

    const validAssets = ['BTC', 'ETH', 'USDT', 'USDC'];
    const validTypes = ['BUY', 'SELL'];

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      
      if (!order.asset || !validAssets.includes(order.asset)) {
        return `Row ${i + 1}: Valid asset is required (BTC, ETH, USDT, USDC)`;
      }

      if (!order.type || !validTypes.includes(order.type)) {
        return `Row ${i + 1}: Order type must be BUY or SELL`;
      }

      if (!order.amount || order.amount <= 0) {
        return `Row ${i + 1}: Amount must be greater than 0`;
      }

      if (!order.price || order.price <= 0) {
        return `Row ${i + 1}: Price must be greater than 0`;
      }
    }

    return null;
  };

  // Submit bulk orders
  const handleSubmit = async () => {
    // Validate
    const error = validateOrders();
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
      const response = await fetch('/api/bulk/crypto/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders: orders.map(({ asset, type, amount, price }) => ({ 
            asset, 
            type, 
            amount, 
            price 
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process orders');
      }

      setResults(data);

      // Update row statuses
      const updatedOrders = orders.map((order, index) => {
        const result = data.results.find((r: any) => r.index === index);
        return {
          ...order,
          status: result?.status === 'success' ? 'success' : 'error',
          error: data.errors.find((e: any) => e.index === index)?.error
        };
      });
      setOrders(updatedOrders);

      toast({
        title: data.success ? 'Success!' : 'Partial Success',
        description: `${data.successful} out of ${data.totalItems} orders processed successfully`,
        variant: data.success ? 'default' : 'destructive'
      });

    } catch (error: any) {
      console.error('Bulk crypto orders error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate totals
  const totalBuyValue = orders
    .filter(o => o.type === 'BUY')
    .reduce((sum, o) => sum + (o.amount * o.price), 0);
  
  const totalSellValue = orders
    .filter(o => o.type === 'SELL')
    .reduce((sum, o) => sum + (o.amount * o.price), 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Crypto Orders</CardTitle>
        <CardDescription>
          Create multiple buy/sell orders in a single batch (max 20 per batch)
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
            <Label>Order Details</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={orders.length >= 20}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </Button>
          </div>

          {/* Order Rows */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {orders.map((order, index) => (
              <div
                key={index}
                className={`flex gap-2 items-start p-3 rounded-lg border ${
                  order.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : order.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label className="text-xs">Asset</Label>
                      <Select
                        value={order.asset}
                        onValueChange={(value) => updateRow(index, 'asset', value)}
                        disabled={isProcessing || order.status === 'success'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {CRYPTO_ASSETS.map(asset => (
                            <SelectItem key={asset.value} value={asset.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${asset.color}`} />
                                {asset.value}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={order.type}
                        onValueChange={(value) => updateRow(index, 'type', value)}
                        disabled={isProcessing || order.status === 'success'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BUY">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              BUY
                            </div>
                          </SelectItem>
                          <SelectItem value="SELL">
                            <div className="flex items-center gap-2">
                              <TrendingDown className="h-3 w-3 text-red-600" />
                              SELL
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Amount</Label>
                      <Input
                        type="number"
                        step="0.00000001"
                        placeholder="0.01"
                        value={order.amount || ''}
                        onChange={(e) => updateRow(index, 'amount', parseFloat(e.target.value) || 0)}
                        disabled={isProcessing || order.status === 'success'}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Price (R)</Label>
                      <Input
                        type="number"
                        placeholder="1250000"
                        value={order.price || ''}
                        onChange={(e) => updateRow(index, 'price', parseFloat(e.target.value) || 0)}
                        disabled={isProcessing || order.status === 'success'}
                      />
                    </div>
                  </div>

                  {/* Order Total */}
                  {order.amount > 0 && order.price > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Total: R{(order.amount * order.price).toFixed(2)}
                    </div>
                  )}
                  
                  {order.error && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {order.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {order.status === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {order.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(index)}
                    disabled={orders.length === 1 || isProcessing || order.status === 'success'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-primary/5 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Total BUY Value
            </p>
            <p className="text-2xl font-bold text-green-600">R{totalBuyValue.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Total SELL Value
            </p>
            <p className="text-2xl font-bold text-red-600">R{totalSellValue.toFixed(2)}</p>
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
                  Batch ID: {results.batchId} | Processing time: {results.processingTimeMs}ms
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
          disabled={isProcessing || orders.length === 0}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing {orders.length} Orders...
            </>
          ) : (
            `Process ${orders.length} Order${orders.length > 1 ? 's' : ''}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
