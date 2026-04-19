#!/usr/bin/env pwsh
cd c:\dev\alliedimpact

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TypeScript Error Check - All 7 Apps" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$apps = @(
    "portal" = "web/portal",
    "coinbox" = "apps/coinbox", 
    "careerbox" = "apps/careerbox",
    "drivemaster" = "apps/drivemaster",
    "edutech" = "apps/edutech",
    "sportshup" = "apps/sportshup",
    "myprojects" = "apps/myprojects",
    "controlhub" = "apps/controlhub"
)

foreach ($appName in $apps.Keys) {
    $appPath = $apps[$appName]
    if (Test-Path "$appPath/tsconfig.json") {
        Write-Host "[$appName] Checking..." -ForegroundColor Yellow
        $errors = (npx tsc --noEmit --project "$appPath/tsconfig.json" 2>&1)
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $appName - No TypeScript errors" -ForegroundColor Green
        } else {
            Write-Host "❌ $appName - Has errors:" -ForegroundColor Red
            $errors | Where-Object { $_ -match "error" } | Select-Object -First 10 | ForEach-Object {
                Write-Host "   $_" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "⏭️  $appName - No tsconfig.json found" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Check Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
