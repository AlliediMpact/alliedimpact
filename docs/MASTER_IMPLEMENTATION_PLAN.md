# 🚀 Allied iMpact - Master Implementation Plan

**Date**: January 3, 2026  
**Status**: ACTIVE - Ready to Execute  
**Current Phase**: Phase 2 - Individual Dashboard + Coin Box Integration

---

## 📋 EXECUTIVE SUMMARY

**Platform Status**: Infrastructure complete (Phase 1 ✅), Ready for product integration  
**Next Milestone**: Soft launch with Coin Box (7 days)  
**Strategy**: Build Individual Dashboard → Integrate Coin Box → Launch with real users

**Production Readiness**: 8/10
- ✅ Authentication, rate limiting, error tracking, analytics
- ✅ GDPR compliance, testing, CI/CD, backups
- ⏳ Dashboard needs enhancement (2 days)
- ⏳ Coin Box needs integration (3 days)

---

## 🎯 IMPLEMENTATION PHASES

### ✅ Phase 1: Production Infrastructure (COMPLETE)
**Duration**: 7 days  
**Completion**: January 3, 2026

**Deliverables**:
1. ✅ Structured logging (Logger service)
2. ✅ Rate limiting (Upstash Redis)
3. ✅ Error tracking (Sentry)
4. ✅ Analytics (Mixpanel)
5. ✅ GDPR compliance (consent, policies, data APIs)
6. ✅ Automated tests (24 tests, 60% coverage)
7. ✅ CI/CD pipeline (GitHub Actions, 7 jobs)
8. ✅ Firestore backups (automated, 30-day retention)

**Result**: Platform infrastructure is production-ready

---

### 🔄 Phase 2: Dashboard Engine + Coin Box Integration (IN PROGRESS)
**Duration**: 7 days  
**Target**: January 10, 2026

**Goals**:
1. Build composable Dashboard Engine
2. Create Individual Dashboard
3. Integrate Coin Box authentication
4. Enable subscription flow
5. Launch soft beta with 10-50 users

#### Week Breakdown

**Day 1-2: Dashboard Foundation** ✅ COMPLETE (January 3, 2026)
- [x] Create Dashboard Engine (archetype detection, view routing)
- [x] Build enhanced Entitlements Service (support all access types)
- [x] Create Product Categories system
- [x] Create User Archetypes system
- [x] Build Individual Dashboard layout
- [x] Test archetype detection

**Day 3-4: Subscription Flow** ✅ COMPLETE (January 5, 2026)
- [x] Create subscription modal component
- [x] Integrate PayFast payment form
- [x] Integrate Stripe payment form (international)
- [x] Build payment webhook handlers
- [x] Grant entitlements on successful payment
- [x] Test payment flows (success, failure, cancellation)

**Day 5-6: Coin Box Integration** 🔄 IN PROGRESS
- [ ] Update Coin Box to use @allied-impact/auth
- [ ] Add entitlement checks to Coin Box routes
- [ ] Route Dashboard → Coin Box seamlessly
- [ ] Test authentication flow end-to-end
- [ ] Test multi-user scenarios

**Day 7: Testing & Polish** ⏳ PENDING
- [ ] End-to-end testing (signup → subscribe → use Coin Box)
- [ ] Fix integration bugs
- [ ] Add loading states
- [ ] Improve error messages
- [ ] Add 404/500 pages
- [ ] Final security review

**Deliverables**:
- ✅ Users can sign up on platform
- ✅ Users can subscribe to Coin Box
- ✅ Users can access full Coin Box features
- ✅ Dashboard shows subscription status
- ✅ Ready for soft launch

---

### 🔮 Phase 3: Organization Dashboard (WHEN NEEDED)
**Duration**: 3 days  
**Trigger**: First NGO/Institution client signs up

**Goals**:
1. Build Organization Service
2. Create Organization Dashboard
3. Enable bulk user provisioning
4. Track organization metrics

**Tasks**:
- [ ] Create `platform/institutions/` service
- [ ] Build Firestore schema for organizations
- [ ] Create user management APIs
- [ ] Build Organization Dashboard UI
- [ ] Add view switcher (Individual ↔ Organization)
- [ ] Test multi-view functionality

