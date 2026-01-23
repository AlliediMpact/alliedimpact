# ControlHub - Deployment Guide

**Version**: 0.1.0  
**Last Updated**: January 23, 2026

---

## 🎯 Overview

This guide covers deploying ControlHub to production on Vercel with Firebase backend.

**Prerequisites**:
- Firebase project created (separate from app projects)
- Vercel account with access
- Node.js 18+ and pnpm 8+
- Git repository access

---

## 🔧 Pre-Deployment Checklist

### 1. Firebase Project Setup

```bash
# Create Firebase project
firebase projects:create controlhub-prod

# Enable Firestore
firebase deploy --only firestore:rules

# Enable Firebase Auth
# Go to Firebase Console > Authentication > Sign-in method
# Enable Email/Password
# Enable Multi-factor Authentication (mandatory)
```

### 2. Generate API Tokens

```bash
# Generate secure random tokens for each app
node scripts/generate-api-tokens.js

# Output:
# COINBOX_API_TOKEN=ch_live_coinbox_xxx
# SPORTSHUB_API_TOKEN=ch_live_sportshub_xxx
# DRIVEMASTER_API_TOKEN=ch_live_drivemaster_xxx
# EDUTECH_API_TOKEN=ch_live_edutech_xxx
# PORTAL_API_TOKEN=ch_live_portal_xxx
# MYPROJECTS_API_TOKEN=ch_live_myprojects_xxx
```

### 3. Create Service Account

```bash
# Go to Firebase Console > Project Settings > Service Accounts
# Click "Generate new private key"
# Save as: secrets/controlhub-firebase-admin.json
# NEVER commit this file!
```

---

## 🚀 Production Deployment (Vercel)

### Step 1: Install Dependencies

```bash
cd apps/controlhub
pnpm install
```

### Step 2: Environment Variables

Create `.env.production` (DO NOT commit):

```env
# Firebase (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controlhub-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controlhub-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controlhub-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=controlhub-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@controlhub-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"

# App API Tokens
COINBOX_API_TOKEN=ch_live_coinbox_xxx
SPORTSHUB_API_TOKEN=ch_live_sportshub_xxx
DRIVEMASTER_API_TOKEN=ch_live_drivemaster_xxx
EDUTECH_API_TOKEN=ch_live_edutech_xxx
PORTAL_API_TOKEN=ch_live_portal_xxx
MYPROJECTS_API_TOKEN=ch_live_myprojects_xxx

# Application
NEXT_PUBLIC_APP_URL=https://controlhub.alliedimpact.com
NODE_ENV=production

# Data Retention (days)
AUTH_EVENTS_RETENTION_DAYS=90
HEALTH_EVENTS_RETENTION_DAYS=30
ALERTS_RETENTION_DAYS=365
AUDIT_LOGS_RETENTION_DAYS=2555

# Security
SESSION_SECRET=<generate_secure_random_string>
MFA_REQUIRED=true
API_RATE_LIMIT_PER_MINUTE=60
```

### Step 3: Build and Test

```bash
# Type check
pnpm type-check

# Build
pnpm build

# Test production build locally
pnpm start

# Open http://localhost:3010
```

### Step 4: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Set environment variables in Vercel dashboard
# OR via CLI:
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add FIREBASE_PRIVATE_KEY production
# ... (repeat for all env vars)
```

### Step 5: Configure Custom Domain

```bash
# Add domain in Vercel dashboard
vercel domains add controlhub.alliedimpact.com

# Add DNS records:
# Type: CNAME
# Name: controlhub
# Value: cname.vercel-dns.com
```

### Step 6: Deploy Firestore Rules

```bash
# Deploy security rules
firebase deploy --only firestore:rules --project controlhub-prod

