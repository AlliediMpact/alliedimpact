/**
 * @allied-impact/billing - Billing Service
 * 
 * Provider-agnostic billing service
 */

import { createLogger } from '@allied-impact/shared';

import type {
  IPaymentProvider,
  PaymentParams,
  PaymentResult,
  SubscriptionParams,
  SubscriptionResult,
  WebhookEvent,
  PaymentProvider as PaymentProviderEnum,
  ProviderConfig,
} from './core/types';
import { PayFastProvider } from './providers/payfast';
import { StripeProvider } from './providers/stripe';
import { recordTransaction, updateTransactionStatus } from './core/transaction-store';
import type { ProductId } from '@allied-impact/types';

const logger = createLogger('billing');

export class BillingService {
  private providers: Map<PaymentProviderEnum, IPaymentProvider> = new Map();
  private defaultProvider: PaymentProviderEnum;

  constructor(configs: ProviderConfig[], defaultProvider: PaymentProviderEnum) {
    this.defaultProvider = defaultProvider;

    // Initialize providers
    for (const { provider, config } of configs) {
      switch (provider) {
        case PaymentProviderEnum.PAYFAST:
          this.providers.set(provider, new PayFastProvider(config as any));
          break;
        case PaymentProviderEnum.STRIPE:
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
  private getProvider(provider?: PaymentProviderEnum): IPaymentProvider {
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
    provider?: PaymentProviderEnum
  ): Promise<PaymentResult> {
    const providerInstance = this.getProvider(provider);
    const result = await providerInstance.createPayment(params);

    // Record transaction
    await recordTransaction({
      userId: params.userId,
      productId: params.productId,
      amount: params.amount,
      currency: params.currency,
      type: 'one_time',
      status: 'pending',
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
    provider?: PaymentProviderEnum
  ): Promise<SubscriptionResult> {
    const providerInstance = this.getProvider(provider);
    const result = await providerInstance.createSubscription(params);

    // Record transaction
    await recordTransaction({
      userId: params.userId,
      productId: params.productId,
      amount: params.amount,
      currency: params.currency,
      type: 'subscription',
      status: 'pending',
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
    provider?: PaymentProviderEnum
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
    provider?: PaymentProviderEnum
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
    provider?: PaymentProviderEnum
  ): Promise<'pending' | 'completed' | 'failed'> {
    const providerInstance = this.getProvider(provider);
    return providerInstance.getPaymentStatus(paymentId);
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(
    subscriptionId: string,
    provider?: PaymentProviderEnum
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
  defaultProvider: PaymentProviderEnum = PaymentProviderEnum.PAYFAST
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
