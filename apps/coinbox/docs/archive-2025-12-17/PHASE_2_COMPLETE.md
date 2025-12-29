# Phase 2: Wallet System + Escrow Engine - Complete Implementation Guide

## 🎯 Overview

This document provides a comprehensive guide to the **Phase 2** backend implementation for Allied iMpact Coin Box. This phase adds complete wallet management and P2P escrow functionality to the existing Phase 1 UI.

### What Was Built

✅ **Wallet System**
- Automatic wallet creation on signup
- Secure balance management (atomic transactions)
- Paystack integration for deposits/withdrawals
- Complete transaction logging
- Fee management

✅ **P2P Escrow Engine**
- Offer creation and management
- Order lifecycle management
- Escrow lock/release mechanism
- Chat system for orders
- Dispute resolution flow

✅ **Security & Fraud Prevention**
- Firestore security rules (no client-side wallet writes)
- Risk profiling system
- Rate limiting
- Fraud detection algorithms
- Transaction validation

✅ **Cloud Functions**
- 25+ callable functions
- Scheduled jobs (auto-cancel, risk updates)
- Webhook handlers (Paystack)
- User lifecycle triggers

---

## 📂 Project Structure

```
/functions
├── package.json              # Functions dependencies
├── tsconfig.json             # TypeScript configuration
├── .eslintrc.js              # Linting rules
├── .env.example              # Environment template
└── src/
    ├── index.ts              # Main exports + triggers
    ├── types/
    │   └── index.ts          # Complete TypeScript definitions
    ├── config/
    │   ├── constants.ts      # Configuration constants
    │   └── firebase.ts       # Firebase Admin SDK setup
    ├── utils/
    │   ├── validate.ts       # Input validation utilities
    │   ├── txLogger.ts       # Transaction logging
    │   ├── paystack.ts       # Paystack API wrapper
    │   ├── fraud.ts          # Fraud detection
    │   └── notifications.ts  # Notification service
    ├── wallet/
    │   ├── walletService.ts  # Core wallet logic
    │   └── index.ts          # Wallet Cloud Functions
    ├── p2p/
    │   ├── offerService.ts   # Offer management
    │   ├── orderService.ts   # Order + Escrow engine
    │   └── index.ts          # P2P Cloud Functions
    └── scheduled/
        └── index.ts          # Scheduled jobs

/src/lib/api
├── firebase-client-config.ts # Functions client setup
├── wallet.ts                 # Wallet API client
└── p2p.ts                    # P2P API client
```

---

## 🔐 Security Architecture

### Firestore Security Rules

**Key Principles:**
- ❌ **NO client-side wallet writes** - Only Cloud Functions can modify balances
- ❌ **NO direct order creation** - Must use escrow lock functions
- ✅ **Read-only access** for users to their own data
- ✅ **Admin override** for support operations

**Critical Collections:**
- `wallets` - Read-only for users, write-only via functions
- `transactions` - Immutable audit trail
- `p2p_orders` - No client writes (escrow protection)
- `escrow_locks` - System-only access

### Authentication Flow

```typescript
// All Cloud Functions require authentication
if (!context.auth) {
  throw new Error("UNAUTHORIZED");
}

const userId = context.auth.uid;
```

---

## 💰 Wallet System

### Wallet Structure

