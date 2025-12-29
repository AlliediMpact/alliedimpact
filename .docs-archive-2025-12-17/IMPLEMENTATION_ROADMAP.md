# 📅 Allied iMpact - Visual Implementation Roadmap

**Document**: Week-by-Week Implementation Guide  
**Date**: December 15, 2025  
**Total Duration**: 24 weeks (+ 5 week buffer = 29 weeks actual)

---

## 🎯 Roadmap Overview

```
START: January 2026
END: June 2026

┌────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION PHASES                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Phase 1: Platform Foundation        ████████░░░░░░░░░░ (3 weeks)  │
│  Phase 2: Coin Box Integration       ░░░░░░░░████░░░░░░ (2 weeks)  │
│  Phase 3: Drive Master               ░░░░░░░░░░████████ (4 weeks)  │
│  Phase 4: CodeTech                   ░░░░░░░░░░░░░░░░████████      │
│  Phase 5: Cup Final                  ░░░░░░░░░░░░░░░░░░░░░░████    │
│  Phase 6: uMkhanyakude               ░░░░░░░░░░░░░░░░░░░░░░░░██    │
│  Phase 7: Optimization               ░░░░░░░░░░░░░░░░░░░░░░░░░██   │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘

Week: 1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
```

---

## 📊 PHASE 1: Platform Foundation (Weeks 1-3)

### Week 1: Infrastructure Setup

**Monday - Day 1**
```
Morning:
├─ [2h] Create Azure Cosmos DB account
├─ [1h] Set up containers (platform_users, product_entitlements, platform_transactions)
├─ [1h] Configure partition keys and indexes
└─ [1h] Test basic read/write operations

Afternoon:
├─ [2h] Create /platform directory structure
├─ [2h] Initialize TypeScript types
└─ [1h] Set up CI/CD pipeline (GitHub Actions)

Deliverable: ✅ Cosmos DB operational + Directory structure created
```

**Tuesday-Wednesday - Days 2-3**
```
Platform Auth Service:
├─ [4h] Build auth-service.ts (extend Firebase Auth)
├─ [3h] Build cosmos-auth-adapter.ts
├─ [3h] Create auth-provider.tsx (React context)
├─ [2h] Write unit tests
└─ [2h] Integration testing

Deliverable: ✅ Platform auth service complete (12 hours total)
```

**Thursday-Friday - Days 4-5**
```
Entitlement Service:
├─ [4h] Build entitlement-service.ts
├─ [3h] Create product-guard.tsx (React component)
├─ [2h] Build middleware.ts (Next.js middleware)
├─ [2h] Write unit tests
└─ [1h] API endpoint testing

Deliverable: ✅ Entitlement system operational (12 hours total)
```

**Week 1 Summary**:
- ✅ 40 hours of work
- ✅ Cosmos DB set up
- ✅ Platform auth service complete
- ✅ Entitlement service complete
- ✅ All tests passing

---

### Week 2: User Migration & Dashboard

**Monday-Tuesday - Days 6-7**
```
Billing Service:
├─ [4h] Build billing-service.ts
├─ [3h] Integrate Paystack
├─ [3h] Create cosmos-transaction-log.ts
├─ [2h] Build payment API routes
└─ [2h] Write tests

Deliverable: ✅ Billing service operational (14 hours total)
```

**Wednesday-Thursday - Days 8-9**
```
User Migration:
├─ [3h] Write migration script (Firebase → Cosmos DB)
├─ [2h] Dry-run with 10 test users
├─ [2h] Automated validation script
├─ [2h] Manual verification checklist
├─ [2h] Rollback script
└─ [3h] Test migration on staging

Deliverable: ✅ Migration script ready (14 hours total)
```

**Friday - Day 10**
```
Product Selector Dashboard:
├─ [4h] Build /web app structure
├─ [3h] Create product selector UI
└─ [1h] Testing

Deliverable: ✅ User dashboard UI complete (8 hours total)
```

**Week 2 Summary**:
- ✅ 36 hours of work
- ✅ Billing service operational
- ✅ Migration script ready
- ✅ Dashboard UI complete
- ✅ Ready for Coin Box integration

---

### Week 3: Platform Finalization

