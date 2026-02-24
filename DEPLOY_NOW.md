# Quick Deployment Commands - Vercel

## ✅ Configuration Fixed!

All `vercel.json` files have been updated with proper monorepo support.

---

## 🚀 Deploy Now (Choose One Method)

### Method 1: Vercel Dashboard (Recommended for First Deploy)

1. Go to: **https://vercel.com/new**
2. Import repository: **AlliediMpact/alliedimpact**
3. For **Portal**, configure:
   - **Root Directory**: `web/portal`
   - **Framework**: Next.js (auto-detected)
   - Add environment variables (see ENV_VARIABLES_TEMPLATE.md)
4. Click **Deploy**

Repeat for each app with their respective Root Directories:
- Portal: `web/portal`
- CoinBox: `apps/coinbox`
- CareerBox: `apps/careerbox`
- DriveMaster: `apps/drivemaster`
- EduTech: `apps/edutech`
- SportsHub: `apps/sports-hub`
- MyProjects: `apps/myprojects`
- ControlHub: `apps/controlhub`

---

### Method 2: Vercel CLI (Faster for Multiple Apps)

#### First-Time Setup:

```powershell
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

#OR verify it's installed
vercel --version
```

#### Deploy Portal:

```powershell
# Navigate to portal
cd web\portal

# Login to Vercel (first time only)
vercel login

# Link and deploy
vercel --prod

# When prompted:
# - Set up and deploy: Yes
# - Link to existing project: No
# - Project name: allied-impact-portal  
# - Root Directory: web/portal  ← IMPORTANT!
```

#### Deploy Each App:

```powershell
# CoinBox
cd ..\..\apps\coinbox
vercel --prod
# Root Directory: apps/coinbox

# CareerBox
cd ..\careerbox
vercel --prod
# Root Directory: apps/careerbox

# DriveMaster
cd ..\drivemaster
vercel --prod
# Root Directory: apps/drivemaster

# EduTech
cd ..\edutech
vercel --prod
# Root Directory: apps/edutech

# SportsHub
cd ..\sports-hub
vercel --prod
# Root Directory: apps/sports-hub

# MyProjects
cd ..\myprojects
vercel --prod
# Root Directory: apps/myprojects

# ControlHub
cd ..\controlhub
vercel --prod
# Root Directory: apps/controlhub
```

---

## ⚙️ After Deployment: Add Environment Variables

For EACH deployed app:

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Copy variables from `ENV_VARIABLES_TEMPLATE.md` for that specific app
3. Add each variable:
   - Select environment: **Production, Preview, Development**
   - Click **Save**
4. **Redeploy** after adding variables:
   - Go to **Deployments** tab
   - Click **...** on latest deployment
   - Click **Redeploy**

---

## 🔧 What Was Fixed

The issue was in the `vercel.json` configuration:

**BEFORE** (❌ Broken):
```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install --frozen-lockfile"
}
```

**Problem**: When Vercel set Root Directory to `web/portal`, it tried to install from there,  
but workspace dependencies are in the repository root.

**AFTER** (✅ Fixed):  
```json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@allied-impact/portal"
}
```

**Solution**:
- Removed `installCommand` - Vercel auto-detects `pnpm-workspace.yaml` and installs from root
- Updated `buildCommand` to use Turbo with filter
- Build runs from root but only builds the specific app + its dependencies

---

## ✅ Verification Commands (Run These BEFORE Deploying)

Test builds locally to ensure they work:

```powershell
# Navigate to repository root
cd C:\Users\iMpact SA\Desktop\projects\alliedimpact

# Test Portal build
cd web\portal
cd ..\..
pnpm turbo build --filter=@allied-impact/portal

# Test CoinBox build
pnpm turbo build --filter=@allied-impact/coinbox

# If these succeed, Vercel deployment will succeed!
```

---

## 📝 Environment Variables Checklist

Before deploying, gather these:

### Portal (10 variables)
- [ ] Firebase config (6 values)
- [ ] App URLs (2 values)
- [ ] NODE_ENV, NEXT_PUBLIC_ENVIRONMENT

### CoinBox (30+ variables)
- [ ] Firebase config (9 values including Admin SDK)
- [ ] Paystack keys (Public + Secret)
- [ ] Google AI API key
- [ ] Luno API credentials
- [ ] App URLs (3 values)
- [ ] Security keys (AUTH_SECRET_KEY, CRON_SECRET)

### Other Apps (8 variables each)
- [ ] Firebase config (6 values)
- [ ] App URL
- [ ] NODE_ENV

See `ENV_VARIABLES_TEMPLATE.md` for complete list.

---

## 🌐 Custom Domains

After deployment:

1. In Vercel Dashboard → Project → Settings → **Domains**
2. Add custom domain:
   - Portal: `alliedimpact.co.za`
   - CoinBox: `coinbox.alliedimpact.co.za`
   - Etc.
3. Update DNS at your registrar:
   ```
   A      @              76.76.21.21
   CNAME  coinbox        cname.vercel-dns.com
   CNAME  careerbox      cname.vercel-dns.com
   CNAME  drivemaster    cname.vercel-dns.com
   CNAME  edutech        cname.vercel-dns.com
   CNAME  sportshub      cname.vercel-dns.com
   CNAME  myprojects     cname.vercel-dns.com
   CNAME  controlhub     cname.vercel-dns.com
   ```

---

## 🆘 Troubleshooting

### Build fails with "Cannot find module @allied-impact/auth"
- **Cause**: Workspace dependencies not resolved
- **Solution**: Already fixed in updated vercel.json - uses turbo build

### Build fails with "pnpm-workspace.yaml not found"
- **Cause**: Old installCommand was trying to install from app directory
- **Solution**: Already fixed - installCommand removed

### Environment variable errors
- **Cause**: Missing required env vars
- **Solution**: Add all variables from ENV_VARIABLES_TEMPLATE.md, then redeploy

### Build timeout
- **Cause**: Installing too many dependencies
- **Solution**: Already fixed - turbo filter only builds necessary packages

---

## 🎯 Deployment Order

1. **Portal** (foundation for SSO)
2. **CoinBox** (most complex, test thoroughly)
3. **MyProjects**
4. **CareerBox**
5. **SportsHub**
6. **DriveMaster**
7. **EduTech**
8. **ControlHub**

---

## ✨ You're Ready!

All configuration files are fixed and pushed to GitHub.  
Choose a deployment method above and start deploying!

**Questions?** Check:
- `VERCEL_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `VERCEL_MONOREPO_FIX.md` - Technical details about the fix
- `ENV_VARIABLES_TEMPLATE.md` - All environment variables

**Good luck! 🚀**
