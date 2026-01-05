# My Projects - Manual Testing Checklist

## Test Environment Setup
- [ ] Firebase project configured with Firestore and Storage
- [ ] My Projects app running on localhost:3006
- [ ] Test user account created

## Week 1: Solution Discovery Flow

### Test 1: Discovery Questionnaire
- [ ] Navigate to platform dashboard (localhost:3000)
- [ ] Click "Start a Project" button
- [ ] Fill out discovery form:
  - [ ] Select project type (web-app, mobile-app, etc.)
  - [ ] Choose budget range
  - [ ] Select timeline
  - [ ] Enter project description
  - [ ] Fill contact information
- [ ] Click "Continue to Sign Up"
- [ ] Verify redirect to My Projects signup with pre-filled data

### Test 2: Signup with Auto-Project Creation
- [ ] Complete signup form on My Projects
- [ ] Verify user creation in Firebase Auth
- [ ] Verify user profile created in Firestore users collection
- [ ] Verify project auto-created with discovery data
- [ ] Check project status is "discovery"
- [ ] Verify redirect to My Projects dashboard

## Week 2: Backend Integration

### Test 3: Real-time Firestore Listeners
- [ ] Login to My Projects app
- [ ] Open dashboard in two browser windows
- [ ] In Firestore console, update project progress
- [ ] Verify both windows update in real-time
- [ ] Add milestone in Firestore console
- [ ] Verify milestone appears without page refresh
- [ ] Check all date fields convert properly from Timestamp to Date

### Test 4: Dashboard Data Display
- [ ] Verify stats cards show correct counts:
  - [ ] Active projects
  - [ ] Completed projects
  - [ ] Open tickets
  - [ ] Average progress
- [ ] Check project overview displays:
  - [ ] Project name, description, status
  - [ ] Health indicator (on-track/at-risk/delayed)
  - [ ] Progress bar with percentage
  - [ ] Timeline dates
  - [ ] Budget information
  - [ ] Technology badges (if any)

## Week 3: Management UIs

### Test 5: Milestone Management
**Create Milestone:**
- [ ] Click "Add Milestone" button
- [ ] Fill form:
  - [ ] Name: "Design Phase"
  - [ ] Description: "Complete UI/UX designs"
  - [ ] Due date: (2 weeks from now)
  - [ ] Status: Pending
  - [ ] Progress: 0%
- [ ] Click "Add Milestone"
- [ ] Verify milestone appears in dashboard immediately
- [ ] Check Firestore collection has new milestone document

**Edit Milestone:**
- [ ] Click on milestone card
- [ ] Update progress to 50%
- [ ] Change status to "In Progress"
- [ ] Click "Update Milestone"
- [ ] Verify changes appear immediately
- [ ] Check progress bar updates

**Complete Milestone:**
- [ ] Click milestone card
- [ ] Set progress to 100%
- [ ] Change status to "Completed"
- [ ] Verify green badge and checkmark icon
- [ ] Verify completedDate set in Firestore

**Overdue Detection:**
- [ ] Create milestone with due date in past
- [ ] Verify orange border appears
- [ ] Check "(Overdue)" text displays
- [ ] Verify status changes to "overdue" automatically (if implemented)

### Test 6: Deliverable Management
**Create Deliverable:**
- [ ] Click "Add Deliverable" button
- [ ] Fill form:
  - [ ] Name: "Homepage Mockup"
  - [ ] Description: "Figma design for homepage"
  - [ ] Type: Design
  - [ ] Due date: (1 week from now)
  - [ ] Notes: "Include mobile and desktop versions"
- [ ] Click "Add Deliverable"
- [ ] Verify deliverable appears immediately
- [ ] Check status is "Pending"

**Upload Files (Initial):**
- [ ] Click "Add Deliverable"
- [ ] Fill basic info
- [ ] Click file upload area
- [ ] Select 2-3 files
- [ ] Verify files listed with sizes
- [ ] Click remove button on one file
- [ ] Verify file removed from list
- [ ] Click "Add Deliverable"
- [ ] Wait for upload completion
- [ ] Verify deliverable created with file URLs
- [ ] Click download links
- [ ] Verify files download correctly

**Mark as Delivered (Team Member View):**
- [ ] Create deliverable with status "In Progress"
- [ ] Click "Mark as Delivered" button
- [ ] Upload files in modal
- [ ] Click "Upload X Files"
- [ ] Verify status changes to "Delivered"
- [ ] Verify deliveredDate set
- [ ] Verify uploaded files appear with download links

**Approve Deliverable (Client View):**
- [ ] Deliverable with status "Delivered"
- [ ] Review attached files
- [ ] Click "Approve" button
- [ ] Verify status changes to "Approved"
- [ ] Verify green badge appears
- [ ] Check approvedDate set in Firestore

**Request Revision (Client View):**
- [ ] Deliverable with status "Delivered"
- [ ] Click "Request Revision" button
- [ ] Verify status changes to "Revision Requested"
- [ ] Verify orange badge appears

**Upload Revision (Team Member View):**
- [ ] Deliverable with status "Revision Requested"
- [ ] Click "Upload Revision" button
- [ ] Upload revised files
- [ ] Verify status changes to "Delivered"
- [ ] Verify new files added to fileUrls array

### Test 7: Ticket System
**Create Ticket:**
- [ ] Click "Create Ticket" button
- [ ] Fill form:
  - [ ] Subject: "Login button not working"
  - [ ] Description: "When I click login, nothing happens"
  - [ ] Priority: High
  - [ ] Type: Bug
