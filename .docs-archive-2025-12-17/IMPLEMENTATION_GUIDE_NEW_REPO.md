# 🚀 IMPLEMENTATION GUIDE - New Repository Approach

**Project**: Allied iMpact Multi-Product Platform  
**Approach**: Fresh Repository (Firebase-Only)  
**Date**: December 16, 2025  
**Status**: Ready to Begin

---

## ✅ CONFIRMED DECISIONS

1. **New Repository** - Starting fresh, clean slate
2. **Firebase Only** - No Cosmos DB (simpler, lower cost)
3. **Independent Apps** - Each can be developed and deployed separately
4. **Clean Structure** - Monorepo with clear boundaries
5. **Senior Developer Approach** - Best practices, proper guidance

---

## 📊 UPDATED COST ESTIMATE (Firebase-Only)

### Monthly Infrastructure (Revised Down)
| Component | Cost |
|-----------|------|
| Firebase (5 projects) | $800 |
| Vercel Hosting (6 apps) | $100 |
| External APIs | $300 |
| **Total** | **$1,200/mo** (down from $1,750) |

**Savings**: $550/month by using Firebase only!

---

## 🏗️ STEP-BY-STEP IMPLEMENTATION

### ✅ STEP 1: Repository Setup (TODAY - 30 minutes)

We'll create the complete monorepo structure.

#### 1A: Initialize Git Repository

```powershell
# Navigate to project root
cd "C:\Users\iMpact SA\Desktop\alliedimpact"

# Initialize git (if not already done)
git init

# Create .gitignore
New-Item -ItemType File -Path ".gitignore"
```

#### 1B: Create Directory Structure

```powershell
# Platform services
New-Item -ItemType Directory -Path "platform\auth" -Force
New-Item -ItemType Directory -Path "platform\entitlements" -Force
New-Item -ItemType Directory -Path "platform\billing" -Force
New-Item -ItemType Directory -Path "platform\notifications" -Force
New-Item -ItemType Directory -Path "platform\shared" -Force

# Apps
New-Item -ItemType Directory -Path "apps\coinbox" -Force
New-Item -ItemType Directory -Path "apps\drive-master" -Force
New-Item -ItemType Directory -Path "apps\codetech" -Force
New-Item -ItemType Directory -Path "apps\cup-final" -Force
New-Item -ItemType Directory -Path "apps\umkhanyakude" -Force

# Shared packages
New-Item -ItemType Directory -Path "packages\ui" -Force
New-Item -ItemType Directory -Path "packages\types" -Force
New-Item -ItemType Directory -Path "packages\utils" -Force
New-Item -ItemType Directory -Path "packages\config" -Force

# Web portal
New-Item -ItemType Directory -Path "web" -Force

# Documentation
New-Item -ItemType Directory -Path "docs" -Force
```

#### 1C: Install PNPM (if not installed)

```powershell
# Check if pnpm is installed
pnpm --version

# If not installed:
npm install -g pnpm
```

---

### ✅ STEP 2: Copy Coin Box (TODAY - 1 hour)

We'll copy your existing Coin Box into the new structure.

```powershell
# Copy entire coinbox-ai into apps/coinbox
Copy-Item -Path ".\alliedimpact\apps\coinbox-ai\*" -Destination ".\apps\coinbox" -Recurse -Force
```

**Note**: We'll keep Coin Box 99% as-is, just update a few config files.

---

### ✅ STEP 3: Platform Foundation (Week 1)

Create shared platform services that all apps will use.

#### Platform Services We'll Build:
1. **Auth Service** - Extends Firebase Auth
2. **Entitlement Service** - Product access control (Firebase Firestore)
3. **Billing Service** - Shared payment logic
4. **Notification Service** - Email, SMS, Push
5. **Shared Config** - Firebase config, constants

---

## 🗄️ DATABASE ARCHITECTURE (Firebase-Only)

### Shared Platform Collections

```typescript
// Firebase Firestore Structure

/platform_users/{userId}
{
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  kycStatus: 'none' | 'pending' | 'verified';
  referralCode: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

/product_entitlements/{userId}
{
  userId: string;
  products: {
    coinbox: {
      active: boolean;
      activatedAt: Timestamp;
      membershipTier: 'basic' | 'ambassador' | 'vip' | 'business';
      expiresAt?: Timestamp;
    },
    drivemaster: {
      active: boolean;
      activatedAt?: Timestamp;
      subscriptionType?: 'free' | 'premium';
    },
    // ... other products
  }
}

/platform_transactions/{txId}
{
  id: string;
  userId: string;
  product: string;
  type: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Timestamp;
}
```

### Product-Specific Collections (Prefixed)

