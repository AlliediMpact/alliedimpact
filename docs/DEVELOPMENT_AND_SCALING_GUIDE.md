# 🚀 Allied iMpact – Development & Scaling Guide

**Purpose**: Comprehensive guide for adding new apps, features, and scaling the platform safely.

**Audience**: Developers, DevOps engineers, product managers, future contributors, AI assistants

**Status**: Authoritative development reference

---

## 1. Before You Start

### Read First

Before writing any code:
1. ✅ Read all 5 platform docs
2. ✅ Understand the Platform Model
3. ✅ Study Coin Box as reference
4. ✅ Review security principles
5. ✅ Check existing features (avoid duplication)

### Ask These Questions

- **Does this already exist?** (Check platform + all apps)
- **Does this belong in platform or app?** (See decision tree below)
- **Does this create shared risk?** (Apps must be isolated)
- **Is this needed now?** (No speculative features)

---

## 2. Adding a New App

### Step 1: Plan

**Determine**:
- [ ] App name and purpose
- [ ] Category (Subscription / Impact / Custom)
- [ ] Target users
- [ ] Revenue model (if applicable)
- [ ] Entitlement requirements
- [ ] Integration with platform

**Document**:
Create design doc with:
- Problem statement
- Target audience
- Key features
- Technical approach
- Timeline

### Step 2: Set Up App Structure

```bash
# From monorepo root
cd apps/
mkdir my-new-app
cd my-new-app

# Initialize Next.js app
pnpm create next-app@latest . --typescript --tailwind --app

# Update package.json
{
  "name": "@allied-impact/my-new-app",
  "version": "0.1.0",
  "private": true
}
```

### Step 3: Add to Monorepo

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'platform/*'
  - 'packages/*'
  - 'web/*'
```

```json
// apps/my-new-app/package.json
{
  "dependencies": {
    "@allied-impact/auth": "workspace:*",
    "@allied-impact/types": "workspace:*",
    "@allied-impact/entitlements": "workspace:*"
  }
}
```

### Step 4: Set Up Firebase Integration

```typescript
// apps/my-new-app/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

### Step 5: Implement Platform Auth

```typescript
// apps/my-new-app/src/lib/auth.ts
import { initializeAuth } from '@allied-impact/auth';
import { auth } from '@/config/firebase';

// Initialize platform auth
initializeAuth(auth);

// Protect routes
import { useAuth } from '@allied-impact/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
}
```

### Step 6: Implement Entitlement Check

```typescript
// apps/my-new-app/src/lib/entitlements.ts
import { hasEntitlement } from '@allied-impact/entitlements';

export async function checkAppAccess(userId: string): Promise<boolean> {
  return await hasEntitlement(userId, 'my-new-app');
}

// In app entry point
export default function App() {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    if (user) {
      checkAppAccess(user.uid).then(setHasAccess);
    }
  }, [user]);
  
  if (!hasAccess) {
    return <SubscriptionRequired appId="my-new-app" />;
  }
  
  return <AppContent />;
}
```

### Step 7: Define Firestore Collections

```typescript
// apps/my-new-app/src/lib/firestore.ts
import { collection, CollectionReference } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Namespace collections with app prefix
export const collectionsRef = {
  items: collection(db, 'mynewapp-items') as CollectionReference<Item>,
  users: collection(db, 'mynewapp-users') as CollectionReference<AppUser>,
  settings: collection(db, 'mynewapp-settings') as CollectionReference<Settings>
};

// Always prefix: {appname}-{entity}
// Never use: 'items', 'users' (no prefix)
```

### Step 8: Write Firestore Rules

```javascript
// apps/my-new-app/firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // My New App collections
    match /mynewapp-items/{itemId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                      isOwner(request.resource.data.userId);
      allow update: if isAuthenticated() && 
                      isOwner(resource.data.userId);
      allow delete: if isAuthenticated() && 
                      isOwner(resource.data.userId);
    }
  }
}
```

### Step 9: Create README

