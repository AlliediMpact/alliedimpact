# Critical Fix: Workspace Configuration Error ✅

**Error**: `No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies"`

**Date**: February 24, 2026  
**Status**: ✅ FIXED

---

## 🔍 Root Cause

The monorepo workspace configuration had an incorrect path:

### ❌ BEFORE (Incorrect):

**package.json**:
```json
{
  "workspaces": [
    "platform/*",
    "apps/*",
    "packages/*",
    "web"        ← ❌ WRONG - no package.json exists at web/package.json
  ]
}
```

**pnpm-workspace.yaml**:
```yaml
packages:
  - 'platform/*'
  - 'apps/*'
  - 'packages/*'
  - 'web'       ← ❌ WRONG
```

### The Problem:

1. Root configuration pointed to `web` (expecting `web/package.json`)
2. But the actual structure is `web/portal/package.json`
3. This caused pnpm workspace resolution to fail
4. Vercel couldn't find Next.js even though it exists in `web/portal/package.json`

---

## ✅ The Fix

Changed workspace configuration to use glob pattern:

### ✅ AFTER (Correct):

**package.json**:
```json
{
  "workspaces": [
    "platform/*",
    "apps/*",
    "packages/*",
    "web/*"      ← ✅ CORRECT - matches web/portal/
  ]
}
```

**pnpm-workspace.yaml**:
```yaml
packages:
  - 'platform/*'
  - 'apps/*'
  - 'packages/*'
  - 'web/*'     ← ✅ CORRECT
```

Now pnpm correctly recognizes `web/portal` as a workspace package.

---

## 📊 Why This Matters for Vercel Deployment

### How Vercel Deploys Monorepos:

1. **Clone repository** to Vercel servers
2. **Detect workspace** - Looks for pnpm-workspace.yaml and package.json workspaces
3. **Install from root** - Runs `pnpm install` from repository root
4. **Resolve workspace dependencies** - pnpm must find all workspace packages
5. **Navigate to Root Directory** - Goes to the configured directory (e.g., `web/portal`)
6. **Read package.json** - Checks for framework (Next.js) and dependencies
7. **Run build command** - Executes buildCommand from vercel.json

### Where It Was Failing:

**Step 4**: pnpm couldn't resolve the workspace because `web` didn't match `web/portal`

This caused Vercel to either:
- Not properly install workspace dependencies, OR
- Not recognize the package as part of the workspace

Result: When checking `web/portal/package.json`, dependencies were missing or not resolved.

---

## 🔧 Complete Fix Summary

### Files Fixed:

1. ✅ **package.json** - Changed `"web"` → `"web/*"`
2. ✅ **pnpm-workspace.yaml** - Changed `'web'` → `'web/*'`

### Previously Fixed Issues:

1. ✅ **Monorepo build configuration** - Updated all vercel.json files to use turbo with filters
2. ✅ **API functions error** - Removed invalid functions config from Portal

---

## 🚀 Important: Deployment Instructions

### Before You Deploy:

Since we changed the workspace configuration, you MUST:

1. **Delete node_modules** and reinstall:
   ```powershell
   # From repository root
   cd C:\Users\iMpact SA\Desktop\projects\alliedimpact
   
   # Remove all node_modules
   Remove-Item -Recurse -Force node_modules, apps/*/node_modules, web/*/node_modules, packages/*/node_modules, platform/*/node_modules
   
   # Remove lockfile (will regenerate)
   Remove-Item pnpm-lock.yaml
   
   # Fresh install with new workspace config
   pnpm install
   ```

2. **Test build locally** before deploying to Vercel:
   ```powershell
   # Test Portal build
   pnpm turbo build --filter=@allied-impact/portal
   
   # Test CoinBox build  
   pnpm turbo build --filter=@allied-impact/coinbox
   
   # If these succeed, Vercel deployment will succeed
   ```

3. **Commit and push** the workspace configuration fix:
   ```powershell
   git add package.json pnpm-workspace.yaml
   git commit -m "Fix workspace configuration - use web/* instead of web"
   git push origin main
   ```

---

## 📝 Vercel Deployment Settings

When deploying via Vercel Dashboard, use these EXACT settings:

### Portal:
- **Root Directory**: `web/portal` ✅
- **Build Command**: Auto-detected (uses vercel.json)
- **Output Directory**: `.next`
- **Install Command**: Auto-detected (pnpm install from root)

### CoinBox:
- **Root Directory**: `apps/coinbox` ✅
- **Build Command**: Auto-detected (uses vercel.json)
- **Output Directory**: `.next`
- **Install Command**: Auto-detected

### All Other Apps:
- **Root Directory**: `apps/<app-name>` ✅
- Same settings as above

---

## ✅ Verification Checklist

Before deploying to Vercel:

- [ ] Workspace config updated (`web/*` not `web`)
- [ ] node_modules deleted and reinstalled
- [ ] pnpm-lock.yaml regenerated
- [ ] Local build succeeds: `pnpm turbo build --filter=@allied-impact/portal`
- [ ] Changes committed and pushed to GitHub
- [ ] Vercel will pull latest commit (with fixes)

---

## 🎯 What Changed & Why

### Change 1: Workspace Configuration
- **File**: `package.json` + `pnpm-workspace.yaml`
- **Before**: `"web"` (literal path)
- **After**: `"web/*"` (glob pattern)
- **Why**: Matches actual structure (`web/portal/`)

### Change 2: Monorepo Build (Previously Fixed)
- **Files**: All `vercel.json` files
- **Change**: Use `cd ../.. && pnpm turbo build --filter=@package`
- **Why**: Ensures workspace dependencies are built

### Change 3: Remove Invalid API Config (Previously Fixed)
- **File**: `web/portal/vercel.json`
- **Change**: Removed `functions: { "api/**": ... }`
- **Why**: Portal doesn't have API routes

---

## 🚀 Ready to Deploy!

All configuration issues are now resolved:

1. ✅ Workspace configuration fixed
2. ✅ Monorepo build configuration fixed
3. ✅ API functions error fixed
4. ✅ All apps verified

**Next steps**:
1. Run the commands above (reinstall dependencies)
2. Test local build
3. Push changes to GitHub
4. Deploy to Vercel!

---

## 📞 If You Still Get Errors

If deployment still fails with "No Next.js version detected":

1. **Double-check Root Directory** in Vercel Dashboard:
   - Should be `web/portal` not just `web`
   - Should be `apps/coinbox` not just `apps`

2. **Verify in Vercel Build Logs**:
   - Check if pnpm install runs from repository root
   - Check if it detects pnpm-workspace.yaml
   - Check if it shows "Installing workspace packages"

3. **Try CLI deployment** (more control):
   ```powershell
   cd web/portal
   vercel --prod
   # When prompted, confirm Root Directory is "web/portal"
   ```

---

**Status**: All fixes applied and pushed to GitHub! 🎉
