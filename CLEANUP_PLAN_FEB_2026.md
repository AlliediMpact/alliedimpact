# 🧹 Project Cleanup Plan - February 17, 2026

**Status**: ⚠️ **AWAITING APPROVAL** - No changes made yet  
**Target**: Clean, organized project ready for Feb 25, 2026 launch  
**Risk Level**: 🟢 LOW (All changes are reversible, no business logic affected)

---

## 📋 EXECUTIVE SUMMARY

Your project has evolved significantly since inception. This cleanup removes **2 obsolete apps** and consolidates **13 scattered documentation files** into **5 comprehensive, easy-to-read documents**.

### What Will Be REMOVED:
- ✅ 2 obsolete apps (replaced by Portal)
- ✅ 1 outdated CI/CD workflow
- ✅ 11 documentation files (archived, not deleted)
- ✅ 1 empty document file

### What Will Be CREATED:
- ✅ 5 comprehensive platform documentation files
- ✅ Updated root README with current status

### What Will Be PRESERVED:  - ✅ All 8 production apps (CoinBox, CareerBox, DriveMaster, EduTech, SportsHub, ControlHub, MyProjects, Portal)
- ✅ All business logic and workflows
- ✅ All recent documentation (PWA implementation, etc.)
- ✅ All platform packages and services
- ✅ Legal and security documentation

---

## 🗑️ PART 1: REMOVE OBSOLETE APPS

### Apps to Delete

#### 1. **apps/alliedimpact-dashboard** (Port 3009)
**Reason**: Replaced by `web/portal` in January 2026

**Evidence**:
- ❌ NOT listed in 8 production apps for Feb 25 launch
- ❌ Last modified: Early January (before Portal creation)
- ❌ Dashboard functionality recreated in `web/portal/src/app/dashboard`
- ❌ Not referenced in any active (non-archived) documentation
- ✅ Portal created Jan 7-9, 2026 as replacement

**Impact**: None (Portal is already in production for 5+ weeks)

---

#### 2. **apps/alliedimpact-web** (Port 3000)  
**Reason**: Replaced by `web/portal` in January 2026

**Evidence**:
- ❌ NOT listed in 8 production apps for Feb 25 launch
- ❌ Last modified: Early January (before Portal creation)
- ❌ Homepage code IDENTICAL to `web/portal/src/app/page.tsx`
- ❌ Not referenced in any active documentation
- ✅ Portal created Jan 7-9, 2026 as replacement

**Impact**: None (Portal is already in production for 5+ weeks)

---

### Associated Files to Update

#### 3. **Remove Outdated CI/CD Workflow**
**File**: `.github/workflows/ci-cd.yml`

**Reason**: References obsolete apps, predates Portal

**Evidence**:
- Last modified: Jan 3, 2026 (BEFORE Portal was created)
- Attempts to test/build/deploy both obsolete apps
- Portal has its own modern workflow: `.github/workflows/portal-ci.yml` (Jan 9, 2026)

**Action**: DELETE (or comment out obsolete app references)

**Impact**: None (Portal workflow is already active)

---

## 📚 PART 2: CONSOLIDATE DOCUMENTATION

### Current Documentation Chaos

**13 files in `docs/` folder**:
- Mix of platform guides, phase reports, app-specific docs
- Overlap between files (platform model + architecture)
- Outdated status reports (Jan 6 assessments for Feb 25 launch)
- Empty files (PLATFORM_UI_CONSISTENCY_STRATEGY.md = 0 KB)
- Recent files buried (PWA implementation)

**7 files in root**:
- README.md
- LAUNCH_READINESS_REPORT_FEB_2026.md
- Multiple audit reports
- Test coverage reports

**Problem**: Hard to find what you need, duplicated content, outdated information

---

### ✅ RECOMMENDED 5-DOCUMENT STRUCTURE

#### 1. **README.md** (Root - Enhanced)
**Purpose**: Project overview, quick start, what's new

**Content**:
- Allied iMpact platform overview
- All 8 production apps table (ports, status, Firebase projects)
- Quick start guide
- Documentation roadmap (links to 4 other docs)
- February 25, 2026 launch status
- Updated architecture diagram

