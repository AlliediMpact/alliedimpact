'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { CryptoAsset } from '@/lib/types/crypto-custody';

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  percentage: number;
}

interface OrderBookProps {
  asset: CryptoAsset;
  depth?: number;
}

export function OrderBook({ asset, depth = 15 }: OrderBookProps) {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [spread, setSpread] = useState(0);
  const [spreadPercentage, setSpreadPercentage] = useState(0);

  useEffect(() => {
    loadOrderBook();
    const interval = setInterval(loadOrderBook, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [asset]);

  const loadOrderBook = async () => {
    // TODO: Load from API
    // For now, generate mock data
    const mockBids = generateMockOrders('buy', depth);
    const mockAsks = generateMockOrders('sell', depth);

    setBids(mockBids);
    setAsks(mockAsks);

    // Calculate spread
    if (mockBids.length > 0 && mockAsks.length > 0) {
      const bestBid = mockBids[0].price;
      const bestAsk = mockAsks[0].price;
      const spreadValue = bestAsk - bestBid;
      const spreadPct = (spreadValue / bestBid) * 100;

      setSpread(spreadValue);
      setSpreadPercentage(spreadPct);
    }
  };

  const generateMockOrders = (type: 'buy' | 'sell', count: number): OrderBookEntry[] => {
    const basePrice = asset === 'BTC' ? 850000 : asset === 'ETH' ? 45000 : 18;
    const orders: OrderBookEntry[] = [];
    let cumulativeTotal = 0;

    for (let i = 0; i < count; i++) {
      const priceOffset = type === 'buy' ? -i * 500 : i * 500;
      const price = basePrice + priceOffset;
      const amount = Math.random() * 0.5 + 0.1;
      const total = price * amount;
      cumulativeTotal += total;

      orders.push({
        price,
        amount,
        total,
        percentage: 0, // Will calculate after
      });
    }

    // Calculate percentages for depth visualization
    return orders.map(order => ({
      ...order,
      percentage: (order.total / cumulativeTotal) * 100,
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(asset === 'BTC' ? 6 : asset === 'ETH' ? 4 : 2);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Order Book
            </CardTitle>
            <CardDescription>
              Live buy and sell orders for {asset}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Spread</div>
            <div className="font-semibold">
              {formatPrice(spread)}
              <span className="text-xs text-muted-foreground ml-1">
                ({spreadPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="both" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bids">Bids</TabsTrigger>
            <TabsTrigger value="both">Both</TabsTrigger>
            <TabsTrigger value="asks">Asks</TabsTrigger>
          </TabsList>

          {/* Both View */}
          <TabsContent value="both" className="space-y-4">
            {/* Asks (Sells) - Reversed order */}
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground px-2">
                <div>Price (ZAR)</div>
                <div className="text-right">Amount ({asset})</div>
                <div className="text-right">Total (ZAR)</div>
              </div>
              {asks.slice(0, 8).reverse().map((ask, idx) => (
                <div
                  key={`ask-${idx}`}
                  className="grid grid-cols-3 text-sm px-2 py-1 rounded relative hover:bg-muted/50 cursor-pointer"
                >
                  <div
                    className="absolute inset-0 bg-red-500/10"
                    style={{ width: `${ask.percentage}%` }}
                  />
                  <div className="relative text-red-600 font-medium">{formatPrice(ask.price)}</div>
                  <div className="relative text-right">{formatAmount(ask.amount)}</div>
                  <div className="relative text-right text-muted-foreground">
                    {formatPrice(ask.total)}
                  </div>
                </div>
              ))}
            </div>

            {/* Spread */}
            <div className="border-y py-3 text-center">
              <div className="text-2xl font-bold">
                {bids.length > 0 ? formatPrice(bids[0].price) : '---'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ↕ {formatPrice(spread)} ({spreadPercentage.toFixed(2)}%)
              </div>
            </div>

            {/* Bids (Buys) */}
            <div className="space-y-1">
              {bids.slice(0, 8).map((bid, idx) => (
                <div
                  key={`bid-${idx}`}
                  className="grid grid-cols-3 text-sm px-2 py-1 rounded relative hover:bg-muted/50 cursor-pointer"
                >
                  <div
                    className="absolute inset-0 bg-green-500/10"
                    style={{ width: `${bid.percentage}%` }}
                  />
                  <div className="relative text-green-600 font-medium">{formatPrice(bid.price)}</div>
                  <div className="relative text-right">{formatAmount(bid.amount)}</div>
                  <div className="relative text-right text-muted-foreground">
                    {formatPrice(bid.total)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Bids Only */}
          <TabsContent value="bids">
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground px-2">
                <div>Price (ZAR)</div>
                <div className="text-right">Amount ({asset})</div>
                <div className="text-right">Total (ZAR)</div>
              </div>
              {bids.map((bid, idx) => (
                <div
                  key={`bid-full-${idx}`}
                  className="grid grid-cols-3 text-sm px-2 py-1 rounded relative hover:bg-muted/50 cursor-pointer"
                >
                  <div
                    className="absolute inset-0 bg-green-500/10"
                    style={{ width: `${bid.percentage}%` }}
                  />
                  <div className="relative text-green-600 font-medium">{formatPrice(bid.price)}</div>
                  <div className="relative text-right">{formatAmount(bid.amount)}</div>
                  <div className="relative text-right text-muted-foreground">
                    {formatPrice(bid.total)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Asks Only */}
          <TabsContent value="asks">
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground px-2">
                <div>Price (ZAR)</div>
                <div className="text-right">Amount ({asset})</div>
                <div className="text-right">Total (ZAR)</div>
              </div>
              {asks.map((ask, idx) => (
                <div
                  key={`ask-full-${idx}`}
                  className="grid grid-cols-3 text-sm px-2 py-1 rounded relative hover:bg-muted/50 cursor-pointer"
                >
                  <div
                    className="absolute inset-0 bg-red-500/10"
                    style={{ width: `${ask.percentage}%` }}
                  />
                  <div className="relative text-red-600 font-medium">{formatPrice(ask.price)}</div>
                  <div className="relative text-right">{formatAmount(ask.amount)}</div>
                  <div className="relative text-right text-muted-foreground">
                    {formatPrice(ask.total)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Market Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div>
            <div className="text-xs text-muted-foreground">24h Volume</div>
            <div className="font-semibold flex items-center gap-1">
              {formatPrice(Math.random() * 5000000 + 1000000)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Active Orders</div>
            <div className="font-semibold">{bids.length + asks.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
