# 🧩 Allied iMpact – Platform & Products

**Purpose**: Comprehensive catalog of all Allied iMpact applications, how they work, and how they integrate with the platform.

**Audience**: Business stakeholders, developers, product managers, partners

**Status**: Complete product registry (updated January 2026)

---

## 1. Platform Overview

Allied iMpact is a **multi-application ecosystem** built on a shared platform foundation.

### The Platform Provides

✅ **Authentication** (Single Sign-On across all apps)  
✅ **Entitlement Management** (Who has access to what)  
✅ **Unified Dashboard** (Central control center)  
✅ **Cross-App Notifications** (Activity across all products)  
✅ **Subscription Handling** (Generic billing infrastructure)

### The Platform Does NOT

❌ **Own app business logic** (apps are independent)  
❌ **Control app pricing** (each app sets its own)  
❌ **Share app databases** (isolation by design)  
❌ **Make app-level decisions** (apps are autonomous)

---

## 2. Product Categories

All Allied iMpact products fall into **one of three categories**:

| Category | Business Model | Examples | Access Method |
|----------|---------------|----------|---------------|
| **Subscription** | User pays monthly/yearly | Coin Box, Drive Master, CodeTech | Direct subscription |
| **Impact/Sponsored** | Funded by sponsors/grants | uMkhanyakude, Youth Programs | Free or sponsored |
| **Custom/Project** | Client contracts | My Projects, Client Platforms | Project-based |

---

## 3. Production Applications ✅

### 🪙 Coin Box (Financial Platform)

**Status**: Production Ready | Version 2.1.0  
**Category**: Subscription  
**URL**: coinbox.alliedimpact.com

#### What It Does
Peer-to-peer financial platform enabling:
- **P2P Loans**: Users create loan requests, investors fund them
- **Investments**: Earn 10-25% monthly returns by funding loans
- **Crypto Trading**: P2P marketplace for BTC, ETH, USDT, USDC with escrow
- **Referral System**: Multi-level commissions (1-5%)
- **AI Predictions**: 7-day crypto price forecasts

#### Membership Tiers
| Tier | Monthly Fee | Loan Limit | Investment Limit | Commission |
|------|-------------|------------|------------------|------------|
| Basic | R550 | R500 | R5,000 | 1% |
| Ambassador | R1,100 | R1,000 | R10,000 | 2% |
| Premier | R2,200 | R5,000 | R50,000 | 3% |
| Executive | R5,500 | R10,000 | R100,000 | 5% |

#### Key Features
- **Wallet System**: Main, Investment, Commission, Crypto balances
- **KYC Verification**: Smile Identity integration
- **Escrow Protection**: All crypto trades secured
- **AI Insights**: Google Gemini for price predictions
- **Referral Tracking**: Multi-level commission structure

#### Integration with Platform
- Uses Firebase Auth for login
- Checks `coinbox` entitlement before granting access
- Sends cross-app notifications for major events
- Independent Firestore database (`coinbox-*` collections)

#### Security Considerations
- **High-risk financial data** → Maximum isolation
- **KYC required** → Identity verification mandatory
- **Transaction limits** → Enforced by membership tier
- **Audit trail** → All financial actions logged

---

### 📊 My Projects (Project Management)

**Status**: Production Ready | Version 1.0  
**Category**: Custom/Project-Based  
**URL**: myprojects.alliedimpact.com

#### What It Does
Project management platform for custom software development:
- **Project Tracking**: Milestones, deliverables, tickets
- **Team Collaboration**: Multi-user project teams
- **Version Control**: Deliverable version history
- **Dependency Management**: Visual milestone dependencies
- **Bulk Operations**: Multi-select actions across entities
- **Advanced Search**: Full-text search with filters

#### Use Cases
- **Client Projects**: Track custom software builds
- **NGO Solutions**: Manage sponsored platform development
- **Internal Projects**: Allied iMpact's own product development

#### Key Features
- **Rich Text Editor**: TipTap-based formatting
- **Version History**: Track all deliverable changes
- **Dependency Graphs**: Visual workflow planning
- **Bulk Actions**: Update/delete/export multiple items
- **Search & Filter**: Find anything in seconds
- **Real-Time Updates**: Firestore listeners for live sync

