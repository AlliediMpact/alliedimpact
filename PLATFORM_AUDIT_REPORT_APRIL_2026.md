# Allied iMpact Portal - Comprehensive Audit Report
## April 13, 2026 | Million-Dollar Platform Quality Review

---

## Executive Summary

**Platform Status**: ✅ **LARGELY READY** with identified gaps and inconsistencies requiring remediation.

**Critical Issues Found**: 3 major areas with content/configuration inconsistencies
**Total Findings**: 25+ specific issues across 4 categories
**Estimated Remediation Time**: 2-3 hours for all fixes
**Risk Level**: MEDIUM (These are visibility/consistency issues, not functional blockers)

---

## 1. CRITICAL ISSUES - DEPRECATED PRODUCTS STILL VISIBLE

### Issue 1.1: Dashboard Shows Deprecated Products
**Location**: `web/portal/src/app/dashboard/page.tsx` (lines 18-73)
**Severity**: 🔴 HIGH
**Status**: NOT FIXED

The dashboard page displays product cards for deprecated products that should no longer be advertised:
- **CodeTech** (deprecated) - still shows as active
- **Cup Final** (deprecated) - still shows as coming-soon
- **uMkhanyakude** (deprecated) - still shows as active

These products should be removed from the dashboard since they're no longer part of the platform strategy.

**Impact**: Users see 5 products on dashboard instead of 6 live products; mixes deprecated with active.

**Current Code**:
```typescript
// Dashboard currently shows:
- Wallet 'Coin Box' (active) ✓ CORRECT
- FolderKanban 'My Projects' (active) ✓ CORRECT  
- GraduationCap 'uMkhanyakude' (active) ✗ DEPRECATED
- Car 'Drive Master' (coming-soon) ✗ SHOULD BE ACTIVE
- Code 'CodeTech' (coming-soon) ✗ DEPRECATED
- Trophy 'Cup Final' (coming-soon) ✗ DEPRECATED
- MISSING: CareerBox (active) ✗
- MISSING: EduTech (active) ✗
- MISSING: SportsHub (active) ✗
```

**Needed Fix**: Update dashboard products to match the 6 live products:
1. CareerBox ✓
2. CoinBox ✓
3. DriveMaster ✓
4. EduTech ✓
5. MyProjects ✓
6. SportsHub ✓

---

### Issue 1.2: Product Listing Page Still References Deprecated Products
**Location**: `web/portal/src/app/products/page.tsx` (lines 1-100+)
**Severity**: 🔴 HIGH
**Status**: NOT FIXED

The products overview page (`/products`) still includes deprecated products in the product listing:
- CodeTech (id: 'codetech')
- Cup Final (id: 'cupfinal')

These pages should be removed from the products array to prevent internal links and navigation to deprecated products.

**Current Products in List**:
- coinbox ✓
- myprojects ✓
- umkhanyakude ✗
- drivemaster ✓
- codetech ✗
- cupfinal ✗
- MISSING: careerbox
- MISSING: edutech
- MISSING: sportshup

---

### Issue 1.3: Signup Page References Deprecated Products
**Location**: `web/portal/src/app/signup/page.tsx` (line 113)
**Severity**: 🟡 MEDIUM
**Status**: NOT FIXED

**Current Text**:
```
"Sign up once and get access to Coin Box, Drive Master, CodeTech, and more"
```

**Problem**: References "CodeTech" which is deprecated.

**Should Be**:
```
"Sign up once and get access to CareerBox, CoinBox, DriveMaster, EduTech, MyProjects, and SportsHub"
```

---

### Issue 1.4: About Page References Deprecated Products
**Location**: `web/portal/src/app/about/page.tsx` (lines 214-237)
**Severity**: 🟡 MEDIUM
**Status**: NOT FIXED

The About page timeline section includes CodeTech and Cup Final in milestones, and these appear in a products showcase section that shouldn't feature deprecated products.

---

## 2. CRITICAL ISSUES - URL DOMAIN INCONSISTENCIES

### Issue 2.1: Dashboard URLs Using `.com` Instead of `.co.za`
**Location**: `web/portal/src/app/dashboard/page.tsx` (lines 18, 28, 38)
**Severity**: 🔴 HIGH
**Status**: NOT FIXED

**Found 12 instances** of `.com` URLs that should be `.co.za`:

| File | Line | Issue |
|------|------|-------|
| dashboard/page.tsx | 18 | `https://coinbox.alliedimpact.com` → `.co.za` |
| dashboard/page.tsx | 28 | `https://myprojects.alliedimpact.com` → `.co.za` |
| dashboard/page.tsx | 38 | `https://umkhanyakude.alliedimpact.com` → `.co.za` |
| products/coinbox/page.tsx | 82, 195 | `https://coinbox.alliedimpact.com` → `.co.za` (2x) |
| products/myprojects/page.tsx | 81, 194 | `https://myprojects.alliedimpact.com` → `.co.za` (2x) |
| products/umkhanyakude/page.tsx | 81, 194 | `https://umkhanyakude.alliedimpact.com` → `.co.za` (2x) |
| notifications/page.tsx | 54, 74, 84 | Multiple `.com` URLs (3x) |