**Deliverables**:
- ✅ NGOs can manage their users
- ✅ Bulk provisioning works
- ✅ Usage metrics tracked
- ✅ View switching works

---

### 🔮 Phase 4: Custom Client Dashboard (WHEN NEEDED)
**Duration**: 3 days  
**Trigger**: First custom development contract signed

**Goals**:
1. Build Project Management Service
2. Create Client Dashboard
3. Enable project tracking

**Tasks**:
- [ ] Create `platform/projects/` service
- [ ] Build project schema (milestones, deliverables, tickets)
- [ ] Create project management APIs
- [ ] Build Client Dashboard UI
- [ ] Add project timeline view
- [ ] Add support ticket system

**Deliverables**:
- ✅ Clients can track their projects
- ✅ Milestone visibility
- ✅ Support tickets work
- ✅ Billing/invoices visible

---

### 🔮 Phase 5: Sponsor Dashboard (WHEN NEEDED)
**Duration**: 3 days  
**Trigger**: First sponsorship agreement signed

**Goals**:
1. Build Sponsorship Service
2. Create Sponsor Dashboard
3. Enable impact tracking

**Tasks**:
- [ ] Create `platform/sponsorship/` service
- [ ] Build sponsorship schema
- [ ] Create sponsorship management APIs
- [ ] Build Sponsor Dashboard UI
- [ ] Add impact metrics visualization
- [ ] Track beneficiaries

**Deliverables**:
- ✅ Sponsors can fund initiatives
- ✅ Impact metrics tracked
- ✅ Beneficiary management works
- ✅ ROI visibility

---

### 🔮 Phase 6: Additional Products (FUTURE)
**Duration**: 4 weeks each  
**Order**: Drive Master → CodeTech → Cup Final → uMkhanyakude

Each product follows same pattern:
1. Build core features
2. Integrate with platform auth
3. Add to Dashboard
4. Test and launch

---

## 🏗️ ARCHITECTURE DECISIONS

### 1. Dashboard Architecture: "Dashboard Engine" Pattern

**Decision**: One dashboard app with multiple persona views

**Structure**:
```
apps/alliedimpact-dashboard/
├── app/
│   ├── layout.tsx              # Master layout (auth, navigation)
│   ├── page.tsx                # Dashboard router (uses Engine)
│   ├── (individual)/           # Individual user views
│   │   └── page.tsx            # Personal subscriptions
│   ├── (organization)/         # NGO/Institution views [Phase 3]
│   │   └── page.tsx            # User management
│   ├── (client)/               # Custom dev client views [Phase 4]
│   │   └── page.tsx            # Project tracking
│   ├── (sponsor)/              # Sponsor/Investor views [Phase 5]
│   │   └── page.tsx            # Impact tracking
│   └── (admin)/                # Admin views [Future]
│       └── page.tsx            # Platform management
├── components/
│   ├── dashboards/             # Dashboard-specific layouts
│   ├── sections/               # Reusable sections (subscriptions, programs)
│   └── widgets/                # Reusable widgets (cards, charts)
└── lib/
    └── dashboard-engine.ts     # Core routing & archetype logic
```

**Benefits**:
- Single codebase, easier maintenance
- Shared components, consistent UX
- Role-aware rendering
- Easy to add new views
- Better code reuse

---

### 2. Entitlements Model: Multi-Source Access

**Decision**: Entitlements support subscription, sponsored, project, role, and grant-based access

**Schema**:
```typescript
type Entitlement = {
  userId: string;
  product: string;
  tier?: string;
  
  // Access type
  accessType: 'subscription' | 'sponsored' | 'project' | 'role' | 'grant';
  
  // Context (optional, depends on accessType)
  sponsorId?: string;      // For sponsored access
  projectId?: string;      // For project access
  grantId?: string;        // For grant access
  
  // Status
  status: 'active' | 'expired' | 'suspended';
  grantedAt: Date;
  expiresAt?: Date;
  grantedBy: string;       // admin, sponsor, system
  
  metadata?: Record<string, any>;
}
```