```markdown
# 📱 My New App

**Status**: Development | Version 0.1.0  
**Category**: [Subscription/Impact/Custom]

## What It Does

[Brief description]

## Key Features

- Feature 1
- Feature 2
- Feature 3

## Integration with Platform

- ✅ Uses platform auth
- ✅ Checks entitlements
- ✅ Isolated Firestore collections
- ✅ Independent deployment

## Running Locally

```bash
cd apps/my-new-app
pnpm install
pnpm dev
```

## Environment Variables

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

## Deployment

Deployed to: mynewapp.alliedimpact.com

## Support

Contact: dev@alliedimpact.com
```

### Step 10: Register App in Platform

```typescript
// platform/shared/src/product-categories.ts
export const PRODUCTS: Record<string, ProductMetadata> = {
  // ... existing products
  
  'my-new-app': {
    id: 'my-new-app',
    name: 'My New App',
    description: 'Brief description',
    category: ProductCategory.SUBSCRIPTION,
    icon: '📱',
    url: process.env.NODE_ENV === 'production' 
      ? 'https://mynewapp.alliedimpact.com' 
      : 'http://localhost:3005',
    status: 'beta',
    subscription: {
      tiers: [
        {
          id: 'basic',
          name: 'Basic',
          price: 99,
          currency: 'ZAR',
          features: ['Feature 1', 'Feature 2']
        }
      ],
      billingCycle: 'monthly'
    }
  }
};
```

### Step 11: Add to Dashboard

Dashboard will automatically show app if:
- ✅ User is authenticated
- ✅ User has entitlement for `my-new-app`
- ✅ App is registered in `PRODUCTS`

### Step 12: Test End-to-End

- [ ] User can log in
- [ ] Entitlement check works
- [ ] App loads if user has access
- [ ] Subscription page shown if no access
- [ ] App functions correctly
- [ ] Navigation back to dashboard works

### Step 13: Deploy

```bash
# Vercel deployment
cd apps/my-new-app
vercel --prod

# Set environment variables in Vercel dashboard
# Deploy Firestore rules
firebase deploy --only firestore:rules
```

---

## 3. Adding a Feature to Existing App

### Decision Tree: Platform or App?

```
Is this feature about identity/access?
├─ YES → Add to PLATFORM
└─ NO
    ├─ Is this shared by all apps?
    │   ├─ YES → Add to PLATFORM (shared package)
    │   └─ NO
    │       ├─ Is this specific to one app's business logic?
    │       │   ├─ YES → Add to APP ✅
    │       │   └─ NO → Reconsider architecture
```

### Examples

| Feature | Goes In | Reason |
|---------|---------|--------|
| New login method (Google SSO) | Platform | Identity |
| Loan interest calculator | Coin Box | App-specific business logic |
| Shared button component | Platform (packages/ui) | Reusable UI |
| Milestone dependencies | My Projects | App-specific feature |
| Notification system | Platform | Cross-app |
| Crypto price API | Coin Box | App-specific data source |

### Process

1. **Check if it exists**: Search codebase
2. **Document**: Write feature spec
3. **Get approval**: Discuss with team
4. **Write tests**: Unit + integration tests
5. **Implement**: Follow coding standards
6. **Document**: Update app README
7. **Test**: Manual + automated
8. **Deploy**: Staging → Production

---

## 4. Guardrails to Avoid Bad Patterns

### ❌ Anti-Pattern 1: Shared Database

```typescript
// ❌ WRONG: Coin Box reading My Projects data
import { collection } from 'firebase/firestore';

const projectsRef = collection(db, 'myprojects-projects');
// DON'T: Cross-app data access
```

**Why Bad**: Creates dependency, shared risk, tight coupling

**Correct Approach**: If apps need to share data, use platform-level collection or API

### ❌ Anti-Pattern 2: Duplicate Auth

```typescript
// ❌ WRONG: Creating new auth system per app
export async function appSpecificLogin(email: string, password: string) {
  // Custom auth logic
}
```

