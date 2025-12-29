'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CryptoAsset } from '@/lib/types/crypto-custody';
import { calculateP2PFee } from '@/lib/p2p-limits';

interface PlaceOrderProps {
  asset: CryptoAsset;
  marketPrice: number;
  availableBalance: number;
  onOrderPlaced?: () => void;
}

type OrderType = 'BUY' | 'SELL';

export function PlaceOrder({ asset, marketPrice, availableBalance, onOrderPlaced }: PlaceOrderProps) {
  const [orderType, setOrderType] = useState<OrderType>('BUY');
  const [price, setPrice] = useState(marketPrice.toString());
  const [amount, setAmount] = useState('');
  const [usePercentage, setUsePercentage] = useState(false);
  const [percentage, setPercentage] = useState([25]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Calculate totals
  const priceNum = parseFloat(price) || 0;
  const amountNum = parseFloat(amount) || 0;
  const totalZAR = priceNum * amountNum;
  const fee = calculateP2PFee(totalZAR);
  const netTotal = orderType === 'SELL' ? totalZAR - fee : totalZAR + fee;

  const handlePercentageChange = (value: number[]) => {
    setPercentage(value);
    const pct = value[0] / 100;
    
    if (orderType === 'BUY') {
      // For buys, percentage of ZAR balance
      const zarToUse = availableBalance * pct;
      const cryptoAmount = zarToUse / priceNum;
      setAmount(cryptoAmount.toFixed(8));
    } else {
      // For sells, percentage of crypto balance
      const cryptoToUse = availableBalance * pct;
      setAmount(cryptoToUse.toFixed(8));
    }
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!priceNum || priceNum <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    if (!amountNum || amountNum <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    // Check balance
    if (orderType === 'BUY' && netTotal > availableBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `You need R${netTotal.toFixed(2)} but only have R${availableBalance.toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    if (orderType === 'SELL' && amountNum > availableBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `You need ${amountNum} ${asset} but only have ${availableBalance}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // TODO: Call API to place order
      // const response = await matchingEngine.placeOrder({ ... });

      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

      toast({
        title: 'Order Placed',
        description: `${orderType} order for ${amountNum} ${asset} at R${priceNum} placed successfully`,
      });

      // Reset form
      setAmount('');
      setPercentage([25]);
      onOrderPlaced?.();
    } catch (error: any) {
      toast({
        title: 'Order Failed',
        description: error.message || 'Failed to place order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Order</CardTitle>
        <CardDescription>
          Buy or sell {asset} instantly with 0.5% platform fee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="BUY" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="SELL" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <TrendingDown className="h-4 w-4 mr-2" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value={orderType} className="space-y-4 mt-4">
            {/* Available Balance */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Available</span>
              <span className="font-semibold">
                {orderType === 'BUY' 
                  ? formatCurrency(availableBalance)
                  : `${availableBalance.toFixed(8)} ${asset}`
                }
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price per {asset}</Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ZAR
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                Market price: {formatCurrency(marketPrice)}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {asset}
                </span>
              </div>
            </div>

            {/* Percentage Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Quick Amount</Label>
                <span className="text-sm text-muted-foreground">{percentage[0]}%</span>
              </div>
              <Slider
                value={percentage}
                onValueChange={handlePercentageChange}
                max={100}
                step={25}
                className="w-full"
              />
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((pct) => (
                  <Button
                    key={pct}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePercentageChange([pct])}
                    className={percentage[0] === pct ? 'bg-primary text-primary-foreground' : ''}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(totalZAR)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee (0.5%)</span>
                <span className="text-orange-600">{formatCurrency(fee)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className={orderType === 'BUY' ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(netTotal)}
                </span>
              </div>
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {orderType === 'BUY' 
                  ? `You will receive ${amountNum.toFixed(8)} ${asset} in your trading balance instantly.`
                  : `You will receive ${formatCurrency(totalZAR - fee)} in your ZAR wallet instantly.`
                }
                {' '}Trades are executed instantly with no blockchain fees!
              </AlertDescription>
            </Alert>

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={loading || !priceNum || !amountNum}
              className={`w-full ${
                orderType === 'BUY' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              size="lg"
            >
              {loading ? (
                'Placing Order...'
              ) : (
                <>
                  {orderType === 'BUY' ? (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Buy {asset}
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Sell {asset}
                    </>
                  )}
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
