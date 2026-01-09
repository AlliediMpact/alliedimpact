# 🏢 Allied iMpact Platform

> **One Identity. Multiple Products. Built for Scale.**

**Production-Ready | January 2026 | Enterprise Platform**

Allied iMpact is a **multi-product digital platform** that delivers independent applications under a unified identity system. This monorepo contains the complete platform: shared services, 6+ production apps, and central dashboard.

---

## 🎯 What Allied iMpact Is

Allied iMpact operates on **two parallel value streams**:

### 1. **Ready-Made Digital Products**
Revenue-generating applications available via subscription or usage-based pricing:
- **Coin Box** - P2P Financial Platform (Loans, Investments, Crypto Trading)
- **Drive Master** - Driver Training & Certification  
- **CodeTech** - Software Development Learning Platform
- **Cup Final** - Sports Tournament Management
- **uMkhanyakude** - High Schools Information Portal

### 2. **Custom Solutions & Services**
Project-based development for businesses, NGOs, and institutions:
- **My Projects** - Custom software project management
- **Client Platforms** - Bespoke applications
- **Licensed IP** - White-label solutions

---

## 🌍 Platform Architecture Overview

```
alliedimpact/ (MONOREPO)
├── platform/              # Shared platform services
│   ├── auth/             # Firebase Auth wrapper + user management
│   ├── billing/          # Subscription & payment logic
│   ├── entitlements/     # Access control & permissions
│   ├── notifications/    # Cross-platform notifications
│   └── shared/           # Shared types, utilities, constants
│
├── apps/                 # Independent applications
│   ├── coinbox/          # ✅ PRODUCTION (P2P Finance)
│   ├── myprojects/       # ✅ PRODUCTION (Project Management)
│   ├── drive-master/     # 🚧 Active Development
│   ├── codetech/         # 🚧 Active Development
│   ├── cup-final/        # 🚧 Active Development
│   └── umkhanyakude/     # 🚧 Active Development
│
├── web/                  # Allied iMpact web presence
│   └── portal/           # Main website + unified dashboard
│
├── packages/             # Shared packages
│   ├── types/            # TypeScript types
│   ├── ui/               # Shared UI components
│   └── utils/            # Shared utilities
│
└── docs/                 # Platform documentation
    ├── README.md (this file)
    ├── ALLIED_IMPACT_PLATFORM_MODEL.md
    ├── PLATFORM_AND_PRODUCTS.md
    ├── ARCHITECTURE_AND_SECURITY.md
    └── DEVELOPMENT_AND_SCALING_GUIDE.md
```

---

## 🔐 How Users Interact with the Platform

### Two Entry Points

#### Option A: Login via Allied iMpact Platform
```
1. User visits alliedimpact.com
2. Logs in once (Firebase Auth)
3. Lands on unified dashboard
4. Sees all apps they have access to
5. Clicks app → navigated to app with SSO
```

#### Option B: Direct App Login
```
1. User visits coinbox.alliedimpact.com directly
2. Logs in (same Firebase Auth)
3. Enters Coin Box app
4. Can navigate back to dashboard anytime
```

### Key Principle: **Single Sign-On (SSO)**
- One account works across all Allied iMpact apps
- Firebase Auth is the identity provider
- Apps check entitlements before granting access

---

## 🚀 Running Locally

### Prerequisites
```bash
Node.js >= 18
pnpm >= 8.0
Firebase CLI
```

### Installation
```bash
# Clone repository
git clone <repo-url>
cd alliedimpact

# Install all dependencies (monorepo)
pnpm install

# Copy environment templates
cp apps/coinbox/.env.example apps/coinbox/.env.local
cp web/portal/.env.example web/portal/.env.local

# Configure Firebase credentials
# Edit .env.local files with your Firebase config
```

### Running the Platform

#### Run Unified Dashboard
```bash
cd web/portal
pnpm dev
# Opens on http://localhost:3000
```

