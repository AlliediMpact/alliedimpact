#!/usr/bin/env pwsh
cd c:\dev\alliedimpact

Write-Host "Checking git status..."
git status --porcelain

Write-Host "`nStaging files..."
git add apps/edutech/src/app/[locale]/page.tsx
git add apps/sportshup/src/app/page.tsx
git add apps/controlhub/src/app/page.tsx

Write-Host "`nCommitting..."
git commit -m "enhancement: add premium animations to EduTech, SportsHub, ControlHub landing pages"

Write-Host "`nVerifying commit..."
git log --oneline -1

Write-Host "`nDone!"
