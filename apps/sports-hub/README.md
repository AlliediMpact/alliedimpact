# ⚽ SportsHub - Multi-Project Sports Engagement Platform

**Version**: 1.0.0-alpha  
**Status**: Active Development (Phase 1.5)  
**Last Updated**: January 18, 2026  

---

## 🎯 Vision

SportsHub is a **world-class, multi-project sports engagement platform** where fans participate in tournaments, development initiatives, and campaigns. Built within the Allied iMpact ecosystem, SportsHub hosts multiple independent projects under one unified platform.

### Platform Architecture
- **SportsHub** = Multi-project platform (the container)
- **Projects** = Independent modules (CupFinal, Lesotho Initiative, future events)
- **Shared Services** = Authentication, wallet, UI components

### First Project: CupFinal
CupFinal is a participatory football tournament where fans vote to decide teams, venues, and match structure. R2 per vote. One-day event with high-intensity voting windows.

### What Makes CupFinal Different
- **Not gambling** - Users vote to DECIDE, not predict
- **Not betting** - No prizes, no payouts, no financial benefit to voters
- **Participatory democracy** - Fans directly influence tournament structure
- **One-day events** - High-intensity, time-bound voting windows
- **Internationally respectable** - Enterprise-grade quality, zero manipulation tolerance

---

## 🚫 What CupFinal Is NOT

### NOT Gambling / Betting
❌ Users do NOT bet on match outcomes  
❌ Users do NOT receive prizes for correct predictions  
❌ Users do NOT receive payouts based on results  
❌ Voting does NOT financially benefit voters  

### It IS Participatory Voting
✅ Users vote to DECIDE which teams participate  
✅ Users vote to DECIDE where matches are played  
✅ Users vote to DECIDE tournament structure  
✅ Votes directly influence event configuration  

**Legal Classification**: Participatory decision platform, not gambling service.

---

## 💰 Business Model

### Pricing
- **Fixed price**: R2.00 per vote
- **No dynamic pricing**
- **No refunds on votes cast**

### Wallet Top-Up
- **Minimum**: R10 (R10.00)
- **Maximum**: No limit (users can top up any amount ≥ R10)
- **Preset amounts**: R10, R20, R50, R100, R200, R500
- **Custom amount**: Users can enter any amount ≥ R10
- **Payment gateway**: PayFast (South African market leader)

### Revenue Model
- 100% vote revenue to CupFinal operations
- No revenue sharing with other Allied iMpact apps
- Future: Sponsorships, ads (optional, post-MVP)
for 
### Cost Structure (Conservative Estimate)
```
Expected: 10,000-50,000 users, 100,000-500,000 votes

Revenue: 100,000 votes × R2 = R200,000
         500,000 votes × R2 = R1,000,000

Costs (24-hour event):
- Firebase (Firestore + Functions): R3,000 - R10,000
- PayFast fees (7.5%): R15,000 - R75,000
- Hosting (Vercel): R500
- Monitoring (Sentry): R400
- Total: R18,900 - R85,900

Net Profit: R114,100 - R914,100 (57-91% margin)
```

**Break-even**: ~10,000 votes (R20,000 revenue)

---

## 🏗️ Architecture Philosophy

### Core Principles
1. **Configuration-driven** - Not hard-coded to one tournament
2. **Build once, scale forever** - Reusable engine
3. **Atomic operations** - Votes + wallet changes must succeed together or fail together
4. **Immutable votes** - Once cast, permanent and auditable
5. **Isolated wallet** - Not shared with other Allied iMpact apps
6. **Shared auth only** - Business logic remains independent
7. **Zero fraud tolerance** - Reputation is non-negotiable

### Technology Stack

**Frontend**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI components
- React Query (data fetching)

**Backend**:
- Firebase Firestore (database)
- Firebase Cloud Functions (serverless)
- Firebase Authentication (via Allied iMpact SSO)
- PayFast (South African payments)

**Infrastructure**:
- Vercel (hosting)
- Sentry (error monitoring)
- Firebase Analytics (usage tracking)

**Future Scaling** (if needed):
- Redis/Upstash (high-frequency counters)
- CloudFlare (DDoS protection)

---

## 🗳️ Voting System Design

### How Voting Works

1. **User Journey**:
   ```
   User logs in → Adds R20 to wallet → 
   Browses voting items → Votes (R2 deducted) → 
   Sees voting status → Results revealed after close
   ```

