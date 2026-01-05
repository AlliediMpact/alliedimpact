# My Projects - Manual Testing Guide

## 🎯 Quick Start Testing (30 minutes)

This guide walks you through the essential tests to verify My Projects MVP is production-ready.

---

## Prerequisites

### 1. Environment Setup (5 min)

**Create `.env.local` file in `apps/myprojects/`:**

```bash
# Copy from .env.example
cp apps/myprojects/.env.example apps/myprojects/.env.local
```

**Fill in your Firebase credentials:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_APP_URL=http://localhost:3006
NODE_ENV=development
```

### 2. Start Development Server

```bash
cd apps/myprojects
pnpm install
pnpm run dev
```

**Expected:** Server starts on http://localhost:3006

### 3. Open Application

Navigate to: **http://localhost:3006**

---

## Critical Path Tests (Follow in Order)

### ✅ Test 1: Authentication (5 min)

**Signup Flow:**
1. Click "Sign Up" or navigate to signup
2. Fill form:
   - Email: `test@example.com`
   - Password: `Test123456`
   - Display Name: `Test User`
3. Submit form
4. **Verify:**
   - ✓ User created in Firebase Auth console
   - ✓ User document in Firestore `users` collection
   - ✓ Redirected to dashboard
   - ✓ No console errors

**Login Flow:**
1. Log out
2. Log back in with same credentials
3. **Verify:**
   - ✓ Successfully authenticated
   - ✓ Dashboard loads

**Screenshot:**  
📸 Take screenshot of dashboard after login

---

### ✅ Test 2: Project Creation (3 min)

1. On dashboard, locate "Create Project" button/form
2. Fill project details:
   - Name: `Test Website Project`
   - Description: `Building a new company website`
   - Status: `Active`
   - Budget: `$10,000`
3. Submit
4. **Verify:**
   - ✓ Project appears on dashboard immediately
   - ✓ Project document in Firestore `projects` collection
   - ✓ Stats update (project count)

**Screenshot:**  
📸 Take screenshot of dashboard with project

---

### ✅ Test 3: Milestone Management (5 min)

**Create Milestone:**
1. Click "Add Milestone" button
2. Fill form:
   - Title: `Design Phase`
   - Description: `Complete all UI/UX designs`
   - Start Date: Today
   - End Date: 2 weeks from today
   - Status: `Pending`
   - Progress: `0%`
3. Submit
4. **Verify:**
   - ✓ Milestone appears in project view
   - ✓ Milestone document in Firestore
   - ✓ Shows pending badge

**Update Milestone:**
1. Click on milestone card
2. Change progress to `50%`
3. Change status to `In Progress`
4. Submit
5. **Verify:**
   - ✓ Progress bar updates immediately
   - ✓ Status badge changes to "In Progress"
   - ✓ No page refresh needed

**Screenshot:**  
📸 Take screenshot of milestone with 50% progress

---

### ✅ Test 4: Deliverable with File Upload (7 min)

**Create Deliverable:**
1. Click "Add Deliverable" button
2. Fill form:
   - Title: `Homepage Mockup`
   - Description: `Figma design for homepage`
   - Type: `Design`
   - Due Date: 1 week from today
3. **Upload Files:**
   - Click file upload area
   - Select 2-3 test files (images, PDFs)
   - Verify files listed with sizes
4. Submit and wait for upload
5. **Verify:**
   - ✓ Deliverable appears in list
   - ✓ Files uploaded to Firebase Storage
   - ✓ Download links work

**Check Firebase Storage:**
1. Open Firebase Console → Storage
2. Navigate to: `projects/{projectId}/deliverables/{deliverableId}/`
3. **Verify:**
   - ✓ Files present
   - ✓ Correct path structure
   - ✓ Timestamp prefix on filenames

**Update Deliverable Status:**
1. Click "Mark as Delivered"
2. Upload additional file
3. **Verify:**
   - ✓ Status changes to "Delivered"
   - ✓ New file uploaded

**Screenshot:**  
📸 Take screenshot of deliverable with files

---

### ✅ Test 5: Ticket System (5 min)

**Create Ticket:**
1. Click "Create Ticket" button
2. Fill form:
   - Subject: `Login button not working`
   - Description: `Button doesn't respond to clicks`
   - Priority: `High`
   - Type: `Bug`
3. Submit
4. **Verify:**
   - ✓ Ticket appears in list
   - ✓ Priority badge shows (orange for High)
   - ✓ Status is "Open"

**Add Comment:**
1. Click ticket to open details
2. Type comment: `Investigating the issue`
3. Submit
4. **Verify:**
   - ✓ Comment appears immediately
   - ✓ Shows username and timestamp
   - ✓ Comment document in Firestore

