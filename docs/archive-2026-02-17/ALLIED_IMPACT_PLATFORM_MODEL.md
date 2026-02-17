# 🧠 Allied iMpact – Platform Model

**Purpose**: Define how the Allied iMpact platform should be understood and reasoned about.

**Audience**: Founders, Developers, Architects, AI Assistants (Copilot)

**Status**: Authoritative conceptual model - all architecture and code must align with this document.

---

## 1. What Allied iMpact Is

Allied iMpact is a **multi-sector digital impact platform** that delivers value through three business models:

### A. **Subscription Products** (Revenue-generating)
Ready-made applications users subscribe to:
- **Coin Box** - P2P financial platform
- **Drive Master** - Driver training
- **CodeTech** - Software learning

**Characteristics**:
- Monthly/yearly subscriptions
- Individual user access
- Self-service signup
- Usage-based limits

### B. **Impact/Sponsored Products** (Social value)
Free or sponsored access for social good:
- **uMkhanyakude** - High schools portal
- **Youth development** programs
- **Community sports** initiatives

**Characteristics**:
- Free to end users
- Funded by sponsors/grants
- Institutional agreements
- NOT tied to billing

### C. **Custom/Project-Based Solutions** (Client services)
Bespoke platforms for specific clients:
- **My Projects** - Project management
- **Client platforms** - Custom builds
- **Licensed IP** - White-label solutions

**Characteristics**:
- Contract-based
- Milestone-driven
- Project lifecycle access
- Not subscription-first

---

## 2. User Archetypes (Core Concept)

**IMPORTANT**: Archetypes are LABELS describing user roles. They are NOT separate systems.

### Platform Archetypes (Managed by Allied iMpact)

| Archetype | Description | Access |
|-----------|-------------|--------|
| **INDIVIDUAL** | Standard user consuming apps | Individual Dashboard |
| **ADMIN** | Platform administrator | Admin Dashboard |
| **SUPER_ADMIN** | Full platform control | Admin Dashboard |

### App-Specific Archetypes (Managed by Apps)

| Archetype | App | Dashboard Location |
|-----------|-----|-------------------|
| **Learner** | Drive Master, CodeTech | Inside app |
| **Investor** | Coin Box, Cup Final | Inside app |
| **Sponsor** | Cup Final, uMkhanyakude | Inside app |

### Multiple Archetype Example

A school principal might have:
- `INDIVIDUAL` → Subscribed to Coin Box (personal)
- `Learner` → Taking courses in Drive Master (sees learner dashboard inside app)
- `Sponsor` → Sponsoring students in uMkhanyakude (sees sponsor dashboard inside app)

**Platform shows**: Individual Dashboard  
**Apps show**: Their own specialized dashboards when entered

### Key Insight

- **Platform provides**: ONE unified dashboard (role-aware rendering)
- **Apps provide**: Their own specialized views
- **One user**: Can have multiple archetypes across platform and apps

---

## 3. Entitlements Model

Access to apps is determined by **entitlements**, not hard-coded logic.

### How Entitlements Work

```typescript
User → Has Entitlements → Gets Access to Apps

Entitlement Sources:
├── Subscription (user pays)
├── Sponsorship (organization pays)
├── Project membership (contract-based)
├── Administrative grant (platform admin)
└── Time-limited access (trials, campaigns)
```

### Key Principles

1. **Billing MAY create entitlements** (but not always)
2. **Billing is NOT required** for all entitlements
3. **Entitlements are independent** from payment status
4. **Apps check entitlements** before granting access
5. **Platform manages entitlements** centrally

### Example: Coin Box Access

```
Scenario A: Paid Subscription
User pays R550/month → Entitlement created → Access granted

Scenario B: Sponsored Access
NGO sponsors 100 students → 100 entitlements created → Access granted (no user payment)

Scenario C: Trial Access
User starts 7-day trial → Time-limited entitlement → Access granted → Expires after 7 days
```