**Monday-Wednesday - Days 11-13**
```
Notification Service:
├─ [4h] Build notification-service.ts
├─ [3h] Email channel (Nodemailer)
├─ [3h] SMS channel (Twilio)
├─ [2h] Push notifications (Firebase Cloud Messaging)
└─ [3h] Testing

Deliverable: ✅ Notification service complete (15 hours total)
```

**Thursday-Friday - Days 14-15**
```
Audit & Logging:
├─ [3h] Build audit-service.ts
├─ [3h] Cosmos DB logger
├─ [2h] Integration with platform services
├─ [2h] Monitoring dashboard setup (Azure Monitor)
└─ [2h] Testing

Deliverable: ✅ Audit system complete (12 hours total)
```

**Week 3 Summary**:
- ✅ 27 hours of work
- ✅ All platform services complete
- ✅ Monitoring set up
- ✅ Ready for Coin Box integration
- ✅ **PHASE 1 COMPLETE** ✅

---

## 📊 PHASE 2: Coin Box Integration (Weeks 4-5)

### Week 4: Coin Box Adaptation

**Monday - Day 16**
```
Project Restructuring:
├─ [3h] Move Coin Box to /apps/coinbox/
├─ [2h] Update import paths
├─ [2h] Test all existing functionality
└─ [1h] Fix any broken imports

Deliverable: ✅ Coin Box relocated (8 hours)
```

**Tuesday-Wednesday - Days 17-18**
```
Platform Integration:
├─ [4h] Update auth flow to use platform auth service
├─ [4h] Add entitlement checks to API routes
├─ [3h] Integrate with platform billing
├─ [3h] Update UI to integrate with platform nav
└─ [2h] Testing

Deliverable: ✅ Coin Box integrated (16 hours)
```

**Thursday - Day 19**
```
Database Migration:
├─ [2h] Prefix Coin Box collections (coinbox_*)
├─ [2h] Update Firestore rules
├─ [2h] Update all queries
└─ [2h] Testing

Deliverable: ✅ Database adapted (8 hours)
```

**Friday - Day 20**
```
Testing:
├─ [4h] Run all 343 existing tests
├─ [2h] Fix any failing tests
└─ [2h] Add integration tests

Deliverable: ✅ All tests passing (8 hours)
```

**Week 4 Summary**:
- ✅ 40 hours of work
- ✅ Coin Box integrated with platform
- ✅ All tests passing
- ✅ Ready for deployment

---

### Week 5: Testing & Validation

**Monday-Tuesday - Days 21-22**
```
End-to-End Testing:
├─ [4h] Test full user journey (signup → product activation → use)
├─ [4h] Test migration of 100 real users
├─ [3h] Load testing (1000 concurrent users)
└─ [3h] Security testing

Deliverable: ✅ E2E tests passing (14 hours)
```

**Wednesday - Day 23**
```
Deployment to Staging:
├─ [3h] Deploy platform + Coin Box to staging
├─ [2h] Run smoke tests
└─ [1h] Fix any deployment issues

Deliverable: ✅ Staging deployment successful (6 hours)
```

**Thursday-Friday - Days 24-25**
```
Beta Testing:
├─ [2h] Migrate 10 beta users
├─ [4h] Monitor for issues
├─ [2h] Gather feedback
├─ [2h] Fix critical issues
└─ [2h] Documentation

Deliverable: ✅ Beta testing complete (12 hours)
```

**Week 5 Summary**:
- ✅ 32 hours of work
- ✅ Platform + Coin Box tested
- ✅ Beta users successful
- ✅ **PHASE 2 COMPLETE** ✅
- ✅ **READY FOR PRODUCTION DEPLOYMENT** ✅

---

## 📊 PHASE 3: Drive Master (Weeks 6-9)

### Weeks 6-7: Drive Master Foundation

**Week 6**
```
Setup:
├─ [8h] Create /apps/drive-master structure
├─ [8h] Set up Firebase project (drivemaster-firebase)
├─ [8h] Design database schema
└─ [8h] Create TypeScript types

Deliverable: ✅ Drive Master foundation (32 hours)
```

