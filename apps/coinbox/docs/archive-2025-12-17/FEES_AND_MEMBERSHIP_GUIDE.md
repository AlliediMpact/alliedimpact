# Fees & Membership System Integration Guide

## 🎯 Overview

This document outlines the complete fee structure and membership system integration for Coin Box P2P Trading Platform, leveraging the KYC verification levels as membership tiers.

---

## 💰 Fee Structure

### 1. Transaction Fees (Already Implemented)

**Location**: `functions/src/config/constants.ts`

```typescript
WALLET: {
  TRANSACTION_FEE_PERCENT: 0.5, // 0.5% base fee
  WITHDRAWAL_FEE: 50, // ₦50 flat fee
}
```

**Applied On:**
- ✅ Wallet deposits (Paystack)
- ✅ P2P order creation (escrow lock)
- ✅ Crypto releases (order completion)
- ✅ Bank withdrawals

**Current Implementation:**
- Located in: `functions/src/wallet/walletService.ts`
- Method: `calculateFees()`
- Automatically deducted during transactions

---

### 2. Membership-Based Fee Tiers (NEW)

#### Free Tier (KYC Level 0)
- **Transaction Fee**: 1.0%
- **Withdrawal Fee**: ₦100
- **Daily Limit**: ₦10,000
- **Monthly Subscription**: ₦0 (Free)
- **Features**:
  - Basic P2P trading
  - Standard chat support
  - Basic market view
  - Manual order matching

#### Basic Tier (KYC Level 1)
- **Transaction Fee**: 0.75%
- **Withdrawal Fee**: ₦75
- **Daily Limit**: ₦50,000
- **Monthly Subscription**: ₦0 (Free with verification)
- **Features**:
  - Verified trading
  - Standard chat support
  - Market depth view
  - Basic AI insights

#### Standard Tier (KYC Level 2) - **PAID**
- **Transaction Fee**: 0.5%
- **Withdrawal Fee**: ₦50
- **Daily Limit**: ₦500,000
- **Monthly Subscription**: ₦5,000/month
- **Features**:
  - Verified ID trading
  - Priority chat support
  - Full market depth
  - AI market insights
  - Order matching suggestions
  - Trading analytics

#### Premium Tier (KYC Level 3) - **PAID**
- **Transaction Fee**: 0.25%
- **Withdrawal Fee**: ₦25
- **Daily Limit**: ₦5,000,000
- **Monthly Subscription**: ₦20,000/month
- **Features**:
  - Premium verified trading
  - 24/7 priority support
  - Advanced AI predictions
  - Auto-matching
  - Personal trading profile
  - Risk management tools
  - Dispute priority handling
  - API access (future)

---

## 🏗️ Implementation: Membership System

### Step 1: Add Membership Collection

**New Firestore Collection**: `memberships`

```typescript
// functions/src/types/membership.ts

export type MembershipTier = "free" | "basic" | "standard" | "premium";

export interface Membership {
  userId: string;
  tier: MembershipTier;
  kycLevel: 0 | 1 | 2 | 3;
  subscriptionStatus: "active" | "cancelled" | "expired" | "trial";
  subscriptionId?: string; // Paystack subscription ID
  startDate: Date;
  expiryDate?: Date;
  autoRenew: boolean;
  paymentMethod?: string;
  monthlyFee: number;
  transactionFeePercent: number;
  withdrawalFee: number;
  dailyLimit: number;
  features: string[];
  usage: {
    ordersThisMonth: number;
    volumeThisMonth: number;
    lastResetDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Step 2: Create Membership Service

**File**: `functions/src/membership/membershipService.ts`

```typescript
import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/constants";
import { Membership, MembershipTier } from "../types/membership";

