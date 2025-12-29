# CoinBox AI - Technical Architecture

**Version:** 2.1.0  
**Last Updated:** December 8, 2025

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │   Next.js 14   │  │   React 18     │  │  TypeScript    ││
│  │   (App Router) │  │   (Client)     │  │   (Strict)     ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │  Tailwind CSS  │  │  Framer Motion │  │  Radix UI      ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                        API LAYER                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Next.js API Routes (/api/*)                   │ │
│  │  - Authentication  - P2P Crypto    - Notifications     │ │
│  │  - Wallet Ops      - Loans         - Analytics         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Auth        │  │  Membership  │  │  Wallet      │     │
│  │  Service     │  │  Service     │  │  Service     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Loan        │  │  P2P Crypto  │  │  Commission  │     │
│  │  Service     │  │  Service     │  │  Service     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  AI          │  │  Notification│  │  Audit       │     │
│  │  Service     │  │  Service     │  │  Service     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATA & EXTERNAL LAYER                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │   Firestore    │  │  Firebase Auth │  │  Firebase      ││
│  │   (Database)   │  │  (Identity)    │  │  Storage       ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │   Paystack     │  │  Smile ID      │  │  Gemini AI     ││
│  │   (Payments)   │  │  (KYC)         │  │  (Predictions) ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
coinbox-ai/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/                  # API routes (40+ endpoints)
│   │   │   ├── auth/             # Authentication endpoints
│   │   │   ├── wallet/           # Wallet operations
│   │   │   ├── loans/            # Loan management
│   │   │   ├── p2p-crypto/       # Crypto marketplace (NEW)
│   │   │   ├── notifications/    # Notification system
│   │   │   └── admin/            # Admin operations
│   │   ├── dashboard/            # User dashboard pages
│   │   │   ├── trading/          # P2P investment trading
│   │   │   ├── wallet/           # Wallet management
│   │   │   ├── transactions/     # Transaction history
│   │   │   ├── referral/         # Referral program
│   │   │   ├── kyc/              # KYC verification
│   │   │   └── admin/            # Admin dashboard
│   │   ├── p2p-crypto/           # P2P Crypto pages (NEW)
│   │   │   ├── marketplace/      # Browse listings
│   │   │   ├── create/           # Create listing
│   │   │   ├── dashboard/        # User P2P dashboard
│   │   │   └── trade/[id]/       # Active trade view
│   │   ├── auth/                 # Authentication pages
│   │   └── (public pages)/       # Landing, about, etc.
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   ├── p2p/                  # P2P-specific components
│   │   ├── ai/                   # AI-related components
│   │   └── (features)/           # Feature components
│   ├── lib/                      # Core services & utilities
│   │   ├── auth-service.ts       # Authentication logic
│   │   ├── membership-service.ts # Membership tiers
│   │   ├── loan-service.ts       # Loan operations
│   │   ├── wallet-service.ts     # Wallet management
│   │   ├── p2p-crypto/           # P2P crypto service
│   │   │   └── service.ts        # Main P2P crypto logic
│   │   ├── ai-service.ts         # AI predictions
│   │   └── (20+ more services)
│   └── tests/                    # Test files (320 tests)
├── functions/                    # Firebase Cloud Functions
│   └── src/
│       ├── p2p/                  # P2P matching engine
│       ├── wallet/               # Wallet operations
│       ├── kyc/                  # KYC verification
│       └── scheduled/            # Cron jobs
├── public/                       # Static assets
├── docs/                         # Documentation
└── config/                       # Configuration files
```

---

## 🔐 Authentication Flow

```
User Action → Firebase Auth → Firestore User Doc → Role Check → Access Granted
     ↓              ↓               ↓                  ↓              ↓
  Sign Up    Email/Password    Create Profile    Assign Role    Dashboard
  Login      Google OAuth      Update lastLogin   Verify MFA     Redirect
  MFA Setup  Link Phone        Store MFA Secret   Check Status   Enable
```

### Authentication Components
1. **AuthProvider** (`src/components/AuthProvider.tsx`)
   - Wraps entire app
   - Manages user state
   - Provides auth context
   - Handles redirects

2. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
   - Guards protected pages
   - Checks authentication
   - Redirects to /auth if needed
   - Shows loading states

3. **Auth Service** (`src/lib/auth-service.ts`)
   - Sign up / Sign in
   - Password reset
   - Email verification
   - MFA enrollment

---

## 💳 Wallet & Escrow Architecture

### Wallet Balance Structure
Each user has ONE wallet document with multiple balance types:

```typescript
interface WalletBalance {
  userId: string;
  mainBalance: number;        // Available for withdrawal
  investmentBalance: number;  // Locked in active investments
  loanBalance: number;        // Locked in active loans
  commissionBalance: number;  // Earned commissions
  cryptoBalance: {            // Crypto holdings
    BTC: number;
    ETH: number;
    USDT: number;
    USDC: number;
  };
  p2pEscrow: number;         // Locked in P2P trades
  totalBalance: number;       // Sum of all balances
  updatedAt: Timestamp;
}
```

### Escrow Flow

```
┌──────────────┐
│ Trade Start  │
└──────┬───────┘
       ↓
┌──────────────────────┐
│ Lock Funds in Escrow │  → mainBalance -= amount
│                      │  → escrowBalance += amount
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  Both Parties        │
│  Confirm Trade       │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ Release from Escrow  │  → escrowBalance -= amount
│                      │  → receiverBalance += amount
└──────┬───────────────┘
       ↓
┌──────────────┐
│ Trade Complete│
└───────────────┘
```

### Transaction Guarantees
- **Atomic Operations:** All balance updates use Firestore transactions
- **Idempotency:** Duplicate requests don't double-spend
- **Audit Trail:** Every transaction logged to `transactions` collection
- **Balance Validation:** Negative balances prevented at database level

---

## 🏦 P2P Loan System Architecture

### Loan Matching Engine

```typescript
// Loan Request Flow
User Creates Loan Request
    ↓
System Finds Investor Matches
    ↓
Investor Reviews & Accepts
    ↓
Funds Transfer (Investor → Borrower)
    ↓
Borrower Repays with 25% Fee
    ↓
Distribution:
  - 20% to Investor
  - 5% to Borrower (cashback)
```

### Data Models

**Loan Request:**
```typescript
{
  id: string;
  borrowerId: string;
  amount: number;
  purpose: string;
  repaymentDate: Timestamp;
  status: 'pending' | 'matched' | 'funded' | 'repaid' | 'defaulted';
  matchedInvestors: Array<{
    investorId: string;
    amount: number;
    acceptedAt: Timestamp;
  }>;
  createdAt: Timestamp;
}
```

**Investment Record:**
```typescript
{
  id: string;
  investorId: string;
  loanId: string;
  amount: number;
  expectedReturn: number;  // amount * 1.20
  status: 'active' | 'repaid' | 'defaulted';
  createdAt: Timestamp;
  repaidAt: Timestamp | null;
}
```

---

## 🪙 P2P Crypto Trading Architecture

### P2P Crypto Service Structure

```typescript
// src/lib/p2p-crypto/service.ts (715 lines)

export class P2PCryptoService {
  // Listing Management
  createListing(params: CreateListingParams): Promise<string>
  getListings(filters: ListingFilters): Promise<Listing[]>
  cancelListing(listingId: string, userId: string): Promise<void>
  
  // Trading Operations
  matchListing(params: MatchParams): Promise<string>
  confirmPayment(tradeId: string, userId: string): Promise<void>
  releaseCrypto(tradeId: string, userId: string): Promise<void>
  
  // Escrow Management
  lockCryptoInEscrow(params): Promise<void>
  releaseFromEscrow(params): Promise<void>
  
  // Statistics
  getUserStats(userId: string): Promise<UserStats>
  getMarketStats(): Promise<MarketStats>
}
```

### Trade State Machine

```
ACTIVE → MATCHED → PAYMENT_PENDING → PAYMENT_CONFIRMED → COMPLETED
  ↓         ↓            ↓                  ↓                ↓
CANCEL   EXPIRED    AUTO_CANCEL       DISPUTE          SUCCESS
```

### Security Features
1. **Identity Verification:** Trades require KYC level 1+
2. **Escrow Lock:** Crypto locked until buyer confirms payment
3. **Timeout Protection:** Auto-cancel if no payment in 24 hours
4. **Dispute System:** Manual resolution by admin if issues arise
5. **Rate Limiting:** Maximum trades per day based on membership tier

---

## 🤖 AI Prediction Service

### Architecture

```typescript
// src/lib/ai-prediction-service.ts

interface PricePrediction {
  asset: 'BTC' | 'ETH' | 'USDT' | 'USDC';
  currentPrice: number;
  predictions: Array<{
    date: string;
    predictedPrice: number;
    confidence: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  }>;
  indicators: {
    rsi: number;            // Relative Strength Index
    macd: number;           // Moving Average Convergence Divergence
    sentiment: number;      // Market sentiment score
  };
  recommendation: 'buy' | 'sell' | 'hold';
}
```

### Prediction Flow

```
Historical Price Data (API)
    ↓
Gemini AI Analysis
    ↓
Technical Indicators Calculation
    ↓
Sentiment Analysis
    ↓
Price Prediction (7 days)
    ↓
Confidence Score + Recommendation
```

### Data Sources
- **CoinGecko API:** Real-time crypto prices
- **Gemini AI:** Pattern analysis and predictions
- **Internal Data:** User trading patterns
- **Market Sentiment:** News and social media analysis

---

## 📊 Data Flow Patterns

### Read-Heavy Operations
- **Cache First:** Check local cache before Firestore
- **Pagination:** Limit queries to 20-50 items
- **Indexes:** Composite indexes for complex queries
- **Real-time:** Use Firestore listeners sparingly

### Write-Heavy Operations
- **Batch Writes:** Group related updates
- **Transactions:** Use for balance updates
- **Async Jobs:** Cloud Functions for background tasks
- **Queues:** Pub/Sub for async processing

### Example: Loan Repayment Flow

```typescript
// 1. Start Firestore Transaction
const result = await db.runTransaction(async (transaction) => {
  
  // 2. Read current balances
  const borrowerWallet = await transaction.get(borrowerWalletRef);
  const investorWallet = await transaction.get(investorWalletRef);
  const loan = await transaction.get(loanRef);
  
  // 3. Validate
  if (borrowerWallet.mainBalance < repaymentAmount) {
    throw new Error('Insufficient funds');
  }
  
  // 4. Update balances atomically
  transaction.update(borrowerWalletRef, {
    mainBalance: borrowerBalance - repaymentAmount,
    loanBalance: borrowerLoanBalance - loanAmount
  });
  
  transaction.update(investorWalletRef, {
    mainBalance: investorBalance + returnAmount
  });
  
  // 5. Update loan status
  transaction.update(loanRef, {
    status: 'repaid',
    repaidAt: FieldValue.serverTimestamp()
  });
  
  // 6. Create transaction record
  transaction.set(transactionRef, {
    type: 'loan_repayment',
    amount: repaymentAmount,
    from: borrowerId,
    to: investorId,
    loanId: loan.id,
    timestamp: FieldValue.serverTimestamp()
  });
  
  return { success: true };
});

// 7. Send notifications (async, outside transaction)
await notificationService.send({
  userId: investorId,
  type: 'loan_repaid',
  data: { loanId, amount: returnAmount }
});
```

---

## 🔒 Security Architecture

### Defense in Depth

1. **Network Layer**
   - HTTPS only
   - CORS configured
   - Rate limiting
   - DDoS protection (Vercel)

2. **Application Layer**
   - Input validation
   - SQL injection prevention (N/A - NoSQL)
   - XSS protection
   - CSRF tokens

3. **Authentication Layer**
   - Firebase Auth
   - JWT tokens
   - Session management
   - MFA available

4. **Authorization Layer**
   - Role-based access (RBAC)
   - Firestore security rules
   - API route protection
   - Resource-level permissions

5. **Data Layer**
   - Encryption at rest
   - Encryption in transit
   - PII data masking
   - Audit logging

### Firestore Security Rules Example

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Wallets are private
    match /wallets/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false;  // Only server can write
    }
    
    // Transactions readable by participants
    match /transactions/{transactionId} {
      allow read: if request.auth.uid == resource.data.from 
                  || request.auth.uid == resource.data.to
                  || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if false;  // Server only
    }
    
    // P2P Crypto listings
    match /p2p_crypto_listings/{listingId} {
      allow read: if true;  // Public
      allow create: if request.auth != null 
                    && request.resource.data.creatorId == request.auth.uid;
      allow update, delete: if request.auth.uid == resource.data.creatorId;
    }
  }
}
```

---

## 🚀 Performance Optimizations

### Frontend
- **Code Splitting:** Dynamic imports for heavy pages
- **Image Optimization:** Next.js Image component
- **Lazy Loading:** Components loaded on demand
- **Caching:** React Query for data caching
- **Bundle Analysis:** Webpack Bundle Analyzer

### Backend
- **Database Indexes:** Firestore composite indexes
- **Query Optimization:** Limit, pagination, field selection
- **Caching Layer:** Redis/Memcached for hot data
- **CDN:** Vercel Edge Network
- **Asset Optimization:** Compress images, minify JS/CSS

### Monitoring
- **Vercel Analytics:** Page load times, Core Web Vitals
- **Firebase Console:** Database queries, function invocations
- **Error Tracking:** Sentry integration ready
- **Custom Metrics:** Performance API measurements

---

## 🧪 Testing Strategy

### Test Pyramid

```
      /\
     /E2E\          ← 10% (Playwright)
    /──────\
   /  API   \       ← 30% (Integration)
  /──────────\
 /   UNIT     \     ← 60% (Vitest)
/──────────────\
```

### Coverage
- **Unit Tests:** 320 tests (86.29% coverage)
- **Integration Tests:** Firebase Emulator tests
- **E2E Tests:** Critical user journeys
- **Security Tests:** Transaction monitoring, rate limiting

### Key Test Files
- `src/tests/auth-integration.test.tsx` - Auth flows
- `src/tests/wallet-operations.test.ts` - Wallet logic
- `src/tests/loan-service.test.ts` - Loan matching
- `src/tests/p2p-crypto-service.test.ts` - Crypto trading
- `src/e2e-tests/onboarding.e2e.spec.ts` - User onboarding
- `src/e2e-tests/p2p-trading.e2e.spec.ts` - P2P trade flow

---

## 📈 Scalability Considerations

### Current Capacity
- **Users:** 10,000+ concurrent users
- **Transactions:** 1,000+ per minute
- **Database Reads:** 50,000+ per minute
- **Database Writes:** 10,000+ per minute

### Scaling Strategies
1. **Horizontal Scaling:** Vercel auto-scales frontend
2. **Database Sharding:** Partition Firestore collections by region
3. **Caching:** Add Redis for frequent reads
4. **CDN:** Serve static assets from edge locations
5. **Load Balancing:** Distribute API requests
6. **Background Jobs:** Offload heavy operations to Cloud Functions

---

## 🔄 Deployment Pipeline

```
Developer Push to main
    ↓
GitHub Actions Trigger
    ↓
Run Tests (320 tests)
    ↓
Build Next.js App
    ↓
Deploy to Vercel
    ↓
Firebase Functions Deploy
    ↓
Firestore Rules & Indexes Deploy
    ↓
Production Live ✅
```

### Environments
- **Development:** Local (Firebase Emulators)
- **Staging:** Vercel Preview Deployments
- **Production:** Vercel Production + Firebase

---

## 📚 Related Documentation

- **[Data Models](./data-models.md)** - Firestore schemas
- **[API Endpoints](./api-endpoints.md)** - Complete API reference
- **[Developer Guide](./developer-guide.md)** - Setup instructions
- **[Deployment Guide](./deployment-guide.md)** - Production deployment

---

**Architecture designed for:** Scale, Security, Performance, Maintainability
