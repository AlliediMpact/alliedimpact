@echo off
cd "c:\Users\iMpact SA\Desktop\projects\alliedimpact"
git add platform/
git commit -m "Fix TypeScript compilation errors in platform packages - Auth: Remove duplicate exports, fix null/undefined types, fix window check - Entitlements: Fix JSDoc, move functions before usage, fix invalidateUserCache placement"
git push origin main
echo.
echo Deployment fixes pushed to GitHub!
echo Check Vercel to redeploy.
pause
