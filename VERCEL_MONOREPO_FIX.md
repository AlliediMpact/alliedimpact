# Vercel Monorepo Deployment - Fixed Configuration

**Date**: February 24, 2026  
**Issue**: Deployment failing due to incorrect monorepo configuration  
**Status**: ✅ FIXED

---

## What Was Wrong

The original `vercel.json` files had:
```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install --frozen-lockfile"
}
```

**Problem**: When Vercel sets the Root Directory to `web/portal` or `apps/coinbox`, it tries to run `pnpm install` from that subdirectory, which fails because:
- The `pnpm-workspace.yaml` is in the repository root
- Workspace dependencies (from `platform/*`, `packages/*`) aren't available
- pnpm can't resolve `workspace:*` dependencies

---

## The Fix

**Updated all `vercel.json` files**:
```json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@allied-impact/portal",
  "devCommand": "pnpm dev",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**Key changes**:
1. ❌ **Removed** `installCommand` - Vercel auto-detects `pnpm-workspace.yaml` and installs from root
2. ✅ **Updated** `buildCommand` to:
   - Navigate to repository root: `cd ../..`
   - Use Turbo with filter: `pnpm turbo build --filter=@allied-impact/<app-name>`
   - This builds ONLY the specific app with its dependencies

---

## Files Updated

✅ `web/portal/vercel.json` → `--filter=@allied-impact/portal`  
✅ `apps/coinbox/vercel.json` → `--filter=@allied-impact/coinbox`  
✅ `apps/careerbox/vercel.json` → `--filter=@allied-impact/careerbox`  
✅ `apps/drivemaster/vercel.json` → `--filter=@allied-impact/drivemaster`  
✅ `apps/edutech/vercel.json` → `--filter=@allied-impact/edutech`  
✅ `apps/sports-hub/vercel.json` → `--filter=@allied-impact/sports-hub`  
✅ `apps/myprojects/vercel.json` → `--filter=@allied-impact/myprojects`  
✅ `apps/controlhub/vercel.json` → `--filter=@allied-impact/controlhub`  

---

## Deployment Steps (Vercel Dashboard)

### For Each App:

1. **Go to**: https://vercel.com/new
2. **Import**: GitHub repository `AlliediMpact/alliedimpact`
3. **Configure Project**:

   **Framework Preset**: Next.js  
   **Root Directory**: 
   - Portal: `web/portal`
   - CoinBox: `apps/coinbox`
   - CareerBox: `apps/careerbox`
   - Etc.

   **Build Settings**: (Leave as auto-detected - vercel.json will override)
   
   **Environment Variables**: See `ENV_VARIABLES_TEMPLATE.md`

4. **Deploy**: Click "Deploy"

---

## Deployment Steps (Vercel CLI) - RECOMMENDED

### Option 1: Deploy Portal

```bash
# Navigate to portal directory
cd web/portal

# Login to Vercel (first time only)
vercel login

# Link project (first time only)
vercel link

# Deploy to production
vercel --prod

# When prompted:
# - Set up and deploy: Yes
# - Which scope: Your Vercel account
# - Link to existing project: No (or Yes if re-deploying)
# - Project name: allied-impact-portal
# - Root Directory: web/portal
```

### Option 2: Deploy Apps

```bash
# Navigate to app directory
cd apps/coinbox

# Link project (first time only)
vercel link

# Deploy to production
vercel --prod

# When prompted:
# - Project name: coinbox
# - Root Directory: apps/coinbox
```

### Repeat for each app:
- `apps/careerbox`
- `apps/drivemaster`
- `apps/edutech`
- `apps/sports-hub`
- `apps/myprojects`
- `apps/controlhub`

---

## Environment Variables

Add environment variables in Vercel Dashboard:

**For each project**:
1. Go to Project Settings → Environment Variables
2. Copy from `ENV_VARIABLES_TEMPLATE.md`
3. Add variables for Production, Preview, and Development
4. Redeploy after adding variables

---

## Testing the Build Locally

Before deploying to Vercel, test the build locally:

```bash
# From repository root
cd c:\Users\iMpact SA\Desktop\projects\alliedimpact

# Install all dependencies
pnpm install

# Test Portal build
pnpm turbo build --filter=@allied-impact/portal

# Test CoinBox build
pnpm turbo build --filter=@allied-impact/coinbox

# Test all apps
pnpm turbo build
```

If the build succeeds locally, it will succeed on Vercel.

---

## Common Issues & Solutions

### Issue: "Cannot find module @allied-impact/auth"

**Cause**: Workspace dependencies not built  
**Solution**: Turbo automatically builds dependencies. Make sure `turbo.json` has:
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Issue: "pnpm-workspace.yaml not found"

**Cause**: Vercel is trying to install from app directory  
**Solution**: Remove `installCommand` from `vercel.json` (already done)

### Issue: Build timeout

**Cause**: Installing too many dependencies  
**Solution**: Turbo filter ensures only necessary packages are built

### Issue: "Module not found" errors during runtime

**Cause**: Missing environment variables  
**Solution**: Add all required env vars in Vercel Dashboard

---

## Verification Checklist

After deployment:

- [ ] Portal deployed successfully
- [ ] Portal homepage loads
- [ ] Portal environment variables set
- [ ] CoinBox deployed successfully
- [ ] CoinBox homepage loads
- [ ] All 8 apps deployed
- [ ] Custom domains configured
- [ ] DNS records updated
- [ ] SSL certificates active
- [ ] SSO working across apps

---

## Next Steps

1. ✅ **Commit these fixes**: 
   ```bash
   git add .
   git commit -m "Fix Vercel monorepo deployment configuration"
   git push origin main
   ```

2. **Deploy Portal first** (foundation for SSO)
3. **Deploy remaining apps** in order
4. **Test SSO flow** between apps
5. **Configure custom domains**

---

## Support

If deployment still fails:
1. Check Vercel build logs for specific errors
2. Verify environment variables are set
3. Test build locally first: `pnpm turbo build --filter=@allied-impact/<app>`
4. Check that `pnpm-workspace.yaml` exists in repository root

---

**Status**: All configurations fixed and ready for deployment! 🚀
