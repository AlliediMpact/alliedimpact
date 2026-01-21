# reCAPTCHA v3 Integration Guide

## Overview
SportsHub uses Google reCAPTCHA v3 to prevent bot voting and ensure vote authenticity. reCAPTCHA v3 runs invisibly in the background and assigns a score (0.0 to 1.0) based on user interactions.

## Setup Instructions

### 1. Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **"+"** to register a new site
3. Fill in:
   - **Label**: SportsHub CupFinal
   - **reCAPTCHA type**: reCAPTCHA v3
   - **Domains**: 
     - `localhost` (for development)
     - Your production domain (e.g., `sportshub.example.com`)
4. Accept terms and click **Submit**
5. Copy your:
   - **Site Key** (public, used in frontend)
   - **Secret Key** (private, used in Cloud Functions)

### 2. Configure Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
```

#### Cloud Functions (functions/.env)
```bash
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### 3. Test reCAPTCHA

1. **Development Mode**: If keys not configured, system uses bypass mode
2. **Production Mode**: Real verification with score threshold (0.5)

## How It Works

### Client-Side (Voting Page)
```typescript
import { generateRecaptchaToken } from '@/lib/recaptcha';

// Generate token before vote submission
const token = await generateRecaptchaToken('vote_submission');

// Include token in vote record
await addDoc(votesCollection, {
  userId: currentUser.uid,
  recaptchaToken: token,
  // ... other fields
});
```

### Server-Side (Cloud Functions)
```typescript
import { verifyRecaptchaToken, isValidRecaptchaScore } from './recaptcha';

// Verify token
const verification = await verifyRecaptchaToken(token);

if (!verification.success || !isValidRecaptchaScore(verification.score)) {
  throw new Error('Failed reCAPTCHA verification');
}
```

## Score Interpretation

- **0.0 - 0.4**: Likely bot (❌ Rejected)
- **0.5 - 0.6**: Suspicious (⚠️ Threshold)
- **0.7 - 1.0**: Likely human (✅ Accepted)

**Default Threshold**: 0.5 (configurable in `src/lib/recaptcha.ts`)

## Bypass Mode

When reCAPTCHA keys are not configured:
- Token generation returns `'bypass_token'`
- Verification returns `{ success: true, score: 1.0 }`
- Console warning: `"reCAPTCHA not configured - using bypass mode"`

**Use bypass mode for**:
- Local development without internet
- Testing environments
- Initial setup before getting keys

## Troubleshooting

### Issue: "reCAPTCHA not loaded"
**Solution**: Check that RecaptchaLoader component is in layout:
```tsx
// src/app/layout.tsx
import RecaptchaLoader from '@/components/RecaptchaLoader';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RecaptchaLoader />
        {children}
      </body>
    </html>
  );
}
```

### Issue: "Invalid site key"
**Solution**: 
1. Verify NEXT_PUBLIC_RECAPTCHA_SITE_KEY matches Google Console
2. Restart Next.js dev server after adding env variable
3. Check domain is registered in reCAPTCHA console

### Issue: Low scores in production
**Solution**:
1. Ensure reCAPTCHA badge is visible on page
2. Don't call `executeRecaptcha()` immediately on page load
3. Let users interact with page before voting
4. Adjust threshold if needed (lower = more lenient)

### Issue: "Verification request failed"
**Solution**:
1. Check Cloud Functions have internet access
2. Verify RECAPTCHA_SECRET_KEY is set correctly
3. Check logs: `firebase functions:log`

## Testing

### Test Valid Vote (Development)
1. Without keys: Should use bypass mode ✅
2. With keys: Check browser console for reCAPTCHA logs
3. Submit vote: Should succeed if balance sufficient

### Test Bot Prevention (Production)
1. Deploy with real keys
2. Rapid automated requests should get low scores
3. Check Cloud Functions logs for verification results

## Security Notes

- ⚠️ **Never expose RECAPTCHA_SECRET_KEY** in client code
- ✅ Secret key only used in Cloud Functions
- ✅ Site key is public and safe to expose
- 🔒 Verification happens server-side only
- 📊 Monitor score distributions in production

## Cost

Google reCAPTCHA v3 is **FREE** for:
- Up to 1 million assessments per month
- Standard protection features

Enterprise features (advanced analytics) require reCAPTCHA Enterprise.

## Next Steps

1. ✅ Keys configured in environment variables
2. ✅ RecaptchaLoader added to layout
3. ✅ Vote submission includes token
4. ✅ Cloud Function verifies token
5. 🎯 Monitor scores in production
6. 🎯 Adjust threshold if needed

---

**Documentation Last Updated**: $(Get-Date -Format "yyyy-MM-dd")
