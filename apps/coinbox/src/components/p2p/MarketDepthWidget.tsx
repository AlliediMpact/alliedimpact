"use client";

import { useEffect, useState } from "react";
import { getMarketDepth } from "@/lib/matchingApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";

interface MarketDepthProps {
  asset: string;
  fiatCurrency: string;
}

export function MarketDepthWidget({ asset, fiatCurrency }: MarketDepthProps) {
  const [depth, setDepth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarketDepth();
    // Refresh every 30 seconds
    const interval = setInterval(loadMarketDepth, 30000);
    return () => clearInterval(interval);
  }, [asset, fiatCurrency]);

  async function loadMarketDepth() {
    try {
      setLoading(true);
      const data = await getMarketDepth({ asset, fiatCurrency });
      setDepth(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !depth) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const maxBuyAmount = Math.max(...(depth?.buyOrders?.map((o: any) => o.amount) || [0]));
  const maxSellAmount = Math.max(...(depth?.sellOrders?.map((o: any) => o.amount) || [0]));
  const maxAmount = Math.max(maxBuyAmount, maxSellAmount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Market Depth</span>
          <span className="text-sm font-normal text-muted-foreground">
            {asset}/{fiatCurrency}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Buy Orders (Bids) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-green-500">
                Buy Orders ({depth?.buyOrders?.length || 0})
              </span>
            </div>
            <div className="space-y-1">
              {depth?.buyOrders?.slice(0, 5).map((order: any, index: number) => (
                <div key={index} className="relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-green-500/10"
                    style={{ width: `${(order.amount / maxAmount) * 100}%` }}
                  />
                  <div className="relative flex items-center justify-between text-xs py-1 px-2">
                    <span className="font-mono text-green-600">
                      {order.price.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      {order.amount.toFixed(4)} {asset}
                    </span>
                    <span className="text-muted-foreground">
                      ({order.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spread Indicator */}
          <div className="flex items-center justify-center py-2 border-y">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Spread</p>
              <p className="text-sm font-semibold">
                {depth?.sellOrders?.[0] && depth?.buyOrders?.[0]
                  ? (depth.sellOrders[0].price - depth.buyOrders[0].price).toFixed(2)
                  : "—"}
              </p>
            </div>
          </div>

          {/* Sell Orders (Asks) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowDown className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-red-500">
                Sell Orders ({depth?.sellOrders?.length || 0})
              </span>
            </div>
            <div className="space-y-1">
              {depth?.sellOrders?.slice(0, 5).map((order: any, index: number) => (
                <div key={index} className="relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-red-500/10"
                    style={{ width: `${(order.amount / maxAmount) * 100}%` }}
                  />
                  <div className="relative flex items-center justify-between text-xs py-1 px-2">
                    <span className="font-mono text-red-600">
                      {order.price.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      {order.amount.toFixed(4)} {asset}
                    </span>
                    <span className="text-muted-foreground">
                      ({order.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