---

## 4. Dashboard Philosophy

The Allied iMpact Dashboard is a **universal control center**, not an app launcher.

### Core Principles

1. **One Dashboard Codebase**
   - Single UI that adapts to user
   - No separate dashboards per archetype
   - Role-aware rendering

2. **Context-Aware Sections**
   - Shows only what's relevant
   - Based on archetypes + entitlements
   - Dynamic section visibility

3. **Clear Separation**
   ```
   Dashboard Sections:
   ├── My Subscriptions (subscription products)
   ├── My Projects (custom solutions)
   ├── Impact Initiatives (sponsored access)
   └── Admin Controls (admins only)
   ```

4. **App Navigation**
   - Click app card → SSO to app
   - App opens in same tab or new tab
   - Persistent login across apps

### Dashboard Adapts To:

- **Who the user is** (archetypes)
- **What they have access to** (entitlements)
- **Why they are on the platform** (context)

---

## 5. Product Independence

Each app is **independent and isolated**.

### What Apps Share

✅ **Identity** (Firebase Auth)  
✅ **Entitlement checks** (platform API)  
✅ **UI components** (optional shared library)  
✅ **TypeScript types** (shared types package)

### What Apps DON'T Share

❌ **Business logic** (each app owns its rules)  
❌ **Databases** (separate Firestore per app)  
❌ **Pricing models** (each app sets its own)  
❌ **Feature dependencies** (no app depends on another)

### Key Principle: **Zero Shared Risk**

```
If Coin Box goes down:
├── Drive Master continues working ✅
├── My Projects continues working ✅
├── Dashboard shows Coin Box as unavailable ✅
└── Other apps are NOT affected ✅
```

---

## 6. Firebase Hybrid Model

Firebase is used **strategically**, not as a crutch.

### What Firebase Handles

✅ **Authentication** (identity provider)  
✅ **Real-time updates** (Firestore listeners)  
✅ **File storage** (Firebase Storage)  
✅ **Serverless functions** (Firebase Functions)

### What Firebase Does NOT Handle

❌ **Business logic** (apps own this)  
❌ **Business rules enforcement** (apps validate)  
❌ **Source of truth** (apps decide, Firebase stores)  
❌ **Primary backend** (apps have logic layer)

### Key Principle: **Firebase is Infrastructure, NOT Authority**

```
Correct Flow:
User action → App validates business rules → App updates Firebase → Real-time sync

WRONG Flow:
User action → Firebase validates business rules (❌ NO!)
```

---

## 7. Coin Box Reference System

**Coin Box is PRODUCTION and must NEVER be rewritten.**

### Why Coin Box Matters

1. **Reference Implementation**: Shows correct platform integration
2. **Proven Patterns**: Auth, entitlements, real-time data
3. **Complexity Benchmark**: If Coin Box works, pattern is scalable
4. **Financial Sensitivity**: Any changes risk money/data loss

### How to Use Coin Box

✅ **Study it** (learn patterns)  
✅ **Reference it** (copy architecture)  
✅ **Link to it** (document similarities)  

❌ **Modify it** (production system)  
❌ **Depend on it** (no cross-app dependencies)  
❌ **Replicate its business logic** (each app is unique)

---

## 8. Platform vs. Apps Boundaries

### Platform Responsibilities

```typescript
platform/
├── auth/          // Firebase Auth wrapper + user management
├── billing/       // Subscription handling (generic)
├── entitlements/  // Access control checks
├── notifications/ // Cross-app notifications
└── shared/        // Types, constants, utilities
```

**Platform DOES**:
- Manage user accounts
- Handle subscriptions (generic)
- Check entitlements
- Send notifications
- Provide shared utilities

**Platform DOES NOT**:
- Contain app business logic
- Access app databases directly
- Make app-level decisions
- Enforce app-specific rules

### App Responsibilities

