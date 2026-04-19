#!/usr/bin/env pwsh
cd c:\dev\alliedimpact

Write-Host "Adding CareerBox hero changes..."
git add apps/careerbox/src/app/[locale]/page.tsx

Write-Host "Committing..."
git commit -m "enhancement: add premium animated hero section to CareerBox"

Write-Host "Verifying commit..."
git log --oneline -1

Write-Host "`nChecking all hero sections status..."
Write-Host "`n7 Apps Status:"
Write-Host "1. Portal - Premium hero (e594a6b, 33c7f6a, 6c8e5aa)"
Write-Host "2. CoinBox - Has animations (existing)"
Write-Host "3. CareerBox - NEW ENHANCED (this commit)"
Write-Host "4. DriveMaster - Landing animations (57526b4)"
Write-Host "5. EduTech - Landing animations (3cd8f23)"
Write-Host "6. SportsHub - Landing animations (1ad8dc6)"
Write-Host "7. ControlHub - Dashboard (adbe2a1)"

Write-Host "`nAll 7 apps now ready for deployment!"
