# 🏦 Coin Box - P2P Financial Platform

**Production-Ready | Version 2.1.0 | Beta Launch Ready** ✅

A comprehensive **Peer-to-Peer (P2P) financial platform** enabling secure lending, investment, and cryptocurrency trading for South Africans. Built with Next.js, Firebase, and AI-powered predictions.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]() 
[![Tests](https://img.shields.io/badge/tests-385%2B-brightgreen)]() 
[![Coverage](https://img.shields.io/badge/coverage-82%25-green)]()
[![License](https://img.shields.io/badge/license-Proprietary-red)]()

---

## 🌟 What We Do

Coin Box empowers South Africans to:
- 💰 **Lend & Invest**: Earn up to 25% monthly returns through P2P lending
- 🏦 **Borrow Smart**: Access instant loans based on your membership tier
- 🪙 **Trade Crypto**: Buy/sell Bitcoin, Ethereum, USDT, USDC safely with escrow protection
- 🤝 **Earn Commissions**: Build passive income through referrals (1-5%)
- 🤖 **AI Insights**: Get 7-day crypto price predictions to guide your decisions

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **P2P Loans** | Create loan tickets, investors fund them, earn interest |
| **Investments** | Invest in others' loans, earn 10-25% monthly returns |
| **Crypto Trading** | P2P marketplace for BTC, ETH, USDT, USDC with escrow |
| **Membership Tiers** | 4 tiers with increasing limits (R500 - R10,000 loans) |
| **Referral System** | Multi-level commission structure (1-5%) |
| **AI Predictions** | Google Gemini AI for crypto price forecasts |
| **Secure Wallet** | Multi-balance system (main, investment, commission, crypto) |
| **KYC Verification** | Smile Identity integration for compliance |

---

## 💡 Why Coin Box?

**Problem**: Limited access to financial services, high-interest bank loans, unsafe crypto trading.

**Solution**: Community-powered lending, fair interest rates, secure crypto trading, and earn while you help others.

**Unique Value**: 
- No banks involved (true P2P)
- Escrow protection on every trade
- AI-powered decision making
- Earn commission by referring friends

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Git

### Installation (3 Steps)

```bash
# 1. Clone and install
git clone https://github.com/AlliediMpact/coinbox.git
cd coinbox
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# 3. Start development
npm run dev
# Open http://localhost:3000
```

### Run Tests

```bash
npm run test              # Unit & integration tests
npm run test:coverage     # Coverage report
npm run test:e2e          # E2E tests with Playwright
```

### Build for Production

```bash
npm run build
npm run start
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion, Radix UI |
| **Backend** | Next.js API Routes, Firebase Functions |
| **Database** | Firebase Firestore (NoSQL) |
| **Auth** | Firebase Authentication |
| **Storage** | Firebase Storage |
| **Payments** | Paystack |
| **KYC** | Smile Identity |
| **AI** | Google Gemini AI |
| **Deployment** | Vercel |
| **Testing** | Vitest, Playwright, Artillery |

---

## 📚 Documentation

- **[SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)** - Complete system architecture, data models, and technical details
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development workflow, code standards, and PR process
- **[BETA_LAUNCH_CHECKLIST.md](./BETA_LAUNCH_CHECKLIST.md)** - Pre-launch verification (200+ items)
- **[BETA_LAUNCH_READY.md](./BETA_LAUNCH_READY.md)** - Launch day guide

---

## 🎯 Project Structure

```
coinbox/
├── src/
│   ├── app/                 # Next.js pages (App Router)
│   ├── components/          # React components
│   ├── lib/                 # Services & utilities
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript types
├── tests/                   # Unit & integration tests
├── functions/               # Firebase Cloud Functions
├── public/                  # Static assets
├── docs/                    # Documentation (archived)
├── SYSTEM_OVERVIEW.md       # Technical documentation
├── CONTRIBUTING.md          # Developer guide
└── README.md               # This file
```

---

## 🚀 Beta Launch Status

**Target Launch**: December 23, 2025 (6 days away!)

✅ **Ready**:
- 385+ tests passing (82% coverage)
- Performance validated (P95 < 500ms)
- Security hardened
- Documentation complete
- Deployment scripts ready

**Next Steps**:
1. Final pre-launch checks
2. Deploy to production
3. Send beta invitations (50-100 users)
4. Monitor launch day metrics

---

## 🤝 Contributing

We welcome contributions from the team! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Branch strategy
- Commit message conventions  
- Code style guidelines
- Testing requirements
- Pull request process

**Core Principle**: **Extend, don't break** - Always add new features without modifying existing functionality.

---

## 📄 License

Proprietary - © 2025 Allied iMpact. All rights reserved.

---

## 📞 Support

- **Team Discord**: [Internal link]
- **Email**: beta-support@coinbox.com
- **Documentation**: See [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)

---

**Built with ❤️ by Allied iMpact Team**  
*Empowering financial inclusion in South Africa*