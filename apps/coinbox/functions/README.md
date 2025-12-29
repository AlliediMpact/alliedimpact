# Allied iMpact Coin Box - Cloud Functions

## Overview

This directory contains Firebase Cloud Functions for the wallet system and P2P escrow engine.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Paystack keys
```

### 3. Build
```bash
npm run build
```

### 4. Deploy
```bash
firebase deploy --only functions
```

## Functions List

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

## Development

### Local Testing
```bash
# Start emulators
firebase emulators:start --only functions,firestore

# In another terminal, watch for changes
npm run build:watch
```

### View Logs
```bash
firebase functions:log
```

## Environment Variables

Required in `.env`:
```
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_WEBHOOK_SECRET=...
PAYSTACK_CALLBACK_URL=https://...
```

## Documentation

See `/docs` for:
- `PHASE_2_COMPLETE.md` - Full implementation guide
- `PHASE_2_QUICK_REFERENCE.md` - API reference
- `PHASE_2_DEPLOYMENT_CHECKLIST.md` - Deployment guide
