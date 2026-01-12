# EduTech Correction & Implementation Plan
**Date:** January 12, 2026  
**Status:** APPROVED - Ready to Execute  
**Goal:** Align implementation with Allied iMpact EduTech vision

---

## Phase 1: Cleanup & Document Correction (30 mins)

### 1.1 Update Documentation
- [x] Update FULL_PROJECT_STATUS_REPORT.md with correct roles
- [ ] Update Phase 6 progress report with corrections
- [ ] Create CORRECTION_CHANGELOG.md to track all changes

### 1.2 Delete Incorrect Files
```
DELETE:
- apps/edutech/src/app/[locale]/instructor/ (entire folder)
- apps/edutech/src/services/instructorService.ts
- apps/edutech/src/components/instructor/ (entire folder)
- apps/edutech/PHASE_6_PROGRESS_REPORT.md (outdated)
- apps/edutech/COURSE_CREATION_COMPLETE.md (outdated)
```

### 1.3 Update Type Definitions
```typescript
// apps/edutech/src/types/index.ts
CHANGE:
  UserType = 'learner' | 'instructor' | 'admin'
TO:
  UserType = 'learner' | 'facilitator' | 'content_admin' | 'system_admin'

REMOVE:
  - InstructorProfile interface
  
ADD:
  - FacilitatorProfile interface
  - ContentAdminProfile interface
  - Class interface
  - Subscription interface
```

---

## Phase 2: Core Data Structure Updates (45 mins)

### 2.1 Update Course Model
```typescript
// Remove instructorId, instructorName
// Add createdBy: 'platform'
// Keep all other fields
```

### 2.2 Create New Collections
```typescript
// edutech_classes
interface Class {
  classId: string;
  name: string;
  schoolName: string;
  facilitatorIds: string[];
  learnerIds: string[];
  track: 'computer-skills' | 'coding';
  grade?: string;
  createdAt: Timestamp;
}

// edutech_subscriptions
interface Subscription {
  subscriptionId: string;
  userId: string;
  track: 'coding';
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  trialStartDate: Timestamp;
  trialEndDate: Timestamp;
  subscriptionType?: 'monthly' | 'annual';
  amount?: number; // 99 or 1000
  nextBillingDate?: Timestamp;
  createdAt: Timestamp;
}
```

### 2.3 Update User Model
```typescript
// Add to EduTechUser:
- assignedClassIds: string[] (for facilitators)
- trialStartDate?: Timestamp (for learners on coding)
- trialEndDate?: Timestamp
- subscriptionStatus?: 'trial' | 'active' | 'expired'
```

---

## Phase 3: Build Facilitator Features (2 hours)

### 3.1 Facilitator Service
**File:** `src/services/facilitatorService.ts`

```typescript
Functions:
- getFacilitatorProfile(userId)
- getAssignedClasses(facilitatorId)
- getClassLearners(classId)
- getLearnerProgress(learnerId, classId)
- markAttendance(classId, learnerId, date, present)
- submitPerformanceNote(learnerId, note)
```

### 3.2 Facilitator Dashboard
**File:** `src/app/[locale]/facilitator/dashboard/page.tsx`

**Features:**
- Welcome header with facilitator name
- Stats cards:
  - Total assigned classes
  - Total learners
  - Average completion rate
  - Active learners this week
- Assigned classes list
- Quick actions (view class, mark attendance)

### 3.3 Class Detail Page
**File:** `src/app/[locale]/facilitator/classes/[classId]/page.tsx`

**Features:**
- Class information (name, school, track)
- Learner list with:
  - Name and progress %
  - Last active date
  - Completed lessons count
  - View learner detail button
- Mark attendance section
- Performance notes

### 3.4 Update Header
- Remove "Instructor Dashboard" link
- Add "Facilitator Dashboard" link (role check)

---

## Phase 4: Build Content Admin Features (3 hours)

### 4.1 Content Admin Service
**File:** `src/services/contentAdminService.ts`

```typescript
Functions:
- createCourse(courseData)
- updateCourse(courseId, updates)
- deleteCourse(courseId)
- publishCourse(courseId)
- unpublishCourse(courseId)
- getAllCourses()
- assignCourseToTrack(courseId, track)
```

