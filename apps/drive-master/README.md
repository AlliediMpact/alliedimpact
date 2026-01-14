# 🚗 DriveMaster

**South Africa's First Gamified Driving Education Platform**

> "Learn by Living the Journey" - Master driving through realistic journey-based simulation, strict mastery progression, and K53-compliant education.

**Port:** 3001  
**Launch Target:** Q2 2026  
**Product Type:** Subscription + Advertising Revenue

---

## 🎯 Product Vision

DriveMaster transforms South African learner license preparation from passive memorization into an engaging, gamified journey where users **drive virtually** through realistic scenarios, encounter real-world events, and master driving skills through **strict 95-100% mastery-based progression**.

### Core Philosophy

1. **Learn by Living the Journey** - Experience driving before getting behind the wheel
2. **Mastery Over Shortcuts** - Payment never bypasses learning requirements
3. **K53 Compliant** - Aligned with South African official standards
4. **Accessible** - R99 lifetime subscription (no recurring fees)
5. **Legal** - Clear positioning as preparation tool, not official testing

---

## 🎮 Game Concept

Instead of static theory, learners:

1. **Choose a car** (sedan, hatchback, SUV)
2. **Select a route** (residential, highway, city center)
3. **Drive virtually** through the journey
4. **Encounter events** - 4-way stop, pedestrian crossing, traffic light, etc.
5. **Answer questions** contextually tied to the event
6. **Earn/lose credits** based on performance
7. **Progress through stages** only with 95-100% mastery

### Journey Example:

```
You're driving in a residential area...
→ Event: 4-way stop sign appears
→ Question: "Who has right of way at a 4-way stop?"
   A) First to arrive
   B) Largest vehicle
   C) Vehicle on the right
   D) Honk to claim right

→ Answer correctly → +10 credits
→ Answer incorrectly → -5 credits + explanation shown
```

---

## 🕹️ Mastery-Based Progression (NON-NEGOTIABLE)

### Stage Hierarchy

| Stage | Pass Rate Required | Skip Allowed? | Payment Bypass? |
|-------|-------------------|---------------|------------------|
| **Beginner** | 95-100% | ❌ | ❌ |
| **Intermediate** | 97-100% | ❌ | ❌ |
| **Advanced** | 98-100% | ❌ | ❌ |
| **K53 Simulation** | 100% only | ❌ | ❌ |

### Progression Rules

- ✅ Must complete current stage before advancing
- ✅ Score below threshold → Journey **restarts** (questions reshuffled)
- ✅ Learning explanations shown on every incorrect answer
- ❌ No skipping stages
- ❌ No payment to bypass mastery
- ❌ No manual admin override

**Why?** Ensures learners are **truly prepared** for real-world driving and official K53 test.

---

## 💰 Subscription Model

### 1. Free Plan (Forever)

- ✅ Beginner level only
- ✅ Limited journeys per day (e.g., 3)
- ✅ Ads visible (driving school placements)
- ✅ Limited credits
- ✅ **Fully offline** (Beginner content)
- ❌ No Intermediate/Advanced/K53
- ❌ No certificates

**Target:** User acquisition, funnel to paid

### 2. 7-Day Free Trial (One-Time Only)

- ✅ Full access to all stages (Beginner → K53)
- ✅ No ads
- ✅ Unlimited credits (within game rules)
- ✅ Full offline access
- ✅ Auto-expires after 7 days
- ❌ No payment upfront
- ❌ No extension (trial abuse prevention)

**Trial Enforcement:**
- Email verification required
- Phone number verification required
- Basic device fingerprinting
- One trial per user/device

### 3. Paid Plan - R99 LIFETIME

- ✅ **Lifetime access** (one-time payment, no recurring)
- ✅ Full access to all stages
- ✅ No ads
- ✅ Unlimited journeys
- ✅ Full offline access
- ✅ Completion certificates (with disclaimers)
- ✅ Still bound by mastery rules (no shortcuts)

**Why R99?** Affordable for South African learners, removes barrier to education.

---

## 🏫 Driving School Advertising

### Two Revenue Streams

#### Phase 1: Commission Model (MVP - Build Now)

- Schools create profiles (name, region, contact)
- Learners click "Contact School" button
- School confirms conversion manually
- **20% commission** per converted learner
- Monthly commission statements via email
- EFT payments (offline accounting)

