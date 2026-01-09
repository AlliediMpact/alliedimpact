# Phase 1 Testing Session - January 6, 2026

**Server Status:** ✅ Running on http://localhost:3006  
**Testing Focus:** Navigation, Settings, Password Reset  
**Estimated Time:** 30-45 minutes

---

## 🎯 Quick Testing Workflow

### Test Session 1: Navigation & Layout (10 min)

#### 1. Login & Navigation
- [ ] Navigate to http://localhost:3006
- [ ] Login with existing credentials
- [ ] **Verify New Header:**
  - [ ] Logo visible in top-left
  - [ ] Search bar visible (desktop only)
  - [ ] Notification bell icon present
  - [ ] User avatar/dropdown in top-right
- [ ] **Verify New Sidebar:**
  - [ ] Sidebar fixed on left (desktop)
  - [ ] All 8 menu items visible: Dashboard, Projects, Milestones, Deliverables, Tickets, Team, Settings, Help
  - [ ] Current page highlighted
  - [ ] Icons display correctly

#### 2. Responsive Testing
- [ ] Resize browser to mobile width (< 768px)
- [ ] **Verify:**
  - [ ] Hamburger menu appears
  - [ ] Click hamburger → Sidebar opens as drawer
  - [ ] Click outside drawer → Closes
  - [ ] Navigation items work from drawer

#### 3. Navigation Flow
- [ ] Click each sidebar item:
  - [ ] Dashboard → Loads
  - [ ] Projects → Loads (if exists)
  - [ ] Milestones → Loads
  - [ ] Deliverables → Loads
  - [ ] Tickets → Loads
  - [ ] Settings → **NEW PAGE** (should work!)
- [ ] Click logo → Returns to dashboard

#### 4. User Dropdown
- [ ] Click user avatar/name in header
- [ ] **Verify dropdown shows:**
  - [ ] Profile option
  - [ ] Settings option
  - [ ] Logout option
- [ ] Click Settings → Navigate to settings page
- [ ] Go back, click Logout → Redirects to login

**Screenshot Checklist:**
- 📸 Desktop navigation with sidebar
- 📸 Mobile navigation with drawer open
- 📸 User dropdown menu

---

### Test Session 2: Settings Pages (15 min)

#### A. Profile Settings
- [ ] Navigate to Settings (sidebar or user dropdown)
- [ ] Should land on Profile tab by default
- [ ] **Verify Page Elements:**
  - [ ] 4 tabs visible: Profile, Security, Notifications, Preferences
  - [ ] Current tab highlighted (Profile)
  - [ ] Avatar section with upload button
  - [ ] Display name field (pre-filled)
  - [ ] Email field (read-only, verified badge)
  - [ ] Phone number field (optional)

**Test Profile Update:**
1. [ ] Click "Change Avatar" → Upload image (< 5MB)
   - [ ] Shows loading spinner during upload
   - [ ] Avatar updates after upload
   - [ ] Success message appears
2. [ ] Change display name to "Test User Updated"
3. [ ] Add phone number: "+1234567890"
4. [ ] Click "Save Changes"
   - [ ] Success message shows
   - [ ] Green checkmark icon appears
5. [ ] Refresh page → Changes persist

**Test Error Handling:**
- [ ] Try uploading file > 5MB → Error shown
- [ ] Try uploading non-image file → Error shown

#### B. Security Settings
- [ ] Click "Security" tab
- [ ] **Verify Page Elements:**
  - [ ] Current password field
  - [ ] New password field
  - [ ] Confirm password field
  - [ ] Password requirements list (4 items)

**Test Password Change:**
1. [ ] Enter wrong current password
2. [ ] Enter new password: "NewPass123"
3. [ ] Confirm password: "NewPass123"
4. [ ] Click "Change Password"
   - [ ] Error: "Current password is incorrect"
5. [ ] Enter correct current password
6. [ ] Enter weak password: "test" (< 8 chars)
   - [ ] Requirements show red X's
7. [ ] Enter strong password: "NewTest123!"
   - [ ] Requirements turn green with checkmarks
   - [ ] All 4 requirements met (8+ chars, uppercase, lowercase, number)
8. [ ] Match confirm password
9. [ ] Click "Change Password"
   - [ ] Success message appears
   - [ ] Form resets

**Verify New Password:**
- [ ] Logout
- [ ] Login with new password → Success
- [ ] Change password back to original (optional)

#### C. Notifications Settings
- [ ] Click "Notifications" tab
- [ ] **Verify Page Elements:**
  - [ ] Email Notifications section (5 checkboxes)
  - [ ] Frequency section (3 radio buttons)
  - [ ] In-App Notifications section (2 checkboxes)

**Test Notification Preferences:**
1. [ ] Toggle all email notification types:
   - [ ] Milestones
   - [ ] Deliverables
   - [ ] Tickets
   - [ ] Deadlines
   - [ ] Weekly Digest
2. [ ] Change frequency to "Daily Digest"
3. [ ] Enable in-app notifications
4. [ ] Enable notification sound
5. [ ] Click "Save Preferences"
   - [ ] Success message shows
6. [ ] Refresh page → Selections persist

#### D. Preferences Settings
- [ ] Click "Preferences" tab
- [ ] **Verify Page Elements:**
  - [ ] Theme selector (3 buttons: Light, Dark, System)
  - [ ] Timezone dropdown
  - [ ] Language dropdown
  - [ ] Date format dropdown with example
  - [ ] Time format dropdown with example

**Test Preferences:**
1. [ ] Select "Dark" theme
   - [ ] Button highlights
   - [ ] Save and verify preference persists
