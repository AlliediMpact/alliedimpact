/**
 * Stripe Webhook Handler
 * 
 * Processes Stripe webhook events for subscription lifecycle management.
 * Handles payment success, failure, subscription updates, and cancellations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhook, parseStripeSubscription } from '../../../lib/stripe';
import { grantSubscription, revokeEntitlement } from '@allied-impact/entitlements';
import { Logger } from '@allied-impact/shared';
import { track } from '@allied-impact/shared';
import Stripe from 'stripe';

const logger = new Logger('StripeWebhook');

export async function POST(request: NextRequest) {
  try {
    // Get raw body and signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logger.error('Stripe signature missing');
      return NextResponse.json(
        { error: 'Signature missing' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyStripeWebhook(body, signature);
    } catch (error) {
      logger.error('Stripe signature verification failed', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    logger.info('Stripe webhook received', { 
      type: event.type,
      id: event.id 
    });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.info('Unhandled Stripe event type', { type: event.type });
    }

    // Return 200 OK to acknowledge receipt
    return NextResponse.json(
      { received: true },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Stripe webhook processing failed', error);
    
    // Return 500 to trigger retry from Stripe
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata;
    if (!metadata || !metadata.userId || !metadata.productId || !metadata.tierId) {
      logger.error('Checkout session missing metadata', { sessionId: session.id });
      return;
    }

    logger.info('Checkout completed', {
      userId: metadata.userId,
      productId: metadata.productId,
      tierId: metadata.tierId,
      sessionId: session.id
    });

    // Track checkout completion
    await track(metadata.userId, 'CHECKOUT_COMPLETED', {
      productId: metadata.productId,
      tierId: metadata.tierId,
      provider: 'stripe',
      sessionId: session.id
    });

  } catch (error) {
    logger.error('Checkout completion handler failed', error);
  }
}

/**
 * Handle subscription created/updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const data = parseStripeSubscription(subscription);
    if (!data) {
      logger.error('Subscription parsing failed', { subscriptionId: subscription.id });
      return;
    }

    // Grant or update entitlement based on status
    if (data.status === 'active' || data.status === 'trialing') {
      await grantSubscription(
        data.userId,
        data.productId,
        data.tierId,
        {
          provider: 'stripe',
          subscriptionId: data.subscriptionId,
          startDate: new Date(),
          endDate: data.currentPeriodEnd,
          autoRenew: !data.cancelAtPeriodEnd
        }
      );

      // Track subscription activation
      await track(data.userId, 'SUBSCRIPTION_ACTIVATED', {
        productId: data.productId,
        tierId: data.tierId,
        provider: 'stripe',
        subscriptionId: data.subscriptionId,
        status: data.status
      });

      logger.info('Stripe subscription activated', {
        userId: data.userId,
        productId: data.productId,
        tierId: data.tierId,
        subscriptionId: data.subscriptionId,
        status: data.status
      });

    } else if (data.status === 'past_due' || data.status === 'unpaid') {
      // Track payment issue
      await track(data.userId, 'SUBSCRIPTION_PAYMENT_ISSUE', {
        productId: data.productId,
        tierId: data.tierId,
        provider: 'stripe',
        subscriptionId: data.subscriptionId,
        status: data.status
      });

      logger.warn('Stripe subscription payment issue', {
        userId: data.userId,
        subscriptionId: data.subscriptionId,
        status: data.status
      });
    }

  } catch (error) {
    logger.error('Subscription update handler failed', error);
  }
}

/**
 * Handle subscription deleted/cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const data = parseStripeSubscription(subscription);
    if (!data) {
      logger.error('Subscription parsing failed', { subscriptionId: subscription.id });
      return;
    }

    // Revoke entitlement
    await revokeEntitlement(data.userId, data.productId);

    // Track cancellation
    await track(data.userId, 'SUBSCRIPTION_CANCELLED', {
      productId: data.productId,
      tierId: data.tierId,
      provider: 'stripe',
      subscriptionId: data.subscriptionId,
      reason: 'subscription_deleted'
    });

    logger.info('Stripe subscription cancelled', {
      userId: data.userId,
      productId: data.productId,
      subscriptionId: data.subscriptionId
    });

  } catch (error) {
    logger.error('Subscription deletion handler failed', error);
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) {
      return;
    }

    logger.info('Stripe payment succeeded', {
      invoiceId: invoice.id,
      subscriptionId,
      amount: invoice.amount_paid
    });

    // Payment success is handled by subscription.updated event
    // This is just for logging/tracking

  } catch (error) {
    logger.error('Payment success handler failed', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;
    const customerId = invoice.customer as string;

    logger.warn('Stripe payment failed', {
      invoiceId: invoice.id,
      subscriptionId,
      customerId,
      amount: invoice.amount_due
    });

    // Track payment failure
    if (invoice.customer_email) {
      await track(customerId, 'PAYMENT_FAILED', {
        invoiceId: invoice.id,
        subscriptionId,
        amount: invoice.amount_due,
        provider: 'stripe'
      });
    }

  } catch (error) {
    logger.error('Payment failure handler failed', error);
  }
}

// Disable body parsing (we need raw body for signature verification)
export const config = {
  api: {
    bodyParser: false
  }
};
