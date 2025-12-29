# P2P Crypto Marketplace - Quick Reference

## 🚀 Quick Start

### For Developers
```bash
# Start dev server
npm run dev

# Access marketplace
http://localhost:3000/p2p-crypto/marketplace

# Create listing
http://localhost:3000/p2p-crypto/create

# View dashboard
http://localhost:3000/p2p-crypto/dashboard
```

---

## 📋 API Endpoints

### Create Listing
```http
POST /api/p2p-crypto/create-listing
Authorization: Session cookie required

Body:
{
  "type": "buy" | "sell",
  "asset": "BTC" | "ETH" | "USDT",
  "cryptoAmount": number,
  "pricePerUnit": number,
  "paymentMethod": string,
  "terms": string
}
```

### Browse Listings
```http
GET /api/p2p-crypto/listings?asset=BTC&type=sell&status=active
Authorization: None (public)
```

### Match Listing
```http
POST /api/p2p-crypto/match-listing
Authorization: Session cookie required

Body:
{
  "listingId": string
}
```

### Confirm Payment
```http
POST /api/p2p-crypto/confirm-payment
Authorization: Session cookie required

Body:
{
  "transactionId": string
}
```

### Release Crypto
```http
POST /api/p2p-crypto/release-crypto
Authorization: Session cookie required

Body:
{
  "transactionId": string
}
```

### AI Price Predictions
```http
GET /api/p2p-crypto/predictions?asset=BTC&days=7
Authorization: None (public)
```

---

## 🔒 Firestore Collections

### p2p_crypto_listings
```javascript
{
  id: string,
  userId: string,
  userName: string,
  userTier: "Basic" | "Ambassador" | "VIP" | "Business",
  type: "buy" | "sell",
  asset: "BTC" | "ETH" | "USDT",
  cryptoAmount: number,
  pricePerUnit: number,
  totalAmount: number,
  availableAmount: number,
  paymentMethod: string,
  terms: string,
  status: "active" | "matched" | "completed" | "cancelled",
  createdAt: Timestamp,
  expiresAt: Timestamp
}
```

### p2p_crypto_transactions
```javascript
{
  id: string,
  listingId: string,
  buyerId: string,
  buyerName: string,
  sellerId: string,
  sellerName: string,
  asset: string,
  cryptoAmount: number,
  totalAmount: number,
  paymentMethod: string,
  status: "pending_payment" | "payment_confirmed" | "crypto_released" | "completed" | "disputed" | "cancelled",
  createdAt: Timestamp,
  paymentDeadline: Timestamp,
  paymentConfirmedAt?: Timestamp,
  completedAt?: Timestamp
}
```

### p2p_crypto_stats
```javascript
{
  userId: string,
  weeklyVolume: number,
  monthlyVolume: number,
  activeListings: number,
  completedTrades: number,
  lastTradeAt?: Timestamp
}
```

### p2p_crypto_escrow
```javascript
{
  transactionId: string,
  sellerId: string,
  asset: string,
  amount: number,
  lockedAt: Timestamp,
  status: "locked" | "released" | "refunded"
}
```

### p2p_crypto_fees
```javascript
{
  transactionId: string,
  feeAmount: number,
  feePercentage: number, // 0.5%
  asset: string,
  collectedAt: Timestamp
}
```

---

## 🎯 Tier Limits

| Tier | Weekly Limit | Monthly Limit | Max Per Trade | Active Listings |
|------|--------------|---------------|---------------|-----------------|
| Basic | R50,000 | R200,000 | R10,000 | 3 |
| Ambassador | R200,000 | R800,000 | R50,000 | 10 |
| VIP | R1,000,000 | R4,000,000 | R200,000 | 25 |
| Business | Unlimited | Unlimited | Unlimited | 100 |

---

## 🔄 Trade Status Flow

```
Listing:
  active → matched → completed/cancelled

Transaction:
  pending_payment → payment_confirmed → crypto_released → completed
                 ↘ disputed
                 ↘ cancelled

Escrow:
  locked → released/refunded
```

---

## 🛠️ Common Tasks

### Test Complete Workflow
```bash
# 1. Create listing
curl -X POST http://localhost:3000/api/p2p-crypto/create-listing \
  -H "Cookie: session={...}" \
  -d '{"type":"sell","asset":"BTC","cryptoAmount":0.01,"pricePerUnit":1200000,"paymentMethod":"Bank Transfer","terms":"Fast payment"}'

# 2. Browse listings
curl http://localhost:3000/api/p2p-crypto/listings?type=sell&asset=BTC

# 3. Match listing
curl -X POST http://localhost:3000/api/p2p-crypto/match-listing \
  -H "Cookie: session={...}" \
  -d '{"listingId":"listing_xxx"}'

# 4. Confirm payment
curl -X POST http://localhost:3000/api/p2p-crypto/confirm-payment \
  -H "Cookie: session={...}" \
  -d '{"transactionId":"transaction_xxx"}'

# 5. Release crypto
curl -X POST http://localhost:3000/api/p2p-crypto/release-crypto \
  -H "Cookie: session={...}" \
  -d '{"transactionId":"transaction_xxx"}'
```

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy to Production
```bash
# Vercel
vercel --prod

# Firebase Hosting
npm run build && firebase deploy --only hosting
```

---

## 🐛 Troubleshooting

### "Authentication required" Error
- Check session cookie is set
- Verify user document exists in Firestore
- Check auth helper is working

### "Listing not available"
- Verify listing status is "active"
- Check availableAmount > 0
- Ensure not already matched

### "Tier limit exceeded"
- Check user's current tier
- Verify weekly/monthly volume
- User may need to upgrade tier

### Firestore Permission Denied
- Verify security rules deployed
- Check user authentication
- Confirm user has access to resource

---

## 📊 Monitoring Queries

### Check Active Listings
```javascript
db.collection('p2p_crypto_listings')
  .where('status', '==', 'active')
  .orderBy('createdAt', 'desc')
  .limit(10)
```

### Check Pending Transactions
```javascript
db.collection('p2p_crypto_transactions')
  .where('status', '==', 'pending_payment')
  .orderBy('paymentDeadline', 'asc')
```

### Check User Stats
```javascript
db.collection('p2p_crypto_stats')
  .doc(userId)
  .get()
```

### Check Today's Fees
```javascript
db.collection('p2p_crypto_fees')
  .where('collectedAt', '>=', startOfDay)
  .get()
```

---

## 🔐 Security Checklist

- ✅ Session-based authentication
- ✅ Firestore security rules enforced
- ✅ No user ID spoofing possible
- ✅ Tier-based access control
- ✅ Owner-only modifications
- ✅ Admin oversight capabilities

---

## 📚 Documentation Links

- **Implementation Guide:** `docs/p2p-crypto-implementation-guide.md`
- **Architecture:** `docs/p2p-crypto-architecture-guide.md`
- **API Docs:** `docs/p2p-crypto-api-documentation.md`
- **User Guide:** `docs/p2p-crypto-user-guide.md`
- **Admin Guide:** `docs/p2p-crypto-admin-guide.md`
- **Testing Guide:** `docs/p2p-crypto-testing-guide.md`
- **Deployment:** `docs/p2p-crypto-deployment-checklist.md`
- **Summary:** `docs/p2p-crypto-deployment-summary.md`

---

## 🆘 Emergency Contacts

**Critical Issues:** [Contact DevOps]
**Security Issues:** [Contact Security Team]
**Support:** [Contact Support Manager]

---

**Status:** ✅ Production Ready
**Build:** ✅ Successful
**Tests:** ⏳ Pending Manual Testing
**Deployment:** ⏳ Ready to Deploy