**Consolidates**:  - Current README.md (enhance)
- LAUNCH_READINESS_REPORT_FEB_2026.md (update to Feb 17)

---

#### 2. **docs/PLATFORM_ARCHITECTURE.md** (NEW - 25-30 KB)
**Purpose**: Complete architectural reference

**Content**:
1. **Platform Conceptual Model**
   - What Allied iMpact Is (3 business models)
   - User Archetypes (platform + app-specific)
   - Entitlements Model
2. **Technical Architecture**
   - Microservices-inspired monorepo
   - Firebase Hybrid Model (7 projects)
   - Authentication Architecture
3. **Security Principles**
   - App isolation
   - Data security patterns
4. **Integration Patterns**
   - SSO flow
   - Entitlement checks

**Consolidates**:
- ALLIED_IMPACT_PLATFORM_MODEL.md (11.9 KB)
- ARCHITECTURE_AND_SECURITY.md (17.3 KB)

---

#### 3. **docs/PRODUCTS_CATALOG.md** (NEW - 20-25 KB)
**Purpose**: Complete catalog of all applications

**Content**:
- Platform overview
- Product categories (Subscription/Impact/Custom)
- **All 8 Production Applications**:
  - CoinBox (financial platform, P2P, crypto)
  - MyProjects (project management)
  - CareerBox (job platform)
  - DriveMaster (driver training)
  - EduTech (coding courses)
  - SportsHub (tournaments, voting)
  - ControlHub (platform observability)
  - Portal (unified hub)
- Per app: Features, Tech Stack, PWA Support, Integration, Status
- Development ports reference  - Deployment status

**Consolidates**:
- PLATFORM_AND_PRODUCTS.md (12.6 KB)
- PWA_IMPLEMENTATION_COMPLETE.md (features per app)
- LAUNCH_READINESS_REPORT_FEB_2026.md (app status)

**Note**: PWA_IMPLEMENTATION_COMPLETE.md KEPT SEPARATE (detailed implementation record)

---

#### 4. **docs/DEVELOPER_GUIDE.md** (NEW - 35-40 KB)
**Purpose**: Complete development, testing, deployment guide

**Content**:
1. Before You Start (prerequisites, platform understanding)
2. Development Setup (Firebase, environment, dependencies)
3. Adding a New App (step-by-step guide)
4. **UI Consistency Requirements**
   - Design tokens (@allied-impact/config)
   - Shared components (@allied-impact/ui)
   - Layout patterns
   - Tailwind configuration
5. Firebase Integration (Auth, Firestore, security rules)
6. Testing Standards (unit, integration, E2E)
7. Security Checklist (pre-deployment)
8. Deployment Process (Vercel, Firebase, environment)
9. PWA Implementation Guide
10. Troubleshooting Common Issues

**Consolidates**:
- DEVELOPMENT_AND_SCALING_GUIDE.md (21.9 KB)
- PHASE_0_AUDIT_REPORT.md (20.2 KB - UI consistency lessons)
- PHASE_1_COMPLETE.md (6.1 KB - Design tokens)
- PHASE_2_IMPLEMENTATION.md (10.3 KB - Component extraction)

---

#### 5. **docs/LAUNCH_READINESS.md** (NEW - 15-20 KB)
**Purpose**: Current platform status, launch checklist

**Content**:
1. Executive Summary
2. **Launch Date: February 25, 2026** (8 days away)
3. **Application Readiness** (8 apps)
   - CoinBox: ✅ Production Ready
   - MyProjects: ✅ Production Ready
   - CareerBox: ✅ Production Ready
   - DriveMaster: ✅ Production Ready
   - EduTech: ✅ Production Ready
   - SportsHub: ✅ Production Ready
   - ControlHub: ✅ Production Ready
   - Portal: ✅ Production Ready
