# DriveMaster - Development Roadmap

**Version:** 1.0  
**Date:** January 14, 2026  
**Target Launch:** Q2 2026 (June 30, 2026)

---

## Table of Contents

1. [Overview](#overview)
2. [Development Phases](#development-phases)
3. [Sprint Breakdown](#sprint-breakdown)
4. [Testing Strategy](#testing-strategy)
5. [Launch Criteria](#launch-criteria)
6. [Risk Mitigation](#risk-mitigation)

---

## 1. Overview

### Project Timeline

```
January 2026  │ Foundation Phase (Setup, Auth, UI)
February 2026 │ Core Features (Game Engine, Mastery)
March 2026    │ Gamification & Subscriptions
April 2026    │ Advanced Features (Offline, Ads)
May 2026      │ Polish & Testing (80%+ coverage)
June 2026     │ Launch Preparation & Go-Live
```

### MVP-First Approach

**What's In:**
- ✅ Journey-based learning (Beginner → K53)
- ✅ 95/97/98/100% mastery enforcement
- ✅ Credits & badges system
- ✅ Free/Trial/Paid subscriptions (R99 lifetime)
- ✅ Offline mode (Beginner only)
- ✅ Driving school Phase 1 (commission model)
- ✅ Certificates with disclaimers
- ✅ PayFast payment integration

**What's Out (Future):**
- ❌ In-app booking (Phase 2 design only)
- ❌ Multi-language support (English MVP only)
- ❌ Social features (leaderboards designed, not built)
- ❌ Instructor accounts (admin panel only)

---

## 2. Development Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Set up project structure, authentication, basic UI

**Tasks:**
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Set up Firebase (Auth, Firestore, Storage, Functions)
- [ ] Configure Tailwind CSS + Allied iMpact Design System
- [ ] Implement authentication flows:
  - [ ] Email/password registration
  - [ ] Email verification (mandatory)
  - [ ] Phone verification (for trial)
  - [ ] Password reset
- [ ] Build core layouts:
  - [ ] Landing page
  - [ ] Dashboard
  - [ ] Navigation (mobile + desktop)
- [ ] Set up environment variables (dev, staging, production)
- [ ] Configure ESLint, Prettier, Husky

**Deliverables:**
- Working authentication system
- Basic UI shell with responsive navigation
- Firebase project configured
- Local development environment ready

**Success Criteria:**
- User can register and log in
- Email verification works
- Dashboard displays user name
- Mobile-responsive UI

---

### Phase 2: Game Engine (Weeks 3-4)

**Goal:** Build journey orchestration and event system

**Tasks:**
- [ ] Create journey data model (Firestore schema)
- [ ] Build Game Engine service:
  - [ ] Load journey definition
  - [ ] Trigger events based on position
  - [ ] Present questions contextually
  - [ ] Handle answer validation
- [ ] Design journey UI:
  - [ ] Journey selection screen
  - [ ] Car selection screen
  - [ ] Journey progress visualization (map)
  - [ ] Event presentation (stop sign, traffic light)
- [ ] Implement question rendering:
  - [ ] Multiple choice
  - [ ] True/False
  - [ ] Image-based scenarios
- [ ] Build answer feedback system:
  - [ ] Correct answer (+10 credits)
  - [ ] Incorrect answer (-5 credits + explanation)
- [ ] Create checkpoint system (save progress)

**Deliverables:**
- Functional journey simulation
- At least 3 Beginner journeys playable
- Event-question linking works
- User can complete a full journey

**Success Criteria:**
- User can select a journey and car
- Journey progresses through events
- Questions appear contextually
- Answers are validated correctly
- Journey completes and shows summary

---

### Phase 3: Mastery System (Weeks 5-6)

**Goal:** Enforce 95/97/98/100% progression rules

**Tasks:**
- [ ] Build Mastery Service:
  - [ ] Calculate journey score
  - [ ] Validate stage completion
  - [ ] Block progression if threshold not met
- [ ] Implement stage gates:
  - [ ] Beginner → Intermediate (95%)
  - [ ] Intermediate → Advanced (97%)
  - [ ] Advanced → K53 (98%)
  - [ ] K53 completion (100%)
- [ ] Create progress tracking:
  - [ ] Record all journey attempts
  - [ ] Show attempt history
  - [ ] Display weak areas
- [ ] Build retry mechanism:
  - [ ] Shuffle questions on retry
  - [ ] Restart from checkpoint (not beginning)
- [ ] Design results screen:
  - [ ] Show score breakdown
  - [ ] Pass/Fail indicator
  - [ ] Next steps (retry or advance)

**Deliverables:**
- Mastery thresholds enforced
- User cannot skip stages
- Progress tracking working
- Retry mechanism functional

**Success Criteria:**
- User with 94% score cannot advance from Beginner
- User with 95% score can advance to Intermediate
- Question shuffling works on retry
- Progress history is accurate

---

### Phase 4: Gamification (Weeks 7-8)

**Goal:** Implement credits, badges, streaks

**Tasks:**
- [ ] Build Gamification Service:
  - [ ] Award/deduct credits
  - [ ] Track credit balance
  - [ ] Handle bankruptcy
- [ ] Define credit rules:
  - [ ] +10 correct answer
  - [ ] -5 incorrect answer
  - [ ] +50 perfect journey
  - [ ] +20 daily login
  - [ ] -15 quit journey
- [ ] Create badge system:
  - [ ] "First Journey" badge
  - [ ] "Perfect Score" badge
  - [ ] "Stage Master" badges (4 stages)
  - [ ] "Streak Champion" badge (7+ days)
- [ ] Implement streak tracking:
  - [ ] Daily activity detection
  - [ ] Streak counter
  - [ ] Streak bonus (+20 credits/day)
- [ ] Build profile page:
  - [ ] Display credits
  - [ ] Show badges
  - [ ] Display streak
  - [ ] Show statistics

**Deliverables:**
- Credits system functional
- Badges awarded automatically
- Streaks tracked correctly
- Profile page displays gamification data

**Success Criteria:**
- User earns credits for correct answers
- User loses credits for incorrect answers
- Badges are awarded when criteria met
- Daily streak increments correctly

---

### Phase 5: Subscriptions (Weeks 9-10)

**Goal:** Implement Free/Trial/Paid tiers with PayFast

**Tasks:**
- [ ] Build Subscription Service:
  - [ ] Check user tier
  - [ ] Validate access to stages
  - [ ] Enforce journey limits (Free: 3/day)
- [ ] Implement trial logic:
  - [ ] Check eligibility (email, phone, device)
  - [ ] Start 7-day trial
  - [ ] Send reminder emails (Day 5, Day 7)
  - [ ] Auto-downgrade on expiry
- [ ] Integrate PayFast:
  - [ ] Create payment form
  - [ ] Handle redirect flow
  - [ ] Validate ITN (webhook)
  - [ ] Update subscription on payment
- [ ] Build subscription UI:
  - [ ] Pricing page
  - [ ] "Start Trial" button
  - [ ] "Upgrade to Paid" button
  - [ ] Trial countdown timer
- [ ] Implement access gates:
  - [ ] Block Intermediate+ for Free users
  - [ ] Show "Upgrade" modal
- [ ] Add Stripe as fallback (basic integration)

**Deliverables:**
- Three tiers working (Free, Trial, Paid)
- Trial eligibility checks prevent abuse
- PayFast payment flow complete
- Trial expiry automation works

**Success Criteria:**
- Free user can only access Beginner
- Trial user gets 7 days of full access
- Paid user has lifetime access
- PayFast payment upgrades subscription
- Trial abuse prevention works

---

### Phase 6: Driving School Ads (Weeks 11-12)

**Goal:** Implement Phase 1 commission model

**Tasks:**
- [ ] Build school registration:
  - [ ] School owner sign-up
  - [ ] Profile creation (name, logo, contact)
  - [ ] Service region selection
- [ ] Implement ad subscription:
  - [ ] R499/3mo or R999/12mo plans
  - [ ] PayFast integration for schools
  - [ ] Auto-renew option
- [ ] Create ad placement system:
  - [ ] Home carousel
  - [ ] Discovery page
  - [ ] Journey completion screen
- [ ] Build lead tracking:
  - [ ] Record clicks
  - [ ] Learner contact form
  - [ ] "Confirm Conversion" for schools
- [ ] Calculate commissions:
  - [ ] 20% per confirmed lead
  - [ ] Generate monthly statements
  - [ ] Mark as paid (manual EFT)
- [ ] Build schools portal (schools.drivemaster.co.za):
  - [ ] Dashboard (leads, stats)
  - [ ] Profile editor
  - [ ] Commission history
- [ ] Design Phase 2 in-app booking:
  - [ ] Wireframes only
  - [ ] Database schema design
  - [ ] DO NOT implement

**Deliverables:**
- Schools can register and subscribe
- Ads displayed to Free/Trial users
- Leads tracked and confirmed
- Commission calculations working
- Schools portal functional

**Success Criteria:**
- School can create profile and subscribe
- Ads appear in designated placements
- Learner can contact school
- School can confirm conversions
- Commission report generates correctly

---

### Phase 7: Offline Mode (Weeks 13-14)

**Goal:** Enable Beginner content offline with sync validation

**Tasks:**
- [ ] Implement IndexedDB storage:
  - [ ] Cache Beginner journeys
  - [ ] Cache Beginner questions
  - [ ] Cache user profile
- [ ] Build Offline Service:
  - [ ] Detect online/offline state
  - [ ] Load cached content
  - [ ] Queue progress updates
- [ ] Create sync validation:
  - [ ] Timestamp integrity checks
  - [ ] Duration validation (not too fast)
  - [ ] Device fingerprint matching
- [ ] Handle conflicts:
  - [ ] Server data takes precedence
  - [ ] Merge non-conflicting changes
- [ ] Build sync UI:
  - [ ] "Syncing..." indicator
  - [ ] "Offline" badge
  - [ ] Sync errors notification
- [ ] Test offline scenarios:
  - [ ] Complete journey offline
  - [ ] Go back online
  - [ ] Progress syncs correctly

**Deliverables:**
- Beginner content available offline
- Progress queued while offline
- Sync validation prevents cheating
- Conflict resolution works

**Success Criteria:**
- User can complete Beginner journeys without internet
- Progress syncs when back online
- Suspicious submissions are flagged
- No data loss during sync

---

### Phase 8: Certificates (Weeks 15-16)

**Goal:** Generate PDF certificates with disclaimers

**Tasks:**
- [ ] Build Certificate Service:
  - [ ] Generate certificate number (DM-2026-00001)
  - [ ] Create PDF with user details
  - [ ] Add QR code for verification
- [ ] Design certificate template:
  - [ ] DriveMaster branding
  - [ ] User name, stage, score
  - [ ] Completion date
  - [ ] Mandatory disclaimers (4 statements)
- [ ] Implement verification:
  - [ ] Public URL (drivemaster.co.za/verify/{certNumber})
  - [ ] QR code links to verification page
  - [ ] Show certificate details
- [ ] Add certificate UI:
  - [ ] "Download Certificate" button (profile page)
  - [ ] Email certificate on stage completion
- [ ] Store certificates:
  - [ ] Firebase Storage (PDFs)
  - [ ] Firestore (metadata)

**Deliverables:**
- PDF certificates generated on stage completion
- Certificates include all 4 disclaimers
- QR code verification works
- User can download from profile

**Success Criteria:**
- Certificate PDF renders correctly
- All disclaimers visible
- QR code links to verification page
- Verification page shows correct details

---

### Phase 9: Polish & Testing (Weeks 17-19)

**Goal:** Achieve 80%+ test coverage, fix bugs, optimize performance

**Tasks:**
- [ ] Write unit tests (Jest):
  - [ ] Game Engine
  - [ ] Mastery Service
  - [ ] Gamification Service
  - [ ] Subscription Service
  - [ ] Target: 80%+ coverage
- [ ] Write integration tests:
  - [ ] Auth flows
  - [ ] Payment flows
  - [ ] Offline sync
- [ ] Write E2E tests (Playwright):
  - [ ] Complete journey (Beginner → K53)
  - [ ] Trial to paid conversion
  - [ ] Offline mode
  - [ ] Certificate generation
- [ ] Performance optimization:
  - [ ] Image optimization (Next.js Image)
  - [ ] Code splitting
  - [ ] Lazy loading
  - [ ] Service Worker caching
- [ ] Accessibility audit:
  - [ ] Keyboard navigation
  - [ ] Screen reader compatibility
  - [ ] WCAG 2.1 AA compliance
- [ ] Security audit:
  - [ ] Firestore rules testing
  - [ ] Payment webhook validation
  - [ ] Anti-cheat measures
- [ ] Load testing:
  - [ ] Simulate 1000 concurrent users
  - [ ] Test offline sync at scale
- [ ] Bug fixes and polish

**Deliverables:**
- 80%+ test coverage
- All E2E scenarios passing
- Performance score 90+ (Lighthouse)
- Accessibility score 90+ (Lighthouse)
- Security vulnerabilities resolved

**Success Criteria:**
- Test suite passes
- No critical bugs
- Performance meets targets
- Accessibility compliant

---

### Phase 10: Launch Preparation (Weeks 20-22)

**Goal:** Deploy to production, monitor, and support launch

**Tasks:**
- [ ] Set up production Firebase project
- [ ] Configure production environment variables
- [ ] Deploy to Vercel (production)
- [ ] Set up custom domain (drivemaster.co.za)
- [ ] Configure SSL certificate
- [ ] Set up monitoring:
  - [ ] Sentry error tracking
  - [ ] Firebase Analytics
  - [ ] Performance monitoring
- [ ] Create launch materials:
  - [ ] Landing page copy
  - [ ] Social media posts
  - [ ] Email announcement
- [ ] Prepare support:
  - [ ] FAQ page
  - [ ] Support email (support@drivemaster.co.za)
  - [ ] Admin panel for support team
- [ ] Run beta testing:
  - [ ] Invite 50 beta users
  - [ ] Collect feedback
  - [ ] Fix critical issues
- [ ] Legal review:
  - [ ] Terms of Service
  - [ ] Privacy Policy
  - [ ] Disclaimer pages
- [ ] Launch marketing:
  - [ ] Social media ads
  - [ ] Google Ads (K53 keywords)
  - [ ] Partnership with driving schools
- [ ] Go live!

**Deliverables:**
- Production deployment
- Monitoring dashboards
- Beta testing complete
- Launch materials ready
- Support channels active

**Success Criteria:**
- Production URL live
- No critical errors in production
- Beta users satisfied (NPS 8+)
- Support tickets handled within 24h
- Marketing campaigns launched

---

## 3. Sprint Breakdown

### Two-Week Sprints (11 sprints total)

| Sprint | Weeks | Phase | Goal |
|--------|-------|-------|------|
| Sprint 1 | 1-2 | Foundation | Auth & UI |
| Sprint 2 | 3-4 | Game Engine | Journey simulation |
| Sprint 3 | 5-6 | Mastery | Progression gates |
| Sprint 4 | 7-8 | Gamification | Credits & badges |
| Sprint 5 | 9-10 | Subscriptions | Free/Trial/Paid |
| Sprint 6 | 11-12 | Ads | School commission model |
| Sprint 7 | 13-14 | Offline | Sync validation |
| Sprint 8 | 15-16 | Certificates | PDF generation |
| Sprint 9 | 17-18 | Testing | 80%+ coverage |
| Sprint 10 | 19-20 | Polish | Performance & a11y |
| Sprint 11 | 21-22 | Launch | Production deployment |

---

## 4. Testing Strategy

### Unit Tests (Jest)

**Target:** 80%+ coverage

**Focus Areas:**
- Game Engine logic
- Mastery calculations
- Credit award/deduct rules
- Subscription tier checks
- Question shuffling
- Offline sync validation

**Example:**
```typescript
describe('MasteryService', () => {
  it('should pass user with 95% on Beginner stage', () => {
    const result = validateStageCompletion('beginner', 95);
    expect(result.passed).toBe(true);
  });

  it('should fail user with 94% on Beginner stage', () => {
    const result = validateStageCompletion('beginner', 94);
    expect(result.passed).toBe(false);
  });
});
```

---

### Integration Tests

**Focus Areas:**
- Auth flows (register → verify → login)
- Payment flows (create intent → redirect → webhook)
- Offline sync (cache → queue → sync)

---

### E2E Tests (Playwright)

**Critical Paths:**
1. **New User Journey:**
   - Register → Verify Email → Complete Beginner Journey → Pass (95%)
2. **Trial Conversion:**
   - Start Trial → Use for 5 days → Upgrade to Paid (R99)
3. **Offline Mode:**
   - Go Offline → Complete Journey → Go Online → Sync
4. **Certificate Generation:**
   - Complete K53 Stage → Download Certificate → Verify QR Code

---

### Load Testing

**Tools:** Apache JMeter or k6

**Scenarios:**
- 1000 concurrent users
- 100 journeys started/minute
- 50 payments/minute

---

## 5. Launch Criteria

### Must-Have (MVP)

- [x] All 10 phases complete
- [ ] 80%+ test coverage
- [ ] Performance score 90+ (Lighthouse)
- [ ] Accessibility score 90+ (Lighthouse)
- [ ] Security audit passed
- [ ] Beta testing complete (50 users)
- [ ] No critical bugs
- [ ] Production deployment successful
- [ ] Monitoring dashboards active
- [ ] Support channels ready

### Success Metrics (Q2 2026)

**Week 1:**
- 500 registered users
- 100 active users
- 10 paid subscriptions

**Month 1:**
- 2,000 registered users
- 500 active users
- 100 paid subscriptions
- R9,900 revenue

**Q3 2026:**
- 10,000 registered users
- 3,000 active users
- 1,000 paid subscriptions
- R99,000 revenue

**Q4 2026:**
- 50,000 registered users
- 15,000 active users
- 5,000 paid subscriptions
- R495,000 revenue

---

## 6. Risk Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Firebase quota exceeded | High | Medium | Implement caching, monitor usage |
| PayFast downtime | High | Low | Add Stripe fallback |
| Offline sync conflicts | Medium | Medium | Server validation, conflict resolution |
| Performance issues | Medium | Medium | Optimize images, code splitting |

### Business Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Low trial conversion | High | Medium | Improve onboarding, email reminders |
| Trial abuse | Medium | Medium | Email + phone + device fingerprinting |
| Content quality concerns | High | Low | K53 expert review, user feedback |
| Legal challenges | High | Low | Mandatory disclaimers, legal review |

### Operational Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Support overwhelmed | Medium | Medium | FAQ page, automated responses |
| Commission disputes | Medium | High | Clear terms, manual confirmation |
| Content updates slow | Low | Medium | Admin panel for content management |

---

## Next Steps

1. **Review and approve** this roadmap
2. **Start Sprint 1** (Foundation Phase)
3. **Daily standups** to track progress
4. **Weekly demos** to stakeholders

---

**Document Version:** 1.0  
**Last Updated:** January 14, 2026  
**Status:** Ready for Development
