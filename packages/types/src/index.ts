/**
 * @allied-impact/types
 * 
 * Core TypeScript types shared across all Allied iMpact products.
 * This package defines the platform-wide type system.
 */

// ============================================================================
// PLATFORM USER TYPES
// ============================================================================

export interface PlatformUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  disabled: boolean;
  metadata: {
    lastSignInTime?: string;
    creationTime: string;
  };
}

// ============================================================================
// PRODUCT & ENTITLEMENT TYPES
// ============================================================================

export enum ProductId {
  COIN_BOX = 'coinbox',
  DRIVE_MASTER = 'drivemaster',
  CODE_TECH = 'codetech',
  CUP_FINAL = 'cupfinal',
  UMKHANYAKUDE = 'umkhanyakude',
  EDUTECH = 'edutech',
  CAREER_BOX = 'careerbox',
  MY_PROJECTS = 'myprojects'
}

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRIAL = 'trial',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export interface ProductEntitlement {
  id: string;
  userId: string;
  productId: ProductId;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  trialEndDate?: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// ============================================================================
// BILLING TYPES
// ============================================================================

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  MANUAL = 'manual'
}

export enum TransactionType {
  SUBSCRIPTION = 'subscription',
  ONE_TIME = 'one_time',
  REFUND = 'refund',
  CREDIT = 'credit'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface PlatformTransaction {
  id: string;
  userId: string;
  productId: ProductId;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export enum NotificationType {
  EMAIL = 'email',
  PUSH = 'push',
  IN_APP = 'in_app',
  SMS = 'sms'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Notification {
  id: string;
  userId: string;
  productId?: ProductId;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
  metadata?: Record<string, any>;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  timestamp: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './zod-schemas';