#### Integration with Platform
- Uses Firebase Auth for login
- Project membership determines access (not subscriptions)
- Independent Firestore database (`myprojects-*` collections)
- Supports team archetypes within projects

---

## 4. Active Development Applications 🚧

### 🚗 Drive Master (Driver Training)

**Status**: Active Development | Target: Q1 2026  
**Category**: Subscription  
**URL**: drivemaster.alliedimpact.com (staging)

#### What It Will Do
Comprehensive driver training and certification platform:
- **Learning Modules**: Theory and practical lessons
- **Practice Tests**: Mock K53 exams
- **Progress Tracking**: Learner dashboard
- **Instructor Portal**: Manage students
- **Certification**: Digital certificates on completion

#### Planned Tiers
- **Free**: Limited lessons, ads
- **Learner** (R99/month): Full access, no ads
- **Instructor** (R299/month): Manage students, analytics

#### Integration with Platform
- Uses platform auth
- `drivemaster_learner` and `drivemaster_instructor` archetypes
- Separate Firestore database

---

### 💻 CodeTech (Software Learning)

**Status**: Active Development | Target: Q2 2026  
**Category**: Subscription  
**URL**: codetech.alliedimpact.com (staging)

#### What It Will Do
Software development learning platform:
- **Coding Courses**: HTML, CSS, JavaScript, Python, etc.
- **Interactive Labs**: Code in browser
- **Projects**: Build real applications
- **Certifications**: Industry-recognized certificates
- **Job Board**: Connect learners with opportunities

#### Planned Tiers
- **Free**: Introductory courses
- **Pro** (R199/month): All courses, projects
- **Enterprise** (Custom): Team learning, analytics

#### Integration with Platform
- Uses platform auth
- `codetech_learner` archetype
- Separate Firestore database

---

### ⚽ Cup Final (Sports Management)

**Status**: Active Development | Target: Q2 2026  
**Category**: Impact/Sponsored  
**URL**: cupfinal.alliedimpact.com (staging)

#### What It Will Do
Sports tournament management and sponsorship platform:
- **Tournament Management**: Create and manage sports events
- **Team Registration**: Players and teams sign up
- **Live Scores**: Real-time match updates
- **Sponsorship**: Connect sponsors with tournaments
- **Crowdfunding**: Community-funded tournaments

#### Access Model
- **Free for players/teams**
- **Sponsorship-based funding**
- **Ads** for free tier

#### Integration with Platform
- Uses platform auth
- `sponsor` archetype for funding entities
- Separate Firestore database

---

### 🏫 uMkhanyakude (High Schools Portal)

**Status**: Active Development | Target: Q1 2026  
**Category**: Impact/Sponsored  
**URL**: umkhanyakude.alliedimpact.com (staging)

#### What It Will Do
Information portal for uMkhanyakude District high schools:
- **School Directory**: All high schools in district
- **News & Updates**: School announcements
- **Resources**: Educational materials
- **Events Calendar**: District-wide events
- **Contact Information**: Principal, staff, facilities

#### Access Model
- **Free to all users**
- **Sponsored by NGO or government**
- **No ads** (social impact focus)

#### Integration with Platform
- Uses platform auth
- No entitlement check (public access)
- Separate Firestore database

---

## 5. Login Flows

### Flow A: Login via Platform

```
1. User visits alliedimpact.com
2. Clicks "Log In"
3. Enters credentials (Firebase Auth)
4. Redirected to unified dashboard
5. Dashboard shows all available apps
6. User clicks "Coin Box"
7. SSO to coinbox.alliedimpact.com
8. Coin Box verifies entitlement
9. User enters Coin Box app
```

### Flow B: Direct App Login

```
1. User visits coinbox.alliedimpact.com directly
2. Clicks "Log In"
3. Enters credentials (Firebase Auth)
4. Coin Box verifies entitlement
5. User enters Coin Box app
6. Header shows "Back to Dashboard" link
7. User can navigate to other apps via dashboard
```

### Key Points

- **Same credentials** work everywhere
- **Same user account** across all apps
- **Entitlements checked** before app access
- **Session persists** across navigation

---

## 6. How Apps Connect to Platform

### Required Platform Integration

