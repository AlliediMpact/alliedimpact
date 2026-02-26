# Commit and push auth fixes
Set-Location "c:\Users\iMpact SA\Desktop\projects\alliedimpact"

Write-Host "Staging files..."
git add platform/auth/src/admin.ts platform/auth/src/index.ts

Write-Host "Committing..."
git commit -m "Fix TypeScript compilation errors in auth package

- Remove duplicate export declarations causing redeclaration errors
- Fix null vs undefined type mismatches in PlatformUser fields  
- Fix window check in admin.ts to use process.versions.node
- Resolves deployment failures on all apps except coinbox"

Write-Host "Pushing to GitHub..."
git push origin main

Write-Host "Done! Check Vercel deployments now."
