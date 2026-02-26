# 🚀 SportsHub Production Deployment Guide

**Last Updated**: January 21, 2026  
**Version**: 1.0.0

This guide walks you through deploying SportsHub to production with all services properly configured.

---

## 📋 Pre-Deployment Checklist

### Prerequisites
- [ ] Firebase project created
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged into Firebase (`firebase login`)
- [ ] Node.js 20+ installed
- [ ] pnpm installed
- [ ] GitHub repository access
- [ ] PayFast merchant account (for payments)
- [ ] Domain name configured (optional)

---

## 1️⃣ Environment Configuration

### Step 1: Create Production Environment File

```bash
cd apps/sports-hub
cp .env.example .env.local
```

### Step 2: Configure Firebase

Get your Firebase credentials from [Firebase Console](https://console.firebase.google.com):

1. Go to Project Settings → General
2. Scroll to "Your apps" → Web app
3. Copy configuration values

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 3: Configure PayFast

Get credentials from [PayFast Dashboard](https://www.payfast.co.za):

**For Testing (Sandbox)**:
```env
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=10000100
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=46f0cd694581a
NEXT_PUBLIC_PAYFAST_PASSPHRASE=jt7NOE43FZPn
NEXT_PUBLIC_PAYFAST_SANDBOX=true
```

**For Production**:
```env
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=your_merchant_id
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=your_merchant_key
NEXT_PUBLIC_PAYFAST_PASSPHRASE=your_secure_passphrase
NEXT_PUBLIC_PAYFAST_SANDBOX=false
```

### Step 4: Configure Application URLs

```env
NEXT_PUBLIC_APP_URL=https://sportshub.alliedimpact.com
NEXT_PUBLIC_APP_NAME=SportsHub
```

### Step 5: Configure Optional Services

**Sentry (Error Tracking)**:
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

**reCAPTCHA v3**:
```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

---

## 2️⃣ Firebase Setup

### Step 1: Initialize Firebase Project

```bash
cd apps/sports-hub
firebase init
```

Select:
- ☑️ Firestore
- ☑️ Functions
- ☑️ Hosting (optional)

### Step 2: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Step 3: Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

### Step 4: Create Firestore Collections

Run the seed script:
```bash
node scripts/seed-cupfinal-project.js
```

This creates:
- `sportshub_projects` collection with initial project
- Sample tournament (optional)

---

## 3️⃣ Deploy Cloud Functions

### Method 1: Using Deployment Script (Recommended)

**Windows (PowerShell)**:
```powershell
.\scripts\deploy-functions.ps1
```

**Mac/Linux (Bash)**:
```bash
chmod +x scripts/deploy-functions.sh
./scripts/deploy-functions.sh
```

### Method 2: Manual Deployment

```bash
cd functions
npm install
firebase deploy --only functions
```

### Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to Functions
3. Verify these functions are deployed:
   - ✅ `deductVoteFromWallet`
   - ✅ `scheduledCleanupRateLimits` (cron job)
   - ✅ `scheduledCleanupOldAuditLogs` (cron job)

### Get Function URLs

```bash
firebase functions:list
```

Copy the URL for `deductVoteFromWallet` - you'll need it for testing.

---

## 4️⃣ Deploy Frontend (Vercel)

### Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "New Project"
3. Import `alliedimpact` repository
4. Select `apps/sports-hub` as root directory

### Step 2: Configure Build Settings

```
Framework Preset: Next.js
Build Command: cd ../.. && pnpm build --filter=@allied-impact/sports-hub
Output Directory: .next
Install Command: pnpm install
```

### Step 3: Add Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_APP_URL=https://sportshub.vercel.app
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=...
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=...
NEXT_PUBLIC_PAYFAST_PASSPHRASE=...
NEXT_PUBLIC_PAYFAST_SANDBOX=false
```

### Step 4: Deploy

```bash
vercel --prod
```

Or push to `main` branch for automatic deployment.

---

## 5️⃣ PayFast Configuration

### Step 1: Set Webhook URL

1. Log into [PayFast Dashboard](https://www.payfast.co.za)
2. Go to Settings → Integration
3. Set ITN (Instant Transaction Notification) URL:

```
https://your-region-your-project.cloudfunctions.net/handlePayFastWebhook
```

Or if using API routes:
```
https://sportshub.alliedimpact.com/api/payfast/webhook
```

### Step 2: Test Sandbox Integration

```bash
cd apps/sports-hub
node scripts/test-payfast-sandbox.js
```

This script:
1. Creates test payment
2. Simulates PayFast callback
3. Verifies wallet credit

### Step 3: Go Live

1. Switch `NEXT_PUBLIC_PAYFAST_SANDBOX=false`
2. Use production merchant credentials
3. Test with real R10 payment
4. Verify wallet credit in dashboard

---

## 6️⃣ Testing & Verification

### Automated Tests

```bash
cd apps/sports-hub
pnpm test:coverage
```

Verify:
- ✅ 150+ tests pass
- ✅ 91%+ coverage achieved

### Manual Testing Checklist

**Authentication**:
- [ ] Sign up with email/password
- [ ] Login with existing account
- [ ] Logout
- [ ] Password reset

**Wallet**:
- [ ] Top up R10 via PayFast
- [ ] Verify balance update
- [ ] View transaction history

**Tournaments**:
- [ ] Browse tournaments
- [ ] View tournament details
- [ ] Cast vote (R2 deducted)
- [ ] View real-time results

**Admin Portal** (requires super_admin role):
- [ ] View admin dashboard
- [ ] Create tournament
- [ ] Publish tournament
- [ ] View audit logs
- [ ] Manage users

**Notifications**:
- [ ] Receive vote confirmation
- [ ] Receive wallet top-up notification
- [ ] See notification bell update

---

## 7️⃣ Post-Deployment

### Enable Monitoring

**Sentry**:
```bash
npm install --save @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Firebase Monitoring**:
1. Enable Performance Monitoring in Firebase Console
2. Enable Crashlytics
3. Set up custom alerts

### Set Up Custom Domain

**Vercel**:
1. Go to Project Settings → Domains
2. Add `sportshub.alliedimpact.com`
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

### Configure CORS (if needed)

In Cloud Functions:
```typescript
const cors = require('cors')({
  origin: [
    'https://sportshub.alliedimpact.com',
    'https://sportshub.vercel.app'
  ]
});
```

---

## 8️⃣ Security Hardening

### Firestore Rules

Verify rules are properly deployed:
```bash
firebase firestore:rules:get
```

### Rate Limiting

Cloud Functions automatically enforce:
- 10 votes/minute per user
- 5 wallet top-ups/hour
- 20 admin actions/minute

### MFA for Admins

1. Enable MFA in admin settings
2. Scan QR code with authenticator app
3. Save backup codes

---

## 9️⃣ Monitoring & Maintenance

### View Logs

**Cloud Functions**:
```bash
firebase functions:log
```

**Specific Function**:
```bash
firebase functions:log --only deductVoteFromWallet
```

**Real-time Logs**:
```bash
firebase functions:log --follow
```

### Monitor Performance

1. Firebase Console → Performance
2. Vercel Analytics
3. Sentry Error Tracking

### Database Backups

```bash
# Automated daily backups (configured in Firebase Console)
# Manual backup:
gcloud firestore export gs://your-bucket/backups/$(date +%Y-%m-%d)
```

---

## 🆘 Troubleshooting

### Issue: Functions not deploying

**Solution**:
```bash
cd functions
rm -rf node_modules package-lock.json
npm install
firebase deploy --only functions --debug
```

### Issue: PayFast webhook not working

**Check**:
1. Webhook URL is correct
2. IP whitelist includes PayFast IPs
3. Function logs: `firebase functions:log`

**Test manually**:
```bash
curl -X POST https://your-function-url/handlePayFastWebhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "m_payment_id=test123&pf_payment_id=123456&payment_status=COMPLETE&amount_gross=10.00"
```

### Issue: reCAPTCHA not loading

**Check**:
1. Site key is correct in `.env.local`
2. Domain is authorized in reCAPTCHA Console
3. Script is loaded: Check browser console

### Issue: Wallet not updating

**Check**:
1. Cloud Functions are deployed
2. User has sufficient permissions
3. Function logs for errors
4. Firestore rules allow wallet writes

---

## 📞 Support

- **Documentation**: See `docs/` folder
- **GitHub Issues**: Create issue in repository
- **Email**: support@alliedimpact.com

---

## ✅ Deployment Verification Checklist

Before going live, verify:

- [ ] All environment variables configured
- [ ] Firebase rules deployed
- [ ] Cloud Functions deployed and tested
- [ ] Frontend deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] PayFast integration tested
- [ ] Monitoring enabled (Sentry, Firebase)
- [ ] Automated tests passing (91%+ coverage)
- [ ] Manual smoke tests completed
- [ ] Backup strategy configured
- [ ] Team has admin access
- [ ] Documentation reviewed
- [ ] Emergency rollback plan ready

---

## 🎉 You're Live!

SportsHub is now running in production. Monitor closely for the first 24 hours and be ready to respond to any issues.

**Key Metrics to Watch**:
- Error rate (< 1%)
- Response time (< 500ms)
- Function execution count
- User signups
- Vote transactions
- Wallet top-ups

Good luck! 🚀
