# Vercel Environment Variables - Quick Import Guide

This directory contains `.env.vercel` files for each app with standardized environment variables ready for Vercel import.

## 📋 How to Import to Vercel

### Method 1: Bulk Import (Recommended)

1. **Go to Vercel Dashboard** → Select your project
2. **Settings** → **Environment Variables**
3. **Click "Add New"** → **Switch to "Bulk Edit"** mode
4. **Copy-paste** the entire contents of the corresponding `.env.vercel` file
5. **Select environment**: Production, Preview, Development (or all)
6. **Click "Save"**

### Method 2: CLI Import

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Navigate to app directory
cd apps/coinbox

# Import environment variables
vercel env pull .env.vercel.local
```

## 🔐 Important Notes

### Firebase Private Key

The `FIREBASE_PRIVATE_KEY` cannot be included in these files for security.

**To add it:**
1. Open your app's `firebase-admin.json` file
2. Copy the `private_key` value
3. In Vercel, add it as a separate environment variable:
   - Name: `FIREBASE_PRIVATE_KEY`
   - Value: Paste the entire private key (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
   - **Important**: The key will automatically be escaped by Vercel

### Values to Replace

Before deploying, replace these placeholder values:

| Variable | Where to Get |
|----------|-------------|
| `REPLACE_FROM_FIREBASE_CONSOLE` | Firebase Console → Project Settings → General |
| `REPLACE_FROM_FIREBASE_ANALYTICS` | Firebase Console → Analytics → Data Streams → Measurement ID |
| `REPLACE_WITH_SECURE_RANDOM_KEY_IN_PRODUCTION` | Generate: `openssl rand -base64 32` |
| `REPLACE_WITH_SENDGRID_API_KEY` | SendGrid Dashboard → API Keys |
| `REPLACE_WITH_UPSTASH_REST_URL` | Upstash Console → Redis → REST API → URL |
| `REPLACE_WITH_UPSTASH_REST_TOKEN` | Upstash Console → Redis → REST API → Token |
| `REPLACE_WITH_PAYSTACK_PUBLIC_KEY` | Paystack Dashboard → Settings → API Keys (use `pk_live_` for production) |
| `REPLACE_WITH_PAYSTACK_SECRET_KEY` | Paystack Dashboard → Settings → API Keys (use `sk_live_` for production) |
| `REPLACE_WITH_SECURE_TOKEN` | Generate: `openssl rand -base64 32` |

## 📱 Apps and Their Firebase Projects

| App | Firebase Project | Payment Gateway |
|-----|------------------|-----------------|
| **Portal** | allied-impact-platform | N/A |
| **MyProjects** | allied-impact-platform | N/A |
| **CoinBox** | coinbox-ddc10 | ✅ Paystack |
| **CareerBox** | careerbox-64e54 | N/A |
| **DriveMaster** | drivemaster-513d9 | N/A |
| **EduTech** | edutech-4f548 | N/A |
| **SportsHub** | sportshub-526df | ✅ Paystack |
| **ControlHub** | controlhub-6376f | N/A |

## 🔄 Platform Integration

All apps (except Portal and ControlHub) need these variables for platform integration:

```bash
CONTROLHUB_API_URL=https://controlhub.alliedimpact.co.za/api
CONTROLHUB_API_TOKEN=<secure-token>
```

ControlHub needs API tokens for each app to authenticate metrics/events from them.

## 🎯 Next Steps

1. ✅ Copy `.env.vercel` contents to Vercel
2. ✅ Add `FIREBASE_PRIVATE_KEY` separately
3. ✅ Replace all `REPLACE_WITH_*` placeholders
4. ✅ Generate secure random keys for `AUTH_SECRET_KEY` and `SESSION_SECRET`
5. ✅ Configure production SMTP (SendGrid recommended)
6. ✅ Set up Upstash Redis for rate limiting
7. ✅ For CoinBox and SportsHub: Switch to Paystack LIVE keys
8. ✅ Deploy!

## 🛡️ Security Checklist

- [ ] All `REPLACE_WITH_*` values replaced
- [ ] No test/development keys in production
- [ ] `FIREBASE_PRIVATE_KEY` added to Vercel (not in file)
- [ ] Secure random strings generated for secrets
- [ ] SMTP credentials for production email
- [ ] Paystack LIVE keys for production (not TEST)
- [ ] Environment set to "Production" in Vercel
- [ ] `NODE_ENV=production` set

---

**Generated**: 2026-02-26  
**Status**: Ready for Vercel import ✅