**Why Bad**: Inconsistent UX, duplicate code, security risk

**Correct Approach**: Always use `@allied-impact/auth`

### ❌ Anti-Pattern 3: Firebase as Business Authority

```javascript
// ❌ WRONG: Business logic in Firestore rules
match /loans/{loanId} {
  allow create: if request.resource.data.interest < calculateMaxInterest();
}
```

**Why Bad**: Rules are not a programming language, hard to test, vendor lock-in

**Correct Approach**: Validate in app, rules are defensive only

### ❌ Anti-Pattern 4: Modifying Coin Box

```typescript
// ❌ WRONG: Changing Coin Box core logic
// apps/coinbox/src/lib/loans.ts
export function calculateInterestRate() {
  // Modifying production financial logic
}
```

**Why Bad**: Financial risk, user trust, compliance issues

**Correct Approach**: Reference Coin Box, don't modify it

### ❌ Anti-Pattern 5: Speculative Features

```typescript
// ❌ WRONG: Building for future "what-ifs"
export function complexFeatureNobodyAskedFor() {
  // Lots of code for hypothetical scenario
}
```

**Why Bad**: Waste of time, technical debt, maintenance burden

**Correct Approach**: Build what's needed now, iterate based on feedback

---

## 5. Scaling Guidelines

### When to Scale

**Signs you need to scale**:
- Response times > 2 seconds
- Database queries > 100ms
- Error rate > 1%
- User complaints about slowness

**Don't optimize prematurely**: Wait for actual problems

### Scaling the Platform

#### Auth Service
```
Current: Firebase Auth (handles 10M+ users)
Bottleneck: Custom user profile queries

Solution:
1. Cache frequently accessed profiles (Redis)
2. Denormalize common data
3. Use Firebase Auth custom claims for basic info
```

#### Entitlement Service
```
Current: Firestore query per check
Bottleneck: High read costs, latency

Solution:
1. Cache entitlements in memory (5min TTL)
2. Batch entitlement checks
3. Use Firebase Auth custom claims for basic entitlements
4. Consider dedicated entitlements DB for scale
```

#### Dashboard
```
Current: Server-side rendering per user
Bottleneck: Build times, memory usage

Solution:
1. Static site generation for public pages
2. Client-side rendering for authenticated pages
3. CDN caching for static assets
4. Code splitting for large components
```

### Scaling Individual Apps

#### Coin Box (High Traffic Example)
```
Bottlenecks:
- Wallet balance queries (frequent)
- Loan matching algorithm (complex)
- Crypto price API (external)

Solutions:
1. Cache wallet balances (Firestore + Redis)
2. Pre-compute loan matches (Cloud Function)
3. Cache crypto prices (update every 5min)
4. Use Firestore indexes for common queries
5. Implement read replicas for analytics
```

#### My Projects (Moderate Traffic Example)
```
Bottlenecks:
- Large project queries (all milestones + deliverables)
- Real-time updates (many listeners)

Solutions:
1. Pagination (load 20 items at a time)
2. Virtual scrolling for long lists
3. Limit real-time listeners (only active view)
4. Background sync for non-critical updates
```

### Database Scaling

#### Firestore Best Practices
```typescript
// ✅ GOOD: Indexed query
const loansQuery = query(
  collection(db, 'coinbox-loans'),
  where('status', '==', 'active'),
  orderBy('createdAt', 'desc'),
  limit(20)
);

// ❌ BAD: Non-indexed, fetches all
const allLoans = await getDocs(collection(db, 'coinbox-loans'));
const activeLoans = allLoans.docs.filter(doc => doc.data().status === 'active');
```

#### Firestore Indexes
```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "coinbox-loans",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "borrowerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Frontend Optimization

```typescript
// Code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Memoization
const expensiveCalculation = useMemo(() => {
  return complexFunction(data);
}, [data]);

// Virtualization for long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={1000}
  itemSize={50}
>
  {Row}
