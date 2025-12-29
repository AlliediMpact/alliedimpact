# P2P Crypto Marketplace - Testing Guide

## Overview
This guide provides step-by-step instructions for testing the complete P2P Crypto trade workflow before production deployment.

## Prerequisites
- ✅ Firestore security rules deployed
- ✅ Firestore indexes configured
- ✅ Production build successful
- ✅ Two user accounts (for buyer and seller roles)

## Testing Environment Setup

### 1. Start Development Server
```bash
npm run dev
```
Server runs at: http://localhost:3000

### 2. Prepare Test Users

**User A (Seller):**
- Role: Will create a BUY listing (buying crypto, selling ZAR)
- Required: Active session, some ZAR balance

**User B (Buyer):**
- Role: Will accept the listing (selling crypto, buying ZAR)
- Required: Active session, crypto wallet balance

## Complete Trade Workflow Test

### Test 1: Create Listing (User A)

**Steps:**
1. Login as User A
2. Navigate to `/p2p-crypto/create`
3. Fill in the form:
   - **Type**: `buy` (User A wants to buy crypto)
   - **Asset**: `BTC` (Bitcoin)
   - **Crypto Amount**: `0.01` BTC
   - **Price per Unit**: `1200000` ZAR (per BTC)
   - **Total Amount**: Calculated automatically (12,000 ZAR)
   - **Payment Method**: `Bank Transfer`
   - **Terms**: "Payment within 1 hour. Bank details will be shared."
4. Click "Create Listing"

**Expected Result:**
- Success message displayed
- Redirected to `/p2p-crypto/marketplace`
- Listing appears in active listings
- User A's stats updated (activeListings +1)

**API Request:**
```json
POST /api/p2p-crypto/create-listing
{
  "type": "buy",
  "asset": "BTC",
  "cryptoAmount": 0.01,
  "pricePerUnit": 1200000,
  "paymentMethod": "Bank Transfer",
  "terms": "Payment within 1 hour"
}
```

**Firestore Verification:**
```javascript
// Check p2p_crypto_listings collection
{
  id: "listing_xxx",
  userId: "user_a_id",
  userName: "User A Name",
  userTier: "VIP",
  type: "buy",
  asset: "BTC",
  cryptoAmount: 0.01,
  pricePerUnit: 1200000,
  totalAmount: 12000,
  availableAmount: 12000,
  paymentMethod: "Bank Transfer",
  terms: "Payment within 1 hour",
  status: "active",
  createdAt: Timestamp,
  expiresAt: Timestamp (24h later)
}

// Check p2p_crypto_stats/user_a_id
{
  weeklyVolume: 12000,
  activeListings: 1,
  completedTrades: 0
}
```

---

### Test 2: Browse Marketplace (User B)

**Steps:**
1. Login as User B
2. Navigate to `/p2p-crypto/marketplace`
3. View active listings
4. Filter by:
   - Asset: BTC
   - Type: buy (User A wants to buy, so User B can sell)
5. Click on User A's listing

**Expected Result:**
- Listings loaded from API
- User A's listing visible
- AI price prediction displayed (if available)
- Trade detail page shows full listing info

**API Request:**
```json
GET /api/p2p-crypto/listings?asset=BTC&type=buy&status=active
```

---

### Test 3: Accept Listing (User B)

**Steps:**
1. On listing detail page `/p2p-crypto/trade/[listing_id]`
2. Review listing details
3. Click "Accept Trade"
4. Confirm transaction

**Expected Result:**
- Success message: "Trade matched successfully!"
- Transaction created with "pending_payment" status
- Escrow record created
- User B's crypto locked in escrow
- Listing status changed to "matched"
- Both users receive notifications

**API Request:**
```json
POST /api/p2p-crypto/match-listing
{
  "listingId": "listing_xxx"
}
```

