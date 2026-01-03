/**
 * @allied-impact/billing - Core Types
 * 
 * Provider-agnostic billing types and interfaces
 */

import type { ProductId } from '@allied-impact/types';

export enum PaymentProvider {
  PAYFAST = 'payfast',
  STRIPE = 'stripe',
  MANUAL = 'manual',
}

export interface PaymentParams {
  userId: string;
  productId: ProductId;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  paymentId: string;
  paymentUrl?: string; // For redirect-based payments
  clientSecret?: string; // For client-side SDK
  status: 'pending' | 'completed' | 'failed';
  provider: PaymentProvider;
  metadata?: Record<string, any>;
}

export interface SubscriptionParams {
  userId: string;
  productId: ProductId;
  planId: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  metadata?: Record<string, string>;
}

export interface SubscriptionResult {
  subscriptionId: string;
  status: 'active' | 'pending' | 'cancelled';
  startDate: Date;
  nextBillingDate?: Date;
  paymentUrl?: string;
  provider: PaymentProvider;
  metadata?: Record<string, any>;
}

export interface WebhookEvent {
  provider: PaymentProvider;
  eventType: string;
  eventId: string;
  timestamp: Date;
  data: Record<string, any>;
  signature?: string;
}

export interface IPaymentProvider {
  /**
   * Create a one-time payment
   */
  createPayment(params: PaymentParams): Promise<PaymentResult>;
  
  /**
   * Create a recurring subscription
   */
  createSubscription(params: SubscriptionParams): Promise<SubscriptionResult>;
  
  /**
   * Cancel a subscription
   */
  cancelSubscription(subscriptionId: string): Promise<void>;
  
  /**
   * Verify webhook signature
   */
  verifyWebhook(event: WebhookEvent): Promise<boolean>;
  
  /**
   * Handle webhook event
   */
  handleWebhook(event: WebhookEvent): Promise<void>;
  
  /**
   * Get payment status
   */
  getPaymentStatus(paymentId: string): Promise<'pending' | 'completed' | 'failed'>;
  
  /**
   * Get subscription status
   */
  getSubscriptionStatus(subscriptionId: string): Promise<'active' | 'cancelled' | 'past_due'>;
}

export interface ProviderConfig {
  provider: PaymentProvider;
  config: Record<string, string>;
}