export const TIER_CONFIG = {
  free: {
    tier: "free" as MembershipTier,
    kycLevel: 0,
    monthlyFee: 0,
    transactionFeePercent: 1.0,
    withdrawalFee: 100,
    dailyLimit: 10000,
    features: [
      "basic-trading",
      "standard-chat",
      "basic-market-view",
    ],
  },
  basic: {
    tier: "basic" as MembershipTier,
    kycLevel: 1,
    monthlyFee: 0,
    transactionFeePercent: 0.75,
    withdrawalFee: 75,
    dailyLimit: 50000,
    features: [
      "basic-trading",
      "verified-badge",
      "standard-chat",
      "market-depth",
      "basic-ai-insights",
    ],
  },
  standard: {
    tier: "standard" as MembershipTier,
    kycLevel: 2,
    monthlyFee: 5000,
    transactionFeePercent: 0.5,
    withdrawalFee: 50,
    dailyLimit: 500000,
    features: [
      "verified-trading",
      "priority-chat",
      "full-market-depth",
      "ai-market-insights",
      "order-matching",
      "trading-analytics",
    ],
  },
  premium: {
    tier: "premium" as MembershipTier,
    kycLevel: 3,
    monthlyFee: 20000,
    transactionFeePercent: 0.25,
    withdrawalFee: 25,
    dailyLimit: 5000000,
    features: [
      "premium-trading",
      "24-7-support",
      "advanced-ai",
      "auto-matching",
      "trading-profile",
      "risk-management",
      "dispute-priority",
      "api-access",
    ],
  },
};

