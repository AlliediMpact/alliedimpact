# Environment Variables Documentation

Complete guide to configuring environment variables for SportsHub.

## Quick Start

1. Copy `.env.example` to `.env.local`
2. Fill in Firebase configuration from Firebase Console
3. Add reCAPTCHA keys
4. Run `pnpm dev`

## Required Variables

See [.env.example](./.env.example) for full configuration template.

### Firebase (Required)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### reCAPTCHA (Required)
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Public site key
- `RECAPTCHA_SECRET_KEY` - Secret key (server-side only)

### App Configuration (Required)
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_APP_ENV` - Environment (development/staging/production)

## Optional Variables

### Sentry Error Tracking (Recommended)
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN
- `SENTRY_ORG` - Sentry organization slug
- `SENTRY_PROJECT` - Sentry project slug
- `SENTRY_AUTH_TOKEN` - Sentry auth token for source maps

**Setup:** Create account at [sentry.io](https://sentry.io), create Next.js project, copy DSN.

### Firebase Admin (Server-side)
- `FIREBASE_ADMIN_SERVICE_ACCOUNT` - Service account JSON (single-line string)

## Environment-Specific Configuration

### Development (`.env.local`)
```bash
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Staging (`.env.staging`)
```bash
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_APP_URL=https://sportshub-staging.vercel.app
```

### Production (Vercel)
Set in Vercel Dashboard → Project Settings → Environment Variables
```bash
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://sportshub.co.za
```

## Security

- ✅ Never commit `.env.local` or `.env.production`
- ✅ Use `NEXT_PUBLIC_` prefix for client-side variables only
- ✅ Mark sensitive variables as encrypted in Vercel
- ✅ Rotate secrets every 90 days
- ❌ Never log environment variables
- ❌ Never expose secret keys in client code

## Troubleshooting

**Variable not found:**
- Restart dev server after changing `.env.local`
- Check `NEXT_PUBLIC_` prefix for client-side access
- Clear cache: `rm -rf .next`

**Vercel deployment issues:**
- Verify variables set in Vercel dashboard
- Check correct environment (Production/Preview/Development)
- Redeploy after adding variables

For detailed setup instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
