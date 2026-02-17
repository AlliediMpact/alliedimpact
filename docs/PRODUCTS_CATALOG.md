# 🧩 Allied iMpact – Products Catalog

**Purpose**: Complete catalog of all Allied iMp act applications - features, tech stack, PWA support, integration, status  
**Last Updated**: February 17, 2026  
**Status**: All 8 Production Apps Ready for February 25 Launch

---

## 📋 Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Product Categories](#2-product-categories)
3. [Production Applications](#3-production-applications-8-apps)
4. [Development Ports & Firebase Projects](#4-development-ports--firebase-projects)
5. [PWA Support](#5-pwa-support)
6. [Integration Patterns](#6-integration-patterns)

---

## 1. Platform Overview

Allied iMpact is a **multi-application ecosystem** built on a shared platform foundation.

### The Platform Provides

✅ **Authentication** - Single Sign-On across all apps  
✅ **Entitlement Management** - Who has access to what  
✅ **Unified Dashboard** - Central control center (Portal)  
✅ **Cross-App Notifications** - Activity across all products  
✅ **Subscription Handling** - Generic billing infrastructure  
✅ **PWA Support** - All apps installable to home screen (Feb 17, 2026)

### The Platform Does NOT

❌ **Own app business logic** - Apps are independent  
❌ **Control app pricing** - Each app sets own pricing  
❌ **Share app databases** - Isolation by design  
❌ **Make app-level decisions** - Apps are autonomous

---

## 2. Product Categories

All Allied iMpact products fall into **one of three categories**:

| Category | Business Model | Apps | Payment Model |
|----------|---------------|------|---------------|
| **Subscription** | User pays monthly/yearly | CoinBox, CareerBox, DriveMaster, EduTech, SportsHub | Direct subscription via Paystack |
| **Project-Based** | Client contracts | MyProjects | Contract-based, project lifecycle |
| **Internal/Platform** | Platform services | Portal, ControlHub | Free (no subscription) |

---

## 3. Production Applications (8 Apps)

### 🌐 Portal (Platform Hub)

**Port**: 3005  
**Firebase Project**: `allied-impact-platform`  
**Category**: Internal/Platform  
**Status**: ✅ **Production Ready**  
**URL**: alliedimpact.com

#### What It Does
Main platform entry point and unified dashboard:
- **Homepage**: Marketing landing page
- **Authentication**: Login, signup, password reset
- **Dashboard**: Unified view of all accessible apps
- **Product Catalog**: Browse all Allied iMpact products
- **Notifications Center**: Cross-app notifications
- **Settings**: User profile, preferences
- **Legal Pages**: Privacy, terms, cookies

#### Key Features
- SSO entry point for all apps
- Product access hub
- Cross-app activity feed
- Real-time notifications
- Legal compliance center

#### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Firebase Auth
- Vercel hosting

#### PWA Support (Feb 17, 2026)
- ✅ Installable to home screen
- ✅ Offline pages cached
- ✅ Cross-app navigation offline
- ✅ Service worker: Network-first for HTML, cache-first for static

#### Integration
- **Platform Services**: Auth, entitlements, notifications
- **Shared Firebase**: `allied-impact-platform` (shared with MyProjects)
- **Collections**: `platform_users`, `platform_entitlements`, `platform_subscriptions`, `platform_notifications`

---

### 🪙 CoinBox (P2P Financial Platform)

**Port**: 3000  
**Firebase Project**: `coinbox-ddc10`  
**Category**: Subscription  
**Status**: ✅ **Production Ready** | Version 2.1.0  
**URL**: coinbox.alliedimpact.com

#### What It Does
Peer-to-peer financial platform with comprehensive features:
- **P2P Loans**: Users create requests, investors fund them
- **Investments**: Earn 10-25% monthly returns
- **Crypto Trading**: P2P BTC, ETH, USDT, USDC marketplace with escrow
- **Savings Jars**: Automated savings with interest
- **Referral System**: Multi-level commissions (1-5%)
- **AI Predictions**: 7-day crypto price forecasts (Google Gemini)

#### Membership Tiers
| Tier | Monthly Fee | Loan Limit | Investment Limit | Commission |
|------|-------------|------------|------------------|------------|
| Basic | R550 | R500 | R5,000 | 1% |
| Ambassador | R1,100 | R1,000 | R10,000 | 2% |
| Premier | R2,200 | R5,000 | R50,000 | 3% |
| Executive | R5,500 | R10,000 | R100,000 | 5% |

#### Key Features
- **4-wallet system**: Main, Investment, Commission, Crypto
- **KYC verification**: Smile Identity integration
- **Escrow protection**: All trades secured
- **Transaction history**: Comprehensive audit trail
- **Multi-language**: English + Zulu (next-intl)

#### Tech Stack
- Next.js 14 (App Router)
- TypeScript (385+ tests)
- Firestore + Firebase Functions
- Paystack integration
- Docker support

#### PWA Support (Feb 17, 2026)
- ✅ Installable to home screen
- ✅ Offline wallet viewing
- ✅ Transaction history cached
- ✅ Crypto prices (last known values) offline
- ✅ Custom PWA implementation (263-line service worker)

#### Security
- **High-risk financial data** → Maximum isolation
- **KYC mandatory** → Identity verification required
- **Transaction limits** → Tier-based enforcement
- **Audit trail** → All actions logged
- **Firestore security rules**: 200+ lines

#### Integration
- Checks `coinbox` entitlement before access
- Independent Firebase project
- Paystack test keys: `pk_test_01b8360fcf741e6947b8ae55c51034e1d16cfac3`

---

###💼 CareerBox (Job Matching Platform)

**Port**: 3003  
**Firebase Project**: `careerbox-64e54`  
**Category**: Subscription  
**Status**: ✅ **Production Ready** | Version 1.0  
**URL**: careerbox.alliedimpact.com

#### What It Does
Comprehensive job matching and recruitment platform:
- **Job Listings**: Companies post opportunities
- **Candidate Profiles**: Job seekers create profiles
- **Smart Matching**: AI-powered job-candidate matching
- **Messaging System**: In-app communication
- **Application Tracking**: Track application status
- **Moderation System**: Content review and safety

#### User Types
- **Individuals** (Job Seekers): Search jobs, apply, track applications
- **Companies** (Recruiters): Post jobs, find candidates, hire

#### Key Features
- Tier-based access (Free, Professional, Executive)
- Real-time messaging
- Application pipeline
- Saved jobs
- Profile verification
- Multi-language support

#### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Firestore real-time
- Paystack integration
- Multi-language (next-intl)

#### PWA Support (Feb 17, 2026)
- ✅ Installable to home screen
- ✅ Offline saved jobs viewable
- ✅ Profile editing offline (syncs later)
- ✅ Job search results cached
- ✅ Service worker: Network-first with cache fallback

#### Integration
- Checks `careerbox` entitlement
- Independent Firebase project
- Firestore rules: 200+ lines (comprehensive security)
- Collections: `careerbox_individuals`, `careerbox_listings`, `careerbox_matches`, `careerbox_conversations`, `careerbox_messages`

---

### 🚗 DriveMaster (Driver Training)

**Port**: 3001  
**Firebase Project**: `drivemaster-513d9`  
**Category**: Subscription  
**Status**: ✅ **Production Ready**  
**URL**: drivemaster.alliedimpact.com

#### What It Does
Comprehensive learner's license training platform:
- **Theory Lessons**: Complete K53 curriculum
- **Practice Tests**: Mock exams with feedback
- **Progress Tracking**: Journey-based learning paths
- **Instructor Portal**: Manage students (future)
- **Certification**: Digital completion certificates

#### Learning Modules
- Road signs & markings
- Rules of the road
- Vehicle controls
- Hazard perception
- K53 defensive driving

#### Key Features
- Journey-based progress system
- Timed practice tests
- Performance analytics
- Offline learning support
- Progress sync

#### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Firestore + IndexedDB (offline)
- Paystack integration

#### PWA Support (Feb 17, 2026)
- ✅ Installable to home screen
- ✅ Continue journey offline
- ✅ Background sync for progress
- ✅ Push notifications for reminders
- ✅ IndexedDB for offline K53 questions
- ✅ Service worker: Journey-based caching (200+ lines)

#### Integration
- Checks `drivemaster` entitlement
- Independent Firebase project
- Error logging API (`/api/log-error`)

---

### 📚 EduTech (Educational Courses)

**Port**: 3007  
**Firebase Project**: `edutech-4f548`  
**Category**: Subscription  
**Status**: ✅ **Production Ready**  
**URL**: edutech.alliedimpact.com

#### What It Does
Educational courses platform with premium content:
- **Course Library**: Computer skills, coding, business
- **Enrollments**: Track course progress
- **Lesson Completion**: Mark lessons as done
- **Premium Plans**: Monthly/yearly subscriptions
- **Certificates**: Digital completion certificates

#### Course Categories
- **Computer Basics** (Free tier available)
- **Web Development** (Premium)
- **Python Programming** (Premium)
- **Business Skills** (Premium)

#### Key Features
- Free tier + premium courses
- Progress tracking per lesson
- Enrollment management
- Billing integration
- Multi-language support

#### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Firestore
- `@allied-impact/billing` integration
- Paystack

#### PWA Support (Feb 17, 2026)
- ✅ Installable to home screen
- ✅ Course videos cached
- ✅ Offline progress tracking
- ✅ Certificates viewable offline
- ✅ Service worker: Course content cache-first (110+ lines)

#### Integration
- Checks `edutech` entitlement
- APIs: `/api/check-entitlement`, `/api/enrollments`, `/api/create-checkout`, `/api/progress`
- Independent Firebase project

---

### ⚽ SportsHub (Sports Predictions & Voting)

**Port**: 3008  
**Firebase Project**: `sportshub-526df`  
**Category**: Subscription  
**Status**: ✅ **Production Ready** | Version 1.0  
**URL**: sportshub.alliedimpact.com

#### What It Does
Sports predictions, voting, and tournament management:
- **CupFinal Voting**: Vote for favorite teams
- **Live Tournaments**: Real-time tournament brackets
- **Leaderboards**: Top voters & predictors
- **Prediction Games**: Sports outcome predictions
- **Community Features**: Social engagement

#### Key Features
- Real-time voting
- Tournament management
- Prediction tracking
- Leaderboards
- Social sharing
- Push notifications

#### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Firestore real-time
- Paystack integration
- Firebase Authentication (full implementation - Feb 8, 2026)

#### PWA Support (Feb 17, 2026)
- ✅ Installable to home screen
- ✅ Offline vote queue (syncs when online)
- ✅ Live scores cached
- ✅ Real-time updates
- ✅ Service worker: Network-first for voting data (117+ lines)

#### Integration
- Checks `sportshub` entitlement
- Independent Firebase project
- Collections: `cupfinal_users`, `cupfinal_votes`, `cupfinal_tournaments`

---

### 📊 MyProjects (Project Management)

**Port**: 3006  
**Firebase Project**: `allied-impact-platform` (shared)  
**Category**: Project-Based  
**Status**: ✅ **Production Ready** | Version 1.0  
**URL**: myprojects.alliedimpact.com

#### What It Does
Project management for custom software solutions:
- **Projects**: Create and manage client projects
- **Milestones**: Define project phases
- **Deliverables**: Track deliverable versions
- **Tickets**: Issue tracking
- **Team Collaboration**: Multi-user teams
- **Bulk Operations**: Mass update/delete actions

#### Key Features
- **Rich Text Editor**: TipTap-based formatting
- **Version History**: Track all deliverable changes
- **Dependency Graphs**: Visual milestone dependencies
- **Advanced Search**: Full-text search with filters
- **Real-Time Updates**: Firestore listeners
- **Bulk Actions**: Multi-select operations

#### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Firestore
- TipTap rich text
- Real-time collaboration

#### PWA Support (Feb 17, 2026)
- ✅ Installable to home screen
- ✅ Project data cached
- ✅ Offline viewing
- ✅ Syncs when back online

#### Integration
- Project membership determines access (not subscriptions)
- Shared Firebase project with Portal
- Collections: `myprojects_projects`, `myprojects_milestones`, `myprojects_deliverables`, `myprojects_tickets`, `myprojects_comments`

---

### 🎛️ ControlHub (Platform Observability)

**Port**: 3010  
**Firebase Project**: `controlhub-6376f`  
**Category**: Internal/Platform  
**Status**: ✅ **Production Ready** | Version 1.0  
**URL**: controlhub.alliedimpact.com

#### What It Does
Internal platform monitoring and observability:
- **App Health Monitoring**: All 8 apps status
- **Metrics Dashboard**: Platform-wide analytics
- **Audit Logs**: Activity tracking
- **User Management**: Admin controls
- **Error Tracking**: Centralized errors
- **Performance Metrics**: Response times, uptime

#### Key Features
- Real-time health checks
- Critical alerts
- Audit trail
- Admin-only access
- Push notifications for issues
- Metrics dashboard cached

#### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Firestore
- Firebase Admin SDK
- Custom monitoring

#### PWA Support (Feb 17, 2026)
- ✅ Installable to home screen
- ✅ Dashboard metrics cached
- ✅ Audit logs viewable offline
- ✅ Health checks queue when offline
- ✅ Push notifications for critical alerts
- ✅ Service worker: Network-first (106+ lines)

#### Integration
- Admin-only (no entitlement check)
- Independent Firebase project
- Monitors all other apps

---

## 4. Development Ports & Firebase Projects

### Port Assignments

| App | Port | Development URL |
|-----|------|----------------|
| CoinBox | 3000 | http://localhost:3000 |
| DriveMaster | 3001 | http://localhost:3001 |
| CareerBox | 3003 | http://localhost:3003 |
| Portal | 3005 | http://localhost:3005 |
| MyProjects | 3006 | http://localhost:3006 |
| EduTech | 3007 | http://localhost:3007 |
| SportsHub | 3008 | http://localhost:3008 |
| ControlHub | 3010 | http://localhost:3010 |

### Firebase Projects

| Firebase Project | Apps | Collections Prefix | Purpose |
|-----------------|------|-------------------|---------|
| **allied-impact-platform** | Portal, MyProjects | `platform_*`, `myprojects_*` | Shared platform + MyProjects |
| **coinbox-ddc10** | CoinBox | `coinbox_*` | Financial platform data |
| **careerbox-64e54** | CareerBox | `careerbox_*` | Job platform data |
| **drivemaster-513d9** | DriveMaster | `drivemaster_*` | Learning platform data |
| **edutech-4f548** | EduTech | `edutech_*` | Course platform data |
| **sportshub-526df** | SportsHub | `cupfinal_*` | Sports platform data |
| **controlhub-6376f** | ControlHub | `controlhub_*` | Monitoring data |

**Total**: 7 Firebase projects for 8 apps (Portal + MyProjects share one)

---

## 5. PWA Support

### Implementation Date
**February 17, 2026** - All 8 apps now support Progressive Web App features

### Features Per App

| App | Installable | Offline Support | Push Notifications | Background Sync | Cache Strategy |
|-----|-------------|-----------------|-------------------|-----------------|----------------|
| **Portal** | ✅ | ✅ Cached pages | ❌ | ❌ | Network-first |
| **CoinBox** | ✅ | ✅ Custom (263-line SW) | ❌ | ❌ | Cache-first for transactions |
| **CareerBox** | ✅ | ✅ Saved jobs | ❌ | ✅ Applications | Network-first |
| **DriveMaster** | ✅ | ✅ Continue journey | ✅ Reminders | ✅ Progress | Journey-based caching |
| **EduTech** | ✅ | ✅ Course videos | ❌ | ✅ Progress | Course cache-first |
| **SportsHub** | ✅ | ✅ Vote queue | ✅ Updates | ✅ Votes | Network-first |
| **MyProjects** | ✅ | ✅ Cached data | ❌ | ❌ | Network-first |
| **ControlHub** | ✅ | ✅ Metrics dashboard | ✅ Critical alerts | ❌ | Network-first |

### Shared PWA Components

Located in: `packages/ui/src/components/`

- **PWAInstaller.tsx** - Install prompt (30s delay, 7-day dismiss)
- **ServiceWorkerRegistration.tsx** - Auto-register service workers in production

### Installation Flow

**Android/Desktop**:
1. Visit app in Chrome/Edge
2. After 30 seconds, install banner appears
3. Click "Install Now"
4. App icon added to home screen
5. Launches in standalone mode

**iOS**:
1. Visit app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. App icon added to home screen

---

## 6.Integration Patterns

### SSO Flow

```
1. User logs in to Portal (alliedimpact.com)
2. Firebase session saved in cookie
3. User clicks "Open CoinBox"
4. CoinBox validates Firebase session
5. CoinBox checks `coinbox` entitlement
6. If valid → User logged in automatically
7. If invalid → Redirect to subscription page
```

### Entitlement Check

```typescript
// All subscription apps check entitlements
import { hasEntitlement } from '@allied-impact/entitlements';

const canAccess = await hasEntitlement(userId, 'coinbox');

if (!canAccess) {
  redirect('/subscribe/coinbox');
}
```

### Payment Integration

All subscription apps use **Paystack**:

**Test Keys** (Development):
- Public: `pk_test_01b8360fcf741e6947b8ae55c51034e1d16cfac3`
- Secret: `sk_test_d3b31fb17c4586a72e280ce0602b19e0b9942601`

**Apps with Paystack**:
- ✅ CoinBox (membership tiers)
- ✅ CareerBox (subscription plans)
- ✅ DriveMaster (learner plans)
- ✅ EduTech (course subscriptions)
- ✅ SportsHub (premium features)

**Apps without Paystack**:
- ❌ Portal (free)
- ❌ MyProjects (contract-based)
- ❌ ControlHub (internal)

---

## 7. Launch Status Summary

**Launch Date**: February 25, 2026 (8 days away)

### All 8 Apps Ready ✅

| App | Status | Tests | PWA | Firestore Rules | Payment |
|-----|--------|-------|-----|-----------------|---------|
| Portal | ✅ Ready | Manual | ✅ | ✅ | N/A (free) |
| CoinBox | ✅ Ready | 385+ | ✅ Custom | ✅ 200+ lines | Paystack |
| CareerBox | ✅ Ready | Manual | ✅ | ✅ 200+ lines | Paystack |
| DriveMaster | ✅ Ready | Manual | ✅ | ✅ | Paystack |
| EduTech | ✅ Ready | Manual | ✅ | ✅ | Paystack |
| SportsHub | ✅ Ready | Manual | ✅ | ✅ | Paystack |
| MyProjects | ✅ Ready | Manual | ✅ | ✅ | N/A (project-based) |
| ControlHub | ✅ Ready | Manual | ✅ | ✅ | N/A (internal) |

**Total Blockers**: 0  
**PWA Implementation**: 100% Complete (Feb 17, 2026)  
**Ready for Launch**: ✅ YES

---

## 8. Future Roadmap

### Phase 2 (March 2026) - Post-Launch
- Native apps with Capacitor (Google Play + App Store)
- Advanced analytics across all apps
- API rate limiting improvements
- Enhanced notification system

### Phase 3 (April-June 2026)
- Third-party API integrations
- White-label platform for clients
- Advanced reporting dashboard
- Multi-currency support expansion

---

**Last Updated**: February 17, 2026  
**Active Production Apps**: 8  
**Total Firebase Projects**: 7  
**Launch Readiness**: 100%