2. **Voting Items** (Configurable per tournament):
   - Team selection (African teams, International teams)
   - Venue selection (First match, Second match, Final)
   - Tournament format decisions (Optional)

3. **Vote Properties**:
   - **Immutable**: Cannot be changed or deleted
   - **Time-stamped**: Exact timestamp recorded
   - **Auditable**: Full trail for transparency
   - **Rate-limited**: Max 1 vote/sec per item, 20 votes/min per user
   - **Repeatable**: Users CAN vote multiple times for same option (10 votes for Team A)

### Voting Rules

| Rule | Value |
|------|-------|
| **Price per vote** | R2.00 (fixed) |
| **Multiple votes** | Allowed (same user, same item) |
| **Vote changes** | Not allowed (immutable) |
| **Refunds** | No refunds on votes cast |
| **Minimum age** | 16+ (not gambling, so not 18+) |
| **Vote visibility** | Partial (see below) |

### Vote Visibility Strategy

**During Voting Window**:
- ✅ Show: "Team A is leading", "Close race", "Tied"
- ❌ Hide: Exact vote counts

**After Voting Closes**:
- ✅ Show: Full exact counts
- ✅ Show: Vote distribution charts
- ✅ Show: Winner announcement

**Why?**: Prevents bandwagon effect (everyone votes for leader)

### Tie-Breaking Rules

If votes end in exact tie:
1. **Admin-defined tiebreaker** (set during tournament config)
2. **Sudden-death voting** (5-minute window, double price)
3. **Random selection** (cryptographically fair, last resort)

---

## 💳 Wallet System

### Wallet Properties
- **Isolated**: Exists only in CupFinal
- **Prepaid credit**: Not currency, not transferable
- **Non-withdrawable**: No cash-out option
- **Single use**: Voting only
- **Persistent**: Funds never expire
- **No interest**: Funds don't earn anything

### Top-Up Options (MVP)
| Amount | Votes Possible |
|--------|----------------|
| R10 | 5 votes |
| R20 | 10 votes |
| R50 | 25 votes |
| R100 | 50 votes |

### Wallet Flow
```
1. User clicks "Add Credit"
2. Select amount (R10/R20/R50/R100)
3. Redirect to PayFast payment page
4. User completes payment
5. PayFast sends webhook to CupFinal
6. Cloud Function verifies payment signature
7. Atomic transaction: Add credit to wallet + log transaction
8. User sees updated balance instantly
9. User can now vote
```

### Payment Failure Handling
```
Scenario: Payment succeeds, but webhook delayed
Solution: Idempotency key prevents double-credit

Scenario: Payment succeeds, but wallet update fails
Solution: Manual reconciliation dashboard (admin reviews)

Scenario: User charges R20, but only R10 added
Solution: Payment audit log matches charges to credits
```

### Dormant Funds Policy
- **Policy**: Unused credit remains valid indefinitely
- **No expiry**: Funds available for future CupFinal events
- **Terms**: "Credit is valid for all CupFinal tournaments, cannot be refunded"
- **Legal**: Avoids escheatment (unclaimed property) laws

---

## 🔐 Security & Fraud Prevention

### Fraud Tolerance: **0%**

CupFinal protects Allied iMpact's international reputation. Any fraud undermines trust across all apps.

### Anti-Fraud Measures (MVP - Phase 4)

#### 1. Email Verification
- ✅ Mandatory email verification before voting
- ✅ Prevents throwaway email abuse via verification link

#### 2. CAPTCHA
- ✅ hCaptcha or Cloudflare Turnstile on vote submission
- ✅ Blocks automated bot scripts

#### 3. Rate Limiting
```typescript
Per User Limits:
- Max 1 vote per item per second
- Max 20 votes per minute (across all items)
- Max 100 votes per hour

Per IP Limits:
- Max 50 votes per minute
- Max 200 votes per hour

Violation Response:
- Soft limit: Delay vote by 10 seconds
- Hard limit: Block for 1 hour + admin flag
```

#### 4. Atomic Transactions
```typescript
// Firestore transaction ensures:
// - Vote recorded AND wallet deducted
// - OR both fail (no partial state)

await db.runTransaction(async (transaction) => {
  // 1. Check wallet balance >= R2
  // 2. Record vote
  // 3. Deduct R2 from wallet
  // All succeed or all fail (atomic)
});
```

