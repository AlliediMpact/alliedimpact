# 🔒 Allied iMpact – Architecture & Security

**Purpose**: Define technical architecture, security principles, and the Firebase hybrid model.

**Audience**: Developers, security engineers, architects, DevOps

**Status**: Authoritative technical reference

---

## 1. Architectural Overview

Allied iMpact uses a **microservices-inspired monorepo architecture** with strict boundaries.

```
┌─────────────────────────────────────────────────┐
│           Allied iMpact Platform                │
│   (Identity, Entitlements, Notifications)       │
└─────────────────┬───────────────────────────────┘
                  │ SSO + Entitlement Checks
          ┌───────┴───────┐
          │               │
    ┌─────▼─────┐   ┌────▼────┐   ┌──────▼───────┐
    │  Coin Box │   │My Projects  │Other Apps│
    │  (App 1)  │   │  (App 2)│   │ (App N)  │
    └─────┬─────┘   └────┬────┘   └──────┬───────┘
          │              │               │
    ┌─────▼──────┐ ┌────▼─────┐  ┌──────▼───────┐
    │ Firebase   │ │ Firebase │  │  Firebase    │
    │  coinbox-* │ │myprojects-*  │   app-*      │
    └────────────┘ └──────────┘  └──────────────┘
```

### Key Principles

1. **Platform Layer**: Identity + access control
2. **App Layer**: Business logic + data + UI
3. **Firebase Layer**: Auth + real-time + storage
4. **Strict Isolation**: Apps cannot access each other's data
5. **Independent Deployment**: Each app deploys separately

---

## 2. The Firebase Hybrid Model

### What "Hybrid" Means

Firebase is used **strategically**, not comprehensively:

✅ **Firebase Handles**:
- Authentication (identity provider)
- Real-time updates (Firestore listeners)
- File storage (Firebase Storage)
- Serverless functions (background jobs)

❌ **Firebase Does NOT Handle**:
- Business logic (apps validate)
- Business rules enforcement (apps decide)
- Primary source of truth (apps own logic)
- Complex authorization (entitlements service)

### Why Hybrid?

| Approach | Pros | Cons | Allied iMpact Choice |
|----------|------|------|---------------------|
| **Pure Firebase** | Fast setup, easy | Vendor lock-in, limited control | ❌ Too risky |
| **Pure Backend** | Full control | More infrastructure | ❌ Overkill |
| **Hybrid** | Best of both | Requires discipline | ✅ **Our approach** |

### The Rule: **Firebase is Infrastructure, NOT Authority**

```typescript
// ✅ CORRECT: App validates, Firebase stores
async function createLoan(data: LoanData) {
  // App validates business rules
  if (data.amount > getUserLoanLimit(userId)) {
    throw new Error('Loan exceeds limit');
  }
  
  // App calculates business logic
  const interestRate = calculateInterestRate(data);
  
  // Firebase stores the result
  await addDoc(collection(firestore, 'loans'), {
    ...data,
    interestRate,
    createdAt: serverTimestamp()
  });
}

// ❌ WRONG: Firebase validates business rules
// firestore.rules:
// allow create: if request.resource.data.amount <= getUserLimit(); // DON'T DO THIS
```

---

## 3. Authentication Architecture

### Firebase Auth as Identity Provider

```
User Login Flow:
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
import { initializeAuth, signUp, signIn } from '@allied-impact/auth';

// All apps use this, not Firebase directly
const user = await signIn(email, password);

// Creates user profile in Firestore:
// users/{uid} = {
//   email, name, archetypes, subscriptions, createdAt
// }
```

### Why Wrap Firebase Auth?

1. **Consistency**: All apps use same auth flow
2. **Profiles**: Auto-create user profiles in Firestore
3. **Archetypes**: Assign default archetypes on signup
4. **Audit**: Log auth events centrally
5. **Future-Proof**: Can swap auth provider if needed

---

## 4. Entitlements Architecture

### Entitlement Service

Located in: `platform/entitlements/`

```typescript
// Check if user has access to app
import { hasEntitlement } from '@allied-impact/entitlements';

const canAccessCoinBox = await hasEntitlement(userId, 'coinbox');

if (!canAccessCoinBox) {
  redirect('/subscribe/coinbox');
}
```

### Entitlement Sources

```typescript
// Firestore: entitlements/{entitlementId}
type Entitlement = {
  userId: string;
  productId: string;  // 'coinbox', 'drivemaster', etc.
  source: 'subscription' | 'sponsorship' | 'admin' | 'trial';
  expiresAt?: Date;   // Optional expiry
  limits?: Record<string, number>;  // App-specific limits
  metadata?: any;
};
```

### Entitlement Flow

```
1. User clicks "Open Coin Box"
2. Platform checks entitlements collection
3. Query: WHERE userId == currentUser AND productId == 'coinbox'
4. If found AND not expired → Grant access
5. If not found → Redirect to subscription page
```

### Why NOT Firebase Auth Custom Claims?

Firebase Auth custom claims have **4KB limit** and require re-login on updates.

