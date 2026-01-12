# EduTech Platform - Testing & Validation Checklist
**Date:** January 12, 2026  
**Phase:** 9 - Post-Correction Testing  
**Status:** Ready for Testing

---

## 🎯 Testing Objectives

Validate that the platform correctly implements the **program-first model** with:
- Centralized course creation (Content Admins only)
- Facilitator support (class monitoring, not course creation)
- Role-based access control
- 30-day trial system
- Class management

---

## ✅ Phase 1: Role-Based Access Control

### Learner Role Tests
- [ ] **Login as Learner**
  - [ ] Can access learner dashboard
  - [ ] Can browse courses
  - [ ] Can enroll in Computer Skills courses (FREE)
  - [ ] Can start 30-day trial for Coding track
  - [ ] Can participate in forum
  - [ ] **CANNOT** access facilitator dashboard
  - [ ] **CANNOT** access content admin dashboard
  - [ ] **CANNOT** access admin panel

### Facilitator Role Tests
- [ ] **Login as Facilitator**
  - [ ] Can access facilitator dashboard
  - [ ] Can view assigned classes
  - [ ] Can see learner progress in assigned classes
  - [ ] Can mark attendance
  - [ ] Can add performance notes
  - [ ] Can browse courses
  - [ ] **CANNOT** create courses
  - [ ] **CANNOT** access content admin dashboard
  - [ ] **CANNOT** access admin panel

### Content Admin Role Tests
- [ ] **Login as Content Admin**
  - [ ] Can access content admin dashboard
  - [ ] Can create new courses
  - [ ] Can edit existing courses
  - [ ] Can publish/unpublish courses
  - [ ] Can create modules
  - [ ] Can create lessons
  - [ ] All courses show "Created by Allied iMpact"
  - [ ] **CANNOT** manage classes
  - [ ] **CANNOT** manage users
  - [ ] **CANNOT** access system admin panel

### System Admin Role Tests
- [ ] **Login as System Admin**
  - [ ] Can access admin panel
  - [ ] Can manage users (view, edit, disable)
  - [ ] Can create classes
  - [ ] Can assign facilitators to classes
  - [ ] Can add learners to classes
  - [ ] Can manage subscriptions
  - [ ] Can view all analytics
  - [ ] Can access all dashboards (facilitator, content admin, learner)

---

## ✅ Phase 2: Course Management (Platform-Owned)

### Content Admin Course Creation
- [ ] **Create New Course**
  - [ ] Navigate to `/content-admin/courses/new`
  - [ ] Fill in course details (title, description, track, level)
  - [ ] Add modules and lessons
  - [ ] Save as draft
  - [ ] Course shows `createdBy: 'platform'`
  - [ ] Course appears in content admin dashboard
  - [ ] Course does NOT show instructor name

- [ ] **Publish Course**
  - [ ] Select a draft course
  - [ ] Click "Publish"
  - [ ] Course becomes visible to learners
  - [ ] Enrollment count starts at 0

- [ ] **Edit Course**
  - [ ] Select a published course
  - [ ] Edit title, description, or content
  - [ ] Changes are saved
  - [ ] Course remains published
  - [ ] Still shows "Created by Allied iMpact"

### Learner Course Experience
- [ ] **Browse Courses**
  - [ ] View course catalog
  - [ ] Courses show "Created by Allied iMpact" (not instructor names)
  - [ ] Can filter by track (Computer Skills, Coding)
  - [ ] Can filter by level (Beginner, Intermediate, Advanced)

- [ ] **Enroll in Course**
  - [ ] Click "Enroll" on Computer Skills course (FREE)
  - [ ] Enrollment succeeds immediately
  - [ ] Click "Enroll" on Coding course
  - [ ] If no trial, prompt to start 30-day trial
  - [ ] If trial active, enrollment succeeds
  - [ ] If trial expired, prompt to subscribe

---

## ✅ Phase 3: Trial & Subscription System

### 30-Day Trial Activation
- [ ] **Start Trial**
  - [ ] Login as new learner
  - [ ] Navigate to Coding course or pricing page
  - [ ] Click "Start 30-Day FREE Trial"
  - [ ] Trial starts without payment info
  - [ ] `subscriptionStatus` set to "trial"
  - [ ] `trialStartDate` and `trialEndDate` recorded
  - [ ] Can access all Coding courses

### Trial Expiration
- [ ] **Trial Expires**
  - [ ] Manually set trial end date to past (admin function)
  - [ ] Learner tries to access Coding content
  - [ ] Access is BLOCKED
  - [ ] Message: "Trial expired. Subscribe to continue!"
  - [ ] Redirect to pricing page

### Subscription Activation
- [ ] **Monthly Subscription (R99)**
  - [ ] Click "Subscribe - R99/month"
  - [ ] Payment form appears
  - [ ] After payment, `subscriptionStatus` set to "active"
  - [ ] `subscriptionType` set to "monthly"
  - [ ] `nextBillingDate` set to 1 month from now
  - [ ] Can access all Coding courses

