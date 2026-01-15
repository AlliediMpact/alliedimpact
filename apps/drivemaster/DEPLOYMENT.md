# 🚗 DriveMaster - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Third-Party Services](#third-party-services)
5. [Deployment Options](#deployment-options)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- [ ] Firebase account (Google Cloud)
- [ ] Vercel account (recommended) OR hosting alternative
- [ ] SendGrid account (email delivery)
- [ ] PayFast merchant account (payments)
- [ ] Sentry account (error tracking)
- [ ] Domain name (drivemaster.co.za)

### Required Tools
- [ ] Node.js 18+ installed
- [ ] pnpm 8+ installed
- [ ] Git installed
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Vercel CLI installed (optional): `npm install -g vercel`

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/AlliediMpact/alliedimpact.git
cd alliedimpact/apps/drive-master
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

Create `.env.local` file in the project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=drivemaster-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=drivemaster-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=drivemaster-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
NEXT_PUBLIC_APP_URL=https://drivemaster.co.za
NODE_ENV=production

# SendGrid (Email)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@drivemaster.co.za
SENDGRID_FROM_NAME=DriveMaster

# PayFast (Payments)
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=xxxxxxxxxxxxxxxx
PAYFAST_PASSPHRASE=xxxxxxxxxxxxxxxx
PAYFAST_URL=https://www.payfast.co.za/eng/process
PAYFAST_RETURN_URL=https://drivemaster.co.za/subscription/success
PAYFAST_CANCEL_URL=https://drivemaster.co.za/subscription/cancel

# Sentry (Error Tracking)
SENTRY_DSN=https://xxxxxxxxxxxxxxxx@sentry.io/xxxxxxx

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_MULTI_LANGUAGE=true
NEXT_PUBLIC_ENABLE_SOCIAL_SHARE=true
```

**Security Note:** Never commit `.env.local` to Git. It's already in `.gitignore`.

---

## Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Project name: `drivemaster-prod`
4. Enable Google Analytics (recommended)
5. Click "Create Project"

### 2. Enable Authentication

```bash
Firebase Console → Authentication → Get Started
→ Enable Email/Password
→ Enable Google Sign-In (optional)
```

### 3. Create Firestore Database

```bash
Firebase Console → Firestore Database → Create Database
→ Start in Production Mode
→ Select location: us-central1 (or closest to South Africa)
```

### 4. Deploy Firestore Rules

```bash
firebase login
firebase init firestore
# Select existing project: drivemaster-prod
# Use default files (firestore.rules, firestore.indexes.json)

firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 5. Enable Firebase Storage

```bash
Firebase Console → Storage → Get Started
→ Start in Production Mode
→ Deploy storage rules:

firebase deploy --only storage
```

### 6. Enable Firebase Analytics

```bash
Firebase Console → Analytics → Enable
→ Copy Measurement ID → Add to .env.local
```

---

## Third-Party Services

### SendGrid Setup

1. **Create Account:** [sendgrid.com](https://sendgrid.com)
2. **Verify Domain:**
   ```
   Settings → Sender Authentication → Authenticate Your Domain
   → Add DNS records to drivemaster.co.za
   ```
3. **Create API Key:**
   ```
   Settings → API Keys → Create API Key
   → Full Access → Copy key → Add to .env.local
   ```
4. **Create Email Templates:**
   - Welcome Email
   - Certificate Email
   - Trial Expiry Warning
   - Subscription Confirmation
   - School Lead Notification

### PayFast Setup

1. **Create Merchant Account:** [payfast.co.za](https://www.payfast.co.za)
2. **Complete Registration:**
   - Business details
   - Bank account details
   - Verify identity
3. **Get Credentials:**
   ```
   Settings → Integration
   → Merchant ID
   → Merchant Key
   → Passphrase (set this yourself)
   ```
4. **Set Webhooks:**
   ```
   ITN URL: https://drivemaster.co.za/api/payfast/itn
   Return URL: https://drivemaster.co.za/subscription/success
   Cancel URL: https://drivemaster.co.za/subscription/cancel
   ```

### Sentry Setup

1. **Create Account:** [sentry.io](https://sentry.io)
2. **Create Project:**
   ```
   Projects → Create Project
   → Platform: Next.js
   → Project Name: drivemaster-prod
   ```
3. **Copy DSN:** Add to `.env.local`
4. **Configure Alerts:**
   - Email notifications for new errors
   - Slack integration (optional)

---

## Deployment Options

### Option 1: Vercel (Recommended)

#### Why Vercel?
- Built for Next.js (same team)
- Automatic deployments from Git
- Global CDN (Edge Network)
- Serverless functions
- Free SSL certificates
- Zero configuration

#### Deployment Steps

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# → Project name: drivemaster
# → Link to existing project? No
# → Framework: Next.js
# → Root directory: ./
# → Build command: pnpm build
# → Output directory: .next
```

#### Add Environment Variables in Vercel Dashboard

```
Settings → Environment Variables
→ Add all variables from .env.local
→ Apply to Production, Preview, Development
```

#### Configure Custom Domain

```
Settings → Domains
→ Add Domain: drivemaster.co.za
→ Add DNS records (provided by Vercel)
```

#### Enable Automatic Deployments

```
Settings → Git
→ Connect GitHub repository
→ Production Branch: main
→ Auto-deploy on push: Enabled
```

### Option 2: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting
# → Use existing project: drivemaster-prod
# → Public directory: out
# → Single-page app: Yes
# → GitHub Actions: Yes (optional)

# Build for static export
pnpm build

# Deploy
firebase deploy --only hosting
```

### Option 3: Self-Hosted (VPS/Dedicated Server)

**Requirements:**
- Ubuntu 22.04 LTS
- 2GB RAM minimum
- Node.js 18+
- Nginx
- PM2 (process manager)

```bash
# 1. Setup server
ssh root@your-server-ip
apt update && apt upgrade -y
apt install nginx nodejs npm -y
npm install -g pm2 pnpm

# 2. Clone repository
git clone https://github.com/AlliediMpact/alliedimpact.git
cd alliedimpact/apps/drive-master

# 3. Install dependencies
pnpm install

# 4. Add environment variables
nano .env.local
# (paste variables)

# 5. Build application
pnpm build

# 6. Start with PM2
pm2 start npm --name "drivemaster" -- start
pm2 save
pm2 startup

# 7. Configure Nginx
nano /etc/nginx/sites-available/drivemaster

# Add:
server {
    listen 80;
    server_name drivemaster.co.za www.drivemaster.co.za;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/drivemaster /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 8. Setup SSL with Let's Encrypt
apt install certbot python3-certbot-nginx -y
certbot --nginx -d drivemaster.co.za -d www.drivemaster.co.za
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check website loads
curl -I https://drivemaster.co.za

# Check API routes
curl https://drivemaster.co.za/api/health

# Check authentication
# → Visit /auth/login
# → Create test account
# → Verify email sent
```

### 2. Initialize Database

```bash
# Run seed script (if you have one)
pnpm run seed

# Or manually create:
# - Admin user
# - Sample journeys
# - Questions database
```

### 3. Test Payment Flow

```bash
# Use PayFast sandbox for testing
1. Set PAYFAST_URL to sandbox URL
2. Complete test transaction
3. Verify ITN notification received
4. Check subscription updated in Firestore
5. Switch to production URL
```

### 4. Configure DNS

**A Records:**
```
drivemaster.co.za       →  Vercel IP (or your server IP)
www.drivemaster.co.za   →  Vercel IP (or your server IP)
```

**CNAME Records (if using Vercel):**
```
www.drivemaster.co.za   →  cname.vercel-dns.com
```

**MX Records (for email):**
```
drivemaster.co.za       →  SendGrid or your email provider
```

### 5. SSL Certificate

If using Vercel: **Automatic** ✅

If self-hosted:
```bash
certbot renew --dry-run
# Setup auto-renewal
echo "0 0 * * * certbot renew" | crontab -
```

### 6. Enable Analytics

```bash
# Verify Google Analytics tracking
1. Visit website
2. Check Google Analytics Real-Time view
3. Confirm events firing

# Verify Firebase Analytics
Firebase Console → Analytics → Events
```

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Website uptime (use uptime monitor)
- [ ] Error rate in Sentry (should be < 1%)
- [ ] Firebase quota usage

### Weekly Checks
- [ ] User growth metrics
- [ ] Subscription conversion rate
- [ ] Email delivery rate (SendGrid)
- [ ] Payment success rate (PayFast)
- [ ] Page load performance

### Monthly Checks
- [ ] Firestore database size (watch for runaway queries)
- [ ] Storage usage (certificates, profile images)
- [ ] SSL certificate renewal (auto, but verify)
- [ ] Security updates (npm audit fix)
- [ ] Backup database (Firestore export)

### Performance Monitoring

**Vercel Analytics** (if deployed on Vercel):
- Real User Monitoring (RUM)
- Web Vitals (LCP, FID, CLS)
- Page load times

**Custom Monitoring Script:**
```bash
#!/bin/bash
# health-check.sh

URL="https://drivemaster.co.za"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -eq 200 ]; then
  echo "✓ Website is up"
else
  echo "✗ Website is down (HTTP $RESPONSE)"
  # Send alert
fi
```

Run with cron:
```bash
*/5 * * * * /path/to/health-check.sh
```

### Database Backups

```bash
# Manual backup
firebase firestore:export gs://drivemaster-prod-backups/$(date +%Y%m%d)

# Automated daily backups (Cloud Scheduler + Cloud Functions)
# See Firebase documentation for setup
```

---

## Troubleshooting

### Common Issues

#### 1. "Firebase Auth Error"
**Symptom:** Users can't sign in  
**Solution:**
```bash
1. Check Firebase Console → Authentication → Authorized domains
2. Add production domain: drivemaster.co.za
3. Check browser console for specific error
4. Verify NEXT_PUBLIC_FIREBASE_* variables are correct
```

#### 2. "Payment Verification Failed"
**Symptom:** PayFast payments not updating subscription  
**Solution:**
```bash
1. Check PayFast ITN logs
2. Verify ITN URL is accessible (not localhost)
3. Check signature verification logic
4. Enable PayFast debug mode
5. Review ITN notification in Firestore (create logging)
```

#### 3. "Emails Not Sending"
**Symptom:** Users not receiving emails  
**Solution:**
```bash
1. Check SendGrid dashboard → Activity
2. Verify API key is correct
3. Check sender domain verification
4. Review spam folder
5. Check SendGrid sender reputation
```

#### 4. "Build Failed on Vercel"
**Symptom:** Deployment fails  
**Solution:**
```bash
1. Check Vercel build logs
2. Run "pnpm build" locally
3. Check for TypeScript errors
4. Verify all environment variables are set
5. Check Node.js version compatibility
```

#### 5. "Firestore Permission Denied"
**Symptom:** Can't read/write data  
**Solution:**
```bash
1. Check Firestore rules in Firebase Console
2. Verify user is authenticated
3. Check userId matches document path
4. Review browser console for specific rule violation
```

#### 6. "High Latency"
**Symptom:** Slow page loads  
**Solution:**
```bash
1. Check Vercel Analytics → Performance
2. Optimize images (use Next.js Image component)
3. Enable caching headers
4. Minimize JavaScript bundle size
5. Use CDN for static assets
6. Check Firestore query performance (add indexes)
```

### Debug Mode

Enable debug mode locally:

```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true

# This will:
# - Show verbose logging
# - Display error stack traces
# - Enable React DevTools
# - Disable email sending (log to console instead)
```

### Rollback Deployment

**Vercel:**
```bash
Deployments → Select previous deployment → Promote to Production
```

**Firebase Hosting:**
```bash
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID DEST_SITE_ID:DEST_CHANNEL_ID
```

**Self-Hosted:**
```bash
git checkout <previous-commit-hash>
pnpm install
pnpm build
pm2 restart drivemaster
```

---

## Security Checklist

Before going live:

- [ ] All environment variables are set correctly
- [ ] Firestore security rules deployed
- [ ] Firebase Storage rules deployed
- [ ] HTTPS enabled (SSL certificate)
- [ ] Security headers configured (CSP, HSTS)
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (N/A - using Firestore)
- [ ] XSS protection (React escapes by default)
- [ ] CSRF tokens on forms
- [ ] Sensitive data encrypted
- [ ] No API keys in client-side code
- [ ] Sentry configured to exclude sensitive data
- [ ] Regular dependency updates (npm audit)

---

## Production Readiness Checklist

- [ ] All features tested end-to-end
- [ ] Payment flow tested (sandbox + production)
- [ ] Email templates tested
- [ ] Mobile responsive design verified
- [ ] PWA installable (manifest.json)
- [ ] SEO metadata added
- [ ] Analytics tracking verified
- [ ] Error monitoring working
- [ ] Backup strategy implemented
- [ ] Monitoring alerts configured
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Legal pages added (Terms, Privacy, Disclaimer)
- [ ] Support email configured
- [ ] Documentation complete

---

## Cost Estimates (Monthly)

| Service | Free Tier | Expected Cost |
|---------|-----------|---------------|
| **Vercel** | Hobby Plan | R0 (free) |
| **Firebase** | Spark Plan | R0-R500 (< 10k users) |
| **SendGrid** | 100 emails/day | R0 (within free tier) |
| **PayFast** | N/A | 3.9% + R2 per transaction |
| **Sentry** | 5k events/month | R0 (free) |
| **Domain** | N/A | R150/year |
| **SSL** | Let's Encrypt | R0 (free) |
| **Total** | | **~R200-R700/month** |

_Note: Costs scale with usage. At 100k users, expect R5k-R10k/month._

---

## Support & Resources

- **Documentation:** This file + ARCHITECTURE.md + FEATURES.md
- **Firebase Docs:** https://firebase.google.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **SendGrid Docs:** https://docs.sendgrid.com
- **PayFast Docs:** https://developers.payfast.co.za

---

*Last Updated: January 15, 2026*