Our approach:
- ✅ Unlimited entitlements per user
- ✅ Real-time updates (no re-login)
- ✅ Fine-grained control (limits, expiry)
- ✅ Audit trail (who granted, when, why)

---

## 5. Database Architecture

### Per-App Isolation

Each app has its own Firestore collections:

```
Firestore Structure:
├── users/{uid}                    # Platform (shared)
├── entitlements/{entitlementId}   # Platform (shared)
├── notifications/{notificationId} # Platform (shared)
│
├── coinbox-loans/{loanId}         # Coin Box only
├── coinbox-investments/{investId} # Coin Box only
├── coinbox-wallets/{walletId}     # Coin Box only
│
├── myprojects-projects/{projId}   # My Projects only
├── myprojects-milestones/{mileId} # My Projects only
├── myprojects-deliverables/{delId}# My Projects only
│
└── drivemaster-courses/{courseId} # Drive Master only
```

### Key Rules

1. **Namespace by app**: `{appname}-{entity}`
2. **No cross-app queries**: Apps can't read other apps' data
3. **Platform collections**: Shared (users, entitlements, notifications)
4. **Firestore rules**: Enforce app isolation

### Firestore Rules Philosophy

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read their own profile
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false;  // Only platform can write
    }
    
    // Coin Box collections
    match /coinbox-loans/{loanId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                      /* Business logic validates in app */;
      allow update, delete: if false;  // Handled by app logic
    }
    
    // The rule: DEFENSIVE, not authoritative
    // Apps validate business rules, Firestore prevents unauthorized access
  }
}
```

---

## 6. Security Principles

### Principle 1: **Zero Trust**

```
✅ DO:
- Validate all inputs (client and server)
- Check entitlements before every operation
- Use Firestore rules as last line of defense
- Log all sensitive operations

❌ DON'T:
- Trust client data
- Assume user has access
- Rely only on Firestore rules
- Skip server-side validation
```

### Principle 2: **Defense in Depth**

```
Security Layers:
1. Client validation (UX, fast feedback)
2. Server validation (Firebase Functions)
3. Firestore rules (data access control)
4. Monitoring & alerts (detect anomalies)
```

### Principle 3: **App Isolation**

```
✅ Coin Box can:
- Read/write coinbox-* collections
- Read users collection (own profile)
- Read entitlements (own entitlements)

❌ Coin Box cannot:
- Read/write myprojects-* collections
- Read other users' private data
- Bypass entitlement checks
- Access Drive Master's data
```

### Principle 4: **Least Privilege**

```
User Permissions:
- Read own data ✅
- Write own data (with validation) ✅
- Read all data ❌
- Delete others' data ❌
- Bypass limits ❌
```

### Principle 5: **Audit Everything**

```typescript
// All sensitive operations logged
await logAuditEvent({
  action: 'loan_created',
  userId: currentUser.uid,
  appId: 'coinbox',
  metadata: { loanId, amount },
  timestamp: new Date()
});

// Stored in: audit-logs/{logId}
// Retention: 7 years (compliance)
```

---

## 7. Where Business Logic Lives

### Correct Distribution

| Logic Type | Lives In | Example |
|------------|----------|---------|
| **Identity** | Platform | User login, profile management |
| **Access Control** | Platform | Entitlement checks |
| **App Business Rules** | App | Loan limits, interest rates |
| **App Workflows** | App | Loan approval flow |
| **App UI/UX** | App | Coin Box dashboard |
| **Real-time Sync** | Firebase | Firestore listeners |
| **File Storage** | Firebase | Profile photos, attachments |
| **Background Jobs** | Firebase Functions | Daily interest calculations |

### Examples

#### ✅ CORRECT: Business Logic in App

```typescript
// apps/coinbox/src/lib/loans.ts
export function calculateInterestRate(
  amount: number,
  duration: number,
  userTier: MembershipTier
): number {
  // Business logic owned by Coin Box
  const baseRate = 0.10;  // 10% base
  const tierDiscount = getTierDiscount(userTier);
  const durationMultiplier = duration / 30;  // Monthly
  
  return baseRate * durationMultiplier * (1 - tierDiscount);
}

// Coin Box decides the logic, Firebase stores the result
```

#### ❌ WRONG: Business Logic in Firebase Rules

```javascript
// firestore.rules
match /coinbox-loans/{loanId} {
  allow create: if calculateInterestRate(request.resource.data) < 0.25;
  // ❌ DON'T: Firebase rules can't do complex business logic
}
```

---

## 8. Firestore Rules Best Practices

### Rule Philosophy

Firestore rules should be:
1. **Defensive**: Prevent unauthorized access
2. **Simple**: Basic checks only
3. **Fast**: No complex queries
4. **Predictable**: Easy to understand

### Example: Coin Box Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Coin Box Loans
    match /coinbox-loans/{loanId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                      isOwner(request.resource.data.borrowerId);
      allow update: if false;  // Updates via Cloud Function
      allow delete: if false;  // No deletions (compliance)
    }
    
    // Coin Box Wallets
    match /coinbox-wallets/{walletId} {
      allow read: if isAuthenticated() && isOwner(walletId);
      allow write: if false;  // All writes via Cloud Functions
    }
  }
}
```

