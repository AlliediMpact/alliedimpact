# Allied iMpact Portal - Deployment Guide

## Prerequisites

Before deploying, ensure you have:

- ✅ Firebase project created
- ✅ Firestore database initialized
- ✅ Environment variables configured
- ✅ All tests passing (`pnpm test`)
- ✅ Production build successful (`pnpm build`)

## Deployment Steps

### 1. Deploy Firestore Indexes

First, deploy the Firestore indexes to optimize queries:

```bash
cd web/portal
firebase deploy --only firestore:indexes
```

This will deploy the indexes defined in `firestore.indexes.json`.

**Verification:**
- Go to Firebase Console > Firestore > Indexes
- Confirm all 9 composite indexes are created
- Wait for indexing to complete (can take 5-30 minutes depending on data size)

### 2. Configure Environment Variables

#### For Vercel:

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add the following variables for **Production**:

```bash
# Required
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-production-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional but recommended
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_APP_URL=https://alliedimpact.co.za

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ACCESSIBILITY_MONITOR=false

# Rate limiting (if using Redis)
REDIS_URL=your_redis_connection_string
REDIS_TOKEN=your_redis_token
```

4. Click "Save"

### 3. Deploy to Vercel

#### Option A: Git-based Deployment (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

2. Vercel will automatically deploy when you push to `main` branch

3. Monitor deployment at https://vercel.com/your-project

#### Option B: Manual Deployment

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 4. Post-Deployment Verification

After deployment completes, verify:

#### ✅ Application Health
1. Visit your production URL
2. Check homepage loads correctly
3. Test authentication flow (login/signup)
4. Verify dashboard loads for authenticated users

#### ✅ Firebase Integration
1. Test user registration
2. Verify Firestore writes
3. Check Firebase Auth console for new users

#### ✅ Performance
1. Run Lighthouse audit
2. Check Core Web Vitals in production
3. Verify PWA installation works
4. Test offline mode

#### ✅ Security
1. Verify HTTPS is enforced
2. Check security headers are present
3. Test CSP (Content Security Policy)
4. Verify rate limiting is active

#### ✅ Analytics
1. Visit Google Analytics dashboard
2. Confirm events are being tracked
3. Check Web Vitals data is flowing

### 5. Set Up Redis (Optional but Recommended)

For production-grade rate limiting, set up Redis:

#### Using Upstash (Recommended)

1. Go to https://upstash.com
2. Create a new Redis database
3. Copy the REST URL and Token
4. Add to Vercel environment variables:
   - `REDIS_URL`: Your Upstash REST URL
   - `REDIS_TOKEN`: Your Upstash token

#### Update Rate Limiting Code

The middleware will automatically use Redis if environment variables are set.

### 6. Configure Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain: `alliedimpact.co.za`
3. Update DNS records as instructed by Vercel
4. Wait for DNS propagation (up to 48 hours)
5. Vercel will automatically provision SSL certificate

### 7. Set Up Monitoring

#### Vercel Analytics
- Already enabled automatically
- View at: https://vercel.com/your-project/analytics

#### Firebase Performance Monitoring
```bash
# Install Performance Monitoring
firebase init performance

# Update firebase.json
{
  "performance": {
    "enabled": true
  }
}
```

#### Error Tracking (Optional)
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Hotjar for user behavior

### 8. Continuous Deployment Setup

#### GitHub Actions (Already configured)
The `.github/workflows/ci.yml` runs on every push:
- Linting
- Type checking
- Unit tests
- Build verification

#### Vercel Integration
- Automatic deployments on push to `main`
- Preview deployments for pull requests
- Automatic rollback on failure

### 9. Backup Strategy

#### Firestore Backups
```bash
# Set up automated backups
gcloud firestore export gs://your-backup-bucket

# Schedule daily backups via Cloud Scheduler
gcloud scheduler jobs create app-engine backupFirestore \
  --schedule="0 2 * * *" \
  --target-service=default \
  --target-uri="/backup"
```

#### Database Snapshots
- Enable point-in-time recovery in Firebase console
- Set retention period to 7 days minimum

### 10. Performance Optimization

#### Enable Edge Caching
In `next.config.js`, ensure caching headers are set:
```javascript
async headers() {
  return [
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

#### Image Optimization
- Images are automatically optimized by Next.js
- Served in AVIF/WebP formats
- Responsive sizes generated

### Troubleshooting

#### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

#### Firestore Connection Issues
- Verify Firebase config in environment variables
- Check Firestore security rules
- Confirm project ID matches

#### Rate Limiting Not Working
- Verify Redis connection
- Check middleware is registered
- Review rate limit headers in network tab

#### Analytics Not Tracking
- Confirm GA_MEASUREMENT_ID is set
- Check ad blockers are disabled for testing
- Verify gtag script loads

## Deployment Checklist

- [ ] All tests passing
- [ ] Production build successful
- [ ] Environment variables configured
- [ ] Firestore indexes deployed
- [ ] Code pushed to main branch
- [ ] Vercel deployment successful
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Firebase integration verified
- [ ] Analytics tracking confirmed
- [ ] PWA installation tested
- [ ] Performance audit passed (Lighthouse > 90)
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Error monitoring set up
- [ ] Backup strategy implemented

## Rollback Procedure

If issues arise in production:

### Via Vercel Dashboard
1. Go to your project > Deployments
2. Find the last working deployment
3. Click "Promote to Production"

### Via CLI
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

## Support

For deployment issues:
- Vercel Support: https://vercel.com/support
- Firebase Support: https://firebase.google.com/support
- Project Documentation: `/docs`

---

**Last Updated:** January 9, 2026
**Version:** 1.0.0
