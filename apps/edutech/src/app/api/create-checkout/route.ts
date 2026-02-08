import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@allied-impact/billing';

/**
 * POST /api/create-checkout
 * Create a checkout session for premium plan
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan, productId } = body;

    if (!userId || !plan || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, plan, productId' },
        { status: 400 }
      );
    }

    // Determine plan details
    const planConfig = {
      free: null, // No checkout needed for free
      premium: {
        amount: 299, // R299/month for premium
        currency: 'ZAR',
        description: 'EduTech Premium Plan - Monthly',
      },
    };

    if (plan === 'free') {
      return NextResponse.json({
        success: true,
        checkoutUrl: null,
        message: 'Free plan does not require checkout',
      });
    }

    const config = planConfig[plan as keyof typeof planConfig];
    if (!config) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Initialize billing service
    // NOTE: Requires initializeBilling() to be called at app startup
    // For now, return placeholder until billing is fully configured
    const { getBillingService } = await import('@allied-impact/billing');
    
    try {
      const billingService = getBillingService();
      
      // Create payment intent
      const payment = await billingService.createPayment({
      userId,
      amount: config.amount,
      currency: config.currency,
      productId,
      description: config.description,
      metadata: {
        plan,
        productId,
        subscriptionType: 'monthly',
      },
    });

      // Return checkout URL
      return NextResponse.json({
        success: true,
        checkoutUrl: payment.paymentUrl || payment.checkoutUrl,
        paymentId: payment.paymentId,
      });
    } catch (billingError) {
      console.error('Billing service error:', billingError);
      // Return placeholder response until billing is fully configured
      return NextResponse.json({
        success: false,
        error: 'Billing service not yet configured. Please initialize in app startup.',
        checkoutUrl: null,
      });
    }
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