**Update Ticket Status:**
1. Click "Start Work" → Status = "In Progress"
2. Add comment: `Fixed the bug`
3. Click "Mark as Resolved" → Status = "Resolved"
4. **Verify:**
   - ✓ Status updates immediately
   - ✓ Action buttons change based on status

**Screenshot:**  
📸 Take screenshot of ticket with comments

---

### ✅ Test 6: Real-Time Updates (5 min)

**Multi-Window Test:**
1. Open two browser windows side-by-side
2. Both at: http://localhost:3006
3. **Window 1:** Create new milestone
4. **Window 2:** Verify appears without refresh
5. **Window 2:** Update milestone progress
6. **Window 1:** Verify progress bar updates
7. **Window 1:** Add ticket comment
8. **Window 2:** Verify comment appears

**Verify:**
- ✓ Changes sync in <1 second
- ✓ No manual refresh needed
- ✓ WebSocket connection stable

**Screenshot:**  
📸 Take screenshot of both windows showing sync

---

## Security Tests (5 min)

### ✅ Test 7: Authorization & Security Rules

**Authentication Check:**
1. Log out
2. Try accessing: http://localhost:3006/dashboard
3. **Verify:**
   - ✓ Redirected to login page
   - ✓ Cannot access without auth

**File Upload Limits:**
1. Try uploading 11MB file
2. **Verify:**
   - ✓ Blocked (10MB limit in storage rules)
   - ✓ Error message shown

**File Type Validation:**
1. Try uploading .exe or .bat file
2. **Verify:**
   - ✓ Blocked (not allowed type)
   - ✓ Error message shown

**Cross-User Access (if multiple test users):**
1. Create project as User A
2. Log in as User B
3. Try accessing User A's project
4. **Verify:**
   - ✓ Firestore rules block access
   - ✓ Error shown or no data

---

## Error Handling Tests (3 min)

### ✅ Test 8: Form Validation

1. Try submitting empty forms
2. **Verify:**
   - ✓ Validation messages appear
   - ✓ Form doesn't submit
   - ✓ Required fields highlighted

### ✅ Test 9: Network Errors

1. Open DevTools (F12) → Network tab
2. Change to "Offline"
3. Try creating milestone
4. **Verify:**
   - ✓ Error message displays
   - ✓ User-friendly explanation
5. Go back online
6. Retry operation
7. **Verify:**
   - ✓ Works successfully
   - ✓ No data loss

### ✅ Test 10: Error Boundary

1. Check browser console for errors
2. **Verify:**
   - ✓ No unhandled errors
   - ✓ Error boundary catches issues
   - ✓ Graceful recovery options

---

## Mobile Responsiveness (2 min)

### ✅ Test 11: Mobile View

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" (390x844)
4. **Test:**
   - ✓ Navigation accessible
   - ✓ Forms usable
   - ✓ Cards stack properly
   - ✓ No horizontal scroll
   - ✓ Buttons easy to tap

**Screenshots:**  
📸 Take screenshots on mobile viewport

---

## Final Checklist

After completing all tests, verify:

**Core Functionality:**
- [x] User signup/login works
- [x] Projects CRUD operations work
- [x] Milestones CRUD with progress tracking
- [x] Deliverables with file upload/download
- [x] Tickets with comments and status workflow
- [x] Real-time updates across browsers

**Production Readiness:**
- [ ] No critical bugs found
- [ ] Security rules block unauthorized access
- [ ] File uploads work correctly
- [ ] Real-time sync functioning
- [ ] Error handling adequate
- [ ] Mobile responsive

**Performance:**
- [ ] Page load < 3 seconds
- [ ] No console errors
- [ ] File uploads complete successfully
- [ ] UI responsive (no lag)

---

## Test Results Summary

**Date Tested:** _______________  
**Tester:** _______________

**Tests Passed:** ____ / 11  
**Critical Issues:** ____ (list below if any)  
**Minor Issues:** ____ (can defer)

**Production Ready?** [ ] YES [ ] NO [ ] WITH CAVEATS

---

## Report Issues

If you find issues during testing, document them in [TEST_RESULTS.md](TEST_RESULTS.md) with:

1. **Issue description**
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Severity:** Critical / High / Medium / Low
5. **Screenshots** (if applicable)

---

## Next Steps After Testing

✅ **If all tests pass:**
1. Mark Task 7 as complete
2. Review TEST_RESULTS.md
3. Proceed to production deployment
4. Move to Platform work (Tasks 8-10)

❌ **If critical issues found:**
1. Document in TEST_RESULTS.md
2. Fix critical bugs
3. Re-test affected areas
4. Repeat until all critical tests pass

---

## Support

**Questions?** Check:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production setup
- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) - Detailed test cases
- [MVP_FINALIZATION_SUMMARY.md](MVP_FINALIZATION_SUMMARY.md) - Project status

**Ready to test!** 🚀

