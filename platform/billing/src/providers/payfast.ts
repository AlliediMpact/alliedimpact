/**
 * @allied-impact/billing - PayFast Provider
 * 
 * PayFast payment gateway integration for South African market
 */

import { createLogger } from '@allied-impact/shared';
import crypto from 'crypto';
import type {
  IPaymentProvider,
  PaymentParams,
  PaymentResult,
  SubscriptionParams,
  SubscriptionResult,
  WebhookEvent,
  PaymentProvider,
} from '../core/types';

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  sandbox?: boolean;
}

const logger = createLogger('billing:payfast');

export class PayFastProvider implements IPaymentProvider {
  private config: PayFastConfig;
  private baseUrl: string;

  constructor(config: PayFastConfig) {
    this.config = config;
    this.baseUrl = config.sandbox
      ? 'https://sandbox.payfast.co.za'
      : 'https://www.payfast.co.za';
  }

  /**
   * Generate MD5 signature for PayFast
   */
  private generateSignature(data: Record<string, string>): string {
    // Create parameter string
    const paramString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
      .join('&');

    // Append passphrase
    const signatureString = this.config.passphrase
      ? `${paramString}&passphrase=${encodeURIComponent(this.config.passphrase)}`
      : paramString;

    // Generate MD5 hash
    return crypto.createHash('md5').update(signatureString).digest('hex');
  }

  /**
   * Create a one-time payment
   */
  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    const paymentData: Record<string, string> = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: this.config.returnUrl,
      cancel_url: this.config.cancelUrl,
      notify_url: this.config.notifyUrl,
      
      // Payment details
      amount: params.amount.toFixed(2),
      item_name: params.description || `Payment for ${params.productId}`,
      item_description: params.description || '',
      
      // Custom fields
      custom_str1: params.userId,
      custom_str2: params.productId,
      custom_str3: params.metadata ? JSON.stringify(params.metadata) : '',
    };

    // Generate signature
    const signature = this.generateSignature(paymentData);

    // Build payment URL
    const queryString = Object.keys(paymentData)
      .map((key) => `${key}=${encodeURIComponent(paymentData[key])}`)
      .join('&');

    const paymentUrl = `${this.baseUrl}/eng/process?${queryString}&signature=${signature}`;

    return {
      paymentId: `pf_${Date.now()}_${params.userId}`,
      paymentUrl,
      status: 'pending',
      provider: PaymentProvider.PAYFAST,
      metadata: { signature },
    };
  }

  /**
   * Create a recurring subscription
   */
  async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
    const frequency = params.billingCycle === 'monthly' ? 3 : 6; // PayFast frequency codes
    const cycles = 0; // 0 = until cancelled

    const subscriptionData: Record<string, string> = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: this.config.returnUrl,
      cancel_url: this.config.cancelUrl,
      notify_url: this.config.notifyUrl,
      
      // Subscription details
      subscription_type: '1', // Subscription
      billing_date: new Date().toISOString().split('T')[0],
      recurring_amount: params.amount.toFixed(2),
      frequency: frequency.toString(),
      cycles: cycles.toString(),
      
      // Item details
      item_name: `${params.productId} Subscription`,
      item_description: `${params.billingCycle} subscription`,
      
      // Custom fields
      custom_str1: params.userId,
      custom_str2: params.productId,
      custom_str3: params.planId,
    };

    const signature = this.generateSignature(subscriptionData);

    const queryString = Object.keys(subscriptionData)
      .map((key) => `${key}=${encodeURIComponent(subscriptionData[key])}`)
      .join('&');

    const paymentUrl = `${this.baseUrl}/eng/process?${queryString}&signature=${signature}`;

    return {
      subscriptionId: `pf_sub_${Date.now()}_${params.userId}`,
      status: 'pending',
      startDate: new Date(),
      paymentUrl,
      provider: PaymentProvider.PAYFAST,
      metadata: { signature },
    };
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Note: PayFast doesn't have an API for cancellation
    // Cancellations are handled through the merchant dashboard
    // or by the customer through the payment portal
    console.warn('[PayFast] Subscription cancellation must be done through PayFast dashboard');
    throw new Error('PayFast subscription cancellation requires manual action via dashboard');
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhook(event: WebhookEvent): Promise<boolean> {
    if (!event.signature) {
      return false;
    }

    // Extract data without signature
    const data: Record<string, string> = {};
    for (const [key, value] of Object.entries(event.data)) {
      if (key !== 'signature') {
        data[key] = String(value);
      }
    }

    const calculatedSignature = this.generateSignature(data);
    return calculatedSignature === event.signature;
  }

  /**
   * Handle webhook event
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
    const { data } = event;

    // PayFast sends payment_status
    const paymentStatus = data.payment_status as string;

    switlogger.info('Payment completed', { 
          transactionId: data.pf_payment_id, 
          amount: data.amount_gross,
          userId: data.custom_str1 
        });
        // Update transaction status in your system
        break;
      
      case 'FAILED':
        logger.warn('Payment failed', { 
          transactionId: data.pf_payment_id,
          userId: data.custom_str1 
        });
        break;
      
      case 'PENDING':
        logger.debug('Payment pending', { transactionId: data.pf_payment_id });
        break;
      
      default:
        logger.warn('Unknown payment status', { status: paymentStatus, transactionId: data.pf_payment_id }
      default:
        console.log('[PayFast] Unknown payment status:', paymentStatus);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<'pending' | 'completed' | 'failed'> {
    // PayFast doesn't provide a status API
    // Status is only available through webhooks
    throw new Error('PayFast does not support real-time payment status checks');
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(subscriptionId: string): Promise<'active' | 'cancelled' | 'past_due'> {
    // PayFast doesn't provide a status API
    throw new Error('PayFast does not support real-time subscription status checks');
  }
}

export default PayFastProvider;
