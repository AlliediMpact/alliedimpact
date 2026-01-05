# My Projects - Production Deployment Guide

## Prerequisites

- Node.js 18+ and pnpm installed
- Firebase account with Blaze (pay-as-you-go) plan
- Firebase CLI installed: `npm install -g firebase-tools`
- Git repository access

## 1. Firebase Project Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name: `allied-impact-myprojects` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Wait for project creation

### Enable Required Services

**Authentication:**
1. Navigate to Authentication → Get Started
2. Enable Email/Password provider
3. (Optional) Enable other providers as needed

**Firestore Database:**
1. Navigate to Firestore Database → Create Database
2. Start in **production mode** (we'll deploy rules)
3. Choose region closest to your users (e.g., `us-central1`)
4. Wait for database creation

**Storage:**
1. Navigate to Storage → Get Started
2. Start in **production mode**
3. Use same region as Firestore
4. Wait for storage bucket creation

### Get Firebase Configuration

1. Go to Project Settings → General
2. Scroll to "Your apps" section
3. Click "Add app" → Web (</>) icon
4. Register app with nickname: `my-projects-web`
5. Copy the config object (you'll need this)

```javascript
// Example config (DO NOT use these values)
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## 2. Environment Configuration

### Create Environment Files

**For Local Development (`.env.local`):**

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3006
NODE_ENV=development
```

**For Production (Vercel/hosting provider):**

Set the same environment variables in your hosting provider's dashboard.

### Environment Variable Checklist

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` - From Firebase config
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - From Firebase config
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - From Firebase config
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - From Firebase config
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - From Firebase config
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` - From Firebase config
- [ ] `NEXT_PUBLIC_APP_URL` - Your production URL

## 3. Deploy Firebase Security Rules

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase in Project (First Time Only)

```bash
cd apps/myprojects
firebase init
```

Select:
- [x] Firestore
- [x] Storage

When prompted:
- Use existing project: Select your Firebase project
- Firestore rules file: `firestore.rules` (already exists)
- Storage rules file: `storage.rules` (already exists)

### Deploy Security Rules

```bash
# From apps/myprojects directory
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Verify Rules Deployed

1. Go to Firebase Console → Firestore Database → Rules
2. Verify your rules are active
3. Go to Storage → Rules
4. Verify storage rules are active

## 4. Build and Deploy Application

### Test Build Locally

```bash
# From monorepo root
pnpm install
pnpm run build --filter=myprojects
```

Fix any build errors before deploying.

### Deploy to Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy:

```bash
cd apps/myprojects
vercel --prod
```

4. Set environment variables in Vercel dashboard
5. Redeploy if needed: `vercel --prod`

### Deploy to Other Platforms

**Netlify:**
```bash
# Build command
pnpm run build --filter=myprojects

# Output directory
apps/myprojects/.next
```

**Self-hosted:**
```bash
# Build
pnpm run build --filter=myprojects

# Start
pnpm run start --filter=myprojects
```

## 5. Post-Deployment Checklist

### Functional Testing

- [ ] Visit production URL
- [ ] Test signup flow (create new user)
- [ ] Test login flow
- [ ] Create a test project
- [ ] Add milestone to project
- [ ] Upload deliverable with file
- [ ] Create ticket
- [ ] Add comment to ticket
- [ ] Verify real-time updates work
- [ ] Test file download from deliverable

### Security Verification

- [ ] Try accessing another user's project (should fail)
- [ ] Try uploading 11MB file (should fail - 10MB limit)
- [ ] Try uploading .exe file (should fail - not allowed)
- [ ] Verify unauthenticated users can't access data

### Performance Testing

- [ ] Test page load speed (aim for < 3s)
- [ ] Test file upload speed
- [ ] Test with multiple projects (5+)
- [ ] Test with 10+ milestones
- [ ] Check Firebase usage in console

### Monitoring Setup

1. **Firebase Console:**
   - Check Authentication → Users (new signups working)
   - Check Firestore → Usage (requests count)
   - Check Storage → Files (uploads working)
   - Set up budget alerts (Settings → Usage and billing)

2. **Vercel Dashboard:**
   - Check deployment logs
   - Monitor function execution times
   - Set up error alerts

3. **Browser Console:**
   - Check for JavaScript errors
   - Verify no Firebase errors
   - Check network tab for failed requests

## 6. Firebase Quotas and Pricing

### Free Tier Limits (Spark Plan)

- **Firestore:** 50k reads/day, 20k writes/day, 1GB storage
- **Storage:** 5GB storage, 1GB downloads/day
- **Authentication:** Unlimited

### Blaze Plan (Pay-as-you-go)

Required for production. Pricing:
- **Firestore:** $0.06 per 100k reads, $0.18 per 100k writes
- **Storage:** $0.026/GB stored, $0.12/GB downloaded
- **Authentication:** Free

**Estimated Monthly Cost for 100 users:**
- 100 users × 30 days × 100 reads/day = 300k reads = $0.18
- 100 users × 10 writes/day = 30k writes = $0.05
- 1GB storage + 10GB transfer = $0.14
- **Total: ~$0.40/month** (scales linearly)

### Set Budget Alerts

1. Firebase Console → Settings → Usage and billing
2. Set budget alert at $10/month
3. Receive email when approaching limit

## 7. Maintenance Tasks

### Weekly

- Review Firebase Console for errors
- Check user feedback/support tickets
- Monitor storage usage growth
- Review authentication logs

### Monthly

- Review Firebase billing
- Update dependencies: `pnpm update`
- Review and optimize slow queries
- Backup Firestore data: `firebase firestore:export backup-YYYY-MM`

### As Needed

- Update Firebase security rules when adding features
- Scale Firebase resources if hitting limits
- Update Node.js/Next.js versions
- Review and optimize bundle size

## 8. Troubleshooting

### "Permission denied" errors

- Verify security rules deployed correctly
- Check user is authenticated
- Verify user has access to resource

### Files not uploading

- Check Storage rules deployed
- Verify file size < 10MB
- Check file type is allowed
- Check browser console for errors

### Real-time updates not working

- Verify Firestore rules allow reads
- Check WebSocket connection in browser
- Verify listener subscriptions in code

### Build failing

- Run `pnpm install` to update dependencies
- Clear Next.js cache: `rm -rf apps/myprojects/.next`
- Check for TypeScript errors: `pnpm run type-check`

## 9. Rollback Procedure

If production issues occur:

1. **Revert application code:**
```bash
git revert HEAD
git push
vercel --prod
```

2. **Revert Firebase rules:**
```bash
git checkout HEAD~1 firestore.rules storage.rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
git checkout HEAD firestore.rules storage.rules
```

3. **Emergency hotfix:**
- Fix issue locally
- Test thoroughly
- Fast-track deployment

## 10. Support and Documentation

- **Firebase Documentation:** https://firebase.google.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Vercel Documentation:** https://vercel.com/docs
- **Project Repository:** [Your repo URL]
- **Support Contact:** [Your email/Slack]

## Quick Reference

```bash
# Deploy everything
firebase deploy

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Storage rules
firebase deploy --only storage:rules

# View Firebase logs
firebase functions:log

# Export Firestore data
firebase firestore:export backup-folder

# Import Firestore data
firebase firestore:import backup-folder
```

---

**Last Updated:** January 2025
**Next Review:** Monthly