</FixedSizeList>
```

---

## 6. Code Quality Standards

### TypeScript

```typescript
// ✅ GOOD: Explicit types
interface User {
  uid: string;
  email: string;
  name: string;
  archetypes: UserArchetype[];
}

async function getUser(uid: string): Promise<User> {
  // Implementation
}

// ❌ BAD: Implicit any
async function getUser(uid) {
  // TypeScript can't help you here
}
```

### Error Handling

```typescript
// ✅ GOOD: Explicit error handling
try {
  await createLoan(data);
} catch (error) {
  if (error instanceof InsufficientFundsError) {
    toast.error('Insufficient funds');
  } else if (error instanceof LimitExceededError) {
    toast.error('Loan limit exceeded');
  } else {
    logError(error);
    toast.error('Something went wrong');
  }
}

// ❌ BAD: Silent failures
try {
  await createLoan(data);
} catch (error) {
  // Do nothing
}
```

### Testing

```typescript
// ✅ GOOD: Unit test critical logic
describe('calculateInterestRate', () => {
  it('returns correct rate for basic tier', () => {
    expect(calculateInterestRate(500, 30, 'basic')).toBe(0.10);
  });
  
  it('applies tier discount correctly', () => {
    expect(calculateInterestRate(500, 30, 'premier')).toBeLessThan(0.10);
  });
  
  it('handles edge cases', () => {
    expect(() => calculateInterestRate(-100, 30, 'basic')).toThrow();
  });
});

// ✅ GOOD: Integration test critical flows
describe('Loan Creation Flow', () => {
  it('creates loan and updates wallet', async () => {
    const loan = await createLoan({ amount: 500, duration: 30 });
    expect(loan.status).toBe('pending');
    
    const wallet = await getWallet(userId);
    expect(wallet.balance).toBe(initialBalance + 500);
  });
});
```

---

## 7. Git Workflow

### Branching Strategy

```
main                    # Production
├─ staging              # Staging environment
├─ feature/loan-calc   # New features
├─ fix/auth-bug        # Bug fixes
└─ hotfix/security     # Critical fixes
```

### Commit Messages

```bash
# ✅ GOOD: Semantic commits
feat(coinbox): add loan calculator
fix(auth): resolve token expiry bug
docs(readme): update installation steps
refactor(entitlements): simplify check logic
test(loans): add edge case tests

# ❌ BAD: Unclear commits
"updated stuff"
"fix"
"wip"
```

### Pull Request Process

1. **Create branch**: `feature/my-feature`
2. **Write code**: Follow standards
3. **Write tests**: Unit + integration
4. **Update docs**: README, inline comments
5. **Open PR**: Descriptive title + description
6. **Request review**: Tag relevant reviewer
7. **Address feedback**: Make changes
8. **Merge**: Squash and merge

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass
```

---

## 8. Rules for Future Contributors

### DOs ✅

1. **Read all documentation first**
2. **Follow existing patterns** (reference Coin Box)
3. **Use platform services** (auth, entitlements)
4. **Write tests** for business logic
5. **Document decisions** in code and README
6. **Ask questions** if unsure
7. **Review security checklist**
8. **Test locally** before pushing

### DON'Ts ❌

1. **Don't rewrite Coin Box or My Projects**
2. **Don't create new auth systems**
3. **Don't duplicate platform services**
4. **Don't share databases between apps**
5. **Don't put business logic in Firestore rules**
6. **Don't commit secrets** to git
7. **Don't bypass entitlement checks**
8. **Don't build speculative features**

---

## 9. Rules for AI Assistants (Copilot)

### Context Understanding

Before generating code:
1. ✅ Understand which app you're modifying
2. ✅ Check if feature exists in platform
3. ✅ Review existing patterns in that app
4. ✅ Verify security implications

### Code Generation

When writing code:
- ✅ Use TypeScript with explicit types
- ✅ Import from platform packages when appropriate
- ✅ Follow app's naming conventions
- ✅ Add error handling
- ✅ Include comments for complex logic
- ❌ Don't modify Coin Box production code
- ❌ Don't create cross-app dependencies
- ❌ Don't add Firebase business logic to rules