**Benefits**:
- Supports all business models (subscription, impact, custom)
- Flexible access control
- Easy to track access source
- Supports time-limited access

---

### 3. User Archetypes: Multi-Role System

**Decision**: Users can have multiple archetypes simultaneously

**Archetypes**:
1. `individual` - Personal subscriptions
2. `learner` - Education/youth programs
3. `investor` - Funding initiatives
4. `sponsor` - Sponsoring programs
5. `ngo` - NGO/non-profit
6. `institution` - Schools, government
7. `custom_client` - Custom dev projects
8. `admin` - Platform management
9. `super_admin` - Full control

**View Priority** (when user has multiple):
1. Super Admin (highest priority)
2. Admin
3. Custom Client
4. Sponsor/Investor
5. NGO/Institution
6. Individual (default)

**Benefits**:
- Single user account spans multiple roles
- Dashboard adapts to user context
- View switcher for multi-role users
- Flexible, scalable model

---

### 4. Product Categories: Three Business Models

**Decision**: Products categorized by business model

**Categories**:

**A. Subscription Products** (Paid access)
- Coin Box (P2P financial platform)
- Drive Master (Driving education)
- CodeTech (Coding education)
- Cup Final (Sports platform)

**B. Impact Products** (Sponsored/free access)
- uMkhanyakude (Schools information)
- Youth programs
- Community initiatives

**C. Custom Products** (Project-based)
- Gov Cross Platform
- Client-specific solutions
- Licensed IP

**Benefits**:
- Clear business model per product
- Different access flows
- Flexible monetization
- Supports all revenue streams

---

### 5. Data Isolation: Multi-Tenant Security

**Decision**: Strict data isolation per archetype

**Firestore Structure**:
```
users/{userId}/
  - profile (name, email, archetypes[])
  - preferences (defaultView, settings)

organizations/{orgId}/
  - info (name, type, adminIds[])
  - users/{userId} (role, status)
  - programs/{programId} (product, sponsor, beneficiaries)

projects/{projectId}/
  - info (clientId, status, milestones)
  - deliverables/{deliverableId}
  - tickets/{ticketId}

sponsorships/{sponsorshipId}/
  - info (sponsorId, initiative, amount)
  - metrics (usersReached, engagement)
  - beneficiaries/{userId}

entitlements/{entitlementId}/
  - userId, product, accessType, context
```

**Security Rules**:
- Users can only read their own data
- Org admins can only access their org
- Project clients can only see their projects
- Admins have elevated access
- Super admins have full access

**Benefits**:
- Data privacy guaranteed
- Multi-tenant isolation
- Role-based access control
- Scalable security model

---

## 🛠️ TECHNICAL IMPLEMENTATION

### Phase 2 Implementation Details

#### 1. Dashboard Engine (Day 1)

**File**: `apps/alliedimpact-dashboard/lib/dashboard-engine.ts`

```typescript
import { UserArchetype } from '@allied-impact/shared';

export type DashboardView = 
  | 'individual' 
  | 'organization' 
  | 'client' 
  | 'sponsor' 
  | 'admin';

export class DashboardEngine {
  // Determine primary view based on archetypes
  static getPrimaryView(archetypes: UserArchetype[]): DashboardView {
    if (archetypes.includes(UserArchetype.SUPER_ADMIN)) return 'admin';
    if (archetypes.includes(UserArchetype.ADMIN)) return 'admin';
    if (archetypes.includes(UserArchetype.CUSTOM_CLIENT)) return 'client';
    if (archetypes.includes(UserArchetype.SPONSOR)) return 'sponsor';
    if (archetypes.includes(UserArchetype.INSTITUTION)) return 'organization';
    return 'individual'; // Default
  }
  
  // Get all available views for switcher
  static getAvailableViews(archetypes: UserArchetype[]): DashboardView[] {
    const views: DashboardView[] = ['individual'];
    if (archetypes.includes(UserArchetype.INSTITUTION)) views.push('organization');
    if (archetypes.includes(UserArchetype.CUSTOM_CLIENT)) views.push('client');
    if (archetypes.includes(UserArchetype.SPONSOR)) views.push('sponsor');
    if (archetypes.includes(UserArchetype.ADMIN)) views.push('admin');
    return views;
  }
}
```

