# My Projects - Deployment Guide

**Version:** 1.0.0  
**Target:** Production  
**Platform:** Vercel + Firebase

---

## Deployment Overview

My Projects uses a **hybrid deployment strategy**:
- **Frontend + API Routes**: Vercel (Next.js hosting)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth

**Estimated Time:** 30-45 minutes (first-time setup)

---

## Prerequisites

### Required Accounts
- [ ] Firebase account (console.firebase.google.com)
- [ ] Vercel account (vercel.com)
- [ ] Domain registrar access (for myprojects.alliedimpact.com)

### Required Tools
- [ ] Node.js 18+ installed
- [ ] pnpm installed
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Git access to Allied iMpact monorepo

---

## Phase 1: Firebase Project Setup

### Step 1: Create Firebase Project

```bash
# Login to Firebase CLI
firebase login

# Initialize Firebase (if not already done)
cd apps/myprojects
firebase init
```

**Firebase Console Setup:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select existing Allied iMpact project
3. Name: "Allied iMpact - My Projects" (or use shared project)
4. Enable Google Analytics (recommended)
5. Click "Create project"

### Step 2: Enable Firebase Services

**Authentication:**
1. Navigate to **Authentication** → Get Started
2. Enable providers:
   - ✅ Email/Password
   - ✅ Google (configure OAuth consent screen)
   - ✅ GitHub (add OAuth app credentials)

**Firestore Database:**
1. Navigate to **Firestore Database** → Create Database
2. Select location: `us-central1` (or closest to users)
3. Start in **production mode** (rules deployed separately)
4. Click "Enable"

**Storage:**
1. Navigate to **Storage** → Get Started
2. Select location: Same as Firestore
3. Start in **production mode** (rules deployed separately)
4. Click "Done"

### Step 3: Get Firebase Configuration

1. Navigate to **Project Settings** (gear icon)
2. Scroll to "Your apps" → Click web icon (</>)
3. Register app: "My Projects Web"
4. Copy Firebase config object:

```javascript
{
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

### Step 4: Deploy Security Rules

**Firestore Rules:**
```bash
cd apps/myprojects
firebase deploy --only firestore:rules
```

**Storage Rules:**
```bash
firebase deploy --only storage
```

**Verify Deployment:**
1. Go to Firestore → Rules tab
2. Verify rules show `rules_version = '2';`
3. Check last updated timestamp

### Step 5: Create Firebase Service Account (Optional for API Routes)

1. Navigate to **Project Settings** → Service Accounts
2. Click "Generate new private key"
3. Save JSON file securely (DO NOT commit to Git)
4. Extract values for environment variables:
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY`

---

## Phase 2: Environment Configuration

### Step 1: Create Production Environment File

Create `apps/myprojects/.env.production`:

```env
# App Configuration
NEXT_PUBLIC_MYPROJECTS_URL=https://myprojects.alliedimpact.com
NEXT_PUBLIC_PLATFORM_URL=https://alliedimpact.com

# Firebase Configuration (from Step 3 above)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin SDK (optional, for API routes)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**⚠️ Security:** Never commit `.env.production` to Git. Add to `.gitignore`.

### Step 2: Local Environment for Testing

Create `apps/myprojects/.env.local`:

```env
# Use same values as .env.production but with localhost URLs
NEXT_PUBLIC_MYPROJECTS_URL=http://localhost:3006
NEXT_PUBLIC_PLATFORM_URL=http://localhost:3001

# Same Firebase config (can use same project or separate dev project)
NEXT_PUBLIC_FIREBASE_API_KEY=...
# ... rest of Firebase config
```

---

## Phase 3: Build & Deploy to Vercel

### Step 1: Build Production Bundle

```bash
cd apps/myprojects

# Install dependencies
pnpm install

# Build for production
pnpm build

# Test production build locally
pnpm start
```

**Verify locally at:** http://localhost:3006

### Step 2: Deploy to Vercel

**Option A: Via Vercel CLI (Recommended)**

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project or create new
# - Select scope (Allied iMpact team)
# - Confirm settings
```

**Option B: Via Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import Git repository (Allied iMpact monorepo)
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/myprojects`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter @allied-impact/myprojects build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

### Step 3: Configure Vercel Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

Add all variables from `.env.production`:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_MYPROJECTS_URL` | `https://myprojects.alliedimpact.com` | Production |
| `NEXT_PUBLIC_PLATFORM_URL` | `https://alliedimpact.com` | Production |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIza...` | Production |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Production |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `your-project-id` | Production |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | Production |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Production |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123456789:web:abc123` | Production |

