# 📁 Directory Structure - Before & After Comparison

**Document**: Visual Comparison of Coin Box (Current) vs Allied iMpact (Future)  
**Date**: December 15, 2025

---

## 📊 CURRENT STATE: Coin Box (Standalone)

```
C:\Users\iMpact SA\Desktop\alliedimpact\alliedimpact\apps\coinbox-ai\
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── api/                       # API endpoints
│   │   │   ├── auth/
│   │   │   ├── wallet/
│   │   │   ├── loans/
│   │   │   ├── p2p-crypto/
│   │   │   ├── notifications/
│   │   │   └── admin/
│   │   ├── dashboard/                 # User pages
│   │   ├── auth/                      # Login/signup
│   │   └── page.tsx                   # Homepage
│   │
│   ├── lib/                           # Business logic
│   │   ├── auth-service.ts
│   │   ├── membership-service.ts
│   │   ├── wallet-service.ts
│   │   ├── loan-service.ts
│   │   ├── p2p-crypto/
│   │   ├── ai-service.ts
│   │   └── notification-service.ts
│   │
│   ├── components/                    # React components
│   │   ├── ui/
│   │   ├── AuthProvider.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── contexts/                      # React contexts
│   ├── hooks/                         # Custom hooks
│   └── types/                         # TypeScript types
│
├── functions/                         # Firebase Cloud Functions
│   └── src/
│       ├── p2p/
│       ├── wallet/
│       └── kyc/
│
├── config/
│   └── firebase.ts                    # Firebase config
│
├── firestore.rules                    # Security rules
├── package.json
└── README.md

TOTAL: ~50,000 lines of code
DATABASE: Firebase Firestore only
USERS: All in one place
PRODUCTS: Just Coin Box
```

**Characteristics:**
- ✅ Simple structure
- ✅ Everything in one place
- ✅ Easy to understand
- ❌ Can't add new products easily
- ❌ Tightly coupled
- ❌ Single point of failure

---

## 🚀 FUTURE STATE: Allied iMpact (Multi-Product Platform)

