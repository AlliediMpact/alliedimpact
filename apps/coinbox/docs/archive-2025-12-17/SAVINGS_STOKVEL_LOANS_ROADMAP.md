# Savings Jar, Stokvel & Micro-Loans Implementation Roadmap

**Status:** Planning Phase  
**Target Start:** After current app stabilization  
**Estimated Duration:** 6-8 weeks  
**Risk Level:** High (involves money movement)

---

## 🎯 Overview

This document outlines the phased implementation plan for three major financial features:

1. **Savings Jar** (Round-Up 1%) - Auto-save from profits
2. **Peer Group Savings (Stokvel)** - Risk-based group savings with rotation
3. **Emergency Micro-Loans** - 7-day, 10% interest loans with AI risk assessment

---

## 📋 Phase 0: Prerequisites (Week 0)

**Must Complete Before Starting:**

- [x] All test users verified and functional
- [x] Firebase permissions fixed
- [x] Current app stable with no critical bugs
- [ ] Security audit of wallet/transaction systems
- [ ] Legal review of loan terms and stokvel structure
- [ ] Compliance check with South African financial regulations
- [ ] Backup and rollback plan documented

**Blockers to Resolve:**
- Firebase QUIC protocol errors (if persistent)
- Any outstanding permission issues
- Production environment testing

---

## 🔐 Phase 1: Foundation & Security (Week 1-2)

### Objectives
- Establish secure money movement framework
- Create feature flags system
- Set up idempotency mechanisms

### Deliverables

#### 1.1 Feature Flags System
```typescript
// src/lib/features.ts
export const FEATURES = {
  SAVINGS_JAR: false,           // Default disabled
  STOKVEL: false,               // Default disabled
  MICRO_LOANS: false,           // Default disabled
  SAVINGS_JAR_ON_STOKVEL: true  // Config
}
```

#### 1.2 Security & Idempotency
- **File:** `src/lib/operation-logger.ts`
  - Idempotent operation tracking
  - Unique operation IDs
  - Audit trail for all money movements

- **File:** `src/lib/transaction-validator.ts`
  - Server-side validation
  - Amount limits check
  - Balance verification

#### 1.3 Membership Utils Extension
- **File:** `src/lib/membership-utils.ts`
  ```typescript
  export async function remainingSecurity(userId: string): Promise<number> {
    const tier = await getUserTier(userId);
    const securityFee = tier.securityFee;
    const outstanding = await sumOutstandingLoans(userId);
    return securityFee - outstanding;
  }
  ```

### Success Criteria
- ✅ Feature flags toggleable via env variables
- ✅ All money operations have unique IDs
- ✅ Idempotency tests pass 100%
- ✅ Security audit completed

**Estimated Effort:** 40 hours  
**Risk:** Medium

---

## 💰 Phase 2: Savings Jar (Week 3-4)

### 2.1 Backend Service
**File:** `src/lib/savings-jar-service.ts`

**Core Functions:**
```typescript
export class SavingsJarService {
  // Auto-deposit 1% on profit events
  async autoDeposit(userId: string, profitAmount: number, source: string, operationId: string)
  
  // Manual top-up
  async manualDeposit(userId: string, amount: number, operationId: string)
  
  // Withdrawal (min R100, 1% fee)
  async withdraw(userId: string, amount: number, operationId: string)
  
  // Get balance
  async getBalance(userId: string): Promise<number>
  
  // Get transaction history
  async getHistory(userId: string, limit: number): Promise<SavingsTransaction[]>
}
```

### 2.2 Database Collections
```
Firestore:
- savingsJar/{userId}
  - balance: number
  - totalDeposited: number
  - totalWithdrawn: number
  - autoThreshold: number (default 100)
  - createdAt: timestamp
  - updatedAt: timestamp

- savingsJarTransactions/{txId}
  - userId: string
  - type: 'deposit' | 'withdrawal' | 'auto_deposit'
  - amount: number
  - source: string (e.g., 'loan_profit', 'crypto_profit', 'manual')
  - operationId: string (unique)
  - createdAt: timestamp
  - status: 'completed' | 'pending' | 'failed'
```

### 2.3 API Endpoints
- `POST /api/savings-jar/deposit` - Manual deposit
- `POST /api/savings-jar/withdraw` - Withdraw funds
- `GET /api/savings-jar/balance` - Get balance
- `GET /api/savings-jar/history` - Transaction history
- `PUT /api/savings-jar/settings` - Update auto-threshold