### Testing

After generating code:
- ✅ Suggest test cases
- ✅ Verify security best practices
- ✅ Check for performance implications
- ✅ Ensure TypeScript compiles

---

## 10. Deployment Checklist

Before deploying to production:

### Code Quality
- [ ] All tests passing
- [ ] TypeScript compiles without errors
- [ ] No console.errors or warnings
- [ ] Code reviewed and approved
- [ ] Documentation updated

### Security
- [ ] Environment variables set
- [ ] Secrets not in code
- [ ] Firestore rules tested
- [ ] Entitlement checks in place
- [ ] Rate limiting configured
- [ ] Audit logging for sensitive ops

### Performance
- [ ] Page load < 2 seconds
- [ ] API response < 500ms
- [ ] Database queries indexed
- [ ] Images optimized
- [ ] Code split where appropriate

### User Experience
- [ ] Mobile responsive
- [ ] Accessibility tested
- [ ] Error messages helpful
- [ ] Loading states implemented
- [ ] Empty states designed

### Monitoring
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Alerts set up
- [ ] Logs reviewed

---

## 11. Troubleshooting Common Issues

### Issue: "Auth not working"

```bash
# Check environment variables
echo $NEXT_PUBLIC_FIREBASE_API_KEY

# Verify Firebase config
# config/firebase.ts should have all values

# Check network tab
# Should see requests to identitytoolkit.googleapis.com
```

### Issue: "Entitlement check failing"

```typescript
// Debug entitlement
const entitlements = await getDocs(
  query(
    collection(db, 'entitlements'),
    where('userId', '==', userId),
    where('productId', '==', 'coinbox')
  )
);

console.log('Entitlements:', entitlements.docs.map(d => d.data()));

// Check:
// 1. Entitlement exists?
// 2. Not expired?
// 3. Correct productId?
```

### Issue: "Firestore rules deny access"

```javascript
// Check Firestore rules
// Go to Firebase Console → Firestore → Rules
// Test rules with Rules Playground

// Common fix: Add authentication check
function isAuthenticated() {
  return request.auth != null;
}
```

### Issue: "App not showing in dashboard"

```typescript
// Check product registry
// platform/shared/src/product-categories.ts
// App should be in PRODUCTS object

// Check entitlement
// User needs entitlement for app to appear

// Check app status
// status: 'active' (not 'coming-soon' or 'deprecated')
```

---

## 12. Performance Monitoring

### Metrics to Track

```typescript
// Page load time
performance.mark('page-load-start');
// ... page loads
performance.mark('page-load-end');
performance.measure('page-load', 'page-load-start', 'page-load-end');

// API latency
const start = Date.now();
await fetchData();
const latency = Date.now() - start;
logMetric('api-latency', latency);

// Error rate
const totalRequests = 1000;
const errors = 5;
const errorRate = (errors / totalRequests) * 100;  // 0.5%
```

### Alerting Thresholds

```
⚠️ Warning:
- Page load > 2 seconds
- API latency > 500ms
- Error rate > 1%

🚨 Critical:
- Page load > 5 seconds
- API latency > 2 seconds
- Error rate > 5%
- Auth service down
```

---

## 13. Support & Resources

### Documentation
- Platform docs (5 files in `/docs`)
- App-specific READMEs (in each app folder)
- Inline code comments

### Getting Help
- **Slack**: #allied-impact-dev
- **Email**: dev@alliedimpact.com
- **GitHub**: Open an issue

### Learning Resources
- Firebase docs: https://firebase.google.com/docs
- Next.js docs: https://nextjs.org/docs
- TypeScript handbook: https://www.typescriptlang.org/docs

---

**This guide is authoritative for all development decisions. Follow it to ensure consistency, security, and scalability.**

---

**Last Updated**: January 6, 2026  
**Contributors**: Allied iMpact Team  
**Version**: 2.0