### 4.2 Content Admin Dashboard
**File:** `src/app/[locale]/content-admin/dashboard/page.tsx`

**Features:**
- Stats cards:
  - Total courses
  - Published courses
  - Total lessons
  - Total modules
- Course list (all courses)
- Quick actions (create course, manage content)
- Filter by track, status

### 4.3 Course Management
**Reuse existing components but change ownership:**
- Move `src/app/[locale]/instructor/courses/new` to `content-admin/courses/new`
- Move `CourseForm.tsx` to `content-admin` components
- Update service calls to contentAdminService
- Remove "instructor" references, change to "Created by Allied iMpact"

---

## Phase 5: Build Class Management (1.5 hours)

### 5.1 Class Service
**File:** `src/services/classService.ts`

```typescript
Functions:
- createClass(classData)
- updateClass(classId, updates)
- deleteClass(classId)
- addLearnerToClass(classId, learnerId)
- removeLearnerFromClass(classId, learnerId)
- assignFacilitator(classId, facilitatorId)
- removeFacilitator(classId, facilitatorId)
- getClass(classId)
- getAllClasses()
```

### 5.2 Admin Class Management Page
**File:** `src/app/[locale]/admin/classes/page.tsx`

**Features:**
- Create new class
- List all classes
- Edit class details
- Assign facilitators
- Add/remove learners
- Delete class

---

## Phase 6: Update Subscription & Pricing (2 hours)

### 6.1 Subscription Service
**File:** `src/services/subscriptionService.ts`

```typescript
Functions:
- startTrial(userId, track)
- checkTrialStatus(userId, track)
- activateSubscription(userId, type, amount)
- cancelSubscription(subscriptionId)
- checkAccess(userId, track)
```

### 6.2 Update Pricing Page
**File:** `src/app/[locale]/pricing/page.tsx`

**Changes:**
- Computer Skills: FREE (no changes)
- Coding: "30-day FREE trial, then R99/month or R1000/year"
- Remove Enterprise tier
- Add trial explanation
- Update CTA buttons

### 6.3 Trial Logic in Enrollment
```typescript
// When learner accesses Coding content:
1. Check if trial already used
2. If not, start 30-day trial
3. If trial expired, check subscription
4. If no subscription, block access, show pricing
```

### 6.4 Admin Subscription Management
**File:** `src/app/[locale]/admin/subscriptions/page.tsx`

**Features:**
- View all subscriptions
- Filter by status (trial, active, expired)
- Manual activate/cancel
- Revenue analytics (total, monthly)

---

## Phase 7: Update Existing Features (1 hour)

### 7.1 Update Course Service
- Remove instructor-related fields
- Update course creation to be platform-owned
- Update queries

### 7.2 Update Course Display
- Change "Instructor: John Doe" to "Created by Allied iMpact"
- Remove instructor profile links
- Update course cards

### 7.3 Update Header Navigation
```typescript
// Role-based links:
Learner: Dashboard, Courses, Forum
Facilitator: Dashboard, Courses, My Classes, Forum
Content Admin: Dashboard, Courses, Content Admin, Forum
System Admin: Dashboard, Courses, Admin, Forum
```

### 7.4 Simplify Forum
- Remove reputation leaderboards
- Keep badges simple
- Add moderator controls for admins

---

## Phase 8: Update Security Rules (30 mins)

### 8.1 Firestore Rules
```javascript
// Update role checks
function getUserRole(userId) {
  return get(/databases/$(database)/documents/edutech_users/$(userId)).data.userType;
}

// Courses - only content_admin and system_admin can write
match /edutech_courses/{courseId} {
  allow read: if true;
  allow write: if request.auth != null && 
    getUserRole(request.auth.uid) in ['content_admin', 'system_admin'];
}

// Classes - only system_admin can manage
match /edutech_classes/{classId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    getUserRole(request.auth.uid) == 'system_admin';
}

// Subscriptions - user can read own, admin can manage
match /edutech_subscriptions/{subscriptionId} {
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     getUserRole(request.auth.uid) == 'system_admin');
  allow write: if request.auth != null && 
    getUserRole(request.auth.uid) == 'system_admin';
}
```

