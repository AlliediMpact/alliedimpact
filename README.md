# 🏢 Allied iMpact Platform

> **One Identity. Six Products. All Live.**

**🚀 LIVE NOW | www.alliedimpact.co.za**  
**📅 Last Updated**: April 13, 2026

Allied iMpact is a **multi-product digital platform ecosystem** delivering 6 independent applications under a unified identity and entitlements system. This monorepo powers the complete platform: shared services, production apps, and unified dashboard.

---

## 🎯 Platform Vision

Allied iMpact operates as a **unified digital ecosystem** providing:

### **Ready-Made Digital Products**
Revenue-generating applications available via subscription or usage-based pricing:
- **CoinBox** - P2P Financial Platform (Loans, Investments, Crypto Trading)
- **CareerBox** - Job Matching & Recruitment Platform
- **DriveMaster** - Driver Training & Certification Platform
- **EduTech** - Educational Courses with Premium Plans
- **SportsHub** - Sports Predictions & Voting Platform

### **Custom Solutions & Services**
Project-based development for businesses and institutions:
- **MyProjects** - Custom Software Project Management
- **ControlHub** - Internal Observability Dashboard
- **Portal** - Main Platform Entry & Unified Dashboard

---

## 🚀 Production Applications

### All 8 Apps Ready for February 25, 2026 Launch

| Application | Port | Firebase Project | Status | Description |
|------------|------|-----------------|--------|-------------|
| **Portal** | 3005 | allied-impact-platform | ✅ Production Ready | Main platform entry, unified dashboard, legal pages |
| **CoinBox** | 3000 | coinbox-ddc10 | ✅ Production Ready | P2P loans, investments, crypto trading (385+ tests) |
| **MyProjects** | 3006 | allied-impact-platform | ✅ Production Ready | Custom solution client portal, project management |
| **CareerBox** | 3003 | careerbox-64e54 | ✅ Production Ready | Job matching, recruitment, messaging platform |
| **DriveMaster** | 3001 | drivemaster-513d9 | ✅ Production Ready | Learner's license training, theory tests, scheduling |
| **EduTech** | 3007 | edutech-4f548 | ✅ Production Ready | Educational courses, enrollments, premium plans |
| **SportsHub** | 3008 | sportshub-526df | ✅ Production Ready | Sports predictions, voting, leaderboards |
| **ControlHub** | 3010 | controlhub-6376f | ✅ Production Ready | Internal observability, app health monitoring |

**Launch Status**: ✅ **ALL 8 APPS 100% READY** (verified February 17, 2026)  
**PWA Status**: ✅ **ALL APPS SUPPORT OFFLINE & HOME SCREEN INSTALLATION** (implemented February 17, 2026)

---

## 📁 Project Structure

```
alliedimpact/                 # Monorepo root
├── apps/                     # 8 Production Applications
│   ├── careerbox/           # Port 3003 | Job matching platform
│   ├── coinbox/             # Port 3000 | Financial services (385+ tests)
│   ├── controlhub/          # Port 3010 | Internal monitoring
│   ├── drivemaster/         # Port 3001 | Driver training
│   ├── edutech/             # Port 3007 | Educational courses
│   ├── myprojects/          # Port 3006 | Project management
│   └── sportshup/           # Port 3008 | Sports predictions
│
├── web/                      # Platform Web Presence
│   └── portal/              # Port 3005 | Main entry & dashboard
│
├── platform/                 # Shared Platform Services
│   ├── auth/                # Firebase Auth wrapper + user management
│   ├── billing/             # Subscription & payment logic
│   ├── entitlements/        # Access control & permissions
│   ├── notifications/       # Cross-platform notifications
│   ├── projects/            # Project management shared logic
│   └── shared/              # Shared types, utilities, constants
│
├── packages/                 # Shared Packages
│   ├── config/              # Shared configuration
│   ├── security/            # Security utilities
│   ├── types/               # TypeScript types
│   ├── ui/                  # Shared UI components
│   └── utils/               # Shared utilities
│
└── docs/                     # Platform Documentation
    ├── ALLIED_IMPACT_PLATFORM_MODEL.md
    ├── PLATFORM_AND_PRODUCTS.md
    ├── ARCHITECTURE_AND_SECURITY.md
    ├── DEVELOPMENT_AND_SCALING_GUIDE.md
    └── LAUNCH_READINESS_REPORT_FEB_2026.md
```