```typescript
interface Wallet {
  userId: string;
  balance: number;              // Available balance
  lockedBalance: number;        // Funds in escrow
  totalDeposited: number;
  totalWithdrawn: number;
  totalEscrowLocked: number;
  totalEscrowReleased: number;
  lastTransactionAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Core Operations

#### 1. Credit Wallet (Atomic)
```typescript
await WalletService.creditWallet({
  userId: "user123",
  amount: 10000,
  type: "deposit",
  metadata: { reference: "PAY-123" }
});
```

#### 2. Debit Wallet (Atomic)
```typescript
await WalletService.debitWallet({
  userId: "user123",
  amount: 5000,
  type: "withdrawal",
  metadata: { bankAccount: "..." }
});
```

#### 3. Lock Balance (Escrow)
```typescript
await WalletService.lockBalance({
  userId: "seller123",
  amount: 0.001,  // BTC amount
  orderId: "order456",
  metadata: { buyer: "buyer789" }
});
```

#### 4. Release Locked Funds
```typescript
await WalletService.releaseLockedFunds({
  fromUserId: "seller123",
  toUserId: "buyer789",
  amount: 0.001,
  orderId: "order456"
});
```

### Paystack Integration

#### Deposit Flow
1. User initiates deposit → `initializeDeposit(amount, email)`
2. Returns Paystack payment URL
3. User completes payment
4. Webhook confirms → `paystackWebhook` credits wallet
5. User verifies → `verifyDeposit(reference)`

#### Withdrawal Flow
1. User requests withdrawal → `requestWithdrawal(amount, bankDetails)`
2. System validates balance
3. Debits wallet + fee
4. Initiates Paystack transfer
5. On failure → automatic refund

---

## 🤝 P2P Escrow Engine

### Offer Lifecycle

```
CREATE → ACTIVE ⟷ PAUSED → CLOSED/DELETED
```

**Offer Structure:**
```typescript
interface P2POffer {
  id: string;
  userId: string;
  offerType: "buy" | "sell";
  asset: "BTC" | "ETH" | "USDT" | "USDC";
  fiatCurrency: "NGN" | "USD";
  priceType: "fixed" | "floating";
  price: number;
  minLimit: number;
  maxLimit: number;
  availableAmount: number;
  paymentMethods: PaymentMethod[];
  paymentTimeWindow: number;  // minutes
  terms: string;
  status: "active" | "paused" | "closed" | "deleted";
  completedOrders: number;
  totalOrders: number;
  rating: number;
}
```

### Order Escrow Flow

#### Step 1: Create Order (Locks Escrow)
```typescript
const orderId = await OrderService.createOrder({
  buyerId: "buyer123",
  offerId: "offer456",
  fiatAmount: 50000,
  paymentMethod: "bank-transfer"
});
```

**What Happens:**
1. ✅ Validates user can trade (fraud check)
2. ✅ Validates offer is active
3. ✅ Calculates crypto amount
4. ✅ **Locks seller's balance in escrow**
5. ✅ Creates order with `status: "pending-payment"`
6. ✅ Sets payment deadline (e.g., 15 minutes)
7. ✅ Sends notifications to both parties

#### Step 2: Buyer Marks as Paid
```typescript
await OrderService.markAsPaid({
  orderId: "order789",
  userId: "buyer123",
  paymentProofUrl: "https://..."
});
```

**What Happens:**
1. ✅ Validates buyer
2. ✅ Checks order status is `pending-payment`
3. ✅ Checks deadline not expired
4. ✅ Updates status to `awaiting-release`
5. ✅ Notifies seller

#### Step 3: Seller Releases Crypto
```typescript
await OrderService.releaseCrypto({
  orderId: "order789",
  userId: "seller456"
});
```

**What Happens:**
1. ✅ Validates seller
2. ✅ Checks order status is `awaiting-release`
3. ✅ **Releases escrow funds from seller to buyer**
4. ✅ Updates status to `completed`
5. ✅ Updates offer stats and user ratings
6. ✅ Sends completion notifications

#### Cancel Order (Unlocks Escrow)
```typescript
await OrderService.cancelOrder({
  orderId: "order789",
  userId: "buyer123",
  reason: "Changed my mind"
});
```

**What Happens:**
1. ✅ Validates participant
2. ✅ **Unlocks seller's escrow balance**
3. ✅ Returns amount to offer availability
4. ✅ Updates status to `cancelled`
5. ✅ Logs fraud if excessive cancellations

### Auto-Cancel System

**Scheduled Function** (runs every 5 minutes):
```typescript
export const autoCancelExpiredOrders = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async () => {
    // Find orders with expired payment deadline
    // Auto-cancel and unlock escrow
  });
