# Phase 2 Quick Reference - Wallet + Escrow API

## 🎯 Quick Start

```bash
# Install dependencies
cd functions && npm install

# Configure environment
cp functions/.env.example functions/.env
# Edit with your Paystack keys

# Build functions
cd functions && npm run build

# Deploy
firebase deploy --only functions

# Or test locally
firebase emulators:start
```

---

## 💰 Wallet API

### Get Balance
```typescript
import { getWalletBalance } from "@/lib/api/wallet";

const balance = await getWalletBalance();
// Returns: { balance, lockedBalance, availableBalance, totalDeposited, totalWithdrawn }
```

### Deposit Money
```typescript
import { initializeDeposit, verifyDeposit } from "@/lib/api/wallet";

// Step 1: Initialize
const result = await initializeDeposit(10000, "user@example.com");
window.location.href = result.data.authorizationUrl;  // Redirect to Paystack

// Step 2: After payment, verify
const verified = await verifyDeposit(paymentReference);
console.log("New balance:", verified.data.newBalance);
```

### Withdraw Money
```typescript
import { requestWithdrawal } from "@/lib/api/wallet";

const result = await requestWithdrawal({
  amount: 50000,
  accountNumber: "0123456789",
  bankCode: "058",  // GTBank
  accountName: "John Doe"
});
// Includes fee: result.data.fee
```

### Transaction History
```typescript
import { getTransactionHistory } from "@/lib/api/wallet";

const transactions = await getTransactionHistory(50, "deposit");
// Returns array of transactions
```

---

## 🤝 P2P API

### Create Offer
```typescript
import { createOffer } from "@/lib/api/p2p";

const result = await createOffer({
  offerType: "sell",
  asset: "BTC",
  fiatCurrency: "NGN",
  priceType: "fixed",
  price: 52000000,
  minLimit: 10000,
  maxLimit: 500000,
  availableAmount: 0.01,
  paymentMethods: ["bank-transfer", "mobile-money"],
  paymentTimeWindow: 15,
  terms: "Payment within 15 minutes. No third-party payments.",
  autoReply: "Hi! Please pay within 15 minutes."
});

console.log("Offer ID:", result.data.offerId);
```

### Search Marketplace
```typescript
import { searchOffers } from "@/lib/api/p2p";

const offers = await searchOffers({
  offerType: "sell",
  asset: "BTC",
  paymentMethods: ["bank-transfer"],
  minAmount: 50000,
  maxAmount: 200000,
  limit: 20
});

offers.forEach(offer => {
  console.log(`${offer.price} NGN/BTC - ${offer.availableAmount} BTC`);
});
```

### Get User Offers
```typescript
import { getUserOffers } from "@/lib/api/p2p";

const myOffers = await getUserOffers("active");
// Returns array of user's offers
```

### Manage Offer
```typescript
import { toggleOfferStatus, updateOffer, deleteOffer } from "@/lib/api/p2p";

// Pause/Resume
await toggleOfferStatus(offerId);

// Update
await updateOffer(offerId, {
  price: 53000000,
  terms: "Updated terms"
});

// Delete
await deleteOffer(offerId);
```

---

## 📦 Order Lifecycle

### 1. Create Order (Locks Escrow)
```typescript
import { createOrder } from "@/lib/api/p2p";

const result = await createOrder({
  offerId: "offer123",
  fiatAmount: 100000,
  paymentMethod: "bank-transfer"
});

const orderId = result.data.orderId;
// Escrow is now locked!
```

### 2. Buyer Marks as Paid
```typescript
import { markOrderAsPaid } from "@/lib/api/p2p";

await markOrderAsPaid(orderId, "https://proof-image-url.com/payment.jpg");
// Order status: awaiting-release
```

### 3. Seller Releases Crypto
```typescript
import { releaseCrypto } from "@/lib/api/p2p";

await releaseCrypto(orderId);
// Escrow released, order completed!
```

### Cancel Order
```typescript
import { cancelOrder } from "@/lib/api/p2p";

await cancelOrder(orderId, "Changed my mind");
// Escrow unlocked
```

### Open Dispute
```typescript
import { openDispute } from "@/lib/api/p2p";

await openDispute(orderId, "Seller not responding after payment");
// Admin notified
```

---

## 💬 Chat System

### Send Message
```typescript
import { sendChatMessage } from "@/lib/api/p2p";

await sendChatMessage({
  orderId: "order123",
  message: "Payment sent! Check your account.",
  type: "text"
});
```

### Get Order Details + Chat
```typescript
import { getOrderDetails } from "@/lib/api/p2p";

const { order, chatMessages } = await getOrderDetails("order123");

console.log("Order status:", order.status);
console.log("Messages:", chatMessages.length);
```

---

## 📊 User Orders

```typescript
import { getUserOrders } from "@/lib/api/p2p";

// All orders
const allOrders = await getUserOrders();

// Active orders only
const activeOrders = await getUserOrders("pending-payment");

// Filter options: "pending-payment", "awaiting-release", "completed", "cancelled", "disputed"
```

---

## 🔥 Cloud Functions Reference

### Wallet Functions
- `initializeDeposit` - Start Paystack payment
- `verifyDeposit` - Confirm and credit wallet
- `requestWithdrawal` - Transfer to bank account
- `getWalletBalance` - Get current balance
- `getTransactionHistory` - Get transaction log

### P2P Offer Functions
- `createOffer` - Create new offer
- `updateOffer` - Modify offer
- `toggleOfferStatus` - Pause/resume
- `deleteOffer` - Remove offer
- `getUserOffers` - Get user's offers
- `searchOffers` - Search marketplace
- `getOfferDetails` - Get single offer