---

## 📚 Comprehensive Documentation
**Essential Reading** (5 core documents):

| Document | Description |
|----------|-------------|
| **[Platform Architecture](docs/PLATFORM_ARCHITECTURE.md)** | Complete architectural reference: conceptual model, technical architecture, security, integration patterns |
| **[Products Catalog](docs/PRODUCTS_CATALOG.md)** | All 8 apps: features, PWA support, tech stack, integration, current status |
| **[Developer Guide](docs/DEVELOPER_GUIDE.md)** | Complete development guide: setup, adding apps, UI consistency, testing, deployment |
| **[Launch Readiness](docs/LAUNCH_READINESS.md)** | February 25 launch status, app readiness, pre-launch checklist, monitoring plan |
| **[PWA Implementation](docs/PWA_IMPLEMENTATION_COMPLETE.md)** | Progressive Web App setup across all platforms (Feb 17, 2026)atterns |
| **[Launch Readiness](LAUNCH_READINESS_REPORT_FEB_2026.md)** | February 25 launch status, testing, deployment plan |

---

## 💻 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (100% type coverage)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: React Hooks, Context API
- **Internationalization**: next-intl (multi-language support)

### Backend
- **Authentication**: Firebase Auth (SSO across all apps)
- **Database**: Firestore (per-app databases, isolated)
- **Storage**: Firebase Storage
- **Functions**: Firebase Cloud Functions
- **APIs**: Next.js API Routes (serverless)

### Infrastructure
- **Hosting**: Vercel (all 8 apps + portal)
- **Monorepo**: pnpm workspaces + Turborepo
- **CI/CD**: GitHub Actions
- **Monitoring**: Firebase Crashlytics, custom logging
- **Testing**: Jest, Playwright (CoinBox: 385+ tests)

### Platform Services
- **Billing**: Stripe integration (`@allied-impact/billing`)
- **Entitlements**: Custom access control (`@allied-impact/entitlements`)
- **Notifications**: Cross-platform alerts
- **Security**: Firestore security rules, environment-based configs

---

## 🚀 Getting Started

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

# Copy environment templates for each app
cp apps/coinbox/.env.example apps/coinbox/.env.local
cp apps/careerbox/.env.example apps/careerbox/.env.local
cp web/portal/.env.example web/portal/.env.local
# ... repeat for all apps

# Configure Firebase credentials in each .env.local file
```

### Running Apps Locally

#### Portal (Main Dashboard)
```bash
cd web/portal
pnpm dev
# Opens on http://localhost:3005
```

#### Individual Apps
```bash
# CoinBox (P2P Finance)
cd apps/coinbox
pnpm dev
# http://localhost:3000

# CareerBox (Job Matching)
cd apps/careerbox
pnpm dev
# http://localhost:3003

# DriveMaster (Driver Training)
cd apps/drivemaster
pnpm dev
# http://localhost:3001

# EduTech (Educational Courses)
cd apps/edutech
pnpm dev
# http://localhost:3007

# SportsHub (Sports Predictions)
cd apps/sportshup
pnpm dev
# http://localhost:3008

# ControlHub (Internal Monitoring)
cd apps/controlhub
pnpm dev
# http://localhost:3010
```

#### Run Multiple Apps Simultaneously
```bash
# From monorepo root using Turborepo
pnpm dev --filter=@allied-impact/portal
pnpm dev --filter=@allied-impact/coinbox
pnpm dev --filter=@allied-impact/careerbox
```

### Firebase Emulators (Local Development)
```bash
# Start Firebase emulators (Auth, Firestore)
firebase emulators:start