```typescript
apps/coinbox/
├── src/          // Coin Box-specific logic
├── components/   // Coin Box-specific UI
├── lib/          // Coin Box-specific utilities
└── firestore.rules // Coin Box-specific security
```

**Apps DO**:
- Implement business logic
- Manage app-specific data
- Define app-specific UI/UX
- Enforce app-specific rules
- Handle app-specific workflows

**Apps DO NOT**:
- Create their own auth systems
- Bypass platform entitlements
- Share databases with other apps
- Duplicate platform services

---

## 9. Scaling Principles

### Horizontal Scaling (Apps)

Each app scales independently:
- **Own infrastructure** (Vercel, Firebase)
- **Own database** (Firestore collection)
- **Own resources** (storage, functions)
- **Own limits** (rate limits, quotas)

### Vertical Scaling (Platform)

Platform services scale centrally:
- **Auth service** (handles all login)
- **Entitlement service** (checks all access)
- **Notification service** (sends to all apps)

### Key Insight

```
Adding 1 million users to Coin Box:
├── Coin Box scales its infrastructure ✅
├── Platform auth scales automatically ✅
├── Other apps are NOT affected ✅
└── No platform-level bottleneck ✅
```

---

## 10. Decision-Making Framework

When building or modifying:

### Ask These Questions

1. **Does this belong in the platform or app?**
   - If it's identity/access → Platform
   - If it's app-specific → App

2. **Does this duplicate existing functionality?**
   - If yes → Reuse existing
   - If no → Proceed

3. **Does this create shared risk?**
   - If yes → Redesign to isolate
   - If no → Proceed

4. **Does this require modifying Coin Box?**
   - If yes → Find alternative approach
   - If no → Proceed

5. **Is this speculative or needed now?**
   - If speculative → Don't build
   - If needed → Document and build

---

## 11. Mental Models for Stakeholders

### For Founders

Think of Allied iMpact as:
```
A shopping mall (platform) with independent stores (apps).

- Mall provides: Parking, security, common areas
- Stores provide: Products, services, experiences
- Shoppers: One entrance, visit multiple stores
```

### For Developers

Think of Allied iMpact as:
```
A microservices architecture with centralized identity.

- Platform = Auth + gateway
- Apps = Independent services
- Firebase = Shared data layer
```

### For AI Assistants (Copilot)

Think of Allied iMpact as:
```
A monorepo with strict boundaries.

- Reuse platform services
- Don't cross app boundaries
- Don't rewrite production code
- Follow existing patterns
```

---

## 12. Success Metrics

### Platform Success

- ✅ SSO working across all apps
- ✅ Zero downtime on identity service
- ✅ Entitlements respond <100ms
- ✅ Dashboard loads <2 seconds

### App Success

- ✅ App works independently
- ✅ No cross-app dependencies
- ✅ Business logic owned by app
- ✅ Can scale without platform changes

---

## 13. Anti-Patterns (Avoid These)

❌ **Shared Databases**: Apps sharing Firestore collections  
❌ **Cross-App Logic**: App A calling App B's logic  
❌ **Duplicate Auth**: Creating new auth per app  
❌ **Firebase Authority**: Using Firebase as business rule enforcer  
❌ **Speculative Systems**: Building for future "what-ifs"  
❌ **Rewriting Coin Box**: Modifying production financial system

---

## 14. Alignment Checklist

Before shipping any code, verify:

- [ ] Follows platform vs. app boundaries
- [ ] Uses platform auth (not custom)
- [ ] Checks entitlements before access
- [ ] Doesn't duplicate existing features
- [ ] Doesn't create cross-app dependencies
- [ ] Doesn't modify Coin Box
- [ ] Documented in app README
- [ ] Tested independently

---

**This document is AUTHORITATIVE. All platform and app code must align with these principles.**

---

**Last Updated**: January 6, 2026  
**Version**: 2.0  
**Status**: Authoritative
