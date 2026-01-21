# SportsHub Technical Architecture

**Version**: 1.0  
**Last Updated**: January 2026  
**Audience**: Developers, Architects, Technical Leads

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Application Architecture](#application-architecture)
3. [Data Architecture](#data-architecture)
4. [Security Architecture](#security-architecture)
5. [Cloud Functions Architecture](#cloud-functions-architecture)
6. [Real-Time Features](#real-time-features)
7. [Performance Optimizations](#performance-optimizations)
8. [Scalability Design](#scalability-design)
9. [Error Handling](#error-handling)
10. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

### Design Principles

1. **Separation of Concerns**: Clear boundaries between layers
2. **Security First**: Defense in depth with multiple security layers
3. **Scalability**: Designed for 100,000+ concurrent users
4. **Real-Time**: Sub-second latency for vote updates
5. **Immutability**: Audit trail through immutable records
6. **Resilience**: Graceful degradation and error recovery

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │         Next.js 14 App (React Server Components)           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Pages      │  │  Components  │  │     Hooks     │    │  │
│  │  │  (Routes)    │  │   (UI/UX)    │  │   (Logic)     │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Context    │  │   Services   │  │     Utils     │    │  │
│  │  │   (State)    │  │   (API)      │  │  (Helpers)    │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↕ HTTPS / WebSocket
┌──────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION TIER                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Firebase Authentication                       │  │
│  │  - Email/Password    - Custom Claims    - Session Mgmt    │  │
│  │  - Token Validation  - Role Assignment  - MFA (planned)   │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↕ Auth Tokens
┌──────────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           Firebase Cloud Functions (Node.js 20)            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   HTTP       │  │  Firestore   │  │  Scheduled   │    │  │
│  │  │  Functions   │  │  Triggers    │  │  Functions   │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │ Rate Limiter │  │ Audit Logger │  │ Notification │    │  │
│  │  │   Service    │  │   Service    │  │   Service    │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↕ Firestore API
┌──────────────────────────────────────────────────────────────────┐
│                          DATA TIER                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Firestore Database                      │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │  │
│  │  │projects  │ │wallets   │ │notifications│ │audit_logs│  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │  │
│  │  ┌──────────────────┐ ┌──────────────────┐              │  │
│  │  │  tournaments     │ │  rate_limits     │              │  │
│  │  │  (sub-collection)│ └──────────────────┘              │  │
│  │  └──────────────────┘                                     │  │
│  │  ┌──────────────────┐                                     │  │
│  │  │     votes        │                                     │  │
│  │  │  (sub-collection)│                                     │  │
│  │  └──────────────────┘                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↕ Security Rules
┌──────────────────────────────────────────────────────────────────┐
│                       SECURITY TIER                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Firestore Security Rules (615 lines)          │  │
│  │  - RBAC          - Rate Limiting    - Audit Logging       │  │
│  │  - Immutability  - Token Validation - Input Validation    │  │
│  │  - reCAPTCHA     - Wallet Protection                       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Application Architecture

### Frontend Architecture (Next.js 14)

#### Directory Structure
```
src/
├── app/                          # App Router (Next.js 14)
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Home page
│   ├── dashboard/               # Protected dashboard routes
│   │   ├── layout.tsx          # Dashboard layout
│   │   ├── page.tsx            # Dashboard home
│   │   ├── tournaments/        # Tournament management
│   │   ├── analytics/          # Analytics pages
│   │   ├── settings/           # User settings
│   │   └── support/            # Support page
│   ├── tournaments/            # Public tournament routes
│   │   └── [tournamentId]/     # Dynamic tournament page
│   ├── help-center/            # Help center page
│   └── api/                    # API routes (future)
│
├── components/                  # Reusable components
│   ├── ui/                     # shadcn/ui components
│   ├── HelpCenter.tsx          # Help center component
│   ├── NotificationBell.tsx    # Notification UI
│   ├── SupportComponent.tsx    # Support form
│   └── PlatformFooter.tsx      # Shared footer
│
├── lib/                        # Utility libraries
│   ├── firebase.ts             # Firebase configuration
│   ├── notifications.ts        # Notification service
│   ├── auth.ts                 # Auth helpers
│   └── utils.ts                # General utilities
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts              # Authentication hook
│   ├── useFirestore.ts         # Firestore data hook
│   └── useNotifications.ts     # Notifications hook
│
├── types/                      # TypeScript type definitions
│   └── index.ts               # Shared types
│
└── styles/                     # Global styles
    └── globals.css            # Tailwind + custom CSS
```

#### Component Architecture

**Layered Component Structure:**
```
┌─────────────────────────────────────────┐
│           Page Components               │
│  (Route handlers, data fetching)        │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│         Container Components            │
│  (Business logic, state management)     │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│       Presentational Components         │
│  (Pure UI, props-based rendering)       │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│           UI Components                 │
│  (shadcn/ui, shared primitives)         │
└─────────────────────────────────────────┘
```

#### State Management Strategy

**1. Server State (Firestore)**
- Real-time listeners for live data
- Automatic synchronization
- Optimistic updates
- Cache-first strategy

**2. Client State (React Context + Hooks)**
```typescript
// AuthContext: User authentication state
interface AuthContext {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// NotificationContext: Notification state
interface NotificationContext {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
```

**3. Local State (useState, useReducer)**
- Form inputs
- UI toggles
- Temporary data

---

## Data Architecture

### Firestore Collections Schema

#### 1. **projects** (Root Collection)
```typescript
{
  // Document ID: auto-generated
  name: string;                    // "Cup Final 2024"
  description: string;             // Project overview
  status: 'active' | 'inactive';  // Project state
  createdAt: Timestamp;
  updatedAt: Timestamp;
  roles: {                         // Map of user roles
    [userId: string]: 'admin' | 'viewer';
  };
  
  // Indexes
  // - status (ASC)
  // - createdAt (DESC)
}
```

**Sub-collections:**
- `tournaments` (Tournament documents)

---

#### 2. **tournaments** (Sub-collection under projects)
```typescript
{
  // Document ID: auto-generated
  projectId: string;               // Parent project ID
  name: string;                    // "Best Player 2024"
  description: string;             // Tournament details
  status: 'draft' | 'open' | 'closed';
  votingDeadline: Timestamp;       // When voting closes
  voteCost: number;                // Credits per vote
  createdBy: string;               // User ID of creator
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;         // When published
  closedAt?: Timestamp;            // When closed
  totalVotes: number;              // Aggregate vote count
  
  options: [                       // Array of voting options
    {
      id: string;                  // "player1"
      label: string;               // "Lionel Messi"
      description?: string;        // Optional details
      voteCount: number;           // Real-time count
    }
  ];
  
  // Indexes
  // - status (ASC), votingDeadline (ASC)
  // - projectId (ASC), status (ASC)
  // - createdAt (DESC)
}
```

**Sub-collections:**
- `votes` (Vote documents)
- `vote_tallies` (Distributed counter shards)

---

#### 3. **votes** (Sub-collection under tournaments)
```typescript
{
  // Document ID: auto-generated
  tournamentId: string;            // Parent tournament
  projectId: string;               // Parent project
  userId: string;                  // Voter ID
  optionId: string;                // Selected option
  voteCost: number;                // Deducted amount
  createdAt: Timestamp;            // Vote timestamp
  ipAddress?: string;              // User IP (optional)
  userAgent?: string;              // Browser info (optional)
  
  // Security: IMMUTABLE (no updates/deletes allowed)
  
  // Indexes
  // - userId (ASC), createdAt (DESC)
  // - tournamentId (ASC), optionId (ASC)
  // - createdAt (DESC)
}
```

---

#### 4. **wallets** (Root Collection)
```typescript
{
  // Document ID: userId
  balance: number;                 // Current credit balance
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastTopUpAt?: Timestamp;         // Last deposit time
  totalSpent: number;              // Lifetime spending
  totalVotes: number;              // Total votes cast
  
  // Security: NO client writes (Cloud Functions only)
  
  // Indexes
  // - balance (ASC) for low balance queries
}
```

---

#### 5. **notifications** (Root Collection)
```typescript
{
  // Document ID: auto-generated
  userId: string;                  // Notification recipient
  type: NotificationType;          // Notification category
  title: string;                   // Notification title
  message: string;                 // Notification body
  read: boolean;                   // Read status
  createdAt: Timestamp;
  
  metadata?: {                     // Type-specific data
    tournamentId?: string;
    projectId?: string;
    amount?: number;
    optionLabel?: string;
  };
  
  // Indexes
  // - userId (ASC), read (ASC), createdAt (DESC)
  // - userId (ASC), createdAt (DESC)
}

type NotificationType = 
  | 'vote_confirmed'
  | 'tournament_published'
  | 'tournament_closed'
  | 'winner_announced'
  | 'wallet_topup'
  | 'admin_action';
```

---

#### 6. **audit_logs** (Root Collection)
```typescript
{
  // Document ID: auto-generated
  userId: string;                  // Actor ID
  userEmail: string;               // Actor email
  action: AdminAction;             // Action type (13 types)
  resourceType: string;            // 'tournament' | 'project' | 'wallet' | 'role'
  resourceId: string;              // Target resource ID
  projectId?: string;              // Associated project
  timestamp: Timestamp;
  
  metadata?: {                     // Action-specific data
    changes?: Record<string, any>;
    reason?: string;
  };
  
  ipAddress?: string;
  userAgent?: string;
  
  // Security: IMMUTABLE, Cloud Functions only
  
  // Indexes
  // - userId (ASC), timestamp (DESC)
  // - resourceType (ASC), resourceId (ASC), timestamp (DESC)
  // - timestamp (DESC) for recent logs
}

type AdminAction =
  | 'create_tournament'
  | 'update_tournament'
  | 'delete_tournament'
  | 'publish_tournament'
  | 'unpublish_tournament'
  | 'close_tournament'
  | 'add_voting_item'
  | 'update_voting_item'
  | 'delete_voting_item'
  | 'create_project'
  | 'update_project'
  | 'delete_project'
  | 'grant_role'
  | 'revoke_role'
  | 'refund_wallet'
  | 'adjust_balance'
  | 'system_action';
```

---

#### 7. **rate_limits** (Root Collection)
```typescript
{
  // Document ID: `${userId}_${action}`
  userId: string;
  action: RateLimitAction;
  attempts: number;                // Count in current window
  windowStart: Timestamp;          // Window start time
  lastAttempt: Timestamp;          // Most recent attempt
  
  // Auto-cleanup: Delete if > 7 days old
  
  // Indexes
  // - userId (ASC), action (ASC)
  // - lastAttempt (ASC) for cleanup
}

type RateLimitAction =
  | 'vote'                // 10/minute
  | 'topup'               // 5/hour
  | 'admin'               // 20/minute
  | 'create_tournament'   // 5/hour
  | 'auth';               // 5/15min
```

---

### Data Relationships

```
projects (1) ──→ (N) tournaments
tournaments (1) ──→ (N) votes
users (1) ──→ (1) wallet
users (1) ──→ (N) votes
users (1) ──→ (N) notifications
users (1) ──→ (N) audit_logs
users (1) ──→ (N) rate_limits
```

---

### Distributed Vote Tallying

**Challenge**: High-frequency vote updates cause write contention

**Solution**: Distributed counters with shards

```typescript
// vote_tallies sub-collection under tournaments
{
  // Document ID: shard_0, shard_1, ..., shard_9
  optionId: string;
  count: number;                   // Partial count
  lastUpdated: Timestamp;
}

// Total count = SUM(all shards for optionId)
```

**Implementation:**
```typescript
async function incrementVoteCount(
  tournamentRef: DocumentReference,
  optionId: string
) {
  const shardId = Math.floor(Math.random() * 10);
  const shardRef = tournamentRef
    .collection('vote_tallies')
    .doc(`shard_${shardId}`);
  
  await shardRef.set({
    optionId,
    count: FieldValue.increment(1),
    lastUpdated: FieldValue.serverTimestamp()
  }, { merge: true });
}
```

**Benefits:**
- **Scalability**: 10x write capacity per option
- **Real-Time**: Sub-second aggregate updates
- **Consistency**: Eventually consistent (acceptable for voting)

---

## Security Architecture

### Defense in Depth Strategy

```
Layer 1: Network Security (HTTPS/TLS)
   ↓
Layer 2: Authentication (Firebase Auth + Custom Claims)
   ↓
Layer 3: Authorization (Firestore Security Rules)
   ↓
Layer 4: Rate Limiting (Custom middleware)
   ↓
Layer 5: Input Validation (reCAPTCHA + Zod schemas)
   ↓
Layer 6: Audit Logging (Immutable trail)
   ↓
Layer 7: Data Immutability (Vote/audit immutability)
```

### Firestore Security Rules Architecture

**Rule Structure (615 lines):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions (50 lines)
    function isAuthenticated() { ... }
    function isSuperAdmin() { ... }
    function isSupport() { ... }
    function hasProjectRole(projectId, role) { ... }
    function hasWalletBalance(amount) { ... }
    function votingWindowOpen(tournamentData) { ... }
    function hasValidTimestamp(data) { ... }
    
    // Projects collection (80 lines)
    match /projects/{projectId} { ... }
    
    // Tournaments sub-collection (150 lines)
    match /projects/{projectId}/tournaments/{tournamentId} { ... }
    
    // Votes sub-collection (100 lines - IMMUTABLE)
    match /projects/{projectId}/tournaments/{tournamentId}/votes/{voteId} { ... }
    
    // Wallets collection (80 lines - NO CLIENT WRITES)
    match /wallets/{userId} { ... }
    
    // Notifications collection (70 lines)
    match /notifications/{notificationId} { ... }
    
    // Audit logs collection (50 lines - IMMUTABLE)
    match /audit_logs/{logId} { ... }
    
    // Rate limits collection (35 lines)
    match /rate_limits/{limitId} { ... }
  }
}
```

**Key Security Patterns:**
1. **Token-based admin check**: `request.auth.token.super_admin == true`
2. **Role validation**: `resource.data.roles[request.auth.uid] == 'admin'`
3. **Immutability**: `allow update, delete: if false;`
4. **Timestamp validation**: `request.time == request.resource.data.createdAt`
5. **Conditional access**: `resource.data.userId == request.auth.uid`

---

## Cloud Functions Architecture

### Function Categories

#### 1. **HTTP Functions** (Callable)
```typescript
// Vote submission with rate limiting
export const deductVoteFromWallet = functions.https.onCall(
  async (data, context) => {
    // 1. Authenticate user
    if (!context.auth) throw new Error('Unauthenticated');
    
    // 2. Rate limit check (enforceRateLimit)
    await enforceRateLimit(context, RATE_LIMITS.VOTE_SUBMISSION);
    
    // 3. Validate tournament status
    const tournament = await getTournament(data.tournamentId);
    if (tournament.status !== 'open') throw new Error('Tournament closed');
    
    // 4. Check wallet balance (transaction)
    // 5. Deduct vote cost
    // 6. Create vote record
    // 7. Update vote tallies (distributed counter)
    // 8. Log audit trail
    // 9. Send notification
    
    return { success: true, newBalance };
  }
);
```

#### 2. **Firestore Triggers**
```typescript
// Notify users when tournament published
export const notifyTournamentPublished = functions.firestore
  .document('projects/{projectId}/tournaments/{tournamentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Trigger only on status change to 'open'
    if (before.status !== 'open' && after.status === 'open') {
      // 1. Get project followers/members
      // 2. Create notifications for each
      // 3. Log admin action
    }
  });

// Similar triggers:
// - notifyWalletTopup (wallet balance increase)
// - notifyTournamentClosed (status change to 'closed')
```

#### 3. **Scheduled Functions**
```typescript
// Cleanup old rate limit records (every 24 hours)
export const cleanupRateLimits = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const cutoff = admin.firestore.Timestamp.fromMillis(
      Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days
    );
    
    const snapshot = await admin.firestore()
      .collection('rate_limits')
      .where('lastAttempt', '<', cutoff)
      .get();
    
    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    return { deleted: snapshot.size };
  });

// Similar scheduled functions:
// - cleanupOldAuditLogs (delete logs > 1 year old)
// - closeExpiredTournaments (auto-close past deadline)
```

---

### Rate Limiting Implementation

**Architecture:**
```typescript
// Rate limit configuration
const RATE_LIMITS = {
  VOTE_SUBMISSION: {
    action: 'vote',
    windowMs: 60 * 1000,        // 1 minute
    maxAttempts: 10             // 10 votes/min
  },
  WALLET_TOPUP: {
    action: 'topup',
    windowMs: 60 * 60 * 1000,   // 1 hour
    maxAttempts: 5              // 5 topups/hour
  },
  ADMIN_ACTION: {
    action: 'admin',
    windowMs: 60 * 1000,        // 1 minute
    maxAttempts: 20             // 20 actions/min
  }
};

// Enforcement function
async function enforceRateLimit(
  context: functions.https.CallableContext,
  config: RateLimitConfig
): Promise<void> {
  const userId = context.auth!.uid;
  const limitId = `${userId}_${config.action}`;
  const limitRef = admin.firestore().collection('rate_limits').doc(limitId);
  
  const now = Date.now();
  const doc = await limitRef.get();
  
  if (!doc.exists) {
    // First attempt - create record
    await limitRef.set({
      userId,
      action: config.action,
      attempts: 1,
      windowStart: admin.firestore.Timestamp.fromMillis(now),
      lastAttempt: admin.firestore.Timestamp.fromMillis(now)
    });
    return;
  }
  
  const data = doc.data()!;
  const windowStart = data.windowStart.toMillis();
  const elapsed = now - windowStart;
  
  if (elapsed > config.windowMs) {
    // Window expired - reset
    await limitRef.set({
      userId,
      action: config.action,
      attempts: 1,
      windowStart: admin.firestore.Timestamp.fromMillis(now),
      lastAttempt: admin.firestore.Timestamp.fromMillis(now)
    });
    return;
  }
  
  if (data.attempts >= config.maxAttempts) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      `Rate limit exceeded. Try again in ${Math.ceil((config.windowMs - elapsed) / 1000)}s`
    );
  }
  
  // Increment attempts
  await limitRef.update({
    attempts: admin.firestore.FieldValue.increment(1),
    lastAttempt: admin.firestore.Timestamp.fromMillis(now)
  });
}
```

---

## Real-Time Features

### Real-Time Vote Updates

**Architecture:**
```typescript
// Client-side listener
useEffect(() => {
  const tournamentRef = doc(db, `projects/${projectId}/tournaments/${tournamentId}`);
  
  const unsubscribe = onSnapshot(tournamentRef, (snapshot) => {
    const data = snapshot.data();
    setTournament(data);
    
    // Update UI with new vote counts
    setOptions(data.options);
  });
  
  return () => unsubscribe();
}, [tournamentId]);
```

**Latency:**
- Firestore listener: < 100ms
- UI update: < 50ms
- Total: < 150ms

### Real-Time Notifications

**Architecture:**
```typescript
// Client-side listener for user notifications
useEffect(() => {
  if (!user) return;
  
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', user.uid),
    where('read', '==', false),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    setNotifications(notifications);
    setUnreadCount(notifications.length);
  });
  
  return () => unsubscribe();
}, [user]);
```

---

## Performance Optimizations

### 1. **Code Splitting**
```typescript
// Dynamic imports for heavy components
const HelpCenter = dynamic(() => import('@/components/HelpCenter'), {
  loading: () => <LoadingSkeleton />,
  ssr: false
});
```

### 2. **Image Optimization**
```typescript
import Image from 'next/image';