export class MembershipService {
  /**
   * Create initial membership for new user
   */
  static async createMembership(userId: string): Promise<void> {
    const config = TIER_CONFIG.free;
    
    const membership: Omit<Membership, "userId"> = {
      tier: config.tier,
      kycLevel: config.kycLevel,
      subscriptionStatus: "active",
      startDate: new Date(),
      autoRenew: false,
      monthlyFee: config.monthlyFee,
      transactionFeePercent: config.transactionFeePercent,
      withdrawalFee: config.withdrawalFee,
      dailyLimit: config.dailyLimit,
      features: config.features,
      usage: {
        ordersThisMonth: 0,
        volumeThisMonth: 0,
        lastResetDate: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection(COLLECTIONS.MEMBERSHIPS).doc(userId).set({
      userId,
      ...membership,
    });
  }

  /**
   * Upgrade membership tier
   */
  static async upgradeTier(params: {
    userId: string;
    targetTier: MembershipTier;
    paymentReference?: string;
  }): Promise<void> {
    const config = TIER_CONFIG[params.targetTier];
    const membershipRef = db.collection(COLLECTIONS.MEMBERSHIPS).doc(params.userId);

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now

    await membershipRef.update({
      tier: config.tier,
      kycLevel: config.kycLevel,
      subscriptionStatus: "active",
      monthlyFee: config.monthlyFee,
      transactionFeePercent: config.transactionFeePercent,
      withdrawalFee: config.withdrawalFee,
      dailyLimit: config.dailyLimit,
      features: config.features,
      expiryDate,
      autoRenew: true,
      updatedAt: new Date(),
    });

    // Log transaction if paid tier
    if (config.monthlyFee > 0) {
      await this.logSubscriptionPayment({
        userId: params.userId,
        amount: config.monthlyFee,
        tier: params.targetTier,
        reference: params.paymentReference,
      });
    }
  }

  /**
   * Get user membership
   */
  static async getMembership(userId: string): Promise<Membership | null> {
    const doc = await db.collection(COLLECTIONS.MEMBERSHIPS).doc(userId).get();
    
    if (!doc.exists) {
      return null;
    }

    return doc.data() as Membership;
  }

  /**
   * Check if user has feature access
   */
  static async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const membership = await this.getMembership(userId);
    
    if (!membership) {
      return false;
    }

    return membership.features.includes(feature);
  }

  /**
   * Calculate fee for transaction based on membership tier
   */
  static async calculateTransactionFee(
    userId: string,
    amount: number
  ): Promise<{ fee: number; feePercent: number }> {
    const membership = await this.getMembership(userId);
    
    if (!membership) {
      // Default to free tier
      return {
        fee: (amount * TIER_CONFIG.free.transactionFeePercent) / 100,
        feePercent: TIER_CONFIG.free.transactionFeePercent,
      };
    }

    const fee = (amount * membership.transactionFeePercent) / 100;
    
    return {
      fee,
      feePercent: membership.transactionFeePercent,
    };
  }

  /**
   * Check daily limit compliance
   */
  static async checkDailyLimit(
    userId: string,
    amount: number
  ): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const membership = await this.getMembership(userId);
    
    if (!membership) {
      return { allowed: false, remaining: 0, limit: 0 };
    }

    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshot = await db
      .collection(COLLECTIONS.P2P_ORDERS)
      .where("buyerId", "==", userId)
      .where("createdAt", ">=", today)
      .get();

    const todayVolume = snapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().fiatAmount || 0),
      0
    );

    const remaining = membership.dailyLimit - todayVolume;
    const allowed = todayVolume + amount <= membership.dailyLimit;

    return {
      allowed,
      remaining: Math.max(0, remaining),
      limit: membership.dailyLimit,
    };
  }

  /**
   * Track usage for the month
   */
  static async trackUsage(userId: string, orderAmount: number): Promise<void> {
    const membershipRef = db.collection(COLLECTIONS.MEMBERSHIPS).doc(userId);
    const doc = await membershipRef.get();
    
    if (!doc.exists) return;

    const membership = doc.data() as Membership;
    const now = new Date();
    const lastReset = membership.usage.lastResetDate;

    // Reset if new month
    if (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    ) {
      await membershipRef.update({
        "usage.ordersThisMonth": 1,
        "usage.volumeThisMonth": orderAmount,
        "usage.lastResetDate": now,
      });
    } else {
      await membershipRef.update({
        "usage.ordersThisMonth": membership.usage.ordersThisMonth + 1,
        "usage.volumeThisMonth": membership.usage.volumeThisMonth + orderAmount,
      });
    }
  }

  /**
   * Log subscription payment
   */
  private static async logSubscriptionPayment(params: {
    userId: string;
    amount: number;
    tier: MembershipTier;
    reference?: string;
  }): Promise<void> {
    await db.collection(COLLECTIONS.TRANSACTIONS).add({
      userId: params.userId,
      type: "subscription",
      amount: params.amount,
      status: "success",
      metadata: {
        tier: params.tier,
        reference: params.reference,
        type: "membership-upgrade",
      },
      createdAt: new Date(),
    });
  }

  /**
   * Handle subscription renewal
   */
  static async renewSubscription(userId: string): Promise<void> {
    const membership = await this.getMembership(userId);
    
    if (!membership || !membership.autoRenew) {
      return;
    }

    // Check if expired
    if (membership.expiryDate && membership.expiryDate < new Date()) {
      // Downgrade to free tier
      await this.downgradeTier(userId);
    }
  }

  /**
   * Downgrade to free tier (expired subscription)
   */
  static async downgradeTier(userId: string): Promise<void> {
    const config = TIER_CONFIG.free;
    
    await db.collection(COLLECTIONS.MEMBERSHIPS).doc(userId).update({
      tier: config.tier,
      kycLevel: config.kycLevel,
      subscriptionStatus: "expired",
      monthlyFee: config.monthlyFee,
      transactionFeePercent: config.transactionFeePercent,
      withdrawalFee: config.withdrawalFee,
      dailyLimit: config.dailyLimit,
      features: config.features,
      autoRenew: false,
      updatedAt: new Date(),
    });
  }
}
```

---

### Step 3: Integrate with KYC System

**Modify**: `functions/src/kyc/kycService.ts`

Add membership upgrade on KYC approval:

```typescript
// After KYC level approval, upgrade membership tier
import { MembershipService } from "../membership/membershipService";

// In approveLevel method, after updating KYC profile:
if (targetLevel === 1) {
  await MembershipService.upgradeTier({
    userId,
    targetTier: "basic",
  });
} else if (targetLevel === 2) {
  await MembershipService.upgradeTier({
    userId,
    targetTier: "standard",
  });
} else if (targetLevel === 3) {
  await MembershipService.upgradeTier({
    userId,
    targetTier: "premium",
  });
}
```

---

### Step 4: Enforce Fees in Wallet Service

**Modify**: `functions/src/wallet/walletService.ts`

Replace static fee calculation with membership-based:

```typescript
import { MembershipService } from "../membership/membershipService";

