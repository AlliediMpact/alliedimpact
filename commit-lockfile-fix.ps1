# Quick commit script for lockfile fix files

Write-Host "Committing lockfile fix documentation..." -ForegroundColor Cyan

# Stage the files
git add LOCKFILE_ERROR_FIX.md fix-lockfile.ps1

# Commit
git commit -m "Add lockfile regeneration script and documentation

- LOCKFILE_ERROR_FIX.md: Documents ERR_PNPM_OUTDATED_LOCKFILE error
- fix-lockfile.ps1: Automated script to regenerate pnpm-lock.yaml
- Fixes deployment error #4 (expected after workspace config change)
- Lockfile needs regeneration with corrected workspace config (web/*)
"

# Check if commit succeeded
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Committed successfully" -ForegroundColor Green
    
    # Push to GitHub
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Pushed to GitHub" -ForegroundColor Green
    } else {
        Write-Host "✗ Push failed" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Commit failed" -ForegroundColor Red
}
