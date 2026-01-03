# Allied iMpact Dashboard

Central control center for managing all Allied iMpact products and subscriptions.

## Overview

The dashboard app at `dashboard.alliedimpact.com` provides:
- **Product Access Hub**: View and launch all your Allied iMpact products
- **Subscription Management**: Manage active subscriptions and billing
- **Profile Settings**: Update your account information
- **Role-Based Access**: Admin features for platform management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Authentication**: Platform auth with session-based SSO
- **Platform Services**:
  - `@allied-impact/auth` - Authentication & middleware
  - `@allied-impact/entitlements` - Access control & caching
  - `@allied-impact/billing` - Subscription & payment management
  - `@allied-impact/types` - Shared TypeScript types
  - `@allied-impact/ui` - Shared UI components

## Key Features

### 🔐 Protected Routes

All routes are protected with Next.js middleware that:
- Verifies session cookies server-side
- Redirects unauthenticated users to homepage login
- Adds user context to request headers for API routes
- Supports role-based access control

### 🎯 Product Grid

Visual dashboard showing all Allied iMpact products:
- **Coin Box**: P2P financial platform
- **Drive Master**: Driving school management
- **CodeTech**: Programming education
- **Umkhanyakude**: Community services

Each product card shows:
- Access status (active/pending/expired/locked)
- Subscription details
- Quick launch button for active subscriptions
- Upgrade/subscribe options

### 📊 User Context

The `DashboardProvider` manages:
- Current user authentication state
- Platform user data (profile, roles)
- Product entitlements (cached for performance)
- Sign out functionality
- Entitlement refresh

### 🚀 Smart Routing

- **From Homepage**: Users automatically land here after login
- **To Products**: One-click launch to active products with SSO
- **Session Management**: Seamless cross-subdomain authentication

## Getting Started

### 1. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Configure your Firebase credentials and app URLs:

```env
# Firebase (same as homepage)
NEXT_PUBLIC_FIREBASE_API_KEY=...
FIREBASE_SERVICE_ACCOUNT_KEY=...

# App URLs
NEXT_PUBLIC_HOMEPAGE_URL=http://localhost:3000
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001
NEXT_PUBLIC_COINBOX_URL=http://localhost:3002
```

### 2. Install Dependencies

From the workspace root:

```bash
pnpm install
```

### 3. Run Development Server

```bash
cd apps/alliedimpact-dashboard
pnpm dev
```

The dashboard will be available at [http://localhost:3001](http://localhost:3001)

## Project Structure

```
apps/alliedimpact-dashboard/
├── app/
│   ├── api/
│   │   ├── auth/session/      # Session management
│   │   └── health/             # Health check endpoint
│   ├── components/
│   │   ├── DashboardNav.tsx    # Navigation bar
│   │   └── ProductGrid.tsx     # Product cards grid
│   ├── lib/
│   │   └── dashboard-context.tsx # Dashboard state management
│   ├── subscriptions/          # (Phase 2.4)
│   ├── profile/                # (Phase 2.5)
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main dashboard
│   └── globals.css             # Global styles
├── middleware.ts               # Auth middleware
├── .env.example                # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Middleware Protection

The [middleware.ts](middleware.ts) file protects all routes:

```typescript
// Public paths (no auth required)
const publicPaths = ['/api/health'];

// All other paths require valid session
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)).*)',
};
```

**Authentication Flow**:
1. Check for session cookie
2. Verify cookie with Firebase Admin SDK
3. If valid, add user context to headers and continue
4. If invalid/missing, redirect to homepage login with returnUrl

## Dashboard Context

Access user state in any component:

```typescript
import { useDashboard } from '../lib/dashboard-context';

