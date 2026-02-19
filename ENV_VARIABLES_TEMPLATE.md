# 🔐 Environment Variables - Quick Reference for Vercel Deployment

**Copy these to Vercel Dashboard → Project Settings → Environment Variables**

---

## 1. Portal (alliedimpact.co.za)

```bash
# Firebase Configuration (Get from Firebase Console → Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=allied-impact-platform.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=allied-impact-platform
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=allied-impact-platform.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App Configuration
NEXT_PUBLIC_APP_URL=https://alliedimpact.co.za
NEXT_PUBLIC_API_URL=https://alliedimpact.co.za

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
```

**Where to get values**:
- Go to https://console.firebase.google.com
- Select project: `allied-impact-platform`
- Go to Project Settings → General → Your apps → SDK setup
- Copy all values

---

## 2. CoinBox (coinbox.alliedimpact.co.za)

```bash
# Paystack (Get from https://dashboard.paystack.com/#/settings/developer)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_
PAYSTACK_SECRET_KEY=sk_live_

# Firebase Configuration (Project: coinbox-ddc10)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=coinbox-ddc10.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=coinbox-ddc10
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=coinbox-ddc10.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://coinbox-ddc10.firebaseio.com

# Firebase Admin SDK (Download JSON from Firebase → Service Accounts)
FIREBASE_PROJECT_ID=coinbox-ddc10
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# App URLs
NEXT_PUBLIC_APP_URL=https://coinbox.alliedimpact.co.za
NEXT_PUBLIC_BASE_URL=https://coinbox.alliedimpact.co.za
NEXT_PUBLIC_VERIFICATION_REDIRECT_URL=https://coinbox.alliedimpact.co.za/auth/verify-email
NEXT_PUBLIC_DASHBOARD_URL=https://alliedimpact.co.za

# Google AI (Get from https://makersuite.google.com/app/apikey)
GOOGLE_AI_API_KEY=

# Luno API (Get from https://www.luno.com/wallet/security/api_keys)
LUNO_API_KEY_ID=
LUNO_API_KEY_SECRET=

# Authentication
AUTH_SECRET_KEY=
AUTH_SESSION_EXPIRES_IN=7d
NEXT_PUBLIC_AUTH_ERROR_PAGE=/auth/error
NEXT_PUBLIC_AUTH_SIGNIN_PAGE=/auth

# Email Configuration (Optional - for production emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@coinboxconnect.com
EMAIL_SECURE=false

# Security
CRON_SECRET=
NEXT_PUBLIC_CSP_HEADERS=true

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
```

**Generate secure secrets**:
```powershell
# Run in PowerShell to generate random strings
-join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
# Run twice for AUTH_SECRET_KEY and CRON_SECRET
```

---

## 3. CareerBox (careerbox.alliedimpact.co.za)

```bash
# Firebase Configuration (Project: careerbox-64e54)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=careerbox-64e54.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=careerbox-64e54
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=careerbox-64e54.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App Configuration
NEXT_PUBLIC_APP_URL=https://careerbox.alliedimpact.co.za

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
```

---

## 4. DriveMaster (drivemaster.alliedimpact.co.za)

```bash
# Firebase Configuration (Project: drivemaster-513d9)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=drivemaster-513d9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=drivemaster-513d9
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=drivemaster-513d9.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App Configuration
NEXT_PUBLIC_APP_URL=https://drivemaster.alliedimpact.co.za

# Environment
NODE_ENV=production
```

---

## 5. EduTech (edutech.alliedimpact.co.za)

```bash
# Firebase Configuration (Project: edutech-4f548)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=edutech-4f548.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=edutech-4f548
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=edutech-4f548.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App Configuration
NEXT_PUBLIC_APP_URL=https://edutech.alliedimpact.co.za

# Environment
NODE_ENV=production
```

---

## 6. SportsHub (sportshub.alliedimpact.co.za)

```bash
# Firebase Configuration (Project: sportshub-526df)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sportshub-526df.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sportshub-526df
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sportshub-526df.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# PayFast Configuration (Get from https://www.payfast.co.za)
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=

# reCAPTCHA (Get from https://www.google.com/recaptcha/admin)
RECAPTCHA_SECRET_KEY=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=

# App Configuration
NEXT_PUBLIC_APP_URL=https://sportshub.alliedimpact.co.za

# Environment
NODE_ENV=production
```

---

## 7. MyProjects (myprojects.alliedimpact.co.za)

```bash
# Firebase Configuration (Shares with Portal: allied-impact-platform)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=allied-impact-platform.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=allied-impact-platform
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=allied-impact-platform.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App Configuration
NEXT_PUBLIC_APP_URL=https://myprojects.alliedimpact.co.za

# Environment
NODE_ENV=production
```

---

## 8. ControlHub (controlhub.alliedimpact.co.za)

```bash
# Firebase Configuration (Project: controlhub-6376f)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controlhub-6376f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controlhub-6376f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controlhub-6376f.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App Configuration
NEXT_PUBLIC_APP_URL=https://controlhub.alliedimpact.co.za

# Environment
NODE_ENV=production
```

---

## How to Get Firebase Configuration Values

### For Each Firebase Project:

1. Go to https://console.firebase.google.com
2. Select your project
3. Click ⚙️ (Settings) → Project settings
4. Scroll to "Your apps" section
5. If no web app exists, click "Add app" → Web platform
6. Copy all values from the SDK configuration snippet

### Firebase Admin SDK (CoinBox only):

1. In Firebase Console → Project Settings
2. Go to "Service Accounts" tab
3. Click "Generate new private key"
4. Download JSON file
5. Extract these values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep quotes and newlines!)

**Important**: For `FIREBASE_PRIVATE_KEY` in Vercel, paste the entire value including `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

---

## How to Add Variables in Vercel

### Method 1: Via Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. For each variable:
   - Enter name (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - Enter value
   - Select: Production, Preview, Development (all 3)
   - Click "Add"
5. After adding all, redeploy

### Method 2: Bulk Import

1. Copy all variables for an app to a `.env` file
2. In Vercel Dashboard → Settings → Environment Variables
3. Click "Add Another" → Paste entire `.env` content
4. Vercel will parse and add all at once

---

## Verification Checklist

After adding environment variables for each app:

- [ ] All `NEXT_PUBLIC_` variables set (visible in browser)
- [ ] All secret variables set (server-side only)
- [ ] Firebase project IDs match
- [ ] App URLs use HTTPS and correct subdomain
- [ ] Payment gateway keys are LIVE (not test)
- [ ] All variables set for Production, Preview, Development
- [ ] Redeployed after adding variables

---

## Security Reminders

**🔒 Never commit these values to git!**

- [ ] `.env` and `.env.local` in `.gitignore`
- [ ] Service account JSON files in `secrets/` (gitignored)
- [ ] `FIREBASE_PRIVATE_KEY` properly formatted with `\n`
- [ ] Use different keys for dev vs production
- [ ] Regularly rotate API keys
- [ ] Monitor Vercel logs for exposed secrets

---

**Next Step**: After filling in all values, proceed to actual deployment in Vercel!
