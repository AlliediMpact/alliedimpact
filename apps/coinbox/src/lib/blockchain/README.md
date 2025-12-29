# Hybrid Blockchain Model - Implementation Guide

## 🎯 Strategy Overview

**What we're building:** A hybrid P2P crypto platform that combines Luno's secure custody with our own internal matching engine.

### Why This Approach?

| Aspect | Pure Luno | Pure Blockchain | **Our Hybrid** |
|--------|-----------|-----------------|----------------|
| Security | ✅ Excellent | ⚠️ You're responsible | ✅ Luno handles it |
| Speed | ⚠️ API delays | ⚠️ 10-60 min confirmations | ✅ Instant (internal) |
| Cost per trade | ❌ 1% fee | ❌ $1-50 gas fees | ✅ FREE (internal) |
| Regulatory | ✅ FSCA compliant | ⚠️ Complex | ✅ FSCA compliant |
| Complexity | ✅ Simple | ❌ Very complex | ✅ Moderate |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    COINBOX PLATFORM                      │
│                                                           │
│  ┌─────────────────────┐     ┌──────────────────────┐  │
│  │  Order Book & UI    │────▶│  Matching Engine     │  │
│  │  (Your frontend)    │     │  (Internal - FREE)   │  │
│  └─────────────────────┘     └──────────────────────┘  │
│                                         │                 │
│                                         ▼                 │
│                          ┌─────────────────────────┐    │
│                          │  Balance Manager        │    │
│                          │  (Firestore + Logic)    │    │
│                          └─────────────────────────┘    │
│                                    ▲     │               │
│                         Deposit    │     │  Withdraw     │
│                                    │     ▼               │
└────────────────────────────────────┼─────────────────────┘
                                     │
                        ┌────────────┴──────────────┐
                        │     LUNO CUSTODY          │
                        │  (Secure Storage Only)    │
                        │  - BTC, ETH, USDC         │
                        │  - FSCA Regulated         │
                        └───────────────────────────┘
```

## 💰 Fee Structure

### User Perspective
```
User A wants to sell 0.1 BTC @ R850,000/BTC
User B wants to buy 0.1 BTC @ R850,000/BTC

Trade executes instantly:
├─> Amount: 0.1 BTC
├─> Value: R85,000
├─> Platform fee (0.5%): R425
└─> Seller receives: R84,575

Total cost to users: R425
Time: < 1 second
```

### Platform Economics
```
Revenue per trade:
├─> Platform fee: 0.5% = R425
├─> Luno fee: R0 (internal transfer is free!)
├─> Blockchain fee: R0 (no blockchain involved)
└─> Net profit: R425 ✅

Only pay Luno when:
├─> User deposits: Network fee only (~R50-500)
└─> User withdraws: Network fee only (~R50-500)
```

## 🔄 Trade Flow

### Scenario 1: Internal Trade (95% of trades)
```
1. User A places SELL order: 0.1 BTC @ R850k
   └─> Crypto locked in our system
   
2. User B places BUY order: 0.1 BTC @ R850k
   └─> Match found instantly!
   
3. Execute trade:
   ├─> Update User A balance: -0.1 BTC, +R84,575 ZAR
   ├─> Update User B balance: +0.1 BTC, -R85,000 ZAR
   ├─> Collect R425 fee
   └─> Time: < 100ms, Cost: R0
