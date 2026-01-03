/**
 * Create Subscription API Route
 * 
 * Handles subscription creation and payment provider integration.
 * Supports PayFast (South Africa) and Stripe (International).
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie } from '@allied-impact/auth';
import { getProduct, getProductTier } from '@allied-impact/shared';
import { createPayFastPayment } from '../../../lib/payfast';
import { createStripeCheckout } from '../../../lib/stripe';
import { Logger } from '@allied-impact/shared';
import { rateLimit } from '@/lib/rate-limit';

const logger = new Logger('CreateSubscriptionAPI');

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (10 attempts per 5 minutes per user)
    const rateLimitResult = await rateLimit(request, 'subscription', 10, 300);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Verify authentication
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = await verifySessionCookie(sessionCookie);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { productId, tierId, provider, returnUrl, cancelUrl } = body;

    // Validate inputs
    if (!productId || !tierId || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, tierId, provider' },
        { status: 400 }
      );
    }

    if (provider !== 'payfast' && provider !== 'stripe') {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "payfast" or "stripe"' },
        { status: 400 }
      );
    }

    // Get product and tier details
    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const tier = getProductTier(productId, tierId);
    if (!tier) {
      return NextResponse.json(
        { error: 'Tier not found' },
        { status: 404 }
      );
    }

    // Handle free tier (no payment needed)
    if (tier.price === 0) {
      return NextResponse.json(
        { 
          success: true,
          paymentUrl: null,
          message: 'Free tier - no payment required'
        },
        { status: 200 }
      );
    }

    // Create payment based on provider
    let paymentUrl: string;

    if (provider === 'payfast') {
      paymentUrl = await createPayFastPayment({
        userId: session.uid,
        userEmail: session.email || '',
        productId,
        productName: product.name,
        tierId,
        tierName: tier.name,
        amount: tier.price,
        currency: tier.currency,
        returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/dashboard?subscription=success`,
        cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/dashboard?subscription=cancelled`,
        notifyUrl: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/webhooks/payfast`
      });
    } else {
      // Stripe
      paymentUrl = await createStripeCheckout({
        userId: session.uid,
        userEmail: session.email || '',
        productId,
        productName: product.name,
        tierId,
        tierName: tier.name,
        amount: tier.price,
        currency: tier.currency,
        successUrl: returnUrl || `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/dashboard?subscription=success`,
        cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/dashboard?subscription=cancelled`
      });
    }

    logger.info('Subscription created', {
      userId: session.uid,
      productId,
      tierId,
      provider,
      amount: tier.price
    });

    return NextResponse.json(
      {
        success: true,
        paymentUrl,
        provider
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Subscription creation failed', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create subscription',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
