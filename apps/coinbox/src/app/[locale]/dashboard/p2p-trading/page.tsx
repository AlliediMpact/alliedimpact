'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { OrderBook } from '@/components/trading/OrderBook';
import { PlaceOrder } from '@/components/trading/PlaceOrder';
import { MyActiveOrders } from '@/components/trading/MyActiveOrders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import type { CryptoAsset } from '@/lib/types/crypto-custody';

interface AssetBalance {
  asset: CryptoAsset;
  available: number;
  locked: number;
}

interface MarketData {
  asset: CryptoAsset;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export default function P2PTradingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>('BTC');
  const [balances, setBalances] = useState<AssetBalance[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    } else {
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      loadBalances();
      loadMarketData();
    }
  }, [selectedAsset, user]);

  const loadBalances = async () => {
    // TODO: Call API to fetch balances
    // const response = await cryptoBalanceService.getAllBalances(userId);
    
    // Mock data
    const mockBalances: AssetBalance[] = [
      { asset: 'BTC', available: 0.05, locked: 0.01 },
      { asset: 'ETH', available: 1.5, locked: 0.3 },
      { asset: 'USDT', available: 5000, locked: 1000 },
    ];
    setBalances(mockBalances);
  };

  const loadMarketData = async () => {
    // TODO: Call API to fetch market data
    
    // Mock data
    const mockData: MarketData = {
      asset: selectedAsset,
      price: selectedAsset === 'BTC' ? 1250000 : selectedAsset === 'ETH' ? 42000 : 18.5,
      change24h: Math.random() * 10 - 5,
      volume24h: Math.random() * 1000000,
      high24h: selectedAsset === 'BTC' ? 1260000 : selectedAsset === 'ETH' ? 43000 : 18.7,
      low24h: selectedAsset === 'BTC' ? 1240000 : selectedAsset === 'ETH' ? 41000 : 18.3,
    };
    setMarketData(mockData);
  };

  const handleOrderPlaced = () => {
    loadBalances();
    loadMarketData();
  };

  const handleOrderCancelled = () => {
    loadBalances();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getCurrentBalance = () => {
    const balance = balances.find(b => b.asset === selectedAsset);
    return balance?.available || 0;
  };

  const getZARBalance = () => {
    // TODO: Get actual ZAR balance from wallet
    return 50000; // Mock ZAR balance
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access crypto trading.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">P2P Crypto Trading</h1>
        <p className="text-muted-foreground">
          Trade crypto instantly with 0.5% platform fee. No blockchain fees, instant settlement.
        </p>
      </div>

      {/* Asset Selector */}
      <Tabs value={selectedAsset} onValueChange={(v) => setSelectedAsset(v as CryptoAsset)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="BTC">Bitcoin (BTC)</TabsTrigger>
          <TabsTrigger value="ETH">Ethereum (ETH)</TabsTrigger>
          <TabsTrigger value="USDT">Tether (USDT)</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedAsset} className="space-y-6 mt-6">
          {/* Market Overview */}
          {marketData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{marketData.asset}</CardTitle>
                    <CardDescription>Market Overview</CardDescription>
                  </div>
                  <Badge
                    variant={marketData.change24h >= 0 ? 'default' : 'secondary'}
                    className={marketData.change24h >= 0 ? 'bg-green-500' : 'bg-red-500'}
                  >
                    {marketData.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(marketData.change24h).toFixed(2)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-2xl font-bold">{formatCurrency(marketData.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h High</p>
                    <p className="text-xl font-semibold text-green-600">
                      {formatCurrency(marketData.high24h)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h Low</p>
                    <p className="text-xl font-semibold text-red-600">
                      {formatCurrency(marketData.low24h)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(marketData.volume24h)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Trading Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: Order Book */}
            <div className="lg:col-span-1">
              <OrderBook asset={selectedAsset} />
            </div>

            {/* Middle Column: Place Order */}
            <div className="lg:col-span-1">
              <PlaceOrder
                asset={selectedAsset}
                marketPrice={marketData?.price || 0}
                availableBalance={selectedAsset === 'BTC' || selectedAsset === 'ETH' || selectedAsset === 'USDT' 
                  ? getCurrentBalance() 
                  : getZARBalance()
                }
                onOrderPlaced={handleOrderPlaced}
              />
            </div>

            {/* Right Column: Active Orders */}
            <div className="lg:col-span-1">
              <MyActiveOrders userId={user.uid} onOrderCancelled={handleOrderCancelled} />
            </div>
          </div>

          {/* Balances Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Balances</CardTitle>
              <CardDescription>Available and locked funds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">ZAR Wallet</p>
                  <p className="text-xl font-semibold">{formatCurrency(getZARBalance())}</p>
                </div>
                {balances.map((balance) => (
                  <div key={balance.asset} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">{balance.asset}</p>
                    <p className="text-xl font-semibold">
                      {balance.available.toFixed(8)}
                    </p>
                    {balance.locked > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Locked: {balance.locked.toFixed(8)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info Banner */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Why Trade on CoinBox?
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Instant settlement - no blockchain delays</li>
                    <li>✓ Zero blockchain fees on internal trades</li>
                    <li>✓ 0.5% platform fee - highly competitive</li>
                    <li>✓ Secure custody by FSCA-regulated Luno</li>
                    <li>✓ Real-time order matching engine</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
