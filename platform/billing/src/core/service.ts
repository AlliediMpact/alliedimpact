/**
 * @allied-impact/billing - Billing Service
 * 
 * Provider-agnostic billing service
 */

import type {
  IPaymentProvider,
  PaymentParams,
  PaymentResult,
  SubscriptionParams,
  SubscriptionResult,
  WebhookEvent,
  ProviderConfig,
} from './types';
import { PaymentProvider } from './types';
import { TransactionType, TransactionStatus } from '@allied-impact/types';
import { PayFastProvider } from '../providers/payfast';
import { StripeProvider } from '../providers/stripe';
import { recordTransaction, updateTransactionStatus } from './transaction-store';
import type { ProductId } from '@allied-impact/types';

// Simple logger for billing service
const logger = {
  info: (msg: string, data?: any) => console.log(`[billing] ${msg}`, data || ''),
  warn: (msg: string, data?: any) => console.warn(`[billing] ${msg}`, data || ''),
  error: (msg: string, data?: any) => console.error(`[billing] ${msg}`, data || ''),
  debug: (msg: string, data?: any) => console.debug(`[billing] ${msg}`, data || ''),
};

export class BillingService {
  private providers: Map<PaymentProvider, IPaymentProvider> = new Map();
  private defaultProvider: PaymentProvider;

  constructor(configs: ProviderConfig[], defaultProvider: PaymentProvider) {
    this.defaultProvider = defaultProvider;

    // Initialize providers
    for (const { provider, config } of configs) {
      switch (provider) {
        case PaymentProvider.PAYFAST:
          this.providers.set(provider, new PayFastProvider(config as any));
          break;
        case PaymentProvider.STRIPE:
          this.providers.set(provider, new StripeProvider(config as any));
          break;
        default:
          logger.warn('Unknown provider', { provider });
      }
    }
  }

  /**
   * Get provider instance
   */
  private getProvider(provider?: PaymentProvider): IPaymentProvider {
    const selectedProvider = provider || this.defaultProvider;
    const providerInstance = this.providers.get(selectedProvider);

    if (!providerInstance) {
      throw new Error(`Payment provider not configured: ${selectedProvider}`);
    }

    return providerInstance;
  }

  /**
   * Create a one-time payment
   */
  async createPayment(
    params: PaymentParams,
    provider?: PaymentProvider
  ): Promise<PaymentResult> {
    const providerInstance = this.getProvider(provider);
    const result = await providerInstance.createPayment(params);

    // Record transaction
    await recordTransaction({
      userId: params.userId,
      productId: params.productId,
      amount: params.amount,
      currency: params.currency,
      type: TransactionType.ONE_TIME,
      status: TransactionStatus.PENDING,
      paymentMethod: result.provider as any,
      paymentIntentId: result.paymentId,
      description: params.description,
      metadata: params.metadata,
    });

    return result;
  }

  /**
   * Create a recurring subscription
   */
  async createSubscription(
    params: SubscriptionParams,
    provider?: PaymentProvider
  ): Promise<SubscriptionResult> {
    const providerInstance = this.getProvider(provider);
    const result = await providerInstance.createSubscription(params);

    // Record transaction
    await recordTransaction({
      userId: params.userId,
      productId: params.productId,
      amount: params.amount,
      currency: params.currency,
      type: TransactionType.SUBSCRIPTION,
      status: TransactionStatus.PENDING,
      paymentMethod: result.provider as any,
      paymentIntentId: result.subscriptionId,
      description: `${params.billingCycle} subscription`,
      metadata: {
        ...params.metadata,
        subscriptionId: result.subscriptionId,
        planId: params.planId,
      },
    });

    return result;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    provider?: PaymentProvider
  ): Promise<void> {
    const providerInstance = this.getProvider(provider);
    await providerInstance.cancelSubscription(subscriptionId);

    // Update transaction status
    // Note: This assumes you track subscription IDs
    // Implementation would need to query transactions
  }

  /**
   * Handle webhook from payment provider
   */
  async handleWebhook(
    event: WebhookEvent,
    provider?: PaymentProvider
  ): Promise<void> {
    const providerInstance = this.getProvider(provider || event.provider);

    // Verify webhook
    const isValid = await providerInstance.verifyWebhook(event);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Handle webhook
    await providerInstance.handleWebhook(event);

    // Update transaction status based on event
    // Implementation depends on your event mapping
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(
    paymentId: string,
    provider?: PaymentProvider
  ): Promise<'pending' | 'completed' | 'failed'> {
    const providerInstance = this.getProvider(provider);
    return providerInstance.getPaymentStatus(paymentId);
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(
    subscriptionId: string,
    provider?: PaymentProvider
  ): Promise<'active' | 'cancelled' | 'past_due'> {
    const providerInstance = this.getProvider(provider);
    return providerInstance.getSubscriptionStatus(subscriptionId);
  }
}

// Singleton instance
let billingService: BillingService | null = null;

/**
 * Initialize billing service
 */
export function initializeBilling(
  configs: ProviderConfig[],
  defaultProvider: PaymentProvider = PaymentProvider.PAYFAST
): BillingService {
  if (!billingService) {
    billingService = new BillingService(configs, defaultProvider);
  }
  return billingService;
}

/**
 * Get billing service instance
 */
export function getBillingService(): BillingService {
  if (!billingService) {
    throw new Error('Billing service not initialized. Call initializeBilling first.');
  }
  return billingService;
}

export default {
  initializeBilling,
  getBillingService,
  BillingService,
};