**Packages:**
- **R499** = 3 months visibility
- **R999** = 12 months visibility

#### Phase 2: In-App Booking (Future - Design Only)

- In-app booking system
- In-app payment processing
- Automatic 80/20 commission split
- 🚨 **Do NOT build now** - system must support later

### Ad Placement Rules

✅ **Allowed:**
- Home screen carousel
- Discovery/browse page
- Journey completion screen ("Congrats! Need a driving school?")

❌ **Forbidden:**
- During gameplay
- During questions
- During K53 simulation
- For paid subscribers (they see no ads)

**Empty Slots:** Show "Advertise your driving school here" with school portal link

---

## 🎯 Gamification System

### Credits (Virtual Currency)

- **Earn Credits:**
  - Correct answer: +10 credits
  - Perfect journey: +50 bonus
  - Daily streak: +20 credits
  - Complete stage: +100 credits

- **Lose Credits:**
  - Incorrect answer: -5 credits
  - Skip question (if allowed): -10 credits
  - Quit journey early: -15 credits

### Credit Bankruptcy

If user runs out of credits mid-journey:
- ✅ Restart from last checkpoint
- ❌ No loans
- ❌ No ads-for-credits (MVP)
- ❌ No real money purchase of credits

**Future:** May introduce optional recovery mechanics (not MVP).

### Badges

- 🏆 First Journey Complete
- ⭐ Perfect Score (100%)
- 🔥 7-Day Streak
- 🎓 Stage Mastery (95%+ on first try)
- 🚀 K53 Champion (100% first attempt)

---

## 📴 Offline Mode

### By Difficulty Level

| Level | Offline Support | Sync Required? |
|-------|----------------|----------------|
| **Beginner** | ✅ Fully offline | No (optional) |
| **Intermediate** | ⚠️ Partial offline | Yes (progress validation) |
| **Advanced** | ❌ Requires sync | Yes (anti-cheat) |
| **K53 Simulation** | ❌ Requires sync | Yes (certification) |

### Technical Approach

- Encrypted IndexedDB storage
- Offline queue for progress sync
- Server-side validation on sync
- Anti-exploit measures (timestamp checks, progress validation)

**Why?** Beginner content is fully accessible to everyone (social impact), higher tiers require validation.

---

## 📜 Certificates

### Format

- **PDF Certificate** (downloadable)
- Contains:
  - Learner name
  - Completion date
  - Stages completed
  - Certificate number (unique)
  - QR code verification link
  - **Mandatory Disclaimer:**
    > "This is a learning completion certificate issued by DriveMaster. It is NOT an official driver's license or government-issued document. This certificate indicates completion of educational content only."

### Social Sharing

- Optional feature (future)
- "Share on WhatsApp/Facebook"
- Encourages word-of-mouth growth

---

## 👥 User Types

### 1. Learners

- Primary user type
- Progress through stages
- Earn credits/badges
- Access certificates

### 2. Driving Schools

- Access to `schools.drivemaster.co.za` portal
- Create/edit profile
- View leads
- Track conversions
- Manage subscription (R499/R999)

### 3. Admins (Internal)

- Content management (journeys, questions)
- User management
- Driving school approvals
- Analytics dashboard
- Commission tracking

---

## 🚨 Legal Positioning (MANDATORY)

### Required Disclaimers

Must appear on:
- ✅ Signup page
- ✅ Certificates
- ✅ Marketing materials
- ✅ Footer of every page

**Standard Disclaimer:**

> "DriveMaster is an educational platform designed to prepare learners for the official South African K53 driver's license test. We are NOT:
> - A government authority
> - An official testing center
> - A replacement for official K53 testing
> - A guarantee of passing the official test
> 
> DriveMaster is a preparation tool only. Official testing must be completed at an accredited testing center."

---

## 🏗️ Technical Architecture

### Core Modules

1. **Game Engine** - Journey orchestration, event triggering
2. **Mastery & Progression** - 95/97/98/100% scoring logic
3. **Gamification** - Credit/badge system
4. **Offline Sync** - Encrypted IndexedDB, queue management
5. **Subscription & Entitlements** - Free/Trial/Paid logic
6. **Advertising** - School profiles, ad placement rules
7. **Content Management** - Journeys, questions, routes
8. **User Management** - Profiles, progress tracking

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS + Allied iMpact Design System
- **Backend:** Firebase
  - Auth: User authentication
  - Firestore: Database
  - Storage: Images, certificates
  - Functions: Server-side logic