### 2.4 Frontend UI
**File:** `src/app/[locale]/dashboard/savings-jar/page.tsx`

**Features:**
- Balance display card
- Transaction history table
- Manual top-up form
- Withdrawal button (disabled if < R100)
- Auto-threshold slider
- Monthly statement download

### 2.5 Integration Hooks
Add auto-deposit triggers to:
- Loan profit payouts (`src/lib/loan-service.ts`)
- P2P crypto profits (`src/lib/p2p-crypto/service.ts`)
- Stokvel payouts (when implemented)
- Referral payouts (`src/lib/referral-service.ts`)

### Success Criteria
- ✅ 1% auto-deposits from all profit sources
- ✅ Manual deposits work correctly
- ✅ Withdrawals apply 1% fee correctly
- ✅ Balance calculations accurate to cent
- ✅ All operations idempotent
- ✅ UI responsive and accessible

**Estimated Effort:** 60 hours  
**Risk:** Low-Medium

---

## 🤝 Phase 3: Stokvel (Week 5-7)

### 3.1 Backend Service
**File:** `src/lib/stokvel-service.ts`

**Core Functions:**
```typescript
export class StokvelService {
  // Create group (requires ≥12 referrals)
  async createGroup(creatorId: string, config: StokvelConfig, operationId: string)
  
  // Join group (validates remaining security)
  async joinGroup(userId: string, groupId: string, operationId: string)
  
  // Contribute (applies 1% fee)
  async contribute(userId: string, groupId: string, amount: number, operationId: string)
  
  // Process payout (FIFO rotation)
  async processPayout(groupId: string, operationId: string)
  
  // Emergency exit (admin only)
  async emergencyExit(userId: string, groupId: string, adminId: string, reason: string)
  
  // Validate membership tier limits
  async validateGroupConfig(userId: string, config: StokvelConfig): Promise<ValidationResult>
}
```

### 3.2 Business Rules Implementation

**Group Creation Eligibility:**
```typescript
async function canCreateGroup(userId: string): Promise<boolean> {
  const referralCount = await countDirectReferrals(userId);
  return referralCount >= 12;
}
```

**Join Validation (Pure Risk-Based):**
```typescript
async function canJoinGroup(userId: string, group: StokvelGroup): Promise<boolean> {
  const contributionAmount = group.contributionAmount;
  const groupSize = group.size;
  const newExposure = contributionAmount * groupSize;
  
  const remainingSec = await remainingSecurity(userId);
  const currentExposure = await sumAllStokvelExposures(userId);
  
  return (currentExposure + newExposure) <= remainingSec;
}
```

**Tier-Based Limits:**
```typescript
const TIER_LIMITS = {
  Basic: { maxGroupValue: 0, canCreate: false },
  Ambassador: { maxGroupValue: 0, canCreate: false },
  VIP: { maxGroupValue: 5000, canCreate: true, specialGroups: ['R1000x5'] },
  Business: { maxGroupValue: 10000, canCreate: true, specialGroups: ['R2000x5'] }
};
```

### 3.3 Database Collections
```
Firestore:
- stokvelGroups/{groupId}
  - creatorId: string
  - name: string
  - contributionAmount: number
  - size: number (max participants)
  - frequency: 'weekly' | 'monthly'
  - status: 'CREATED' | 'OPEN' | 'FULL' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  - members: Array<{userId, joinedAt, position, status}>
  - currentRound: number
  - totalRounds: number
  - createdAt: timestamp
  
- stokvelContributions/{contributionId}
  - groupId: string
  - userId: string
  - round: number
  - amount: number
  - platformFee: number (1%)
  - operationId: string
  - status: 'pending' | 'completed' | 'failed'
  - createdAt: timestamp
  
- stokvelPayouts/{payoutId}
  - groupId: string
  - round: number
  - recipientId: string
  - totalAmount: number
  - savingsJarAmount: number (1% to savings)
  - netAmount: number
  - operationId: string
  - paidAt: timestamp
```

