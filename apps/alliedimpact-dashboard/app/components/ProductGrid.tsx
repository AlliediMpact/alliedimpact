'use client';

import { useState } from 'react';
import { useDashboard } from '../lib/dashboard-context';
import { analytics, AnalyticsEvents } from '../lib/analytics';
import { getSubscriptionProducts, ProductMetadata } from '@allied-impact/shared';
import { SubscriptionModal } from '../../components/SubscriptionModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { 
  Lock, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import type { ProductEntitlement } from '@allied-impact/types';

interface ProductCardProps {
  product: ProductMetadata;
  entitlement: ProductEntitlement | undefined;
  onSubscribeClick: (product: ProductMetadata) => void;
  userId: string;
}

function ProductCard({ product, entitlement, onSubscribeClick, userId }: ProductCardProps) {
  const hasAccess = entitlement?.status === 'active';
  const isPending = entitlement?.status === 'pending';
  const isExpired = entitlement?.status === 'expired';
  const isComingSoon = product.status === 'coming-soon';

  const handleLaunch = () => {
    if (hasAccess && product.url) {
      // Track product launch
      analytics.track(AnalyticsEvents.PRODUCT_CLICKED, {
        userId,
        productId: product.id,
        productName: product.name
      });
      window.location.href = product.url;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
        <span className="text-6xl">{product.icon}</span>
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
         isComingSoon && (
          <>
            <p className="text-sm text-muted-foreground font-medium">
              🚀 Coming Soon
            </p>
            <Button 
              variant="outline"
              disabled
              className="w-full"
            >
              Not Available Yet
            </Button>
          </>
        )}

        {!isComingSoon && hasAccess && (
          <>
            <p className="text-sm text-green-600 font-medium">
              ✓ Active subscription
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

        {!isComingSoon && isPending && (
          <>
            <p className="text-sm text-yellow-600 font-medium">
              ⏳ Access pending
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

        {!isComingSoon && !entitlement && (
          <>
            <p className="text-sm text-muted-foreground">
              Subscribe to get access
            </p>
            <Button 
              onClick={() => onSubscribeClick(product)}
              className="w-full"
            >
              View Plans
            </Button>
          </>
        )}

        {!isComingSoon && isExpired && (
          <>
            <p className="text-sm text-red-600 font-medium">
              ⚠ Subscription expired
            </p>
            <Button 
          platformUser, entitlements, loading } = useDashboard();
  const [selectedProduct, setSelectedProduct] = useState<ProductMetadata | null>(null);
  
  const products = getSubscriptionProducts();

  const handleSubscribeClick = (product: ProductMetadata) => {
    setSelectedProduct(product);
    analytics.track(AnalyticsEvents.SUBSCRIPTION_MODAL_OPENED, {
      userId: platformUser?.uid,
      productId: product.id,
      productName: product.name
    });
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const entitlement = entitlements.find(e => e.productId === product.id);
          return (
            <ProductCard 
              key={product.id} 
              product={product} 
              entitlement={entitlement}
              onSubscribeClick={handleSubscribeClick}
              userId={platformUser?.uid || ''}
            />
          );
        })}
      </div>

      {/* Subscription Modal */}
      {selectedProduct && platformUser && (
        <SubscriptionModal
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={handleCloseModal}
          userId={platformUser.uid}
        />
      )}
    </   <CardContent>
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