---

## Phase 9: Testing & Validation (1 hour)

### 9.1 Test Each Role
- [ ] Learner can only access learner features
- [ ] Facilitator can view classes but not create courses
- [ ] Content Admin can create courses but not manage users
- [ ] System Admin has full access

### 9.2 Test Workflows
- [ ] Learner signup → choose track → enroll → learn
- [ ] Trial activation for coding track
- [ ] Facilitator viewing class progress
- [ ] Content Admin creating and publishing course
- [ ] Admin assigning facilitator to class

### 9.3 Test Security
- [ ] Cannot access unauthorized routes
- [ ] Cannot modify other users' data
- [ ] Firestore rules block unauthorized writes

---

## Execution Order

```
STEP 1: Documentation & Cleanup (NOW)
├─ Update FULL_PROJECT_STATUS_REPORT.md ✓
├─ Delete incorrect instructor files
├─ Update types/index.ts
└─ Create CORRECTION_CHANGELOG.md

STEP 2: Data Structure (NEXT)
├─ Update Course interface
├─ Add Class interface
├─ Add Subscription interface
└─ Update EduTechUser interface

STEP 3: Services (PARALLEL)
├─ facilitatorService.ts
├─ contentAdminService.ts
├─ classService.ts
└─ subscriptionService.ts

STEP 4: Dashboards (SEQUENTIAL)
├─ Facilitator Dashboard
├─ Content Admin Dashboard
└─ Update Admin Dashboard

STEP 5: Features (PARALLEL)
├─ Class Management
├─ Subscription System
└─ Update Pricing

STEP 6: Updates (SEQUENTIAL)
├─ Update Header
├─ Update Course Display
├─ Update Security Rules
└─ Testing

ESTIMATED TIME: 12-14 hours total
```

---

## Files to Create

```
NEW:
✓ src/types/index.ts (update)
✓ src/services/facilitatorService.ts
✓ src/services/contentAdminService.ts
✓ src/services/classService.ts
✓ src/services/subscriptionService.ts
✓ src/app/[locale]/facilitator/dashboard/page.tsx
✓ src/app/[locale]/facilitator/classes/page.tsx
✓ src/app/[locale]/facilitator/classes/[classId]/page.tsx
✓ src/app/[locale]/content-admin/dashboard/page.tsx
✓ src/app/[locale]/content-admin/courses/page.tsx
✓ src/app/[locale]/content-admin/courses/new/page.tsx
✓ src/app/[locale]/content-admin/courses/[courseId]/edit/page.tsx
✓ src/app/[locale]/admin/classes/page.tsx
✓ src/app/[locale]/admin/subscriptions/page.tsx
✓ src/components/facilitator/ (folder with components)
✓ src/components/content-admin/ (folder with components)
✓ firestore.rules (update)
```

---

## Files to Delete

```
DELETE:
✗ src/app/[locale]/instructor/ (entire folder)
✗ src/services/instructorService.ts
✗ src/components/instructor/ (entire folder)
✗ PHASE_6_PROGRESS_REPORT.md
✗ COURSE_CREATION_COMPLETE.md
```

---

## Files to Update

```
UPDATE:
↻ src/types/index.ts (roles, interfaces)
↻ src/services/courseService.ts (remove instructor fields)
↻ src/components/layout/Header.tsx (navigation)
↻ src/app/[locale]/pricing/page.tsx (R99/R1000)
↻ src/app/[locale]/courses/[courseId]/page.tsx (display)
↻ firestore.rules (permissions)
```

---

## Success Criteria

- [ ] No "instructor" references in codebase
- [ ] All 4 roles working correctly
- [ ] Facilitator can view classes only
- [ ] Content Admin can create courses
- [ ] System Admin can manage everything
- [ ] Trial system working (30 days)
- [ ] Pricing correct (R99/R1000)
- [ ] Security rules enforced
- [ ] All tests passing

---

**READY TO EXECUTE**  
**Starting with:** Documentation cleanup and file deletion
