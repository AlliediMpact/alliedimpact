# DriveMaster - System Architecture

**Version:** 1.0  
**Date:** January 14, 2026  
**Status:** Architecture Design Phase

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Core Modules](#core-modules)
3. [Module Interactions](#module-interactions)
4. [Technology Stack](#technology-stack)
5. [Security Architecture](#security-architecture)
6. [Scalability Considerations](#scalability-considerations)
7. [Offline Architecture](#offline-architecture)
8. [Payment Integration](#payment-integration)

---

## 1. System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DriveMaster Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Learner    │  │   Driving    │  │    Admin     │        │
│  │     Web      │  │   School     │  │    Panel     │        │
│  │    (3001)    │  │    Portal    │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                  │                  │                 │
├─────────┼──────────────────┼──────────────────┼─────────────────┤
│         │                  │                  │                 │
│  ┌──────▼──────────────────▼──────────────────▼──────────┐    │
│  │           Next.js 14 Application Layer                 │    │
│  │  [locale] routing │ Server Actions │ API Routes       │    │
│  └─────────────────────────┬────────────────────────────┘    │
│                             │                                  │
│  ┌──────────────────────────▼────────────────────────────┐    │
│  │                  Service Layer                         │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │    │
│  │  │ Game │ │Master│ │ Gami │ │ Sub  │ │  Ad  │       │    │
│  │  │Engine│ │  y   │ │ fic  │ │ scr  │ │ vert │       │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │    │
│  └─────────────────────────┬────────────────────────────┘    │
│                             │                                  │
│  ┌──────────────────────────▼────────────────────────────┐    │
│  │                  Data Layer                            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │    │
│  │  │ Firebase │  │ IndexedDB│  │ PayFast  │           │    │
│  │  │ Firestore│  │ (Offline)│  │  API     │           │    │
│  │  └──────────┘  └──────────┘  └──────────┘           │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Modular Architecture** - Each module is self-contained with clear responsibilities
2. **Offline-First** - Beginner content fully accessible without internet
3. **Server-Side Validation** - All critical operations validated server-side
4. **Scalable Data Model** - Firestore structure designed for millions of users
5. **Payment Security** - No credit card data stored, PayFast handles PCI compliance
6. **K53 Integrity** - Mastery rules enforced at multiple layers

---

## 2. Core Modules

### 2.1 Game Engine Module

**Purpose:** Orchestrates journey-based learning simulation

**Responsibilities:**
- Load journey definitions (routes, cars, events)
- Trigger events based on journey progression
- Present questions contextually
- Handle user interactions (car selection, route choice)
- Calculate journey progress

**Key Components:**
```typescript
class GameEngine {
  // Journey orchestration
  startJourney(journeyId: string, carType: string)
  loadRoute(routeId: string): Route
  triggerEvent(eventType: EventType): Event
  
  // Event handling
  presentQuestion(eventId: string): Question
  validateAnswer(answerId: string): AnswerResult
  advanceJourney(currentPosition: number): void
  
  // State management
  saveCheckpoint(): void
  restoreCheckpoint(checkpointId: string): void
  endJourney(): JourneyResult
}
```

**Data Structures:**
```typescript
interface Journey {
  journeyId: string;
  title: string;
  route: Route;
  events: Event[];
  estimatedDuration: number;
  stage: 'beginner' | 'intermediate' | 'advanced' | 'k53';
}

interface Event {
  eventId: string;
  type: 'stop-sign' | 'traffic-light' | 'pedestrian' | 'merge' | 'parking';
  position: number; // km on route
  questionIds: string[];
  visualAsset: string; // image/video URL
}
```

**Dependencies:**
- Mastery Service (for progression validation)
- Gamification Service (for credit updates)
- Content Service (for journey/question data)

---

### 2.2 Mastery & Progression Module

**Purpose:** Enforces strict 95/97/98/100% progression rules

**Responsibilities:**
- Calculate user scores per journey
- Validate stage completion
- Block progression if threshold not met
- Track mastery history
- Generate learning recommendations

**Key Components:**
```typescript
class MasteryService {
  // Scoring
  calculateJourneyScore(answers: Answer[]): number
  validateStageCompletion(stage: Stage, score: number): boolean
  
  // Progression gates
  canAdvanceToStage(userId: string, targetStage: Stage): boolean
  enforceProgressionRule(currentScore: number, stage: Stage): ProgressionResult
  
  // Historical tracking
  recordAttempt(userId: string, journeyId: string, score: number): void
  getAttemptHistory(userId: string, stage: Stage): Attempt[]
  
  // Recommendations
  identifyWeakAreas(userId: string): WeakArea[]
  suggestNextJourney(userId: string): string
}
```

**Progression Rules:**
```typescript
const MASTERY_THRESHOLDS = {
  beginner: { min: 95, max: 100 },
  intermediate: { min: 97, max: 100 },
  advanced: { min: 98, max: 100 },
  k53: { min: 100, max: 100 }
};

function enforceProgressionRule(score: number, stage: Stage): ProgressionResult {
  const threshold = MASTERY_THRESHOLDS[stage];
  
  if (score >= threshold.min && score <= threshold.max) {
    return { passed: true, canAdvance: true };
  }
  
  return {
    passed: false,
    canAdvance: false,
    feedback: `Score ${score}% is below ${threshold.min}%. Journey will restart with reshuffled questions.`,
    mustRetry: true
  };
}
```

**Dependencies:**
- Game Engine (receives journey results)
- User Management (reads user stage)
- Content Service (for question shuffling)

---

### 2.3 Gamification Module

**Purpose:** Manages credits, badges, streaks, and learner engagement

**Responsibilities:**
- Award/deduct credits based on actions
- Track daily streaks
- Issue badges for achievements
- Handle credit bankruptcy
- Calculate leaderboard rankings

**Key Components:**
```typescript
class GamificationService {
  // Credit management
  awardCredits(userId: string, amount: number, reason: string): void
  deductCredits(userId: string, amount: number, reason: string): void
  getBalance(userId: string): number
  checkBankruptcy(userId: string): boolean
  
  // Badge system
  checkBadgeEligibility(userId: string): Badge[]
  awardBadge(userId: string, badgeType: BadgeType): void
  getUserBadges(userId: string): Badge[]
  
  // Streaks
  recordDailyActivity(userId: string): void
  calculateStreak(userId: string): number
  awardStreakBonus(userId: string): void
  
  // Leaderboard
  updateLeaderboard(userId: string, newScore: number): void
  getLeaderboard(stage: Stage, limit: number): LeaderboardEntry[]
}
```

**Credit Rules:**
```typescript
const CREDIT_RULES = {
  earn: {
    correctAnswer: 10,
    perfectJourney: 50,
    dailyLogin: 20,
    stageCompletion: 100,
    firstAttemptPerfect: 150
  },
  lose: {
    incorrectAnswer: 5,
    skipQuestion: 10,
    quitJourney: 15,
    trialExpired: 0 // No penalty
  }
};
```

**Dependencies:**
- Game Engine (receives action events)
- User Management (reads user profile)
- Notification Service (sends achievement notifications)

---

### 2.4 Offline Sync Module

**Purpose:** Enables learning without internet connection

**Responsibilities:**
- Store Beginner content in IndexedDB
- Queue progress updates while offline
- Sync with server when online
- Validate timestamps to prevent cheating
- Handle conflict resolution

**Key Components:**
```typescript
class OfflineService {
  // Content caching
  cacheBeginnerContent(): Promise<void>
  isCached(contentType: string): boolean
  getCachedJourneys(stage: 'beginner'): Journey[]
  
  // Progress queue
  queueProgressUpdate(update: ProgressUpdate): void
  syncQueue(): Promise<SyncResult>
  clearQueue(): void
  
  // Validation
  validateOfflineSession(sessionData: SessionData): boolean
  checkTimestampIntegrity(updates: Update[]): boolean
  detectCheating(progressData: ProgressData): CheatDetection
  
  // Conflict handling
  resolveConflict(localData: any, serverData: any): any
}
```

**Offline Architecture:**
```
┌─────────────────────────────────────────┐
│         Learner Device                   │
│  ┌────────────────────────────────┐     │
│  │    React Components             │     │
│  └───────────┬────────────────────┘     │
│              │                           │
│  ┌───────────▼────────────────────┐     │
│  │   Offline Service Layer         │     │
│  │  - Queue Manager                │     │
│  │  - Timestamp Validator          │     │
│  │  - Cheat Detector               │     │
│  └───────────┬────────────────────┘     │
│              │                           │
│  ┌───────────▼────────────────────┐     │
│  │     IndexedDB Storage           │     │
│  │  ┌────────┐  ┌────────┐        │     │
│  │  │Journeys│  │Progress│        │     │
│  │  │(Cached)│  │ (Queue)│        │     │
│  │  └────────┘  └────────┘        │     │
│  └─────────────────────────────────┘     │
│              │                           │
│              │ (When online)             │
│              ▼                           │
│  ┌────────────────────────────────┐     │
│  │   Sync Service                  │     │
│  │  - Upload queued progress       │     │
│  │  - Download new content         │     │
│  │  - Validate with server         │     │
│  └────────────────────────────────┘     │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│         Firebase Server                   │
│  - Validate timestamps                    │
│  - Check progress integrity               │
│  - Update user records                    │
│  - Detect anomalies                       │
└──────────────────────────────────────────┘
```

**Dependencies:**
- Content Service (for caching)
- User Management (for progress updates)
- Game Engine (for journey data)

---

### 2.5 Subscription & Entitlements Module

**Purpose:** Manages Free/Trial/Paid access control

**Responsibilities:**
- Check user tier (Free/Trial/Paid)
- Enforce access restrictions
- Handle trial expiration
- Process R99 lifetime payments
- Validate entitlements before content access

**Key Components:**
```typescript
class SubscriptionService {
  // Tier management
  getUserTier(userId: string): UserTier
  canAccessStage(userId: string, stage: Stage): boolean
  canAccessJourney(userId: string, journeyId: string): boolean
  
  // Trial management
  startTrial(userId: string): TrialResult
  checkTrialEligibility(userId: string, deviceId: string): boolean
  calculateTrialExpiry(startDate: Date): Date
  expireTrial(userId: string): void
  
  // Payment processing
  initiatePurchase(userId: string, plan: 'lifetime'): PaymentIntent
  confirmPurchase(transactionId: string): void
  upgradeToPaid(userId: string): void
  
  // Entitlement checks (called before every content access)
  validateAccess(userId: string, contentType: string): AccessResult
}
```

**Access Control Matrix:**
```typescript
const ACCESS_MATRIX = {
  free: {
    stages: ['beginner'],
    journeysPerDay: 3,
    showAds: true,
    offlineAccess: true,
    certificates: false
  },
  trial: {
    stages: ['beginner', 'intermediate', 'advanced', 'k53'],
    journeysPerDay: Infinity,
    showAds: false,
    offlineAccess: true,
    certificates: true,
    duration: 7 // days
  },
  paid: {
    stages: ['beginner', 'intermediate', 'advanced', 'k53'],
    journeysPerDay: Infinity,
    showAds: false,
    offlineAccess: true,
    certificates: true,
    lifetime: true
  }
};
```

**Trial Abuse Prevention:**
```typescript
async function checkTrialEligibility(
  userId: string,
  email: string,
  phoneNumber: string,
  deviceId: string
): Promise<EligibilityResult> {
  // Check email domain (prevent disposable emails)
  if (isDisposableEmail(email)) {
    return { eligible: false, reason: 'disposable-email' };
  }
  
  // Check phone number (one trial per phone)
  const phoneUsed = await hasPhoneUsedTrial(phoneNumber);
  if (phoneUsed) {
    return { eligible: false, reason: 'phone-already-used' };
  }
  
  // Check device fingerprint
  const deviceUsed = await hasDeviceUsedTrial(deviceId);
  if (deviceUsed) {
    return { eligible: false, reason: 'device-already-used' };
  }
  
  // Check user account
  const userHadTrial = await hasUserHadTrial(userId);
  if (userHadTrial) {
    return { eligible: false, reason: 'user-already-had-trial' };
  }
  
  return { eligible: true };
}
```

**Dependencies:**
- User Management (user tier data)
- Payment Gateway (PayFast integration)
- Notification Service (trial expiry reminders)

---

### 2.6 Advertising Module

**Purpose:** Manages driving school ads and lead tracking

**Responsibilities:**
- Display school profiles
- Track ad impressions/clicks
- Handle lead conversions
- Calculate commissions
- Enforce ad placement rules

**Key Components:**
```typescript
class AdvertisingService {
  // School management
  createSchoolProfile(schoolData: SchoolProfile): string
  updateSchoolProfile(schoolId: string, updates: Partial<SchoolProfile>): void
  activateSubscription(schoolId: string, plan: 'R499' | 'R999'): void
  
  // Ad placement
  getAdsForPlacement(placement: AdPlacement, userLocation: string): SchoolAd[]
  shouldShowAd(userId: string, placement: AdPlacement): boolean
  recordImpression(adId: string, userId: string): void
  
  // Lead tracking
  recordClick(schoolId: string, userId: string): void
  confirmConversion(schoolId: string, learnerId: string): void
  calculateCommission(schoolId: string): CommissionReport
  
  // Payments
  generateCommissionStatement(schoolId: string, month: number): Statement
  markCommissionPaid(schoolId: string, statementId: string): void
}
```

**Ad Placement Rules:**
```typescript
const AD_PLACEMENTS = {
  allowed: ['home-carousel', 'discovery-page', 'journey-completion'],
  forbidden: ['during-gameplay', 'during-question', 'k53-simulation']
};

function shouldShowAd(userId: string, placement: string): boolean {
  // Check if placement is allowed
  if (!AD_PLACEMENTS.allowed.includes(placement)) {
    return false;
  }
  
  // Check user tier (paid users see no ads)
  const tier = getUserTier(userId);
  if (tier === 'paid') {
    return false;
  }
  
  // Check if we have active ads for this placement
  const activeAds = getActiveAdsForPlacement(placement);
  if (activeAds.length === 0) {
    // Show placeholder: "Advertise your driving school here"
    return 'placeholder';
  }
  
  return true;
}
```

**Commission Calculation:**
```typescript
function calculateCommission(schoolId: string): CommissionReport {
  const leads = getConvertedLeads(schoolId);
  const rate = 0.20; // 20% commission
  
  const commissions = leads.map(lead => {
    // Assume average learner pays R1500 for lessons
    const averageLearnerValue = 1500;
    return {
      learnerId: lead.learnerId,
      learnerName: lead.learnerName,
      conversionDate: lead.conversionDate,
      commission: averageLearnerValue * rate // R300
    };
  });
  
  return {
    schoolId,
    period: getCurrentMonth(),
    totalLeads: leads.length,
    totalCommission: commissions.reduce((sum, c) => sum + c.commission, 0),
    commissions
  };
}
```

**Dependencies:**
- Subscription Service (check user tier)
- User Management (user location data)
- Notification Service (notify schools of leads)

---

### 2.7 Content Management Module

**Purpose:** Manages journeys, questions, routes, and K53 content

**Responsibilities:**
- CRUD operations for journeys
- CRUD operations for questions
- Question bank randomization
- Content versioning
- K53 compliance validation

**Key Components:**
```typescript
class ContentService {
  // Journey management
  createJourney(data: JourneyData): string
  updateJourney(journeyId: string, updates: Partial<JourneyData>): void
  publishJourney(journeyId: string): void
  getJourneysByStage(stage: Stage): Journey[]
  
  // Question bank
  createQuestion(data: QuestionData): string
  updateQuestion(questionId: string, updates: Partial<QuestionData>): void
  shuffleQuestions(journeyId: string): Question[]
  getQuestionsByTag(tag: string): Question[]
  
  // K53 validation
  validateK53Compliance(content: Content): ComplianceResult
  flagNonCompliantContent(contentId: string, reason: string): void
  
  // Versioning
  versionContent(contentId: string): string
  rollbackVersion(contentId: string, version: number): void
}
```

**Question Structure:**
```typescript
interface Question {
  questionId: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'scenario';
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string; // Shown after incorrect answer
  tags: string[]; // e.g., ['parking', 'rules-of-road']
  k53Reference: string; // Official K53 section
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  stage: 'beginner' | 'intermediate' | 'advanced' | 'k53';
}
```

**Dependencies:**
- None (foundational module)

---

### 2.8 User Management Module

**Purpose:** Manages user profiles, authentication, and progress tracking

**Responsibilities:**
- User registration/login (via Firebase Auth)
- Profile management
- Progress tracking across all stages
- Certificate generation
- Historical analytics

**Key Components:**
```typescript
class UserService {
  // Authentication (delegated to Firebase)
  registerUser(email: string, password: string): Promise<User>
  loginUser(email: string, password: string): Promise<User>
  verifyEmail(userId: string): Promise<void>
  verifyPhone(userId: string, phoneNumber: string): Promise<void>
  
  // Profile management
  getProfile(userId: string): UserProfile
  updateProfile(userId: string, updates: Partial<UserProfile>): void
  deleteAccount(userId: string): void
  
  // Progress tracking
  recordJourneyCompletion(userId: string, journeyId: string, score: number): void
  getProgress(userId: string): ProgressSummary
  getStageProgress(userId: string, stage: Stage): StageProgress
  
  // Certificates
  generateCertificate(userId: string, stage: Stage): Certificate
  getCertificates(userId: string): Certificate[]
  verifyCertificate(certificateNumber: string): CertificateValidation
  
  // Analytics
  getUserStats(userId: string): UserStats
  getWeeklyActivity(userId: string): ActivityChart
}
```

**User Profile Structure:**
```typescript
interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  
  // Subscription
  tier: 'free' | 'trial' | 'paid';
  trialStartDate?: Date;
  trialEndDate?: Date;
  subscriptionPurchaseDate?: Date;
  
  // Progress
  currentStage: 'beginner' | 'intermediate' | 'advanced' | 'k53';
  stagesCompleted: Stage[];
  totalJourneysCompleted: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  
  // Gamification
  credits: number;
  badges: Badge[];
  streak: number;
  lastActiveDate: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deviceId?: string;
  lastSyncedAt?: Date;
}
```

**Dependencies:**
- Firebase Auth (authentication)
- Subscription Service (tier validation)
- Gamification Service (credits/badges)

---

## 3. Module Interactions

### 3.1 Journey Completion Flow

```
Learner starts journey
       │
       ▼
[Game Engine] Load journey, car, route
       │
       ▼
[Game Engine] Trigger event #1
       │
       ▼
[Game Engine] Present question
       │
       ▼
Learner answers question
       │
       ▼
[Game Engine] Validate answer
       │
       ├─ Correct ──▶ [Gamification] Award +10 credits
       │
       └─ Incorrect ─▶ [Gamification] Deduct -5 credits
                    └▶ Show explanation
       │
       ▼
[Game Engine] Continue journey...
       │
       ▼
Journey complete
       │
       ▼
[Game Engine] Calculate final score
       │
       ▼
[Mastery Service] Validate score against threshold
       │
       ├─ PASS (95/97/98/100%) ──▶ [User Service] Mark stage complete
       │                         └▶ [Gamification] Award stage completion bonus
       │
       └─ FAIL ───────────────────▶ [Game Engine] Restart journey (shuffle questions)
```

### 3.2 Trial to Paid Conversion Flow

```
User signs up (Free)
       │
       ▼
[User Service] Create profile
       │
       ▼
[Subscription Service] Check trial eligibility
       │
       ├─ Eligible ──▶ [Subscription Service] Start 7-day trial
       │             └▶ [Notification Service] Send welcome email
       │
       └─ Not Eligible ─▶ User remains on Free plan
       │
       ▼
Day 5 of trial
       │
       ▼
[Subscription Service] Send reminder email: "2 days left"
       │
       ▼
Day 7 (Trial expires)
       │
       ▼
[Subscription Service] Check if user upgraded
       │
       ├─ Paid ──────▶ Continue full access
       │
       └─ Not Paid ──▶ [Subscription Service] Downgrade to Free
                     └▶ [Notification Service] Send "Trial ended" email
```

### 3.3 Offline Sync Flow

```
Learner goes offline (Beginner stage)
       │
       ▼
[Offline Service] Load cached journeys from IndexedDB
       │
       ▼
Learner completes journeys offline
       │
       ▼
[Offline Service] Queue progress updates locally
       │
       ▼
Learner comes back online
       │
       ▼
[Offline Service] Detect network connection
       │
       ▼
[Offline Service] Sync queued updates to server
       │
       ▼
[Firebase Cloud Function] Validate timestamps
       │
       ├─ Valid ──────▶ Update user progress
       │             └▶ Clear local queue
       │
       └─ Suspicious ─▶ Flag account for review
                     └▶ Require re-verification
```

---

## 4. Technology Stack

### Frontend

```typescript
// Framework
Next.js 14.0.4+ (App Router)
React 18.2.0+
TypeScript 5.3+

// Styling
Tailwind CSS 3.4+
@allied-impact/config (design tokens)
@allied-impact/ui (shared components)

// State Management
React Context API
Zustand (for complex state)

// Forms
React Hook Form
Zod (validation)

// Offline
IndexedDB (via idb library)
Service Workers

// UI Components
Radix UI primitives
Lucide React icons
```

### Backend

```typescript
// Database
Firebase Firestore

// Authentication
Firebase Auth
  - Email/password
  - Phone verification (SMS)
  - Email verification

// Storage
Firebase Storage
  - Journey assets (images, videos)
  - Certificates (PDFs)

// Serverless Functions
Firebase Cloud Functions
  - Payment webhooks
  - Offline sync validation
  - Commission calculations
  - Certificate generation
```

### Payment Integration

```typescript
// Primary
PayFast (South African payment gateway)
  - Subscriptions
  - One-time payments (R99 lifetime)
  - ITN (Instant Transaction Notification)

// Fallback
Stripe
  - International users
  - Card payments
```

### Development Tools

```bash
# Package Manager
pnpm 8+

# Testing
Jest (unit tests)
React Testing Library (component tests)
Playwright (E2E tests)

# Code Quality
ESLint
Prettier
Husky (pre-commit hooks)
TypeScript strict mode

# Monitoring
Sentry (error tracking)
Firebase Analytics (user behavior)
Firebase Performance Monitoring
```

---

## 5. Security Architecture

### Authentication Security

```typescript
// Email verification (mandatory)
async function registerUser(email: string, password: string) {
  const user = await createUserWithEmailAndPassword(email, password);
  await sendEmailVerification(user);
  
  // Block access until verified
  if (!user.emailVerified) {
    throw new Error('Email must be verified before accessing content');
  }
}

// Password requirements
const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false
};
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profiles - only owner can read/write
    match /drivemaster_users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User progress - only owner can write, admins can read
    match /drivemaster_progress/{userId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || 
                      isAdmin(request.auth.uid));
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Journeys - all authenticated users can read
    match /drivemaster_journeys/{journeyId} {
      allow read: if request.auth != null;
      allow write: if false; // Only via admin panel
    }
    
    // Questions - all authenticated users can read
    match /drivemaster_questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if false; // Only via admin panel
    }
    
    // Driving schools - public read, school owner can write
    match /drivemaster_schools/{schoolId} {
      allow read: if true; // Public directory
      allow write: if request.auth != null && 
                      resource.data.ownerId == request.auth.uid;
    }
    
    // Subscriptions - only owner can read
    match /drivemaster_subscriptions/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only via Cloud Functions
    }
    
    // Helper function
    function isAdmin(uid) {
      return get(/databases/$(database)/documents/drivemaster_admins/$(uid)).data.role == 'admin';
    }
  }
}
```

### Payment Security

- **No card data stored** - PayFast handles all sensitive data
- **Server-side validation** - All payment confirmations verified server-side
- **Webhook authentication** - PayFast ITN signatures validated
- **Idempotency** - Duplicate payment notifications ignored

### Anti-Cheat Measures

```typescript
// Offline session validation
function validateOfflineSession(sessionData: OfflineSession): boolean {
  // Check timestamps are sequential
  if (!areTimestampsSequential(sessionData.timestamps)) {
    flagUser(sessionData.userId, 'suspicious-timestamps');
    return false;
  }
  
  // Check duration is realistic
  const duration = sessionData.endTime - sessionData.startTime;
  if (duration < MIN_JOURNEY_DURATION) {
    flagUser(sessionData.userId, 'impossibly-fast-completion');
    return false;
  }
  
  // Check device fingerprint hasn't changed
  if (sessionData.deviceId !== getUserDeviceId(sessionData.userId)) {
    flagUser(sessionData.userId, 'device-mismatch');
    return false;
  }
  
  return true;
}
```

---

## 6. Scalability Considerations

### Database Sharding Strategy

```
Firestore collections designed for horizontal scaling:

drivemaster_users/{userId}
  - Sharded by userId
  - 1M users = 1M documents (manageable)

drivemaster_progress/{userId}/journeys/{journeyId}
  - Subcollection pattern prevents document size bloat
  - Each journey result is separate document

drivemaster_journeys/{journeyId}
  - Static content, cached aggressively
  - CDN-ready

drivemaster_questions/{questionId}
  - Static content, cached aggressively
  - Randomized at query time, not stored per user
```

### Caching Strategy

```typescript
// Client-side (Service Worker)
- Cache Beginner journeys/questions (5MB)
- Cache user profile (100KB)
- Cache journey assets (images) (20MB)

// CDN (Firebase Hosting)
- All static assets (journeys, questions, images)
- Aggressive caching (365 days)
- Version-busting via query params

// Firestore Read Optimization
- Use Firestore persistence (offline cache)
- Batch reads where possible
- Subscribe only to active data
```

### Cost Projections

```
For 100,000 active users/month:

Firestore Reads:
- 10 journeys per user = 1M reads
- Cost: $0.36

Firestore Writes:
- 5 progress updates per user = 500K writes
- Cost: $1.80

Firebase Storage:
- 100GB (journey assets) = $2.60

Firebase Hosting:
- 100GB bandwidth = $15

Cloud Functions:
- 100K executions = $0.40

Total: ~$20/month

At 100K users, revenue from R99 subscriptions (10% conversion):
- 10,000 paid users × R99 = R990,000 (~$55,000)
- Infrastructure costs: <$100/month

Margin: Extremely profitable
```

---

## 7. Offline Architecture

### IndexedDB Schema

```typescript
// Database: drivemaster-offline
// Version: 1

interface OfflineDatabase {
  stores: {
    // Journey content (cached)
    journeys: {
      keyPath: 'journeyId',
      data: Journey[]
    },
    
    // Questions (cached)
    questions: {
      keyPath: 'questionId',
      data: Question[]
    },
    
    // Progress queue (pending sync)
    progressQueue: {
      keyPath: 'queueId',
      data: ProgressUpdate[]
    },
    
    // User profile (cached)
    profile: {
      keyPath: 'userId',
      data: UserProfile
    }
  }
}
```

### Sync Strategy

```typescript
class SyncService {
  async syncOfflineProgress(): Promise<SyncResult> {
    // 1. Get queued updates
    const queue = await getProgressQueue();
    
    // 2. Sort by timestamp
    const sortedQueue = queue.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    // 3. Batch upload (max 500 at a time)
    const batches = chunk(sortedQueue, 500);
    
    for (const batch of batches) {
      // 4. Send to Cloud Function for validation
      const result = await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify({ updates: batch })
      });
      
      if (result.ok) {
        // 5. Remove from local queue
        await clearQueueItems(batch.map(b => b.queueId));
      } else {
        // 6. Handle conflicts
        const conflicts = await result.json();
        await resolveConflicts(conflicts);
      }
    }
    
    return { success: true, synced: sortedQueue.length };
  }
}
```

---

## 8. Payment Integration

### PayFast Flow

```
1. User clicks "Subscribe - R99 Lifetime"
       │
       ▼
2. Frontend creates payment intent
   POST /api/payfast/create-payment
       │
       ▼
3. Backend generates PayFast form data
   {
     merchant_id: '...',
     merchant_key: '...',
     amount: '99.00',
     item_name: 'DriveMaster Lifetime Subscription',
     return_url: 'https://drivemaster.co.za/payment/success',
     cancel_url: 'https://drivemaster.co.za/payment/cancelled',
     notify_url: 'https://drivemaster.co.za/api/webhooks/payfast'
   }
       │
       ▼
4. User redirected to PayFast payment page
       │
       ▼
5. User completes payment
       │
       ▼
6. PayFast sends ITN (webhook) to notify_url
       │
       ▼
7. Backend validates ITN signature
       │
       ▼
8. Backend updates user subscription
   UPDATE drivemaster_subscriptions/{userId}
   SET tier = 'paid', purchaseDate = NOW()
       │
       ▼
9. User redirected to success page
       │
       ▼
10. Frontend checks subscription status
       │
       ▼
11. User now has lifetime access
```

### Webhook Validation

```typescript
async function validatePayFastITN(data: any): Promise<boolean> {
  // 1. Validate signature
  const signature = generatePayFastSignature(data);
  if (signature !== data.signature) {
    console.error('Invalid PayFast signature');
    return false;
  }
  
  // 2. Validate payment status
  if (data.payment_status !== 'COMPLETE') {
    console.warn('Payment not complete:', data.payment_status);
    return false;
  }
  
  // 3. Validate amount
  if (parseFloat(data.amount_gross) !== 99.00) {
    console.error('Incorrect amount:', data.amount_gross);
    return false;
  }
  
  // 4. Check for duplicate notifications
  const existing = await getTransaction(data.m_payment_id);
  if (existing) {
    console.warn('Duplicate ITN:', data.m_payment_id);
    return false; // Already processed
  }
  
  return true;
}
```

---

## Next Steps

1. Review and approve this architecture
2. Proceed to [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for Firestore collection designs
3. Proceed to [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) for MVP planning

---

**Document Version:** 1.0  
**Last Updated:** January 14, 2026  
**Status:** Ready for Review
