/**
 * Zod validation schemas for Allied iMpact platform types
 */

import { z } from 'zod';
import { ProductId, SubscriptionTier, SubscriptionStatus, PaymentMethod, TransactionType, TransactionStatus, NotificationType, NotificationPriority } from './index';

// ============================================================================
// ENUMS AS ZOD SCHEMAS
// ============================================================================

export const ProductIdSchema = z.enum([
  'coinbox',
  'drivemaster',
  'codetech',
  'cupfinal',
  'umkhanyakude'
]);

export const SubscriptionTierSchema = z.enum([
  'free',
  'basic',
  'premium',
  'enterprise'
]);

export const SubscriptionStatusSchema = z.enum([
  'active',
  'inactive',
  'trial',
  'past_due',
  'cancelled',
  'expired'
]);

// ============================================================================
// PLATFORM USER SCHEMAS
// ============================================================================

export const PlatformUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  emailVerified: z.boolean(),
  disabled: z.boolean(),
  metadata: z.object({
    lastSignInTime: z.string().optional(),
    creationTime: z.string()
  })
});

// ============================================================================
// ENTITLEMENT SCHEMAS
// ============================================================================

export const ProductEntitlementSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: ProductIdSchema,
  tier: SubscriptionTierSchema,
  status: SubscriptionStatusSchema,
  startDate: z.date(),
  endDate: z.date().optional(),
  trialEndDate: z.date().optional(),
  autoRenew: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.any()).optional()
});

// ============================================================================
// BILLING SCHEMAS
// ============================================================================

export const PaymentMethodSchema = z.enum(['stripe', 'paypal', 'manual']);
export const TransactionTypeSchema = z.enum(['subscription', 'one_time', 'refund', 'credit']);
export const TransactionStatusSchema = z.enum(['pending', 'completed', 'failed', 'refunded']);

export const PlatformTransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: ProductIdSchema,
  amount: z.number().positive(),
  currency: z.string().length(3),
  type: TransactionTypeSchema,
  status: TransactionStatusSchema,
  paymentMethod: PaymentMethodSchema,
  paymentIntentId: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.any()).optional()
});

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================

export const NotificationTypeSchema = z.enum(['email', 'push', 'in_app', 'sms']);
export const NotificationPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: ProductIdSchema.optional(),
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema,
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  actionUrl: z.string().url().optional(),
  createdAt: z.date(),
  readAt: z.date().optional(),
  metadata: z.record(z.any()).optional()
});
