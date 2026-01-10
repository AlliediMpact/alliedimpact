# 🏗️ CareerBox Architecture

> Technical architecture and design documentation

---

## 📐 System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Next.js 14  │  │  React 18    │  │  TypeScript  │      │
│  │  App Router  │  │  Components  │  │     5.3      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Middleware Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │     i18n     │  │  Validation  │      │
│  │  Middleware  │  │   Routing    │  │    Layer     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Firestore  │  │  Cloud Fns   │  │   Storage    │      │
│  │   Database   │  │   API Layer  │  │    Bucket    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Data Model

### Firestore Collections Structure

```typescript
// Users Collection
users/{userId}
  ├── profile: {
  │     userType: 'individual' | 'company'
  │     email: string
  │     displayName: string
  │     avatar?: string
  │     createdAt: timestamp
  │     updatedAt: timestamp
  │   }
  ├── settings: {
  │     emailPreferences: object
  │     privacySettings: object
  │     notifications: object
  │   }
  └── stats: {
        profileViews: number
        applications: number
        savedJobs: number
      }

// Jobs Collection
jobs/{jobId}
  ├── title: string
  ├── company: reference
  ├── description: string
  ├── requirements: array
  ├── salary: { min, max, currency }
  ├── location: string
  ├── type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  ├── skills: array
  ├── status: 'active' | 'closed' | 'draft'
  ├── postedDate: timestamp
  └── applicantCount: number

// Applications Collection
applications/{applicationId}
  ├── userId: reference
  ├── jobId: reference
  ├── status: 'pending' | 'reviewing' | 'interviewing' | 'offered' | 'rejected'
  ├── submittedAt: timestamp
  ├── updatedAt: timestamp
  ├── coverLetter?: string
  ├── resume?: storageRef
  └── notes: array

// Messages Collection
conversations/{conversationId}
  ├── participants: [userId1, userId2]
  ├── lastMessage: string
  ├── lastMessageAt: timestamp
  ├── unreadCount: { userId1: number, userId2: number }
  └── messages: subcollection
       └── {messageId}
           ├── sender: reference
           ├── content: string
           ├── timestamp: timestamp
           ├── read: boolean
           └── attachments?: array

// Profile Views Collection
profileViews/{viewId}
  ├── viewerId: reference
  ├── viewedUserId: reference
  ├── timestamp: timestamp
  └── metadata: object

// Job Alerts Collection
jobAlerts/{alertId}
  ├── userId: reference
  ├── name: string
  ├── criteria: {
  │     keywords: array
  │     location?: string
  │     jobType?: array
  │     salaryMin?: number
  │     experience?: string
  │   }
  ├── frequency: 'instant' | 'daily' | 'weekly'
  ├── active: boolean
  ├── lastNotified?: timestamp
  └── createdAt: timestamp

// Reviews Collection
reviews/{reviewId}
  ├── companyId: reference
  ├── authorId: reference
  ├── rating: number (1-5)
  ├── title: string
  ├── pros: string
  ├── cons: string
  ├── position: string
  ├── helpful: number
  ├── notHelpful: number
  └── createdAt: timestamp

// Interviews Collection
interviews/{interviewId}
  ├── candidateId: reference
  ├── companyId: reference
  ├── jobId: reference
  ├── date: timestamp
  ├── duration: number
  ├── platform: 'zoom' | 'teams' | 'google-meet'
  ├── meetingLink: string
  ├── status: 'scheduled' | 'completed' | 'cancelled'
  ├── notes?: string
  └── createdAt: timestamp
```

---

## 🔐 Security Model

### Authentication Flow

```
1. User enters credentials
2. Firebase Auth validates
3. JWT token generated
4. Token stored in httpOnly cookie
5. Middleware validates token on each request
6. User context available in components
```

### Security Rules (Firestore)

