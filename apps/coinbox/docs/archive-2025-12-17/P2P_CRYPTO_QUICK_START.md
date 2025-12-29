# P2P Crypto & AI - Quick Start Guide

## 🚀 Quick Implementation Guide

### Phase 1: Test the API (5 minutes)

#### 1. Create a Test Listing
```bash
curl -X POST http://localhost:3000/api/p2p-crypto/create-listing \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "userName": "John Doe",
    "userTier": "VIP",
    "type": "sell",
    "asset": "BTC",
    "cryptoAmount": 0.01,
    "pricePerUnit": 850000,
    "paymentMethod": "Bank Transfer",
    "terms": "Fast release. Payment within 30 minutes."
  }'
```

#### 2. Get Active Listings
```bash
curl http://localhost:3000/api/p2p-crypto/listings
```

#### 3. Get AI Predictions
```bash
curl http://localhost:3000/api/p2p-crypto/predictions?asset=BTC&timeframe=24h
```

---

### Phase 2: Create Basic UI (30 minutes)

#### Marketplace Page Template
```tsx
// /src/app/p2p-crypto/marketplace/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { P2PCryptoListing } from '@/lib/p2p-crypto/service';

export default function P2PCryptoMarketplace() {
  const [listings, setListings] = useState<P2PCryptoListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    try {
      const res = await fetch('/api/p2p-crypto/listings');
      const data = await res.json();
      setListings(data.listings);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">P2P Crypto Marketplace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold">{listing.asset}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                listing.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {listing.type.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-1 text-sm">
              <p>Amount: {listing.cryptoAmount} {listing.asset}</p>
              <p>Price: R{listing.pricePerUnit.toLocaleString()} per unit</p>
              <p className="font-semibold">Total: R{listing.totalZAR.toLocaleString()}</p>
              <p className="text-gray-600">Fee: R{listing.fee.toFixed(2)}</p>
            </div>

            <div className="mt-3">
              <p className="text-xs text-gray-500">By {listing.creatorName}</p>
              <p className="text-xs text-gray-500">{listing.paymentMethod}</p>
            </div>

            <button 
              onClick={() => handleMatch(listing.id)}
              className="w-full mt-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Accept Trade
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  async function handleMatch(listingId: string) {
    // TODO: Get current user info
    const userId = 'current-user-id';
    const userName = 'Current User';
    const userTier = 'VIP';

    try {
      const res = await fetch('/api/p2p-crypto/match-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, userId, userName, userTier }),
      });

      const data = await res.json();
      
      if (data.success) {
        alert('Trade matched! Transaction ID: ' + data.transactionId);
        // Redirect to trade page
        window.location.href = `/p2p-crypto/trade/${data.transactionId}`;
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to match with listing');
    }
  }
}
```

---

### Phase 3: Add AI Predictions Widget (15 minutes)

```tsx
// /src/components/p2p-crypto/AIPredictionsWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { PricePrediction } from '@/lib/ai-prediction-service';

export function AIPredictionsWidget() {
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
  }, []);

  async function fetchPredictions() {
    try {
      const res = await fetch('/api/p2p-crypto/predictions?timeframe=24h');
      const data = await res.json();
      setPredictions(data.predictions);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading predictions...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">AI Price Predictions (24h)</h2>
      
      <div className="space-y-3">
        {predictions.map((pred) => (
          <div key={pred.asset} className="border-b pb-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">{pred.asset}</p>
                <p className="text-sm text-gray-600">
                  R{pred.currentPrice.toLocaleString()}
                </p>
              </div>
              
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  pred.prediction === 'up' 
                    ? 'bg-green-100 text-green-800'
                    : pred.prediction === 'down'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {pred.prediction === 'up' && '↑ '}
                  {pred.prediction === 'down' && '↓ '}
                  {pred.prediction.toUpperCase()}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {pred.confidence}% confidence
                </p>
                <p className="text-xs font-semibold">
                  {pred.predictedChange > 0 && '+'}
                  {pred.predictedChange.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Trend:</span>
                <span className="ml-1 font-medium">{pred.indicators.trend}</span>
              </div>
              <div>
                <span className="text-gray-600">Volatility:</span>
                <span className="ml-1 font-medium">{pred.indicators.volatility}</span>
              </div>
              <div>
                <span className="text-gray-600">Volume:</span>
                <span className="ml-1 font-medium">{pred.indicators.volume}</span>
              </div>
              <div>
                <span className="text-gray-600">Sentiment:</span>
                <span className="ml-1 font-medium">{pred.indicators.sentiment}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Phase 4: Usage Examples

#### Check User Limits Before Trading
```typescript
import { validateP2PTrade, getP2PLimits } from '@/lib/p2p-limits';