- [ ] **Annual Subscription (R1000)**
  - [ ] Click "Subscribe - R1,000/year"
  - [ ] Payment form appears
  - [ ] After payment, `subscriptionStatus` set to "active"
  - [ ] `subscriptionType` set to "annual"
  - [ ] `nextBillingDate` set to 1 year from now
  - [ ] Can access all Coding courses

### Pricing Page Display
- [ ] **Pricing Page**
  - [ ] Computer Skills shows "FREE"
  - [ ] Coding shows "R99/month OR R1,000/year"
  - [ ] Trial callout: "30-Day FREE Trial"
  - [ ] No credit card required for trial
  - [ ] NO Enterprise tier displayed
  - [ ] Savings badge: "Save R188!" for annual

---

## ✅ Phase 4: Class Management

### System Admin Class Creation
- [ ] **Create Class**
  - [ ] Navigate to `/admin/classes`
  - [ ] Click "Create Class"
  - [ ] Enter class name, school name, track, grade
  - [ ] Save class
  - [ ] Class appears in list

### Assign Facilitators
- [ ] **Assign Facilitator to Class**
  - [ ] Open class details
  - [ ] Click "Assign Facilitator"
  - [ ] Select facilitator from list
  - [ ] Save assignment
  - [ ] Facilitator's `assignedClassIds` updated
  - [ ] Class appears in facilitator dashboard

### Assign Learners
- [ ] **Add Learners to Class**
  - [ ] Open class details
  - [ ] Click "Add Learners"
  - [ ] Select multiple learners
  - [ ] Save assignments
  - [ ] Learners appear in class roster
  - [ ] Class shows in facilitator view

---

## ✅ Phase 5: Facilitator Workflows

### View Assigned Classes
- [ ] **Facilitator Dashboard**
  - [ ] Login as facilitator
  - [ ] Dashboard shows all assigned classes
  - [ ] Stats cards show: Total Classes, Total Learners, Active This Week, Attendance Rate
  - [ ] Can click on class card to view details

### Monitor Learner Progress
- [ ] **Class Detail Page**
  - [ ] Navigate to specific class
  - [ ] See list of all learners in class
  - [ ] View each learner's progress %
  - [ ] View completed lessons count
  - [ ] View last active date
  - [ ] Click "View Learner Detail" to see full progress

### Mark Attendance
- [ ] **Attendance Marking**
  - [ ] Open class detail page
  - [ ] Navigate to "Attendance" section
  - [ ] Select date
  - [ ] Mark learners as present/absent
  - [ ] Add optional notes
  - [ ] Save attendance record
  - [ ] Record appears in attendance history

### Add Performance Notes
- [ ] **Performance Notes**
  - [ ] Open learner detail page
  - [ ] Click "Add Performance Note"
  - [ ] Enter note text
  - [ ] Select category (Positive, Concern, General)
  - [ ] Save note
  - [ ] Note appears in learner's record

---

## ✅ Phase 6: Header Navigation

### Role-Based Menu Links
- [ ] **Learner Header**
  - [ ] Shows: Home, Courses, Forum, About, Pricing
  - [ ] User menu shows: Dashboard, Logout
  - [ ] **DOES NOT** show: Facilitator, Content Admin, Admin links

- [ ] **Facilitator Header**
  - [ ] Shows: Home, Courses, Forum, About, Pricing
  - [ ] User menu shows: Dashboard, **Facilitator Dashboard**, Logout
  - [ ] **DOES NOT** show: Content Admin, Admin links

- [ ] **Content Admin Header**
  - [ ] Shows: Home, Courses, Forum, About, Pricing
  - [ ] User menu shows: Dashboard, **Content Admin**, Logout
  - [ ] **DOES NOT** show: Facilitator Dashboard, Admin Panel

- [ ] **System Admin Header**
  - [ ] Shows: Home, Courses, Forum, About, Pricing
  - [ ] User menu shows: Dashboard, Facilitator Dashboard, Content Admin, **Admin Panel**, Logout
  - [ ] Has access to all dashboards

---

## ✅ Phase 7: Firestore Security Rules

### Course Access
- [ ] **Authenticated users can READ courses**
- [ ] **Content Admins can CREATE courses**
- [ ] **Content Admins can UPDATE courses**
- [ ] **System Admins can DELETE courses**
- [ ] **Facilitators CANNOT create courses** (test should fail)
- [ ] **Learners CANNOT create courses** (test should fail)

### Class Access
- [ ] **Authenticated users can READ classes**
- [ ] **System Admins can CREATE classes**
- [ ] **System Admins can UPDATE classes**
- [ ] **System Admins can DELETE classes**
- [ ] **Facilitators CANNOT create classes** (test should fail)
- [ ] **Content Admins CANNOT create classes** (test should fail)