```

### Scenario 2: Deposit (one-time)
```
1. User deposits BTC to their Luno address
2. Luno confirms deposit (10-60 min)
3. We credit user's custody balance
4. User can now trade instantly (internal)
```

### Scenario 3: Withdrawal (occasional)
```
1. User requests withdrawal to external wallet
2. We verify balance and lock amount
3. Submit to Luno for processing
4. Luno sends to blockchain (user pays network fee)
5. Update balances after confirmation
```

## 📁 File Structure

```
src/lib/blockchain/
├── luno-custody-service.ts      # Handles Luno integration
│   ├── createCustodyWallet()    # Setup user wallet
│   ├── getDepositAddress()      # Get address for deposits
│   ├── processDeposit()         # Credit user after deposit
│   ├── requestWithdrawal()      # Process external withdrawals
│   ├── internalTransfer()       # FREE instant transfers
│   └── syncBalances()           # Reconciliation with Luno
│
├── internal-matching-engine.ts  # Our P2P order book
│   ├── placeOrder()             # Add buy/sell order
│   ├── matchOrder()             # Find matches
│   ├── executeTrade()           # Execute matched trades
│   ├── cancelOrder()            # Cancel pending order
│   ├── getOrderBook()           # Show market depth
│   └── getMarketPrice()         # Current price
│
└── README.md                    # This file
```

## 🚀 Implementation Plan

### Phase 1: Foundation (Week 1-2)
- [x] Update fee structure to 0.5%
- [x] Create Luno custody service skeleton
- [x] Create internal matching engine skeleton
- [ ] Set up Luno API credentials (testnet)
- [ ] Implement balance tracking in Firestore

### Phase 2: Core Features (Week 3-4)
- [ ] Implement deposit flow
- [ ] Implement internal transfer logic
- [ ] Build basic order matching
- [ ] Create order book UI
- [ ] Test with small amounts

### Phase 3: Polish (Week 5-6)
- [ ] Add withdrawal flow
- [ ] Implement order cancellation
- [ ] Add market depth charts
- [ ] Create trade history UI
- [ ] Performance optimization

### Phase 4: Launch (Week 7-8)
- [ ] Security audit
- [ ] Load testing
- [ ] Beta with 10 users
- [ ] Gradual rollout
- [ ] Monitoring & alerts

## 🔐 Security Considerations

### What Luno Handles ✅
- Private key storage
- Hot/cold wallet management
- Regulatory compliance (FSCA)
- Insurance on deposits
- 2FA and security

### What We Handle ⚠️
- Order book integrity
- Balance reconciliation
- Fee calculation
- User authentication
- Transaction logging

### Safety Measures
```typescript
// 1. Always use Firestore transactions for balance updates
await db.runTransaction(async (transaction) => {
  // Atomic balance updates
});

// 2. Daily reconciliation with Luno
await lunoCustodyService.syncBalances(userId);

// 3. Lock crypto during active orders
lockedBalance = amountInOrders;
availableBalance = totalBalance - lockedBalance;

// 4. Feature flag for easy rollback
if (!LUNO_ENABLED) {
  return mockCustodyService;
}
```

## 📊 Monitoring & Alerts

### Key Metrics
- Trade volume (target: R1M+ per month)
- Average trade size (target: R10k)
- Match rate (target: >80%)
- Order book depth (target: 20+ orders)
- Balance reconciliation errors (target: 0)

### Alerts
```typescript
// Alert if:
- Luno balance !== Our DB balance
- Failed trade execution
- Withdrawal delay > 1 hour
- Unusual trading patterns
```

## 🎓 Next Steps

1. **Set up Luno account** (5 min)
   - Visit: https://www.luno.com/en/developers
   - Create account
   - Generate API credentials
   - Add to `.env.local`

2. **Install dependencies** (2 min)
   ```bash
   npm install @upstash/redis  # For caching
   # Luno SDK coming soon - will notify you when available
   ```

3. **Environment variables**
   ```bash
   # .env.local
   LUNO_API_KEY_ID=your_key_id
   LUNO_API_KEY_SECRET=your_secret
   ENABLE_LUNO_CUSTODY=false  # Set to true when ready
   ```

4. **Test locally** (Week 1)
   - Use mock mode first
   - Test order matching logic
   - Verify balance updates

5. **Deploy to testnet** (Week 2)
   - Enable Luno testnet
   - Test with real API
   - Small deposits only

## 💡 Future Enhancements (Phase 9)

- Advanced order types (limit, stop-loss)
- Trading bots API
- Liquidity pools
- Staking rewards
- Cross-chain swaps
- Mobile app with push notifications

---

**Questions?** Check the main bootstrap plan: `docs/PHASE_8_BOOTSTRAP_PLAN.md`
