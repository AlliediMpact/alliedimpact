# Allied iMpact Homepage

Marketing homepage and authentication entry point for the Allied iMpact platform.

## Overview

This is the main landing page at `alliedimpact.com` that provides:
- Product showcase and information
- User authentication (login/signup/password reset)
- Session management with cross-subdomain SSO
- Routing to dashboard after authentication

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Authentication**: Firebase Auth (client) + Firebase Admin SDK (server)
- **Platform Services**:
  - `@allied-impact/auth` - Authentication & session management
  - `@allied-impact/entitlements` - Access control
  - `@allied-impact/billing` - Payment processing
  - `@allied-impact/types` - Shared TypeScript types
  - `@allied-impact/ui` - Shared UI components

## Getting Started

### 1. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your Firebase credentials in `.env.local`:

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side - keep secret!)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# App URLs
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001
NEXT_PUBLIC_HOMEPAGE_URL=http://localhost:3000
```

### 2. Install Dependencies

From the workspace root:

```bash
pnpm install
```

### 3. Run Development Server

```bash
cd apps/alliedimpact-web
pnpm dev
```

The homepage will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
apps/alliedimpact-web/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes
│   │   └── auth/             
│   │       └── session/       # Session cookie management
│   ├── lib/                   # Shared utilities
│   │   └── auth-context.tsx   # React auth context
│   ├── login/                 # Login page
│   ├── signup/                # Signup page
│   ├── reset-password/        # Password reset page
│   ├── layout.tsx             # Root layout with AuthProvider
│   └── page.tsx               # Homepage
├── components/                 # React components
├── .env.example               # Environment variable template
└── package.json
```

## Key Features

### Authentication Flow

1. **Login** ([app/login/page.tsx](app/login/page.tsx))
   - Email/password authentication
   - Integration with platform auth service
   - Session cookie creation
   - Redirect to dashboard after login

2. **Signup** ([app/signup/page.tsx](app/signup/page.tsx))
   - User registration with validation
   - Password strength requirements
   - Automatic session creation
   - Redirect to dashboard after signup

3. **Password Reset** ([app/reset-password/page.tsx](app/reset-password/page.tsx))
   - Email-based password reset
   - Firebase password reset flow

### Session Management

- **Cross-subdomain SSO**: Session cookies use `.alliedimpact.com` domain
- **Session API**: [app/api/auth/session/route.ts](app/api/auth/session/route.ts)
  - `POST /api/auth/session` - Create session from ID token
  - `DELETE /api/auth/session` - Clear session on logout

### Auth Context

The `AuthProvider` ([app/lib/auth-context.tsx](app/lib/auth-context.tsx)) provides:
- `user` - Current authenticated user
- `loading` - Authentication state loading indicator
- `signIn(email, password)` - Login function
- `signUp(email, password, displayName)` - Signup function
- `signOut()` - Logout function
- `resetPassword(email)` - Password reset function

All pages that need auth can use the `useAuth()` hook:

```typescript
import { useAuth } from '../lib/auth-context';

export default function MyPage() {
  const { user, loading, signIn } = useAuth();
  
  // Your component logic
}
```

## Authentication Integration

### Wrapping Your App

The root layout ([app/layout.tsx](app/layout.tsx)) wraps all pages with `AuthProvider`:

```typescript
import { AuthProvider } from './lib/auth-context';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### Protected Routes

To protect a page, check auth state:

```typescript
'use client';

import { useAuth } from '../lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content</div>;
}
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with:
   - **Root Directory**: `apps/alliedimpact-web`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `cd ../.. && pnpm install`

### Custom Domain

Set up your domain to point to:
- `alliedimpact.com` → This homepage
- `dashboard.alliedimpact.com` → Dashboard app (Phase 2)
- `coinbox.alliedimpact.com` → Coin Box app (Phase 3)

## Testing

```bash
# Run tests
pnpm test

# Run E2E tests with Playwright
pnpm test:e2e
```

## Related Packages

- [`platform/auth`](../../platform/auth) - Authentication service
- [`platform/entitlements`](../../platform/entitlements) - Access control
- [`platform/billing`](../../platform/billing) - Payment processing
- [`packages/ui`](../../packages/ui) - Shared UI components
- [`packages/types`](../../packages/types) - TypeScript types

## Next Steps

After completing the homepage:

1. **Phase 2**: Build dashboard app ([apps/alliedimpact-dashboard](../alliedimpact-dashboard))
2. **Phase 3**: Integrate Coin Box with platform services
3. **Phase 4**: Add more products (Drive Master, CodeTech, etc.)

## Support

For issues or questions:
- Check the [platform documentation](../../docs/PLATFORM_AND_PRODUCTS.md)
- Review the [conversation summary](../../CONVERSATION_SUMMARY.md)
- Contact the platform team
