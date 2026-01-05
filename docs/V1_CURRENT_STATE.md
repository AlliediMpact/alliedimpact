# Allied iMpact V1 - Current State

**Date**: January 5, 2026  
**Status**: Architecture Aligned - Ready for Comprehensive Analysis  
**Version**: 1.0

---

## Executive Summary

Allied iMpact V1 platform is **architecturally complete** after a major cleanup on January 5, 2026. The platform now accurately reflects our business reality: **2 user dashboards** (Individual + My Projects) and **1 admin dashboard**.

**Key Insight**: Specialized dashboards (Learner, Investor, Sponsor) belong in their respective apps (Drive Master, CodeTech, Cup Final, uMkhanyakude), not on the platform.

---

## Platform Architecture

### Dashboard Structure

**Platform Provides (Allied iMpact owns):**

1. **Individual Dashboard**
   - For: Anyone who subscribes to our apps
   - Shows: Product grid, active subscriptions, quick access
   - Users: Students, professionals, individuals subscribing to Coin Box, Drive Master, CodeTech, etc.

2. **My Projects Dashboard**
   - For: Anyone getting a custom solution
   - Shows: Project tracking, milestones, deliverables, support tickets
   - Users: NGO, school, government, business, individual (doesn't matter who they are - same dashboard)

3. **Admin Dashboard**
   - For: Platform administrators
   - Shows: Platform analytics, user management, system monitoring

**Apps Provide (Each app owns):**
- Drive Master: Learner dashboard (courses, progress, certificates)
- CodeTech: Learner dashboard (coding challenges, leaderboards)
- Cup Final: Sponsor/Investor dashboards (when features launch)
- uMkhanyakude: Sponsor/Investor dashboards (when features launch)

---

## User Archetypes (Simplified)

**Platform Archetypes** (Managed by Allied iMpact):

| Archetype | Description | Dashboard |
|-----------|-------------|-----------|
| `INDIVIDUAL` | App subscribers | Individual Dashboard |
| `MY_PROJECTS` | Custom solution clients | My Projects Dashboard |
| `ADMIN` | Platform administrators | Admin Dashboard |
| `SUPER_ADMIN` | Super administrators | Admin Dashboard (elevated) |

**App-Managed Types** (Not platform archetypes):
- Learner → Managed by Drive Master, CodeTech
- Investor → Managed by Cup Final, uMkhanyakude
- Sponsor → Managed by Cup Final, uMkhanyakude

---

## User Flows

### Flow 1: App Subscriber
1. User signs up on Allied iMpact
2. Lands on Individual Dashboard
3. Sees all available apps (Coin Box, Drive Master, CodeTech, etc.)
4. Subscribes to desired apps
5. Clicks app → Routes into app
6. App may show specialized dashboards (e.g., Learner dashboard in Drive Master)

### Flow 2: Custom Solution Client
1. Client signs contract (NGO, school, business, etc.)
2. Admin grants `MY_PROJECTS` archetype
3. Client lands on My Projects Dashboard
4. Sees their project progress, milestones, deliverables
5. Can submit support tickets
6. Tracks project health status

### Flow 3: Both
1. User is both app subscriber AND custom client
2. ViewSwitcher appears
3. Can switch between Individual Dashboard and My Projects Dashboard
4. Separate contexts, separate data

---

## What's Complete (V1 Ready)

### Infrastructure ✅
- Structured logging (Logger service)
- Rate limiting (Upstash Redis)
- Error tracking (Sentry)
- Analytics (Mixpanel - 12+ events)
- GDPR compliance (consent, policies, data APIs)
- Automated tests (24 tests, 60% coverage)
- CI/CD pipeline (GitHub Actions, 7 jobs)
- Firestore backups (automated, 30-day retention)

### Authentication & Access ✅
- Firebase Authentication integration
- SSO across all apps
- Entitlements system (5 access types)
- Role-based access control

### Individual Dashboard ✅
- Product grid (shows all apps)
- Subscription status display
- Active/inactive product indicators
- Quick access to subscribed apps
- Coin Box integration (production-ready)

### My Projects Dashboard ✅
- Project tracking (status, progress, health)
- Milestone visibility
- Deliverable tracking
- Support ticket management
- Project health indicators
- Mock data (needs backend API integration)

### Admin Dashboard ✅
- Platform statistics (users, revenue, active products)
- User management interface
- System health monitoring
- Recent activity tracking
- Mock data (needs real analytics integration)

### Core Features ✅
- ViewSwitcher (shows only when user has 2+ dashboards)
- Notifications Center (6 types, filtering, mark as read)
- Settings Pages (profile, notifications, privacy, billing)
- DashboardNav (responsive, mobile-friendly)
- Error handling & display
- Payment flow (PayFast ZAR + Stripe international)

---

## What Was Removed (January 5 Cleanup)

### Deleted Dashboards
- ❌ Learner Dashboard → Belongs in Drive Master/CodeTech
- ❌ Investor Dashboard → Belongs in Cup Final/uMkhanyakude
- ❌ Sponsor Dashboard → Belongs in Cup Final/uMkhanyakude
- ❌ Organization Dashboard → Merged into My Projects

### Deleted Services
- ❌ `platform/organizations/` → Not needed (clients are just projects)
- ❌ `platform/sponsorships/` → Belongs in respective apps

### Simplified Code
- Archetypes: 9 → 4 (removed 5 unnecessary types)
- ViewSwitcher: 7 views → 3 views
- Code deleted: 3,695 lines (premature features)
- Code preserved: 5,500+ lines (V1 core)

---

## Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui components

**Backend:**
- Firebase (Auth, Firestore, Storage, Functions)
- Upstash Redis (rate limiting)

**Integrations:**
- PayFast (South African payments)
- Stripe (international payments)
- Sentry (error tracking)
- Mixpanel (analytics)

**DevOps:**
- GitHub Actions (CI/CD)
- pnpm (monorepo management)
- Turborepo (build orchestration)

---

## Platform Services

**Active Services** (5):
1. `@allied-impact/auth` - Authentication & user management
2. `@allied-impact/billing` - Payment processing
3. `@allied-impact/entitlements` - Access control
4. `@allied-impact/notifications` - User notifications
5. `@allied-impact/shared` - Shared utilities
6. `@allied-impact/projects` - Project management (powers My Projects Dashboard)

---

## Integration Status

### Coin Box ✅ COMPLETE
- Uses `@allied-impact/auth` for authentication
- Entitlement checks on all routes
- Environment-aware routing
- Payment webhooks operational
- Production-ready integration

### Drive Master ⏳ PLANNED
- Will use `@allied-impact/auth`
- Will show on Individual Dashboard
- Learner dashboard inside Drive Master app
- Not yet integrated

### CodeTech ⏳ PLANNED
- Will use `@allied-impact/auth`
- Will show on Individual Dashboard
- Learner dashboard inside CodeTech app
- Not yet integrated

### Cup Final ⏳ PLANNED
- Will use `@allied-impact/auth`
- Will show on Individual Dashboard
- Investor/Sponsor dashboards inside Cup Final app
- Not yet integrated

### uMkhanyakude ⏳ PLANNED
- Will use `@allied-impact/auth`
- Will show on Individual Dashboard
- Investor/Sponsor dashboards inside uMkhanyakude app
- Not yet integrated

---

## What's Next

### Immediate (Before Testing)
1. **Comprehensive Analysis** - Review everything, identify gaps
2. **Feature Completeness Check** - Ensure nothing critical is missing
3. **Documentation Verification** - Confirm all docs are accurate

### Testing Phase
1. **Unit Tests** - Verify all components work
2. **Integration Tests** - Test dashboard switching, auth flow
3. **End-to-End Tests** - Full user journeys (signup → subscribe → use app)
4. **Edge Case Testing** - No auth, no subscription, expired entitlements

### Backend Integration (My Projects Dashboard)
1. Wire up real project data from Firestore
2. Implement milestone tracking APIs
3. Enable support ticket creation
4. Add file upload for deliverables
5. Real-time project health calculations

### Backend Integration (Admin Dashboard)
1. Wire up real user analytics
2. Connect revenue tracking
3. Platform health metrics from infrastructure
4. Real-time active user counts

### Launch Preparation
1. Performance optimization
2. Security audit
3. GDPR compliance verification
4. Payment flow testing (both PayFast and Stripe)
5. Error handling verification
6. Analytics tracking verification

---

## Known Limitations

### Mock Data
- My Projects Dashboard uses mock data (needs backend APIs)
- Admin Dashboard uses mock data (needs analytics integration)
- Notifications Center uses mock data (needs notification service)

### Missing Features
- No project file uploads yet
- No real-time project updates
- No admin user management interface (just UI)
- No automated user provisioning for custom clients
- No project health automation (manual updates needed)

### Integration Gaps
- Only Coin Box integrated (other apps not connected)
- No SSO testing with multiple apps
- Payment webhooks only tested with Coin Box

---

## Success Metrics (When Launched)

### Platform Adoption
- Users registered
- Active subscriptions
- App engagement rates
- ViewSwitcher usage (multi-role users)

### Business Metrics
- Revenue (subscription + custom projects)
- Churn rate
- Customer acquisition cost
- Lifetime value

### Technical Metrics
- Uptime (target: 99.9%)
- API response times (target: <200ms)
- Error rates (target: <0.1%)
- Test coverage (target: 80%+)

---

## Documentation Status

**Updated:**
- ✅ PLATFORM_AND_PRODUCTS.md - Reflects 2-dashboard structure
- ✅ ALLIED_IMPACT_PLATFORM_MODEL.md - Clarifies archetypes vs dashboards
- ✅ MASTER_IMPLEMENTATION_PLAN.md - Shows V1 phases, removes obsolete phases
- ✅ V1_CURRENT_STATE.md (this document)

**Archived:**
- 📦 PHASE_6_DASHBOARD_VIEWS_COMPLETE.md - Referenced deleted dashboards
- 📦 PHASE_7_COMPLETE.md - Learner/Investor dashboards (deleted)
- 📦 ALIGNMENT_ANALYSIS_AND_PROPOSAL.md - Based on wrong understanding
- 📦 COMPREHENSIVE_AUDIT_REPORT.md - Outdated analysis

**Still Valid:**
- ✅ Phase 1 docs (Infrastructure)
- ✅ Phase 2 docs (Individual Dashboard + Coin Box)
- ✅ CI/CD, Testing, Environment setup docs

---

## Team Guidance

### For Developers
1. **Read** PLATFORM_AND_PRODUCTS.md first
2. **Understand** the 2-dashboard model
3. **Remember** specialized dashboards live in apps, not platform
4. **Before coding** analyze existing code, don't duplicate
5. **Ask** if unsure about where features belong

### For Product/Business
1. Platform provides **identity + routing** (keeps it simple)
2. Apps provide **specialized features** (keeps them powerful)
3. Custom clients all use **same dashboard** (regardless of who they are)
4. Users can be **both subscribers and clients** (ViewSwitcher handles this)

### For Future Features
**Question: "Should this be on the platform or in an app?"**
- Platform: Identity, routing, project tracking (for custom clients)
- App: Everything else (courses, investments, sports, etc.)

---

## Conclusion

Allied iMpact V1 is **architecturally sound** after January 5, 2026 cleanup. We removed premature complexity and aligned with business reality.

**Core Strength:** Simple platform (2 dashboards) + powerful apps (with their own specialized features)

**Ready For:** Comprehensive analysis → Feature gap identification → Testing → Launch

---

_This document reflects the true state of V1 as of January 5, 2026._
