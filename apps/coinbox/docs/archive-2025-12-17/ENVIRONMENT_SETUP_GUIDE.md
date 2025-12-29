# Environment Variable Setup Guide

## Overview
This guide explains how to properly configure environment variables for the CoinBox application. Proper configuration is critical for security and functionality.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual values** (never use the example values in production)

3. **Verify .gitignore contains:**
   ```
   .env
   .env.local
   .env*.local
   ```

## Required Environment Variables

### 1. Paystack Configuration
Get your API keys from [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer).

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_here
```

**Important:**
- Use `pk_test_` and `sk_test_` for development/testing
- Use `pk_live_` and `sk_live_` for production
- **NEVER** expose your secret key in client-side code
- Keep test and production keys separate

### 2. Firebase Configuration

#### Client-side (Public)
Get from: Firebase Console > Project Settings > General > Your apps

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

#### Admin SDK (Server-side only)
Get from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key

**Option 1: Service Account File (Recommended)**
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_PATH=./secrets/firebase-admin.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

Download the JSON file and save it to `./secrets/firebase-admin.json`

**Option 2: Environment Variable (For Vercel/Serverless)**
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

**Security Notes:**
- Admin keys have full database access - protect them
- Use different Firebase projects for dev/staging/production
- Enable Firebase App Check in production

### 3. Google AI Configuration
Get from: [Google AI Studio](https://makersuite.google.com/app/apikey)

```env
GOOGLE_AI_API_KEY=AIza...
```

**Rate Limits:**
- Free tier: 60 requests per minute
- Monitor usage in Google Cloud Console
- Consider upgrading for production workloads

### 4. Luno API Configuration
Get from: [Luno API Keys](https://www.luno.com/wallet/security/api_keys)

```env
LUNO_API_KEY_ID=your_key_id
LUNO_API_KEY_SECRET=your_secret
```

**Important:**
- Use sandbox credentials for testing
- Production keys should have IP whitelist restrictions
- Enable 2FA on your Luno account
- Store production keys in secure vault (AWS Secrets Manager, etc.)

### 5. Application Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:9004
NEXT_PUBLIC_BASE_URL=http://localhost:9004
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development
```

**Production values:**
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
```

### 6. Authentication Configuration

```env
AUTH_SECRET_KEY=your-256-bit-random-string
AUTH_SESSION_EXPIRES_IN=7d
CRON_SECRET=another-random-string
```

**Generate secure random strings:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Environment-Specific Setup

### Development (.env.local)
- Use test API keys
- Use Firebase emulator if possible
- Enable debug logging
- Use localhost URLs

### Staging (.env.staging)
- Use staging API keys
- Use separate Firebase project
- Mirror production configuration
- Test with real payment processors (test mode)

### Production (.env.production)
- Use live API keys
- Strict security settings
- Enable all monitoring
- Use CDN URLs
- Enable rate limiting

## Security Best Practices

### ✅ DO:
1. **Use different keys for each environment**
2. **Store production keys in secure vaults** (Vercel env vars, AWS Secrets Manager)
3. **Rotate keys regularly** (quarterly or after exposure)
4. **Monitor API usage** for unusual patterns
5. **Enable IP restrictions** where possible (Luno, Paystack)
6. **Use Firebase App Check** in production
7. **Audit access logs** regularly

### ❌ DON'T:
1. **NEVER commit .env files** to git
2. **NEVER share API keys** via Slack/email/chat
3. **NEVER use production keys** in development
4. **NEVER log API keys** to console/files
5. **NEVER use example values** in production
6. **NEVER disable security features** for convenience

## API Key Rotation Process

If an API key is exposed:

### Immediate Actions (Within 1 hour):
1. **Revoke exposed key** in provider dashboard
2. **Generate new key** 
3. **Update production environment** variables
4. **Restart all services**
5. **Monitor for unauthorized usage**

### Paystack Key Rotation:
1. Go to: Settings > API Keys & Webhooks
2. Click "Roll Keys"
3. Update `PAYSTACK_SECRET_KEY` in production
4. Deploy changes
5. Verify webhooks still work

### Firebase Key Rotation:
1. Go to: Project Settings > Service Accounts
2. Generate new private key
3. Update `FIREBASE_PRIVATE_KEY_PATH` or `FIREBASE_PRIVATE_KEY`
4. Delete old service account key
5. Test authentication

### Luno Key Rotation:
1. Go to: Security > API Keys
2. Create new API key with same permissions
3. Update `LUNO_API_KEY_ID` and `LUNO_API_KEY_SECRET`
4. Delete old API key
5. Test crypto operations

### Google AI Key Rotation:
1. Go to: Google AI Studio > API Keys
2. Create new API key
3. Update `GOOGLE_AI_API_KEY`
4. Delete old key
5. Test AI predictions

## Deployment Checklist

### Before Deploying:
- [ ] All required environment variables set
- [ ] Production keys verified (not test keys)
- [ ] Different keys used than development
- [ ] Sensitive keys stored in secure vault
- [ ] .env files in .gitignore
- [ ] No hardcoded secrets in code
- [ ] Firebase security rules deployed
- [ ] Rate limiting enabled
- [ ] Monitoring configured

### Vercel Deployment:
1. Go to: Project Settings > Environment Variables
2. Add each variable individually
3. Set environment: Production / Preview / Development
4. Click "Save"
5. Redeploy project

### AWS/Docker Deployment:
1. Use AWS Secrets Manager or Parameter Store
2. Mount secrets as environment variables
3. Use IAM roles instead of hardcoded keys
4. Enable CloudWatch logging

## Verification

After setting up environment variables:

```bash
# Check if .env.local exists and is not tracked by git
git status | grep -q ".env.local" && echo "WARNING: .env.local is tracked!" || echo "✓ .env.local not tracked"

# Verify required variables are set (development)
node -e "
const required = [
  'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
  'PAYSTACK_SECRET_KEY',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'FIREBASE_PROJECT_ID',
  'GOOGLE_AI_API_KEY'
];
require('dotenv').config({ path: '.env.local' });
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.log('❌ Missing:', missing.join(', '));
  process.exit(1);
} else {
  console.log('✓ All required variables set');
}
"
```

## Troubleshooting

### "Firebase not initialized" error:
- Check `FIREBASE_PRIVATE_KEY_PATH` exists
- Verify service account JSON is valid
- Ensure file has read permissions

### "Paystack authentication failed":
- Verify you're using the correct key (test vs live)
- Check for extra spaces/newlines in key
- Confirm key hasn't been revoked

### "Rate limit exceeded":
- Check Google AI quota in Cloud Console
- Verify rate limiting is configured correctly
- Consider upgrading API tier

### "Unauthorized" on API routes:
- Verify `AUTH_SECRET_KEY` is set
- Check Firebase ID token is being sent
- Confirm user has correct permissions

## Support

For security concerns or questions:
- Email: security@coinboxconnect.com
- Slack: #security-alerts (internal)
- Documentation: /docs/security/

## Related Documentation
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
- [Authentication System Guide](./auth-system-summary.md)
- [Firebase Setup Guide](./FIREBASE_EMULATOR_TESTING.md)