# Emulators run on:
# - Auth: http://localhost:9099
# - Firestore: http://localhost:8080
# - Functions: http://localhost:5001
```

---

## 🔐 Authentication & Single Sign-On

### How Users Access the Platform

#### Option A: Via Main Portal
```
1. User visits alliedimpact.co.za
2. Logs in once (Firebase Auth)
3. Lands on unified dashboard
4. Sees all apps they have entitlements to
5. Clicks app card → navigates to app with SSO
```

#### Option B: Direct App Access
```
1. User visits coinbox.alliedimpact.co.za directly
2. Logs in with same Firebase credentials
3. App verifies entitlements
4. Enters app (can navigate back to dashboard)
```

### Key Security Principles
- **One Account, All Apps**: Single Firebase identity across the ecosystem
- **Entitlement-Based Access**: Apps verify permissions before granting access
- **Isolated Databases**: Each app has its own Firestore collections
- **No Cross-App Data Sharing**: Apps cannot access each other's data
- **Defensive Security Rules**: Firestore rules prevent unauthorized access

---

## 🏗️ Deployment

### Production Environment
```
Production URLs:
- alliedimpact.co.za                    (Portal)
- coinbox.alliedimpact.co.za           (CoinBox)
- myprojects.alliedimpact.co.za        (MyProjects)
- careerbox.alliedimpact.co.za         (CareerBox)
- drivemaster.alliedimpact.co.za       (DriveMaster)
- edutech.alliedimpact.co.za           (EduTech)
- sportshub.alliedimpact.co.za         (SportsHub)
- controlhub.alliedimpact.co.za        (ControlHub - Internal)
```

### Deployment Process (Per App)
```bash
# Deploy to Vercel
cd apps/coinbox
vercel --prod

# Deploy Firestore security rules
firebase deploy --only firestore:rules --project coinbox-ddc10

