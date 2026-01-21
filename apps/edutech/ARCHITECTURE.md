# 🏗️ EduTech - System Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Platform Integration](#platform-integration)
4. [Architecture Patterns](#architecture-patterns)
5. [Data Models](#data-models)
6. [Service Layer](#service-layer)
7. [Security Architecture](#security-architecture)
8. [Internationalization](#internationalization)
9. [Integration Points](#integration-points)
10. [Performance & Scalability](#performance--scalability)

---

## System Overview

### Platform Purpose

EduTech is a comprehensive dual-track education platform that provides:
- **Computer Skills Track (FREE)**: Digital literacy, office skills, financial literacy
- **Coding Track (PREMIUM)**: Professional software development training

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                              │
│  Next.js 14 (React 18) + TypeScript + Tailwind CSS          │
│  Multi-language Support (next-intl)                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│              Allied iMpact Platform Services                  │
│  @allied-impact/auth        - Authentication                  │
│  @allied-impact/entitlements - Access Control                 │
│  @allied-impact/billing     - Subscription Management         │
│  @allied-impact/shared      - Shared Utilities                │
│  @allied-impact/ui          - Component Library               │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                   Firebase Backend                            │
│  • Firebase Auth (Email, Google, GitHub)                      │
│  • Firestore (NoSQL Database)                                │
│  • Storage (Course materials, certificates)                   │
│  • Functions (Server-side logic)                             │
│  • Analytics (User behavior tracking)                         │
└───────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Monorepo Architecture**: Shared code via workspace packages
2. **Component-Driven**: Reusable UI components with shadcn/ui
3. **Type-Safe**: TypeScript throughout with Zod validation
4. **Internationalized**: Multi-language support (English/Afrikaans)
5. **Accessible**: WCAG 2.1 AA compliant
6. **Progressive**: Works offline with graceful degradation
7. **Scalable**: Firebase-backed with horizontal scaling capability

---

## Technology Stack

### Frontend Framework

**Next.js 14.0+ (App Router)**
- **Server Components**: Default rendering for performance
- **Client Components**: Interactive UI with "use client"
- **Dynamic Routes**: File-based routing system
- **Metadata API**: SEO optimization
- **Image Optimization**: Next/image for automatic optimization
- **Middleware**: Route protection and i18n

**Why Next.js 14?**
- App Router provides better data fetching patterns
- Server Components reduce client-side JavaScript
- Built-in image and font optimization
- Excellent TypeScript support
- Vercel deployment integration

### UI & Styling

**Tailwind CSS 3.4+**
- Utility-first CSS framework
- JIT compiler for small bundle sizes
- Custom design tokens
- Dark mode support
- Responsive design utilities

**shadcn/ui + Radix UI**
- Accessible component primitives
- Unstyled, customizable components
- Keyboard navigation support
- ARIA attributes built-in

**Lucide React**
- Icon library with 1000+ icons
- Tree-shakable imports
- Consistent design language

### Backend & Database

**Firebase 10.7+**

**Firebase Auth:**
- Email/password authentication
- Google OAuth
- GitHub OAuth
- Custom claims for roles (user, facilitator, instructor, admin)

**Firestore:**
- NoSQL document database
- Real-time synchronization
- Offline persistence
- Security rules for access control

**Firebase Storage:**
- Course materials (videos, PDFs, code files)
- User profile images
- Certificates
- Assignment submissions

**Cloud Functions:**
- Certificate generation
- Email notifications
- Progress calculations
- Automated reminders

**Firebase Analytics:**
- Custom event tracking
- User journey analysis
- Conversion tracking

### Development Tools

- **TypeScript 5.3**: Type safety and IntelliSense
- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Sentry**: Error tracking and monitoring

---

## Platform Integration

### Shared Packages

EduTech integrates deeply with Allied iMpact platform services:

**@allied-impact/auth**
```typescript
// Centralized authentication
import { AuthProvider, useAuth } from '@allied-impact/auth';

// Access user across all apps
const { user, signIn, signOut } = useAuth();
```

**@allied-impact/entitlements**
```typescript
// Check user permissions and subscriptions
import { useEntitlements } from '@allied-impact/entitlements';

const { hasAccess, subscription } = useEntitlements();

// Free track: Computer skills
const canAccessComputerSkills = hasAccess('edutech:computer-skills');

// Premium track: Coding courses
const canAccessCoding = hasAccess('edutech:coding');
```

**@allied-impact/billing**
```typescript
// Manage subscriptions
import { SubscriptionManager } from '@allied-impact/billing';

// Subscribe to coding track
await SubscriptionManager.subscribe({
  product: 'edutech-coding',
  plan: 'monthly',
  amount: 199,
});
```

**@allied-impact/ui**
```typescript
// Shared component library
import { Button, Card, Dialog, Input } from '@allied-impact/ui';

// Consistent UI across all Allied iMpact apps
```

**@allied-impact/types**
```typescript
// Shared TypeScript types
import type { User, Subscription, Course } from '@allied-impact/types';

// Type safety across apps
```

---

## Architecture Patterns

### 1. Component Composition Pattern

**Atomic Design Principles:**

```
src/components/
├── ui/              # Atoms (Button, Input, Card)
├── shared/          # Molecules (CourseCard, LessonItem)
├── features/        # Organisms (CourseList, ProgressDashboard)
└── layouts/         # Templates (DashboardLayout, LessonLayout)
```

**Example:**
```typescript
// Atom: Button
<Button variant="primary" size="lg">Enroll Now</Button>

// Molecule: CourseCard (uses Button)
<CourseCard course={course} onEnroll={handleEnroll} />

// Organism: CourseList (uses CourseCard)
<CourseList courses={courses} filter={filter} />

// Template: DashboardLayout (uses CourseList)
<DashboardLayout><CourseList /></DashboardLayout>
```

### 2. Server-Side Data Fetching

**Server Components** fetch data directly:

```typescript
// app/[locale]/courses/page.tsx (Server Component)
export default async function CoursesPage() {
  // Fetch on server, no client-side waterfalls
  const courses = await getCourses();
  
  return <CourseList courses={courses} />;
}
```

**Client Components** use hooks for interactivity:

```typescript
// Client Component with real-time updates
'use client';

export function LiveProgressBar() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Real-time Firestore listener
    const unsubscribe = onSnapshot(
      doc(db, 'progress', userId),
      (snap) => setProgress(snap.data().percentage)
    );
    return unsubscribe;
  }, [userId]);
  
  return <ProgressBar value={progress} />;
}
```

### 3. Service Layer Pattern

Centralized business logic in service classes:

```typescript
// src/lib/services/CourseService.ts
export class CourseService {
  static async getCourse(id: string): Promise<Course> {
    const doc = await getDoc(doc(db, 'edutech_courses', id));
    if (!doc.exists()) throw new Error('Course not found');
    return doc.data() as Course;
  }
  
  static async enrollUser(userId: string, courseId: string): Promise<void> {
    await runTransaction(db, async (transaction) => {
      // Validate entitlements
      // Create enrollment record
      // Update user progress
      // Track analytics event
    });
  }
}
```

### 4. Custom Hooks Pattern

Reusable stateful logic:

```typescript
// src/hooks/useCourseProgress.ts
export function useCourseProgress(courseId: string) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchProgress(courseId).then(data => {
      setProgress(data.percentage);
      setLoading(false);
    });
  }, [courseId]);
  
  return { progress, loading, refetch: () => fetchProgress(courseId) };
}
```

### 5. Error Boundary Pattern

Graceful error handling:

```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## Data Models

### Core Entities

**1. EduTechUser**
```typescript
interface EduTechUser {
  id: string;                    // Firebase UID
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'facilitator' | 'instructor' | 'admin';
  locale: 'en' | 'af';
  track: 'computer-skills' | 'coding' | 'both';
  
  // Progress tracking
  completedCourses: string[];
  inProgressCourses: string[];
  certificates: string[];
  totalXP: number;
  level: number;
  
  // Subscription
  subscriptionStatus: 'free' | 'trial' | 'active' | 'expired';
  subscriptionEndDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}
```

**2. Course**
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  track: 'computer-skills' | 'coding';
  level: 'beginner' | 'intermediate' | 'advanced';
  
  // Content
  thumbnailURL: string;
  duration: number;              // In minutes
  modules: CourseModule[];
  prerequisites: string[];       // Course IDs
  
  // Access control
  isFree: boolean;
  requiredSubscription?: 'trial' | 'active';
  
  // Metadata
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  isPublished: boolean;
  
  // Stats
  enrollmentCount: number;
  completionRate: number;
  averageRating: number;
  reviewCount: number;
}
```

**3. CourseModule**
```typescript
interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  
  // Progress requirement
  minimumScore?: number;         // % required to pass module
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

**4. Lesson**
```typescript
interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'coding-challenge' | 'assignment';
  order: number;
  
  // Content
  content: LessonContent;
  duration: number;              // In minutes
  
  // Completion criteria
  completionCriteria: {
    type: 'view' | 'score' | 'submission';
    requiredScore?: number;
  };
  
  // Resources
  resources: Resource[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

**5. UserProgress**
```typescript
interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  
  // Overall progress
  status: 'not-started' | 'in-progress' | 'completed';
  percentage: number;            // 0-100
  currentModuleId?: string;
  currentLessonId?: string;
  
  // Module/lesson completion
  completedModules: string[];
  completedLessons: string[];
  
  // Scores
  moduleScores: Record<string, number>;
  quizScores: Record<string, number>;
  
  // Time tracking
  totalTimeSpent: number;        // In minutes
  lastAccessedAt: Date;
  
  // Completion
  completedAt?: Date;
  certificateId?: string;
  
  // Metadata
  startedAt: Date;
  updatedAt: Date;
}
```

**6. Certificate**
```typescript
interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  
  // Certificate details
  certificateNumber: string;     // ET-2026-001234
  issueDate: Date;
  validUntil?: Date;             // For expiring certifications
  
  // Scores
  finalScore: number;
  grade: 'A' | 'B' | 'C' | 'Pass';
  
  // PDF
  pdfURL: string;
  qrCodeURL: string;
  
  // Verification
  verificationURL: string;
  isRevoked: boolean;
  revokedReason?: string;
  
  // Metadata
  createdAt: Date;
}
```

**7. ForumPost**
```typescript
interface ForumPost {
  id: string;
  courseId?: string;
  authorId: string;
  
  // Content
  title: string;
  content: string;
  category: 'question' | 'discussion' | 'showcase' | 'announcement';
  tags: string[];
  
  // Engagement
  likeCount: number;
  replyCount: number;
  viewCount: number;
  
  // Status
  isPinned: boolean;
  isSolved: boolean;             // For questions
  solvedByReplyId?: string;
  
  // Moderation
  isModerated: boolean;
  isFlagged: boolean;
  flagReason?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

**8. Assignment**
```typescript
interface Assignment {
  id: string;
  lessonId: string;
  userId: string;
  
  // Submission
  submittedAt?: Date;
  submissionURL?: string;        // Storage URL
  submissionText?: string;
  
  // Grading
  status: 'pending' | 'submitted' | 'graded' | 'revision-requested';
  score?: number;
  feedback?: string;
  gradedBy?: string;             // Instructor ID
  gradedAt?: Date;
  
  // Revisions
  revisionCount: number;
  revisionHistory: Revision[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Service Layer

### Key Services

**1. CourseService**
- `getCourses()` - Fetch all published courses
- `getCourse(id)` - Get single course with modules/lessons
- `enrollUser(userId, courseId)` - Create enrollment
- `unenrollUser(userId, courseId)` - Remove enrollment
- `searchCourses(query)` - Full-text search
- `filterCourses(filter)` - Filter by track, level, free/paid

**2. ProgressService**
- `getUserProgress(userId, courseId)` - Get progress
- `updateProgress(userId, lessonId)` - Mark lesson complete
- `calculatePercentage(userId, courseId)` - Calculate % complete
- `getRecommendedCourses(userId)` - AI-based recommendations
- `generateCertificate(userId, courseId)` - Issue certificate

**3. LessonService**
- `getLesson(id)` - Fetch lesson details
- `completeLesson(userId, lessonId)` - Mark complete
- `submitQuiz(userId, lessonId, answers)` - Submit quiz
- `gradeQuiz(answers, correctAnswers)` - Auto-grade
- `unlockNextLesson(userId, courseId)` - Sequential unlocking

**4. AssignmentService**
- `submitAssignment(userId, lessonId, data)` - Submit work
- `getAssignment(id)` - Fetch submission
- `gradeAssignment(id, score, feedback)` - Instructor grading
- `requestRevision(id, feedback)` - Request changes

**5. ForumService**
- `createPost(data)` - Create new post
- `getPosts(courseId)` - List forum posts
- `replyToPost(postId, content)` - Add reply
- `markSolved(postId, replyId)` - Mark question as solved
- `likePost(postId, userId)` - Like/unlike

**6. CertificateService**
- `generateCertificate(userId, courseId)` - Create certificate
- `verifyCertificate(certificateNumber)` - Public verification
- `revokeCertificate(id, reason)` - Admin revocation
- `downloadPDF(certificateId)` - Get PDF download URL

---

## Security Architecture

### Authentication Flow

```
1. User visits app → Check session cookie
   ↓
2. No session → Redirect to /login
   ↓
3. User logs in (Email/Google/GitHub)
   ↓
4. Firebase Auth creates token with custom claims:
   {
     uid: 'abc123',
     email: 'user@example.com',
     role: 'user',
     subscriptions: ['edutech-coding']
   }
   ↓
5. Middleware validates token on protected routes
   ↓
6. Server Components fetch user-specific data
```

### Authorization Levels

| Role | Permissions |
|------|-------------|
| **User** | View free courses, enroll in courses, submit assignments, forum participation |
| **Facilitator** | User permissions + View student progress, grade assignments, moderate forum |
| **Instructor** | Facilitator permissions + Create/edit courses, view analytics |
| **Admin** | All permissions + User management, content moderation, system configuration |

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profiles - read own, admins read all
    match /edutech_users/{userId} {
      allow read: if request.auth.uid == userId || 
                     request.auth.token.role == 'admin';
      allow write: if request.auth.uid == userId;
    }
    
    // Courses - public read, instructor+ write
    match /edutech_courses/{courseId} {
      allow read: if true;  // All courses visible
      allow write: if request.auth.token.role in ['instructor', 'admin'];
    }
    
    // User progress - own progress or instructor
    match /edutech_progress/{progressId} {
      allow read: if resource.data.userId == request.auth.uid ||
                     request.auth.token.role in ['instructor', 'admin'];
      allow write: if resource.data.userId == request.auth.uid;
    }
    
    // Certificates - owner or public verification
    match /edutech_certificates/{certId} {
      allow read: if resource.data.userId == request.auth.uid || 
                     request.resource == null;  // Public verification
      allow write: if request.auth.token.role == 'admin';
    }
    
    // Forum posts - authenticated read/write
    match /edutech_forum/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if resource.data.authorId == request.auth.uid ||
                              request.auth.token.role in ['facilitator', 'admin'];
    }
  }
}
```

### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Course materials - authenticated read
    match /courses/{courseId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role in ['instructor', 'admin'];
    }
    
    // Assignment submissions - user write, instructor read
    match /assignments/{userId}/{assignmentId} {
      allow read: if request.auth.uid == userId ||
                     request.auth.token.role in ['instructor', 'facilitator', 'admin'];
      allow write: if request.auth.uid == userId;
    }
    
    // Certificates - owner read, system write
    match /certificates/{userId}/{certId}.pdf {
      allow read: if request.auth.uid == userId;
      allow write: if false;  // Only Cloud Functions can write
    }
  }
}
```

---

## Internationalization

### next-intl Configuration

**Supported Locales:**
- `en` - English (default)
- `af` - Afrikaans

**Translation Files:**
```
src/translations/
├── en.json          # English translations
└── af.json          # Afrikaans translations
```

**Usage:**
```typescript
// Server Component
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('courses');
  return <h1>{t('title')}</h1>;
}

// Client Component
'use client';
import { useTranslations } from 'next-intl';

export function CourseCard() {
  const t = useTranslations('courses');
  return <button>{t('enroll')}</button>;
}
```

---

## Integration Points

### Firebase Services

- **Authentication**: Email, Google, GitHub OAuth
- **Database**: Firestore for all app data
- **Storage**: Course materials, assignments, certificates
- **Functions**: Background jobs, certificate generation
- **Analytics**: User behavior, conversion tracking

### Platform Services

- **Auth**: `@allied-impact/auth` for centralized authentication
- **Entitlements**: `@allied-impact/entitlements` for access control
- **Billing**: `@allied-impact/billing` for subscription management

### External Services (Optional)

- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: Real-user monitoring
- **SendGrid/Resend**: Transactional emails
- **Cloudinary**: Video hosting and transcoding (future)

---

## Performance & Scalability

### Performance Optimizations

**1. Server-Side Rendering:**
- Course catalog pre-rendered at build time
- User-specific data fetched on-demand
- Edge caching with Vercel

**2. Code Splitting:**
- Route-based splitting (automatic with Next.js)
- Dynamic imports for heavy components
- Lazy loading for below-the-fold content

**3. Image Optimization:**
- Next/image with automatic WebP/AVIF
- Responsive images with srcset
- Blur-up placeholders

**4. Database Optimization:**
- Firestore composite indexes for complex queries
- Pagination for large lists
- Real-time listeners only where needed

### Scalability Considerations

**Horizontal Scaling:**
- Firestore scales automatically
- Vercel Edge Functions for API routes
- CDN for static assets

**Cost Optimization:**
- Free tier: 50K reads/day, 20K writes/day
- Pay-as-you-go beyond free tier
- Estimated cost for 10K users: ~R1,500/month

**Monitoring:**
- Firebase Performance Monitoring
- Sentry for error tracking
- Custom analytics dashboards

---

*Last Updated: January 15, 2026*