```
C:\Users\iMpact SA\Desktop\alliedimpact\
│
├── /platform                          # 🆕 SHARED PLATFORM LAYER
│   ├── /auth                          # Global authentication
│   │   ├── auth-provider.tsx
│   │   ├── auth-service.ts
│   │   ├── cosmos-auth-adapter.ts
│   │   └── types.ts
│   │
│   ├── /entitlements                  # 🆕 Product access control
│   │   ├── entitlement-service.ts
│   │   ├── product-guard.tsx
│   │   ├── middleware.ts
│   │   └── types.ts
│   │
│   ├── /billing                       # 🆕 Centralized billing
│   │   ├── billing-service.ts
│   │   ├── cosmos-transaction-log.ts
│   │   ├── payment-providers/
│   │   │   ├── paystack.ts
│   │   │   └── types.ts
│   │   └── types.ts
│   │
│   ├── /notifications                 # 🆕 Cross-product notifications
│   │   ├── notification-service.ts
│   │   ├── channels/
│   │   │   ├── email.ts
│   │   │   ├── sms.ts
│   │   │   └── push.ts
│   │   └── types.ts
│   │
│   ├── /audit                         # 🆕 Platform-wide audit
│   │   ├── audit-service.ts
│   │   ├── cosmos-logger.ts
│   │   └── types.ts
│   │
│   ├── /ai                            # 🆕 Shared AI services
│   │   ├── ai-service.ts
│   │   ├── chat-context/
│   │   ├── vector-search/
│   │   └── types.ts
│   │
│   └── /config
│       ├── cosmos-db.ts               # 🆕 Cosmos DB client
│       ├── firebase-platform.ts
│       └── constants.ts
│
├── /apps                              # 🆕 INDIVIDUAL PRODUCTS
│   │
│   ├── /coinbox                       # ♻️ EXISTING (MINIMAL CHANGES)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── api/               # Add product context checks
│   │   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── lib/                   # Coin Box business logic
│   │   │   │   ├── wallets/           # Unchanged
│   │   │   │   ├── loans/             # Unchanged
│   │   │   │   ├── investments/       # Unchanged
│   │   │   │   ├── p2p-crypto/        # Unchanged
│   │   │   │   ├── savings-jar/       # Unchanged
│   │   │   │   └── rules/             # Unchanged
│   │   │   │
│   │   │   ├── components/            # Unchanged
│   │   │   └── types/                 # Unchanged
│   │   │
│   │   ├── functions/                 # Unchanged
│   │   ├── config/
│   │   │   └── firebase-coinbox.ts    # Product-specific Firebase
│   │   ├── firestore.rules            # Unchanged
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── /drive-master                  # 🆕 NEW PRODUCT
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── api/
│   │   │   │   │   ├── subscriptions/
│   │   │   │   │   ├── lessons/
│   │   │   │   │   └── assessments/
│   │   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── lib/                   # Drive Master business logic
│   │   │   │   ├── subscriptions/
│   │   │   │   ├── lessons/
│   │   │   │   ├── assessments/
│   │   │   │   └── rules/
│   │   │   │
│   │   │   ├── components/
│   │   │   └── types/
│   │   │
│   │   ├── functions/
│   │   ├── config/
│   │   │   └── firebase-drivemaster.ts
│   │   ├── firestore.rules
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── /codetech                      # 🆕 NEW PRODUCT
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── lib/
│   │   │   │   ├── courses/
│   │   │   │   ├── certificates/
│   │   │   │   ├── pricing/
│   │   │   │   └── rules/
│   │   │   ├── components/
│   │   │   └── types/
│   │   ├── functions/
│   │   ├── config/
│   │   │   └── firebase-codetech.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── /cup-final                     # 🆕 NEW PRODUCT
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── lib/
│   │   │   │   ├── events/
│   │   │   │   ├── teams/
│   │   │   │   ├── fans/
│   │   │   │   ├── sponsors/
│   │   │   │   └── rules/
│   │   │   ├── components/
│   │   │   └── types/
│   │   ├── functions/
│   │   ├── config/
│   │   │   └── firebase-cupfinal.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── /umkhanyakude                  # 🆕 NEW PRODUCT
│       ├── src/
│       │   ├── app/
│       │   ├── lib/
│       │   │   ├── schools/
│       │   │   ├── content/
│       │   │   ├── admin/
│       │   │   └── rules/
│       │   ├── components/
│       │   └── types/
│       ├── functions/
│       ├── config/
│       │   └── firebase-umkhanyakude.ts
│       ├── package.json
│       └── README.md
│
├── /shared                            # 🆕 SHARED UTILITIES
│   ├── /ui                            # Common UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── (50+ components)
│   │
│   ├── /utils                         # Common utilities
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   └── /types                         # Shared TypeScript types
│       ├── platform.ts
│       └── common.ts
│
├── /web                               # 🆕 MAIN PORTAL/GATEWAY
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Allied iMpact homepage
│   │   │   ├── auth/                  # Platform login/signup
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   └── reset-password/
│   │   │   ├── dashboard/             # Product selector dashboard
│   │   │   │   └── page.tsx
│   │   │   └── products/              # Product landing pages
│   │   │       ├── coinbox/
│   │   │       ├── drive-master/
│   │   │       ├── codetech/
│   │   │       ├── cup-final/
│   │   │       └── umkhanyakude/
│   │   │
│   │   └── components/
│   │       ├── ProductSwitcher.tsx    # Switch between products
│   │       ├── GlobalNav.tsx          # Platform navigation
│   │       └── ProductCard.tsx        # Product tiles
│   │
│   ├── package.json
│   └── README.md
│
├── /docs                              # 🆕 PLATFORM DOCUMENTATION
│   ├── ARCHITECTURE.md
│   ├── MIGRATION_GUIDE.md
│   ├── API_REFERENCE.md
│   ├── SECURITY.md
│   ├── DEPLOYMENT.md
│   └── /products/
│       ├── COINBOX.md
│       ├── DRIVE_MASTER.md
│       ├── CODETECH.md
│       ├── CUP_FINAL.md
│       └── UMKHANYAKUDE.md
│
├── package.json                       # Root monorepo config
├── turbo.json                         # 🆕 Turborepo configuration
├── pnpm-workspace.yaml               # 🆕 PNPM workspace setup
├── ALLIED_IMPACT_TRANSFORMATION_PLAN.md
├── QUICK_REFERENCE_TRANSFORMATION.md
└── README.md                          # Platform overview

TOTAL: ~200,000 lines of code (estimated)
DATABASES: Azure Cosmos DB (platform) + Firebase Firestore (5x products)
USERS: Centralized in Cosmos DB, product data in Firebase
PRODUCTS: 5 independent products + 1 platform layer
```