### Attendance Access
- [ ] **Authenticated users can READ attendance**
- [ ] **Facilitators can CREATE attendance records**
- [ ] **Facilitators can UPDATE attendance records**
- [ ] **System Admins can DELETE attendance records**
- [ ] **Learners CANNOT create attendance** (test should fail)

### Subscription Access
- [ ] **Users can READ their own subscriptions**
- [ ] **System Admins can READ all subscriptions**
- [ ] **System Admins can CREATE subscriptions**
- [ ] **System Admins can UPDATE subscriptions**
- [ ] **Learners CANNOT read others' subscriptions** (test should fail)
- [ ] **Facilitators CANNOT create subscriptions** (test should fail)

---

## ✅ Phase 8: UI/UX Verification

### No Instructor References
- [ ] **Course Cards**
  - [ ] Show "Created by Allied iMpact"
  - [ ] **DO NOT** show "Instructor: [Name]"
  - [ ] No instructor profile links

- [ ] **Course Detail Pages**
  - [ ] Show platform ownership
  - [ ] No instructor bio section
  - [ ] No instructor stats

- [ ] **Dashboards**
  - [ ] No revenue tracking
  - [ ] No course monetization
  - [ ] No earnings analytics

### Correct Terminology
- [ ] **Facilitator** (not Instructor)
- [ ] **Content Admin** (not Course Creator)
- [ ] **System Admin** (not Admin)
- [ ] **30-day FREE trial** (not 7-day)
- [ ] **R99/month or R1,000/year** (not R199)

---

## ✅ Phase 9: End-to-End Workflows

### Complete Learner Journey
1. [ ] Sign up as new user
2. [ ] Select learning track (Computer Skills or Coding)
3. [ ] Browse courses
4. [ ] Enroll in Computer Skills course (FREE, immediate access)
5. [ ] Start learning (complete lessons, watch videos)
6. [ ] Complete course and earn certificate
7. [ ] Try to enroll in Coding course
8. [ ] Start 30-day trial
9. [ ] Access Coding content
10. [ ] Trial expires
11. [ ] Subscribe (R99 or R1,000)
12. [ ] Continue learning
13. [ ] Participate in forum

### Complete Facilitator Journey
1. [ ] Login as facilitator
2. [ ] View assigned classes
3. [ ] Open class detail
4. [ ] Review learner progress
5. [ ] Mark attendance for today
6. [ ] Add performance note for struggling learner
7. [ ] Browse courses to understand content
8. [ ] Verify cannot create courses

### Complete Content Admin Journey
1. [ ] Login as content admin
2. [ ] View content admin dashboard
3. [ ] Click "Create Course"
4. [ ] Enter course details (Coding track, Intermediate)
5. [ ] Add Module 1 with 3 lessons
6. [ ] Add Module 2 with 2 lessons
7. [ ] Save as draft
8. [ ] Preview course
9. [ ] Publish course
10. [ ] Verify course appears in catalog
11. [ ] Verify shows "Created by Allied iMpact"

### Complete System Admin Journey
1. [ ] Login as system admin
2. [ ] View admin panel
3. [ ] Create new class ("Grade 10 Coding")
4. [ ] Assign facilitator to class
5. [ ] Add 20 learners to class
6. [ ] View subscription analytics
7. [ ] Manually activate subscription for learner
8. [ ] View all courses (can edit any)
9. [ ] View all classes
10. [ ] Generate platform-wide reports

---

## 🐛 Known Issues & Future Work

### Minor Issues
- [ ] Forum reputation system needs simplification (Phase 10)
- [ ] Class detail page UI needs completion
- [ ] Course creation form needs repurposing (move from instructor to content-admin folder)
- [ ] Mobile responsiveness for new dashboards

### Future Features
- [ ] Batch learner import (CSV upload)
- [ ] Automated trial expiration notifications
- [ ] Facilitator performance reports
- [ ] Content Admin analytics dashboard
- [ ] Class scheduling system
- [ ] Payment gateway integration
- [ ] SMS notifications for attendance

---

## ✅ Testing Sign-Off

### Roles Tested By
- [ ] **Learner Role:** _____________________________ Date: __________
- [ ] **Facilitator Role:** _________________________ Date: __________
- [ ] **Content Admin Role:** ______________________ Date: __________
- [ ] **System Admin Role:** _______________________ Date: __________

### Security Tests
- [ ] **Firestore Rules:** __________________________ Date: __________
- [ ] **Role-Based Access:** _______________________ Date: __________
- [ ] **Unauthorized Access:** _____________________ Date: __________

### Functional Tests
- [ ] **Course Management:** _______________________ Date: __________
- [ ] **Class Management:** ________________________ Date: __________
- [ ] **Trial System:** ____________________________ Date: __________
- [ ] **Subscription System:** _____________________ Date: __________

---

**Testing Status:** Ready for manual testing  
**Next Step:** Deploy to staging environment and execute test cases  
**Blocker Issues:** None - All compilation errors resolved

