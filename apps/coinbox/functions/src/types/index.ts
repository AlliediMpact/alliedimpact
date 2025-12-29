/**
 * Core Type Definitions for Wallet + Escrow System
 * Phase 2 Backend Implementation
 */

export type TransactionType = 
  | "deposit" 
  | "withdrawal" 
  | "send" 
  | "receive" 
  | "escrow-lock" 
  | "escrow-release"
  | "escrow-refund"
  | "fee";

export type TransactionStatus = 
  | "pending" 
  | "processing" 
  | "success" 
  | "failed" 
  | "cancelled";

export type OrderStatus = 
  | "pending-payment" 
  | "awaiting-release" 
  | "completed" 
  | "cancelled" 
  | "disputed" 
  | "expired";

export type OfferType = "buy" | "sell";

export type OfferStatus = "active" | "paused" | "closed" | "deleted";

export type PaymentMethod = 
  | "bank-transfer" 
  | "mobile-money" 
  | "paystack" 
  | "cash" 
  | "ussd" 
  | "card" 
  | "other";

export type AssetType = "BTC" | "ETH" | "USDT" | "USDC" | "NGN" | "USD";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type PriceType = "fixed" | "floating";

/**
 * Chat Message Type (Phase 6)
 */
export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  message: string;
  type: "text" | "system" | "payment-proof" | "bank-details";
  attachmentUrl?: string;
  readAt?: Date;
  readBy?: string;
  createdAt: Date;
}

/**
 * User Wallet Structure
 */
export interface Wallet {
  userId: string;
  balance: number;
  lockedBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEscrowLocked: number;
  totalEscrowReleased: number;
  lastTransactionAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transaction Log Entry
 */
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  relatedUserId?: string;
  relatedOrderId?: string;
  relatedOfferId?: string;
  metadata: {
    description?: string;
    paymentReference?: string;
    paystackReference?: string;
    bankDetails?: any;
    ipAddress?: string;
    deviceId?: string;
    userAgent?: string;
    [key: string]: any;
  };
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

/**
 * P2P Offer Structure
 */
export interface P2POffer {
  id: string;
  userId: string;
  offerType: OfferType;
  asset: AssetType;
  fiatCurrency: AssetType;
  priceType: PriceType;
  price: number;
  minLimit: number;
  maxLimit: number;
  availableAmount: number;
  paymentMethods: PaymentMethod[];
  paymentTimeWindow: number; // in minutes
  terms: string;
  status: OfferStatus;
  completedOrders: number;
  totalOrders: number;
  rating: number;
  autoReply?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

/**
 * P2P Order Structure
 */
export interface P2POrder {
  id: string;
  offerId: string;
  buyerId: string;
  sellerId: string;
  asset: AssetType;
  fiatCurrency: AssetType;
  cryptoAmount: number;
  fiatAmount: number;
  price: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentTimeWindow: number;
  paymentDeadline: Date;
  escrowLocked: boolean;
  escrowAmount: number;
  paymentProofUrl?: string;
  paymentProofSubmittedAt?: Date;
  releasedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancelReason?: string;
  disputeId?: string;
  chatMessages: ChatMessage[];
  metadata: {
    ipAddress?: string;
    deviceId?: string;
    userAgent?: string;
    bankAccountDetails?: any;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Chat Message Structure
 */
export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  message: string;
  type: "text" | "system" | "payment-proof" | "bank-details";
  attachmentUrl?: string;
  createdAt: Date;
}

/**
 * Paystack Deposit Request
 */
export interface DepositRequest {
  userId: string;
  amount: number;
  email: string;
  currency: string;
  metadata: {
    userId: string;
    type: "wallet-deposit";
    [key: string]: any;
  };
}

/**
 * Paystack Withdrawal Request
 */
export interface WithdrawalRequest {
  userId: string;
  amount: number;
  recipientCode: string;
  reason?: string;
  currency: string;
}

/**
 * Fraud Detection Log
 */
export interface FraudLog {
  id: string;
  userId: string;
  type: "suspicious-activity" | "failed-payment" | "multiple-cancels" | "rapid-orders";
  severity: RiskLevel;
  description: string;
  metadata: any;
  ipAddress?: string;
  deviceId?: string;
  createdAt: Date;
}

/**
 * User Risk Profile
 */
export interface UserRiskProfile {
  userId: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  totalOrders: number;
  cancelledOrders: number;
  disputedOrders: number;
  failedPayments: number;
  successfulOrders: number;
  completionRate: number;
  averageReleaseTime: number; // in minutes
  lastActivityAt: Date;
  isSuspended: boolean;
  suspensionReason?: string;
  flags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Escrow Lock Record
 */
export interface EscrowLock {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  status: "locked" | "released" | "refunded";
  lockedAt: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  expiresAt: Date;
}

/**
 * Cloud Function Response
 */
export interface CloudFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

/**
 * Paystack Webhook Payload
 */
export interface PaystackWebhookPayload {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    customer: {
      id: number;
      customer_code: string;
      email: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

/**
 * Validation Error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Rate Limit Record
 */
export interface RateLimitRecord {
  userId: string;
  action: string;
  count: number;
  windowStart: Date;
  windowEnd: Date;
}
