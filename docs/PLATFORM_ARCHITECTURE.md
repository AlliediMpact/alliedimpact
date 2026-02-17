# 🏗️ Allied iMpact – Platform Architecture

**Purpose**: Complete architectural reference - conceptual model, technical architecture, security, integration patterns  
**Last Updated**: February 17, 2026  
**Status**: Authoritative reference - all code must align with this document

---

## 📋 Table of Contents

1. [Platform Conceptual Model](#1-platform-conceptual-model)
2. [Technical Architecture](#2-technical-architecture)
3. [Firebase Hybrid Model](#3-firebase-hybrid-model)
4. [Authentication Architecture](#4-authentication-architecture)
5. [Security Principles](#5-security-principles)
6. [Integration Patterns](#6-integration-patterns)

---

## 1. Platform Conceptual Model

### What Allied iMpact Is

Allied iMpact is a **multi-sector digital impact platform** delivering value through three business models:

#### A. Subscription Products (Revenue-generating)
Ready-made applications users subscribe to:
- **CoinBox** - P2P financial platform (loans, investments, crypto trading)
- **CareerBox** - Job matching & recruitment platform
- **DriveMaster** - Driver training & certification
- **EduTech** - Educational courses with premium plans
- **SportsHub** - Sports predictions & voting

**Characteristics**: Monthly/yearly subscriptions, self-service signup, usage-based limits

#### B. Impact/Sponsored Products (Social value)
Free or sponsored access for social good:
- **Community programs** - Funded by grants/sponsors
- **Educational initiatives** - Free to end users

**Characteristics**: Free to users, institutionally funded, social impact focus

#### C. Custom/Project-Based Solutions (Client services)
Bespoke platforms for specific clients:
- **MyProjects** - Project management for custom solutions
- **Client platforms** - Custom builds
- **Licensed IP** - White-label solutions

**Characteristics**: Contract-based, milestone-driven, project lifecycle access

### User Archetypes

**Key Concept**: Archetypes are LABELS describing user roles, NOT separate systems.

**Platform Archetypes** (Managed by Allied iMpact):
- `INDIVIDUAL` - Standard user consuming apps → Individual Dashboard
- `ADMIN` - Platform administrator → Admin Dashboard
- `SUPER_ADMIN` - Full platform control → Admin Dashboard

**App-Specific Archetypes** (Managed by Apps):
- `Learner` (DriveMaster, EduTech) → App-specific dashboard
- `Investor` (CoinBox) → App-specific dashboard
- `Sponsor` (SportsHub) → App-specific dashboard

**Multi-Archetype Example**:
A user might have:
- `INDIVIDUAL` → Subscribed to CoinBox (personal)
- `Learner` → Taking courses in DriveMaster
- Platform shows unified dashboard, apps show specialized views

### Entitlements Model

Access determined by **entitlements**, not hard-coded logic.

**How Entitlements Work**:
```
User → Has Entitlements → Gets Access to Apps

Entitlement Sources:
├── Subscription (user pays)
├── Sponsorship (organization pays)
├── Project membership (contract-based)
├── Administrative grant (platform admin)
└── Time-limited access (trials, campaigns)
```

**Key Principles**:
1. Billing MAY create entitlements (but not always)
2. Billing is NOT required for all entitlements
3. Entitlements are independent from payment status
4. Apps check entitlements before granting access
5. Platform manages entitlements centrally

### Product Independence

Each app is **independent and isolated**.

**Apps Share**:
- ✅ Identity (Firebase Auth - SSO)
- ✅ Entitlement checks (platform API)
- ✅ UI components (shared library)
- ✅ TypeScript types (shared package)

**Apps DON'T Share**:
- ❌ Business logic (each app owns rules)
- ❌ Databases (separate Firebase projects per app)
- ❌ Pricing models (each app sets own)
- ❌ Feature dependencies (no cross-app dependencies)

**Zero Shared Risk Principle**:
If CoinBox goes down → All other apps continue working ✅

---

## 2. Technical Architecture

### Microservices-Inspired Monorepo

```
┌─────────────────────────────────────────────────┐
│           Allied iMpact Platform                │
│   (Identity, Entitlements, Notifications)       │
└─────────────────┬───────────────────────────────┘
                  │ SSO + Entitlement Checks
          ┌───────┴───────┐
          │               │
    ┌─────▼─────┐   ┌────▼────┐   ┌──────▼───────┐
    │  CoinBox  │   │MyProjects│   │  CareerBox   │
    │  (App 1)  │   │  (App 2) │   │   (App 3)    │
    └─────┬─────┘   └────┬─────┘   └──────┬───────┘
          │              │                 │
    ┌─────▼──────┐ ┌────▼──────┐   ┌──────▼────────┐
    │ Firebase   │ │ Firebase  │   │   Firebase    │
    │ coinbox-*  │ │myprojects-*│   │ careerbox-*   │
    └────────────┘ └───────────┘   └───────────────┘
```

### Architectural Layers

1. **Platform Layer**: Identity + access control + shared services
2. **App Layer**: Business logic + data + UI (8 independent apps)
3. **Firebase Layer**: Auth + real-time database + storage
4. **Deployment Layer**: Vercel (hosting) + GitHub Actions (CI/CD)

### Monorepo Structure

```
alliedimpact/
├── apps/               # 8 Independent Applications
│   ├── careerbox/     # Job platform
│   ├── coinbox/       # P2P financial
│   ├── controlhub/    # Internal monitoring
│   ├── drivemaster/   # Driver training
│   ├── edutech/       # Educational courses
│   ├── myprojects/    # Project management
│   └── sports-hub/    # Sports predictions
│
├── web/               # Platform Web
│   └── portal/        # Unified dashboard
│
├── platform/          # Shared Platform Services
│   ├── auth/         # Authentication wrapper
│   ├── billing/      # Subscription & payment
│   ├── entitlements/ # Access control
│   ├── notifications/# Cross-platform alerts
│   └── shared/       # Shared utilities
│
└── packages/          # Shared Packages
    ├── config/       # Design tokens
    ├── types/        # TypeScript types
    ├── ui/           # UI components
    └── utils/        # Utilities
```

### Key Principles

1. **Strict Isolation**: Apps cannot access each other's data
2. **Independent Deployment**: Each app deploys separately
3. **Shared Services**: Platform provides common infrastructure
4. **Type Safety**: 100% TypeScript coverage
5. **Consistent UI**: Shared component library

---

## 3. Firebase Hybrid Model

### What "Hybrid" Means

Firebase is used **strategically**, not comprehensively:

**Firebase Handles**:
- ✅ Authentication (identity provider)
- ✅ Real-time updates (Firestore listeners)
- ✅ File storage (Firebase Storage)
- ✅ Serverless functions (background jobs)

**Firebase Does NOT Handle**:
- ❌ Business logic (apps validate)
- ❌ Business rules enforcement (apps decide)
- ❌ Complex authorization (entitlements service)

### The Rule: Firebase is Infrastructure, NOT Authority

```typescript
// ✅ CORRECT: App validates, Firebase stores
async function createLoan(data: LoanData) {
  // App validates business rules
  if (data.amount > getUserLoanLimit(userId)) {
    throw new Error('Loan exceeds limit');
  }
  
  // Firebase stores the result
  await addDoc(collection(firestore, 'loans'), {
    ...data,
    createdAt: serverTimestamp()
  });
}

// ❌ WRONG: Don't rely on Firestore rules for business logic
```

### Firebase Projects Per App

**7 Firebase Projects**:
1. `allied-impact-platform` (Portal + MyProjects shared)
2. `coinbox-ddc10` (CoinBox)
3. `careerbox-64e54` (CareerBox)
4. `drivemaster-513d9` (DriveMaster)
5. `edutech-4f548` (EduTech)
6. `sportshub-526df` (SportsHub)
7. `controlhub-6376f` (ControlHub)

**Why Separate Projects**:
- Data isolation (apps can't access each other)
- Security boundaries
- Independent scaling
- Disaster recovery

---

## 4. Authentication Architecture

### Firebase Auth as Identity Provider

**Login Flow**:
```
1. User enters email/password
2. Firebase Auth validates credentials
3. Firebase returns: { uid, email, emailVerified }
4. App fetches user profile from Firestore
5. Profile includes: { archetypes, subscriptions, metadata }
6. App grants access based on entitlements
```

### Platform Auth Service

Located in: `platform/auth/`

```typescript
// Platform wraps Firebase Auth
import { signIn, signUp } from '@allied-impact/auth';

// All apps use this, not Firebase directly
const user = await signIn(email, password);

// Auto-creates user profile in Firestore:
// users/{uid} = {
//   email, name, archetypes, subscriptions, createdAt
// }
```

**Why Wrap Firebase Auth**:
1. Consistency across all apps
2. Auto-create user profiles
3. Assign default archetypes
4. Audit log auth events
5. Future-proof (can swap providers)

### Single Sign-On (SSO)

**How SSO Works**:
```
1. User logs in to Portal (alliedimpact.com)
2. Firebase session saved in cookie
3. User clicks "Open CoinBox"
4. CoinBox checks Firebase session
5. If valid → User logged in automatically
6. If invalid → Redirect to login
```

---

## 5. Security Principles

### Defense in Depth

**Security Layers**:
1. **Authentication**: Firebase Auth (email/password, OAuth)
2. **Entitlements**: Server-side access checks
3. **Firestore Rules**: Database-level permissions
4. **API Validation**: All inputs validated
5. **Environment Isolation**: Separate dev/staging/prod

### App Isolation

**Critical Principle**: Apps CANNOT access each other's data

**Enforced By**:
- Separate Firebase projects per app
- Firestore security rules (user can only access own data)
- No shared databases
- API boundaries

### Firestore Security Rules Pattern

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // User profiles
    match /coinbox_users/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }
    
    // Default deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Environment Variables

**Never Commit**:
- ❌ `.env.local` files (ignored by git)
- ❌ Firebase service account keys
- ❌ API secrets (Paystack, Stripe, etc.)

**Safe to Commit**:
- ✅ `.env.example` files (templates)
- ✅ Public Firebase config (API keys, project IDs)

---

## 6. Integration Patterns

### Platform → App Integration

**Pattern 1: SSO Login**
```
1. User logs in via Portal
2. Portal creates Firebase session
3. User clicks app link
4. App validates Firebase session
5. App fetches entitlements
6. App grants/denies access
```

**Pattern 2: Entitlement Check**
```typescript
// In any app
import { hasEntitlement } from '@allied-impact/entitlements';

const canAccess = await hasEntitlement(userId, 'coinbox');

if (!canAccess) {
  redirect('/subscribe/coinbox');
}
```

**Pattern 3: Cross-App Notifications**
```typescript
// In CoinBox (send notification)
import { sendNotification } from '@allied-impact/notifications';

await sendNotification({
  userId: investorId,
  type: 'investment_completed',
  title: 'Investment Successful',
  message: 'Your R5,000 investment is now active',
  link: '/investments'
});

// In Portal/MyProjects (receive notification)
// Notifications appear in unified notification center
```

### App → Platform Integration

**Apps Never Call Each Other Directly**:
- ❌ CoinBox cannot call DriveMaster API
- ✅ Apps only call platform services (auth, entitlements, notifications)

**Platform Services Available**:
- `@allied-impact/auth` - Authentication
- `@allied-impact/entitlements` - Access control
- `@allied-impact/billing` - Subscriptions
- `@allied-impact/notifications` - Alerts
- `@allied-impact/types` - Shared types
- `@allied-impact/ui` - UI components
- `@allied-impact/utils` - Utilities

### Shared Component Usage

```typescript
// Import shared UI components
import { Button, Card, Logo, Footer } from '@alliedimpact/ui';

// Use design tokens
import { colors, spacing } from '@allied-impact/config';

// All apps use consistent UI patterns
```

---

## 🎯 Architecture Decision Records (ADRs)

### ADR-001: Monorepo vs Multi-Repo
**Decision**: Monorepo with pnpm workspaces  
**Rationale**: Shared code reuse, atomic commits, easier refactoring  
**Trade-offs**: Larger repository, but better code sharing

### ADR-002: Firebase Hybrid Model
**Decision**: Strategic Firebase use (auth, database), not comprehensive  
**Rationale**: Balance speed with control, avoid vendor lock-in  
**Trade-offs**: More code, but more flexibility

### ADR-003: Per-App Firebase Projects
**Decision**: Separate Firebase project per app (7 total)  
**Rationale**: Data isolation, security boundaries, independent scaling  
**Trade-offs**: More projects to manage, but better isolation

### ADR-004: Platform Services as Shared Packages
**Decision**: Auth, entitlements, billing as workspace packages  
**Rationale**: Consistent behavior, easier updates, type safety  
**Trade-offs**: Tighter coupling, but controlled interfaces

---

## 📊 Architecture Metrics

**Apps**: 8 production apps  
**Firebase Projects**: 7 projects  
**Shared Services**: 4 platform services  
**Shared Packages**: 5 packages  
**Technology Stack**: Next.js 14, TypeScript, Firebase, Tailwind CSS  
**Deployment**: Vercel (all apps)  
**CI/CD**: GitHub Actions  
**Launch Date**: February 25, 2026

---

**Last Updated**: February 17, 2026  
**Next Review**: March 2026 (post-launch)
