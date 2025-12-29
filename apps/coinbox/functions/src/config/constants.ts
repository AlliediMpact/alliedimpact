/**
 * Configuration Constants
 */

export const CONFIG = {
  // Paystack Configuration
  PAYSTACK: {
    SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || "",
    PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY || "",
    BASE_URL: "https://api.paystack.co",
    WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET || "",
  },

  // Wallet Configuration
  WALLET: {
    MIN_DEPOSIT: 100, // Minimum deposit in base currency
    MIN_WITHDRAWAL: 500, // Minimum withdrawal
    MAX_WITHDRAWAL: 1000000, // Maximum single withdrawal
    TRANSACTION_FEE_PERCENT: 0.5, // 0.5% transaction fee
    WITHDRAWAL_FEE: 50, // Flat withdrawal fee
  },

  // P2P Configuration
  P2P: {
    MIN_TRADE_AMOUNT: 1000, // Minimum trade in NGN
    MAX_TRADE_AMOUNT: 5000000, // Maximum trade in NGN
    DEFAULT_PAYMENT_WINDOW: 15, // 15 minutes
    MAX_PAYMENT_WINDOW: 60, // 60 minutes
    MIN_PAYMENT_WINDOW: 5, // 5 minutes
    ESCROW_LOCK_BUFFER: 2, // 2 hours buffer for escrow locks
    AUTO_CANCEL_BUFFER: 5, // Auto-cancel 5 minutes after deadline
  },

  // Rate Limiting
  RATE_LIMITS: {
    CREATE_OFFER: { window: 3600, max: 10 }, // 10 offers per hour
    CREATE_ORDER: { window: 3600, max: 20 }, // 20 orders per hour
    CANCEL_ORDER: { window: 3600, max: 5 }, // 5 cancels per hour
    WITHDRAW: { window: 86400, max: 3 }, // 3 withdrawals per day
    DEPOSIT: { window: 3600, max: 10 }, // 10 deposits per hour
  },

  // Fraud Detection
  FRAUD: {
    MAX_FAILED_PAYMENTS: 3,
    MAX_CANCELLED_ORDERS: 5,
    MIN_COMPLETION_RATE: 70, // 70%
    SUSPICIOUS_RAPID_ORDERS: 5, // 5 orders in 10 minutes
    HIGH_RISK_THRESHOLD: 70,
    MEDIUM_RISK_THRESHOLD: 40,
  },

  // Validation
  VALIDATION: {
    MIN_AMOUNT_PRECISION: 2,
    MAX_AMOUNT_PRECISION: 8,
    MAX_TERMS_LENGTH: 500,
    MAX_MESSAGE_LENGTH: 1000,
  },
};

export const ERROR_CODES = {
  // Authentication Errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // Validation Errors
  INVALID_INPUT: "INVALID_INPUT",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  AMOUNT_TOO_LOW: "AMOUNT_TOO_LOW",
  AMOUNT_TOO_HIGH: "AMOUNT_TOO_HIGH",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",

  // Wallet Errors
  WALLET_NOT_FOUND: "WALLET_NOT_FOUND",
  WALLET_LOCKED: "WALLET_LOCKED",

  // Transaction Errors
  TRANSACTION_FAILED: "TRANSACTION_FAILED",
  DUPLICATE_TRANSACTION: "DUPLICATE_TRANSACTION",

  // P2P Errors
  OFFER_NOT_FOUND: "OFFER_NOT_FOUND",
  OFFER_INACTIVE: "OFFER_INACTIVE",
  OFFER_UNAVAILABLE: "OFFER_UNAVAILABLE",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  ORDER_EXPIRED: "ORDER_EXPIRED",
  INVALID_ORDER_STATUS: "INVALID_ORDER_STATUS",
  NOT_ORDER_PARTICIPANT: "NOT_ORDER_PARTICIPANT",

  // Escrow Errors
  ESCROW_LOCK_FAILED: "ESCROW_LOCK_FAILED",
  ESCROW_ALREADY_LOCKED: "ESCROW_ALREADY_LOCKED",
  ESCROW_NOT_LOCKED: "ESCROW_NOT_LOCKED",
  ESCROW_RELEASE_FAILED: "ESCROW_RELEASE_FAILED",

  // Payment Errors
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_VERIFICATION_FAILED: "PAYMENT_VERIFICATION_FAILED",
  PAYSTACK_ERROR: "PAYSTACK_ERROR",

  // Rate Limit Errors
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // Fraud Errors
  SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY",
  USER_SUSPENDED: "USER_SUSPENDED",
  HIGH_RISK_USER: "HIGH_RISK_USER",

  // General Errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NOT_FOUND: "NOT_FOUND",
};

export const COLLECTIONS = {
  USERS: "users",
  WALLETS: "wallets",
  TRANSACTIONS: "transactions",
  P2P_OFFERS: "p2p_offers",
  P2P_ORDERS: "p2p_orders",
  CHAT_MESSAGES: "chat_messages",
  ESCROW_LOCKS: "escrow_locks",
  FRAUD_LOGS: "fraud_logs",
  USER_RISK_PROFILES: "user_risk_profiles",
  RATE_LIMITS: "rate_limits",
  PAYSTACK_WEBHOOKS: "paystack_webhooks",
  // Phase 4: KYC
  KYC_PROFILES: "kyc_profiles",
  // Phase 7: Disputes
  DISPUTES: "disputes",
  // Membership System
  MEMBERSHIPS: "memberships",
};