**Firestore Verification:**
```javascript
// p2p_crypto_transactions
{
  id: "transaction_xxx",
  listingId: "listing_xxx",
  buyerId: "user_a_id",
  buyerName: "User A Name",
  sellerId: "user_b_id",
  sellerName: "User B Name",
  asset: "BTC",
  cryptoAmount: 0.01,
  totalAmount: 12000,
  paymentMethod: "Bank Transfer",
  status: "pending_payment",
  createdAt: Timestamp,
  paymentDeadline: Timestamp (1h later)
}

// p2p_crypto_escrow
{
  transactionId: "transaction_xxx",
  sellerId: "user_b_id",
  asset: "BTC",
  amount: 0.01,
  lockedAt: Timestamp,
  status: "locked"
}

// p2p_crypto_listings/listing_xxx
{
  status: "matched",
  availableAmount: 0
}
```

---

### Test 4: Confirm Payment (User A)

**Steps:**
1. User A receives payment details via notification
2. User A makes bank transfer to User B
3. Navigate to `/p2p-crypto/dashboard`
4. Find the transaction in "Active Trades"
5. Click "I Have Paid"

**Expected Result:**
- Transaction status updated to "payment_confirmed"
- User B notified to release crypto
- Timestamp recorded

**API Request:**
```json
POST /api/p2p-crypto/confirm-payment
{
  "transactionId": "transaction_xxx"
}
```

**Firestore Verification:**
```javascript
// p2p_crypto_transactions/transaction_xxx
{
  status: "payment_confirmed",
  paymentConfirmedAt: Timestamp
}
```

---

### Test 5: Release Crypto (User B)

**Steps:**
1. User B verifies bank transfer received
2. Navigate to `/p2p-crypto/dashboard`
3. Find the transaction
4. Click "Release Crypto"
5. Confirm release

**Expected Result:**
- Crypto transferred from escrow to User A's wallet
- Fee (0.5%) deducted and recorded
- Transaction status updated to "completed"
- Escrow released
- Stats updated for both users
- Listing marked as completed

**API Request:**
```json
POST /api/p2p-crypto/release-crypto
{
  "transactionId": "transaction_xxx"
}
```

**Firestore Verification:**
```javascript
// p2p_crypto_transactions/transaction_xxx
{
  status: "completed",
  completedAt: Timestamp,
  cryptoReleased: true,
  feeAmount: 0.000005,
  netAmount: 0.009995
}

// p2p_crypto_escrow/escrow_xxx
{
  status: "released",
  releasedAt: Timestamp
}

// p2p_crypto_fees
{
  transactionId: "transaction_xxx",
  feeAmount: 0.000005,
  asset: "BTC",
  collectedAt: Timestamp
}

// p2p_crypto_stats/user_a_id
{
  weeklyVolume: 12000,
  activeListings: 0,
  completedTrades: 1
}

// p2p_crypto_stats/user_b_id
{
  weeklyVolume: 12000,
  activeListings: 0,
  completedTrades: 1
}

// p2p_crypto_listings/listing_xxx
{
  status: "completed",
  completedAt: Timestamp
}
```

---

## Error Scenario Tests

### Test 6: Unauthorized Access
**Test:** Try to create listing without authentication
- **Expected:** 401 Unauthorized error
- **API:** POST /api/p2p-crypto/create-listing (no session cookie)

### Test 7: Invalid Tier Access
**Test:** Basic tier user tries to create listing exceeding tier limit
- **Expected:** 403 Forbidden with tier upgrade message
- **Verify:** P2PLimitsService.validateListing() enforces tier limits

### Test 8: Payment Timeout
**Test:** Don't confirm payment within deadline
- **Expected:** Transaction auto-cancelled by cron job
- **Verify:** Escrow auto-released to seller

### Test 9: Concurrent Matching
**Test:** Two buyers try to accept same listing simultaneously
- **Expected:** Only first request succeeds, second gets "listing no longer available"
- **Verify:** Firestore transaction prevents double-matching

### Test 10: Duplicate Payment Confirmation
**Test:** User A clicks "I Have Paid" twice
- **Expected:** Second click ignored or shows "already confirmed"
- **Verify:** Status validation in confirm-payment API

---