**Week 7**
```
Core Features:
├─ [10h] Subscription management system
├─ [10h] Lesson content delivery
├─ [10h] Assessment/quiz engine
└─ [2h] Testing

Deliverable: ✅ Core features (32 hours)
```

---

### Weeks 8-9: Drive Master Integration & Launch

**Week 8**
```
Platform Integration:
├─ [8h] Integrate with platform auth
├─ [8h] Implement entitlements (free vs premium)
├─ [8h] Build Drive Master UI
└─ [8h] Testing

Deliverable: ✅ Drive Master integrated (32 hours)
```

**Week 9**
```
Testing & Launch:
├─ [8h] E2E testing
├─ [8h] Beta testing with 20 users
├─ [8h] Bug fixes
└─ [8h] Deployment + documentation

Deliverable: ✅ Drive Master launched (32 hours)
```

**Phase 3 Summary**:
- ✅ 128 hours total
- ✅ Drive Master operational
- ✅ Multi-product switching works
- ✅ **PHASE 3 COMPLETE** ✅

---

## 📊 PHASES 4-6: Remaining Products (Weeks 10-21)

### Phase 4: CodeTech (Weeks 10-13)
```
Similar structure to Drive Master:
├─ Week 10-11: Foundation (courses, certificates)
└─ Week 12-13: Integration & launch

Total: 128 hours
```

### Phase 5: Cup Final (Weeks 14-17)
```
Similar structure to Drive Master:
├─ Week 14-15: Foundation (events, teams, fans)
└─ Week 16-17: Integration & launch

Total: 128 hours
```

### Phase 6: uMkhanyakude (Weeks 18-21)
```
Similar structure to Drive Master:
├─ Week 18-19: Foundation (schools, content)
└─ Week 20-21: Integration & launch

Total: 128 hours
```

---

## 📊 PHASE 7: Optimization & Launch (Weeks 22-24)

### Week 22: Performance Optimization
```
├─ [8h] Optimize Cosmos DB queries
├─ [8h] Add caching (Redis)
├─ [8h] CDN setup for static assets
└─ [8h] Load testing (10,000 concurrent users)

Deliverable: ✅ Platform optimized (32 hours)
```

### Week 23: Security Hardening
```
├─ [8h] Penetration testing
├─ [8h] Fix security vulnerabilities
├─ [8h] Implement additional security features
└─ [8h] Security audit report

Deliverable: ✅ Security audit passed (32 hours)
```

### Week 24: Documentation & Launch
```
├─ [8h] Complete all documentation
├─ [8h] Create video tutorials
├─ [8h] Launch marketing campaign
└─ [8h] Production deployment

Deliverable: ✅ Platform launched (32 hours)
```

---

## 📈 Cumulative Progress Tracker

```
Week 1:  ████░░░░░░░░░░░░░░░░░░░░  (4%)   Platform setup
Week 2:  ████████░░░░░░░░░░░░░░░░  (8%)   User migration ready
Week 3:  ████████████░░░░░░░░░░░░  (12%)  Phase 1 complete ✅
Week 4:  ████████████████░░░░░░░░  (16%)  Coin Box integrated
Week 5:  ████████████████████░░░░  (20%)  Phase 2 complete ✅
Week 6:  ████████████████████░░░░  (24%)  Drive Master foundation
Week 7:  ████████████████████████  (28%)  Drive Master features
Week 8:  ████████████████████████  (32%)  Drive Master integrated
Week 9:  ████████████████████████  (36%)  Phase 3 complete ✅
Week 10: ████████████████████████  (40%)  CodeTech foundation
Week 11: ████████████████████████  (44%)  CodeTech features
Week 12: ████████████████████████  (48%)  CodeTech integrated
Week 13: ████████████████████████  (52%)  Phase 4 complete ✅
Week 14: ████████████████████████  (56%)  Cup Final foundation
Week 15: ████████████████████████  (60%)  Cup Final features
Week 16: ████████████████████████  (64%)  Cup Final integrated
Week 17: ████████████████████████  (68%)  Phase 5 complete ✅
Week 18: ████████████████████████  (72%)  uMkhanyakude foundation
Week 19: ████████████████████████  (76%)  uMkhanyakude features
Week 20: ████████████████████████  (80%)  uMkhanyakude integrated
Week 21: ████████████████████████  (84%)  Phase 6 complete ✅
Week 22: ████████████████████████  (88%)  Performance optimized
Week 23: ████████████████████████  (92%)  Security hardened
Week 24: ████████████████████████  (100%) LAUNCH 🚀
```