#### Run Individual Apps
```bash
# Coin Box
cd apps/coinbox
pnpm dev
# Opens on http://localhost:3002

# My Projects
cd apps/myprojects
pnpm dev
# Opens on http://localhost:3003

# Drive Master
cd apps/drive-master
pnpm dev
# Opens on http://localhost:3004
```

#### Run Multiple Apps Simultaneously
```bash
# From root
pnpm dev --filter=@allied-impact/portal
pnpm dev --filter=@allied-impact/coinbox
pnpm dev --filter=@allied-impact/myprojects
```

### Firebase Emulators (Local Development)
```bash
# Start Firebase emulators (Auth, Firestore, Functions)
firebase emulators:start

# Emulators run on:
# - Auth: http://localhost:9099
# - Firestore: http://localhost:8080
# - Functions: http://localhost:5001
```

---

## 🏗️ Deployment

### Environment Structure
```
Production:   alliedimpact.com (dashboard)
              coinbox.alliedimpact.com
              myprojects.alliedimpact.com
              drivemaster.alliedimpact.com
              
Staging:      staging.alliedimpact.com
              coinbox-staging.alliedimpact.com
              ...

Development:  Local only (localhost)
```

### Deployment Process

#### 1. Deploy Dashboard (Vercel)
```bash
cd web/portal
vercel --prod
```

#### 2. Deploy Apps (Individual)
```bash
# Coin Box (Vercel)
cd apps/coinbox
vercel --prod

# My Projects (Vercel)
cd apps/myprojects
vercel --prod
```

#### 3. Deploy Firebase Backend
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firebase Functions
firebase deploy --only functions