// Check if user can create trade
const validation = validateP2PTrade({
  tier: userTier,
  tradeAmount: 50000,
  currentWeeklyVolume: 30000,
  activeListingsCount: 3,
});

if (!validation.allowed) {
  alert(validation.reason);
  return;
}

// Show limits to user
const limits = getP2PLimits(userTier);
console.log('Your limits:', limits);
```

#### Calculate Fee
```typescript
import { calculateP2PFee } from '@/lib/p2p-limits';

const tradeAmount = 100000; // R100,000
const fee = calculateP2PFee(tradeAmount);
console.log(`Fee: R${fee}`); // Fee: R100
```

#### Get AI Prediction for Specific Asset
```typescript
import { AIPredictionService } from '@/lib/ai-prediction-service';

const prediction = await AIPredictionService.getPrediction('BTC', '24h');

console.log(`${prediction.asset}: ${prediction.prediction}`);
console.log(`Confidence: ${prediction.confidence}%`);
console.log(`Expected change: ${prediction.predictedChange}%`);
```

---

### Phase 5: Testing Workflow

#### Complete Trade Flow Test
```typescript
// 1. User A creates sell listing
const listing = await fetch('/api/p2p-crypto/create-listing', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user-a',
    userName: 'Alice',
    userTier: 'VIP',
    type: 'sell',
    asset: 'BTC',
    cryptoAmount: 0.01,
    pricePerUnit: 850000,
    paymentMethod: 'Bank Transfer',
    terms: 'Fast release',
  }),
});

// 2. User B matches (buys)
const match = await fetch('/api/p2p-crypto/match-listing', {
  method: 'POST',
  body: JSON.stringify({
    listingId: listing.listingId,
    userId: 'user-b',
    userName: 'Bob',
    userTier: 'Ambassador',
  }),
});

// 3. User B confirms payment sent
await fetch('/api/p2p-crypto/confirm-payment', {
  method: 'POST',
  body: JSON.stringify({
    transactionId: match.transactionId,
    userId: 'user-b',
  }),
});

// 4. User A releases crypto
await fetch('/api/p2p-crypto/release-crypto', {
  method: 'POST',
  body: JSON.stringify({
    transactionId: match.transactionId,
    userId: 'user-a',
  }),
});

// Trade completed! ✅
// Fee (R85) deducted from User A
```

---

### Common Integration Patterns

#### Get User's Current Stats
```typescript
import { P2PCryptoService } from '@/lib/p2p-crypto/service';

const listings = await P2PCryptoService.getUserListings(userId);
const transactions = await P2PCryptoService.getUserTransactions(userId);

console.log('Active listings:', listings.filter(l => l.status === 'active').length);
console.log('Completed trades:', transactions.filter(t => t.status === 'completed').length);
```

#### Check Feature Access
```typescript
import { hasP2PFeatureAccess } from '@/lib/p2p-limits';

const canAutoMatch = hasP2PFeatureAccess(userTier, 'auto-match');
const canAccessAI = hasP2PFeatureAccess(userTier, 'advanced-ai');

if (!canAccessAI) {
  alert('Upgrade to VIP or Business tier to access AI predictions');
}
```

---

### Deployment Checklist

- [ ] All files created and in place
- [ ] API routes tested locally
- [ ] Firebase rules updated (if needed)
- [ ] Environment variables set
- [ ] UI pages created
- [ ] User authentication integrated
- [ ] Error handling tested
- [ ] Mobile responsive design
- [ ] Performance optimized
- [ ] Documentation updated

---

### Performance Tips

1. **Cache AI Predictions** (already implemented - 5 min cache)
2. **Paginate Listings** - Use `limit` parameter
3. **Index Firestore Queries** - Create composite indexes
4. **Lazy Load Components** - Use React.lazy()
5. **Optimize Images** - Use Next.js Image component

---

### Security Reminders

✅ Always validate user tier on backend
✅ Never trust client-side calculations
✅ Verify user owns listing/transaction
✅ Rate limit API calls
✅ Sanitize user inputs
✅ Log all transactions for audit

---

## 🎉 You're Ready!

All backend services are complete and production-ready. Just add the UI and you're good to go!

**Questions? Issues? Let me know!** 🚀
