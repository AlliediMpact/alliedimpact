/**
 * @allied-impact/billing
 * 
 * Platform-wide billing and payment service.
 * Provider-agnostic architecture supporting PayFast, Stripe, and more.
 */

// Export core types
export * from './core/types';

// Export service
export * from './core/service';
export { default as BillingService } from './core/service';

// Export transaction store
export * from './core/transaction-store';

// Export providers
export { PayFastProvider } from './providers/payfast';
export { StripeProvider } from './providers/stripe';

// Legacy exports (for backwards compatibility - to be deprecated)
import Stripe from 'stripe';
import { getFirestore, collection, doc, addDoc, getDoc, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { PlatformTransaction, ProductId, TransactionType, TransactionStatus, PaymentMethod } from '@allied-impact/types';

let stripe: Stripe | null = null;

/**
 * @deprecated Use initializeBilling with provider pattern instead
 */
export function initializeStripe(apiKey: string): Stripe {
  if (!stripe) {
    stripe = new Stripe(apiKey, {
      apiVersion: '2024-11-20.acacia',
      typescript: true
    });
  }
  return stripe;
}

/**
 * @deprecated Use getBillingService() instead
 */
export function getStripeInstance(): Stripe {
  if (!stripe) {
    throw new Error('Stripe not initialized. Call initializeStripe first.');
  }
  return stripe;
}

/**
 * @deprecated Use BillingService.createPayment() instead
 */
export async function createPaymentIntent(
  userId: string,
  productId: ProductId,
  amount: number,
  currency: string = 'zar',
  metadata?: Record<string, string>
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const stripe = getStripeInstance();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    metadata: {
      userId,
      productId,
      ...metadata
    },
    automatic_payment_methods: {
      enabled: true
    }
  });
  
  // Record transaction
  await recordTransaction({
    userId,
    productId,
    amount,
    currency,
    type: 'one_time',
    status: 'pending',
    paymentMethod: 'stripe',
    paymentIntentId: paymentIntent.id,
    description: `Payment for ${productId}`
  });
  
  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id
  };
}

/**
 * Create a subscription for recurring payments
 */
export async function createSubscription(
  userId: string,
  productId: ProductId,
  priceId: string,
  metadata?: Record<string, string>
): Promise<{ subscriptionId: string; clientSecret: string }> {
  const stripe = getStripeInstance();
  
  // Get or create Stripe customer
  const customerId = await getOrCreateCustomer(userId);
  
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      userId,
      productId,
      ...metadata
    }
  });
  
  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
  
  // Record transaction
  await recordTransaction({
    userId,
    productId,
    amount: (subscription.items.data[0].price.unit_amount || 0) / 100,
    currency: subscription.currency,
    type: 'subscription',
    status: 'pending',
    paymentMethod: 'stripe',
    paymentIntentId: paymentIntent.id,
    description: `Subscription for ${productId}`,
    metadata: {
      subscriptionId: subscription.id,
      priceId
    }
  });
  
  return {
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret!
  };
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<void> {
  const stripe = getStripeInstance();
  
  if (cancelAtPeriodEnd) {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
  } else {
    await stripe.subscriptions.cancel(subscriptionId);
  }
}

/**
 * Get or create Stripe customer for user
 */
async function getOrCreateCustomer(userId: string): Promise<string> {
  const db = getFirestore();
  const userDoc = await getDoc(doc(db, 'platform_users', userId));
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userDoc.data();
  
  // Check if customer already exists
  if (userData.stripeCustomerId) {
    return userData.stripeCustomerId;
  }
  
  // Create new customer
  const stripe = getStripeInstance();
  const customer = await stripe.customers.create({
    email: userData.email,
    metadata: { userId }
  });
  
  // Save customer ID
  await updateDoc(doc(db, 'platform_users', userId), {
    stripeCustomerId: customer.id,
    updatedAt: Timestamp.now()
  });
  
  return customer.id;
}

/**
 * Record transaction in Firestore
 */
export async function recordTransaction(
  transaction: Omit<PlatformTransaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = getFirestore();
  const now = new Date();
  
  const docRef = await addDoc(collection(db, 'platform_transactions'), {
    ...transaction,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now)
  });
  
  return docRef.id;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  metadata?: Record<string, any>
): Promise<void> {
  const db = getFirestore();
  
  const updates: any = {
    status,
    updatedAt: Timestamp.now()
  };
  
  if (metadata) {
    updates.metadata = metadata;
  }
  
  await updateDoc(doc(db, 'platform_transactions', transactionId), updates);
}

/**
 * Get transaction by payment intent ID
 */
export async function getTransactionByPaymentIntent(
  paymentIntentId: string
): Promise<PlatformTransaction | null> {
  const db = getFirestore();
  const q = query(
    collection(db, 'platform_transactions'),
    where('paymentIntentId', '==', paymentIntentId)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  } as PlatformTransaction;
}

/**
 * Get user's transaction history
 */
export async function getUserTransactions(
  userId: string,
  limit: number = 50
): Promise<PlatformTransaction[]> {
  const db = getFirestore();
  const q = query(
    collection(db, 'platform_transactions'),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as PlatformTransaction;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<void> {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
      
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const transaction = await getTransactionByPaymentIntent(paymentIntent.id);
  
  if (transaction) {
    await updateTransactionStatus(transaction.id, 'completed', {
      stripePaymentIntentStatus: paymentIntent.status
    });
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const transaction = await getTransactionByPaymentIntent(paymentIntent.id);
  
  if (transaction) {
    await updateTransactionStatus(transaction.id, 'failed', {
      stripePaymentIntentStatus: paymentIntent.status,
      failureReason: paymentIntent.last_payment_error?.message
    });
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  if (invoice.subscription) {
    // Handle successful subscription payment
    const metadata = invoice.metadata;
    if (metadata?.userId && metadata?.productId) {
      await recordTransaction({
        userId: metadata.userId,
        productId: metadata.productId as ProductId,
        amount: (invoice.amount_paid || 0) / 100,
        currency: invoice.currency,
        type: 'subscription',
        status: 'completed',
        paymentMethod: 'stripe',
        paymentIntentId: invoice.payment_intent as string,
        description: `Subscription payment for ${metadata.productId}`,
        metadata: {
          subscriptionId: invoice.subscription as string,
          invoiceId: invoice.id
        }
      });
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  // Handle failed subscription payment
  console.error('Invoice payment failed:', invoice.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  // Handle subscription cancellation
  console.log('Subscription deleted:', subscription.id);
}

/**
 * Refund a payment
 */
export async function refundPayment(
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<void> {
  const stripe = getStripeInstance();
  
  const refundData: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId
  };
  
  if (amount) {
    refundData.amount = Math.round(amount * 100);
  }
  
  if (reason) {
    refundData.reason = reason as Stripe.RefundCreateParams.Reason;
  }
  
  const refund = await stripe.refunds.create(refundData);
  
  // Update transaction status
  const transaction = await getTransactionByPaymentIntent(paymentIntentId);
  if (transaction) {
    await updateTransactionStatus(transaction.id, 'refunded', {
      refundId: refund.id,
      refundAmount: refund.amount / 100
    });
  }
}

export default {
  initializeStripe,
  getStripeInstance,
  createPaymentIntent,
  createSubscription,
  cancelSubscription,
  recordTransaction,
  updateTransactionStatus,
  getTransactionByPaymentIntent,
  getUserTransactions,
  handleStripeWebhook,
  refundPayment
};