# Deploy all Firebase resources
firebase deploy --project coinbox-ddc10
```

### CI/CD Pipeline
- **Auto-deploy**: Push to `main` → staging deployment
- **Production**: Manual approval required
- **Testing**: Automated tests run before deployment
- **Monitoring**: Post-deployment health checks

---

## 📅 February 25, 2026 Launch

### Launch Status: ✅ **GO FOR LAUNCH**

**All Critical Blockers Resolved**:
- ✅ SportsHub authentication implemented
- ✅ CareerBox backend APIs connected
- ✅ EduTech billing integration complete
- ✅ DriveMaster error logging implemented
- ✅ All Firestore security rules deployed
- ✅ Port conflicts resolved
- ✅ Test routes removed from production

**Launch Day Schedule** (February 25):
```
09:00 AM - Deploy Portal
09:15 AM - Deploy CoinBox
09:30 AM - Deploy MyProjects
09:45 AM - Deploy ControlHub
10:00 AM - Deploy DriveMaster
10:15 AM - Deploy EduTech
10:30 AM - Deploy SportsHub
10:45 AM - Deploy CareerBox
11:00 AM - Verify all apps, SSO, monitoring
12:00 PM - Send launch announcement
```

**Post-Launch Monitoring**:
- Real-time error tracking
- User signup flow monitoring
- Performance metrics (response times, bundle sizes)
- Support ticket triage (critical bugs < 24 hours)

---

## 🧠 Architecture Principles

### Platform Layer (`platform/`)
**Responsibilities**:
- User authentication (Firebase wrapper)
- Subscription & billing management
- Entitlement verification
- Cross-app notifications
- Shared types and utilities

**Does NOT**:
- Contain app-specific business logic
- Access app databases directly
- Make app-level decisions

### App Layer (`apps/`)
**Responsibilities**:
- App-specific business logic
- App-specific database schemas (Firestore collections)
- App-specific UI/UX
- App-specific workflows

**Does NOT**:
- Duplicate authentication systems
- Bypass platform entitlements
- Share databases with other apps

### Key Principle: **Separation of Concerns**
```
Platform = Identity + Access Control + Shared Services
Apps = Business Logic + Data + UI
Firebase = Auth Provider + Real-time DB + Storage
```

---

## 🤝 Contributing

### Development Workflow
1. **Read Documentation**: All platform docs + specific app README
2. **Create Feature Branch**: `feature/app-name-description`
3. **Follow Patterns**: Reference CoinBox as gold standard (385+ tests)
4. **Write Tests**: Unit tests for business logic required
5. **Open Pull Request**: Detailed description, link to issue
6. **Code Review**: Minimum 1 approval required
7. **Merge & Deploy**: Auto-deploy to staging

### Code Quality Standards
- **TypeScript**: 100% type coverage, no `any` types
- **Testing**: Unit tests for critical paths, E2E for user flows
- **Security**: Firestore rules for all collections, entitlement checks
- **Documentation**: Inline comments, README per app
- **Git Commits**: Semantic commit messages

### ✅ DO:
- Reuse platform services (`@allied-impact/auth`, `@allied-impact/entitlements`, `@allied-impact/billing`)
- Check entitlements before granting app access
- Write comprehensive tests (reference CoinBox's 385+ tests)
- Document architectural decisions
- Follow existing UI patterns (Tailwind + shadcn/ui)

### ❌ DON'T:
- Rewrite production apps (CoinBox, MyProjects, CareerBox, etc.)
- Create new authentication systems per app
- Duplicate entitlement logic
- Share databases between apps
- Bypass security rules
- Add features without user validation

---

## 🎯 Quick Start for New Developers

### Week 1: Onboarding
**Day 1-2**: Environment Setup
- Clone repo, install dependencies (`pnpm install`)
- Set up Firebase configs for local development
- Run Portal and CoinBox locally
- Explore unified dashboard and SSO flow

**Day 3-4**: Documentation Deep Dive
- Read all 5 platform docs (README + 4 comprehensive docs)
- Study `platform/` shared services architecture
- Review CoinBox as reference implementation (best practices, testing)
- Understand Firebase hybrid model (auth + Firestore + storage)

**Day 5**: First Contribution
- Pick a "good first issue" from project board
- Create feature branch, implement change
- Write tests, open PR with detailed description
- Get code review, iterate, merge

### Week 2: Feature Development
- Pick app-specific task from sprint backlog
- Implement feature using platform services
- Write unit tests + E2E tests (if applicable)
- Update app README if adding new functionality
- Deploy to staging for QA review

---

## 📞 Support & Contact

- **Technical Issues**: GitHub Issues (label by app: `coinbox`, `careerbox`, etc.)
- **Platform Questions**: platform@alliedimpact.co.za
- **Business Inquiries**: info@alliedimpact.co.za
- **Security Concerns**: security@alliedimpact.co.za

---

## 📄 License

**Proprietary** - © 2024-2026 Allied iMpact  
All rights reserved. Not for public distribution.

---

## 📊 Platform Metrics

**Total Applications**: 8 production-ready apps  
**Total Tests**: 385+ (CoinBox alone)  
**Supported Languages**: English, Zulu, Xhosa (via next-intl)  
**Firebase Projects**: 6 isolated projects  
**Development Ports**: 3000-3010  
**Launch Date**: February 25, 2026  
**Monorepo Packages**: 13 (5 platform + 8 apps)

**Code Quality**:
- TypeScript: 100% coverage
- No critical vulnerabilities
- All Firestore rules deployed
- All critical TODOs resolved

---

**Last Updated**: February 17, 2026  
**Platform Version**: 2.1  
**Status**: ✅ **ALL 8 APPS PRODUCTION-READY - LAUNCHING FEBRUARY 25, 2026**