**Optional (if using Firebase Admin in API routes):**
| Name | Value | Environment |
|------|-------|-------------|
| `FIREBASE_ADMIN_PROJECT_ID` | `your-project-id` | Production |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `firebase-adminsdk-xxxxx@...` | Production |
| `FIREBASE_ADMIN_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----...` | Production |

### Step 4: Trigger Deployment

```bash
# Via CLI
vercel --prod

# Or via Dashboard
# Push to main branch (if auto-deploy enabled)
git push origin main
```

**Monitor deployment:**
- Vercel Dashboard → Deployments
- Check build logs for errors
- Verify deployment status

---

## Phase 4: Custom Domain Setup

### Step 1: Add Domain to Vercel

1. Vercel Dashboard → Project → Settings → Domains
2. Click "Add"
3. Enter: `myprojects.alliedimpact.com`
4. Click "Add"

### Step 2: Configure DNS Records

**If DNS managed by Vercel:**
- Vercel will show nameservers
- Update at domain registrar

**If DNS managed externally (e.g., Cloudflare):**

Add CNAME record:
```
Type: CNAME
Name: myprojects
Value: cname.vercel-dns.com
TTL: Auto
Proxy: Disabled (if using Cloudflare, enable after SSL setup)
```

**Or A record (IPv4):**
```
Type: A
Name: myprojects
Value: 76.76.21.21 (Vercel IP)
TTL: Auto
```

### Step 3: Verify SSL Certificate