# Deploy all
firebase deploy
```

### CI/CD Pipeline
- **GitHub Actions** configured per app
- **Auto-deploy on push** to main (staging)
- **Manual approval** for production
- **Automated tests** run before deployment

---

## 🧠 Where Logic Lives

### Platform Layer (`platform/`)
**Handles**: 
- User authentication (Firebase wrapper)
- Subscription management
- Entitlement checking
- Cross-app notifications
- Shared types and utilities

**DOES NOT**:
- Contain app-specific business logic
- Access app databases directly
- Make app-level decisions

### App Layer (`apps/`)
**Handles**:
- App-specific business logic
- App-specific database schemas
- App-specific UI/UX
- App-specific workflows

**DOES NOT**:
- Duplicate auth systems
- Bypass platform entitlements
- Share databases with other apps

### Firebase (Hybrid Model)
**Handles**:
- Authentication (identity provider)
- Real-time updates (Firestore listeners)
- File storage
- Serverless functions

**DOES NOT**:
- Serve as source of truth for business logic
- Enforce business rules (apps own this)
- Act as primary backend (apps have logic)

### Key Principle: **Separation of Concerns**
```
Platform = Identity + Access Control
Apps = Business Logic + Data + UI
Firebase = Auth + Real-time + Storage (NOT business authority)
```

---

## 📋 Current Platform Status

### Production Ready ✅
- **Coin Box**: Full P2P financial platform (loans, investments, crypto)
- **My Projects**: Project management for custom solutions
- **Platform Auth**: SSO working across all apps
- **Dashboard**: Unified view of all apps

### Active Development 🚧
- **Drive Master**: Driver training platform
- **CodeTech**: Software learning platform
- **Cup Final**: Sports tournament management
- **uMkhanyakude**: Schools information portal

### Infrastructure ✅
- Firebase Auth (SSO)
- Firestore (per-app databases)
- Vercel hosting (all apps)
- GitHub Actions CI/CD
- Monitoring & logging

---

## 🔒 Security & Access Control

### Authentication Flow
1. User logs in via Firebase Auth (email/password, Google, etc.)
2. Firebase returns authenticated user (`uid`, `email`)
3. Platform checks user's `archetypes` and `subscriptions`
4. Dashboard shows available apps
5. App verifies entitlement before granting access

### Entitlements Model
Access is determined by **entitlements**, not hard-coded roles:
- **Subscription-based**: User pays → gets entitlement
- **Sponsored**: Organization pays → users get free access
- **Project-based**: Client contract → project team gets access
- **Admin**: Platform-granted access

### Security Principles
- **Firebase Auth is NOT business authority**
- **Apps own their business logic**
- **Firestore rules are defensive** (prevent unauthorized access)
- **No app can access another app's database**
- **Coin Box is isolated** (financial data protection)

---

## 🛠️ Development Principles

### ✅ DO:
- Reuse platform services (`@allied-impact/auth`, `@allied-impact/entitlements`)
- Check entitlements before granting app access
- Document all decisions in app README
- Use TypeScript everywhere
- Write tests for critical paths
- Follow existing patterns (reference Coin Box)

### ❌ DON'T:
- Rewrite Coin Box or My Projects (production systems)
- Create new auth systems per app
- Duplicate entitlement logic
- Share databases between apps
- Bypass platform security
- Add speculative features

### Code Quality Standards
- **TypeScript**: 100% type coverage
- **Testing**: Unit tests for business logic
- **Documentation**: Inline comments + README per app
- **Git**: Feature branches, PR reviews, semantic commits
- **CI/CD**: Auto-deploy to staging, manual prod approval

---

## 📚 Documentation Guide

This platform has **5 comprehensive documents** (no more, no less):

| Document | Purpose |
|----------|---------|
| **README.md** (this file) | Platform overview, how to run, how to deploy, where logic lives |
| **ALLIED_IMPACT_PLATFORM_MODEL.md** | Business model, user archetypes, platform philosophy |
| **PLATFORM_AND_PRODUCTS.md** | List of apps, what each does, how they integrate |
| **ARCHITECTURE_AND_SECURITY.md** | Hybrid Firebase strategy, security principles, access control |
| **DEVELOPMENT_AND_SCALING_GUIDE.md** | How to add new apps, scaling guidelines, guardrails |

**Each app** also has its own `README.md` with app-specific details.

---

## 🎯 Quick Start for New Developers

### Day 1: Setup
1. Clone repo
2. Install dependencies (`pnpm install`)
3. Set up Firebase config (`.env.local`)
4. Run dashboard locally (`cd web/portal && pnpm dev`)
5. Run Coin Box locally (`cd apps/coinbox && pnpm dev`)

### Day 2: Explore
1. Read all 5 platform docs (this README + 4 others)
2. Browse `platform/` folder (shared services)
3. Study Coin Box as reference implementation
4. Understand Firebase hybrid model

### Day 3: Contribute
1. Pick a task from project board
2. Create feature branch
3. Write code + tests
4. Open PR with description
5. Get review + merge

---

## 🚦 Launch Readiness

### Platform Status: **PRODUCTION READY** ✅

**Ready for Launch**:
- ✅ Authentication & SSO working
- ✅ Dashboard functional
- ✅ 2 production apps (Coin Box, My Projects)
- ✅ Platform services operational
- ✅ CI/CD pipelines configured
- ✅ Documentation consolidated
- ✅ Security audited

**Pre-Launch Checklist**:
- ✅ Final security review
- ✅ Documentation consolidation
- ✅ Workflow verification
- ✅ Performance testing
- ⏳ Beta user testing (in progress)
- ⏳ Marketing materials
- ⏳ Support infrastructure

---

## 🤝 Contributing

1. **Read Documentation**: All 5 platform docs + app README
2. **Follow Principles**: No rewrites, no duplication, security-first
3. **Use Platform Services**: Don't reinvent the wheel
4. **Write Tests**: Business logic must be tested
5. **Document Decisions**: Update docs when changing architecture

---

## 📞 Support & Contact

- **Technical Issues**: GitHub Issues
- **Platform Questions**: platform@alliedimpact.com
- **Business Inquiries**: info@alliedimpact.com

---

## 📄 License

**Proprietary** - © 2024-2026 Allied iMpact  
All rights reserved. Not for redistribution.

---

**Last Updated**: January 6, 2026  
**Platform Version**: 2.0  
**Status**: Production Ready