### P2P Order Functions
- `createOrder` - Start trade (locks escrow)
- `markOrderAsPaid` - Buyer confirms payment
- `releaseCrypto` - Seller releases funds
- `cancelOrder` - Cancel trade (unlocks escrow)
- `openDispute` - Escalate to support
- `getUserOrders` - Get user's orders
- `getOrderDetails` - Get order + chat
- `sendChatMessage` - Send message

### Scheduled Functions
- `autoCancelExpiredOrders` - Every 5 minutes
- `updateUserRiskProfiles` - Every hour
- `cleanupExpiredEscrowLocks` - Daily

### Triggers
- `onUserCreate` - Auto-create wallet on signup
- `paystackWebhook` - Handle payment confirmations

---

## ⚠️ Error Handling

All functions return:
```typescript
{
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

Common error codes:
- `UNAUTHORIZED` - Not logged in
- `INSUFFICIENT_BALANCE` - Not enough funds
- `OFFER_NOT_FOUND` - Offer doesn't exist
- `ORDER_NOT_FOUND` - Order doesn't exist
- `ORDER_EXPIRED` - Payment deadline passed
- `NOT_ORDER_PARTICIPANT` - Not buyer or seller
- `ESCROW_NOT_LOCKED` - Escrow not locked
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `USER_SUSPENDED` - Account suspended
- `INVALID_INPUT` - Validation failed

Example:
```typescript
try {
  await createOrder({...});
} catch (error: any) {
  if (error.message.includes("INSUFFICIENT_BALANCE")) {
    alert("Please deposit funds first");
  } else if (error.message.includes("RATE_LIMIT")) {
    alert("Too many orders. Please wait.");
  }
}
```

---

## 🛡️ Security Best Practices

### ❌ NEVER Do This
```typescript
// DON'T update wallet directly
db.collection("wallets").doc(userId).update({ balance: 10000 });  // BLOCKED

// DON'T create orders directly
db.collection("p2p_orders").add({...});  // BLOCKED

// DON'T modify escrow locks
db.collection("escrow_locks").doc(id).update({...});  // BLOCKED
```

### ✅ Always Do This
```typescript
// Use Cloud Functions
await initializeDeposit(10000, email);
await createOrder({...});
await releaseCrypto(orderId);
```

---

## 📦 Constants Reference

### Payment Methods
```typescript
"bank-transfer" | "mobile-money" | "paystack" | "cash" | "ussd" | "card" | "other"
```

### Assets
```typescript
"BTC" | "ETH" | "USDT" | "USDC" | "NGN" | "USD"
```

### Order Statuses
```typescript
"pending-payment" | "awaiting-release" | "completed" | "cancelled" | "disputed" | "expired"
```

### Transaction Types
```typescript
"deposit" | "withdrawal" | "send" | "receive" | "escrow-lock" | "escrow-release" | "escrow-refund" | "fee"
```

---

## 🧪 Testing Tips

### Test Accounts
Use Paystack test cards:
- **Success**: 4084084084084081 (any CVV, future expiry)
- **Decline**: 5060666666666666666

### Test Flow
```typescript
// 1. Deposit
await initializeDeposit(10000, "test@example.com");
// Use test card on Paystack page

// 2. Create offer
const offer = await createOffer({
  offerType: "sell",
  asset: "BTC",
  price: 52000000,
  minLimit: 5000,
  maxLimit: 100000,
  availableAmount: 0.001,
  paymentMethods: ["bank-transfer"],
  paymentTimeWindow: 15,
  terms: "Test offer"
});

// 3. Create order (switches to buyer account)
const order = await createOrder({
  offerId: offer.data.offerId,
  fiatAmount: 50000,
  paymentMethod: "bank-transfer"
});

// 4. Mark paid
await markOrderAsPaid(order.data.orderId);

// 5. Release (switch back to seller)
await releaseCrypto(order.data.orderId);
```

---

## 📞 Quick Troubleshooting

**Balance not updating?**
- Check Cloud Function logs: `firebase functions:log`
- Verify webhook signature (Paystack dashboard)

**Order stuck?**
- Check order status: `getOrderDetails(orderId)`
- Auto-cancel runs every 5 minutes

**Escrow not releasing?**
- Verify order status is `awaiting-release`
- Verify caller is seller
- Check escrow lock exists

**Can't create order?**
- Check wallet balance
- Verify not rate-limited
- Check risk profile (not suspended)

---

## 🚀 Deployment Checklist

- [ ] Configure `.env` with production Paystack keys
- [ ] Set Firebase Functions environment: `firebase functions:config:set`
- [ ] Build functions: `cd functions && npm run build`
- [ ] Deploy: `firebase deploy --only functions`
- [ ] Update Firestore security rules: `firebase deploy --only firestore:rules`
- [ ] Deploy indexes: `firebase deploy --only firestore:indexes`
- [ ] Test deposit flow with real payment
- [ ] Test P2P flow end-to-end
- [ ] Monitor logs for errors
- [ ] Set up Paystack webhook URL in dashboard

---

## 📚 Full Documentation

For complete details, see:
- `/docs/PHASE_2_COMPLETE.md` - Comprehensive guide
- `/functions/src/types/index.ts` - Full TypeScript definitions
- `/firestore.rules` - Security rules
- `/functions/src/config/constants.ts` - Configuration

---

**Ready to go! 🎉**
