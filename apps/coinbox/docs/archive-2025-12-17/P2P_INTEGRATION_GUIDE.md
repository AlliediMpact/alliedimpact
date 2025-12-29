# P2P Crypto Trading - Integration Guide

**Status:** ✅ Navigation & APIs Complete  
**Date:** December 9, 2024  
**Last Commit:** `f49a941` - Navigation and API routes added  

---

## 🎯 What's New

### Navigation Added
- **User Menu:** "P2P Trading" link → `/dashboard/p2p-trading`
- **Admin Menu:** "Crypto Monitoring" link → `/dashboard/admin/crypto`

### Pages Created
1. **`/dashboard/p2p-trading`** - Main trading interface
   - Order book, place order form, active orders
   - Market overview with 24h stats
   - Balance display (crypto + ZAR)
   - Authentication required

2. **`/dashboard/admin/crypto`** - Admin monitoring
   - 24h volume, fees, active orders, traders
   - Balance reconciliation with Luno
   - Recent trades history
   - Admin role required

### API Routes Created

#### Balance Management
```typescript
// GET /api/crypto/balances
// Fetch user's crypto balances
const response = await fetch('/api/crypto/balances', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});
const { balances } = await response.json();
```

```typescript
// POST /api/crypto/balances
// Initialize wallet (first time)
const response = await fetch('/api/crypto/balances', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    lunoAccountId: 'luno-acc-123'
  })
});
```

#### Order Management
```typescript
// GET /api/crypto/orders?asset=BTC&myOrders=true
// Fetch order book or user's orders
const response = await fetch('/api/crypto/orders?asset=BTC&myOrders=true', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});
const { bids, asks, orders } = await response.json();
```

```typescript
// POST /api/crypto/orders
// Place a new order
const response = await fetch('/api/crypto/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    asset: 'BTC',
    type: 'SELL',
    price: 1250000,
    amount: 0.01
  })
});
```