### 3.4 API Endpoints
- `POST /api/stokvel/create` - Create group
- `POST /api/stokvel/join/:groupId` - Join group
- `POST /api/stokvel/contribute/:groupId` - Make contribution
- `GET /api/stokvel/groups` - List available groups
- `GET /api/stokvel/group/:id` - Group details
- `GET /api/stokvel/my-groups` - User's groups
- `POST /api/admin/stokvel/emergency-exit` - Admin emergency exit
- `POST /api/admin/stokvel/liquidate` - Admin liquidation

### 3.5 Frontend UI
**Pages:**
1. `src/app/[locale]/stokvel/page.tsx` - Browse groups
2. `src/app/[locale]/stokvel/create/page.tsx` - Create group
3. `src/app/[locale]/stokvel/group/[id]/page.tsx` - Group detail
4. `src/app/[locale]/stokvel/my-groups/page.tsx` - My groups

**Components:**
- `src/components/stokvel/GroupCard.tsx`
- `src/components/stokvel/ContributionForm.tsx`
- `src/components/stokvel/PayoutQueue.tsx`
- `src/components/stokvel/EligibilityCheck.tsx`

### Success Criteria
- ✅ Only users with ≥12 referrals can create groups
- ✅ Join validation uses pure risk-based calculation
- ✅ FIFO payout rotation works correctly
- ✅ 1% fee collected on contributions
- ✅ Emergency exit liquidates savings jar + security
- ✅ No member can exit before cycle completion
- ✅ All operations atomic and idempotent

**Estimated Effort:** 100 hours  
**Risk:** High

---

## 🏦 Phase 4: Emergency Micro-Loans (Week 8-10)

### 4.1 Backend Services

**File:** `src/lib/microloan-service.ts`
```typescript
export class MicroLoanService {
  // Apply for loan (runs risk assessment)
  async applyForLoan(borrowerId: string, amount: number, operationId: string)
  
  // Fund loan (investor side)
  async fundLoan(investorId: string, loanId: string, amount: number, operationId: string)
  
  // Repay loan
  async repayLoan(loanId: string, amount: number, operationId: string)
  
  // Handle default
  async handleDefault(loanId: string, adminId: string)
  
  // Calculate available loan amount
  async getAvailableLoanAmount(userId: string): Promise<number>
}
```

**File:** `src/lib/risk-scoring.ts`
```typescript
export class RiskScoringService {
  // Rule-based risk assessment (MVP)
  async assessBorrowerRisk(userId: string): Promise<RiskScore> {
    const factors = {
      repaymentHistory: await getRepaymentRate(userId),
      savingsJarBalance: await getSavingsBalance(userId),
      referralQuality: await getReferralScore(userId),
      timeOnPlatform: await getDaysSinceJoined(userId),
      membershipTier: await getUserTier(userId),
      openLoans: await getOpenLoansCount(userId)
    };
    
    return calculateRiskScore(factors);
  }
  
  // TODO: Replace with ML model later
  async assessWithML(userId: string): Promise<RiskScore> {
    throw new Error('ML model not implemented yet');
  }
}
```

### 4.2 Business Rules

**Loan Limits by Tier:**
```typescript
const MICRO_LOAN_LIMITS = {
  Basic: { maxConcurrent: 200, requiresScore: 70 },
  Ambassador: { maxConcurrent: 400, requiresScore: 65 },
  VIP: { maxConcurrent: 1000, requiresScore: 60 },
  Business: { maxConcurrent: 2000, requiresScore: 55 }
};
```

**Eligibility:**
```typescript
async function isEligibleForLoan(userId: string): Promise<boolean> {
  const repaymentRate = await getRepaymentRate(userId);
  const recentDefaults = await countDefaultsLast90Days(userId);
  
  return repaymentRate >= 0.90 && recentDefaults === 0;
}
```

**Interest Split:**
- Total: 10% flat
- Investor profit: 9%
- Investor Savings Jar: 1%

### 4.3 Database Collections
```
Firestore:
- microLoans/{loanId}
  - borrowerId: string
  - amount: number
  - interestAmount: number (10%)
  - totalRepayment: number
  - term: 7 (days)
  - dueDate: timestamp
  - status: 'pending' | 'funded' | 'active' | 'repaid' | 'defaulted'
  - riskScore: number
  - riskFactors: object
  - createdAt: timestamp
  - fundedAt: timestamp
  - repaidAt: timestamp
  - operationId: string
  
- microLoanFundings/{fundingId}
  - loanId: string
  - investorId: string
  - amount: number
  - expectedProfit: number (9%)
  - savingsJarProfit: number (1%)
  - status: 'escrowed' | 'active' | 'repaid' | 'defaulted'
  - operationId: string
  - createdAt: timestamp
  
- riskScores/{userId}
  - score: number (0-100)
  - factors: object
  - calculatedAt: timestamp
  - expiresAt: timestamp (cache 24h)
```