**Characteristics:**
- ✅ Scalable architecture
- ✅ Product isolation
- ✅ Shared infrastructure
- ✅ Easy to add new products
- ✅ Enterprise-grade
- ✅ Multi-tenant ready

---

## 🔄 File Movement Summary

### Files That DON'T Move (Coin Box Stays Intact)
```
✅ src/lib/wallet-service.ts          → apps/coinbox/src/lib/wallets/
✅ src/lib/loan-service.ts            → apps/coinbox/src/lib/loans/
✅ src/lib/p2p-crypto/                → apps/coinbox/src/lib/p2p-crypto/
✅ src/lib/membership-service.ts      → apps/coinbox/src/lib/membership/
✅ src/components/                    → apps/coinbox/src/components/
✅ functions/                         → apps/coinbox/functions/
✅ firestore.rules                    → apps/coinbox/firestore.rules

All Coin Box files stay in place, just nested under /apps/coinbox/
```

### Files That Get Extracted & Shared
```
🔄 src/lib/auth-service.ts            → platform/auth/auth-service.ts
🔄 src/lib/notification-service.ts    → platform/notifications/notification-service.ts
🔄 src/lib/ai-service.ts              → platform/ai/ai-service.ts
🔄 src/components/ui/                 → shared/ui/
```

### New Files Created
```
🆕 platform/entitlements/entitlement-service.ts
🆕 platform/billing/billing-service.ts
🆕 platform/config/cosmos-db.ts
🆕 web/src/app/page.tsx (Allied iMpact homepage)
🆕 web/src/components/ProductSwitcher.tsx
🆕 apps/drive-master/ (entire new product)
🆕 apps/codetech/ (entire new product)
🆕 apps/cup-final/ (entire new product)
🆕 apps/umkhanyakude/ (entire new product)
```

---

## 📦 Package Structure (Monorepo)

### Root `package.json`
```json
{
  "name": "allied-impact",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "platform/*",
    "apps/*",
    "shared/*",
    "web"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "typescript": "^5.3.2"
  }
}
```

### Individual Product `package.json` (Example: Coin Box)
```json
{
  "name": "@allied-impact/coinbox",
  "version": "2.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 9004",
    "build": "next build",
    "start": "next start",
    "test": "vitest"
  },
  "dependencies": {
    "next": "^14.2.32",
    "react": "18.2.0",
    "@allied-impact/platform-auth": "workspace:*",
    "@allied-impact/platform-entitlements": "workspace:*",
    "@allied-impact/shared-ui": "workspace:*"
  }
}
```

---

## 🗄️ Database Structure Comparison

### BEFORE: Single Firebase Project
```
Firebase Project: "coinbox-ai"

Firestore Collections:
/users
/user_memberships
/wallets
/transactions
/loans
/investments
/p2p_crypto_orders
/referrals
/savings_jars
/tickets
/notifications

Storage:
/profile-images
/kyc-documents
/receipts

Auth:
- All users in one pool
```

### AFTER: Multi-Database Architecture

#### Azure Cosmos DB (Platform Layer)
```
Database: allied-impact-platform

Container: platform_users
Partition Key: /userId
- Global user profiles
- Email, phone, KYC status
- Roles, referral codes

Container: product_entitlements
Partition Key: /userId
- Product access control
- Active/inactive status per product
- Expiration dates

Container: platform_transactions
Partition Key: /userId
- All billing transactions
- Cross-product analytics
- Audit trail
```

#### Firebase Projects (One Per Product)

**Project 1: coinbox-firebase**
```
Collections (prefixed with "coinbox_"):
/coinbox_users
/coinbox_wallets
/coinbox_transactions
/coinbox_loans
/coinbox_investments
/coinbox_p2p_crypto_orders
/coinbox_savings_jars
/coinbox_referrals
```