// Replace calculateFees method:
static async calculateFees(
  userId: string,
  amount: number,
  type: "transaction" | "withdrawal"
): Promise<number> {
  if (type === "transaction") {
    const { fee } = await MembershipService.calculateTransactionFee(userId, amount);
    return fee;
  } else {
    const membership = await MembershipService.getMembership(userId);
    return membership?.withdrawalFee || CONFIG.WALLET.WITHDRAWAL_FEE;
  }
}
```

---

### Step 5: Enforce Daily Limits in Order Creation

**Modify**: `functions/src/p2p/orderService.ts`

Add daily limit check:

```typescript
import { MembershipService } from "../membership/membershipService";

// In createOrder method, before escrow lock:
const limitCheck = await MembershipService.checkDailyLimit(
  userId,
  params.fiatAmount
);

if (!limitCheck.allowed) {
  throw new Error(
    `Daily trading limit exceeded. Limit: ₦${limitCheck.limit.toLocaleString()}, ` +
    `Remaining: ₦${limitCheck.remaining.toLocaleString()}`
  );
}

// After order creation:
await MembershipService.trackUsage(userId, params.fiatAmount);
```

---

### Step 6: Feature Gates

**Create**: `functions/src/middleware/featureGate.ts`

```typescript
import { MembershipService } from "../membership/membershipService";

export async function requireFeature(
  userId: string,
  feature: string
): Promise<void> {
  const hasAccess = await MembershipService.hasFeatureAccess(userId, feature);
  
  if (!hasAccess) {
    throw new Error(
      `This feature requires a higher membership tier. Please upgrade your account.`
    );
  }
}

// Usage example in Cloud Function:
export const autoMatchOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new Error("Unauthorized");
  
  const userId = context.auth.uid;
  
  // Require premium tier for auto-matching
  await requireFeature(userId, "auto-matching");
  
  // ... rest of function
});
```

---

## 💳 Payment Integration (Paystack)

### Subscription Payment Flow

**Create**: `functions/src/membership/paystackSubscription.ts`

```typescript
import { PaystackService } from "../utils/paystack";
import { MembershipService, TIER_CONFIG } from "./membershipService";

export async function initializeSubscription(params: {
  userId: string;
  tier: "standard" | "premium";
  email: string;
}): Promise<{ authorizationUrl: string; reference: string }> {
  const config = TIER_CONFIG[params.tier];
  
  // Initialize payment
  const payment = await PaystackService.initializePayment({
    email: params.email,
    amount: config.monthlyFee * 100, // Convert to kobo
    metadata: {
      type: "subscription",
      userId: params.userId,
      tier: params.tier,
    },
  });

  return {
    authorizationUrl: payment.authorizationUrl,
    reference: payment.reference,
  };
}

export async function verifySubscriptionPayment(reference: string): Promise<void> {
  const verification = await PaystackService.verifyPayment(reference);
  
  if (verification.status === "success") {
    const { userId, tier } = verification.metadata;
    
    await MembershipService.upgradeTier({
      userId,
      targetTier: tier,
      paymentReference: reference,
    });
  }
}
```

---

## 📱 Client-Side Integration

### Membership API

**Create**: `src/lib/membershipApi.ts`

```typescript
import { getFunctions, httpsCallable } from "firebase/functions";

export interface MembershipInfo {
  tier: string;
  dailyLimit: number;
  transactionFeePercent: number;
  withdrawalFee: number;
  features: string[];
  expiryDate?: Date;
}

export async function getMembershipInfo(): Promise<MembershipInfo> {
  const functions = getFunctions();
  const getMembership = httpsCallable(functions, "getMembershipInfo");
  
  const result = await getMembership({});
  const data = result.data as any;
  
  return data.data;
}

