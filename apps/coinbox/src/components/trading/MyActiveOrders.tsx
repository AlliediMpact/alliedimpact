'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CryptoAsset, TransactionStatus } from '@/lib/types/crypto-custody';

interface Order {
  id: string;
  userId: string;
  asset: CryptoAsset;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  filled: number;
  remaining: number;
  status: TransactionStatus;
  createdAt: Date;
  expiresAt: Date;
}

interface MyActiveOrdersProps {
  userId: string;
  onOrderCancelled?: () => void;
}

export function MyActiveOrders({ userId, onOrderCancelled }: MyActiveOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [userId]);

  const loadOrders = async () => {
    try {
      // TODO: Call API to fetch user's active orders
      // const response = await fetch(`/api/crypto/orders?userId=${userId}&status=PENDING`);
      // const data = await response.json();
      
      // Mock data for now
      const mockOrders: Order[] = [
        {
          id: '1',
          userId,
          asset: 'BTC',
          type: 'BUY',
          price: 1250000,
          amount: 0.01,
          filled: 0.005,
          remaining: 0.005,
          status: 'PENDING',
          createdAt: new Date(Date.now() - 3600000),
          expiresAt: new Date(Date.now() + 86400000),
        },
        {
          id: '2',
          userId,
          asset: 'ETH',
          type: 'SELL',
          price: 42000,
          amount: 0.5,
          filled: 0.2,
          remaining: 0.3,
          status: 'PENDING',
          createdAt: new Date(Date.now() - 7200000),
          expiresAt: new Date(Date.now() + 79200000),
        },
      ];

      setOrders(mockOrders);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId);

    try {
      // TODO: Call API to cancel order
      // const response = await matchingEngine.cancelOrder(orderId, userId);

      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled and funds unlocked',
      });

      setOrders(orders.filter(o => o.id !== orderId));
      onOrderCancelled?.();
    } catch (error: any) {
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Failed to cancel order',
        variant: 'destructive',
      });
    } finally {
      setCancellingId(null);
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

  const formatTime = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const getTimeRemaining = (expiresAt: Date) => {
    const diff = expiresAt.getTime() - Date.now();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Active Orders</CardTitle>
          <CardDescription>Loading your orders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Active Orders</CardTitle>
          <CardDescription>You have no active orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Place a buy or sell order to start trading crypto with instant matching!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Active Orders</CardTitle>
        <CardDescription>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} pending execution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => {
            const fillPercentage = ((order.filled / order.amount) * 100).toFixed(1);
            const isCancelling = cancellingId === order.id;

            return (
              <div
                key={order.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {order.type === 'BUY' ? (
                      <Badge className="bg-green-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        BUY
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        SELL
                      </Badge>
                    )}
                    <span className="font-semibold">{order.asset}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={isCancelling}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isCancelling ? (
                      <span className="text-xs">Cancelling...</span>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </>
                    )}
                  </Button>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Price</span>
                    <p className="font-semibold">{formatCurrency(order.price)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount</span>
                    <p className="font-semibold">
                      {order.amount.toFixed(8)} {order.asset}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total</span>
                    <p className="font-semibold">
                      {formatCurrency(order.price * order.amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining</span>
                    <p className="font-semibold">
                      {order.remaining.toFixed(8)} {order.asset}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                {order.filled > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Filled</span>
                      <span className="font-medium">{fillPercentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          order.type === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created {formatTime(order.createdAt)}
                  </div>
                  <div>
                    Expires in {getTimeRemaining(order.expiresAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