**Project 2: drivemaster-firebase**
```
Collections (prefixed with "drivemaster_"):
/drivemaster_users
/drivemaster_subscriptions
/drivemaster_lessons
/drivemaster_assessments
/drivemaster_progress
```

**Project 3-5**: Similar structure for CodeTech, Cup Final, uMkhanyakude

---

## 🔐 Security Rules Comparison

### BEFORE: Single `firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    // ... 600+ lines of rules
  }
}
```

### AFTER: Multiple Rules Files + Platform Validation

#### Platform Layer (Cosmos DB)
- Built-in RBAC
- Azure AD integration
- Row-level security
- Automatic encryption

#### Product Layer (Firebase)
**apps/coinbox/firestore.rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Coin Box-specific rules
    match /coinbox_users/{userId} {
      allow read, write: if request.auth.uid == userId 
                         && hasProductAccess('coinbox'); // Check platform entitlement
    }
  }
}
```

**apps/drivemaster/firestore.rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Drive Master-specific rules
    match /drivemaster_users/{userId} {
      allow read, write: if request.auth.uid == userId 
                         && hasProductAccess('drivemaster');
    }
  }
}
```

---

## 🚀 Deployment Structure

### BEFORE: Single Vercel Deployment
```
Vercel Project: coinbox-ai
URL: https://coinbox-ai.vercel.app
Environment Variables: 15

Firebase Functions:
- coinbox-ai (Cloud Functions)

Firestore:
- coinbox-ai (Single database)
```

### AFTER: Multi-Deployment Architecture

#### Vercel Deployments
```
1. allied-impact-web (Portal)
   URL: https://alliedimpact.com
   
2. coinbox-app
   URL: https://coinbox.alliedimpact.com
   
3. drivemaster-app
   URL: https://drivemaster.alliedimpact.com
   
4. codetech-app
   URL: https://codetech.alliedimpact.com
   
5. cupfinal-app
   URL: https://cupfinal.alliedimpact.com
   
6. umkhanyakude-app
   URL: https://umkhanyakude.alliedimpact.com
```

#### Azure Resources
```
1. Cosmos DB Account: allied-impact-platform
   - Container: platform_users
   - Container: product_entitlements
   - Container: platform_transactions
   
2. Azure Monitor (Logging & Metrics)

3. Azure Application Insights (Performance)
```

#### Firebase Projects
```
1. coinbox-firebase
2. drivemaster-firebase
3. codetech-firebase
4. cupfinal-firebase
5. umkhanyakude-firebase
```

---

## 📊 Comparison Summary Table

| Aspect | Before (Coin Box) | After (Allied iMpact) |
|--------|-------------------|------------------------|
| **Products** | 1 | 5 |
| **Databases** | 1 (Firebase) | 6 (1 Cosmos + 5 Firebase) |
| **Lines of Code** | 50,000 | 200,000 (estimated) |
| **Deployments** | 1 | 6 |
| **Users** | Single pool | Centralized with entitlements |
| **Infrastructure Cost** | $320/mo | $1,750/mo |
| **Scalability** | Limited | Unlimited |
| **Multi-tenancy** | No | Yes |
| **Product Isolation** | N/A | Complete |
| **Development Teams** | 1 team | Multiple teams possible |
| **Time to Add New Product** | Weeks (rewrite) | Days (template) |

---

## ✅ Key Takeaways

### What Stays the Same
- ✅ Coin Box functionality 100% preserved
- ✅ Coin Box code mostly unchanged
- ✅ Coin Box users unaffected
- ✅ Coin Box performance maintained

### What Changes
- 🆕 Directory structure (nested under `/apps/coinbox/`)
- 🆕 Auth flows through platform layer
- 🆕 Product access checks added
- 🆕 Cosmos DB for global identity

### What Gets Added
- 🆕 Platform layer (shared services)
- 🆕 4 new products (Drive Master, CodeTech, Cup Final, uMkhanyakude)
- 🆕 Web portal (product selector)
- 🆕 Entitlement system
- 🆕 Centralized billing

---

**Document**: Directory Structure Comparison  
**Last Updated**: December 15, 2025  
**Status**: Planning Phase