```javascript
// Users can only read/write their own data
match /users/{userId} {
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId;
}

// Jobs are readable by all authenticated users
match /jobs/{jobId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null 
    && request.resource.data.companyId == request.auth.uid;
  allow update, delete: if resource.data.companyId == request.auth.uid;
}

// Applications are private
match /applications/{applicationId} {
  allow read: if request.auth.uid == resource.data.userId 
    || request.auth.uid == resource.data.companyId;
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update: if request.auth.uid == resource.data.companyId;
}

// Messages are private to participants
match /conversations/{conversationId} {
  allow read, write: if request.auth.uid in resource.data.participants;
}
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App Layout
├── Header
│   ├── Logo
│   ├── Navigation
│   ├── SearchBar (Global)
│   ├── NotificationBell
│   └── UserMenu
├── Main Content
│   ├── Dashboard (Individual)
│   │   ├── MatchesPage
│   │   ├── ApplicationsPage
│   │   ├── SavedJobsPage
│   │   ├── ProfileViewsPage
│   │   ├── AnalyticsPage
│   │   ├── JobAlertsPage
│   │   ├── ResumeBuilderPage
│   │   ├── MessagesPage
│   │   └── SettingsPage
│   ├── Dashboard (Company)
│   │   ├── ListingsPage
│   │   ├── ApplicantsPage
│   │   ├── AnalyticsPage
│   │   ├── MessagesPage
│   │   └── SettingsPage
│   ├── SearchPage
│   └── ProfilePage
└── Footer
    ├── Links
    └── Legal
```

### State Management

```typescript
// Component-level state (useState)
const [loading, setLoading] = useState(false);
const [data, setData] = useState<Data[]>([]);

// Server state (React Query - ready for integration)
const { data, isLoading, error } = useQuery({
  queryKey: ['jobs', filters],
  queryFn: () => fetchJobs(filters)
});

// Form state (React Hook Form - ready)
const { register, handleSubmit, formState } = useForm<FormData>();

// Global state (Context - auth)
const { user, loading } = useAuth();
```

---

## 🔄 Data Flow

### Job Search Flow

```
1. User enters search query
   ↓
2. Component updates local state
   ↓
3. Debounced API call to Firestore
   ↓
4. Query with filters applied
   ↓
5. Results cached and displayed
   ↓
6. User interactions (save, apply) trigger mutations
```

### Application Submission Flow

```
1. User fills application form
   ↓
2. Client-side validation
   ↓
3. File upload to Storage (resume)
   ↓
4. Application document created in Firestore
   ↓
5. Cloud Function triggers notification
   ↓
6. Email sent to company
   ↓
7. Real-time update in applicant dashboard
```

### Messaging Flow

```
1. User sends message
   ↓
2. Optimistic UI update
   ↓
3. Message added to Firestore
   ↓
4. Real-time listener notifies recipient
   ↓
5. Unread count updated
   ↓
6. Push notification sent (if enabled)
```

---

## 🚀 Performance Optimizations

### Code Splitting
```typescript
// Dynamic imports for heavy components
const AnalyticsDashboard = dynamic(() => import('./analytics'), {
  loading: () => <LoadingSkeleton />,
  ssr: false
});
```

### Image Optimization
```typescript
// Next.js Image component
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  width={48}
  height={48}
  alt="User"
  priority={false}
/>
```

### Caching Strategy
```typescript
// Firestore query caching
const jobsQuery = query(
  collection(db, 'jobs'),
  where('status', '==', 'active')
);

// Cache for 5 minutes
const { data } = useFirestoreQuery(jobsQuery, {
  cacheTime: 5 * 60 * 1000
});
```

---

## 📊 Monitoring & Analytics

### Performance Metrics
- **Time to First Byte (TTFB):** < 200ms
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

### Error Tracking
```typescript
// Firebase Crashlytics integration ready
import { crashlytics } from '@firebase/crashlytics';

try {
  // Operation
} catch (error) {
  crashlytics().recordError(error);
  logError(error);
}
```

### Usage Analytics
- Page views
- User interactions
- Feature adoption
- Conversion funnels
- Performance metrics

---

## 🔧 Development Tools

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "preserve"
  }
}
```

### ESLint Rules
- React best practices
- TypeScript strict
- Accessibility (a11y)
- Import order
- Unused variables

### Testing Strategy
- **Unit Tests:** Component logic
- **Integration Tests:** Feature flows
- **E2E Tests:** Critical paths
- **Visual Regression:** UI consistency

---

## 🌐 Internationalization

### i18n Structure
```
locales/
├── en/
│   ├── common.json
│   ├── dashboard.json
│   ├── auth.json
│   └── errors.json
└── [other-locales]/
```

### Translation Usage
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('Dashboard');
const title = t('welcome');
```

---

## 📱 Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px'
};
```

### Mobile-First Approach
```css
/* Base styles (mobile) */
.container { width: 100%; }

/* Tablet and up */
@media (min-width: 768px) {
  .container { width: 750px; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container { width: 1000px; }
}
```

---

## 🔄 CI/CD Pipeline (Ready)

```yaml
# GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install dependencies
      - Run tests
      - Build application
      - Deploy to Firebase
      - Run smoke tests
```

---

**Last Updated:** January 10, 2026
**Version:** 1.0.0