### 4.4 API Endpoints
- `POST /api/microloan/apply` - Apply for loan
- `POST /api/microloan/fund/:loanId` - Fund a loan (investor)
- `POST /api/microloan/repay/:loanId` - Repay loan
- `GET /api/microloan/available` - Available loans to fund
- `GET /api/microloan/my-loans` - Borrower's loans
- `GET /api/microloan/my-investments` - Investor's funded loans
- `POST /api/admin/microloan/default/:loanId` - Mark as default
- `GET /api/microloan/eligibility` - Check eligibility

### 4.5 Frontend UI
**Pages:**
1. `src/app/[locale]/microloans/page.tsx` - Overview & apply
2. `src/app/[locale]/microloans/invest/page.tsx` - Browse loans to fund
3. `src/app/[locale]/microloans/my-loans/page.tsx` - My loans
4. `src/app/[locale]/microloans/my-investments/page.tsx` - My investments

**Components:**
- `src/components/microloans/LoanApplicationForm.tsx`
- `src/components/microloans/RiskScoreDisplay.tsx`
- `src/components/microloans/LoanCard.tsx`
- `src/components/microloans/RepaymentCalculator.tsx`

### Success Criteria
- ✅ Risk assessment runs before approval
- ✅ Only eligible users can borrow
- ✅ 7-day term enforced
- ✅ 10% interest split correctly (9% + 1%)
- ✅ Escrow protects investor funds
- ✅ Default handling liquidates assets properly
- ✅ All operations idempotent

**Estimated Effort:** 120 hours  
**Risk:** Very High

---

## 🧪 Phase 5: Testing & QA (Week 11-12)

### 5.1 Unit Tests
- [ ] Savings Jar service tests (100% coverage)
- [ ] Stokvel service tests (100% coverage)
- [ ] Micro-loan service tests (100% coverage)
- [ ] Risk scoring tests
- [ ] Idempotency tests

### 5.2 Integration Tests
- [ ] End-to-end savings flow
- [ ] Full stokvel cycle (create → join → contribute → payout)
- [ ] Complete loan lifecycle (apply → fund → repay)
- [ ] Default handling flow

### 5.3 Manual QA Checklist
- [ ] Create savings jar account
- [ ] Test auto-deposit from various sources
- [ ] Test withdrawal with fee calculation
- [ ] Create stokvel group (as eligible user)
- [ ] Join group (validate remaining security)
- [ ] Complete full rotation cycle
- [ ] Apply for micro-loan
- [ ] Fund loan as investor
- [ ] Repay loan on time
- [ ] Test late payment penalties
- [ ] Test default scenario

### 5.4 Security Audit
- [ ] Penetration testing
- [ ] Code review by security expert
- [ ] Financial calculations verified by accountant
- [ ] Compliance review by legal team

**Estimated Effort:** 80 hours  
**Risk:** Medium

---

## 📊 Risk Assessment & Mitigation

### Critical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Money loss due to bugs | Critical | Medium | Extensive testing, feature flags, rollback plan |
| Default wave (micro-loans) | High | Medium | Conservative risk scoring, tier limits |
| Stokvel member defaults | High | Medium | Security deposit liquidation, admin tools |
| Regulatory non-compliance | Critical | Low | Legal review, FSCA consultation |
| Performance issues | Medium | Medium | Load testing, database optimization |
| Fraudulent activity | High | Medium | KYC enforcement, admin monitoring |

### Safety Measures
1. **Feature Flags** - Can disable instantly if issues arise
2. **Soft Limits** - Start with lower limits, increase gradually
3. **Beta Testing** - Roll out to 10-50 users first
4. **Admin Dashboard** - Real-time monitoring of all transactions
5. **Automated Alerts** - Trigger on suspicious patterns
6. **Daily Reconciliation** - Verify all balances match

---

## 📈 Rollout Strategy

### Stage 1: Internal Testing (Week 13)
- Enable for 5 internal accounts only
- Test all flows thoroughly
- Monitor for 1 week