#### 2. Enhanced Entitlements Service (Day 1)

**File**: `platform/entitlements/src/index.ts` (enhance existing)

```typescript
export enum AccessType {
  SUBSCRIPTION = 'subscription',
  SPONSORED = 'sponsored',
  PROJECT = 'project',
  ROLE = 'role',
  GRANT = 'grant'
}

export type Entitlement = {
  id: string;
  userId: string;
  product: string;
  tier?: string;
  accessType: AccessType;
  
  // Context (optional)
  sponsorId?: string;
  projectId?: string;
  grantId?: string;
  
  status: 'active' | 'expired' | 'suspended';
  grantedAt: Timestamp;
  expiresAt?: Timestamp;
  grantedBy: string;
  metadata?: Record<string, any>;
}

export class EntitlementService {
  // Check if user has access (any type)
  async hasAccess(userId: string, product: string): Promise<boolean> {
    const entitlements = await this.getUserEntitlements(userId);
    return entitlements.some(e => 
      e.product === product && 
      e.status === 'active' &&
      (!e.expiresAt || e.expiresAt.toDate() > new Date())
    );
  }
  
  // Grant subscription access
  async grantSubscription(userId: string, product: string, tier: string): Promise<void> {
    await this.createEntitlement({
      userId,
      product,
      tier,
      accessType: AccessType.SUBSCRIPTION,
      status: 'active',
      grantedAt: Timestamp.now(),
      grantedBy: 'system'
    });
  }
  
  // Grant sponsored access
  async grantSponsored(
    userId: string, 
    product: string, 
    sponsorId: string,
    duration?: number
  ): Promise<void> {
    await this.createEntitlement({
      userId,
      product,
      accessType: AccessType.SPONSORED,
      sponsorId,
      status: 'active',
      grantedAt: Timestamp.now(),
      expiresAt: duration ? Timestamp.fromMillis(Date.now() + duration) : undefined,
      grantedBy: sponsorId
    });
  }
  
  // Future: Project access, grant access, etc.
}
```

#### 3. Product Categories (Day 1)

**File**: `platform/shared/src/product-categories.ts`

```typescript
export enum ProductCategory {
  SUBSCRIPTION = 'subscription',
  IMPACT = 'impact',
  CUSTOM = 'custom'
}

export type ProductMetadata = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  icon: string;
  url?: string;
  
  subscription?: {
    tiers: Array<{ id: string; name: string; price: number; currency: string }>;
    billingCycle: 'monthly' | 'yearly' | 'one-time';
  };
  
  impact?: {
    targetAudience: 'youth' | 'schools' | 'community' | 'all';
    sponsorable: boolean;
    requiresApproval: boolean;
  };
  
  custom?: {
    isProjectBased: boolean;
    requiresContract: boolean;
  };
}

export const PRODUCTS: Record<string, ProductMetadata> = {
  coinbox: {
    id: 'coinbox',
    name: 'Coin Box',
    description: 'P2P Financial Platform - Loans, Investments & Crypto Trading',
    category: ProductCategory.SUBSCRIPTION,
    icon: '🪙',
    url: 'https://coinbox.alliedimpact.com',
    subscription: {
      tiers: [
        { id: 'basic', name: 'Basic', price: 550, currency: 'ZAR' },
        { id: 'ambassador', name: 'Ambassador', price: 1100, currency: 'ZAR' },
        { id: 'vip', name: 'VIP', price: 5500, currency: 'ZAR' },
        { id: 'business', name: 'Business', price: 11000, currency: 'ZAR' }
      ],
      billingCycle: 'one-time'
    }
  },
  
  drivemaster: {
    id: 'drivemaster',
    name: 'Drive Master',
    description: 'Learner License Training & K53 Test Preparation',
    category: ProductCategory.SUBSCRIPTION,
    icon: '🚗',
    subscription: {
      tiers: [
        { id: 'free', name: 'Free', price: 0, currency: 'ZAR' },
        { id: 'premium', name: 'Premium', price: 99, currency: 'ZAR' },
        { id: 'lifetime', name: 'Lifetime', price: 999, currency: 'ZAR' }
      ],
      billingCycle: 'monthly'
    }
  },
  
  umkhanyakude: {
    id: 'umkhanyakude',
    name: 'uMkhanyakude Schools',
    description: 'High School Information & Community Platform',
    category: ProductCategory.IMPACT,
    icon: '🏫',
    impact: {
      targetAudience: 'schools',
      sponsorable: true,
      requiresApproval: false
    }
  }
  
  // Add other products as needed
};
```

