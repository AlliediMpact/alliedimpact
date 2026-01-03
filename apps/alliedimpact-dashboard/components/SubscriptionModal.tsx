/**
 * Subscription Modal Component
 * 
 * Handles product subscription flow:
 * 1. Display product info and tiers
 * 2. Tier selection
 * 3. Payment provider selection (PayFast/Stripe)
 * 4. Payment processing
 */

'use client';

import { useState } from 'react';
import { ProductMetadata, ProductTier } from '@allied-impact/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { Check, Loader2, CreditCard, Banknote } from 'lucide-react';
import { analytics, AnalyticsEvents } from '../lib/analytics';

type PaymentProvider = 'payfast' | 'stripe';

interface SubscriptionModalProps {
  product: ProductMetadata;
  open: boolean;
  onClose: () => void;
  userId: string;
}

export function SubscriptionModal({
  product,
  open,
  onClose,
  userId
}: SubscriptionModalProps) {
  const [selectedTier, setSelectedTier] = useState<ProductTier | null>(null);
  const [provider, setProvider] = useState<PaymentProvider>('payfast');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!selectedTier) {
      setError('Please select a tier');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Track subscription attempt
      analytics.track(AnalyticsEvents.SUBSCRIPTION_STARTED, {
        userId,
        productId: product.id,
        productName: product.name,
        tierId: selectedTier.id,
        tierName: selectedTier.name,
        price: selectedTier.price,
        provider
      });

      // Create subscription
      const response = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId: product.id,
          tierId: selectedTier.id,
          provider,
          returnUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/dashboard?subscription=cancelled`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Subscription failed');
      }

      const data = await response.json();

      // Redirect to payment provider
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
      
      // Track error
      analytics.track(AnalyticsEvents.SUBSCRIPTION_FAILED, {
        userId,
        productId: product.id,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTierSelect = (tier: ProductTier) => {
    setSelectedTier(tier);
    setError(null);
    
    // Track tier selection
    analytics.track(AnalyticsEvents.TIER_SELECTED, {
      userId,
      productId: product.id,
      tierId: tier.id,
      tierName: tier.name,
      price: tier.price
    });
  };

  if (!product.subscription) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <span className="text-3xl">{product.icon}</span>
            Subscribe to {product.name}
          </DialogTitle>
          <DialogDescription className="text-base">
            {product.description}
          </DialogDescription>
        </DialogHeader>

        {/* Tier Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Choose Your Tier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {product.subscription.tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => handleTierSelect(tier)}
                disabled={loading}
                className={`
                  relative p-6 border-2 rounded-lg text-left transition-all
                  ${selectedTier?.id === tier.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {selectedTier?.id === tier.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                )}
                
                <div className="space-y-3">
                  <h4 className="font-bold text-lg">{tier.name}</h4>
                  
                  <div className="text-2xl font-bold">
                    {tier.currency} {tier.price.toLocaleString()}
                    {tier.price === 0 && <span className="text-sm font-normal text-muted-foreground ml-2">Free</span>}
                  </div>
                  
                  {product.subscription.billingCycle && (
                    <p className="text-sm text-muted-foreground">
                      {product.subscription.billingCycle === 'one-time' 
                        ? 'One-time payment' 
                        : `Per ${product.subscription.billingCycle === 'monthly' ? 'month' : 'year'}`}
                    </p>
                  )}

                  {tier.features && tier.features.length > 0 && (
                    <ul className="space-y-2 text-sm">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Provider Selection */}
        {selectedTier && selectedTier.price > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setProvider('payfast')}
                disabled={loading}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all flex items-center gap-3
                  ${provider === 'payfast' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Banknote className="h-6 w-6" />
                <div>
                  <h4 className="font-semibold">PayFast</h4>
                  <p className="text-sm text-muted-foreground">South African payments (ZAR)</p>
                </div>
                {provider === 'payfast' && (
                  <Check className="h-5 w-5 text-primary ml-auto" />
                )}
              </button>

              <button
                onClick={() => setProvider('stripe')}
                disabled={loading}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all flex items-center gap-3
                  ${provider === 'stripe' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <CreditCard className="h-6 w-6" />
                <div>
                  <h4 className="font-semibold">Stripe</h4>
                  <p className="text-sm text-muted-foreground">International payments</p>
                </div>
                {provider === 'stripe' && (
                  <Check className="h-5 w-5 text-primary ml-auto" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Trial Info */}
        {product.subscription.trialDays && selectedTier && selectedTier.price > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              🎉 <strong>{product.subscription.trialDays}-day free trial</strong> included! 
              You won't be charged until the trial ends.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubscribe}
            disabled={!selectedTier || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : selectedTier?.price === 0 ? (
              'Get Started Free'
            ) : (
              `Subscribe for ${selectedTier?.currency} ${selectedTier?.price.toLocaleString()}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