<Image
  src="/assets/sportshub-logo.png"
  alt="SportsHub"
  width={200}
  height={50}
  priority={true}  // Above the fold
  quality={90}     // Balance quality/size
/>
```

### 3. **Firestore Query Optimization**
```typescript
// Use composite indexes
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "votes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 4. **Caching Strategy**
- **Server-Side**: Next.js cache headers
- **Client-Side**: React Query / SWR (future)
- **Firestore**: Offline persistence enabled

---

## Scalability Design

### Horizontal Scalability

**Firestore:** Auto-scales to millions of operations/second
**Cloud Functions:** Auto-scales based on load (0 to thousands of instances)
**Next.js:** Vercel auto-scales (serverless)

### Vertical Scalability

**Distributed Counters:** 10 shards per voting option = 10x write capacity
**Rate Limiting:** Prevents abuse and protects resources
**Lazy Loading:** Components load on-demand

### Capacity Planning

**Target Metrics:**
- 100,000 concurrent users
- 1,000 votes/second
- 10,000 tournaments
- 1,000,000 votes/day

**Firestore Limits:**
- Max document size: 1MB ✅ (tournaments ~10KB)
- Max write rate: 1/second per document ✅ (distributed counters)
- Max reads: 50,000/second ✅ (far beyond expected)

---

## Error Handling

### Client-Side Error Boundaries
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to Sentry (planned)
    console.error('Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Cloud Function Error Handling
```typescript
try {
  // Business logic
} catch (error) {
  if (error instanceof ValidationError) {
    throw new functions.https.HttpsError('invalid-argument', error.message);
  } else if (error instanceof PermissionError) {
    throw new functions.https.HttpsError('permission-denied', error.message);
  } else {
    // Log to error tracking (Sentry planned)
    throw new functions.https.HttpsError('internal', 'An error occurred');
  }
}
```

---

## Testing Strategy

### Unit Testing (Planned)
- Jest + React Testing Library
- Component tests
- Utility function tests
- Hook tests

### Integration Testing (Planned)
- Firestore Security Rules testing
- Cloud Functions testing
- API endpoint testing

### E2E Testing (Planned)
- Playwright
- Critical user flows
- Cross-browser testing

---

**Document Version**: 1.0  
**Last Updated**: January 19, 2026  
**Maintained By**: Development Team  
**Next Review**: February 2026
