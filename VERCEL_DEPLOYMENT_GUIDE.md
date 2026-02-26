# 🚀 Allied iMpact Platform - Vercel Deployment Guide

**Date**: February 19, 2026  
**Launch Target**: February 25, 2026 (6 days remaining)  
**Total Apps**: 8 production apps + 1 portal  
**Deployment Platform**: Vercel

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Order](#deployment-order)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Deploying Each App](#deploying-each-app)
5. [Custom Domains Configuration](#custom-domains-configuration)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### ✅ Before You Start

**Required Accounts**:
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] GitHub repository access (alliedimpact repo)
- [ ] Firebase project credentials for all 8 apps
- [ ] Payment gateway API keys (Paystack for CoinBox, PayFast for SportsHub)
- [ ] Domain names registered (optional but recommended)

**Required Tools**:
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Git configured and authenticated
- [ ] pnpm installed globally: `npm i -g pnpm`

**Verification**:
```powershell
# Check installations
vercel --version
git --version
pnpm --version
node --version  # Should be >= 18.0.0
```

---

## Deployment Order

Deploy in this specific order to ensure proper SSO flow:

### 🎯 Phase 1: Portal First (Foundation)
1. **Portal** (web/portal) → `alliedimpact.co.za`
   - Priority: HIGHEST
   - Reason: Central hub for SSO and cross-app navigation

### 🎯 Phase 2: Core Apps (High Usage Expected)
2. **CoinBox** (apps/coinbox) → `coinbox.alliedimpact.co.za`
3. **MyProjects** (apps/myprojects) → `myprojects.alliedimpact.co.za`
4. **CareerBox** (apps/careerbox) → `careerbox.alliedimpact.co.za`

### 🎯 Phase 3: Supporting Apps
5. **SportsHub** (apps/sportshup) → `sportshub.alliedimpact.co.za`
6. **DriveMaster** (apps/drivemaster) → `drivemaster.alliedimpact.co.za`
7. **EduTech** (apps/edutech) → `edutech.alliedimpact.co.za`

### 🎯 Phase 4: Internal Tools
8. **ControlHub** (apps/controlhub) → `controlhub.alliedimpact.co.za`

---

## Environment Variables Setup

### 🔐 Critical: Prepare Your Environment Variables

For **each app**, you need to set environment variables in Vercel dashboard.

#### 1. Portal Environment Variables

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=<from Firebase Console>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=allied-impact-platform.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=allied-impact-platform
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=allied-impact-platform.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<from Firebase Console>
NEXT_PUBLIC_FIREBASE_APP_ID=<from Firebase Console>

# App Configuration
NEXT_PUBLIC_APP_URL=https://alliedimpact.co.za
NEXT_PUBLIC_API_URL=https://alliedimpact.co.za

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
```

#### 2. CoinBox Environment Variables

```bash
# Paystack (Payment Gateway)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_<your-live-key>
PAYSTACK_SECRET_KEY=sk_live_<your-secret-key>

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=<coinbox-firebase-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=coinbox-ddc10.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=coinbox-ddc10
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=coinbox-ddc10.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<from Firebase>
NEXT_PUBLIC_FIREBASE_APP_ID=<from Firebase>

# Firebase Admin SDK
FIREBASE_PROJECT_ID=coinbox-ddc10
FIREBASE_CLIENT_EMAIL=<from service account JSON>
FIREBASE_PRIVATE_KEY="<from service account JSON - must be enclosed in quotes>"

# App URLs
NEXT_PUBLIC_APP_URL=https://coinbox.alliedimpact.co.za
NEXT_PUBLIC_BASE_URL=https://coinbox.alliedimpact.co.za
NEXT_PUBLIC_DASHBOARD_URL=https://alliedimpact.co.za

# Google AI (for crypto predictions)
GOOGLE_AI_API_KEY=<from Google AI Studio>

# Luno API (crypto trading)
LUNO_API_KEY_ID=<from Luno>
LUNO_API_KEY_SECRET=<from Luno>

# Security
AUTH_SECRET_KEY=<generate secure random string>
CRON_SECRET=<generate secure random string>

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
```

#### 3. SportsHub Environment Variables

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=<sportshub-firebase-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sportshub-526df.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sportshub-526df
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sportshub-526df.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<from Firebase>
NEXT_PUBLIC_FIREBASE_APP_ID=<from Firebase>

# PayFast (Payment Gateway)
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=<your-merchant-id>
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=<your-merchant-key>
PAYFAST_PASSPHRASE=<your-passphrase>

# reCAPTCHA
RECAPTCHA_SECRET_KEY=<from Google reCAPTCHA>
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<from Google reCAPTCHA>

# App Configuration
NEXT_PUBLIC_APP_URL=https://sportshub.alliedimpact.co.za

# Environment
NODE_ENV=production
```

#### 4. Other Apps (CareerBox, DriveMaster, EduTech, MyProjects, ControlHub)

Each app needs similar Firebase configuration. Check their respective `.env.example` files:

```bash
# Firebase (unique per app)
NEXT_PUBLIC_FIREBASE_API_KEY=<app-specific-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<app-firebase-project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<app-firebase-project>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<app-firebase-project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<from Firebase>
NEXT_PUBLIC_FIREBASE_APP_ID=<from Firebase>

# App URL
NEXT_PUBLIC_APP_URL=https://<app-subdomain>.alliedimpact.co.za

# Environment
NODE_ENV=production
```

**Firebase Projects per App**:
- Portal: `allied-impact-platform`
- CoinBox: `coinbox-ddc10`
- SportsHub: `sportshub-526df`
- DriveMaster: `drivemaster-513d9`
- EduTech: `edutech-4f548`
- CareerBox: `careerbox-64e54`
- ControlHub: `controlhub-6376f`
- MyProjects: `allied-impact-platform` (shared with Portal)

---

## Deploying Each App

### Method 1: Via Vercel Dashboard (Recommended for First Deployment)

#### Step 1: Import Project from GitHub

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `AlliediMpact/alliedimpact`
4. Vercel will detect it's a monorepo

#### Step 2: Configure Each App

For **each app**, create a separate Vercel project:

**Portal (First)**:
```
Project Name: allied-impact-portal
Framework Preset: Next.js
Root Directory: web/portal
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install --frozen-lockfile

Environment Variables: (paste all Portal env vars)
```

**CoinBox**:
```
Project Name: coinbox
Framework Preset: Next.js
Root Directory: apps/coinbox
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install --frozen-lockfile

Environment Variables: (paste all CoinBox env vars)
```

**Repeat for all apps**, changing only:
- Project Name
- Root Directory
- Environment Variables

#### Step 3: Deploy

1. Click "Deploy"
2. Wait for build to complete (~3-5 minutes per app)
3. Vercel will provide a preview URL (e.g., `allied-impact-portal.vercel.app`)

### Method 2: Via Vercel CLI (Faster for Multiple Apps)

```powershell
# Login to Vercel
vercel login

# Deploy Portal first
cd web/portal
vercel --prod

# Follow prompts:
# - Link to existing project or create new? Create new
# - Project name: allied-impact-portal
# - Confirm settings

# Deploy CoinBox
cd ../../apps/coinbox
vercel --prod

# Repeat for each app
cd ../careerbox
vercel --prod

cd ../drivemaster
vercel --prod

cd ../edutech
vercel --prod

cd ../sportshup
vercel --prod

cd ../myprojects
vercel --prod

cd ../controlhub
vercel --prod
```

**Important**: After first deployment via CLI, you must add environment variables via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all required variables
5. Redeploy: `vercel --prod` in the app directory

---

## Custom Domains Configuration

### ✅ You Must Configure Custom Domains

#### Step 1: Add Domains to Vercel

For each app's Vercel project:

1. Go to Project Settings → Domains
2. Add your custom domain:

**Portal**:
- Primary: `alliedimpact.co.za`
- Redirect: `www.alliedimpact.co.za` → `alliedimpact.co.za`

**CoinBox**:
- Primary: `coinbox.alliedimpact.co.za`

**CareerBox**:
- Primary: `careerbox.alliedimpact.co.za`

**DriveMaster**:
- Primary: `drivemaster.alliedimpact.co.za`

**EduTech**:
- Primary: `edutech.alliedimpact.co.za`

**SportsHub**:
- Primary: `sportshub.alliedimpact.co.za`

**MyProjects**:
- Primary: `myprojects.alliedimpact.co.za`

**ControlHub**:
- Primary: `controlhub.alliedimpact.co.za`

#### Step 2: Update DNS Records

**⚠️ YOU MUST DO THIS**: Update your domain DNS settings (at your domain registrar):

**For Root Domain (alliedimpact.co.za)**:
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**For All Subdomains** (coinbox, careerbox, etc.):
```
Type: CNAME
Name: coinbox (or app name)
Value: cname.vercel-dns.com
TTL: 3600
```

**Full DNS Configuration**:
```
A      @               76.76.21.21
CNAME  www             cname.vercel-dns.com
CNAME  coinbox         cname.vercel-dns.com
CNAME  careerbox       cname.vercel-dns.com
CNAME  drivemaster     cname.vercel-dns.com
CNAME  edutech         cname.vercel-dns.com
CNAME  sportshub       cname.vercel-dns.com
CNAME  myprojects      cname.vercel-dns.com
CNAME  controlhub      cname.vercel-dns.com
```

**DNS Propagation**: May take 1-48 hours (usually 15-30 minutes)

---

## Post-Deployment Verification

### ✅ Checklist After All Apps Deployed

#### 1. Test Each App Individually

Visit each URL and verify:

**Portal** (https://alliedimpact.co.za):
- [ ] Homepage loads
- [ ] Login page works
- [ ] Signup page works
- [ ] Products showcase visible
- [ ] Legal pages accessible (privacy, terms)
- [ ] PWA installable (check browser prompt)

**CoinBox** (https://coinbox.alliedimpact.co.za):
- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard accessible after login
- [ ] Can view wallet balances
- [ ] P2P loan listings load
- [ ] Crypto trading page loads
- [ ] PWA installable

**Repeat similar checks for**:
- CareerBox
- DriveMaster
- EduTech
- SportsHub
- MyProjects
- ControlHub

#### 2. Test Cross-App Navigation (SSO)

**Critical Test**:
1. Login to Portal (alliedimpact.co.za)
2. Click "Open CoinBox" from dashboard
3. Verify you're automatically logged into CoinBox (no re-login)
4. Navigate back to Portal
5. Click "Open MyProjects"
6. Verify SSO works

**Expected**: Single sign-on across all apps

#### 3. Test Firebase Integration

For each app:
- [ ] Login with email/password works
- [ ] Signup creates new user
- [ ] Password reset email sends
- [ ] Firestore data loads (dashboards, listings, etc.)
- [ ] Real-time updates work (if applicable)

#### 4. Test Payment Gateways

**CoinBox** (Paystack):
- [ ] Deposit form loads
- [ ] Paystack popup appears on deposit
- [ ] Test transaction with test card: `4084084084084081`
- [ ] Balance updates after successful payment

**SportsHub** (PayFast):
- [ ] Subscription page loads
- [ ] PayFast redirect works
- [ ] Test payment flow (use PayFast test mode)

#### 5. Test PWA Features

For each app:
- [ ] Service worker registers (check DevTools → Application → Service Workers)
- [ ] Install prompt appears on mobile
- [ ] App works offline (after first visit)
- [ ] Manifest loads (check `/manifest.json`)

#### 6. Monitor Errors

Check Vercel deployment logs:
1. Go to Vercel Dashboard
2. Select project
3. Click "Deployments" → Latest deployment
4. Check "Functions" tab for serverless function errors
5. Check browser console for JavaScript errors

---

## Troubleshooting

### Common Issues & Solutions

#### ❌ Build Fails: "Cannot find module '@allied-impact/...'"

**Problem**: Workspace dependencies not resolved

**Solution**:
```powershell
# In root directory
pnpm install
pnpm build

# If still fails, in individual app:
cd apps/coinbox
pnpm install
pnpm build
```

Vercel may need Root Directory set correctly. Check `vercel.json` `installCommand`.

#### ❌ Runtime Error: "Firebase not configured"

**Problem**: Missing environment variables

**Solution**:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
3. Redeploy: `vercel --prod`

#### ❌ 404 Error on Custom Domain

**Problem**: DNS not propagated or incorrectly configured

**Solution**:
1. Verify DNS records at your registrar
2. Use https://dnschecker.org to check propagation
3. Wait 15-30 minutes
4. Clear browser cache and try again

#### ❌ CORS Error When Calling APIs

**Problem**: API calls blocked by browser

**Solution**:
Check `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        ],
      },
    ];
  },
};
```

#### ❌ Serverless Function Timeout

**Problem**: Firebase Admin operations too slow

**Solution**:
1. Go to Vercel Dashboard → Project → Settings → Functions
2. Increase "Max Duration" to 10s (free tier) or 60s (Pro)
3. Optimize database queries (add indexes in Firestore)

#### ❌ PWA Not Installing

**Problem**: Service worker not registering

**Solution**:
1. Verify `/sw.js` exists in public folder
2. Check `/manifest.json` exists
3. Check HTTPS is enabled (required for PWA)
4. Clear browser cache and service workers
5. Verify `Service-Worker-Allowed: /` header in vercel.json

---

## Success Criteria

### ✅ Deployment Complete When:

- [ ] All 8 apps + Portal deployed to Vercel
- [ ] All custom domains configured and accessible
- [ ] DNS propagated (all URLs resolve)
- [ ] Environment variables set for all apps
- [ ] Login/Signup works on all apps
- [ ] SSO works between Portal and apps
- [ ] Firebase integration confirmed (data loads)
- [ ] Payment gateways tested (CoinBox, SportsHub)
- [ ] PWA installable on all apps
- [ ] No critical errors in Vercel logs
- [ ] All apps passing smoke tests

---

## What You Need to Do

### 🎯 Your Action Items

#### 1. Vercel Account Setup (5 minutes)
- [ ] Create Vercel account (if not already)
- [ ] Connect GitHub account to Vercel
- [ ] Import `AlliediMpact/alliedimpact` repository

#### 2. Gather All Credentials (30 minutes)
- [ ] Firebase Console: Get API keys for all 7 Firebase projects
- [ ] Firebase Console: Download service account JSONs
- [ ] Paystack Dashboard: Get live API keys (CoinBox)
- [ ] PayFast Dashboard: Get merchant credentials (SportsHub)
- [ ] Google AI Studio: Get API key (CoinBox crypto predictions)
- [ ] Luno: Get API credentials (CoinBox crypto trading)
- [ ] Google reCAPTCHA: Get site key and secret (SportsHub)
- [ ] Generate secure random strings for `AUTH_SECRET_KEY` and `CRON_SECRET`

#### 3. Deploy Apps via Vercel Dashboard (2-3 hours)
- [ ] Deploy Portal first
- [ ] Add Portal environment variables
- [ ] Test Portal deployment
- [ ] Deploy CoinBox
- [ ] Add CoinBox environment variables (30+ variables!)
- [ ] Test CoinBox deployment
- [ ] Repeat for remaining 6 apps

#### 4. Configure Domains (30 minutes)
- [ ] Add custom domains in Vercel for each app
- [ ] Update DNS records at your domain registrar
- [ ] Wait for propagation (15-30 min)

#### 5. Verification & Testing (2-3 hours)
- [ ] Test each app individually
- [ ] Test SSO flow (Portal → CoinBox → MyProjects)
- [ ] Test payments (CoinBox Paystack, SportsHub PayFast)
- [ ] Test PWA installation on mobile
- [ ] Monitor Vercel logs for errors
- [ ] Fix any issues

---

## Deployment Timeline

**Total Estimated Time**: 6-8 hours

**Suggested Schedule** (for Feb 25 launch):

**Day 1 (Feb 20)**: Setup & Portal
- ✅ Vercel account + GitHub connection (30 min)
- ✅ Gather credentials (1 hour)
- ✅ Deploy Portal + test (1 hour)

**Day 2 (Feb 21)**: Core Apps
- ✅ Deploy CoinBox (1 hour)
- ✅ Deploy MyProjects (45 min)
- ✅ Deploy CareerBox (45 min)
- ✅ Test SSO between apps (30 min)

**Day 3 (Feb 22)**: Supporting Apps
- ✅ Deploy SportsHub (1 hour)
- ✅ Deploy DriveMaster (45 min)
- ✅ Deploy EduTech (45 min)

**Day 4 (Feb 23)**: Internal + Domain Setup
- ✅ Deploy ControlHub (45 min)
- ✅ Configure all custom domains (1 hour)
- ✅ Wait for DNS propagation

**Day 5 (Feb 24)**: Final Testing
- ✅ Full end-to-end testing (3 hours)
- ✅ Fix any issues
- ✅ Payment gateway verification
- ✅ PWA testing on mobile devices

**Day 6 (Feb 25)**: LAUNCH DAY 🚀
- ✅ Final smoke tests (1 hour)
- ✅ Monitor logs and errors
- ✅ Announce launch

---

## Next Steps

**What I'll help you with**:
1. Setting environment variables (I can provide templates)
2. Debugging build errors
3. Testing deployment URLs
4. Configuring custom domain settings

**What you must do**:
1. Actually deploy via Vercel (click buttons, authenticate)
2. Provide API keys and credentials from Firebase/Paystack/etc.
3. Update DNS records at your domain registrar
4. Test on real devices

---

**Ready to start?** Begin with **Phase 1: Deploy Portal**. Let me know when you've created the Vercel account and connected GitHub!
