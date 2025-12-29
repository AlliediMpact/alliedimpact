# Coin Box - System Overview

**Version:** 2.1.0  
**Status:** Production Ready ✅  
**Last Updated:** December 17, 2025

---

## 🎯 What is Coin Box?

Coin Box is a comprehensive **Peer-to-Peer (P2P) financial platform** that enables secure lending, investment, and cryptocurrency trading. The platform combines traditional financial services with modern crypto trading capabilities, all powered by AI predictions and secure escrow systems.

**Core Value Proposition:**  
Enable South Africans to access financial services, earn returns through peer-to-peer lending/investing, and trade cryptocurrencies safely - all while earning commissions through a referral system.

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                           │
│  Next.js 14 (App Router) • React 18 • TypeScript            │
│  Tailwind CSS • Framer Motion • Radix UI                    │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                        API LAYER                             │
│  Next.js API Routes (/api/*)                                │
│  Auth • Wallet • Loans • P2P Crypto • Analytics             │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                           │
│  Auth • Membership • Wallet • Loan • P2P Crypto             │
│  Commission • AI • Notification • Audit                     │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   DATA & EXTERNAL LAYER                      │
│  Firestore • Firebase Auth • Storage • Functions            │
│  Paystack • Smile Identity • Google Gemini AI               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 with App Router
- React 18
- TypeScript (strict mode)
- Tailwind CSS for styling
- Framer Motion for animations
- Radix UI for accessible components

**Backend:**
- Next.js API Routes
- Firebase Firestore (NoSQL database)
- Firebase Cloud Functions (serverless)
- Firebase Authentication
- Firebase Storage

**External Services:**
- Paystack (payments)
- Smile Identity (KYC)
- Google Gemini AI (predictions)

---

## 🔐 Authentication & Authorization

### User Roles

1. **User** (Default)
   - Access to all platform features
   - Limited by membership tier
   - Can create loans, invest, trade crypto

2. **Admin**
   - Full platform access
   - User management
   - Transaction monitoring
   - System configuration

3. **Support**
   - View-only access to user data
   - Can assist with support tickets
   - Cannot modify financial data

### Authentication Flow

1. User signs up with email/password
2. Email verification required
3. Profile completion (phone, address)
4. Optional KYC verification for higher limits
5. Optional MFA (Two-Factor Authentication)

### Security Features

- Bcrypt password hashing
- JWT tokens for sessions
- Firebase Auth security rules
- Firestore security rules
- Rate limiting on sensitive endpoints
- Audit logging for all actions

---

## 💰 Membership Tiers & Limits

| Tier | Security Fee | Loan Limit | Investment Limit | Crypto Trade | Commission | Referral Bonus |
|------|-------------|-----------|------------------|--------------|------------|----------------|
| **Basic** | R550 | R500 | R5,000 | R5,000/trade | 1% | R50 |
| **Ambassador** | R1,100 | R1,000 | R10,000 | R10,000/trade | 2% | R100 |
| **VIP** | R5,500 | R5,000 | R50,000 | R50,000/trade | 3% | R250 |
| **Business** | R11,000 | R10,000 | R100,000 | R100,000/trade | 5% | R500 |

### Tier Upgrade Rules

- Users can upgrade anytime by paying the difference
- Upgrades are instant after payment confirmation
- Cannot downgrade tiers
- Limits apply immediately after upgrade
- Historical transactions unaffected by tier changes

---

## 💳 Wallet System

### Balance Types

The wallet maintains **separate balances** for different purposes:

1. **Main Balance**
   - General funds for trading
   - Can be withdrawn anytime
   - Used for deposits/transfers

2. **Investment Balance**
   - Funds locked in active investments
   - Released when loan is repaid
   - Includes principal + interest

3. **Commission Balance**
   - Referral commission earnings
   - Can be withdrawn or used for trades
   - Automatically credited

4. **Crypto Balances**
   - BTC, ETH, USDT, USDC
   - Separate from ZAR balance
   - Can be traded or withdrawn

### Transaction Types

- **Deposit**: Add funds from bank account
- **Withdrawal**: Transfer to bank account
- **Transfer**: Internal user-to-user
- **Investment**: Lock funds in loan
- **Loan Disbursement**: Receive borrowed funds
- **Loan Repayment**: Repay borrowed amount
- **Commission**: Referral earnings
- **Crypto Trade**: Buy/sell cryptocurrency

---

## 🏦 P2P Loans & Investments

### How Loans Work

**For Borrowers:**
1. Create loan ticket (amount + duration + interest rate)
2. System validates against tier limits
3. Ticket becomes available for investors
4. Once fully funded, money disbursed to borrower
5. Borrower repays at end of loan period
6. Late fees apply for overdue repayments

**For Investors:**
1. Browse available loan tickets
2. Invest partial or full amount
3. Funds locked until loan completes
4. Earn interest (10-25% monthly)
5. Receive principal + interest when repaid
6. Can invest in multiple loans

### Interest Rates

- **Standard Range**: 10-25% monthly
- **Platform Commission**: 20% of interest earned
- **Example**: R1,000 loan at 20% interest
  - Borrower repays: R1,200
  - Investor receives: R1,160 (R1,000 + R160 interest)
  - Platform keeps: R40 (20% of R200 interest)

### Loan Status Lifecycle

```
Created → Funding → Funded → Active → Repaid
                ↓
              Cancelled (if not funded)
                
Active → Overdue → Defaulted (if not repaid)
```

---

## 🪙 P2P Crypto Trading

### Supported Cryptocurrencies

- **Bitcoin (BTC)**
- **Ethereum (ETH)**
- **Tether (USDT)**
- **USD Coin (USDC)**

### Trading Flow

**Create Listing:**
1. User creates buy/sell order
2. Specifies amount, price, payment method
3. For sell orders: crypto locked in escrow
4. Listing visible to all users

**Match & Trade:**
1. Another user accepts the order
2. For buy orders: ZAR locked in escrow
3. Chat opens for coordination
4. Buyer makes payment (offline)
5. Seller confirms payment received
6. Crypto released from escrow
7. Trade completed

### Escrow Protection

- **Seller Protection**: Crypto locked until buyer confirms payment
- **Buyer Protection**: ZAR locked until crypto received
- **Dispute Resolution**: Admin can review and intervene
- **Automatic Release**: After seller confirmation
- **Refund Mechanism**: If trade cancelled

### AI Price Predictions

- 7-day price forecasts using Google Gemini AI
- Historical trend analysis
- Confidence scores for predictions
- Real-time price updates
- Helps users make informed decisions

---

## 🤝 Referral & Commission System

### How It Works

1. **Get Referral Code**: Every user has unique code
2. **Share Code**: Invite friends/family
3. **Earn Commission**: When referrals trade, you earn
4. **Tiered Rates**: Higher tier = higher commission

### Commission Structure

- **Level 1 (Direct Referrals)**: Full commission rate
- **Level 2 (Referral's Referrals)**: 50% of commission rate
- **Example** (VIP tier at 3%):
  - Direct referral trades R1,000: You earn R30
  - Indirect referral trades R1,000: You earn R15

### Commission Sources

Commissions earned on:
- ✅ Loan interest payments
- ✅ Investment returns
- ✅ Crypto trades (buyer + seller sides)
- ✅ Wallet transfers (0.5% fee)
- ❌ Deposits/withdrawals (no commission)

### Payout Rules

- Commissions credited instantly
- Can be withdrawn anytime
- No minimum threshold
- Tracked in real-time dashboard

---

## 🤖 AI & Analytics

### AI Features

1. **Cryptocurrency Price Predictions**
   - 7-day forecasts for BTC, ETH, USDT, USDC
   - Confidence scores
   - Historical accuracy tracking

2. **Fraud Detection**
   - Pattern recognition for suspicious activity
   - Risk scoring for transactions
   - Automatic flagging for review

3. **Portfolio Analytics**
   - ROI calculations
   - Performance tracking
   - Investment recommendations

### Google Gemini AI Integration

- Real-time API calls for predictions
- Fallback to cached data if API fails
- Rate limiting to manage costs
- Prompt engineering for accurate results

---

## 🔔 Notifications

### Notification Types

1. **System Notifications**
   - Welcome messages
   - Verification reminders
   - System announcements

2. **Transaction Notifications**
   - Deposit confirmations
   - Withdrawal alerts
   - Transfer notifications

3. **Loan/Investment Notifications**
   - Loan funded
   - Investment returns
   - Repayment reminders
   - Overdue alerts

4. **Crypto Trading Notifications**
   - Order matched
   - Payment received
   - Trade completed
   - Price alerts

5. **Referral Notifications**
   - New referral signed up
   - Commission earned
   - Referral milestones

### Delivery Channels

- **In-App**: Real-time notifications in dashboard
- **Email**: Important updates and confirmations
- **SMS**: Critical alerts (optional)
- **Push Notifications**: Mobile app (future)

---

## 🛡️ Security & Compliance

### Security Measures

1. **Authentication**
   - Email verification required
   - Strong password requirements
   - Optional MFA (TOTP)
   - Session management

2. **Data Protection**
   - Encrypted data at rest
   - HTTPS for all communications
   - Secure Firebase rules
   - PII data protection

3. **Transaction Security**
   - Escrow system for crypto
   - Balance verification before transactions
   - Audit trail for all actions
   - Fraud detection algorithms

4. **KYC/AML Compliance**
   - Smile Identity integration
   - ID verification required for high limits
   - Address verification
   - Compliance reporting

### Firestore Security Rules

```javascript
// Users can only read/write their own data
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Admins have full access
match /{document=**} {
  allow read, write: if request.auth.token.role == 'admin';
}

// Transactions are immutable
match /transactions/{transactionId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update, delete: if false; // Immutable
}
```

---

## 📊 Data Models

### Core Collections

1. **users**
   - Profile data
   - Membership tier
   - KYC status
   - Referral code

2. **wallets**
   - Balance information
   - Transaction history
   - Crypto balances

3. **loanTickets**
   - Loan details
   - Status tracking
   - Investor list

4. **investments**
   - Investment records
   - Return calculations
   - Status tracking

5. **cryptoListings**
   - Active orders
   - Trade history
   - Escrow status

6. **transactions**
   - All financial transactions
   - Audit trail
   - Immutable records

7. **commissions**
   - Referral earnings
   - Payout history
   - Commission rates

---

## 🔄 Feature Flags & Extensibility

### "Extend, Don't Break" Philosophy

**Core Principle**: Always add new features without modifying existing functionality.

### How We Extend Features

1. **Add New Services**: Create new service files
2. **Extend Existing Models**: Use optional fields
3. **Feature Flags**: Enable/disable features per user
4. **Version APIs**: v1, v2 endpoints coexist
5. **Database Migrations**: Add fields, never remove

### Example: Adding Savings Feature

```typescript
// ✅ GOOD: Extend wallet model
interface Wallet {
  // Existing fields
  mainBalance: number;
  investmentBalance: number;
  
  // NEW: Add optional field
  savingsBalance?: number;
}

// ✅ GOOD: New service file
// src/lib/savings-service.ts
export async function createSavingsJar() { ... }

// ❌ BAD: Modifying existing service
// Don't change loan-service.ts for savings
```

### Feature Flags

```typescript
interface User {
  featureFlags: {
    savingsEnabled: boolean;
    cryptoTradingEnabled: boolean;
    advancedAnalytics: boolean;
  }
}
```

---

## 🚀 Performance & Scalability

### Performance Optimizations

1. **Frontend**
   - Code splitting with Next.js
   - Image optimization
   - Lazy loading components
   - Client-side caching

2. **Backend**
   - Firestore query optimization
   - Indexed fields for fast lookups
   - Cloud Function cold start mitigation
   - Rate limiting

3. **Database**
   - Composite indexes
   - Denormalized data where needed
   - Pagination for large datasets
   - Efficient query patterns

### Scalability Considerations

- Firestore scales automatically
- Serverless functions scale with demand
- CDN for static assets (Vercel)
- Multi-region deployment ready
- Load balancing built-in

---

## 🧪 Testing Strategy

### Test Coverage

- **Unit Tests**: Core business logic (target: 80%+)
- **Integration Tests**: API endpoints and services
- **E2E Tests**: Critical user workflows
- **Load Tests**: Performance under stress

### Testing Tools

- **Vitest**: Unit and integration tests
- **Playwright**: E2E testing
- **Artillery/k6**: Load testing
- **Firebase Emulator**: Local testing

### CI/CD Pipeline

```
Code Push → Tests Run → Build → Deploy
    ↓          ↓          ↓       ↓
 GitHub    Vitest +    Vercel   Production
           Playwright   Build
```

---

## 📈 Monitoring & Observability

### What We Monitor

1. **Application Metrics**
   - Response times
   - Error rates
   - Request volume

2. **Business Metrics**
   - User signups
   - Transaction volume
   - Commission earned
   - Active loans/trades

3. **System Health**
   - API uptime
   - Database performance
   - Function execution times

### Monitoring Tools

- Firebase Console for logs
- Vercel Analytics for performance
- Custom dashboard for business metrics
- Error tracking and alerting

---

## 🔌 API Architecture

### API Design Principles

1. **RESTful**: Standard HTTP methods
2. **Consistent**: Same patterns across endpoints
3. **Secure**: Authentication on all routes
4. **Documented**: Clear examples and schemas
5. **Versioned**: `/api/v1/...` for future compatibility

### Sample API Structure

```
/api
├── auth
│   ├── signup
│   ├── login
│   └── verify
├── wallet
│   ├── balance
│   ├── deposit
│   └── withdraw
├── loans
│   ├── create
│   ├── invest
│   └── repay
├── crypto
│   ├── listings
│   ├── create-order
│   └── trade
└── admin
    ├── users
    └── transactions
```

---

## 🗺️ Roadmap & Future Features

### Phase 1 (Complete ✅)
- User authentication
- Wallet system
- P2P loans
- Basic referrals

### Phase 2 (Complete ✅)
- P2P crypto trading
- AI predictions
- Enhanced UI/UX
- Admin dashboard

### Phase 3 (Current)
- Beta launch preparation
- Performance optimization
- Security hardening
- Documentation

### Future Phases
- **Savings Jars**: Automated savings with goals
- **Stokvel Groups**: Community savings circles
- **Mobile App**: Native iOS/Android
- **More Cryptos**: Additional coins support
- **Advanced Analytics**: Detailed reporting
- **API for Developers**: Public API access

---

## 📚 Key Concepts

### Escrow System

**Definition**: Secure holding of funds/crypto until transaction completes.

**How It Works**:
1. Seller creates listing → crypto locked
2. Buyer accepts → ZAR locked
3. Payment made offline
4. Both parties confirm → release funds
5. Dispute? → Admin reviews

### Token Bucket Rate Limiting

**Definition**: Prevents API abuse by limiting requests per time window.

**Implementation**:
- Each API key has a "bucket" of tokens
- Each request consumes 1 token
- Tokens refill over time
- When bucket empty, requests rejected

### Membership Tiers

**Definition**: User subscription levels with different limits/benefits.

**Why Tiers?**:
- Risk management (lower limits for new users)
- Revenue generation (upgrade fees)
- Incentive structure (higher commission at higher tiers)
- Trust building (verified users get higher limits)

---

## 🎓 Developer Guidelines

### Code Organization

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # React components
├── lib/              # Services and utilities
├── hooks/            # Custom React hooks
├── types/            # TypeScript types
└── utils/            # Helper functions
```

### Naming Conventions

- **Files**: kebab-case (user-service.ts)
- **Components**: PascalCase (WalletCard.tsx)
- **Functions**: camelCase (calculateInterest)
- **Constants**: UPPER_SNAKE_CASE (MAX_LOAN_AMOUNT)
- **Types**: PascalCase (UserProfile)

### Best Practices

1. **Always use TypeScript strict mode**
2. **Write tests for business logic**
3. **Document complex functions**
4. **Use constants for magic numbers**
5. **Handle errors gracefully**
6. **Log important actions**
7. **Never commit secrets**

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: "Insufficient balance" error  
**Solution**: Ensure wallet has enough funds before transaction

**Issue**: KYC verification fails  
**Solution**: Check Smile Identity API status, verify document quality

**Issue**: Crypto trade stuck in escrow  
**Solution**: Check both parties confirmed, admin can manually release

**Issue**: Commission not credited  
**Solution**: Verify referral link used, check commission calculation logic

---

## 📖 Additional Resources

- **README.md**: Quick start guide
- **CONTRIBUTING.md**: Development workflow
- **API Documentation**: Full endpoint reference
- **User Guide**: Feature walkthroughs
- **Admin Guide**: Platform management

---

*Last Updated: December 17, 2025*  
*Document Version: 1.0.0*  
*Maintained by: Allied iMpact Development Team*
