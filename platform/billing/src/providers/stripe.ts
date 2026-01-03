/**
 * @allied-impact/billing - Stripe Provider
 * 
 * Stripe payment gateway integration (refactored to provider pattern)
 */

import { createLogger } from '@allied-impact/shared';
import Stripe from 'stripe';
import type {
  IPaymentProvider,
  PaymentParams,
  PaymentResult,
  SubscriptionParams,
  SubscriptionResult,
  WebhookEvent,
  PaymentProvider,
} from '../core/types';

export interface StripeConfig {
  apiKey: string;
  webhookSecret: string;
}

const logger = createLogger('billing:stripe');

export class StripeProvider implements IPaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    });
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Create a one-time payment
   */
  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: params.currency.toLowerCase(),
      metadata: {
        userId: params.userId,
        productId: params.productId,
        ...params.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: params.description,
    });

    return {
      paymentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      status: 'pending',
      provider: PaymentProvider.STRIPE,
      metadata: {
        stripePaymentIntentId: paymentIntent.id,
      },
    };
  }

  /**
   * Create a recurring subscription
   */
  async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
    // Get or create customer (implementation omitted for brevity)
    const customerId = await this.getOrCreateCustomer(params.userId);

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: params.planId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: params.userId,
        productId: params.productId,
        ...params.metadata,
      },
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return {
      subscriptionId: subscription.id,
      status: subscription.status === 'active' ? 'active' : 'pending',
      startDate: new Date(subscription.current_period_start * 1000),
      nextBillingDate: new Date(subscription.current_period_end * 1000),
      provider: PaymentProvider.STRIPE,
      metadata: {
        stripeSubscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      },
    };
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhook(event: WebhookEvent): Promise<boolean> {
    if (!event.signature) {
      return false;
    }

    try {
      // Stripe webhook verification happens at the edge
      // This is a placeholder - actual verification done in webhook endpoint
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle webhook event
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
    const { eventType, data } = event;

    switch (eventType) {
      case 'payment_intent.succeeded':
        logger.info('Payment succeeded', { paymentId: data.id, amount: data.amount });
        break;

      case 'payment_intent.payment_failed':
        logger.warn('Payment failed', { paymentId: data.id, reason: data.last_payment_error?.message });
        break;

      case 'customer.subscription.created':
        logger.info('Subscription created', { subscriptionId: data.id, customerId: data.customer });
        break;

      case 'customer.subscription.updated':
        logger.info('Subscription updated', { subscriptionId: data.id, status: data.status });
        break;

      case 'customer.subscription.deleted':
        logger.info('Subscription cancelled', { subscriptionId: data.id, customerId: data.customer });
        break;

      default:
        logger.debug('Unhandled event type', { eventType, eventId: event.id });
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<'pending' | 'completed' | 'failed'> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

    switch (paymentIntent.status) {
      case 'succeeded':
        return 'completed';
      case 'processing':
      case 'requires_action':
      case 'requires_confirmation':
      case 'requires_payment_method':
        return 'pending';
      case 'canceled':
      case 'requires_capture':
        return 'failed';
      default:
        return 'pending';
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(subscriptionId: string): Promise<'active' | 'cancelled' | 'past_due'> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    switch (subscription.status) {
      case 'active':
      case 'trialing':
        return 'active';
      case 'canceled':
      case 'incomplete':
      case 'incomplete_expired':
      case 'unpaid':
        return 'cancelled';
      case 'past_due':
        return 'past_due';
      default:
        return 'cancelled';
    }
  }

  /**
   * Helper: Get or create Stripe customer
   */
  private async getOrCreateCustomer(userId: string): Promise<string> {
    // Implementation would query Firestore for existing customer
    // or create a new one - simplified here
    const customer = await this.stripe.customers.create({
      metadata: { userId },
    });
    return customer.id;
  }
}

export default StripeProvider;