- [ ] Click "Create Ticket"
- [ ] Verify ticket appears in list
- [ ] Check priority badge (orange for High)
- [ ] Check status is "Open"

**View Ticket Details:**
- [ ] Click on ticket card
- [ ] Verify detail modal opens
- [ ] Check all metadata displays:
  - [ ] Reported by
  - [ ] Created date
  - [ ] Priority and status badges
  - [ ] Ticket ID (#XXXXXX)
- [ ] Verify description shows correctly

**Add Comment:**
- [ ] In ticket detail modal
- [ ] Type comment: "I've identified the issue, working on fix"
- [ ] Click send button
- [ ] Verify comment appears immediately
- [ ] Check comment shows username and timestamp
- [ ] Open in another window, verify real-time update

**Update Ticket Status:**
- [ ] Open ticket with status "Open"
- [ ] Click "Start Work" button
- [ ] Verify status changes to "In Progress"
- [ ] Click "Mark as Resolved" button
- [ ] Verify status changes to "Resolved"
- [ ] Check resolvedAt timestamp set
- [ ] Click "Close Ticket" button
- [ ] Verify status changes to "Closed"
- [ ] Check action buttons no longer appear

**Test Different Priorities:**
- [ ] Create ticket with Low priority
- [ ] Verify gray badge
- [ ] Create ticket with Medium priority
- [ ] Verify yellow/blue badge
- [ ] Create ticket with Urgent priority
- [ ] Verify red badge

**Test Different Types:**
- [ ] Create "Question" type ticket
- [ ] Create "Feature" type ticket
- [ ] Create "Support" type ticket
- [ ] Create "Feedback" type ticket
- [ ] Verify type displays in card

## Integration Tests

### Test 8: Cross-Component Updates
- [ ] Create milestone
- [ ] Add deliverable linked to that milestone
- [ ] Complete deliverable
- [ ] Verify milestone progress updates
- [ ] Complete all deliverables
- [ ] Check milestone auto-completes (if implemented)

### Test 9: File Storage Organization
- [ ] Upload files to deliverable
- [ ] Check Firebase Storage console
- [ ] Verify path: projects/{projectId}/deliverables/{deliverableId}/
- [ ] Verify timestamp prefix on filenames
- [ ] Verify sanitized filenames (no special chars)
- [ ] Test download of each file
- [ ] Verify file URLs in Firestore document

### Test 10: Empty States
- [ ] New project with no milestones
- [ ] Verify empty state message displays
- [ ] Verify helpful text ("Add your first milestone...")
- [ ] Verify icon displays (Calendar icon)
- [ ] Check all three sections (milestones, deliverables, tickets)

### Test 11: Real-time Synchronization
- [ ] Open dashboard in two browsers
- [ ] Window 1: Create milestone
- [ ] Window 2: Verify appears immediately
- [ ] Window 2: Update milestone progress
- [ ] Window 1: Verify progress bar updates
- [ ] Window 1: Add ticket comment
- [ ] Window 2: Verify comment appears in thread
- [ ] Test with 3+ simultaneous users

### Test 12: Error Handling
- [ ] Submit form with missing required fields
- [ ] Verify validation messages
- [ ] Try uploading very large file (>10MB)
- [ ] Check error handling
- [ ] Disconnect internet
- [ ] Try to create milestone
- [ ] Verify error message displays
- [ ] Reconnect and retry
- [ ] Verify successful creation

## Performance Tests

### Test 13: Loading Performance
- [ ] Clear browser cache
- [ ] Navigate to My Projects dashboard
- [ ] Measure time to first render
- [ ] Check for console errors
- [ ] Verify all images/icons load

### Test 14: Large Dataset Performance
- [ ] Create project with 20+ milestones
- [ ] Add 30+ deliverables
- [ ] Create 40+ tickets
- [ ] Check dashboard performance
- [ ] Verify scroll smoothness
- [ ] Test search/filter (if implemented)

## Security Tests

### Test 15: Authentication Guards
- [ ] Try accessing /myprojects without login
- [ ] Verify redirect to /login
- [ ] Login with valid credentials
- [ ] Verify access granted
- [ ] Logout
- [ ] Try accessing protected routes
- [ ] Verify redirect to login

### Test 16: Authorization Tests
- [ ] Create ticket as User A
- [ ] Login as User B
- [ ] Verify cannot see User A's tickets
- [ ] Try to access User A's project by ID manipulation
- [ ] Verify access denied

## Browser Compatibility

### Test 17: Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Verify all features work
- [ ] Check layout consistency

### Test 18: Mobile Responsiveness
- [ ] Open on mobile device
- [ ] Check grid layout (should stack on mobile)
- [ ] Test modals on small screens
- [ ] Verify touch interactions work
- [ ] Check file upload on mobile
- [ ] Test navigation

## Bug Reports Template

**Issue Title:** [Short description]
**Priority:** [Low/Medium/High/Critical]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Environment:**
- Browser: 
- OS: 
- Screen size: 

---

## Test Results Summary

**Date:** _________
**Tester:** _________

**Tests Passed:** _____ / _____
**Tests Failed:** _____ / _____
**Blockers Found:** _____
**Minor Issues:** _____

**Overall Status:** [ ] Pass [ ] Fail [ ] Needs Fixes

**Notes:**