4. **Critical Systems Status**
   - PWA: ✅ All apps (Feb 17, 2026)
   - Firestore Rules: ✅ All apps
   - Authentication: ✅ All apps
   - Payment Integration: ✅ Paystack (CoinBox, CareerBox, DriveMaster, EduTech, SportsHub)
5. Pre-Launch Checklist (testing, monitoring, support)
6. Known Issues & Mitigations
7. Monitoring & Support Plan
8. Post-Launch Milestones

**Consolidates**:
- LAUNCH_READINESS_REPORT_FEB_2026.md (root - Feb 8 status)
- FINAL_LAUNCH_READINESS_ASSESSMENT.md (17.1 KB - Jan 6, extract still-relevant)
- PLATFORM_VERIFICATION_REPORT.md (17.5 KB - Jan 6 status)

---

### 📁 Files to Archive (Move to `docs/archive-2026-01-06/`)

**11 files** will be moved to archive (not deleted):

1. ✅ ALLIED_IMPACT_PLATFORM_MODEL.md → PLATFORM_ARCHITECTURE.md
2. ✅ ARCHITECTURE_AND_SECURITY.md → PLATFORM_ARCHITECTURE.md
3. ✅ DEVELOPMENT_AND_SCALING_GUIDE.md → DEVELOPER_GUIDE.md
4. ✅ PLATFORM_AND_PRODUCTS.md → PRODUCTS_CATALOG.md
5. ✅ FINAL_LAUNCH_READINESS_ASSESSMENT.md (Jan 6 - outdated)
6. ✅ PLATFORM_VERIFICATION_REPORT.md (Jan 6 - outdated)
7. ✅ PHASE_0_AUDIT_REPORT.md (Jan 14 - project completion record)
8. ✅ PHASE_1_COMPLETE.md (Jan 14 - project completion record)
9. ✅ PHASE_1_IMPLEMENTATION.md (Jan 14 - project completion record)
10. ✅ PHASE_2_IMPLEMENTATION.md (Jan 14 - project completion record)
11. ✅ EDUTECH_ECOSYSTEM_ANALYSIS.md (37 KB - app-specific, should be in apps/edutech/docs/)

---

### 🗑️ Files to Delete

1. ✅ **PLATFORM_UI_CONSISTENCY_STRATEGY.md** (0 KB - empty file)

---

### ✅ Files to Keep As-Is