### What Rules DON'T Do

❌ Validate business logic (app does this)  
❌ Calculate derived fields (app does this)  
❌ Enforce app-specific workflows (app does this)  
❌ Check entitlements (entitlement service does this)

---

## 9. Sensitive Data Protection

### Coin Box (Financial Data)

**Risk Level**: 🔴 **MAXIMUM**

**Protections**:
- ✅ Separate Firestore collections with strict rules
- ✅ Wallet data encrypted in transit and at rest
- ✅ KYC verification required before transactions
- ✅ Transaction limits enforced by membership tier
- ✅ Audit logs for all financial operations
- ✅ No direct client access to wallet writes
- ✅ All financial ops via Cloud Functions
- ✅ Rate limiting on API endpoints

**What Clients Can NEVER Do**:
```typescript
// ❌ FORBIDDEN
await updateDoc(walletRef, { balance: 1000000 });  // Direct wallet write
await deleteDoc(loanRef);  // Delete financial record
await setDoc(investmentRef, { /* fake data */ });  // Create fake investment
```

**How It Works**:
```typescript
// ✅ CORRECT: Via Cloud Function
const result = await httpsCallable('createLoan')({
  amount: 500,
  duration: 30
});

// Cloud Function:
// 1. Validates user identity
// 2. Checks entitlements
// 3. Validates business rules
// 4. Updates Firestore
// 5. Logs audit trail
```

---

## 10. API Security

### Rate Limiting

```typescript
// platform/shared/src/ratelimit.ts
import { rateLimiters } from '@allied-impact/shared';

// Protect API endpoints
app.post('/api/loans', async (req, res) => {
  const result = await rateLimiters.createLoan.check(req.user.uid);
  
  if (!result.success) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: result.reset
    });
  }
  
  // Process loan creation
});

// Rate limits by operation type:
// - Login: 5/minute
// - Create loan: 10/hour
// - Crypto trade: 20/hour
// - Read ops: 100/minute
```

### Authentication Tokens

```typescript
// All API calls require valid Firebase ID token
const idToken = await user.getIdToken();

fetch('/api/loans', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});

// Backend verifies token:
const decodedToken = await admin.auth().verifyIdToken(idToken);
const userId = decodedToken.uid;

// Token includes: uid, email, email_verified
// Token does NOT include: entitlements, subscriptions (checked separately)
```

---

## 11. Deployment Security

### Environment Variables

```bash
# .env.local (NEVER commit)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...  # Server-side only
FIREBASE_CLIENT_EMAIL=... # Server-side only
```

### Secrets Management

- **Development**: `.env.local` (git-ignored)
- **Staging**: Vercel environment variables
- **Production**: Vercel environment variables (restricted access)

### CORS Configuration

```typescript
// Only allow Allied iMpact domains
const allowedOrigins = [
  'https://alliedimpact.com',
  'https://coinbox.alliedimpact.com',
  'https://myprojects.alliedimpact.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

---

## 12. Monitoring & Logging

### What We Monitor

1. **Auth Events**: Logins, signups, failures
2. **Entitlement Checks**: Who accessed what
3. **Financial Ops**: All Coin Box transactions
4. **Errors**: Client + server errors
5. **Performance**: Page load times, API latency

### Logging Strategy

```typescript
// Platform logging service
import { logEvent } from '@allied-impact/shared';

// Severity levels
logEvent({
  level: 'info',      // info, warn, error, critical
  category: 'auth',   // auth, entitlements, finance, etc.
  message: 'User logged in',
  userId: user.uid,
  metadata: { method: 'email' }
});

// Critical events trigger alerts
logEvent({
  level: 'critical',
  category: 'finance',
  message: 'Suspicious transaction detected',
  userId: user.uid,
  metadata: { amount: 100000, reason: 'exceeds_limit' }
});
// → Sends Slack alert + email to security team
```

---

## 13. Security Checklist

Before deploying any app:

- [ ] All API endpoints require authentication
- [ ] Entitlements checked before app access
- [ ] Firestore rules tested and defensive
- [ ] No business logic in Firestore rules
- [ ] Rate limiting on sensitive endpoints
- [ ] Input validation on client and server
- [ ] Secrets in environment variables (not code)
- [ ] Audit logging for sensitive operations
- [ ] Error messages don't leak sensitive info
- [ ] CORS configured for Allied iMpact domains only
- [ ] No direct client writes to financial data
- [ ] All financial ops via Cloud Functions
- [ ] Monitoring and alerts configured

---

## 14. Incident Response

### If Security Breach Detected

1. **Isolate**: Disable affected user accounts
2. **Assess**: Determine scope of breach
3. **Contain**: Patch vulnerability immediately
4. **Notify**: Inform affected users (if required)
5. **Document**: Post-mortem and lessons learned

### Contact

**Security Issues**: security@alliedimpact.com  
**Response Time**: <4 hours for critical issues

---

**This document is authoritative for all security and architectural decisions.**

---

**Last Updated**: January 6, 2026  
**Security Review**: Completed January 6, 2026  
**Next Review**: July 2026