#### 5. Admin Audit Logs
Every admin action recorded:
- Timestamp
- Admin user ID
- Action type (pause voting, flag fraud, export data)
- IP address
- Reason (text field, mandatory)

### Advanced Anti-Fraud (Phase 5+)

#### 6. Device Fingerprinting
- Track device signature (browser, screen, timezone, plugins)
- Flag: Same device, 10 different accounts

#### 7. IP Reputation
- Integrate IPQualityScore or similar
- Block: VPNs, proxies, known fraud IPs

#### 8. Phone Verification (Optional)
- SMS verification via Twilio
- Cost: R0.80 per SMS (~$0.05 USD)
- Only triggered if suspicious activity detected

### Admin Fraud Controls

**Admins CANNOT**:
- ❌ Edit vote counts directly
- ❌ Delete votes
- ❌ Change user wallet balances manually

**Admins CAN**:
- ✅ Pause/unpause voting
- ✅ Flag suspicious users for review
- ✅ View full audit trail
- ✅ Export vote data for external audit
- ✅ Void entire voting item (with public explanation, irreversible)

---

## 📊 Database Schema (Firestore)

### Collections

#### `cupfinal_tournaments`
```typescript
{
  tournamentId: string (auto-generated)
  name: string ("African Cup Final 2026")
  description: string
  status: 'draft' | 'open' | 'closed' | 'completed'
  startTime: timestamp
  endTime: timestamp
  
  votingItems: [
    {
      id: string ("team-african-slot-1")
      type: 'team' | 'venue' | 'format'
      title: string ("African Team Slot 1")
      description: string
      options: [
        { id: "south-africa", label: "South Africa", imageUrl: "..." }
        { id: "nigeria", label: "Nigeria", imageUrl: "..." }
        ...
      ]
      votingWindow: {
        opens: timestamp
        closes: timestamp
      }
      maxVotesPerUser: number | null (null = unlimited)
      tiebreaker: 'sudden-death' | 'random' | 'admin-decision'
    }
  ]
  
  createdBy: string (admin userId)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `cupfinal_votes`
```typescript
{
  voteId: string (auto-generated)
  userId: string
  tournamentId: string
  votingItemId: string ("team-african-slot-1")
  selectedOption: string ("south-africa")
  
  // Audit trail
  timestamp: timestamp
  walletBalanceBefore: number (in cents)
  walletBalanceAfter: number (in cents)
  
  // Fraud detection
  ipAddress: string (hashed for privacy)
  deviceFingerprint: string (optional, Phase 5+)
  captchaToken: string (verified before recording)
  
  // Payment tracking
  paymentId: string | null (if direct payment)
  
  // Immutability enforcement
  immutable: true (Firestore rule: no updates/deletes)
}
```

#### `cupfinal_wallets`
```typescript
{
  userId: string (document ID)
  balance: number (in cents, e.g., 2000 = R20.00)
  
  transactionHistory: [
    {
      transactionId: string
      type: 'topup' | 'vote' | 'refund-admin'
      amount: number (positive for topup, negative for vote)
      balanceBefore: number
      balanceAfter: number
      timestamp: timestamp
      
      // For topup
      paymentId?: string
      paymentMethod?: 'payfast'
      
      // For vote
      voteId?: string
      votingItemId?: string
      
      // For refund (rare, admin override)
      adminUserId?: string
      reason?: string
    }
  ]
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `cupfinal_vote_tallies` (Distributed Counter Pattern)
```typescript
{
  tallyId: string ("{tournamentId}_{votingItemId}_{option}")
  tournamentId: string
  votingItemId: string
  option: string ("south-africa")
  
  // Distributed shards (prevents write contention)
  shards: {
    shard_0: { count: 123 }
    shard_1: { count: 456 }
    shard_2: { count: 789 }
    ...
    shard_9: { count: 234 }
  }
  
  // Cached total (updated every 5 seconds via Cloud Function)
  totalVotes: number (1602)
  lastUpdated: timestamp
}
```

#### `cupfinal_users` (Minimal, links to platform)
```typescript
{
  userId: string (matches Allied iMpact platform userId)
  email: string
  displayName: string
  role: 'fan' | 'admin' | 'super_admin'
  
  // CupFinal specific
  emailVerified: boolean
  phoneVerified: boolean (optional)
  
  // Fraud detection
  flaggedForFraud: boolean
  flagReason: string | null
  flaggedAt: timestamp | null
  flaggedBy: string | null (admin userId)
  
  createdAt: timestamp
  lastLoginAt: timestamp
}
```

#### `cupfinal_payments` (Audit trail)
```typescript
{
  paymentId: string (from PayFast)
  userId: string
  amount: number (in cents)
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  
  // PayFast data
  payfastData: {
    m_payment_id: string
    pf_payment_id: string
    payment_status: string
    item_name: string
    amount_gross: number
    amount_fee: number
    amount_net: number
  }
  
  // Reconciliation
  walletCreditApplied: boolean
  walletCreditedAt: timestamp | null
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `cupfinal_admin_logs` (Full audit trail)
```typescript
{
  logId: string (auto-generated)
  adminUserId: string
  action: 'pause_voting' | 'unpause_voting' | 'flag_user' | 
          'void_voting_item' | 'export_data' | 'manual_refund'
  
  targetType: 'tournament' | 'user' | 'voting_item' | 'vote'
  targetId: string
  
  reason: string (mandatory text field)
  ipAddress: string
  timestamp: timestamp
  
  // For voids/refunds
  affectedVotes?: number
  affectedUsers?: number
}
```

---

## 🔒 Firestore Security Rules (Principles)

### Votes: Immutable
```javascript
match /cupfinal_votes/{voteId} {
  // Anyone can read their own votes
  allow read: if request.auth.uid == resource.data.userId || isAdmin();
  
  // Votes can only be created, never updated or deleted
  allow create: if isAuthenticated() 
                && hasValidCaptcha()
                && hasWalletBalance(request.auth.uid, 200)
                && votingWindowOpen(request.resource.data.votingItemId)
                && !rateLimitExceeded(request.auth.uid);
  
  allow update, delete: never; // Immutable
}
```

### Wallets: System-only writes
```javascript
match /cupfinal_wallets/{userId} {
  // Users can read own wallet
  allow read: if request.auth.uid == userId || isAdmin();
  
  // Only Cloud Functions can modify wallets (not users, not admins)
  allow write: if false; // Cloud Functions use Admin SDK (bypasses rules)
}
```

### Tournaments: Admin-only writes
```javascript
match /cupfinal_tournaments/{tournamentId} {
  // Anyone can read published tournaments
  allow read: if resource.data.status != 'draft' || isAdmin();
  
  // Only admins can create/edit tournaments
  allow create, update: if isAdmin();
  
  // Only super admins can delete
  allow delete: if isSuperAdmin();
}
```

---

## 👥 User Roles & Permissions

### Role Hierarchy

```
fan (default)
  ↓
admin (tournament manager)
  ↓
super_admin (platform owner)
```

### Permissions Matrix

| Action | Fan | Admin | Super Admin |
|--------|-----|-------|-------------|
| **View tournaments** | ✅ | ✅ | ✅ |
| **Vote** | ✅ | ✅ | ✅ |
| **Top up wallet** | ✅ | ✅ | ✅ |
| **View own votes** | ✅ | ✅ | ✅ |
| **View own wallet** | ✅ | ✅ | ✅ |
| **Create tournament** | ❌ | ✅ | ✅ |
| **Edit tournament** | ❌ | ✅ (own) | ✅ (all) |
| **Pause/unpause voting** | ❌ | ✅ | ✅ |
| **View all votes** | ❌ | ✅ | ✅ |
| **View analytics** | ❌ | ✅ | ✅ |
| **Flag users** | ❌ | ✅ | ✅ |
| **Export data** | ❌ | ✅ | ✅ |
| **Void voting item** | ❌ | ❌ | ✅ |
| **Delete tournament** | ❌ | ❌ | ✅ |
| **Manage admins** | ❌ | ❌ | ✅ |

---

## 📱 Application Modules

### Module Structure

```
apps/cup-final/
├── src/
│   ├── modules/
│   │   ├── auth/              # Allied iMpact SSO integration
│   │   ├── wallet/            # Balance, top-up, transactions
│   │   ├── voting/            # Core voting engine
│   │   ├── tournaments/       # Tournament config (admin)
│   │   ├── analytics/         # Real-time dashboards
│   │   ├── fraud/             # Detection & prevention
│   │   └── payments/          # PayFast integration
│   │
│   ├── services/
│   │   ├── walletService.ts   # Wallet operations
│   │   ├── votingService.ts   # Vote casting, tallies
│   │   ├── tournamentService.ts # CRUD tournaments
│   │   ├── paymentService.ts  # PayFast API
│   │   ├── fraudService.ts    # Rate limiting, detection
│   │   └── auditService.ts    # Admin action logging
│   │
│   ├── types/
│   │   ├── tournament.ts
│   │   ├── vote.ts
│   │   ├── wallet.ts
│   │   ├── payment.ts
│   │   └── user.ts
│   │
│   ├── config/
│   │   ├── firebase.ts
│   │   ├── payfast.ts
│   │   └── rateLimits.ts
│   │
│   └── app/                   # Next.js pages
│       ├── (public)/
│       │   ├── page.tsx       # Landing page
│       │   ├── about/
│       │   └── terms/
│       │
│       ├── (auth)/
│       │   ├── login/
│       │   └── signup/
│       │
│       ├── (fan)/
│       │   ├── dashboard/
│       │   ├── tournaments/
│       │   ├── vote/
│       │   ├── wallet/
│       │   └── history/
│       │
│       └── (admin)/
│           ├── dashboard/
│           ├── tournaments/
│           ├── analytics/
│           └── moderation/
│
├── functions/                 # Firebase Cloud Functions
│   ├── paymentWebhook.ts      # PayFast ITN handler
│   ├── voteCounterSync.ts     # Update tallies every 5 sec
│   ├── rateLimitCheck.ts      # Enforce limits
│   └── fraudDetection.ts      # Background analysis
│
├── firestore.rules            # Security rules
├── firestore.indexes.json     # Composite indexes
└── package.json
```

---

## 📋 PHASED DEVELOPMENT ROADMAP

### Phase 0: Foundation (Week 1)
**Goal**: Infrastructure, no voting logic yet

**Deliverables**:
- [x] Project setup (Next.js 14, TypeScript, Tailwind)
- [x] Firebase configuration
- [x] Authentication integration (Allied iMpact SSO)
- [x] User roles (fan, admin, super_admin)
- [x] Empty dashboard layouts (no data)
- [x] Firestore collections created (empty)
- [x] Basic security rules (read-only)
- [x] Environment variables configured

**Success Criteria**:
- User can log in via Allied iMpact
- User sees empty fan dashboard
- Admin sees empty admin dashboard
- No errors in console

**Testing**: Manual login test

---

### Phase 1: Wallet System (Week 2)
**Goal**: Users can add money, see balance

**Deliverables**:
- [ ] PayFast integration (sandbox mode)
- [ ] Wallet top-up UI (R10/R20/R50/R100)
- [ ] Payment flow (redirect to PayFast)
- [ ] Webhook handler (Cloud Function)
- [ ] Wallet balance display
- [ ] Transaction history UI
- [ ] Payment reconciliation dashboard (admin)

**Success Criteria**:
- User adds R20, sees balance update
- Webhook processes within 5 seconds
- Transaction logged in wallet history
- Admin can view all payments

**Testing**:
- 10 concurrent top-ups (stress test)
- Webhook delay simulation (30 sec)
- Double-webhook idempotency test

---

### Phase 2: Voting Engine - Part 1 (Week 3)
**Goal**: Admin creates tournaments, users browse

**Deliverables**:
- [ ] Admin: Create tournament form
- [ ] Admin: Add voting items (teams, venues)
- [ ] Admin: Set voting windows
- [ ] User: Browse active tournaments
- [ ] User: View voting items
- [ ] User: See voting status (open/closed/upcoming)

**Success Criteria**:
- Admin creates tournament with 3 voting items
- Users see tournament in browse page
- Voting windows enforce open/close times

**Testing**: Create tournament, verify visibility

---

### Phase 3: Voting Engine - Part 2 (Week 4)
**Goal**: Users can vote, votes recorded

**Deliverables**:
- [ ] Vote button with confirmation modal
- [ ] Atomic transaction (vote + wallet deduction)
- [ ] Vote recorded in `cupfinal_votes`
- [ ] Wallet balance updated
- [ ] Vote history UI (user sees own votes)
- [ ] Immutability enforcement (Firestore rule)
- [ ] Rate limiting (1 vote/sec, 20 votes/min)

**Success Criteria**:
- User votes, wallet deducts R2
- Vote appears in history instantly
- User cannot delete vote
- Rate limit blocks rapid clicks

**Testing**:
- 1,000 concurrent votes (load test)
- Rapid-click test (rate limit)
- Wallet insufficient funds test
- Vote immutability test

---

### Phase 4: Results & Analytics (Week 5)
**Goal**: Real-time vote tallies, admin dashboard

**Deliverables**:
- [ ] Distributed counter implementation
- [ ] Vote tally sync (Cloud Function, every 5 sec)
- [ ] User: Partial results ("Leading" / "Close")
- [ ] Admin: Full real-time counts
- [ ] Admin: Analytics dashboard (votes/hour, revenue)
- [ ] Export votes to CSV (admin)

**Success Criteria**:
- Vote tallies update within 5 seconds
- Users see "Team A leading" (no exact count)
- Admin sees exact counts
- CSV export includes all vote data

**Testing**: Vote 1000 times, verify tally accuracy

---

### Phase 5: Fraud Prevention (Week 6)
**Goal**: Lock down security

**Deliverables**:
- [ ] Email verification mandatory
- [ ] CAPTCHA on vote submission
- [ ] IP rate limiting (50 votes/min per IP)
- [ ] Device fingerprinting (optional)
- [ ] Admin: Fraud detection dashboard
- [ ] Admin: Flag user for review
- [ ] Admin: View flagged accounts

**Success Criteria**:
- Unverified email cannot vote
- CAPTCHA blocks bot scripts
- IP limit prevents VPN abuse
- Admin can flag suspicious users

**Testing**:
- Bot simulation (blocked by CAPTCHA)
- VPN multi-account test (flagged)
- Manual admin flag/unflag test

---

### Phase 6: Polish & Load Testing (Week 7)
**Goal**: Production-ready

**Deliverables**:
- [ ] Load test: 5,000 concurrent users
- [ ] Load test: 10,000 votes in 1 minute
- [ ] Performance optimization (query indexes)
- [ ] Error monitoring (Sentry integration)
- [ ] Legal: Terms of Service page
- [ ] Legal: Privacy Policy page
- [ ] Legal: Disclaimer ("Not gambling")
- [ ] Crisis management plan document

**Success Criteria**:
- App handles 5,000 concurrent users
- No database write limit errors
- All errors logged in Sentry
- Legal pages reviewed by attorney

**Testing**:
- Artillery load test script
- Failure scenario tests (Firebase down)

---

### Phase 7: Pre-Launch (Week 8)
**Goal**: Soft launch with 100 beta users

**Deliverables**:
- [ ] Beta user invitations
- [ ] Real PayFast (production mode)
- [ ] Monitoring dashboards live
- [ ] Support email setup
- [ ] Social media accounts
- [ ] Marketing materials (graphics, copy)

**Success Criteria**:
- 100 users vote successfully
- No payment failures
- No critical bugs reported

**Testing**: Beta user feedback survey

---

### Phase 8: Full Launch (Week 9)
**Goal**: Public launch

**Deliverables**:
- [ ] Marketing campaign (Twitter, Facebook, Instagram)
- [ ] Press release (if applicable)
- [ ] 24/7 monitoring team
- [ ] Support ticket system
- [ ] Post-event audit report

**Success Criteria**:
- Target vote volume achieved (100K+)
- Zero security incidents
- Positive user feedback
- Revenue > costs

---

## 🚨 Crisis Management Plan

### Scenario 1: Firebase Write Limits Exceeded
**Symptoms**: Votes not recording, "quota exceeded" errors

**Response**:
1. Pause new vote submissions (toggle in admin)
2. Display message: "High traffic, voting paused for 60 seconds"
3. Upgrade Firebase plan (Blaze with higher quota)
4. Resume voting
5. Post-incident: Add Redis for high-write scenarios

---

### Scenario 2: Payment Webhook Delayed
**Symptoms**: User paid R20, balance not updated

**Response**:
1. Check PayFast webhook logs (admin dashboard)
2. Manual reconciliation (match payment ID to wallet)
3. Credit wallet manually (admin action, logged)
4. Email user confirmation
5. Post-incident: Add webhook retry logic

---

### Scenario 3: Vote Count Glitch Reported
**Symptoms**: User claims vote not counted

**Response**:
1. Check `cupfinal_votes` for user's vote record
2. Verify wallet deduction logged
3. Verify tally updated in distributed counter
4. If vote missing: Manual investigation (check Cloud Function logs)
5. If user error: Explain with screenshot
6. If system error: Public apology + refund

---

### Scenario 4: Suspected Fraud (Multi-Account)
**Symptoms**: 50 accounts, same IP, voting for same option

**Response**:
1. Flag all accounts (admin dashboard)
2. Pause their voting ability
3. Review payment methods (same card? Different?)
4. If fraud confirmed: Ban accounts, void votes
5. If legitimate (e.g., café with shared Wi-Fi): Unban, apologize

---

### Scenario 5: Public Backlash ("Rigged Vote!")
**Symptoms**: Twitter claims vote was manipulated

**Response**:
1. Publish transparency report (vote logs, audit trail)
2. Offer external audit (third-party verification)
3. Show admin action logs (prove no tampering)
4. Public statement (professional, transparent)
5. If valid concern found: Acknowledge, fix, apologize

---

## ✅ Non-Negotiable Requirements

### Before Launch
1. ✅ Legal opinion confirming "not gambling"
2. ✅ Terms of Service (attorney-reviewed)
3. ✅ Load test passes (5,000 concurrent users)
4. ✅ Zero critical security vulnerabilities (Snyk scan)
5. ✅ Payment reconciliation tool works (admin tested)
6. ✅ Crisis management plan documented
7. ✅ 100 beta users tested successfully

### During Operation
1. ✅ Zero vote manipulation detected
2. ✅ 99.9% uptime during voting window
3. ✅ Payment success rate > 95%
4. ✅ Vote recording latency < 2 seconds
5. ✅ Admin response time < 5 minutes

### Post-Event
1. ✅ Transparency report published (vote logs)
2. ✅ Payment reconciliation complete (revenue matches votes)
3. ✅ User feedback survey sent
4. ✅ Post-mortem analysis (what went wrong/right)

---

## 📊 Success Metrics

### Primary KPIs
- **Total votes cast**: Target 100,000-500,000
- **Total users**: Target 10,000-50,000
- **Revenue**: Target R200,000-R1,000,000
- **Profit margin**: Target >50%
- **Fraud incidents**: Target 0

### Secondary KPIs
- **Payment success rate**: Target >95%
- **Vote recording latency**: Target <2 seconds
- **App uptime**: Target 99.9%
- **User retention**: Target 30% return for next tournament
- **Support tickets**: Target <1% of users

### Quality Metrics
- **Zero security breaches**
- **Zero vote tampering incidents**
- **Zero legal issues**
- **Positive media coverage**

---

## 🔮 Future Enhancements (Post-MVP)

### Phase 9+ (Future Tournaments)
1. **Mobile App** (React Native)
2. **Live Match Updates** (real-time scores)
3. **Social Features** (comment on votes, share results)
4. **Sponsorship Integration** (ads during voting)
5. **Multi-Sport Support** (basketball, rugby, cricket)
6. **International Payment** (Stripe for non-SA users)
7. **Phone Verification** (SMS for high-fraud cases)
8. **Blockchain Audit** (immutable public ledger)

---

## 📞 Contact & Support

### Development Team
- **Project Lead**: TBD
- **Backend Developer**: TBD
- **Frontend Developer**: TBD
- **DevOps**: TBD

### External Partners
- **Legal Counsel**: TBD (gambling law review)
- **Payment Gateway**: PayFast
- **Hosting**: Vercel
- **Monitoring**: Sentry

---

## 📄 License & Legal

### Platform
- **Owner**: Allied iMpact (Pty) Ltd
- **License**: Proprietary (not open source)
- **Data Residency**: South Africa (Firebase Africa region)

### Compliance
- **POPIA**: Compliant (privacy policy, data protection)
- **Gambling Act**: Not applicable (participatory voting, not gambling)
- **Consumer Protection Act**: Compliant (clear terms, no misleading claims)

---

## 🏁 Ready to Build

This README is the **single source of truth** for CupFinal.

All decisions are locked. All ambiguity is removed. All risks are identified.

**Next Step**: Phase 0 implementation (authentication, empty dashboards, Firestore setup).

---

**Last Updated**: January 15, 2026  
**Version**: 1.0.0-alpha  
**Status**: Architecture Locked ✅  
**Ready for Development**: YES ✅