## Performance Tests

### Test 11: Query Performance
**Test:** Load marketplace with 100+ listings
- **Expected:** Page loads in < 2 seconds
- **Verify:** Firestore composite indexes used

### Test 12: Concurrent Trades
**Test:** 10 users create listings simultaneously
- **Expected:** All succeed without errors
- **Verify:** No Firestore write conflicts

---

## Security Tests

### Test 13: Firestore Rules - Listings
```javascript
// Should PASS
- Authenticated user reads any listing
- Owner updates their own listing
- Owner deletes their own listing

// Should FAIL
- Unauthenticated user reads listing
- User A updates User B's listing
- User modifies userId or createdAt fields
```

### Test 14: Firestore Rules - Transactions
```javascript
// Should PASS
- Buyer/seller reads their own transaction
- Buyer/seller updates transaction status
- Admin reads/updates any transaction

// Should FAIL
- User C reads User A's transaction
- User modifies buyerId/sellerId fields
- User deletes transaction (admin only)
```

### Test 15: Firestore Rules - Stats
```javascript
// Should PASS
- User reads own stats
- User updates own stats
- Admin reads/updates any stats

// Should FAIL
- User A reads User B's stats
- User modifies another user's stats
```

---

## AI Price Prediction Tests

### Test 16: Get Price Predictions
**Test:** Request AI predictions for BTC
- **API:** GET /api/p2p-crypto/predictions?asset=BTC&days=7
- **Expected:** Returns prediction data with confidence scores
- **Verify:** ML model generates reasonable predictions

### Test 17: Display Predictions
**Test:** View predictions on marketplace page
- **Expected:** Chart shows 7-day prediction trend
- **Verify:** UI updates when asset filter changes

---

## Dashboard Tests

### Test 18: Dashboard Overview
**Steps:**
1. Navigate to `/p2p-crypto/dashboard`
2. View stats cards
3. Check active trades list
4. Check trade history

**Expected:**
- Total volume displayed
- Active listings count correct
- Completed trades count correct
- Active transactions listed with correct status
- History shows completed transactions

---

## Checklist Before Production

- [ ] All 18 tests passed
- [ ] No console errors during workflow
- [ ] Firestore rules enforced correctly
- [ ] Authentication working properly
- [ ] Fees calculated accurately (0.5%)
- [ ] Escrow locking/releasing works
- [ ] Stats updating correctly
- [ ] Notifications sent (if implemented)
- [ ] UI responsive on mobile
- [ ] Build succeeds with zero errors
- [ ] Environment variables set in production
- [ ] Firebase project configured for production
- [ ] Monitoring/logging enabled

---

## Post-Deployment Verification

After deploying to production:

1. **Smoke Test:** Create one real listing with small amount
2. **Monitor Firestore:** Check for write errors
3. **Monitor Logs:** Check for API errors
4. **Check Performance:** Verify page load times < 3s
5. **Verify SSL:** Ensure HTTPS enabled
6. **Test on Mobile:** iOS and Android browsers

---

## Support & Troubleshooting

### Common Issues

**Issue:** "Authentication required" error
- **Fix:** Check session cookie is set correctly
- **Verify:** User document exists in Firestore users collection

**Issue:** "Listing not available"
- **Fix:** Check listing status is "active"
- **Verify:** availableAmount > 0

**Issue:** "Tier limit exceeded"
- **Fix:** User needs to upgrade membership tier
- **Verify:** Check user.membershipTier and tier limits

**Issue:** Firestore permission denied
- **Fix:** Check security rules deployed correctly
- **Verify:** firebase deploy --only firestore:rules

---

## Next Steps

1. ✅ Complete manual testing using this guide
2. ✅ Fix any issues found
3. ✅ Run production build again
4. ✅ Deploy to production (Vercel or Firebase Hosting)
5. ✅ Monitor first 24 hours closely
6. ✅ Gather user feedback
7. ✅ Iterate and improve

---

**Status:** Ready for Testing
**Last Updated:** 2024
**Contact:** Development Team
