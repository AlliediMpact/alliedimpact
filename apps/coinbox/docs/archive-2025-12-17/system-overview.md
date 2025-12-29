# CoinBox AI - System Overview

**Version:** 2.1.0  
**Last Updated:** December 8, 2025  
**Status:** Production Ready ✅

---

## 🎯 What is CoinBox AI?

CoinBox AI is a comprehensive **Peer-to-Peer (P2P) financial platform** that enables secure lending, investment, and cryptocurrency trading. The platform combines traditional financial services with modern crypto trading capabilities, all powered by AI predictions and secure escrow systems.

---

## 🌟 Core Features

### 1. P2P Investments & Loans 💰
- **Invest:** Lend money to other users and earn 20% monthly interest
- **Borrow:** Get instant loans based on your membership tier
- **Automated Matching:** System automatically matches lenders with borrowers
- **Secure Escrow:** Funds held safely until both parties confirm transaction

### 2. P2P Crypto Marketplace 🪙
- **Trade Crypto:** Buy and sell BTC, ETH, USDT, USDC directly with other users
- **Escrow Protection:** Cryptocurrency locked in escrow until trade completes
- **AI Price Predictions:** Get AI-powered price forecasts for informed trading
- **Multiple Payment Methods:** Bank Transfer, EFT, Cash Deposit supported

### 3. Membership Tiers 🏆
Four tiers with increasing limits and benefits:
- **Basic** (R550 security fee): Loan up to R500, Invest up to R5,000
- **Ambassador** (R1,100): Loan up to R1,000, Invest up to R10,000
- **VIP** (R5,500): Loan up to R5,000, Invest up to R50,000
- **Business** (R11,000): Loan up to R10,000, Invest up to R100,000

### 4. Wallet System 💳
- **Multi-balance Tracking:** Separate balances for investments, loans, commissions
- **Crypto Wallet:** Support for BTC, ETH, USDT, USDC
- **Transaction History:** Complete audit trail of all financial activities
- **Real-time Updates:** Live balance updates across the platform

### 5. Referral & Commission System 🤝
- **Earn Commission:** 1-5% commission on referrals based on your tier
- **Multi-level Rewards:** Commission on direct and indirect referrals
- **Automated Payouts:** Commission automatically credited to your wallet
- **Referral Dashboard:** Track your referrals and earnings

### 6. AI & Analytics 🤖
- **Price Predictions:** AI-powered cryptocurrency price forecasts
- **Risk Assessment:** Automated fraud detection and risk scoring
- **Portfolio Analytics:** Track performance, P/L, and trading stats
- **Market Insights:** Real-time market data and trends

### 7. Security & Compliance 🔒
- **KYC Verification:** Multi-level identity verification via Smile Identity
- **2FA Authentication:** Two-factor authentication for enhanced security
- **Escrow System:** Funds protected during all transactions
- **Compliance:** FSCA and SARB regulatory compliance
- **Audit Logging:** Complete transaction audit trail

---

## 🏗️ System Architecture

### Technology Stack
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Firebase (Firestore, Authentication, Cloud Functions)
- **Payments:** Paystack integration
- **KYC:** Smile Identity API
- **AI:** Google Generative AI (Gemini)
- **Hosting:** Vercel (production), Firebase Emulators (development)

### Core Services
1. **Authentication Service** - User login, signup, MFA
2. **Membership Service** - Tier management and validation
3. **Loan Service** - Loan applications, approvals, repayments
4. **Trading Service** - P2P investment matching
5. **P2P Crypto Service** - Cryptocurrency trading and escrow
6. **Wallet Service** - Balance management and transactions
7. **Commission Service** - Referral tracking and payouts
8. **Notification Service** - Email, SMS, in-app notifications
9. **AI Service** - Price predictions and risk assessment
10. **Audit Service** - Transaction logging and compliance

---

## 📊 User Journey

### New User Onboarding
1. **Sign Up** → Create account with email/password
2. **Email Verification** → Verify email address
3. **Choose Membership** → Select and pay for membership tier
4. **KYC Verification** → Upload ID and complete verification
5. **Deposit Funds** → Add money to wallet via Paystack
6. **Start Trading** → Invest, borrow, or trade crypto

### Investment Flow
1. Browse available loan requests
2. Select amount to invest
3. Confirm investment → Funds locked in escrow
4. Borrower accepts and repays loan
5. Receive principal + 20% interest
6. 5% to wallet, 15% to bank account

### Borrowing Flow
1. Request loan amount (within tier limit)
2. System matches with investors
3. Receive funds in wallet
4. Repay with 25% fee
5. 5% returned to wallet, 20% to investor

### Crypto Trading Flow
1. Browse P2P crypto marketplace
2. Create listing (buy/sell) or match existing listing
3. Crypto locked in escrow
4. Buyer transfers payment via bank
5. Seller confirms payment received
6. Crypto released from escrow to buyer
7. Trade complete

---