- **Payment:** PayFast (primary), Stripe (fallback)
- **Offline:** IndexedDB + Service Workers
- **Testing:** Jest + Playwright
- **Monitoring:** Sentry

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js 18+
pnpm 8+
Firebase account
PayFast merchant account (production)
```

### Installation

```bash
# Install dependencies
cd apps/drive-master
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in Firebase config, PayFast credentials

# Run development server
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001)

### Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# PayFast
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_SCHOOLS_PORTAL_URL=http://localhost:3002
```

---

## 📁 Project Structure

```
apps/drive-master/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── dashboard/          # Learner dashboard
│   │   │   ├── journey/            # Journey gameplay
│   │   │   ├── progress/           # Progress tracking
│   │   │   ├── certificates/       # Certificate management
│   │   │   ├── schools/            # Driving school directory
│   │   │   └── pricing/            # Subscription page
│   │   └── api/
│   │       ├── webhooks/payfast/   # Payment webhooks
│   │       └── sync/               # Offline sync endpoint
│   ├── components/
│   │   ├── game/                   # Game engine components
│   │   ├── journey/                # Journey UI
│   │   ├── mastery/                # Progression tracking
│   │   └── schools/                # Driving school components
│   ├── services/
│   │   ├── gameEngine.ts           # Journey orchestration
│   │   ├── masteryService.ts       # Progression logic
│   │   ├── gamificationService.ts  # Credits/badges
│   │   ├── offlineService.ts       # Offline sync
│   │   ├── subscriptionService.ts  # Subscription logic
│   │   └── advertisingService.ts   # School ads
│   ├── lib/
│   │   ├── firebase.ts             # Firebase initialization
│   │   ├── payfast.ts              # PayFast integration
│   │   └── offline.ts              # Offline storage
│   └── types/
│       ├── journey.ts              # Journey types
│       ├── mastery.ts              # Progression types
│       └── subscription.ts         # Subscription types
├── public/
│   ├── journeys/                   # Journey definitions (JSON)
│   ├── questions/                  # Question bank
│   └── assets/                     # Images, icons
├── docs/
│   ├── ARCHITECTURE.md             # System architecture
│   ├── DATABASE_SCHEMA.md          # Firestore collections
│   ├── DEVELOPMENT_ROADMAP.md      # Sprint planning
│   └── API.md                      # API documentation
└── tests/
    ├── unit/                       # Unit tests
    ├── integration/                # Integration tests
    └── e2e/                        # End-to-end tests
```

---

## 📊 Success Metrics

### Launch (Q2 2026)

- ✅ 100% feature parity with specification
- ✅ 80%+ test coverage
- ✅ 95-100% mastery rule enforced
- ✅ PayFast integration live
- ✅ 50+ journeys available
- ✅ 500+ questions in bank

### Q3 2026

- 🎯 10,000+ registered users
- 🎯 1,000+ paid subscribers (R99 lifetime)
- 🎯 50+ driving schools advertising
- 🎯 10,000+ certificates issued

### Q4 2026

- 🎯 50,000+ registered users
- 🎯 10,000+ paid subscribers
- 🎯 200+ driving schools
- 🎯 R500,000+ monthly revenue

---

## 🤝 Contributing

### Development Guidelines

1. **Mastery rule is sacred** - Never compromise 95/97/98/100% thresholds
2. **No payment bypass** - Payment never unlocks stages early
3. **K53 compliance** - All content must align with official standards
4. **Accessibility** - WCAG AA compliant
5. **Testing** - Unit + Integration + E2E for all features

### Code Standards

- TypeScript strict mode
- ESLint + Prettier
- Pre-commit hooks (Husky)
- Code review required

---

## 📄 License

© 2026 Allied iMpact. All rights reserved.

---

## 🆘 Support

**For Learners:**
- Email: support@drivemaster.co.za
- WhatsApp: [To be configured]

**For Driving Schools:**
- Email: schools@drivemaster.co.za
- Portal: schools.drivemaster.co.za

**For Development:**
- Slack: #drivemaster-dev
- Issues: GitHub Issues

---

**Built with ❤️ by Allied iMpact**  
**Empowering South African learners to master the road safely.**