### Stage 2: Closed Beta (Week 14-15)
- Enable for 10 trusted users
- Gather feedback
- Fix bugs
- Monitor financial metrics daily

### Stage 3: Limited Beta (Week 16-17)
- Enable for 50 selected users (good credit history)
- Lower limits initially:
  - Savings Jar: No changes (auto-enabled)
  - Stokvel: Max R500 groups only
  - Micro-Loans: Max R100 loans only
- Monitor for 2 weeks

### Stage 4: Gradual Rollout (Week 18+)
- Increase limits gradually
- Open to more users based on tier
- Full monitoring continues

---

## 🎯 Success Metrics

### Savings Jar
- **Adoption Rate:** >30% of active users
- **Average Balance:** >R200 per user
- **Withdrawal Rate:** <20% monthly

### Stokvel
- **Groups Created:** 10+ in first month
- **Completion Rate:** >90% of cycles complete
- **Default Rate:** <5%

### Micro-Loans
- **Loan Volume:** R10,000+ in first month
- **Repayment Rate:** >95%
- **Default Rate:** <3%
- **Investor ROI:** 9% average

---

## 💰 Cost Estimate

| Phase | Hours | Rate (R800/hr) | Total |
|-------|-------|----------------|--------|
| Phase 1: Foundation | 40 | R800 | R32,000 |
| Phase 2: Savings Jar | 60 | R800 | R48,000 |
| Phase 3: Stokvel | 100 | R800 | R80,000 |
| Phase 4: Micro-Loans | 120 | R800 | R96,000 |
| Phase 5: Testing | 80 | R800 | R64,000 |
| **Total** | **400** | | **R320,000** |

**Additional Costs:**
- Legal review: R20,000
- Security audit: R30,000
- Compliance: R15,000
- **Grand Total: R385,000**

---

## 📝 Required Environment Variables

```env
# Feature Flags
FEATURE_SAVINGS_JAR=false
FEATURE_STOKVEL=false
FEATURE_MICRO_LOANS=false
SAVINGS_JAR_ON_STOKVEL_PAYOUT=true

# Savings Jar Config
SAVINGS_JAR_AUTO_PERCENTAGE=0.01
SAVINGS_JAR_WITHDRAWAL_FEE=0.01
SAVINGS_JAR_MIN_WITHDRAWAL=100

# Stokvel Config
STOKVEL_PLATFORM_FEE=0.01
STOKVEL_MIN_REFERRALS_TO_CREATE=12

# Micro-Loans Config
MICROLOAN_TERM_DAYS=7
MICROLOAN_INTEREST_RATE=0.10
MICROLOAN_INVESTOR_SHARE=0.09
MICROLOAN_SAVINGS_JAR_SHARE=0.01
MICROLOAN_MIN_REPAYMENT_RATE=0.90
```

---

## 🚨 Emergency Procedures

### If Critical Bug Discovered:
1. Disable feature flag immediately
2. Notify all active users
3. Freeze all pending operations
4. Audit all completed transactions
5. Prepare rollback if needed

### Rollback Plan:
1. Disable feature flags
2. Cancel pending operations
3. Refund if necessary
4. Restore database to last known good state
5. Post-mortem analysis

---

## 📞 Stakeholders & Approvals Required

**Before Starting:**
- [ ] CEO approval on timeline
- [ ] CFO approval on financial risk
- [ ] Legal counsel approval on terms
- [ ] FSCA consultation complete
- [ ] Board approval on budget

**Weekly Check-ins:**
- Development team
- QA team
- Finance team
- Compliance officer

---

## ✅ Go/No-Go Decision Criteria

**Green Light (Proceed):**
- All prerequisites met
- Budget approved
- Legal/compliance clearance
- Team capacity available
- Current app stable

**Red Light (Postpone):**
- Current app has critical bugs
- Insufficient budget
- Legal concerns unresolved
- Team overloaded
- Regulatory uncertainty

---

## 📚 Documentation Deliverables

- [ ] Feature specification documents
- [ ] API documentation
- [ ] User guides (per feature)
- [ ] Admin guides
- [ ] Developer handover docs
- [ ] Test plans and results
- [ ] Security audit report
- [ ] Compliance checklist

---

**Last Updated:** December 12, 2025  
**Status:** Awaiting approval to proceed  
**Next Review:** After current app stabilization complete