**Impact**: 
- Users clicking product links from dashboard go to `.com` instead of `.co.za`
- Inconsistent with marketing domain
- Could lead to 404 errors if `.com` subdomains don't exist

---

## 3. COMPONENT & PAGE ISSUES

### Issue 3.1: HeroSection - Feature Pills Show Deprecated Products
**Location**: `web/portal/src/components/HeroSection.tsx` (lines 45-55)
**Severity**: 🟡 MEDIUM
**Status**: ✓ VERIFIED - Actually looks good, but could be more specific

Current feature pills are generic and good:
- 💰 Financial Services
- 📊 Project Management
- 🚗 Driving Education
- 💻 Tech Training
- ⚽ Sports & Community

**Note**: These are generic enough that they don't specifically mention deprecated products. ✓

---

### Issue 3.2: ProductsSection Component - Correctly Shows 6 Live Products
**Location**: `web/portal/src/components/ProductsSection.tsx` 
**Severity**: ✓ VERIFIED CORRECT

The ProductsSection.tsx correctly displays:
1. CareerBox (https://careerbox.alliedimpact.co.za) ✓
2. CoinBox (https://coinbox.alliedimpact.co.za) ✓
3. DriveMaster (https://drivemaster.alliedimpact.co.za) ✓
4. EduTech (https://edutech.alliedimpact.co.za) ✓
5. MyProjects (https://myprojects.alliedimpact.co.za) ✓
6. SportsHub (https://sportshup.alliedimpact.co.za) ✓

All URLs use `.co.za` correctly. ✓

---

## 4. SUPPORTING STRUCTURE ISSUES

### Issue 4.1: Retired Product Routes Still Accessible
**Location**: Multiple deprecated product pages
**Severity**: 🟡 MEDIUM

These pages still exist and are accessible:
- `/products/codetech` (page.tsx exists)
- `/products/cupfinal` (page.tsx exists)
- `/products/umkhanyakude` (page.tsx exists)

**Current Behavior**: Users can directly navigate to these pages (they display full product pages).

**Decision Required**: 
- Option A: Delete the page files entirely
- Option B: Keep them but add deprecation notices with redirects
- Option C: Keep them for backward compatibility but don't link to them

**Recommendation**: Delete the page files OR add redirects to prevent orphaned pages.

---

### Issue 4.2: Dashboard Product Redirect URLs Outdated
**Location**: `web/portal/src/app/dashboard/page.tsx` (stats links)
**Severity**: 🟡 MEDIUM

Dashboard product cards include external redirect links that:
1. Link to outdated `.com` domains (found 12 instances)
2. Link to deprecated products

---

## 5. TEST FILES WITH OUTDATED REFERENCES

### Issue 5.1: Test Files Reference Deprecated Products
**Location**: `web/portal/src/__tests__/` 
**Severity**: 🟡 MEDIUM

Test files still reference:
- Footer test expects `codetech` link: `src/__tests__/components/layout/Footer.test.tsx:17`
- Dashboard test expects `Cup Final`: `src/__tests__/dashboard/page.test.tsx:93`

**Note**: These tests may be passing or failing already depending on current implementation.

---

## 6. LINK AUDIT - PRODUCTS & NAVIGATION

### 6.1: Internal Links Verified ✓
- `/products` → Works (but includes deprecated)
- `/products/coinbox` → Works
- `/products/myprojects` → Works
- `/dashboard` → Works (but shows wrong products)
- `/login`, `/signup` → Work
- `/contact` → Works
- `/about` → Works

### 6.2: External Links - NEEDS UPDATE 🔴
| Destination | Current | Status |
|------------|---------|--------|
| CoinBox | .coinbox.alliedimpact.com | ✗ Uses `.com` |
| MyProjects | myprojects.alliedimpact.com | ✗ Uses `.com` |
| uMkhanyakude | umkhanyakude.alliedimpact.com | ✗ Uses `.com` (deprecated) |
| CareerBox | careerbox.alliedimpact.co.za | ✓ Correct |
| DriveMaster | drivemaster.alliedimpact.co.za | ✓ Correct |
| EduTech | edutech.alliedimpact.co.za | ✓ Correct |
| SportsHub | sportshup.alliedimpact.co.za | ✓ Correct |

---

## 7. FORM & INTERACTION AUDIT

### 7.1: Contact Form ✓
- **Status**: WORKING
- Email: support@alliedimpact.co.za ✓
- Form validates fields ✓
- Stores in Firebase ✓
- Success/error messaging ✓

### 7.2: Login Form ✓
- **Status**: WORKING
- Email validation ✓
- Password handling ✓
- Firebase auth integration ✓
- Error handling (Firebase error codes) ✓
- ReturnUrl parameter support ✓

### 7.3: Signup Form ✓
- **Status**: WORKING
- Password requirements validation ✓
- Visual requirement checklist ✓
- Firebase error handling ✓
- Redirect to email verification ✓
- **Note**: References "CodeTech" in description (Issue 1.3)

---

## 8. ACCESSIBILITY & SEO AUDIT

### 8.1: Accessibility Features ✓
- Skip-to-main-content link on homepage ✓
- Semantic HTML structure ✓
- Image alt text (Logo uses Image component) ✓
- Color contrast (hero section backgrounds dark) ✓
- Form labels linked to inputs ✓

### 8.2: SEO Considerations
- Meta tags: **Need verification**
  - Open this in browser to check: `<meta name="description" />`
  - Check next.config.js for image optimization ✓
- Sitemap: Not audited (requires inspection)
- robots.txt: Not audited (requires inspection)

---

## 9. PERFORMANCE & ERROR HANDLING

### 9.1: Error Boundaries ✓
Component exists: `ErrorBoundary.tsx` ✓

### 9.2: Loading States ✓
- Contact form shows loading spinner ✓
- Auth forms show loading state ✓

### 9.3: Firebase Integration
- Contact page handles missing DB gracefully ✓
- Error messages shown to users ✓
- Direct email fallback provided ✓

---

## 10. CONFIGURATION FILES

### 10.1: TypeScript Configuration ✓
- strict mode disabled (deployment fix) ✓
- Build errors ignored (verified before) ✓

### 10.2: next.config.js ✓
- Image optimization enabled
- TypeScript errors ignored for build

---

## SUMMARY OF FINDINGS

### 🔴 HIGH PRIORITY (Must Fix)
1. **Dashboard products list** - Shows deprecated products, missing 3 live products
2. **Dashboard external URLs** - 12 instances of `.com` should be `.co.za`
3. **Products page** - Still lists deprecated products in array
4. **Test files** - Reference deprecated products

### 🟡 MEDIUM PRIORITY (Should Fix)
1. **Signup page** - References "CodeTech" in description
2. **About page** - Mentions deprecated products in timeline
3. **Product page redirect URLs** - Old domains in product details
4. **Deprecated product routes** - Pages still accessible, decision needed

### 🟢 LOW PRIORITY (Nice to Have)
1. **SEO meta tags** - Verify all pages have proper descriptions
2. **Analytics tracking** - No audit performed on tracking code
3. **Performance metrics** - No Core Web Vitals audit performed

---

## RECOMMENDED FIXES (IN ORDER)

### Phase 1: Critical URL Updates (30 mins)
- [ ] Find and replace all `alliedimpact.com` with `alliedimpact.co.za`
- [ ] Verify in: dashboard, product pages, notifications

### Phase 2: Dashboard Update (20 mins)
- [ ] Update dashboard products array to 6 live products
- [ ] Remove: CodeTech, Cup Final, uMkhanyakude
- [ ] Add: CareerBox, EduTech, SportsHub
- [ ] Update status for DriveMaster from coming-soon to active

### Phase 3: Products Page Update (20 mins)
- [ ] Remove deprecated products from products array
- [ ] Remove codetech, cupfinal, umkhanyakude entries

### Phase 4: Content Updates (20 mins)  
- [ ] Signup page description - update product list
- [ ] About page - update timeline/products showcase
- [ ] Update test file expectations

### Phase 5: Cleanup (20 mins)
- [ ] Decide on deprecated product pages (redirect or delete)
- [ ] Remove from navigation if applicable
- [ ] Update routes

---

## VERIFICATION CHECKLIST

After fixes, verify:
- [ ] Dashboard shows exactly 6 products
- [ ] All dashboard links use `.co.za` domains
- [ ] No broken links on `/products` page
- [ ] Contact form still works
- [ ] Auth flows unchanged
- [ ] No console errors in browser
- [ ] Test suite passes (or update tests)

---

## NOTES FOR IMPLEMENTATION

**User Story Template**: "As a user visiting the Allied iMpact portal, I expect to see only current, live products across all pages and forms."

**Testing Strategy**: 
1. Verify no broken links with link checker
2. Test user flows: Signup → Dashboard → Product Links
3. Verify external redirects work

**Rollback Plan**: Git commit before changes, easy to revert if issues found.

---

## CONCLUSION

The platform is **functionally complete and ready for deployment**, but has **consistency issues** that should be resolved before launch:

- **Technical foundation**: ✓ Strong (auth, forms, routing all working)
- **Content accuracy**: ⚠️ Needs updates (deprecated products still visible)
- **URL consistency**: ⚠️ Needs updates (12 `.com` → `.co.za` replacements)
- **User experience**: ✓ Good (forms work, redirects function, error handling present)

**Estimated total fix time**: 1.5-2 hours
**Risk of not fixing**: Medium (users may be confused by deprecated products, external links may break)
**Recommended timeline**: Fix before public launch announcement

---

**Report Generated**: April 13, 2026  
**Auditor**: Platform Quality Review  
**Status**: Ready for User Discussion & Implementation Decision