# Deploy indexes (if needed)
firebase deploy --only firestore:indexes --project controlhub-prod
```

---

## 🔐 Post-Deployment Security

### 1. Assign Super Admin Role

```bash
# SSH into Firebase Admin SDK environment or use Cloud Functions
node scripts/assign-role.js admin@alliedimpact.com super_admin
```

### 2. Enable MFA

```bash
# Go to Firebase Console > Authentication > Settings
# ✅ Enable Multi-factor Authentication
# ✅ Require MFA for all users
```

### 3. Configure IP Allowlist (Optional)

```bash
# Vercel > Project Settings > Security > IP Allowlist
# Add office IPs
```

### 4. Test API Endpoints

```bash
# Health endpoint
curl -X POST https://controlhub.alliedimpact.com/api/v1/events/health \
  -H "Authorization: Bearer ch_live_coinbox_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "coinbox",
    "data": {
      "appId": "coinbox",
      "status": "healthy",
      "environment": "production",
      "timestamp": "2026-01-23T10:00:00Z"
    },
    "timestamp": "2026-01-23T10:00:00Z"
  }'

# Expected: {"success": true, "data": {"received": true}, "timestamp": "..."}
```

---

## 📊 Monitoring Setup

### 1. Vercel Analytics

```bash
# Enable in Vercel dashboard
# Vercel > Project Settings > Analytics
# ✅ Enable Web Analytics
# ✅ Enable Speed Insights
```

### 2. Firebase Monitoring

```bash
# Enable in Firebase Console
# Firebase Console > Performance Monitoring
# Firebase Console > Crashlytics
```

### 3. Custom Alerts

```bash
# Set up alerts for:
# - API error rate > 5%
# - Response time > 1000ms
# - Failed deployments
# - Firestore quota exceeded
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-controlhub.yml
name: Deploy ControlHub

on:
  push:
    branches: [main]
    paths:
      - 'apps/controlhub/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm --filter @allied-impact/controlhub type-check
      
      - name: Build
        run: pnpm --filter @allied-impact/controlhub build
      
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🔧 Rollback Procedure

### Quick Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>

# Or via Vercel dashboard:
# Deployments > Previous deployment > Promote to Production
```

### Manual Rollback

```bash
# Checkout previous commit
git checkout <previous-commit-hash>

# Deploy
vercel --prod
```

---

## 📋 Health Check

After deployment, verify:

```bash
# 1. Homepage loads
curl https://controlhub.alliedimpact.com

# 2. API responds
curl https://controlhub.alliedimpact.com/api/health

# 3. Firestore connection
# Go to dashboard, check if data loads

# 4. Authentication works
# Login via dashboard

# 5. Real-time updates work
# Open dashboard, emit event from app, verify it appears
```

---

## 🚨 Troubleshooting

### Issue 1: "Firebase Auth Error"

**Cause**: Incorrect Firebase config or private key

**Solution**:
```bash
# Verify environment variables
vercel env ls

# Check FIREBASE_PRIVATE_KEY formatting
# Must include \n characters: "-----BEGIN...\nMII...\n-----END..."
```

### Issue 2: "API Token Validation Failed"

**Cause**: Mismatched tokens between ControlHub and apps

**Solution**:
```bash
# Regenerate tokens
node scripts/generate-api-tokens.js

# Update in Vercel
vercel env add COINBOX_API_TOKEN production

# Update in apps' environment variables
```

### Issue 3: "Firestore Permission Denied"

**Cause**: Security rules not deployed or user lacks role

**Solution**:
```bash
# Deploy rules
firebase deploy --only firestore:rules

# Verify user has role
firebase auth:export users.json
# Check customClaims field
```

---

## 📝 Deployment Checklist

Before going live:

- [ ] Firebase project created and configured
- [ ] API tokens generated and stored securely
- [ ] Environment variables set in Vercel
- [ ] Firestore rules deployed
- [ ] Custom domain configured
- [ ] Super admin role assigned
- [ ] MFA enabled and tested
- [ ] API endpoints tested
- [ ] Dashboard loads and displays data
- [ ] Real-time updates working
- [ ] Monitoring enabled (Vercel + Firebase)
- [ ] Alerts configured
- [ ] Team notified of launch

---

## 📞 Support

**Deployment issues?**
- Platform Team: platform@alliedimpact.com
- DevOps: devops@alliedimpact.com

**Emergency rollback:**
- On-call Engineer: +27 XX XXX XXXX

---

**Last Updated**: January 23, 2026  
**Maintained By**: Platform Engineering Team