#### 4. User Archetypes (Day 1)

**File**: `platform/shared/src/user-archetypes.ts`

```typescript
export enum UserArchetype {
  INDIVIDUAL = 'individual',
  LEARNER = 'learner',
  INVESTOR = 'investor',
  SPONSOR = 'sponsor',
  NGO = 'ngo',
  INSTITUTION = 'institution',
  CUSTOM_CLIENT = 'custom_client',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  archetypes: UserArchetype[];
  createdAt: Timestamp;
  
  // Individual/Learner context
  subscriptions?: string[];
  
  // Organization context
  organizationId?: string;
  organizationRole?: 'admin' | 'member';
  
  // Sponsor context
  sponsorships?: Array<{ id: string; initiative: string }>;
  
  // Client context
  projectIds?: string[];
}

export function getDashboardSections(profile: UserProfile): string[] {
  const sections: string[] = [];
  
  // Everyone gets personal section
  sections.push('my-subscriptions');
  
  if (profile.archetypes.includes(UserArchetype.INSTITUTION) ||
      profile.archetypes.includes(UserArchetype.NGO)) {
    sections.push('organization-management');
  }
  
  if (profile.archetypes.includes(UserArchetype.SPONSOR) ||
      profile.archetypes.includes(UserArchetype.INVESTOR)) {
    sections.push('my-sponsorships', 'impact-dashboard');
  }
  
  if (profile.archetypes.includes(UserArchetype.CUSTOM_CLIENT)) {
    sections.push('my-projects');
  }
  
  if (profile.archetypes.includes(UserArchetype.ADMIN) ||
      profile.archetypes.includes(UserArchetype.SUPER_ADMIN)) {
    sections.push('admin-panel');
  }
  
  return sections;
}
```

#### 5. Individual Dashboard (Day 2)

**File**: `apps/alliedimpact-dashboard/app/(individual)/page.tsx`

```typescript
import { DashboardEngine } from '@/lib/dashboard-engine';
import { MySubscriptionsSection } from '@/components/sections/MySubscriptionsSection';
import { PRODUCTS } from '@allied-impact/shared/product-categories';

export default async function IndividualDashboard() {
  const user = await getAuthUser();
  const profile = await getUserProfile(user.uid);
  const entitlements = await getEntitlements(user.uid);
  
  const subscriptionProducts = Object.values(PRODUCTS).filter(
    p => p.category === 'subscription'
  );
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        Welcome back, {profile.name}
      </h1>
      
      <MySubscriptionsSection 
        products={subscriptionProducts}
        entitlements={entitlements}
        userId={user.uid}
      />
      
      {/* Add more sections as needed */}
    </div>
  );
}
```

#### 6. Subscription Modal (Day 3)

**File**: `apps/alliedimpact-dashboard/components/SubscriptionModal.tsx`

```typescript
export function SubscriptionModal({ product, onClose }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Create payment intent
      const response = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          tierId: selectedTier.id,
          provider: 'payfast' // or 'stripe'
        })
      });
      
      const { paymentUrl } = await response.json();
      
      // Redirect to payment
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal open onClose={onClose}>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      
      <div className="tiers">
        {product.subscription.tiers.map(tier => (
          <TierCard 
            key={tier.id}
            tier={tier}
            selected={selectedTier?.id === tier.id}
            onClick={() => setSelectedTier(tier)}
          />
        ))}
      </div>
      
      <Button 
        onClick={handleSubscribe}
        disabled={!selectedTier || loading}
      >
        {loading ? 'Processing...' : `Subscribe for ${selectedTier?.price}`}
      </Button>
    </Modal>
  );
}
```

#### 7. Coin Box Integration (Day 5-6)

**Changes to Coin Box** (minimal):