1. ✅ **PWA_IMPLEMENTATION_COMPLETE.md** (Feb 17, 2026 - brand new implementation record)
2. ✅ **legal/** folder (preserve all legal docs)
3. ✅ **security/** folder (preserve security docs)
4. ✅ **archive/** folder (existing archive)
5. ✅ **archive-2026-01-06/** folder (existing archive from previous cleanup)

---

## 📊 FINAL PROJECT STRUCTURE

### After Cleanup

```
alliedimpact/
├── README.md (✨ ENHANCED - launch status, all 8 apps)
├── .github/
│   └── workflows/
│       ├── portal-ci.yml (✅ KEEP - active)
│       ├── coinbox-ci.yml (✅ KEEP - active)
│       └── [other active CI workflows]
├── apps/
│   ├── coinbox/ (✅ KEEP)
│   ├── careerbox/ (✅ KEEP)
│   ├── controlhub/ (✅ KEEP)
│   ├── drivemaster/ (✅ KEEP)
│   ├── edutech/ (✅ KEEP)
│   ├── myprojects/ (✅ KEEP)
│   └── sports-hub/ (✅ KEEP)
├── web/
│   └── portal/ (✅ KEEP - Production)
├── platform/ (✅ KEEP - all services)
├── packages/ (✅ KEEP - shared packages)
├── docs/
│   ├── PLATFORM_ARCHITECTURE.md (✨ NEW - 25-30 KB)
│   ├── PRODUCTS_CATALOG.md (✨ NEW - 20-25 KB)
│   ├── DEVELOPER_GUIDE.md (✨ NEW - 35-40 KB)
│   ├── LAUNCH_READINESS.md (✨ NEW - 15-20 KB)
│   ├── PWA_IMPLEMENTATION_COMPLETE.md (✅ KEEP - Feb 17, 2026)
│   ├── legal/ (✅ KEEP)
│   ├── security/ (✅ KEEP)
│   ├── archive/ (✅ KEEP)
│   └── archive-2026-01-06/ (📦 +11 archived docs)
└── [other root files preserved]
```

---

## ✅ WHAT WILL NOT CHANGE

**Guaranteed Safe**:
- ✅ All 8 production apps (no code changes)
- ✅ All platform services (auth, billing, entitlements, etc.)
- ✅ All shared packages (ui, utils, types, config)
- ✅ All environment configurations (.env.local files)
- ✅ All Firebase configurations
- ✅ All business logic and workflows
- ✅ All active CI/CD pipelines
- ✅ All test suites
- ✅ All legal and security documentation

**What Changes**:
- ✅ Remove 2 obsolete apps (never used in production)
- ✅ Consolidate scattered docs into 5 clear files
- ✅ Archive old docs (not delete)
- ✅ Update README with current launch status

---

## 🎯 BENEFITS

### ✅ For Developers
- **Clear Documentation**: 5 comprehensive guides instead of 13 scattered files
- **Easy Onboarding**: New team members find what they need quickly
- **No Confusion**: Obsolete apps removed, only active code remains
- **Current Information**: Feb 17, 2026 status (not outdated Jan 6 reports)

### ✅ For Launch (Feb 25, 2026)
- **Clean Codebase**: Only production-ready apps present
- **Clear Status**: Single LAUNCH_READINESS.md with all 8 apps
- **Easy Review**: Stakeholders see organized, current documentation
- **Confidence**: No ambiguity about what's launching

### ✅ For Maintenance
- **Easier Navigation**: 5 purposeful docs instead of 13+ files
- **Less Duplication**: Consolidated content, single source of truth
- **Better Organization**: Archive separates historical from current
- **Future-Proof**: Clear structure for documentation updates

---

## ⚠️ RISK ASSESSMENT

### Low Risk (🟢)
- Obsolete apps: NOT in production, NOT referenced anywhere active
- Documentation: All content preserved in archives (reversible)
- CI/CD: Old workflow not used (Portal has its own)
- No code logic changes: Only cleanup and organization

### Mitigation
- ✅ Git commit before cleanup (easy rollback)
- ✅ Archive (not delete) all documentation
- ✅ Test all 8 apps after cleanup
- ✅ Review changes before committing

---

## 📋 EXECUTION PLAN

### Phase 1: Remove Obsolete Apps (10 minutes)
1. Delete `apps/alliedimpact-dashboard/`
2. Delete `apps/alliedimpact-web/`
3. Delete `.github/workflows/ci-cd.yml`
4. Verify PNPM workspace still works

### Phase 2: Consolidate Documentation (30 minutes)
1. Create 5 new comprehensive docs
2. Move 11 old docs to archive
3. Delete 1 empty file
4. Update root README

### Phase 3: Verification (15 minutes)
1. Run TypeScript checks on all apps
2. Test dev server startup for all apps
3. Verify no broken documentation links
4. Review changes in git diff

### Phase 4: Commit (5 minutes)
1. Git add all changes
2. Comprehensive commit message
3. Push to main

**Total Time: ~60 minutes**

---

## 🤝 APPROVAL REQUIRED

**I need your approval to proceed with:**

1. ✅ **DELETE** `apps/alliedimpact-dashboard/`
2. ✅ **DELETE** `apps/alliedimpact-web/`
3. ✅ **DELETE** `.github/workflows/ci-cd.yml`
4. ✅ **CREATE** 5 new comprehensive documentation files
5. ✅ **ARCHIVE** 11 old documentation files
6. ✅ **DELETE** 1 empty documentation file

**Please respond with:**
- **"Approved - proceed with cleanup"** - I'll execute the plan
- **"Hold - I want to review [specific item]"** - I'll provide more details
- **"Modify - change [specific aspect]"** - I'll adjust the plan

---

**Prepared By**: GitHub Copilot  
**Date**: February 17, 2026  
**Next Action**: Awaiting your approval to proceed