```

---

## 🛡️ Fraud Detection

### Risk Profiling

**Calculated Metrics:**
- Cancellation rate
- Dispute rate
- Completion rate
- Failed payments
- Average release time

**Risk Levels:**
- `low` (0-20): Normal user
- `medium` (20-40): Slightly risky
- `high` (40-70): Concerning activity
- `critical` (70-100): Auto-suspend

### Validation Checks

**Before Creating Order:**
```typescript
const canTrade = await FraudDetection.validateUserCanTrade(userId);

if (!canTrade.allowed) {
  throw new Error(canTrade.reason);
  // Possible reasons:
  // - Account suspended
  // - Too many rapid orders
  // - Multiple unpaid orders
  // - High risk profile
}
```

### Rate Limiting

```typescript
const RATE_LIMITS = {
  CREATE_OFFER: { window: 3600, max: 10 },    // 10 per hour
  CREATE_ORDER: { window: 3600, max: 20 },    // 20 per hour
  CANCEL_ORDER: { window: 3600, max: 5 },     // 5 per hour
  WITHDRAW: { window: 86400, max: 3 },        // 3 per day
};
```

---

## 🔌 Frontend Integration

### Setup Firebase Functions

```typescript
// src/lib/api/firebase-client-config.ts
import { getFunctions } from "firebase/functions";
import { app } from "@/config/firebase";

export const functions = getFunctions(app);
```

### Wallet Operations

```typescript
import { initializeDeposit, getWalletBalance } from "@/lib/api/wallet";

// Get balance
const balance = await getWalletBalance();
console.log(`Available: ₦${balance.balance}`);

// Deposit
const result = await initializeDeposit(10000, "user@example.com");
window.location.href = result.data.authorizationUrl;  // Redirect to Paystack
```

### P2P Operations

```typescript
import { createOffer, searchOffers, createOrder } from "@/lib/api/p2p";

// Create offer
const { data } = await createOffer({
  offerType: "sell",
  asset: "BTC",
  fiatCurrency: "NGN",
  priceType: "fixed",
  price: 52000000,
  minLimit: 10000,
  maxLimit: 500000,
  availableAmount: 0.01,
  paymentMethods: ["bank-transfer"],
  paymentTimeWindow: 15,
  terms: "Payment within 15 minutes"
});

// Search marketplace
const offers = await searchOffers({
  offerType: "sell",
  asset: "BTC",
  minAmount: 50000
});

// Create order
const order = await createOrder({
  offerId: "offer123",
  fiatAmount: 100000,
  paymentMethod: "bank-transfer"
});
```

---

## 🚀 Deployment

### 1. Install Functions Dependencies

```bash
cd functions
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Paystack keys
```

### 3. Build Functions

```bash
npm run build
```

### 4. Deploy to Firebase

```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:createOrder
```

### 5. Set Environment Variables (Production)

```bash
firebase functions:config:set \
  paystack.secret_key="sk_live_..." \
  paystack.public_key="pk_live_..." \
  paystack.webhook_secret="..."
```

---

## 🧪 Testing

### Local Testing with Emulators

```bash
# Start emulators
npm run emulator:start

# In another terminal
cd functions
npm run build:watch

# Connect frontend to emulator
# Set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true in .env.local
```

### Test Wallet Flow

```typescript
// Test deposit initialization
const deposit = await initializeDeposit(1000, "test@example.com");
console.log("Payment URL:", deposit.data.authorizationUrl);

// Simulate webhook (use Paystack test keys)
// POST to /paystackWebhook with test payload
```

### Test P2P Flow

```typescript
// 1. Create sell offer
const offer = await createOffer({...});