## 🔐 Security Model

### Multi-Layer Protection
1. **Authentication:** Firebase Auth with email/password + MFA
2. **Authorization:** Role-based access control (user/admin/support)
3. **Data Security:** Firestore security rules enforce user permissions
4. **Transaction Security:** All financial operations require authentication
5. **Escrow Protection:** Funds locked until transaction confirmed
6. **Fraud Detection:** ML-powered anomaly detection
7. **Audit Trail:** All transactions logged for compliance

### Firestore Collections Security
- **Users:** Read own data, admin write
- **Wallets:** Read/write own wallet only
- **Transactions:** Read own, admin full access
- **Loans:** Participants only
- **P2P Crypto:** Transaction participants only
- **Commissions:** Read own, system write

---

## 💳 Fee Structure

### Transaction Fees
- **Deposit:** Free (Paystack fees apply)
- **Withdrawal:** R10 per transaction
- **Loan Processing:** R10 + 25% repayment fee
- **Investment:** R10 transaction fee
- **P2P Crypto Trade:** 0.1% of trade amount
- **Referral Commission:** 1-5% based on tier

### Membership Fees (One-time)
| Tier | Security Fee | Refundable | Admin Fee |
|------|--------------|------------|-----------|
| Basic | R550 | R500 | R50 |
| Ambassador | R1,100 | R1,000 | R100 |
| VIP | R5,500 | R5,000 | R500 |
| Business | R11,000 | R10,000 | R1,000 |

---

## 📈 Platform Statistics

### Current Capabilities
- **4 Membership Tiers** with progressive benefits
- **59 Application Pages** (dashboard, trading, P2P crypto, etc.)
- **40+ API Endpoints** for all operations
- **4 Supported Cryptocurrencies** (BTC, ETH, USDT, USDC)
- **320 Passing Tests** (86.29% code coverage)
- **85 Compiled Routes** (optimized for production)
- **Multi-currency Support** (ZAR primary, USD/EUR/GBP supported)

### User Limits by Tier

| Feature | Basic | Ambassador | VIP | Business |
|---------|-------|------------|-----|----------|
| Max Loan | R500 | R1,000 | R5,000 | R10,000 |
| Max Investment | R5,000 | R10,000 | R50,000 | R100,000 |
| P2P Crypto/Trade | R5,000 | R10,000 | R50,000 | R100,000 |
| Weekly P2P Volume | R20,000 | R50,000 | R200,000 | R500,000 |
| Active P2P Listings | 5 | 10 | 20 | 50 |
| Commission Rate | 1% | 2% | 3% | 5% |

---

## 🚀 Deployment Architecture

### Production Environment
- **Frontend Hosting:** Vercel (global CDN)
- **Backend:** Firebase Cloud Functions (serverless)
- **Database:** Firestore (NoSQL, real-time)
- **Authentication:** Firebase Auth (OAuth, email/password)
- **File Storage:** Firebase Storage (KYC documents, receipts)
- **Monitoring:** Vercel Analytics + Firebase Console

### Development Environment
- **Local Server:** Next.js dev server (port 9004)
- **Emulators:** Firebase Emulators (Firestore, Functions, Auth)
- **Testing:** Vitest (unit), Playwright (E2E)
- **CI/CD:** GitHub Actions + Vercel auto-deploy

---

## 📚 Key Documents

- **[Architecture](./architecture.md)** - Technical architecture and design patterns
- **[Data Models](./data-models.md)** - Firestore collections and schemas
- **[Membership System](./membership-tiers.md)** - Tier benefits and limits
- **[P2P Loans](./p2p-loans.md)** - Investment and borrowing system
- **[P2P Crypto](./p2p-crypto-trading.md)** - Cryptocurrency marketplace
- **[Escrow System](./escrow-system.md)** - How escrow protects transactions
- **[Wallet Operations](./wallet-operations.md)** - Balance management
- **[AI Predictions](./ai-prediction.md)** - AI-powered price forecasting
- **[API Endpoints](./api-endpoints.md)** - Complete API reference
- **[Developer Guide](./developer-guide.md)** - Setup and development
- **[Deployment Guide](./deployment-guide.md)** - Production deployment

---

## 🎯 Roadmap

### Phase 6 (Current Focus)
- Real-time P2P updates via WebSocket
- In-trade messaging between buyers/sellers
- Advanced P2P filters and search
- User reputation and rating system
- Automated dispute resolution

### Future Phases
- Mobile app (React Native)
- Cross-border payments
- DeFi integrations
- Staking and yield farming
- Advanced trading bots
- Institutional accounts

---

## 📞 Support

- **Technical Documentation:** `/docs` folder
- **API Documentation:** `/docs/api-endpoints.md`
- **GitHub Issues:** Report bugs and request features
- **Email Support:** support@coinbox.ai (for users)
- **Admin Dashboard:** `/dashboard/admin` (for support staff)

---

**Built with ❤️ by Allied iMpact**
