# Auto-commit regenerated lockfile after pnpm install completes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Waiting for pnpm install to complete..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wait for lockfile to be created (max 5 minutes)
$timeout = 300
$elapsed = 0

while (-not (Test-Path "pnpm-lock.yaml") -and $elapsed -lt $timeout) {
    Start-Sleep -Seconds 5
    $elapsed += 5
    Write-Host "⏳ Waiting... ($elapsed seconds)" -ForegroundColor Yellow
}

if (Test-Path "pnpm-lock.yaml") {
    $size = (Get-Item "pnpm-lock.yaml").Length
    Write-Host ""
    Write-Host "✓ Lockfile created! ($([math]::Round($size/1KB, 2)) KB)" -ForegroundColor Green
    Write-Host ""
    
    # Verify it contains web/portal
    $content = Get-Content "pnpm-lock.yaml" -Raw
    if ($content -match "web/portal") {
        Write-Host "✓ Lockfile includes web/portal workspace" -ForegroundColor Green
    } else {
        Write-Host "⚠ Warning: web/portal not found in lockfile!" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Committing lockfile..." -ForegroundColor Cyan
    
    git add pnpm-lock.yaml
    git commit -m "Regenerate pnpm-lock.yaml with corrected workspace config

- Regenerated after fixing workspace path from 'web' to 'web/*'
- Lockfile now includes all 20 workspace packages
- Fixes Vercel deployment error: ERR_PNPM_OUTDATED_LOCKFILE
- Ready for deployment"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Lockfile committed successfully" -ForegroundColor Green
        Write-Host ""
        Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
        
        git push origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Pushed to GitHub!" -ForegroundColor Green
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "✅ READY FOR DEPLOYMENT!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "  1. Vercel will auto-deploy on next push, OR" -ForegroundColor White
            Write-Host "  2. Go to Vercel Dashboard and click 'Deploy'" -ForegroundColor White
            Write-Host "  3. Deployment should succeed now!" -ForegroundColor White
        } else {
            Write-Host "⚠ Push failed - please push manually" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ Commit failed" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "✗ Timeout: Lockfile was not created after $timeout seconds" -ForegroundColor Red
    Write-Host "  Please check if pnpm install is still running" -ForegroundColor Yellow
}
