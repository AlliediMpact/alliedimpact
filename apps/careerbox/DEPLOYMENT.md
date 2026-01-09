# CareerBox Deployment Guide

## Prerequisites

- Node.js 18+ and pnpm
- Firebase project with Firestore enabled
- Vercel account (or alternative hosting)
- Domain name (optional)

## Environment Setup

### 1. Firebase Configuration

Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com):

1. Create new project or use existing Allied iMpact project
2. Enable Firestore Database
3. Enable Authentication (Email/Password and Google)
4. Copy Firebase config credentials

### 2. Environment Variables

Create `.env.production`:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Portal Integration
NEXT_PUBLIC_PORTAL_URL=https://portal.alliedimpact.com
NEXT_PUBLIC_PORTAL_API_URL=https://portal.alliedimpact.com/api

# Feature Flags
NEXT_PUBLIC_ENABLE_MATCHING=true
NEXT_PUBLIC_ENABLE_MESSAGING=true
NEXT_PUBLIC_ENABLE_MODERATION=true
NEXT_PUBLIC_DEV_MODE=false

# Redis (Optional - for caching)
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
```

## Build Process

### 1. Install Dependencies

```bash
cd apps/careerbox
pnpm install
```

### 2. Build Application

```bash
pnpm build
```

### 3. Test Production Build Locally

```bash
pnpm start
```

Visit `http://localhost:3006` to verify the build.

## Firestore Setup

### 1. Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

This will deploy the 11 composite indexes defined in `firestore.indexes.json`.

### 2. Configure Security Rules

Create `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }
    
    // Individual profiles
    match /careerbox_individuals/{uid} {
      allow read: if isAuthenticated();
      allow write: if isOwner(uid);
    }
    
    // Company profiles
    match /careerbox_companies/{uid} {
      allow read: if isAuthenticated();
      allow write: if isOwner(uid);
    }
    
    // Position listings
    match /careerbox_listings/{listingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        resource.data.companyUid == request.auth.uid;
    }
    
    // Matches
    match /careerbox_matches/{matchId} {
      allow read: if isAuthenticated() && (
        resource.data.individualUid == request.auth.uid ||
        resource.data.companyUid == request.auth.uid
      );
      allow write: if false; // Only server can create matches
    }
    
    // Messages
    match /careerbox_messages/{messageId} {
      allow read: if isAuthenticated() && (
        resource.data.senderUid == request.auth.uid ||
        resource.data.recipientUid == request.auth.uid
      );
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.senderUid;
      allow update, delete: if false; // Messages are immutable
    }
    
    // Conversations
    match /careerbox_conversations/{conversationId} {
      allow read: if isAuthenticated() && (
        resource.data.individualUid == request.auth.uid ||
        resource.data.companyUid == request.auth.uid
      );
      allow write: if false; // Only server can manage conversations
    }
    
    // Moderation (admin only)
    match /careerbox_moderation/{flagId} {
      allow read, write: if false; // Admin access only
    }
    
    // Placements (admin only)
    match /careerbox_placements/{placementId} {
      allow read: if isAuthenticated();
      allow write: if false; // Admin access only
    }
  }
}
```

Deploy security rules:

```bash
firebase deploy --only firestore:rules
```

## Vercel Deployment

### 1. Install Vercel CLI

```bash
pnpm add -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel --prod
```

### 4. Configure Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.production`
3. Redeploy after adding variables

### 5. Configure Domain (Optional)

1. Go to Project Settings → Domains
2. Add custom domain: `careerbox.alliedimpact.com`
3. Configure DNS records as instructed

## Portal Integration

### 1. Update Portal Configuration

Ensure CareerBox is added to `web/portal/src/config/products.ts` (already done).

### 2. Deploy Portal

```bash
cd web/portal
pnpm build
vercel --prod
```

### 3. Test Entitlements

1. Login to portal
2. Subscribe to CareerBox
3. Verify access to `http://localhost:3006/dashboard`

## Post-Deployment Checklist

- [ ] Verify Firebase connection
- [ ] Test authentication flow (email + Google)
- [ ] Create test individual profile
- [ ] Create test company profile
- [ ] Post test listing
- [ ] Verify matching algorithm runs
- [ ] Test messaging system
- [ ] Verify moderation flagging
- [ ] Test tier-based access controls
- [ ] Monitor Firestore usage and costs
- [ ] Set up error tracking (Sentry/etc)
- [ ] Configure analytics (Google Analytics)
- [ ] Set up uptime monitoring

## Monitoring

### Firestore Metrics

Monitor in Firebase Console:
- Read/Write operations
- Storage usage
- Index performance
- Security rule evaluations

### Application Metrics

- Page load times
- API response times
- User signups
- Match creation rate
- Message delivery rate
- Moderation flag rate

### Cost Optimization

- Enable Firestore caching
- Implement pagination for large queries
- Use Redis for frequently accessed data
- Optimize image sizes
- Enable CDN for static assets

## Troubleshooting

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

### Firebase Connection Issues

- Verify environment variables are set
- Check Firebase project settings
- Ensure Firestore is enabled
- Verify security rules allow access

### Matching Engine Not Running

- Check Firestore indexes are deployed
- Verify profile completion flags
- Check server logs for errors
- Ensure tier limits are configured correctly

### Message Delivery Issues

- Verify conversation creation
- Check Firestore security rules
- Ensure tier allows messaging
- Check monthly message limits

## Rollback Plan

If deployment fails:

1. Revert to previous Vercel deployment
2. Restore Firestore from backup
3. Check error logs and fix issues
4. Test locally before redeploying

## Support

For deployment issues, contact:
- Technical Lead: [technical@alliedimpact.com]
- DevOps Team: [devops@alliedimpact.com]