export async function upgradeMembership(tier: "standard" | "premium"): Promise<{
  authorizationUrl: string;
}> {
  const functions = getFunctions();
  const upgrade = httpsCallable(functions, "initializeUpgrade");
  
  const result = await upgrade({ tier });
  const data = result.data as any;
  
  return data.data;
}

export async function checkFeatureAccess(feature: string): Promise<boolean> {
  const functions = getFunctions();
  const checkAccess = httpsCallable(functions, "checkFeatureAccess");
  
  const result = await checkAccess({ feature });
  const data = result.data as any;
  
  return data.data.hasAccess;
}
```

---

## 📊 Admin Dashboard Queries

### Revenue Analytics

```typescript
// Get monthly subscription revenue
const subscriptionRevenue = await db
  .collection(COLLECTIONS.TRANSACTIONS)
  .where("type", "==", "subscription")
  .where("createdAt", ">=", startOfMonth)
  .where("createdAt", "<=", endOfMonth)
  .get();

const total = subscriptionRevenue.docs.reduce(
  (sum, doc) => sum + doc.data().amount,
  0
);

// Get transaction fee revenue
const transactionFees = await db
  .collection(COLLECTIONS.TRANSACTIONS)
  .where("type", "==", "fee")
  .where("createdAt", ">=", startOfMonth)
  .where("createdAt", "<=", endOfMonth)
  .get();

const feeRevenue = transactionFees.docs.reduce(
  (sum, doc) => sum + doc.data().amount,
  0
);

// Get tier distribution
const memberships = await db
  .collection(COLLECTIONS.MEMBERSHIPS)
  .get();

const tierCounts = {
  free: 0,
  basic: 0,
  standard: 0,
  premium: 0,
};

memberships.docs.forEach((doc) => {
  const tier = doc.data().tier;
  tierCounts[tier]++;
});
```

---

## 🚀 Deployment Checklist

### 1. Database Setup
- [ ] Add `MEMBERSHIPS` to `COLLECTIONS` constant
- [ ] Create Firestore index for membership queries
- [ ] Create Firestore index for usage tracking

### 2. Code Deployment
- [ ] Deploy membership service functions
- [ ] Deploy payment integration
- [ ] Deploy feature gates
- [ ] Update wallet service with dynamic fees
- [ ] Update order service with limit checks

### 3. Configuration
- [ ] Set Paystack subscription webhook
- [ ] Configure tier pricing
- [ ] Set up automated renewal checks (scheduled function)

### 4. Testing
- [ ] Test free → basic upgrade (KYC)
- [ ] Test basic → standard upgrade (payment)
- [ ] Test daily limit enforcement
- [ ] Test fee calculation per tier
- [ ] Test feature gates
- [ ] Test subscription expiry

### 5. UI Implementation
- [ ] Membership dashboard page
- [ ] Upgrade/payment flow
- [ ] Feature gate modals
- [ ] Usage stats display
- [ ] Tier comparison page

---

## 📈 Expected Revenue Model

### Monthly Projections (1,000 Active Users)

**Free Tier** (700 users):
- Transaction fees: 700 × ₦50 avg = ₦35,000

**Basic Tier** (200 users):
- Transaction fees: 200 × ₦150 avg = ₦30,000

**Standard Tier** (80 users):
- Subscription: 80 × ₦5,000 = ₦400,000
- Transaction fees: 80 × ₦500 avg = ₦40,000

**Premium Tier** (20 users):
- Subscription: 20 × ₦20,000 = ₦400,000
- Transaction fees: 20 × ₦1,000 avg = ₦20,000

**Total Monthly Revenue**: ₦925,000 (~$1,180 USD)

**With 10,000 users**: ₦9,250,000 (~$11,800 USD)

---

## 🎉 Next Steps

1. **Review & Approve** fee structure
2. **Implement** membership service
3. **Integrate** payment flow
4. **Build** UI components
5. **Test** thoroughly
6. **Launch** with marketing campaign

**Ready to proceed with implementation?** 🚀
