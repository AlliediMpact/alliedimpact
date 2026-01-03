/**
 * Stripe Payment Integration
 * 
 * Handles Stripe Checkout session creation and webhook verification.
 * Used for international payments (USD, EUR, GBP, etc.).
 * 
 * @see https://stripe.com/docs/checkout
 */

import Stripe from 'stripe';
import { Logger } from '@allied-impact/shared';

const logger = new Logger('Stripe');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
});

interface StripeCheckoutData {
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  tierId: string;
  tierName: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create Stripe Checkout session for subscription
 */
export async function createStripeCheckout(data: StripeCheckoutData): Promise<string> {
  try {
    const {
      userId,
      userEmail,
      productId,
      productName,
      tierId,
      tierName,
      amount,
      currency,
      successUrl,
      cancelUrl
    } = data;

    // Create or retrieve Stripe customer
    const customer = await getOrCreateStripeCustomer(userId, userEmail);

    // Create or retrieve Stripe product
    const stripeProduct = await getOrCreateStripeProduct(productId, productName);

    // Create or retrieve Stripe price
    const price = await getOrCreateStripePrice(
      stripeProduct.id,
      tierId,
      tierName,
      amount,
      currency
    );

    // Create Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        productId,
        tierId,
        tierName
      },
      subscription_data: {
        metadata: {
          userId,
          productId,
          tierId,
          tierName
        },
        trial_period_days: 30 // 30-day free trial
      },
      allow_promotion_codes: true
    });

    logger.info('Stripe Checkout session created', {
      userId,
      productId,
      tierId,
      amount,
      sessionId: session.id
    });

    if (!session.url) {
      throw new Error('Stripe session URL not generated');
    }

    return session.url;

  } catch (error) {
    logger.error('Stripe Checkout creation failed', error);
    throw error;
  }
}

/**
 * Get or create Stripe customer
 */
async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<Stripe.Customer> {
  try {
    // Search for existing customer
    const customers = await stripe.customers.list({
      email,
      limit: 1
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    }

    // Create new customer
    return await stripe.customers.create({
      email,
      metadata: {
        userId
      }
    });

  } catch (error) {
    logger.error('Stripe customer creation failed', error);
    throw error;
  }
}

/**
 * Get or create Stripe product
 */
async function getOrCreateStripeProduct(
  productId: string,
  productName: string
): Promise<Stripe.Product> {
  try {
    // Search for existing product
    const products = await stripe.products.search({
      query: `metadata['productId']:'${productId}'`,
      limit: 1
    });

    if (products.data.length > 0) {
      return products.data[0];
    }

    // Create new product
    return await stripe.products.create({
      name: productName,
      metadata: {
        productId
      }
    });

  } catch (error) {
    logger.error('Stripe product creation failed', error);
    throw error;
  }
}

/**
 * Get or create Stripe price
 */
async function getOrCreateStripePrice(
  productId: string,
  tierId: string,
  tierName: string,
  amount: number,
  currency: string
): Promise<Stripe.Price> {
  try {
    // Search for existing price
    const prices = await stripe.prices.search({
      query: `metadata['tierId']:'${tierId}' AND product:'${productId}'`,
      limit: 1
    });

    if (prices.data.length > 0) {
      return prices.data[0];
    }

    // Create new price
    return await stripe.prices.create({
      product: productId,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      recurring: {
        interval: 'month'
      },
      metadata: {
        tierId,
        tierName
      }
    });

  } catch (error) {
    logger.error('Stripe price creation failed', error);
    throw error;
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    return stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

  } catch (error) {
    logger.error('Stripe webhook verification failed', error);
    throw error;
  }
}

/**
 * Parse Stripe subscription data
 */
export interface StripeSubscriptionData {
  userId: string;
  productId: string;
  tierId: string;
  subscriptionId: string;
  customerId: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export function parseStripeSubscription(
  subscription: Stripe.Subscription
): StripeSubscriptionData | null {
  try {
    const metadata = subscription.metadata;
    if (!metadata.userId || !metadata.productId || !metadata.tierId) {
      return null;
    }

    return {
      userId: metadata.userId,
      productId: metadata.productId,
      tierId: metadata.tierId,
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status as any,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    };

  } catch (error) {
    logger.error('Stripe subscription parsing failed', error);
    return null;
  }
}
