# 🛠️ Allied iMpact – Developer Guide

**Purpose**: Complete guide for development, adding apps, features, UI consistency, testing, deployment  
**Audience**: Developers, DevOps, product managers, contributors, AI assistants  
**Last Updated**: February 17, 2026  
**Status**: Authoritative development reference

---

## 📋 Table of Contents

1. [Getting Started](#1-getting-started)
2. [Adding a New App](#2-adding-a-new-app)
3. [Adding Features](#3-adding-features)
4. [UI Consistency & Design Tokens](#4-ui-consistency--design-tokens)
5. [PWA Implementation](#5-pwa-implementation)
6. [Testing](#6-testing)
7. [Deployment](#7-deployment)
8. [Anti-Patterns to Avoid](#8-anti-patterns-to-avoid)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Getting Started

### Prerequisites

**Required**:
- Node.js 18+ (`node --version`)
- pnpm 8+ (`pnpm --version`)
- Git (`git --version`)
- Firebase CLI (`firebase --version`)

**Recommended**:
- VS Code with ESLint extension
- Postfix for email testing (local development)

### Initial Setup

```powershell
# Clone repository
git clone https://github.com/alliedimpact/platform.git
cd platform

# Install dependencies (entire monorepo)
pnpm install

# Set up environment variables (each app)
cd apps/coinbox
cp .env.example .env.local
# Fill in Firebase config + Paystack keys
```

### Read First (Before Writing Code)

1. ✅ [docs/PLATFORM_ARCHITECTURE.md](PLATFORM_ARCHITECTURE.md) - Understand platform model
2. ✅ [docs/PRODUCTS_CATALOG.md](PRODUCTS_CATALOG.md) - See all apps and features
3. ✅ Study CoinBox (`apps/coinbox/`) - Reference implementation
4. ✅ Review security principles in PLATFORM_ARCHITECTURE
5. ✅ Check existing features (avoid duplication)

### Ask These Questions Before Coding

- **Does this already exist?** (Search codebase: `grep -r "feature-name"`)
- **Does this belong in platform or app?** (See [Decision Tree](#decision-tree-platform-or-app))
- **Does this create shared risk?** (Apps must be isolated)
- **Is this needed now?** (No speculative features)

---

## 2. Adding a New App

### 13-Step Process

#### Step 1: Plan

**Determine**:
- [ ] App name and purpose
- [ ] Category (Subscription / Project-Based / Internal)
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

#### Step 2: Set Up App Structure

```powershell
# From monorepo root
cd apps
mkdir my-new-app
cd my-new-app

# Initialize Next.js app
pnpm create next-app@latest . --typescript --tailwind --app

# Update package.json
# Set name to: "@allied-impact/my-new-app"
# Set version to: "0.1.0"
# Set private to: true
```

#### Step 3: Add to Monorepo

```yaml
# pnpm-workspace.yaml (should already include apps/*)
packages:
  - 'apps/*'
  - 'platform/*'
  - 'packages/*'
  - 'web/*'
```

```json
// apps/my-new-app/package.json dependencies
{
  "dependencies": {
    "@allied-impact/auth": "workspace:*",
    "@allied-impact/types": "workspace:*",
    "@allied-impact/entitlements": "workspace:*",
    "@allied-impact/config": "workspace:*",
    "@allied-impact/ui": "workspace:*"
  }
}
```

Run `pnpm install` from monorepo root.

#### Step 4: Configure Development Port

```json
// apps/my-new-app/package.json scripts
{
  "scripts": {
    "dev": "next dev -p 3011",  // Choose available port
    "build": "next build",
    "start": "next start -p 3011"
  }
}
```

**Ports Already Assigned**:
- 3000: CoinBox
- 3001: DriveMaster
- 3003: CareerBox
- 3005: Portal
- 3006: MyProjects
- 3007: EduTech
- 3008: SportsHub
- 3010: ControlHub

**Next Available**: 3002, 3004, 3009, 3011+

#### Step 5: Set Up Firebase Integration

```typescript
// apps/my-new-app/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

```bash
# .env.local (create from Firebase console)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mynewapp-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**Firebase Project Strategy**:
- **High-risk data** (financial, personal): Separate Firebase project
- **Low-risk data** (preferences, progress): Can share `allied-impact-platform`

#### Step 6: Implement Platform Auth

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

#### Step 7: Implement Entitlement Check

```typescript
// apps/my-new-app/src/lib/entitlements.ts
import { hasEntitlement } from '@allied-impact/entitlements';

export async function checkAppAccess(userId: string): Promise<boolean> {
  return await hasEntitlement(userId, 'my-new-app');
}

// In app entry point (layout.tsx or page.tsx)
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

#### Step 8: Define Firestore Collections

```typescript
// apps/my-new-app/src/lib/firestore.ts
import { collection, CollectionReference } from 'firebase/firestore';
import { db } from '@/config/firebase';

// ✅ ALWAYS namespace collections with app prefix
export const collectionsRef = {
  items: collection(db, 'mynewapp_items') as CollectionReference<Item>,
  users: collection(db, 'mynewapp_users') as CollectionReference<AppUser>,
  settings: collection(db, 'mynewapp_settings') as CollectionReference<Settings>
};

// Naming Convention: {appname}_{entity}
// ✅ Good: mynewapp_items, mynewapp_users
// ❌ Bad: items, users (no prefix - conflicts!)
```

#### Step 9: Write Firestore Security Rules

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
    
    function hasValidData() {
      return request.resource.data.keys().hasAll(['userId', 'createdAt']);
    }
    
    // My New App collections
    match /mynewapp_items/{itemId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                      isOwner(request.resource.data.userId) &&
                      hasValidData();
      allow update: if isAuthenticated() && 
                      isOwner(resource.data.userId);
      allow delete: if isAuthenticated() && 
                      isOwner(resource.data.userId);
    }
    
    match /mynewapp_users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if isAuthenticated() && isOwner(userId);
    }
  }
}
```

**Critical Security Rules**:
- ✅ Always check `request.auth != null`
- ✅ Validate data fields (`hasAll`, `hasOnly`)
- ✅ Enforce ownership (`request.auth.uid == userId`)
- ✅ Never allow blanket writes: `allow write: if true;` ❌

Deploy rules:
```powershell
cd apps/my-new-app
firebase deploy --only firestore:rules
```

#### Step 10: Apply Design Tokens

```typescript
// apps/my-new-app/tailwind.config.ts
import { generateTailwindConfig } from '@allied-impact/config/tailwind';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  ...generateTailwindConfig(), // ← Applies all platform design tokens
};
```

**What This Gives You**:
- ✅ Platform color scheme (primary blue/purple gradient)
- ✅ Typography system (Inter font, standardized sizes)
- ✅ Spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
- ✅ Shadow system (card, hover, elevation)
- ✅ Border radius (sm, md, lg, xl, 2xl, full)
- ✅ Animations (duration, easing, keyframes)

#### Step 11: Use Shared UI Components

```tsx
// apps/my-new-app/src/components/MyFeature.tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@allied-impact/ui';

export function MyFeature() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Feature description here</p>
        <Button variant="default">Primary Action</Button>
        <Button variant="outline">Secondary Action</Button>
      </CardContent>
    </Card>
  );
}
```

**Available Components** (from `@allied-impact/ui`):
- Button (default, outline, destructive, ghost, link)
- Card (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- Alert (alert, destructive)
- DropdownMenu (full menu system)
- PWAInstaller (install banner with 30s delay)
- ServiceWorkerRegistration (auto-registers in production)

#### Step 12: Create App README

```markdown
# 📱 My New App

**Status**: Development | Version 0.1.0  
**Category**: [Subscription/Project-Based/Internal]  
**Port**: 3011  
**Firebase Project**: mynewapp-xxxxx

## What It Does

[2-3 sentence description of app purpose]

## Key Features

- Feature 1 description
- Feature 2 description
- Feature 3 description

## Integration with Platform

- ✅ Uses platform auth (`@allied-impact/auth`)
- ✅ Checks entitlements (`my-new-app`)
- ✅ Isolated Firestore collections (`mynewapp_*`)
- ✅ Independent deployment
- ✅ Uses shared UI components
- ✅ Follows platform design tokens

## Running Locally

```powershell
cd apps/my-new-app
pnpm install
pnpm dev
# Open http://localhost:3011
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Deployment

**Hosting**: Vercel  
**URL**: mynewapp.alliedimpact.com  

Deploy command:
```powershell
vercel --prod
```

## Support

Contact: dev@alliedimpact.com
```

#### Step 13: Register in Platform & Portal

```typescript
// platform/shared/src/product-categories.ts (or wherever PRODUCTS is defined)
export const PRODUCTS: Record<string, ProductMetadata> = {
  // ... existing products
  
  'my-new-app': {
    id: 'my-new-app',
    name: 'My New App',
    description: 'Brief one-sentence description',
    category: ProductCategory.SUBSCRIPTION,
    icon: '📱', // Choose appropriate emoji
    url: process.env.NODE_ENV === 'production' 
      ? 'https://mynewapp.alliedimpact.com' 
      : 'http://localhost:3011',
    status: 'beta',
    subscription: {
      tiers: [
        {
          id: 'basic',
          name: 'Basic',
          price: 99,
          currency: 'ZAR',
          features: ['Feature 1', 'Feature 2', 'Feature 3']
        }
      ],
      billingCycle: 'monthly'
    }
  }
};
```

**Dashboard Auto-Discovery**:
Portal dashboard will automatically show app if:
- ✅ User is authenticated
- ✅ User has entitlement for `my-new-app`
- ✅ App is registered in `PRODUCTS`

### Testing Checklist

- [ ] User can log in (SSO from Portal)
- [ ] Entitlement check works (blocks if no access)
- [ ] App loads if user has access
- [ ] Subscription page shown if no access
- [ ] App functions correctly
- [ ] Navigation back to Portal dashboard works
- [ ] Firestore rules prevent unauthorized access
- [ ] Design matches CoinBox visual standard

### Deployment

```powershell
# 1. Deploy to Vercel
cd apps/my-new-app
vercel --prod

# 2. Set environment variables in Vercel dashboard
# (Firebase config + any API keys)

# 3. Deploy Firestore rules
firebase deploy --only firestore:rules

# 4. Add custom domain in Vercel: mynewapp.alliedimpact.com

# 5. Test production deployment
```

---

## 3. Adding Features

### Decision Tree: Platform or App?

```
Is this feature about identity/access control?
├─ YES → Add to PLATFORM (platform/auth or platform/entitlements)
└─ NO
    ├─ Is this a UI component shared by 3+ apps?
    │   ├─ YES → Add to PLATFORM (packages/ui)
    │   └─ NO
    │       ├─ Is this specific to one app's business logic?
    │       │   ├─ YES → Add to APP ✅
    │       │   └─ NO → Add to shared package (packages/*)
```

### Examples

| Feature | Goes In | Reason |
|---------|---------|--------|
| New login method (Google SSO) | `platform/auth` | Identity/access |
| Loan interest calculator | `apps/coinbox` | App-specific business logic |
| Shared button component | `packages/ui` | Reusable UI (already there) |
| Milestone dependencies graph | `apps/myprojects` | App-specific feature |
| Cross-app notification system | `platform/notifications` | Platform-level service |
| Crypto price API integration | `apps/coinbox` | App-specific data source |
| Date formatter utility | `packages/utils` | Shared utility function |

### Feature Development Process

1. **Check if it exists**: 
   ```powershell
   # Search codebase
   grep -r "feature-name" apps/ platform/ packages/
   ```

2. **Document**: Write feature spec (what, why, how)

3. **Get approval**: Discuss with team (for non-trivial changes)

4. **Write tests first** (TDD):
   ```typescript
   // apps/coinbox/tests/features/myloan-calculator.test.ts
   describe('Loan Calculator', () => {
     it('calculates monthly payment correctly', () => {
       expect(calculateMonthly(10000, 0.10, 12)).toBe(879.16);
     });
   });
   ```

5. **Implement**: Follow coding standards

6. **Update README**: Document in app's README.md

7. **Test**: Manual + automated

8. **Deploy**: Staging → Production

---

## 4. UI Consistency & Design Tokens

### Design Token System (January 2026)

All apps use centralized design tokens from `@allied-impact/config`:

```typescript
// Automatically applied via Tailwind config
import { generateTailwindConfig } from '@allied-impact/config/tailwind';
```

### Design Tokens Included

**Colors**:
- Primary: Blue (#3B82F6) to Purple (#8B5CF6) gradient
- Accent: Complementary colors
- Neutral: Gray scale with proper contrast
- Status: Success, warning, error, info

**Typography**:
- Font Family: Inter (sans-serif)
- Font Sizes: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl
- Font Weights: 300-800
- Line Heights: Optimized for readability

**Spacing**:
- Scale: xs (0.5rem), sm (0.75rem), md (1rem), lg (1.5rem), xl (2rem), 2xl (3rem), 3xl (4rem)

**Shadows**:
- card: Subtle elevation for cards
- cardHover: Enhanced on hover
- sm, md, lg, xl: Elevation levels
- glow: Accent glow effect

**Border Radius**:
- sm: 0.25rem
- md: 0.375rem (default)
- lg: 0.5rem
- xl: 0.75rem
- 2xl: 1rem
- full: 9999px (circles)

**Animations**:
- Duration: fast (150ms), base (200ms), slow (300ms)
- Easing: Smooth cubic-bezier curves
- Keyframes: fadeIn, slideInUp, spin

**Gradients**:
- primary: Blue to purple
- secondary: Accent gradients

**Z-Index Layers**:
- dropdown: 1000
- sticky: 1020
- fixed: 1030
- modalBackdrop: 1040
- modal: 1050
- popover: 1060
- tooltip: 1070

### Using Shared UI Components

```tsx
import { Button, Card } from '@allied-impact/ui';

// Buttons
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="link">Link Style</Button>

// Cards
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

### ESLint Architectural Boundaries

```javascript
// Enforced via @allied-impact/config/eslint-preset

// ❌ FORBIDDEN:
import { UserService } from 'apps/coinbox/services'; // Cross-app import
import { auth } from '@allied-impact/auth'; // UI importing auth
import { db } from 'firebase/firestore'; // UI importing Firebase

// ✅ ALLOWED:
import { Button } from '@allied-impact/ui'; // Platform UI
import { formatCurrency } from '@allied-impact/utils'; // Platform utils
import { auth } from '@/config/firebase'; // App's own Firebase
```

### Creating Consistent Pages

**Standard Page Layout**:
```tsx
// apps/myapp/src/app/dashboard/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@allied-impact/ui';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Metric 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,234</p>
          </CardContent>
        </Card>
        
        {/* More cards */}
      </div>
    </div>
  );
}
```

---

## 5. PWA Implementation

### Overview

**Implementation Date**: February 17, 2026  
**Status**: All 8 apps PWA-ready

### Adding PWA Support to New Apps

#### Step 1: Use Shared PWA Components

```tsx
// apps/my-new-app/src/app/layout.tsx
import { ServiceWorkerRegistration } from '@allied-impact/ui';
import { PWAInstaller } from '@allied-impact/ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistration />
        <PWAInstaller appName="My New App" />
      </body>
    </html>
  );
}
```

#### Step 2: Create Web Manifest

```json
// apps/my-new-app/public/manifest.json
{
  "name": "My New App - Allied iMpact",
  "short_name": "My New App",
  "description": "App description here",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Step 3: Create Service Worker

```javascript
// apps/my-new-app/public/sw.js
const CACHE_NAME = 'mynewapp-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json'
];

// Install: Cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch: Network-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/offline');
        });
      })
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
```

#### Step 4: Create Offline Page

```tsx
// apps/my-new-app/public/offline.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - My New App</title>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #3B82F6, #8B5CF6);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { font-size: 1.125rem; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>You're Offline</h1>
    <p>Please check your internet connection and try again.</p>
  </div>
</body>
</html>
```

#### Step 5: Test PWA

**Chrome DevTools**:
1. Open DevTools → Application → Manifest
2. Verify manifest loads correctly
3. Check Service Workers → Verify registration
4. Lighthouse → Run PWA audit (should score 90+)

**Manual Test**:
- Android/Desktop: Wait 30s for install banner
- iOS: Share → Add to Home Screen
- Verify app launches in standalone mode

### PWA Features Per Cache Strategy

**Network-First** (Portal, CareerBox, SportsHub, MyProjects, ControlHub):
- Always try network, fall back to cache
- Best for: Dynamic data that changes frequently

**Cache-First** (CoinBox custom, EduTech, DriveMaster):
- Serve from cache first, update cache in background
- Best for: Static content, course videos, learning journeys  

**Stale-While-Revalidate** (optional):
- Serve stale cache immediately, fetch update in background
- Best for: Performance + freshness balance

Choose strategy based on data freshness requirements.

---

## 6. Testing

### Testing Strategy

**Unit Tests**: Core business logic  
**Integration Tests**: API endpoints, Firebase operations  
**Manual Tests**: User flows, visual verification  

### Example: Jest + Testing Library (CoinBox Reference)

```typescript
// apps/coinbox/tests/unit/wallet.test.ts
import { calculateInterest } from '@/lib/wallet';

describe('Wallet Interest Calculation', () => {
  it('calculates monthly interest correctly', () => {
    const principal = 10000;
    const rate = 0.10; // 10%
    const months = 12;
    
    const interest = calculateInterest(principal, rate, months);
    
    expect(interest).toBe(1000);
  });
  
  it('returns 0 for zero principal', () => {
    expect(calculateInterest(0, 0.10, 12)).toBe(0);
  });
});
```

### Integration Test Example

```typescript
// apps/coinbox/tests/integration/api/wallet.test.ts
import { testApiHandler } from 'next-test-api-route-handler';
import * as walletHandler from '@/app/api/wallet/route';

describe('GET /api/wallet', () => {
  it('returns wallet balance for authenticated user', async () => {
    await testApiHandler({
      handler: walletHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            Authorization: 'Bearer mock-token-for-testing'
          }
        });
        
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.balance).toBeDefined();
      }
    });
  });
});
```

### Running Tests

```powershell
# Run all tests for an app
cd apps/coinbox
pnpm test

# Run specific test file
pnpm test wallet.test.ts

# Run tests in watch mode
pnpm test --watch

# Generate coverage report
pnpm test --coverage
```

### Test Coverage Goals

**CoinBox**: 385+ tests (80%+ coverage) ✅  
**Other Apps**: Manual testing + critical path unit tests

---

## 7. Deployment

### Vercel Deployment (Standard for All Apps)

#### Initial Setup

```powershell
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Link project (from app directory)
cd apps/my-new-app
vercel link
```

#### Deploy to Production

```powershell
cd apps/my-new-app
vercel --prod
```

#### Environment Variables (Vercel Dashboard)

Go to Vercel Dashboard → Project → Settings → Environment Variables

**Required for All Apps**:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**For CoinBox Additional**:
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` (pk_test_... or pk_live_...)
- `PAYSTACK_SECRET_KEY` (sk_test_... or sk_live_...)

#### Custom Domain Setup

1. Vercel Dashboard → Project → Settings → Domains
2. Add custom domain: `mynewapp.alliedimpact.com`
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### Firebase Deployment

```powershell
# Deploy Firestore rules
cd apps/my-new-app
firebase deploy --only firestore:rules

# Deploy Firebase Functions (if any)
firebase deploy --only functions

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Firestore rules deployed
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Test production URL
- [ ] Check error logs (Vercel dashboard)
- [ ] Verify auth flow works
- [ ] Test entitlement check
- [ ] Confirm PWA install works

---

## 8. Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Cross-App Database Access

```typescript
// ❌ WRONG: CoinBox reading MyProjects data
import { collection } from 'firebase/firestore';
const projectsRef = collection(db, 'myprojects_projects');
// DON'T: This creates tight coupling and shared risk
```

**Why Bad**: Creates dependencies, shared risk, tight coupling

**✅ Correct**: If apps need shared data, use platform-level collections or API

### ❌ Anti-Pattern 2: Duplicate Auth Logic

```typescript
// ❌ WRONG: Creating custom auth per app
export async function appSpecificLogin(email: string, password: string) {
  // Custom auth logic - DON'T DO THIS
}
```

**Why Bad**: Inconsistent UX, duplicate code, security risk

**✅ Correct**: Always use `@allied-impact/auth`

### ❌ Anti-Pattern 3: Firebase as Business Logic Authority

```typescript
// ❌ WRONG: Business rules only in Firestore rules
// firestore.rules
match /coinbox_loans/{loanId} {
  allow create: if request.resource.data.amount <= 10000; // Business rule
}
```

**Why Bad**: Logic hidden in security rules, hard to test

**✅ Correct**: Validate in application code, enforce in Firestore rules

```typescript
// ✅ Application code
export async function createLoan(amount: number) {
  if (amount > user.tier.loanLimit) {
    throw new Error('Loan amount exceeds tier limit');
  }
  // Create loan in Firestore
}

// ✅ Firestore rules (double-check)
allow create: if isAuthenticated();
```

### ❌ Anti-Pattern 4: Shared Mutable State

```typescript
// ❌ WRONG: Global state shared across apps
export const globalUser = { id: '123', name: 'John' };
```

**Why Bad**: State conflicts, unpredictable behavior

**✅ Correct**: Each app owns its state, uses platform for shared auth

### ❌ Anti-Pattern 5: Overriding Design Tokens

```typescript
// ❌ WRONG: Custom colors per app
// apps/myapp/tailwind.config.ts
export default {
  colors: {
    primary: '#FF0000' // Different from platform
  }
}
```

**Why Bad**: Inconsistent UI, defeats shared design system

**✅ Correct**: Use platform tokens, extend if absolutely necessary

```typescript
// ✅ Correct
import { generateTailwindConfig } from '@allied-impact/config/tailwind';

export default {
  ...generateTailwindConfig(),
  // Only extend, don't replace
  extend: {
    colors: {
      'app-specific-accent': '#...'
    }
  }
}
```

### ❌ Anti-Pattern 6: No Collection Prefixing

```typescript
// ❌ WRONG: Generic collection names
const usersRef = collection(db, 'users'); // Which app's users?
const itemsRef = collection(db, 'items'); // Conflicts with other apps
```

**Why Bad**: Namespace collisions, data leaks

**✅ Correct**: Always prefix with app name

```typescript
// ✅ Correct
const usersRef = collection(db, 'myapp_users');
const itemsRef = collection(db, 'myapp_items');
```

---

## 9. Troubleshooting

### Common Issues

#### "Firebase: Error (auth/unauthorized-domain)"

**Cause**: Domain not whitelisted in Firebase Console

**Fix**:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add: `localhost`, `mynewapp.alliedimpact.com`, `mynewapp.vercel.app`

#### "Entitlement check returns false but user has subscription"

**Cause**: Entitlement not created in `platform_entitlements` collection

**Fix**:
```typescript
// Manually add entitlement in Firebase Console or create script
await addDoc(collection(db, 'platform_entitlements'), {
  userId: 'user-id',
  productId: 'my-new-app',
  status: 'active',
  createdAt: serverTimestamp()
});
```

#### "Service worker not registering"

**Cause**: Only works in production or over HTTPS

**Fix**:
- Development: Use `localhost` (automatically HTTPS)
- Production: Ensure SSL certificate active

#### "PWA install banner not showing"

**Cause**: Multiple reasons (engagement heuristics, already installed)

**Fix**:
- Wait 30 seconds after page load
- Check manifest.json loads (DevTools → Application → Manifest)
- Verify service worker registered (DevTools → Application → Service Workers)
- Chrome only shows if user hasn't dismissed recently (7-day cooldown)

#### "Tailwind classes not applying"

**Cause**: Purge configuration missing app paths

**Fix**:
```typescript
// tailwind.config.ts
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // ← Ensure this matches your structure
    './app/**/*.{js,ts,jsx,tsx}', // If using app directory
  ],
  ...generateTailwindConfig()
}
```

#### "ESLint complains about cross-app imports"

**Cause**: Architectural boundary rules enforcing isolation

**Fix**: Don't import from other apps. Use platform packages instead:
```typescript
// ❌ Don't
import { util } from 'apps/coinbox/utils';

// ✅ Do
import { util } from '@allied-impact/utils';
```

#### Firebase quota exceeded

**Cause**: Free tier limits (50K reads/day, 20K writes/day)

**Fix**:
- Upgrade to Blaze plan (pay-as-you-go)
- Optimize queries (use indexes, limit results)
- Cache frequently read data client-side

---

## 10. Quick Reference

### Essential Commands

```powershell
# Install dependencies (monorepo root)
pnpm install

# Run app locally
cd apps/my-app
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Deploy to Vercel
vercel --prod

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Check for errors
pnpm lint
```

### File Structure Template

```
apps/my-new-app/
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker
│   ├── offline.html        # Offline fallback
│   ├── icon-192.png        # PWA icon
│   └── icon-512.png        # PWA icon
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout (PWA components here)
│   │   ├── page.tsx        # Homepage
│   │   └── dashboard/      # Feature pages
│   ├── components/         # React components
│   ├── lib/                # Utilities, helpers
│   │   ├── auth.ts         # Auth integration
│   │   ├── entitlements.ts # Entitlement checks
│   │   └── firestore.ts    # Firestore collections
│   └── config/
│       └── firebase.ts     # Firebase initialization
├── config/
│   └── firebase.ts         # Alternative location
├── tests/                  # Test files
│   ├── unit/
│   └── integration/
├── firestore.rules         # Firestore security rules
├── .env.local              # Environment variables (not committed)
├── .env.example            # Template for .env.local
├── tailwind.config.ts      # Tailwind config (uses platform tokens)
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── README.md               # App documentation
```

### Platform Packages

| Package | Purpose | Import |
|---------|---------|--------|
| `@allied-impact/auth` | Authentication | `import { useAuth } from '@allied-impact/auth'` |
| `@allied-impact/entitlements` | Access control | `import { hasEntitlement } from '@allied-impact/entitlements'` |
| `@allied-impact/ui` | Shared components | `import { Button } from '@allied-impact/ui'` |
| `@allied-impact/config` | Design tokens | `import { generateTailwindConfig } from '@allied-impact/config/tailwind'` |
| `@allied-impact/types` | TypeScript types | `import type { User } from '@allied-impact/types'` |
| `@allied-impact/utils` | Utilities | `import { formatCurrency } from '@allied-impact/utils'` |

---

**Last Updated**: February 17, 2026  
**Status**: Complete  
**Next Review**: March 2026 (post-launch)