function MyComponent() {
  const { user, platformUser, entitlements, signOut, refreshEntitlements } = useDashboard();
  
  // Check if user has access to a product
  const hasCoinBoxAccess = entitlements.find(
    e => e.productId === 'coinbox' && e.status === 'active'
  );
  
  return (
    <div>
      <p>Welcome, {platformUser?.displayName}!</p>
      {hasCoinBoxAccess && <button onClick={() => launchCoinBox()}>Launch Coin Box</button>}
    </div>
  );
}
```

## Product Configuration

Products are configured in [app/components/ProductGrid.tsx](app/components/ProductGrid.tsx):

```typescript
const PRODUCTS = [
  {
    id: 'coinbox',
    name: 'Coin Box',
    description: 'P2P financial platform...',
    icon: Wallet,
    url: process.env.NEXT_PUBLIC_COINBOX_URL,
    color: 'from-green-500 to-emerald-600',
  },
  // Add more products here
];
```

To add a new product:
1. Add product entry to PRODUCTS array
2. Update .env.example with product URL
3. Ensure product ID matches entitlements in Firestore

## API Routes

### Session Management

**DELETE /api/auth/session**
- Clears session cookie on logout
- Returns: `{ success: true }`

### Health Check

**GET /api/health**
- Public endpoint for monitoring
- Returns: `{ status: 'ok', service: 'allied-impact-dashboard', timestamp }`

## Phase 2 Roadmap

### Current Status: Phase 2.3 ✅
- [x] Dashboard structure
- [x] Authentication middleware
- [x] Product grid with entitlements
- [x] Navigation & layout

### Next: Phase 2.4 ⏳
**Subscription Management Page**
- View active subscriptions
- Payment history
- Upgrade/downgrade options
- Cancel subscriptions
- Integration with billing service

### Phase 2.5 ⏳
**Profile Management**
- Edit display name, email
- Change password
- Account settings
- Notification preferences

### Phase 2.6 ⏳
**Admin Features** (role-based)
- User management
- Platform analytics
- System health monitoring
- Subscription approvals

## Testing

The dashboard can be tested locally:

1. Start homepage on port 3000
2. Start dashboard on port 3001
3. Login via homepage
4. Verify redirect to dashboard
5. Check product access based on entitlements

**Test Accounts**:
- Create test users via homepage signup
- Manually grant entitlements in Firestore for testing:
  ```javascript
  // Firestore Console
  collection: product_entitlements
  document: {
    userId: 'test-user-id',
    productId: 'coinbox',
    status: 'active',
    subscriptionId: 'test-sub-1',
    startDate: '2026-01-01',
    // ... other fields
  }
  ```

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set **Root Directory**: `apps/alliedimpact-dashboard`
3. Configure environment variables
4. Deploy with:
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `cd ../.. && pnpm install`

### Custom Domain

Configure DNS:
```
dashboard.alliedimpact.com → Vercel deployment
```

Ensure session cookie domain is `.alliedimpact.com` for SSO.

## Security

- ✅ All routes protected by middleware
- ✅ Session verification on every request
- ✅ Server-side Firebase Admin SDK
- ✅ HTTPS required in production
- ✅ Secure session cookies (httpOnly, secure, sameSite)
- ✅ No sensitive data in client code

## Performance

- **Entitlement Caching**: LRU cache (5min TTL) reduces Firestore reads
- **Static Optimization**: Next.js auto-optimizes static assets
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component

## Related Packages

- [platform/auth](../../platform/auth) - Authentication service
- [platform/entitlements](../../platform/entitlements) - Access control
- [platform/billing](../../platform/billing) - Payment processing
- [apps/alliedimpact-web](../alliedimpact-web) - Homepage & login

## Troubleshooting

**Issue**: Redirect loop to login
- **Cause**: Session cookie not set or expired
- **Fix**: Check Firebase Admin SDK initialization, verify session cookie domain

**Issue**: Products not showing access status
- **Cause**: Entitlements not loaded
- **Fix**: Check Firestore `product_entitlements` collection, verify userId matches

**Issue**: Can't launch product
- **Cause**: Product URL not configured or entitlement inactive
- **Fix**: Check .env.local product URLs, verify entitlement status

## Support

For issues:
- Check [Phase 2 Completion Report](../../docs/PHASE_2_COMPLETION.md)
- Review [Platform Documentation](../../docs/PLATFORM_AND_PRODUCTS.md)
- Contact platform team

---

**Built with ❤️ by the Allied iMpact Team**