1. Update auth check:
```typescript
// apps/coinbox/middleware.ts
import { verifySession } from '@allied-impact/auth';
import { hasAccess } from '@allied-impact/entitlements';

export async function middleware(request: NextRequest) {
  const session = await verifySession(request);
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check entitlement
  const hasAccess = await hasAccess(session.uid, 'coinbox');
  
  if (!hasAccess) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}
```

2. Keep all Coin Box business logic unchanged ✅

---

## 📊 SUCCESS METRICS

### Phase 2 Success Criteria:

1. **Authentication** ✅
   - Users can sign up
   - Email verification works
   - Login/logout works
   - Session persists

2. **Dashboard** ✅
   - Dashboard loads for authenticated users
   - Product cards display correctly
   - Subscription status shows (Active/Subscribe)
   - View switcher works (if multi-archetype user)

3. **Subscription Flow** ✅
   - Modal opens when clicking "Subscribe"
   - Tier selection works
   - Payment redirects to PayFast/Stripe
   - Webhook grants entitlement
   - User sees "Active" status after payment

4. **Coin Box Integration** ✅
   - Clicking "Active" Coin Box card → opens Coin Box
   - Coin Box checks entitlement
   - Unauthorized users redirected to Dashboard
   - Authorized users access full Coin Box features

5. **Performance** ✅
   - Dashboard loads < 2 seconds
   - No console errors
   - Mobile responsive
   - Error states handle gracefully

---

## 🚨 RISK MITIGATION

### Potential Issues & Solutions

**Risk 1: Payment Integration Complexity**
- **Mitigation**: Test with sandbox mode first
- **Backup**: Manual entitlement grant by admin if payment fails

**Risk 2: Coin Box Auth Migration**
- **Mitigation**: Minimal changes, only middleware
- **Backup**: Keep standalone Coin Box as fallback

**Risk 3: User Confusion**
- **Mitigation**: Clear onboarding flow
- **Backup**: Help documentation + support email

**Risk 4: Database Migration**
- **Mitigation**: Additive changes only (no breaking schema changes)
- **Backup**: Firestore backups tested and ready

---

## 📝 DOCUMENTATION REQUIREMENTS

### During Development:
- Update README.md with new features
- Document new API endpoints
- Add JSDoc comments to services
- Update environment variable examples

### Before Launch:
- User onboarding guide
- Admin manual
- API documentation
- Troubleshooting guide

---

## 🎯 LAUNCH CHECKLIST

### Pre-Launch (Day 7):

**Technical**:
- [ ] All Phase 2 tests passing
- [ ] No console errors in production
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Backup/restore tested

**Business**:
- [ ] Payment providers configured
- [ ] Email templates ready
- [ ] Support email set up
- [ ] Terms/Privacy policies live
- [ ] Pricing confirmed

**Infrastructure**:
- [ ] Environment variables set
- [ ] DNS configured
- [ ] SSL certificates valid
- [ ] Monitoring dashboards ready
- [ ] Error alerting configured

**Go/No-Go Decision**:
- All critical items ✅ → Launch
- Any critical item ❌ → Delay until fixed

---

## 📞 TEAM CONTACTS & RESPONSIBILITIES

**Development**: GitHub Copilot + Human oversight  
**Infrastructure**: Vercel (hosting), Firebase (backend), Upstash (rate limiting)  
**Monitoring**: Sentry (errors), Mixpanel (analytics)  
**Support**: [support@alliedimpact.com]

---

## 🔄 DOCUMENT MAINTENANCE

**This is the MASTER plan document.**

**Update this document when**:
- Phase completes
- Requirements change
- Architecture decisions made
- New risks identified

**Other documents**:
- COMPREHENSIVE_PLATFORM_ANALYSIS.md → Reference only (snapshot)
- ALIGNMENT_ANALYSIS_AND_PROPOSAL.md → Reference only (analysis)
- Phase-specific docs → Delete after completion, consolidate here

**Keep project clean**: ONE source of truth, no duplicates.

---

**Last Updated**: January 3, 2026  
**Next Review**: After Phase 2 completion  
**Status**: READY TO EXECUTE 🚀
