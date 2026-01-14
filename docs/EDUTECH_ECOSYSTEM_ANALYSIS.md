# 🎓 EduTech - Comprehensive Ecosystem Analysis

> **Understanding the Allied iMpact platform to properly align EduTech development**

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Platform Architecture Overview](#platform-architecture-overview)
3. [Existing Apps Analysis](#existing-apps-analysis)
4. [Apps to Consolidate (CodeTech + uMkhanyakude)](#apps-to-consolidate)
5. [Authentication & Entitlement Patterns](#authentication--entitlement-patterns)
6. [Data Model & Firestore Patterns](#data-model--firestore-patterns)
7. [UI/UX Consistency Requirements](#uiux-consistency-requirements)
8. [Testing Standards](#testing-standards)
9. [EduTech Product Strategy](#edutech-product-strategy)
10. [Implementation Roadmap](#implementation-roadmap)

---

## 1. Executive Summary

### What We're Building
**EduTech** - A comprehensive education and skills development platform that consolidates:
- **CodeTech** (software development learning)
- **uMkhanyakude** (community education)

Into a single, unified platform with dual tracks:
1. **Computer Skills Track** (Basic to Advanced - uMkhanyakude origin)
2. **Coding Track** (Programming to Professional - CodeTech origin)

### Why Consolidation Makes Sense
1. **Overlapping Purpose**: Both are education platforms
2. **Shared Infrastructure**: Same authentication, billing, UI patterns
3. **Better User Experience**: One platform for all learning needs
4. **Simplified Maintenance**: Single codebase instead of two
5. **Strategic Focus**: Allied iMpact can focus resources on one education product

### Key Facts
- **Product Category**: Hybrid (Subscription + Impact/Sponsored)
- **Target Launch**: Q2 2026
- **Port Assignment**: 3007 (CodeTech: 3002, uMkhanyakude: 3004 - both freed)
- **Platform Integration**: Full SSO, Entitlements, Shared UI
- **ProductId**: `EDUTECH` (needs to be added to types package)

---

## 2. Platform Architecture Overview

### 2.1 Monorepo Structure

```
alliedimpact/
├── apps/                           # Individual applications
│   ├── careerbox/                  # Job matching (Production ✅)
│   ├── coinbox/                    # P2P Finance (Production ✅)
│   ├── drive-master/               # Driver training (Q1 2026)
│   ├── codetech/                   # 🔥 DELETE - Merge into EduTech
│   ├── umkhanyakude/               # 🔥 DELETE - Merge into EduTech
│   └── edutech/                    # 🆕 CREATE NEW
├── platform/                       # Platform services
│   ├── auth/                       # Centralized authentication
│   ├── billing/                    # Payment & subscriptions
│   ├── entitlements/               # Access control
│   ├── notifications/              # Cross-app notifications
│   └── shared/                     # Common utilities
├── packages/                       # Shared packages
│   ├── types/                      # TypeScript definitions
│   ├── ui/                         # Component library
│   ├── utils/                      # Helper functions
│   └── config/                     # Configuration
└── docs/                           # Platform documentation
```

### 2.2 Platform Services

#### **@allied-impact/auth**
- Centralized Firebase Auth wrapper
- Creates `platform_users` collection
- Provides: `initializeAuth()`, `createPlatformUser()`, `signInWithEmailAndPassword()`
- **EduTech Usage**: Import and use as-is

#### **@allied-impact/entitlements**
- Product access management
- Checks if user has access to products
- Supports: subscription, sponsored, project, role, grant access types
- **EduTech Usage**: Check access before showing content

#### **@allied-impact/types**
- Platform-wide TypeScript definitions
- Contains `ProductId` enum (needs EDUTECH added)
- Contains `PlatformUser`, `SubscriptionTier`, `ProductEntitlement`
- **EduTech Usage**: Import all types, add EDUTECH to ProductId

#### **@allied-impact/shared**
- Firebase initialization helpers
- Standard error classes (AlliedImpactError, AuthenticationError, etc.)
- **EduTech Usage**: Use for all error handling

#### **@allied-impact/ui**
- Shared component library (shadcn/ui based)
- **EduTech Usage**: Use for consistent UI

### 2.3 Tech Stack (Mandatory)

```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript 5.3+",
  "styling": "Tailwind CSS + shadcn/ui",
  "backend": "Firebase (Auth, Firestore, Storage, Functions)",
  "testing": "Jest + React Testing Library + Playwright",
  "package-manager": "pnpm",
  "build-system": "Turborepo",
  "i18n": "next-intl with [locale] routing"
}
```

**Critical Pattern**: All apps use `[locale]/` routing structure:
```
src/app/
├── api/                    # API routes (no locale)
├── globals.css             # Global styles
└── [locale]/               # All pages under locale
    ├── layout.tsx          # Root layout with i18n
    ├── page.tsx            # Home page
    └── dashboard/          # Feature pages
```

---

## 3. Existing Apps Analysis

### 3.1 CoinBox (Production - Reference)
**Status**: Production v2.1.0, 385+ tests, 82% coverage

**Key Learnings for EduTech**:
- **High quality bar**: Production apps need 80%+ test coverage
- **Complex features work**: P2P loans, investments, crypto trading all functional
- **Membership tiers**: R550-R5,500/month pricing successfully implemented
- **Firebase at scale**: Handles complex Firestore operations reliably
- **Architecture**: Well-documented with clear separation of concerns

### 3.2 CareerBox (Production - Just Completed)
**Status**: Production v1.0, 74 tests, 100% feature complete

**Key Learnings for EduTech**:
- **App Router patterns**: Uses `[locale]/` routing successfully
- **Dual user types**: Supports job seekers + employers (similar to learners + instructors)
- **Testing standard**: Unit + Component + Integration + E2E structure
- **Documentation**: 5 comprehensive files (README, ARCHITECTURE, FEATURES, DEVELOPMENT, TESTING)
- **CI/CD**: GitHub Actions workflow for automated testing

**Firestore Schema Example** (from ARCHITECTURE.md):
```typescript
users/{userId}
  ├── profile: {
  │     userType: 'individual' | 'company'
  │     email: string
  │     // ... more fields
  │   }
  ├── savedJobs: []
  └── applications: []

jobs/{jobId}
  ├── title: string
  ├── company: string
  ├── location: string
  └── requirements: []
```

**EduTech Similar Pattern**:
```typescript
edutech_users/{userId}
  ├── profile: {
  │     userType: 'learner' | 'instructor' | 'admin'
  │     learningTrack: 'computer-skills' | 'coding'
  │   }
  ├── enrollments: []
  └── completions: []

edutech_courses/{courseId}
  ├── title: string
  ├── track: 'computer-skills' | 'coding'
  ├── level: 'beginner' | 'intermediate' | 'advanced'
  └── modules: []
```

### 3.3 DriveMaster (Q1 2026)
**Port**: 3001  
**Category**: Subscription

**Key Features**:
- Interactive theory lessons
- Practice tests (K53 compliant)
- Progress tracking
- Certificates

**Lessons for EduTech**:
- Similar structure: Lessons → Tests → Certificates
- Progress tracking is essential
- Education apps need practice/assessment features

---

## 4. Apps to Consolidate

### 4.1 CodeTech (Current State)
**Port**: 3002  
**Status**: Scaffolded only (~5% complete)  
**Category**: Subscription

**Planned Features** (to migrate to EduTech):
1. **Coding Courses**
   - HTML, CSS, JavaScript
   - Python, React, Node.js
   - Full-Stack Web Development
   - Mobile App Development
   - DevOps & Cloud Computing

2. **Interactive Labs**
   - Browser-based code editor
   - Real-time execution
   - Code challenges

3. **Projects**
   - Build real applications
   - Portfolio building
   - Peer review

4. **Certifications**
   - Industry-recognized certificates
   - Course completion badges

5. **Job Board**
   - Connect with employers
   - Job placement support

**Pricing Model** (from docs):
- Free: Intro courses only
- Pro (R199/month): All courses + projects
- Enterprise (Custom): Team learning + analytics

**Current Implementation**:
- Basic Next.js structure only
- No business logic
- Just placeholder pages
- **Decision**: DELETE entire app, start fresh in EduTech

### 4.2 uMkhanyakude (Current State)
**Port**: 3004  
**Status**: Scaffolded only (~5% complete)  
**Category**: Impact/Sponsored (FREE)


2. **Features**
   - Self-paced learning
   - Video lessons with subtitles
   - Downloadable resources
   - Quizzes & assignments
   - Community forums
   - Progress tracking

3. **Certifications**
   - Course completion certificates
   - Community recognition

4. **Access Model**
   - **100% FREE** to all users
   - Sponsored by NGOs/Government
   - No ads (social impact focus)

**Target Audience**:
- South African communities
- Underserved areas
- Adult education
- Youth empowerment

**Current Implementation**:
- Basic Next.js structure
- Landing page with course categories
- No actual courses or functionality
- **Decision**: DELETE entire app, merge features into EduTech

---

## 5. Authentication & Entitlement Patterns

### 5.1 Authentication Flow

**Platform Auth** (`@allied-impact/auth`):

```typescript
// 1. Initialize (in EduTech app)
import { initializeAuth } from '@allied-impact/auth';
initializeAuth(firebaseConfig);

// 2. Sign Up
import { createPlatformUser } from '@allied-impact/auth';
const user = await createPlatformUser(email, password, displayName);
// Creates:
// - Firebase Auth user
// - platform_users/{uid} document

// 3. Sign In
import { signInWithEmailAndPassword } from '@allied-impact/auth';
const user = await signInWithEmailAndPassword(email, password);

// 4. Auth State
import { onAuthStateChanged } from '@allied-impact/auth';
onAuthStateChanged((user) => {
  // Update UI based on auth state
});
```

### 5.2 Entitlement Checking

**Before Showing Content**:

```typescript
import { hasProductAccess } from '@allied-impact/entitlements';
import { ProductId } from '@allied-impact/types';

// Check if user has access to EduTech
const hasAccess = await hasProductAccess(userId, ProductId.EDUTECH);

if (!hasAccess) {
  // Redirect to pricing page or show paywall
  router.push('/pricing');
}
```

**Get User's Tier**:

```typescript
import { getProductEntitlement } from '@allied-impact/entitlements';

const entitlement = await getProductEntitlement(userId, ProductId.EDUTECH);
// entitlement = {
//   userId: string;
//   productId: 'EDUTECH';
//   tier: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
//   status: 'active' | 'trial' | 'inactive';
//   startDate: Date;
//   endDate?: Date;
// }

// Grant features based on tier
if (entitlement.tier === 'FREE') {
  // Show computer skills courses only (uMkhanyakude origin)
} else if (entitlement.tier === 'PREMIUM') {
  // Show computer skills + coding courses (full access)
}
```

### 5.3 Access Types

EduTech uses **hybrid access model**:

```typescript
export interface EduTechAccess {
  // Computer Skills Track
  computerSkills: {
    accessType: 'sponsored';  // FREE for all (uMkhanyakude origin)
    tier: 'FREE';
  };
  
  // Coding Track
  codingCourses: {
    accessType: 'subscription';  // Paid (CodeTech origin)
    tier: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  };
}
```

**Implementation**:
```typescript
// Computer Skills = Always accessible
async function canAccessComputerSkills(userId: string): Promise<boolean> {
  return true; // Sponsored by NGOs, free for all
}

// Coding Courses = Check subscription
async function canAccessCodingCourses(userId: string): Promise<boolean> {
  const entitlement = await getProductEntitlement(userId, ProductId.EDUTECH);
  return entitlement?.tier !== 'FREE';
}
```

---

## 6. Data Model & Firestore Patterns

### 6.1 Database Isolation

**Rule**: Each app has its own Firestore collections with app prefix

**Examples**:
- CoinBox: `coinbox_users`, `coinbox_loans`, `coinbox_transactions`
- CareerBox: `careerbox_users`, `careerbox_jobs`, `careerbox_applications`
- **EduTech**: `edutech_users`, `edutech_courses`, `edutech_enrollments`

**Shared Collections** (platform-wide):
- `platform_users` - Created by `@allied-impact/auth`
- `product_entitlements` - Managed by `@allied-impact/entitlements`

### 6.2 EduTech Data Model

**Core Collections**:

```typescript
// edutech_users/{userId}
interface EduTechUser {
  userId: string;              // Matches platform_users/{userId}
  userType: 'learner' | 'instructor' | 'admin';
  displayName: string;
  email: string;
  
  // Learning preferences
  primaryTrack: 'computer-skills' | 'coding' | 'both';
  learningGoals: string[];
  languagePreference: 'en' | 'zu' | 'xh';  // English, Zulu, Xhosa
  
  // Progress
  totalCoursesCompleted: number;
  totalHoursLearned: number;
  currentStreak: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// edutech_courses/{courseId}
interface EduTechCourse {
  courseId: string;
  title: string;
  description: string;
  
  // Categorization
  track: 'computer-skills' | 'coding';
  category: string;            // e.g., 'web-development', 'financial-literacy'
  level: 'beginner' | 'intermediate' | 'advanced';
  
  // Access control
  tier: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  
  // Content
  modules: {
    moduleId: string;
    title: string;
    order: number;
    lessons: {
      lessonId: string;
      title: string;
      type: 'video' | 'reading' | 'quiz' | 'coding-exercise';
      durationMinutes: number;
    }[];
  }[];
  
  // Metadata
  instructorId: string;
  estimatedHours: number;
  thumbnailUrl: string;
  tags: string[];
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// edutech_enrollments/{userId}/courses/{courseId}
interface EduTechEnrollment {
  userId: string;
  courseId: string;
  enrolledAt: Timestamp;
  
  // Progress
  progress: number;            // 0-100
  completedLessons: string[];  // lesson IDs
  currentLesson: string;
  
  // Status
  status: 'in-progress' | 'completed' | 'dropped';
  completedAt?: Timestamp;
  
  // Engagement
  lastAccessedAt: Timestamp;
  totalTimeSpent: number;      // minutes
}

// edutech_certificates/{certificateId}
interface EduTechCertificate {
  certificateId: string;
  userId: string;
  courseId: string;
  
  // Details
  courseName: string;
  completedAt: Timestamp;
  issuedAt: Timestamp;
  
  // Verification
  certificateNumber: string;
  verificationUrl: string;
  
  // PDF
  pdfUrl: string;
}

// edutech_assessments/{assessmentId}
interface EduTechAssessment {
  assessmentId: string;
  courseId: string;
  moduleId?: string;
  
  // Content
  title: string;
  type: 'quiz' | 'coding-challenge' | 'project';
  questions: {
    questionId: string;
    text: string;
    type: 'multiple-choice' | 'code' | 'essay';
    correctAnswer?: string;
    points: number;
  }[];
  
  // Requirements
  passingScore: number;
  timeLimit?: number;          // minutes
}

// edutech_submissions/{userId}/assessments/{assessmentId}
interface EduTechSubmission {
  userId: string;
  assessmentId: string;
  courseId: string;
  
  // Submission
  answers: Record<string, string>;
  submittedAt: Timestamp;
  
  // Grading
  score: number;
  passed: boolean;
  feedback?: string;
  gradedAt?: Timestamp;
}

// edutech_forum_posts/{postId}
interface EduTechForumPost {
  postId: string;
  courseId: string;
  
  // Content
  title: string;
  body: string;
  authorId: string;
  
  // Engagement
  replies: number;
  upvotes: number;
  
  // Status
  resolved: boolean;
  pinned: boolean;
  
  createdAt: Timestamp;
}
```

### 6.3 Firestore Security Rules Pattern

```javascript
// firestore.rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Platform-wide collections (managed by platform services)
    match /platform_users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only via platform auth service
    }
    
    match /product_entitlements/{entitlementId} {
      allow read: if request.auth != null;
      allow write: if false; // Only via platform entitlements service
    }
    
    // EduTech-specific collections
    match /edutech_users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    match /edutech_courses/{courseId} {
      allow read: if request.auth != null; // All authenticated users can browse
      allow write: if false; // Only via admin/instructor tools
    }
    
    match /edutech_enrollments/{userId}/courses/{courseId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ... more rules
  }
}
```

---

## 7. UI/UX Consistency Requirements

### 7.1 Layout Structure (from CareerBox)

**Standard Layout**:

```tsx
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { SkipLink } from '@/components/ui/accessibility';
import '../globals.css';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <SkipLink />
        <ErrorBoundary>
          <ToastProvider>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 7.2 Design System

**Colors** (Coin Box Blue - Allied iMpact brand):
```css
/* From globals.css */
:root {
  --primary-blue: #193281;
  --primary-purple: #8B5CF6;
  --background: #FFFFFF;
  --foreground: #1A1A1A;
}

.dark {
  --background: #1A1A1A;
  --foreground: #FFFFFF;
}
```

**Typography**:
- Font: System fonts (Inter, -apple-system, etc.)
- Headings: Bold, clear hierarchy
- Body: 16px base, 1.5 line-height

**Components** (from shadcn/ui):
- Button, Card, Input, Select, Dialog
- Toast, Dropdown, Tabs, Badge
- All customized to Allied iMpact brand

### 7.3 Responsive Design

**Breakpoints** (Tailwind defaults):
```javascript
{
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px'  // Extra large
}
```

**Mobile-First Approach**:
```tsx
// Example from CareerBox
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### 7.4 Accessibility

**Requirements**:
- Keyboard navigation
- Screen reader support
- ARIA labels
- Skip links
- Focus indicators
- Color contrast (WCAG AA)

**Example** (from CareerBox):
```tsx
<SkipLink />  // Jump to main content
<button aria-label="Close dialog">X</button>
<input aria-describedby="error-message" />
```

---

## 8. Testing Standards

### 8.1 Test Coverage Requirements

**Minimum**:
- **Unit Tests**: 70% coverage
- **Component Tests**: Key components
- **Integration Tests**: Critical flows
- **E2E Tests**: Major user journeys

**CareerBox Achieved**:
- 74 total test cases
- Unit: 33 tests (validation utilities)
- Component: 33 tests (3 files)
- Integration: 8 tests (2 files)
- E2E: Structure + documentation

### 8.2 Testing Structure

```
tests/
├── unit/                       # Pure functions, utilities
│   ├── validation.test.ts
│   ├── formatting.test.ts
│   └── calculations.test.ts
├── component/                  # React components
│   ├── CourseCard.test.tsx
│   ├── EnrollmentButton.test.tsx
│   └── ProgressBar.test.tsx
├── integration/                # Multiple components together
│   ├── enrollment-flow.test.ts
│   └── course-completion.test.ts
└── e2e/                        # Full user journeys (Playwright)
    ├── learner-signup.spec.ts
    ├── course-enrollment.spec.ts
    └── certificate-issuance.spec.ts
```

### 8.3 Test Scripts

**package.json**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### 8.4 CI/CD Pipeline

**GitHub Actions** (from CareerBox):
```yaml
name: CareerBox Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit & component tests
        run: pnpm test:ci
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

**EduTech should have identical CI/CD setup**

---

## 9. EduTech Product Strategy

### 9.1 Product Positioning

**Value Proposition**:
> "EduTech: Your complete learning journey from computer basics to professional coding skills"

**Target Audience**:

1. **Computer Skills Track** (uMkhanyakude origin)
   - Community members seeking basic skills
   - Adults entering digital economy
   - Youth without tech access
   - **Access**: FREE (sponsored)

2. **Coding Track** (CodeTech origin)
   - Career changers entering tech
   - Students learning programming
   - Existing developers upskilling
   - **Access**: PAID (subscription)

### 9.2 Dual-Track Model

```
EduTech Platform
├── Computer Skills Track (FREE - Sponsored)
│   ├── Digital Literacy
│   ├── Microsoft Office
│   ├── Internet & Email
│   ├── Financial Literacy
│   ├── Basic Entrepreneurship
│   └── Community Resources
│
└── Coding Track (PAID - Subscription)
    ├── Web Development (HTML/CSS/JS)
    ├── Frontend Frameworks (React, Vue)
    ├── Backend Development (Node.js, Python)
    ├── Full-Stack Projects
    ├── Mobile App Development
    └── DevOps & Cloud
```

**Bridge Path**: Users who complete Computer Skills can upgrade to Coding Track

### 9.3 Pricing Strategy

**Tier 1: FREE (Computer Skills Track)**
- All computer skills courses
- Community forums
- Basic certificates
- Sponsored by NGOs/Government
- **Target**: 10,000+ users by Q4 2026

**Tier 2: PREMIUM (R199/month)**
- Everything in FREE
- **+ Coding Track courses**
- Interactive coding labs
- Project portfolios
- Industry certifications
- **Target**: 1,000+ subscribers by Q4 2026

**Tier 3: ENTERPRISE (Custom pricing)**
- Everything in PREMIUM
- Team learning dashboards
- Custom content creation
- Analytics & reporting
- Priority support
- **Target**: 10+ organizations by Q4 2026

**Key Insight**: Free tier generates social impact + funnel for paid upgrades

### 9.4 User Archetypes

**Platform-Wide** (in platform_users):
```typescript
type Archetype = 
  | 'coinbox_member'
  | 'myprojects_client'
  | 'careerbox_seeker'
  | 'careerbox_employer'
  | 'edutech_learner'      // 🆕 ADD
  | 'edutech_instructor';  // 🆕 ADD
```

**EduTech-Specific**:
```typescript
interface EduTechArchetype {
  learner: {
    tracks: ['computer-skills' | 'coding'][];
    tier: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
    progress: number;
  };
  
  instructor: {
    specialization: string[];
    coursesCreated: number;
    rating: number;
  };
}
```

### 9.5 Feature Prioritization (MVP → Full)

**Phase 1: MVP (Weeks 1-4)**
- [ ] User registration (learner archetype)
- [ ] Course catalog (both tracks visible)
- [ ] Course detail pages
- [ ] Enrollment flow
- [ ] Video lessons (simple player)
- [ ] Progress tracking (basic)
- [ ] Free courses accessible to all
- [ ] Paywall for coding track

**Phase 2: Core Features (Weeks 5-8)**
- [ ] Quiz system
- [ ] Coding exercises (Monaco editor integration)
- [ ] Certificate generation (PDF)
- [ ] User dashboard (progress overview)
- [ ] Course search & filtering
- [ ] Bookmarking courses
- [ ] Discussion forums (per course)

**Phase 3: Enhanced Features (Weeks 9-12)**
- [ ] Live coding sessions
- [ ] Instructor dashboard
- [ ] Course creation tools (admin)
- [ ] Advanced analytics
- [ ] Badges & achievements
- [ ] Peer code review
- [ ] Job board integration

**Phase 4: Polish & Scale (Weeks 13-16)**
- [ ] Mobile optimization
- [ ] Offline mode (PWA)
- [ ] Multi-language support (Zulu, Xhosa)
- [ ] Admin panel
- [ ] Sponsorship tracking (for free tier)
- [ ] Performance optimization
- [ ] 80%+ test coverage

---

## 10. Implementation Roadmap

### 10.1 Pre-Development Checklist

**Platform Updates**:
- [ ] Add `EDUTECH` to `ProductId` enum in `@allied-impact/types`
- [ ] Update entitlements service to support hybrid access (free + paid)
- [ ] Create EduTech product entry in product registry

**Cleanup**:
- [ ] Delete `apps/codetech/` directory
- [ ] Delete `apps/umkhanyakude/` directory
- [ ] Update docs to remove CodeTech & uMkhanyakude as separate products

**Setup**:
- [ ] Create `apps/edutech/` directory
- [ ] Copy structure from `apps/careerbox/` (proven pattern)
- [ ] Port: 3007
- [ ] Configure Firebase project

### 10.2 Development Phases

#### **Week 1-2: Foundation**
**Goal**: Basic app structure + authentication

Tasks:
1. Create Next.js 14 app in `apps/edutech/`
2. Set up `[locale]/` routing structure
3. Install dependencies (all workspace packages)
4. Integrate `@allied-impact/auth`
5. Create basic layout (header, footer, sidebar)
6. Set up Firestore collections
7. Configure Firebase config
8. Write initial tests

**Deliverable**: Empty app with working auth

---

#### **Week 3-4: Core Features**
**Goal**: Course catalog + enrollment

Tasks:
1. Create course catalog page
2. Build course card component
3. Implement course detail page
4. Add enrollment button
5. Create user dashboard
6. Show enrolled courses
7. Implement progress tracking UI
8. Add paywall for coding courses

**Deliverable**: Users can browse and enroll in courses

---

#### **Week 5-6: Learning Experience**
**Goal**: Lesson viewing + progress

Tasks:
1. Build lesson viewer component
2. Integrate video player (Vimeo/YouTube)
3. Create quiz component
4. Implement code editor (Monaco)
5. Add lesson completion tracking
6. Create module navigation
7. Build progress bar
8. Add bookmark functionality

**Deliverable**: Users can complete lessons and track progress

---

#### **Week 7-8: Certification**
**Goal**: Assessments + certificates

Tasks:
1. Build assessment system
2. Create submission flow
3. Implement grading logic
4. Design certificate template
5. Generate PDF certificates
6. Create certificate verification page
7. Add certificate download
8. Show certificates in dashboard

**Deliverable**: Users earn certificates on completion

---

#### **Week 9-10: Community Features**
**Goal**: Forums + interaction

Tasks:
1. Build forum component
2. Create post creation flow
3. Implement reply system
4. Add upvoting
5. Create notifications
6. Build user profiles
7. Add achievements/badges
8. Implement leaderboard

**Deliverable**: Active community engagement

---

#### **Week 11-12: Admin & Instructor Tools**
**Goal**: Content management

Tasks:
1. Build admin dashboard
2. Create course creation form
3. Implement module builder
4. Add lesson uploader
5. Create quiz builder
6. Build analytics dashboard
7. Add user management
8. Implement sponsorship tracking

**Deliverable**: Instructors can create content

---

#### **Week 13-14: Polish**
**Goal**: Performance + UX

Tasks:
1. Performance audit
2. Optimize images
3. Implement lazy loading
4. Add loading skeletons
5. Improve error handling
6. Add empty states
7. Implement offline support (PWA)
8. Mobile optimization

**Deliverable**: Fast, smooth experience

---

#### **Week 15-16: Testing & Launch Prep**
**Goal**: Quality assurance

Tasks:
1. Write unit tests (70%+ coverage)
2. Write component tests
3. Write integration tests
4. Write E2E tests (key flows)
5. Set up CI/CD pipeline
6. Create comprehensive documentation
7. Conduct security audit
8. Beta testing with real users

**Deliverable**: Production-ready app

---

### 10.3 Technical Debt Prevention

**Code Quality**:
- [ ] TypeScript strict mode enabled
- [ ] ESLint + Prettier configured
- [ ] Pre-commit hooks (Husky + lint-staged)
- [ ] Code review required for all PRs

**Documentation**:
- [ ] README.md (setup instructions)
- [ ] ARCHITECTURE.md (technical design)
- [ ] FEATURES.md (comprehensive feature list)
- [ ] DEVELOPMENT.md (local development guide)
- [ ] TESTING.md (testing strategy)
- [ ] API.md (if applicable)

**Security**:
- [ ] Firestore security rules tested
- [ ] Input validation on all forms
- [ ] XSS prevention
- [ ] CSRF tokens where needed
- [ ] Environment variables secured
- [ ] Regular dependency updates

---

## 11. Success Metrics

### 11.1 Product Metrics

**Launch (Q2 2026)**:
- [ ] 100% feature parity with planned scope
- [ ] 80%+ test coverage
- [ ] <2s page load time (desktop)
- [ ] <3s page load time (mobile)
- [ ] Lighthouse score: 90+ (Performance, Accessibility, SEO)

**Q3 2026**:
- [ ] 1,000+ registered users
- [ ] 100+ active paying subscribers
- [ ] 5,000+ course enrollments
- [ ] 1,000+ certificates issued
- [ ] 50+ forum posts per week

**Q4 2026**:
- [ ] 10,000+ registered users
- [ ] 1,000+ active paying subscribers
- [ ] 50,000+ course enrollments
- [ ] 10,000+ certificates issued
- [ ] 500+ forum posts per week
- [ ] 10+ enterprise clients

### 11.2 Technical Metrics

**Performance**:
- [ ] Server response time: <200ms (p50), <500ms (p95)
- [ ] Database queries: <50ms (p50), <200ms (p95)
- [ ] Bundle size: <300KB (initial load)
- [ ] Core Web Vitals: All "Good"

**Reliability**:
- [ ] Uptime: 99.9%
- [ ] Error rate: <0.1%
- [ ] Zero data loss incidents
- [ ] <1 hour MTTR (mean time to recovery)

**Quality**:
- [ ] Zero critical bugs in production
- [ ] <5 high-priority bugs at any time
- [ ] Code review on 100% of PRs
- [ ] Automated tests run on every commit

---

## 12. Risk Mitigation

### 12.1 Technical Risks

**Risk**: Firebase costs spiral out of control  
**Mitigation**: 
- Implement query optimization
- Use Firebase emulator for development
- Monitor usage with Cloud Monitoring
- Set up billing alerts

**Risk**: Video hosting costs too high  
**Mitigation**:
- Use YouTube unlisted videos (free)
- Compress videos efficiently
- Implement lazy loading
- Consider Vimeo Pro plan

**Risk**: Code editor performance issues  
**Mitigation**:
- Use Monaco editor (battle-tested)
- Lazy load editor component
- Implement web workers for heavy tasks
- Limit max file size

### 12.2 Product Risks

**Risk**: Users don't upgrade from Free to Premium  
**Mitigation**:
- Clear value proposition for coding track
- Free trial of Premium (7 days)
- Showcase success stories
- Offer discounts for early adopters

**Risk**: Free tier unsustainable without sponsors  
**Mitigation**:
- Secure sponsorship commitments early
- Apply for grants (education focus)
- Partner with NGOs/government
- Keep infrastructure costs low

**Risk**: Content creation bottleneck  
**Mitigation**:
- Start with existing open-source content
- Partner with existing educators
- Crowdsource content from community
- Build scalable content pipeline

---

## 13. Next Steps

### Immediate Actions (This Week)

1. **Update Platform Types**
   ```bash
   # Edit packages/types/src/index.ts
   # Add EDUTECH to ProductId enum
   ```

2. **Delete Old Apps**
   ```bash
   # Backup first (just in case)
   pnpm run backup
   
   # Delete
   rm -rf apps/codetech
   rm -rf apps/umkhanyakude
   
   # Commit deletion
   git add .
   git commit -m "chore: remove CodeTech and uMkhanyakude - consolidating into EduTech"
   ```

3. **Create EduTech App Structure**
   ```bash
   # Copy proven structure from CareerBox
   cp -r apps/careerbox apps/edutech
   
   # Update package.json (name, port, etc.)
   # Update README.md
   # Clear out CareerBox-specific code
   ```

4. **Configure Firebase**
   - Create new Firebase project: `edutech-alliedimpact`
   - Enable Auth, Firestore, Storage
   - Download config
   - Add to `config/firebase.ts`

5. **Set Up Development Environment**
   ```bash
   cd apps/edutech
   pnpm install
   pnpm dev  # Should run on port 3007
   ```

### This Month (January 2026)

- [ ] Complete Foundation phase (Weeks 1-2)
- [ ] Start Core Features phase (Weeks 3-4)
- [ ] Set up CI/CD pipeline
- [ ] Write initial documentation

### Next Month (February 2026)

- [ ] Complete Core Features
- [ ] Complete Learning Experience
- [ ] Start Certification system
- [ ] Begin beta testing with small group

### Q2 2026 Target

- [ ] Full feature completion
- [ ] 80%+ test coverage
- [ ] Comprehensive documentation
- [ ] Public beta launch
- [ ] First 1,000 users

---

## 14. Questions & Decisions Needed

### Platform-Level Decisions

1. **ProductId Enum**
   - Confirm: Add `EDUTECH` to enum?
   - Any other platform changes needed?

2. **Sponsorship Tracking**
   - Should we track sponsors in platform or app-level?
   - How to measure impact for sponsors?

3. **Billing Integration**
   - Which payment gateway? (PayFast, Paystack, Ozow?)
   - Handle subscriptions at platform or app level?

### App-Level Decisions

1. **Content Source**
   - Where to source initial courses?
   - Partner with existing educators?
   - Create in-house?

2. **Video Hosting**
   - YouTube unlisted?
   - Vimeo?
   - Self-hosted (Firebase Storage)?

3. **Code Editor**
   - Monaco Editor (VSCode)?
   - CodeMirror?
   - Custom solution?

4. **Assessment Strategy**
   - Auto-graded quizzes only?
   - Manual review for projects?
   - Peer review?

5. **Certificate Design**
   - Digital only or physical mailing option?
   - Blockchain verification?
   - Simple PDF?

---

## 15. Appendix

### A. Useful Commands

```bash
# Start development
cd apps/edutech
pnpm dev

# Run tests
pnpm test
pnpm test:watch
pnpm test:coverage

# Build for production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Format code
pnpm format
```

### B. Key Files to Reference

**CareerBox** (proven patterns):
- `apps/careerbox/src/app/[locale]/layout.tsx` - Layout structure
- `apps/careerbox/ARCHITECTURE.md` - Data model reference
- `apps/careerbox/FEATURES.md` - Feature documentation
- `apps/careerbox/TESTING.md` - Testing approach
- `apps/careerbox/package.json` - Dependency list

**Platform Packages**:
- `platform/auth/src/index.ts` - Auth implementation
- `platform/entitlements/src/index.ts` - Entitlement checking
- `packages/types/src/index.ts` - Type definitions
- `platform/shared/src/index.ts` - Shared utilities

**Documentation**:
- `docs/PLATFORM_AND_PRODUCTS.md` - Product catalog
- `docs/ARCHITECTURE_AND_SECURITY.md` - Platform architecture
- `docs/DEVELOPMENT_AND_SCALING_GUIDE.md` - Development guidelines

### C. Similar Patterns in Other Apps

**DriveMaster** (education platform):
- Lessons → Tests → Certificates (same flow EduTech needs)
- Progress tracking
- Practice tests

**CoinBox** (complex business logic):
- Membership tiers (similar to Free/Premium/Enterprise)
- Multiple user types
- Complex Firestore queries

**CareerBox** (dual user types):
- Job Seeker + Employer (similar to Learner + Instructor)
- Dashboard with different views
- Search and filtering

---

**Document Status**: Complete  
**Last Updated**: January 2026  
**Author**: Allied iMpact Development Team  
**Next Review**: After EduTech MVP completion

---

