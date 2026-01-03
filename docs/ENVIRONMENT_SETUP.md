# Environment Variables Setup

## Required Environment Variables

### Firebase Configuration
```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Payment Providers
```bash
# PayFast (South Africa)
PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key
PAYFAST_PASSPHRASE=your-passphrase
PAYFAST_SANDBOX=true # Set to false for production

# Stripe (International)
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_ for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Use pk_live_ for production
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Rate Limiting (Upstash Redis)
```bash
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### Error Tracking (Sentry)
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### Analytics (Mixpanel)
```bash
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
```

## Setup Instructions

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Go to Project Settings → Service Accounts
6. Generate new private key (download JSON)
7. Extract credentials from the JSON file
8. Add to `.env.local`

### 2. Upstash Redis Setup
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy REST URL and Token
4. Add to `.env.local`

### 3. Sentry Setup
1. Go to [Sentry.io](https://sentry.io/)
2. Create a new project (Next.js)
3. Copy the DSN from project settings
4. Create an auth token in Settings → Auth Tokens
5. Add to `.env.local`

### 4. Mixpanel Setup
1. Go to [Mixpanel](https://mixpanel.com/)
2. Create a new project
3. Go to Project Settings
4. Copy the Project Token
5. Add to `.env.local`

### 5. PayFast Setup (Optional - for South African payments)
1. Sign up at [PayFast](https://www.payfast.co.za/)
2. Complete merchant verification
3. Get merchant credentials from Settings
4. Start in sandbox mode (`PAYFAST_SANDBOX=true`)
5. Add credentials to `.env.local`

### 6. Stripe Setup (Optional - for international payments)
1. Sign up at [Stripe](https://stripe.com/)
2. Complete account setup
3. Get API keys from Developers → API Keys
4. Setup webhook endpoint
5. Add credentials to `.env.local`

## Environment Files

Create these files in each app directory:

### `.env.local` (Local Development)
Copy all variables from `.env.example` and fill in actual values. This file is gitignored and should never be committed.

### `.env.production` (Production)
Set these in your hosting provider (Vercel, Railway, etc.). Never commit this file.

## Testing Configuration

To verify your environment setup:

```bash
# Check if all required variables are set
pnpm run check:env

# Test Firebase connection
pnpm run test:firebase

# Test rate limiting
pnpm run test:ratelimit

# Test analytics
pnpm run test:analytics
```

## Security Notes

1. **Never commit** `.env.local` or `.env.production` files
2. **Rotate keys regularly** - especially for production
3. **Use different credentials** for development and production
4. **Enable Firestore Security Rules** before going live
5. **Set up CORS** properly for your domains
6. **Use HTTPS** in production (enforced by default on Vercel)