```typescript
// Coin Box Collections
/coinbox_users/{userId}
/coinbox_wallets/{userId}
/coinbox_transactions/{txId}
/coinbox_loans/{loanId}
/coinbox_investments/{investmentId}
/coinbox_p2p_crypto/{orderId}
/coinbox_savings_jars/{jarId}

// Drive Master Collections
/drivemaster_users/{userId}
/drivemaster_subscriptions/{subId}
/drivemaster_lessons/{lessonId}
/drivemaster_assessments/{assessmentId}

// etc...
```

---

## 📦 MONOREPO STRUCTURE (What We're Building)

```
/allied-impact
│
├── package.json              # Root package (Turborepo)
├── pnpm-workspace.yaml       # Workspace config
├── turbo.json                # Turborepo config
├── .gitignore
├── README.md
│
├── /platform                 # SHARED SERVICES
│   ├── /auth
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── auth-service.ts
│   │   │   ├── firebase-auth.ts
│   │   │   └── types.ts
│   │   └── tsconfig.json
│   │
│   ├── /entitlements
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── entitlement-service.ts
│   │   │   ├── product-guard.tsx
│   │   │   └── types.ts
│   │   └── tsconfig.json
│   │
│   ├── /billing
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── billing-service.ts
│   │   │   ├── paystack.ts
│   │   │   └── types.ts
│   │   └── tsconfig.json
│   │
│   └── /shared
│       ├── package.json
│       └── src/
│           ├── constants.ts
│           └── utils.ts
│
├── /apps                     # INDEPENDENT APPS
│   ├── /coinbox             # Coin Box (EXISTING)
│   │   ├── package.json     # Independent package
│   │   ├── next.config.js
│   │   ├── src/
│   │   ├── functions/
│   │   ├── firestore.rules
│   │   └── vercel.json      # Independent deployment
│   │
│   ├── /drive-master        # NEW
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── src/
│   │   └── vercel.json
│   │
│   └── ... (other apps)
│
├── /packages                 # SHARED CODE
│   ├── /ui                  # Shared UI components
│   │   ├── package.json
│   │   └── src/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── index.ts
│   │
│   ├── /types               # Shared TypeScript types
│   │   ├── package.json
│   │   └── src/
│   │       ├── platform.ts
│   │       ├── user.ts
│   │       └── index.ts
│   │
│   └── /config              # Shared config
│       ├── package.json
│       └── src/
│           ├── firebase.ts
│           └── constants.ts
│
└── /web                      # MAIN PORTAL
    ├── package.json
    ├── next.config.js
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx        # Homepage
    │   │   ├── auth/           # Login/signup
    │   │   ├── dashboard/      # Product selector
    │   │   └── products/       # Product info pages
    │   └── components/
    │       ├── ProductSwitcher.tsx
    │       └── GlobalNav.tsx
    └── vercel.json
```

---

## 🚀 INDEPENDENT DEPLOYMENT STRATEGY

Each app has its own `vercel.json` and can be deployed separately:

### Coin Box Deployment
```json
// apps/coinbox/vercel.json
{
  "name": "coinbox-alliedimpact",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@coinbox-firebase-api-key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@coinbox-firebase-auth-domain"
  }
}
```

### Deployment Commands
```powershell
# Deploy Coin Box only
cd apps/coinbox
vercel --prod

# Deploy Drive Master only
cd apps/drive-master
vercel --prod

# Deploy Web Portal only
cd web
vercel --prod
```

**Each app gets its own URL**:
- Coin Box: `coinbox.alliedimpact.com`
- Drive Master: `drivemaster.alliedimpact.com`
- Web Portal: `alliedimpact.com`

---

## 📋 NEXT IMMEDIATE ACTIONS

### Action 1: Create Directory Structure (5 minutes)
I'll create all the folders and base files.

### Action 2: Move Coin Box (15 minutes)
Copy your existing Coin Box into `apps/coinbox`.

### Action 3: Create Platform Services (Week 1)
Build the shared auth, entitlements, and billing services.

### Action 4: Update Coin Box Integration (Week 2)
Minimal changes to make Coin Box use platform services.

---

## 🎯 YOUR DECISION

**I'm ready to start creating the structure right now. Should I proceed with:**

### Option A: Full Setup (Recommended)
- ✅ Create complete directory structure
- ✅ Create all `package.json` files
- ✅ Create base configuration files
- ✅ Move Coin Box into new structure
- ✅ Initialize git
- **Time**: 30 minutes

### Option B: Step-by-Step
- ✅ Create directories first
- ⏸️ Review structure
- ✅ Then create files
- ⏸️ Review files
- ✅ Then move Coin Box
- **Time**: 1 hour (with reviews)

**Which approach do you prefer? Or do you have questions first?**

---

**Status**: ⏳ Awaiting your go-ahead to create the structure  
**Next Step**: Create monorepo structure  
**Time Required**: 30 minutes - 1 hour