1. Wait 5-10 minutes for DNS propagation
2. Vercel automatically provisions SSL (Let's Encrypt)
3. Verify at: https://myprojects.alliedimpact.com
4. Check for HTTPS and valid certificate

### Step 4: Update Firebase Authorized Domains

1. Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains"
3. Add: `myprojects.alliedimpact.com`
4. Save

---

## Phase 5: Post-Deployment Verification

### Immediate Checks (< 15 minutes)

**Homepage:**
- [ ] Visit https://myprojects.alliedimpact.com
- [ ] Page loads without errors
- [ ] Logo and branding display correctly
- [ ] Navigation links work

**Authentication:**
- [ ] Click "Sign Up"
- [ ] Register with email/password
- [ ] Verify email (if enabled)
- [ ] Login with credentials
- [ ] Test Google OAuth
- [ ] Test GitHub OAuth
- [ ] Logout and login again

**Basic Functionality:**
- [ ] Create test project
- [ ] View project dashboard
- [ ] Create milestone
- [ ] Upload file (deliverable)
- [ ] Post comment
- [ ] Create support ticket
- [ ] Update user profile

**Performance:**
- [ ] Check page load times (< 2 seconds)
- [ ] Verify images load quickly
- [ ] Test mobile responsiveness
- [ ] Check console for errors (F12)

### Firebase Usage Monitoring

1. Firebase Console → Usage & Billing
2. Monitor:
   - Firestore reads/writes
   - Storage bandwidth
   - Authentication users
3. Set up budget alerts (recommended)

### Vercel Analytics

1. Vercel Dashboard → Project → Analytics
2. Monitor:
   - Page views
   - Response times
   - Error rates
3. Enable Vercel Analytics (optional, paid)

---

## Phase 6: Monitoring & Logging

### Firebase Crashlytics (Recommended)

```bash
# Install Firebase Crashlytics
pnpm add firebase
```

**Configure in `lib/firebase.ts`:**
```typescript
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Log errors to Firebase
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error });
  // Send to Firebase Crashlytics (future)
};
```

### Uptime Monitoring (Recommended)

**Option A: UptimeRobot (Free)**
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor:
   - Type: HTTPS
   - URL: https://myprojects.alliedimpact.com
   - Interval: 5 minutes
3. Add alert contacts (email, Slack)

**Option B: Vercel Monitoring (Built-in)**
- Automatic deployment notifications
- Error alerts via email

### Error Tracking (Future Enhancement)

**Sentry Integration:**
```bash
pnpm add @sentry/nextjs
```

Configure in `sentry.client.config.js` and `sentry.server.config.js`

---

## Troubleshooting

### Build Errors

**Error: "Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm build
```

**Error: "Environment variable not defined"**
- Verify all variables in Vercel Dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

### Authentication Errors

**Error: "Unauthorized domain"**
- Add domain to Firebase → Authentication → Authorized domains
- Wait 5 minutes for changes to propagate

**Error: "OAuth redirect URI mismatch"**
- Google: Add `https://your-project.firebaseapp.com/__/auth/handler` to authorized origins
- GitHub: Add callback URL to OAuth app settings

### Firestore Permission Errors

**Error: "Missing or insufficient permissions"**
```bash
# Redeploy Firestore rules
firebase deploy --only firestore:rules

# Verify rules in Firebase Console
# Check user is authenticated (request.auth != null)
```

### Performance Issues

**Slow page loads:**
- Check Vercel Analytics for bottlenecks
- Optimize images (use Next.js Image component)
- Enable Vercel Edge Caching
- Consider upgrading Vercel plan

**High Firebase costs:**
- Review Firestore queries (add indexes)
- Implement pagination (limit queries)
- Use real-time listeners sparingly
- Cache data on client side

---

## Rollback Procedure

**If deployment fails or critical bugs found:**

### Step 1: Rollback via Vercel

```bash
# List deployments
vercel list

# Rollback to previous deployment
vercel rollback <deployment-url>
```

**Or via Dashboard:**
1. Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### Step 2: Notify Users

- Update status page (if available)
- Send email notification (if critical)
- Post in support channels

### Step 3: Investigate Issue

- Check Vercel build logs
- Review Firebase error logs
- Check browser console errors
- Test locally with production data

---

## Deployment Checklist Summary

**Before Deployment:**
- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Firebase rules deployed
- [ ] Production build succeeds
- [ ] No console errors

**During Deployment:**
- [ ] Vercel build completes successfully
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Firebase authorized domains updated

**After Deployment:**
- [ ] Homepage loads correctly
- [ ] Authentication works
- [ ] Basic functionality verified
- [ ] Performance acceptable
- [ ] Monitoring configured
- [ ] Team notified of launch

---

## Continuous Deployment

**Automatic Deployments:**
1. Enable in Vercel: Settings → Git → Production Branch
2. Select branch: `main`
3. Every push to `main` triggers deployment

**Preview Deployments:**
- Pull requests automatically create preview URLs
- Test changes before merging to main

**Manual Deployments:**
```bash
# Deploy specific branch
vercel --prod --branch feature/new-feature

# Or deploy from local
vercel --prod
```

---

## Cost Optimization

### Vercel Costs
- **Hobby Plan**: $0/month (1 team member, basic features)
- **Pro Plan**: $20/month/member (team collaboration, analytics)
- **Enterprise**: Custom pricing

**Recommendation:** Start with Hobby, upgrade to Pro if needed.

### Firebase Costs
- **Spark Plan (Free)**: Limited usage (good for MVP)
- **Blaze Plan (Pay-as-you-go)**: Pay for what you use

**Estimated Monthly Costs (100 users):**
- Firestore: $5-10
- Storage: $5-10
- Authentication: Free
- **Total**: $10-20/month

**Cost Control:**
- Set budget alerts in Firebase Console
- Monitor usage daily (first week)
- Optimize queries (reduce reads)
- Implement caching

---

## Support & Next Steps

### Post-Launch Monitoring

**Week 1:**
- Daily monitoring (usage, errors, performance)
- Address critical bugs within 24 hours
- Collect user feedback

**Week 2-4:**
- Weekly monitoring
- Plan V1.1 enhancements
- Implement automated testing

### Getting Help

**Firebase Support:**
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

**Vercel Support:**
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

**My Projects:**
- Check PRODUCTION_STATUS.md for known issues
- Review README.md for architecture details
- Contact: support@alliedimpact.com

---

## Conclusion

Following this guide will deploy My Projects to production with:
- ✅ Secure Firebase backend
- ✅ Fast Vercel hosting
- ✅ Custom domain with SSL
- ✅ Monitoring and logging
- ✅ Rollback capability

**Estimated Total Time:** 30-45 minutes (first-time setup)

**Next Steps After Deployment:**
1. Conduct post-deployment verification (Phase 5)
2. Monitor usage for 24-48 hours
3. Address any critical issues
4. Plan V1.1 enhancements

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** January 6, 2026  
**Next Review:** Post-launch (after first week)