// 2. Create order (locks escrow)
const order = await createOrder({
  offerId: offer.data.offerId,
  fiatAmount: 50000,
  paymentMethod: "bank-transfer"
});

// 3. Mark as paid
await markOrderAsPaid(order.data.orderId);

// 4. Release crypto
await releaseCrypto(order.data.orderId);
```

---

## 📊 Monitoring

### Cloud Function Logs

```bash
# View all logs
firebase functions:log

# View specific function
firebase functions:log --only createOrder

# Follow logs
firebase functions:log --follow
```

### Firestore Console

Monitor collections:
- `wallets` - Check balances
- `transactions` - Audit trail
- `p2p_orders` - Order statuses
- `escrow_locks` - Locked funds
- `fraud_logs` - Security alerts

### Key Metrics to Track

- Total wallet balance vs. locked balance (should match orders)
- Failed transactions (investigate causes)
- Auto-cancelled orders (optimize payment window?)
- High-risk users (review and suspend if needed)
- Disputed orders (improve terms clarity?)

---

## ⚠️ Important Notes

### DO NOT Modify Client-Side

❌ Never attempt to update these from frontend:
- `wallets` collection
- `transactions` collection
- `p2p_orders.escrowLocked`
- `escrow_locks` collection

✅ Always use Cloud Functions for:
- Balance changes
- Order state transitions
- Escrow operations
- Transaction logging

### Atomic Transactions

All wallet operations use Firestore transactions:
```typescript
return await db.runTransaction(async (transaction) => {
  // 1. Read current state
  // 2. Validate
  // 3. Update multiple documents atomically
});
```

### Error Handling

All functions return standardized responses:
```typescript
interface CloudFunctionResponse {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}
```

---

## 🔧 Configuration Reference

### Wallet Limits

```typescript
WALLET: {
  MIN_DEPOSIT: 100,
  MIN_WITHDRAWAL: 500,
  MAX_WITHDRAWAL: 1000000,
  TRANSACTION_FEE_PERCENT: 0.5,
  WITHDRAWAL_FEE: 50,
}
```

### P2P Limits

```typescript
P2P: {
  MIN_TRADE_AMOUNT: 1000,
  MAX_TRADE_AMOUNT: 5000000,
  DEFAULT_PAYMENT_WINDOW: 15,
  MAX_PAYMENT_WINDOW: 60,
  MIN_PAYMENT_WINDOW: 5,
}
```

### Fraud Thresholds

```typescript
FRAUD: {
  MAX_FAILED_PAYMENTS: 3,
  MAX_CANCELLED_ORDERS: 5,
  MIN_COMPLETION_RATE: 70,
  HIGH_RISK_THRESHOLD: 70,
}
```

---

## 📞 Support

For issues or questions:
1. Check Cloud Function logs: `firebase functions:log`
2. Review Firestore security rules
3. Verify environment variables
4. Check Paystack dashboard for payment status

---

## ✅ Phase 2 Checklist

- [x] Wallet system with atomic transactions
- [x] Paystack deposit integration
- [x] Paystack withdrawal integration
- [x] P2P offer management
- [x] P2P order escrow engine
- [x] Chat system for orders
- [x] Auto-cancel expired orders
- [x] Fraud detection and risk profiling
- [x] Security rules (no client-side wallet writes)
- [x] Transaction logging
- [x] Frontend API integration layer
- [x] Scheduled maintenance jobs
- [x] Webhook handlers
- [x] Comprehensive documentation

---

## 🎉 Next Steps (Phase 3+)

- [ ] Real-time notifications (FCM)
- [ ] Advanced dispute resolution UI
- [ ] KYC verification integration
- [ ] Multi-currency support
- [ ] Advanced fraud ML models
- [ ] Admin dashboard for monitoring
- [ ] Automated reconciliation
- [ ] Performance optimization

---

**Phase 2 is 100% complete and production-ready!**
