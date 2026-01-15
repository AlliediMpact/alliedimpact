# 🚗 DriveMaster - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Data Models](#data-models)
5. [Service Layer](#service-layer)
6. [Security Architecture](#security-architecture)
7. [Integration Points](#integration-points)

---

## System Overview

DriveMaster is a gamified K53 learner's license preparation platform built on a modern serverless architecture using Firebase and Next.js 14.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Next.js 14)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   App Router │  │  Components  │  │    Hooks     │     │
│  │   (RSC/CSR)  │  │   (React)    │  │  (Custom)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer (TypeScript)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ GameEngine   │  │ Gamification │  │ Subscription │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Analytics  │  │     Email    │  │  Certificate │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend Services (Firebase)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Firestore   │  │     Auth     │  │   Storage    │     │
│  │  (NoSQL DB)  │  │ (Identity)   │  │   (Files)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Analytics   │  │   Functions  │                        │
│  │  (Tracking)  │  │ (Serverless) │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               Third-Party Integrations                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   SendGrid   │  │    PayFast   │  │    Sentry    │     │
│  │   (Email)    │  │  (Payments)  │  │   (Errors)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 18
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **Charts:** Recharts
- **Internationalization:** next-intl
- **State Management:** React Hooks + Context API
- **Forms:** Native HTML5 + Custom Validation

### Backend
- **Database:** Firestore (NoSQL)
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage
- **Functions:** Firebase Cloud Functions (for future server-side logic)
- **Analytics:** Firebase Analytics

### Third-Party Services
- **Email:** SendGrid API
- **Payments:** PayFast (South African payment gateway)
- **Error Tracking:** Sentry
- **CDN:** Vercel Edge Network (when deployed)

### Development Tools
- **Package Manager:** pnpm
- **Testing:** Jest + React Testing Library
- **Linting:** ESLint
- **Formatting:** Prettier
- **Version Control:** Git

---

## Architecture Patterns

### 1. Service Layer Pattern

All business logic is encapsulated in singleton service classes:

```typescript
// Example: GamificationService.ts
export class GamificationService {
  private static instance: GamificationService;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  static getInstance(userId: string): GamificationService {
    if (!this.instance) {
      this.instance = new GamificationService(userId);
    }
    return this.instance;
  }

  async awardCredits(amount: number): Promise<void> {
    // Business logic here
  }
}
```

**Benefits:**
- Separation of concerns
- Reusable across components
- Easy to test
- Centralized business logic

### 2. Component Composition

UI is built using composable, reusable components:

```
Page Components (app/)
  ↓
Layout Components (components/layouts/)
  ↓
Feature Components (components/features/)
  ↓
UI Components (@allied-impact/ui)
```

### 3. Custom Hooks Pattern

Complex state logic is extracted into custom hooks:

```typescript
// Example: useKeyboardShortcuts.ts
export function useKeyboardShortcuts(handlers: KeyHandlers) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Logic here
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers]);
}
```

### 4. Error Boundary Pattern

Multi-level error boundaries prevent white screen of death:

```
Root Error Boundary (app/error.tsx)
  ↓
Dashboard Error Boundary ((dashboard)/error.tsx)
  ↓
Journey Error Boundary (journey/[id]/error.tsx)
```

### 5. Progressive Web App (PWA)

```
Service Worker → Cache Assets → Offline Support
                       ↓
                Offline Sync Queue → Background Sync
```

---

## Data Models

### User Profile
```typescript
interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  credits: number;
  currentStage: Stage; // 'beginner' | 'intermediate' | 'advanced' | 'k53'
  unlockedStages: Stage[];
  subscriptionTier: 'free' | 'trial' | 'lifetime';
  trialStartDate?: Date;
  trialEndDate?: Date;
  lifetimeAccessPurchased: boolean;
  journeysCompleted: number;
  averageScore: number;
  streak: number;
  badges: Badge[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Journey
```typescript
interface Journey {
  journeyId: string;
  title: string;
  description: string;
  stage: Stage;
  category: 'road_signs' | 'rules' | 'controls' | 'awareness';
  route: {
    startLocation: string;
    endLocation: string;
    distance: number; // km
    estimatedDuration: number; // minutes
  };
  events: JourneyEvent[];
  creditCost: number;
  avgScore: number;
  thumbnailUrl: string;
  createdAt: Date;
}
```

### Journey Event
```typescript
interface JourneyEvent {
  eventId: string;
  type: 'question' | 'scenario' | 'hazard';
  location: number; // km from start
  question: {
    questionId: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    imageUrl?: string;
  };
  points: number;
}
```

### Certificate
```typescript
interface Certificate {
  certificateId: string;
  certificateNumber: string; // e.g., "DM-2026-001234"
  userId: string;
  userName: string;
  stage: Stage;
  score: number;
  completionDate: Date;
  pdfUrl: string;
  qrCodeUrl: string;
  verified: boolean;
  createdAt: Date;
}
```

### Driving School
```typescript
interface DrivingSchool {
  schoolId: string;
  name: string;
  registrationNumber: string;
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  pricing: {
    perLesson: number;
    packageDeals: Array<{
      lessons: number;
      price: number;
    }>;
  };
  status: 'pending' | 'approved' | 'rejected';
  commissionRate: number; // 0.10 = 10%
  leads: number;
  conversions: number;
  totalRevenue: number;
  createdAt: Date;
}
```

---

## Service Layer

### Core Services

#### 1. GameEngine Service
**Purpose:** Orchestrates journey gameplay

**Key Methods:**
- `getJourneysByStage(stage: Stage): Promise<Journey[]>`
- `startJourney(journeyId: string): Promise<JourneySession>`
- `submitAnswer(sessionId: string, answer: number): Promise<AnswerResult>`
- `completeJourney(sessionId: string): Promise<JourneyResult>`

#### 2. GamificationService
**Purpose:** Manages credits, badges, streaks

**Key Methods:**
- `awardCredits(amount: number): Promise<void>`
- `deductCredits(amount: number): Promise<boolean>`
- `updateStreak(): Promise<number>`
- `awardBadge(badgeType: BadgeType): Promise<void>`
- `checkBankruptcy(): Promise<boolean>`

#### 3. SubscriptionService
**Purpose:** Handles subscriptions and trials

**Key Methods:**
- `startTrial(): Promise<void>`
- `purchaseLifetime(): Promise<void>`
- `canAccessStage(stage: Stage): Promise<boolean>`
- `canStartJourney(): Promise<{allowed: boolean, reason?: string}>`

#### 4. EmailService
**Purpose:** Transactional emails via SendGrid

**Key Methods:**
- `sendWelcomeEmail(user: User): Promise<void>`
- `sendCertificateEmail(certificate: Certificate): Promise<void>`
- `sendTrialExpiryWarning(daysRemaining: number): Promise<void>`
- `sendSchoolLeadNotification(lead: Lead): Promise<void>`

#### 5. AnalyticsService
**Purpose:** Firebase Analytics tracking

**Key Methods:**
- `trackJourneyStarted(journeyId: string): Promise<void>`
- `trackJourneyCompleted(score: number): Promise<void>`
- `trackCertificateEarned(stage: Stage): Promise<void>`
- `trackSubscriptionStarted(tier: string): Promise<void>`

#### 6. CertificateService
**Purpose:** Certificate generation and verification

**Key Methods:**
- `generateCertificate(data: CertificateData): Promise<Certificate>`
- `verifyCertificate(certificateNumber: string): Promise<VerificationResult>`
- `generatePDF(certificate: Certificate): Promise<string>`

---

## Security Architecture

### Authentication Flow

```
1. User visits app → Check Firebase Auth state
2. Not authenticated → Redirect to /auth/login
3. User signs in → Firebase Auth verifies credentials
4. Token generated → Stored in browser (httpOnly cookie)
5. Middleware checks token on protected routes
6. Token valid → Allow access
7. Token invalid/expired → Redirect to login
```

### Authorization Levels

1. **Public Routes:** `/`, `/auth/*`, `/verify/*`
2. **Authenticated Routes:** `/dashboard/*`, `/journeys/*`, `/profile`
3. **Subscription Required:** `/journeys` (stages beyond beginner)
4. **Admin Only:** `/admin/*`
5. **School Owner Only:** `/school-dashboard/*`

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Journeys are read-only for all authenticated users
    match /journeys/{journeyId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only (via Functions)
    }
    
    // Certificates are read-only for owners
    match /certificates/{certId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if false; // Generated via backend only
    }
  }
}
```

### Data Encryption

- **In Transit:** TLS 1.3 (HTTPS everywhere)
- **At Rest:** Firebase encrypts all data automatically
- **Sensitive Fields:** Hashed (passwords) or encrypted (payment info)

---

## Integration Points

### SendGrid Email Integration

```typescript
// Configuration
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@drivemaster.co.za
SENDGRID_FROM_NAME=DriveMaster

// Usage
const emailService = new EmailService();
await emailService.sendWelcomeEmail(user);
```

### PayFast Payment Integration

```typescript
// Configuration
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=xxx
PAYFAST_PASSPHRASE=xxx
PAYFAST_URL=https://www.payfast.co.za/eng/process

// Payment flow
1. User clicks "Subscribe"
2. Generate payment data + signature
3. Redirect to PayFast
4. User completes payment
5. PayFast sends ITN (Instant Transaction Notification)
6. Verify signature
7. Update subscription in Firestore
```

### Sentry Error Tracking

```typescript
// Configuration
SENTRY_DSN=https://xxx@sentry.io/xxx

// Automatic error capture
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Manual error logging
try {
  // risky operation
} catch (error) {
  Sentry.captureException(error);
}
```

---

## Performance Optimizations

1. **Code Splitting:** Automatic via Next.js dynamic imports
2. **Image Optimization:** Next.js Image component with AVIF/WebP
3. **Static Generation:** Pre-render static pages at build time
4. **Edge Caching:** Vercel Edge Network for global CDN
5. **Bundle Size:** Tree-shaking removes unused code
6. **Lazy Loading:** Components load on-demand
7. **Database Indexing:** Firestore composite indexes on frequent queries

---

## Monitoring & Observability

### Key Metrics Tracked

1. **User Metrics:**
   - Daily Active Users (DAU)
   - Monthly Active Users (MAU)
   - User retention rate
   - Average session duration

2. **Journey Metrics:**
   - Journeys started vs completed
   - Average score per stage
   - Difficulty pass rates
   - Time per journey

3. **Business Metrics:**
   - Subscription conversion rate
   - Lifetime customer value
   - School lead conversion
   - Revenue per user

4. **Technical Metrics:**
   - Page load time (< 2s)
   - API response time (< 500ms)
   - Error rate (< 1%)
   - Uptime (> 99.9%)

### Logging Strategy

```
INFO → General app flow (user actions, service calls)
WARN → Recoverable errors (API timeouts with retry)
ERROR → Unrecoverable errors (send to Sentry)
DEBUG → Development only (verbose logging)
```

---

## Scalability Considerations

### Current Architecture (MVP)
- **Users:** Up to 10,000 concurrent
- **Database:** Firestore auto-scales
- **Hosting:** Vercel serverless functions

### Future Scale (100k+ users)
- **CDN:** Multi-region edge caching
- **Database:** Firestore with read replicas
- **Compute:** Cloud Run for heavy workloads
- **Queue:** Pub/Sub for async processing
- **Cache:** Redis for session management

---

## Deployment Architecture

```
GitHub (main branch)
  ↓
GitHub Actions CI/CD
  ↓
Build & Test
  ↓
Deploy to Vercel (Production)
  ↓
Edge Network (Global CDN)
  ↓
Users worldwide
```

### Environments

1. **Development:** `localhost:3001`
2. **Staging:** `staging.drivemaster.co.za` (future)
3. **Production:** `drivemaster.co.za`

---

## Technology Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| **Next.js 14** | Server-side rendering, SEO, App Router for modern patterns |
| **Firebase** | Serverless, auto-scaling, built-in auth, real-time capabilities |
| **TypeScript** | Type safety, better IDE support, fewer runtime errors |
| **Tailwind CSS** | Utility-first, fast development, small bundle size |
| **pnpm** | Faster installs, disk space efficient, monorepo support |
| **SendGrid** | Reliable email delivery, 100 free emails/day, templates |
| **PayFast** | South African payment gateway, supports local methods |

---

## Future Architecture Enhancements

1. **GraphQL API** for efficient data fetching
2. **Redis Cache** for frequently accessed data
3. **WebSockets** for real-time multiplayer journeys
4. **Machine Learning** for adaptive difficulty
5. **Mobile Apps** using React Native (code sharing)
6. **Microservices** as specific services grow complex

---

*Last Updated: January 15, 2026*