All apps MUST:
1. Use `@allied-impact/auth` for authentication
2. Check entitlements before granting access
3. Use shared TypeScript types from `@allied-impact/types`
4. Follow security principles in ARCHITECTURE_AND_SECURITY.md

### Optional Platform Integration

Apps MAY:
1. Use `@allied-impact/ui` for shared components
2. Use `@allied-impact/notifications` for cross-app alerts
3. Use `@allied-impact/billing` for subscription handling

### What Apps Own

Apps have full control over:
- Business logic and rules
- Database schema (Firestore collections)
- UI/UX design
- Feature roadmap
- Pricing (within category guidelines)

---

## 7. App Independence

Each app is **fully independent**:

### Can Scale Independently
- Own Vercel deployment
- Own Firebase project (optional)
- Own resource limits
- Own performance optimization

### Can Fail Independently
- If Coin Box crashes, Drive Master continues
- If My Projects is down, Coin Box works
- Dashboard shows app availability status

### Can Evolve Independently
- Each app has its own roadmap
- Features added without affecting others
- Pricing changes don't impact other apps

---

## 8. Cross-App Features

Some features span multiple apps:

### Notifications
Users receive notifications from all apps:
```
Dashboard Notification Center:
├── "New loan funded" (Coin Box)
├── "Project milestone completed" (My Projects)
├── "Course completed" (CodeTech)
└── "Tournament starting soon" (Cup Final)
```

### Activity Feed
Recent activity across all apps:
```
Dashboard Activity Feed:
├── Invested R500 in Coin Box
├── Completed milestone in My Projects
├── Earned certificate in CodeTech
└── Joined tournament in Cup Final
```

### Shared Profile
One profile used everywhere:
- Name, email, photo
- Preferences (theme, language, notifications)
- Multiple archetypes tracked

---

## 9. App Status Summary

| App | Status | Category | Users | Revenue Model |
|-----|--------|----------|-------|---------------|
| **Coin Box** | ✅ Production | Subscription | Active | R550-R5,500/month |
| **My Projects** | ✅ Production | Project-Based | Active | Contract-based |
| **Drive Master** | 🚧 Development | Subscription | 0 | R99-R299/month |
| **CodeTech** | 🚧 Development | Subscription | 0 | R199/month |
| **Cup Final** | 🚧 Development | Impact/Sponsored | 0 | Sponsorship |
| **uMkhanyakude** | 🚧 Development | Impact/Sponsored | 0 | Sponsored |

---

## 10. Roadmap

### Q1 2026
- ✅ Coin Box production stable
- ✅ My Projects production stable
- 🚧 Drive Master beta launch
- 🚧 uMkhanyakude beta launch

### Q2 2026
- CodeTech beta launch
- Cup Final beta launch
- Platform v3 (enhanced notifications)
- Mobile app for dashboard

### Q3-Q4 2026
- All apps production-ready
- 10,000+ active users target
- API for third-party integrations
- White-label platform for clients

---

## 11. Adding New Apps

See `DEVELOPMENT_AND_SCALING_GUIDE.md` for detailed instructions.

**Quick Checklist**:
- [ ] Determine category (Subscription/Impact/Custom)
- [ ] Create app in `apps/` folder
- [ ] Integrate with platform auth
- [ ] Define entitlement requirements
- [ ] Create Firestore collections (isolated)
- [ ] Document in app README
- [ ] Add to product registry
- [ ] Test SSO flow
- [ ] Deploy to staging

---

## 12. Support & Documentation

### Per-App Documentation
Each app has its own `README.md` with:
- Feature details
- Setup instructions
- API documentation
- Business logic explanations

### Platform Documentation
See 5 core docs:
1. `README.md` - Platform overview
2. `ALLIED_IMPACT_PLATFORM_MODEL.md` - Conceptual model
3. `PLATFORM_AND_PRODUCTS.md` (this file) - Product catalog
4. `ARCHITECTURE_AND_SECURITY.md` - Technical architecture
5. `DEVELOPMENT_AND_SCALING_GUIDE.md` - Developer guide

---

**This document serves as the authoritative product registry for Allied iMpact.**

---

**Last Updated**: January 6, 2026  
**Active Apps**: 6  
**Production Apps**: 2  
**Total Users**: Growing