---

## 🎯 Key Milestones

| Week | Milestone | Deliverable | Status |
|------|-----------|-------------|--------|
| 3 | Phase 1 Complete | Platform foundation operational | ⏳ Pending |
| 5 | Phase 2 Complete | Coin Box integrated, all tests pass | ⏳ Pending |
| 9 | Phase 3 Complete | Drive Master launched | ⏳ Pending |
| 13 | Phase 4 Complete | CodeTech launched | ⏳ Pending |
| 17 | Phase 5 Complete | Cup Final launched | ⏳ Pending |
| 21 | Phase 6 Complete | uMkhanyakude launched | ⏳ Pending |
| 24 | LAUNCH | Allied iMpact platform live | ⏳ Pending |

---

## 📊 Resource Allocation

### Team Structure
```
Platform Team (2 developers):
├─ Weeks 1-5: Platform + Coin Box integration
└─ Weeks 22-24: Optimization + launch

Product Teams (2 developers each):
├─ Team A: Drive Master (Weeks 6-9)
├─ Team B: CodeTech (Weeks 10-13)
├─ Team A: Cup Final (Weeks 14-17)
└─ Team B: uMkhanyakude (Weeks 18-21)

QA (1 tester):
├─ Ongoing testing throughout all phases
└─ Focus on integration testing

DevOps (1 engineer):
├─ CI/CD setup (Week 1)
└─ Infrastructure management (ongoing)
```

### Hours Breakdown
```
Phase 1: 103 hours
Phase 2: 72 hours
Phase 3: 128 hours
Phase 4: 128 hours
Phase 5: 128 hours
Phase 6: 128 hours
Phase 7: 96 hours

Total: 783 hours
Buffer (20%): 157 hours
Grand Total: 940 hours (~23.5 weeks @ 40 hrs/week)
```

---

## 🚨 Critical Path Items

### Must Not Be Delayed
1. **Week 1**: Cosmos DB setup - blocks everything
2. **Week 5**: Coin Box integration complete - blocks new products
3. **Week 9**: Drive Master launch - proves multi-product works
4. **Week 24**: Production launch - hard deadline

### Can Be Parallelized
- CodeTech + Cup Final development (different teams)
- Documentation can happen during development
- Marketing can start at Week 18

### Buffer Allocation
- Weeks 1-5: +2 days (critical phase)
- Weeks 6-21: +1 day per product (4 weeks × 1 day = 4 days)
- Weeks 22-24: +1 week (final polish)
- **Total Buffer**: 5 weeks

---

## ✅ Weekly Checkpoints

### Every Monday
- [ ] Review previous week's progress
- [ ] Identify blockers
- [ ] Adjust timeline if needed
- [ ] Update stakeholders

### Every Friday
- [ ] Demo working features
- [ ] Commit all code
- [ ] Update documentation
- [ ] Plan next week

### End of Each Phase
- [ ] Phase retrospective
- [ ] Update risk assessment
- [ ] Adjust estimates for remaining phases
- [ ] Celebrate milestone 🎉

---

## 📞 Status Reporting

### Daily Standup (15 min)
- What did I do yesterday?
- What will I do today?
- Any blockers?

### Weekly Report (sent every Friday)
```
Subject: Allied iMpact - Week X Status Report

✅ Completed This Week:
- [List deliverables]

🚧 In Progress:
- [List ongoing work]

⚠️ Blockers:
- [List issues]

📅 Next Week:
- [List plans]

📊 Overall Status:
- On Track / At Risk / Behind Schedule
```

### Monthly Executive Summary
- High-level progress
- Budget vs actual
- Risk updates
- Next month's goals

---

**Document**: Visual Implementation Roadmap  
**Last Updated**: December 15, 2025  
**Status**: ⏳ Awaiting approval to begin

---

🚀 **Ready to start as soon as you approve!**