2. [ ] Select your timezone from dropdown
3. [ ] Change date format to "DD/MM/YYYY"
   - [ ] Example updates in real-time
4. [ ] Change time format to "24h"
   - [ ] Example updates in real-time
5. [ ] Select a language (note: translations not yet active)
6. [ ] Click "Save Preferences"
   - [ ] Success message appears
7. [ ] Refresh page → All selections persist

**Screenshot Checklist:**
- 📸 Profile settings with uploaded avatar
- 📸 Security settings with password requirements
- 📸 Notifications settings
- 📸 Preferences settings with examples

---

### Test Session 3: Password Reset Flow (10 min)

#### A. From Login Page
- [ ] Logout (if logged in)
- [ ] Navigate to http://localhost:3006/login
- [ ] **Verify:** "Forgot password?" link visible below password field
- [ ] Click "Forgot password?" link
- [ ] Redirects to /forgot-password page

#### B. Forgot Password Page
- [ ] **Verify Page Elements:**
  - [ ] "Forgot Password" heading
  - [ ] Email input field
  - [ ] "Send Reset Link" button
  - [ ] "Back to Login" link
  - [ ] Back arrow icon (also links to login)

**Test Email Submission:**
1. [ ] Enter invalid email: "notanemail"
   - [ ] Browser validation triggers
2. [ ] Enter non-existent email: "doesnotexist@test.com"
   - [ ] Click "Send Reset Link"
   - [ ] Error message: "No account found with this email address"
3. [ ] Enter your valid test email
4. [ ] Click "Send Reset Link"
   - [ ] Shows loading state "Sending..."
   - [ ] Success screen appears with:
     - [ ] Green checkmark icon
     - [ ] "Check your email" heading
     - [ ] Your email address displayed
     - [ ] Instructions about spam folder
     - [ ] "Send another email" button
     - [ ] "Back to Login" button

**Test Navigation:**
- [ ] Click "Send another email" → Form resets
- [ ] Click "Back to Login" → Returns to login page
- [ ] From forgot password page, click back arrow → Returns to login

**Verify Email (Optional):**
- [ ] Check your email inbox
- [ ] Firebase password reset email received
- [ ] Email contains reset link

**Screenshot Checklist:**
- 📸 Login page with "Forgot password?" link
- 📸 Forgot password form
- 📸 Success screen showing email

---

## 🧪 Advanced Testing (Optional - 10 min)

### Concurrent Window Test
1. [ ] Open two browser windows side-by-side
2. [ ] Login to both: http://localhost:3006
3. [ ] **Window 1:** Navigate to Settings → Profile
4. [ ] **Window 1:** Change display name
5. [ ] **Window 2:** Navigate to Settings → Profile
6. [ ] **Window 2:** Verify name updated (may need refresh)

### Browser DevTools Check
1. [ ] Open DevTools (F12) → Console tab
2. [ ] Navigate through all pages
3. [ ] **Verify:** No red errors in console
4. [ ] **Warnings OK:** Yellow warnings are acceptable

### Mobile Simulation
1. [ ] Open DevTools (F12)
2. [ ] Toggle device toolbar (Ctrl+Shift+M)
3. [ ] Select "iPhone 12 Pro" (390x844)
4. [ ] Test all flows:
   - [ ] Navigation drawer works
   - [ ] Settings tabs stack/scroll properly
   - [ ] Forms are usable
   - [ ] Buttons are touch-friendly
   - [ ] No horizontal scroll

---

## ✅ Test Results Summary

**Date:** January 6, 2026  
**Tester:** _______________  
**Session Duration:** _____ minutes

### Navigation & Layout
- Tests Passed: ____ / 4
- Issues Found: _____

### Settings Pages
- Tests Passed: ____ / 4 tabs
- Issues Found: _____

### Password Reset
- Tests Passed: ____ / 3
- Issues Found: _____

### Overall Status
- [ ] ✅ All tests passed - Ready for production
- [ ] ⚠️ Minor issues - Can proceed with notes
- [ ] ❌ Critical issues - Need fixes

---

## 🐛 Issues Found

**Format:** [Severity] Description - Steps to Reproduce

Example:
- [HIGH] Avatar upload fails for PNG files - Upload .png > 3MB → Shows error
- [LOW] Theme switching doesn't apply immediately - Select dark theme → Saves but doesn't apply

### Critical Issues (Block Production):
1. _____

### High Priority Issues:
1. _____

### Medium/Low Priority Issues:
1. _____

---

## 📋 Next Steps

### If All Tests Pass ✅
1. Mark Task 4 as completed
2. Commit all Phase 1 code
3. Update project documentation
4. **Decision Point:**
   - Option A: Continue to Phase 2 (Project Switcher, Search, Loading States)
   - Option B: Move to Platform work (Subscription system, Billing)

### If Issues Found ❌
1. Document each issue in TEST_RESULTS.md
2. Prioritize: Critical → High → Medium → Low
3. Fix critical and high priority issues
4. Re-test affected areas
5. Repeat until ready

---

## 📞 Support

**Documentation:**
- [PHASE_1_TESTING.md](PHASE_1_TESTING.md) - Detailed checklist
- [PHASE_1_COMPLETE.md](PHASE_1_COMPLETE.md) - Implementation summary
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - General testing guide

**Server:**
- URL: http://localhost:3006
- Port: 3006
- Framework: Next.js 14

**Need Help?**
- Check browser console for errors
- Verify Firebase credentials in .env.local
- Restart dev server if needed

---

**Ready to test!** 🚀 Start with Session 1 and work through sequentially.
