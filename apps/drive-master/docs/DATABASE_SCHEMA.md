# DriveMaster - Database Schema

**Version:** 1.0  
**Date:** January 14, 2026  
**Database:** Firebase Firestore

---

## Table of Contents

1. [Overview](#overview)
2. [Collections](#collections)
3. [Indexes](#indexes)
4. [Security Rules](#security-rules)
5. [Query Patterns](#query-patterns)
6. [Data Migration Strategy](#data-migration-strategy)

---

## 1. Overview

### Database Technology

**Firebase Firestore** (NoSQL Document Database)

**Why Firestore:**
- Real-time synchronization
- Offline support (automatic caching)
- Scalable to millions of users
- Built-in security rules
- Cost-effective for read-heavy workloads
- Native mobile/web SDK support

### Collection Strategy

```
drivemaster_users                  (User profiles)
drivemaster_progress               (Subcollection per user)
drivemaster_journeys               (Journey definitions)
drivemaster_questions              (Question bank)
drivemaster_subscriptions          (Payment records)
drivemaster_schools                (Driving school profiles)
drivemaster_certificates           (Issued certificates)
drivemaster_offline_queue          (Sync validation)
drivemaster_admin                  (Admin users)
drivemaster_analytics              (Aggregated metrics)
```

---

## 2. Collections

### 2.1 drivemaster_users

**Purpose:** Store user profiles and gamification data

**Document ID:** `{userId}` (Firebase Auth UID)

**Schema:**
```typescript
interface User {
  userId: string;                    // Firebase Auth UID
  email: string;
  displayName: string;
  phoneNumber?: string;              // Required for trial
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Subscription
  tier: 'free' | 'trial' | 'paid';
  trialStartDate: Timestamp | null;
  trialEndDate: Timestamp | null;
  subscriptionPurchaseDate: Timestamp | null;
  
  // Progress
  currentStage: 'beginner' | 'intermediate' | 'advanced' | 'k53';
  stagesCompleted: string[];         // ['beginner', 'intermediate']
  totalJourneysCompleted: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  averageScore: number;              // Calculated field
  
  // Gamification
  credits: number;
  badges: Badge[];
  streak: number;                    // Consecutive days active
  lastActiveDate: Timestamp;
  isBankrupt: boolean;               // Credits < 0
  
  // Anti-abuse
  deviceId: string;                  // Device fingerprint
  lastSyncedAt: Timestamp | null;
  flaggedForReview: boolean;
  flagReason: string | null;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Badge {
  badgeId: string;
  name: string;
  description: string;
  awardedAt: Timestamp;
}
```

**Example Document:**
```json
{
  "userId": "abc123",
  "email": "learner@example.com",
  "displayName": "John Doe",
  "phoneNumber": "+27821234567",
  "emailVerified": true,
  "phoneVerified": true,
  
  "tier": "trial",
  "trialStartDate": "2026-01-10T10:00:00Z",
  "trialEndDate": "2026-01-17T10:00:00Z",
  "subscriptionPurchaseDate": null,
  
  "currentStage": "intermediate",
  "stagesCompleted": ["beginner"],
  "totalJourneysCompleted": 15,
  "totalQuestionsAnswered": 450,
  "totalCorrectAnswers": 430,
  "totalIncorrectAnswers": 20,
  "averageScore": 95.5,
  
  "credits": 1250,
  "badges": [
    {
      "badgeId": "first-journey",
      "name": "First Journey",
      "description": "Complete your first journey",
      "awardedAt": "2026-01-10T11:00:00Z"
    }
  ],
  "streak": 5,
  "lastActiveDate": "2026-01-14T14:00:00Z",
  "isBankrupt": false,
  
  "deviceId": "device-fingerprint-xyz",
  "lastSyncedAt": "2026-01-14T14:05:00Z",
  "flaggedForReview": false,
  "flagReason": null,
  
  "createdAt": "2026-01-10T09:00:00Z",
  "updatedAt": "2026-01-14T14:05:00Z"
}
```

---

### 2.2 drivemaster_progress (Subcollection)

**Purpose:** Track individual journey attempts and scores

**Path:** `drivemaster_users/{userId}/progress/{journeyAttemptId}`

**Schema:**
```typescript
interface ProgressRecord {
  journeyAttemptId: string;          // Auto-generated
  journeyId: string;
  stage: 'beginner' | 'intermediate' | 'advanced' | 'k53';
  
  // Attempt details
  attemptNumber: number;             // 1st, 2nd, 3rd attempt
  startedAt: Timestamp;
  completedAt: Timestamp | null;
  duration: number;                  // seconds
  
  // Results
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;                     // percentage (0-100)
  passed: boolean;                   // Based on mastery threshold
  
  // Event details
  events: EventResult[];
  
  // Metadata
  carType: string;                   // 'sedan', 'hatchback', 'suv'
  routeId: string;
  wasOffline: boolean;
  syncedAt: Timestamp | null;
}

interface EventResult {
  eventId: string;
  eventType: string;
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  timeToAnswer: number;              // seconds
}
```

**Example Document:**
```json
{
  "journeyAttemptId": "attempt-xyz",
  "journeyId": "journey-suburb-01",
  "stage": "beginner",
  
  "attemptNumber": 2,
  "startedAt": "2026-01-14T10:00:00Z",
  "completedAt": "2026-01-14T10:15:00Z",
  "duration": 900,
  
  "totalQuestions": 20,
  "correctAnswers": 19,
  "incorrectAnswers": 1,
  "score": 95,
  "passed": true,
  
  "events": [
    {
      "eventId": "event-stop-sign-01",
      "eventType": "stop-sign",
      "questionId": "q-stop-01",
      "answerId": "ans-correct",
      "isCorrect": true,
      "timeToAnswer": 12
    }
  ],
  
  "carType": "sedan",
  "routeId": "route-suburb-main",
  "wasOffline": false,
  "syncedAt": "2026-01-14T10:15:05Z"
}
```

---

### 2.3 drivemaster_journeys

**Purpose:** Store journey definitions (routes, events, questions)

**Document ID:** `{journeyId}` (e.g., `journey-suburb-01`)

**Schema:**
```typescript
interface Journey {
  journeyId: string;
  title: string;
  description: string;
  stage: 'beginner' | 'intermediate' | 'advanced' | 'k53';
  
  // Route details
  route: {
    routeId: string;
    startLocation: string;
    endLocation: string;
    distance: number;                // km
    estimatedDuration: number;       // minutes
    mapImageUrl: string;
  };
  
  // Events (traffic lights, stop signs, etc.)
  events: JourneyEvent[];
  
  // Content
  thumbnailUrl: string;
  backgroundImageUrl: string;
  videoIntroUrl?: string;
  
  // Requirements
  requiredCar: string[];             // ['sedan', 'hatchback']
  prerequisiteJourneys: string[];    // Must complete these first
  
  // Stats
  avgCompletionTime: number;         // minutes
  avgScore: number;                  // percentage
  totalAttempts: number;
  
  // Metadata
  isPublished: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}

interface JourneyEvent {
  eventId: string;
  type: 'stop-sign' | 'traffic-light' | 'pedestrian' | 'merge' | 'parking' | 'roundabout';
  position: number;                  // km from start
  questionIds: string[];             // Pool of questions for this event
  visualAssetUrl: string;            // Image/video of scenario
  description: string;
}
```

**Example Document:**
```json
{
  "journeyId": "journey-suburb-01",
  "title": "Suburban Streets - Morning Commute",
  "description": "Navigate through quiet suburban streets with stop signs and pedestrian crossings",
  "stage": "beginner",
  
  "route": {
    "routeId": "route-suburb-main",
    "startLocation": "123 Oak Street, Sandton",
    "endLocation": "456 Elm Avenue, Sandton",
    "distance": 5.2,
    "estimatedDuration": 15,
    "mapImageUrl": "https://storage.../map-suburb-01.png"
  },
  
  "events": [
    {
      "eventId": "event-stop-sign-01",
      "type": "stop-sign",
      "position": 1.2,
      "questionIds": ["q-stop-01", "q-stop-02", "q-stop-03"],
      "visualAssetUrl": "https://storage.../stop-sign-scenario.png",
      "description": "4-way stop intersection"
    }
  ],
  
  "thumbnailUrl": "https://storage.../journey-suburb-01-thumb.jpg",
  "backgroundImageUrl": "https://storage.../journey-suburb-01-bg.jpg",
  
  "requiredCar": ["sedan", "hatchback"],
  "prerequisiteJourneys": [],
  
  "avgCompletionTime": 14.5,
  "avgScore": 92.3,
  "totalAttempts": 1523,
  
  "isPublished": true,
  "createdAt": "2025-12-01T00:00:00Z",
  "updatedAt": "2026-01-10T00:00:00Z",
  "version": 2
}
```

---

### 2.4 drivemaster_questions

**Purpose:** Question bank for all stages

**Document ID:** `{questionId}` (e.g., `q-stop-01`)

**Schema:**
```typescript
interface Question {
  questionId: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'scenario';
  
  // Options
  options: QuestionOption[];
  
  // Explanation
  explanation: string;               // Shown after incorrect answer
  k53Reference: string;              // e.g., "Section 3.2.1"
  k53PageNumber: number;
  
  // Categorization
  stage: 'beginner' | 'intermediate' | 'advanced' | 'k53';
  tags: string[];                    // ['parking', 'rules-of-road']
  eventTypes: string[];              // ['stop-sign', 'traffic-light']
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  
  // Media
  imageUrl?: string;
  videoUrl?: string;
  
  // Stats
  totalAsked: number;
  totalCorrect: number;
  totalIncorrect: number;
  avgTimeToAnswer: number;           // seconds
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}
```

**Example Document:**
```json
{
  "questionId": "q-stop-01",
  "text": "You approach a 4-way stop intersection. Another vehicle arrives at the same time to your right. Who has right of way?",
  "type": "multiple-choice",
  
  "options": [
    {
      "id": "opt-a",
      "text": "The vehicle on your right",
      "isCorrect": true
    },
    {
      "id": "opt-b",
      "text": "You have right of way",
      "isCorrect": false
    },
    {
      "id": "opt-c",
      "text": "Whoever reaches the intersection first",
      "isCorrect": false
    },
    {
      "id": "opt-d",
      "text": "The larger vehicle",
      "isCorrect": false
    }
  ],
  
  "explanation": "At a 4-way stop, if two vehicles arrive simultaneously, the vehicle on the right has right of way. This is a fundamental rule of South African road safety.",
  "k53Reference": "Section 3.2.1 - Right of Way at Intersections",
  "k53PageNumber": 45,
  
  "stage": "beginner",
  "tags": ["right-of-way", "intersections", "stop-signs"],
  "eventTypes": ["stop-sign"],
  "difficultyLevel": 2,
  
  "imageUrl": "https://storage.../4-way-stop.png",
  
  "totalAsked": 2543,
  "totalCorrect": 1987,
  "totalIncorrect": 556,
  "avgTimeToAnswer": 15.2,
  
  "createdAt": "2025-12-01T00:00:00Z",
  "updatedAt": "2026-01-10T00:00:00Z",
  "isActive": true
}
```

---

### 2.5 drivemaster_subscriptions

**Purpose:** Payment records and subscription history

**Document ID:** `{userId}`

**Schema:**
```typescript
interface Subscription {
  userId: string;
  
  // Current status
  tier: 'free' | 'trial' | 'paid';
  status: 'active' | 'expired' | 'cancelled';
  
  // Trial details
  trialStartDate: Timestamp | null;
  trialEndDate: Timestamp | null;
  trialEligible: boolean;
  trialUsedDeviceIds: string[];      // Prevent multi-device trials
  trialUsedPhoneNumbers: string[];   // Prevent multi-account trials
  
  // Payment details
  paymentMethod: 'payfast' | 'stripe' | null;
  transactionId: string | null;
  amount: number;                    // R99
  currency: 'ZAR';
  paymentDate: Timestamp | null;
  
  // Payment history
  transactions: Transaction[];
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Transaction {
  transactionId: string;
  provider: 'payfast' | 'stripe';
  amount: number;
  currency: 'ZAR';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: Timestamp;
  metadata: Record<string, any>;
}
```

**Example Document:**
```json
{
  "userId": "abc123",
  
  "tier": "paid",
  "status": "active",
  
  "trialStartDate": "2026-01-10T10:00:00Z",
  "trialEndDate": "2026-01-17T10:00:00Z",
  "trialEligible": false,
  "trialUsedDeviceIds": ["device-fingerprint-xyz"],
  "trialUsedPhoneNumbers": ["+27821234567"],
  
  "paymentMethod": "payfast",
  "transactionId": "pf-12345",
  "amount": 99,
  "currency": "ZAR",
  "paymentDate": "2026-01-15T12:00:00Z",
  
  "transactions": [
    {
      "transactionId": "pf-12345",
      "provider": "payfast",
      "amount": 99,
      "currency": "ZAR",
      "status": "completed",
      "paymentDate": "2026-01-15T12:00:00Z",
      "metadata": {
        "m_payment_id": "pf-12345",
        "pf_payment_id": "67890"
      }
    }
  ],
  
  "createdAt": "2026-01-10T09:00:00Z",
  "updatedAt": "2026-01-15T12:00:00Z"
}
```

---

### 2.6 drivemaster_schools

**Purpose:** Driving school profiles and advertising

**Document ID:** `{schoolId}` (auto-generated)

**Schema:**
```typescript
interface DrivingSchool {
  schoolId: string;
  ownerId: string;                   // Firebase Auth UID of owner
  
  // Profile
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl?: string;
  
  // Contact
  email: string;
  phoneNumber: string;
  website?: string;
  
  // Location
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  
  // Service areas
  serviceRegions: string[];          // ['Johannesburg', 'Pretoria']
  
  // Advertising
  subscription: {
    plan: 'R499' | 'R999' | null;
    status: 'active' | 'expired';
    startDate: Timestamp | null;
    endDate: Timestamp | null;
    autoRenew: boolean;
  };
  
  // Stats
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  conversionRate: number;            // clicks / impressions
  
  // Leads (Phase 1 commission model)
  leads: Lead[];
  
  // Metadata
  isVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Lead {
  leadId: string;
  learnerId: string;
  learnerName: string;
  learnerPhone: string;
  learnerEmail: string;
  status: 'pending' | 'confirmed' | 'rejected';
  confirmedAt: Timestamp | null;
  commissionAmount: number;          // R300 (20% of R1500)
  commissionPaid: boolean;
  commissionPaidDate: Timestamp | null;
  createdAt: Timestamp;
}
```

**Example Document:**
```json
{
  "schoolId": "school-abc",
  "ownerId": "owner-xyz",
  
  "name": "Safe Drive Academy",
  "description": "Professional driving instruction with K53 experts",
  "logoUrl": "https://storage.../school-logo.png",
  
  "email": "info@safedrive.co.za",
  "phoneNumber": "+27821234567",
  "website": "https://safedrive.co.za",
  
  "address": {
    "street": "123 Main Road",
    "city": "Johannesburg",
    "province": "Gauteng",
    "postalCode": "2000",
    "coordinates": {
      "lat": -26.2041,
      "lng": 28.0473
    }
  },
  
  "serviceRegions": ["Johannesburg", "Sandton", "Midrand"],
  
  "subscription": {
    "plan": "R999",
    "status": "active",
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "autoRenew": true
  },
  
  "totalImpressions": 15000,
  "totalClicks": 450,
  "totalLeads": 12,
  "conversionRate": 3.0,
  
  "leads": [
    {
      "leadId": "lead-001",
      "learnerId": "learner-abc",
      "learnerName": "John Doe",
      "learnerPhone": "+27829876543",
      "learnerEmail": "john@example.com",
      "status": "confirmed",
      "confirmedAt": "2026-01-12T10:00:00Z",
      "commissionAmount": 300,
      "commissionPaid": false,
      "commissionPaidDate": null,
      "createdAt": "2026-01-10T14:00:00Z"
    }
  ],
  
  "isVerified": true,
  "createdAt": "2025-12-15T00:00:00Z",
  "updatedAt": "2026-01-14T12:00:00Z"
}
```

---

### 2.7 drivemaster_certificates

**Purpose:** Issued certificates with verification

**Document ID:** `{certificateId}` (auto-generated)

**Schema:**
```typescript
interface Certificate {
  certificateId: string;
  certificateNumber: string;         // DM-2026-00001
  
  // Learner
  userId: string;
  learnerName: string;
  learnerEmail: string;
  
  // Achievement
  stage: 'beginner' | 'intermediate' | 'advanced' | 'k53';
  completionDate: Timestamp;
  finalScore: number;
  totalJourneysCompleted: number;
  
  // Certificate details
  pdfUrl: string;
  qrCodeUrl: string;                 // For verification
  verificationUrl: string;           // Public URL to verify
  
  // Disclaimers (mandatory)
  disclaimers: string[];
  
  // Metadata
  issuedAt: Timestamp;
  validUntil: Timestamp | null;      // Certificates don't expire
  revokedAt: Timestamp | null;
  revocationReason: string | null;
}
```

**Example Document:**
```json
{
  "certificateId": "cert-xyz",
  "certificateNumber": "DM-2026-00123",
  
  "userId": "abc123",
  "learnerName": "John Doe",
  "learnerEmail": "john@example.com",
  
  "stage": "advanced",
  "completionDate": "2026-01-14T15:00:00Z",
  "finalScore": 98.5,
  "totalJourneysCompleted": 45,
  
  "pdfUrl": "https://storage.../certificates/DM-2026-00123.pdf",
  "qrCodeUrl": "https://storage.../qr-codes/DM-2026-00123.png",
  "verificationUrl": "https://drivemaster.co.za/verify/DM-2026-00123",
  
  "disclaimers": [
    "This certificate is issued by DriveMaster and is not affiliated with the South African government.",
    "DriveMaster is not an official testing center.",
    "This certificate indicates preparatory training only and does not replace the official K53 learner's license test.",
    "To obtain a legal learner's license, you must pass the official test at a recognized testing center."
  ],
  
  "issuedAt": "2026-01-14T15:05:00Z",
  "validUntil": null,
  "revokedAt": null,
  "revocationReason": null
}
```

---

### 2.8 drivemaster_offline_queue

**Purpose:** Validate offline progress submissions

**Document ID:** `{syncRequestId}` (auto-generated)

**Schema:**
```typescript
interface OfflineSyncRequest {
  syncRequestId: string;
  userId: string;
  deviceId: string;
  
  // Submission details
  submittedAt: Timestamp;
  progressUpdates: ProgressUpdate[];
  
  // Validation
  status: 'pending' | 'validated' | 'suspicious' | 'rejected';
  validationResults: ValidationResult[];
  
  // Timestamps
  earliestTimestamp: Timestamp;
  latestTimestamp: Timestamp;
  
  // Flags
  isSuspicious: boolean;
  suspicionReasons: string[];
}

interface ProgressUpdate {
  journeyAttemptId: string;
  journeyId: string;
  startedAt: Timestamp;
  completedAt: Timestamp;
  score: number;
  events: EventResult[];
}

interface ValidationResult {
  check: string;
  passed: boolean;
  message: string;
}
```

---

### 2.9 drivemaster_admin

**Purpose:** Admin user roles

**Document ID:** `{userId}`

**Schema:**
```typescript
interface Admin {
  userId: string;
  email: string;
  role: 'admin' | 'content-manager' | 'support';
  permissions: string[];
  createdAt: Timestamp;
}
```

---

### 2.10 drivemaster_analytics

**Purpose:** Aggregated metrics (updated daily via Cloud Function)

**Document ID:** `{date}` (e.g., `2026-01-14`)

**Schema:**
```typescript
interface DailyAnalytics {
  date: string;                      // YYYY-MM-DD
  
  // User metrics
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  
  // Subscription metrics
  freeUsers: number;
  trialUsers: number;
  paidUsers: number;
  newSubscriptions: number;
  revenue: number;                   // ZAR
  
  // Engagement metrics
  totalJourneysStarted: number;
  totalJourneysCompleted: number;
  avgJourneysPerUser: number;
  avgSessionDuration: number;        // minutes
  
  // Performance metrics
  avgScore: number;
  passRate: number;                  // percentage
  
  // Generated at
  generatedAt: Timestamp;
}
```

---

## 3. Indexes

### Composite Indexes (Required for Firestore queries)

```typescript
// drivemaster_users
[
  { field: 'tier', order: 'asc' },
  { field: 'currentStage', order: 'asc' }
]

[
  { field: 'trialEndDate', order: 'asc' },
  { field: 'tier', order: 'asc' }
]

[
  { field: 'flaggedForReview', order: 'asc' },
  { field: 'updatedAt', order: 'desc' }
]

// drivemaster_progress (subcollection)
[
  { field: 'stage', order: 'asc' },
  { field: 'completedAt', order: 'desc' }
]

[
  { field: 'passed', order: 'asc' },
  { field: 'score', order: 'desc' }
]

// drivemaster_journeys
[
  { field: 'stage', order: 'asc' },
  { field: 'isPublished', order: 'asc' }
]

// drivemaster_questions
[
  { field: 'stage', order: 'asc' },
  { field: 'isActive', order: 'asc' },
  { field: 'difficultyLevel', order: 'asc' }
]

[
  { field: 'tags', array: true },
  { field: 'difficultyLevel', order: 'asc' }
]

// drivemaster_schools
[
  { field: 'subscription.status', order: 'asc' },
  { field: 'serviceRegions', array: true }
]

// drivemaster_certificates
[
  { field: 'userId', order: 'asc' },
  { field: 'issuedAt', order: 'desc' }
]
```

---

## 4. Security Rules

See [ARCHITECTURE.md Section 5](#5-security-architecture) for complete rules.

**Key Rules:**
- Users can only read/write their own profile
- Journeys/Questions are read-only (managed via admin panel)
- Subscriptions are managed via Cloud Functions only
- Certificates are publicly verifiable but not editable

---

## 5. Query Patterns

### Get user's journey history (last 10 attempts)
```typescript
const progressQuery = query(
  collection(db, `drivemaster_users/${userId}/progress`),
  orderBy('completedAt', 'desc'),
  limit(10)
);
```

### Get all Beginner journeys
```typescript
const journeysQuery = query(
  collection(db, 'drivemaster_journeys'),
  where('stage', '==', 'beginner'),
  where('isPublished', '==', true)
);
```

### Get random questions for a stop-sign event
```typescript
const questionsQuery = query(
  collection(db, 'drivemaster_questions'),
  where('eventTypes', 'array-contains', 'stop-sign'),
  where('stage', '==', 'beginner'),
  where('isActive', '==', true)
);

// Client-side: shuffle and pick 3
const questions = await getDocs(questionsQuery);
const shuffled = shuffle(questions.docs);
const selected = shuffled.slice(0, 3);
```

### Get driving schools in Johannesburg with active subscriptions
```typescript
const schoolsQuery = query(
  collection(db, 'drivemaster_schools'),
  where('serviceRegions', 'array-contains', 'Johannesburg'),
  where('subscription.status', '==', 'active')
);
```

### Check if trial has expired (run daily via Cloud Scheduler)
```typescript
const expiredTrialsQuery = query(
  collection(db, 'drivemaster_users'),
  where('tier', '==', 'trial'),
  where('trialEndDate', '<', new Date())
);
```

---

## 6. Data Migration Strategy

### Phase 1: Initial Setup (Development)
- Create collections manually
- Populate with seed data (10 journeys, 100 questions)
- Test all CRUD operations

### Phase 2: Testing (Staging)
- Import production-ready content (50 journeys, 500 questions)
- Simulate 1000 users
- Load test query patterns

### Phase 3: Production Launch
- Deploy security rules
- Enable backup (daily snapshots)
- Set up monitoring (Firestore usage dashboard)

### Backup Strategy
- **Daily backups** to Cloud Storage
- **7-day retention** for point-in-time recovery
- **Weekly exports** to BigQuery for analytics

---

**Document Version:** 1.0  
**Last Updated:** January 14, 2026  
**Status:** Ready for Review
