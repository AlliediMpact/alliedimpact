'use client';

import { useDashboard } from '../lib/dashboard-context';
import { analytics, AnalyticsEvents } from '../lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { 
  Wallet, 
  Car, 
  Code, 
  Users, 
  Lock, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import type { ProductEntitlement } from '@allied-impact/types';

interface Product {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  color: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'coinbox',
    name: 'Coin Box',
    description: 'P2P financial platform with savings jars, crypto trading, and international money transfers',
    icon: Wallet,
    url: process.env.NEXT_PUBLIC_COINBOX_URL || 'http://localhost:3002',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'drive-master',
    name: 'Drive Master',
    description: 'Comprehensive driving school management system',
    icon: Car,
    url: process.env.NEXT_PUBLIC_DRIVE_MASTER_URL || 'http://localhost:3003',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'codetech',
    name: 'CodeTech',
    description: 'Learn programming and technology skills',
    icon: Code,
    url: process.env.NEXT_PUBLIC_CODETECH_URL || 'http://localhost:3004',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'umkhanyakude',
    name: 'Umkhanyakude',
    description: 'Community platform for local services',
    icon: Users,
    url: process.env.NEXT_PUBLIC_UMKHANYAKUDE_URL || 'http://localhost:3005',
    color: 'from-orange-500 to-red-600',
  },
];

interface ProductCardProps {
  product: Product;
  entitlement: ProductEntitlement | undefined;
}

function ProductCard({ product, entitlement }: ProductCardProps) {
  const Icon = product.icon;
  const hasAccess = entitlement?.status === 'active';
  const isPending = entitlement?.status === 'pending';
  const isExpired = entitlement?.status === 'expired';

  const handleLaunch = () => {
    if (hasAccess) {
      window.location.href = product.url;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`h-32 bg-gradient-to-br ${product.color} flex items-center justify-center`}>
        <Icon className="w-16 h-16 text-white" />
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{product.name}</CardTitle>
          {hasAccess && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {isPending && (
            <Clock className="w-5 h-5 text-yellow-500" />
          )}
          {!entitlement && (
            <Lock className="w-5 h-5 text-muted-foreground" />
          )}
          {isExpired && (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {hasAccess && (
          <>
            <p className="text-sm text-green-600 font-medium">
              Active subscription
            </p>
            <Button 
              onClick={handleLaunch}
              className="w-full flex items-center justify-center space-x-2"
            >
              <span>Launch {product.name}</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </>
        )}

        {isPending && (
          <>
            <p className="text-sm text-yellow-600 font-medium">
              Access pending approval
            </p>
            <Button 
              variant="outline"
              disabled
              className="w-full"
            >
              Pending Access
            </Button>
          </>
        )}

        {!entitlement && (
          <>
            <p className="text-sm text-muted-foreground">
              Subscribe to get access
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/subscriptions?product=' + product.id}
              className="w-full"
            >
              View Plans
            </Button>
          </>
        )}

        {isExpired && (
          <>
            <p className="text-sm text-red-600 font-medium">
              Subscription expired
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/subscriptions?product=' + product.id}
              className="w-full"
            >
              Renew Subscription
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProductGrid() {
  const { entitlements, loading } = useDashboard();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-muted" />
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-full" />
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {PRODUCTS.map((product) => {
        const entitlement = entitlements.find(e => e.productId === product.id);
        return (
          <ProductCard 
            key={product.id} 
            product={product} 
            entitlement={entitlement}
          />
        );
      })}
    </div>
  );
}