```typescript
// DELETE /api/crypto/orders/[orderId]
// Cancel an order
const response = await fetch(`/api/crypto/orders/${orderId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});
```

---

## 🔧 How to Connect Components to APIs

### 1. Update Order Book Component

**File:** `src/components/trading/OrderBook.tsx`

Replace the mock data loading with real API calls:

```typescript
const loadOrders = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const idToken = await user.getIdToken();
    const response = await fetch(`/api/crypto/orders?asset=${asset}`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const { bids, asks } = await response.json();
    setBids(bids);
    setAsks(asks);
  } catch (error) {
    console.error('Failed to load orders:', error);
  }
};
```

### 2. Update Place Order Component

**File:** `src/components/trading/PlaceOrder.tsx`

Replace the mock order placement:

```typescript
const handlePlaceOrder = async () => {
  // ... validation code ...

  setLoading(true);

  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const idToken = await user.getIdToken();
    const response = await fetch('/api/crypto/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asset,
        type: orderType,
        price: priceNum,
        amount: amountNum
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to place order');
    }

    const { orderId } = await response.json();

    toast({
      title: 'Order Placed',
      description: `${orderType} order for ${amountNum} ${asset} placed successfully`,
    });

    // Reset form
    setAmount('');
    setPercentage([25]);
    onOrderPlaced?.();
  } catch (error: any) {
    toast({
      title: 'Order Failed',
      description: error.message || 'Failed to place order',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};
```

### 3. Update My Active Orders Component

**File:** `src/components/trading/MyActiveOrders.tsx`

Replace mock data and cancel logic:

```typescript
const loadOrders = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const idToken = await user.getIdToken();
    const response = await fetch(`/api/crypto/orders?myOrders=true&status=PENDING`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const { orders } = await response.json();
    setOrders(orders);
    setLoading(false);
  } catch (error) {
    console.error('Failed to load orders:', error);
    setLoading(false);
  }
};

const handleCancelOrder = async (orderId: string) => {
  setCancellingId(orderId);

  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const idToken = await user.getIdToken();
    const response = await fetch(`/api/crypto/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel order');
    }

    toast({
      title: 'Order Cancelled',
      description: 'Your order has been cancelled and funds unlocked',
    });

    setOrders(orders.filter(o => o.id !== orderId));
    onOrderCancelled?.();
  } catch (error: any) {
    toast({
      title: 'Cancellation Failed',
      description: error.message || 'Failed to cancel order',
      variant: 'destructive',
    });
  } finally {
    setCancellingId(null);
  }
};
```

### 4. Add Real-Time Updates

Use Firestore `onSnapshot` for live order book:

```typescript
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

useEffect(() => {
  const db = getFirestore();
  const ordersRef = collection(db, 'cryptoOrders');
  
  const q = query(
    ordersRef,
    where('asset', '==', asset),
    where('status', '==', 'PENDING'),
    orderBy('price', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const newBids = orders.filter(o => o.type === 'BUY');
    const newAsks = orders.filter(o => o.type === 'SELL');

    setBids(newBids);
    setAsks(newAsks);
  });

  return () => unsubscribe();
}, [asset]);
```

---

## 🔐 Environment Variables Required

Add these to `.env.local`:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Luno API (when available)
LUNO_API_KEY=your_luno_api_key
LUNO_API_SECRET=your_luno_api_secret
LUNO_API_BASE_URL=https://api.luno.com
```

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Navigate to `/dashboard/p2p-trading` (requires login)
- [ ] Select different assets (BTC, ETH, USDT)
- [ ] View order book (should show mock data for now)
- [ ] Try to place an order (should validate inputs)
- [ ] View active orders (should show empty state or mock data)
- [ ] Navigate to `/dashboard/admin/crypto` (requires admin role)
- [ ] View dashboard stats and balance reconciliation

### API Testing (Postman/cURL)
```bash
# Get balances
curl -X GET http://localhost:3000/api/crypto/balances \
  -H "Authorization: Bearer YOUR_ID_TOKEN"

# Place order
curl -X POST http://localhost:3000/api/crypto/orders \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"asset":"BTC","type":"SELL","price":1250000,"amount":0.01}'

# Cancel order
curl -X DELETE http://localhost:3000/api/crypto/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
```

### Firestore Emulator Testing
```bash
# Start emulator
npm run firebase:emulator

# Run integration tests
npm run test:integration
```

---

## 📊 Firestore Collections Structure

### `cryptoWallets`
```typescript
{
  [userId]: {
    userId: string,
    lunoAccountId: string,
    balances: {
      BTC: {
        custody: 0.05,
        trading: 0.03,
        locked: 0.01
      },
      ETH: { ... },
      USDT: { ... }
    },
    createdAt: Timestamp,
    updatedAt: Timestamp
  }
}
```

### `cryptoOrders`
```typescript
{
  [orderId]: {
    userId: string,
    asset: 'BTC' | 'ETH' | 'USDT',
    type: 'BUY' | 'SELL',
    price: 1250000,
    amount: 0.01,
    remaining: 0.005,
    filled: 0.005,
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED',
    createdAt: Timestamp,
    updatedAt: Timestamp,
    expiresAt: Timestamp
  }
}
```

### `cryptoTransactions`
```typescript
{
  [transactionId]: {
    userId: string,
    asset: 'BTC',
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE' | 'LOCK' | 'UNLOCK',
    amount: 0.01,
    balanceBefore: { custody: 0.04, trading: 0.03, locked: 0 },
    balanceAfter: { custody: 0.05, trading: 0.03, locked: 0 },
    metadata: { ... },
    status: 'PENDING' | 'COMPLETED' | 'FAILED',
    timestamp: Timestamp
  }
}
```

---

## 🚀 Deployment Notes

### Vercel Environment Variables
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add all Firebase Admin SDK variables
3. Add Luno API credentials (when available)
4. Redeploy

### Firebase Security Rules
Already added in `firestore.rules`:
```javascript
match /cryptoWallets/{userId} {
  allow read: if isOwner(userId) || isAdmin();
  allow write: if false; // System only
}

match /cryptoOrders/{orderId} {
  allow read: if isOwner(resource.data.userId) || isAdmin();
  allow create: if isOwner(request.resource.data.userId);
  allow update, delete: if false; // Via API only
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## 📚 Next Steps

### Immediate (Today)
1. ✅ Navigation links added
2. ✅ API routes created
3. ⏳ Connect components to APIs (follow guide above)
4. ⏳ Test with Firestore emulator
5. ⏳ Add real-time listeners

### This Week
1. Implement matching engine logic
2. Add WebSocket for instant updates
3. Create trade history component
4. Add price charts (optional)

### When Luno Available
1. Get API credentials
2. Update `luno-custody-service.ts`
3. Test deposits/withdrawals
4. Enable production trading

---

## 🎉 Summary

You now have:
- ✅ Complete navigation structure
- ✅ Trading page with authentication
- ✅ Admin dashboard with access control
- ✅ RESTful API for all crypto operations
- ✅ Balance locking/unlocking logic
- ✅ Order validation
- ✅ Security rules

**Ready for:** Connecting frontend to backend, real-time updates, Luno integration!

---

**Last Updated:** December 9, 2024  
**Commit:** `f49a941` - "feat: add navigation and API routes for P2P crypto trading"
