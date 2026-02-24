# Fix pnpm-lock.yaml for Vercel deployment
# Run this script from the alliedimpact root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing pnpm-lock.yaml for deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ensure we're in the right directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Step 1: Delete any existing lockfiles
Write-Host "[1/5] Cleaning up lockfiles..." -ForegroundColor Green
if (Test-Path "pnpm-lock.yaml") {
    Remove-Item "pnpm-lock.yaml" -Force
    Write-Host "  ✓ Deleted old pnpm-lock.yaml" -ForegroundColor Gray
} else {
    Write-Host "  ✓ No lockfile to clean" -ForegroundColor Gray
}

# Also clean up any lockfile in parent directory (if created by mistake)
if (Test-Path "../pnpm-lock.yaml") {
    Remove-Item "../pnpm-lock.yaml" -Force
    Write-Host "  ✓ Cleaned up parent directory lockfile" -ForegroundColor Gray
}

Write-Host ""

# Step 2: Verify workspace configuration
Write-Host "[2/5] Verifying workspace configuration..." -ForegroundColor Green
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$hasCorrectWorkspace = $packageJson.workspaces -contains "web/*"

if ($hasCorrectWorkspace) {
    Write-Host "  ✓ Workspace configuration correct (web/*)" -ForegroundColor Gray
} else {
    Write-Host "  ✗ ERROR: Workspace configuration wrong!" -ForegroundColor Red
    Write-Host "    Expected 'web/*' in workspaces" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Regenerate lockfile
Write-Host "[3/5] Regenerating pnpm-lock.yaml..." -ForegroundColor Green
Write-Host "  This may take 2-3 minutes..." -ForegroundColor Yellow

$installOutput = pnpm install 2>&1
$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host "  ✓ Lockfile regenerated successfully" -ForegroundColor Gray
} else {
    Write-Host "  ✗ ERROR: pnpm install failed!" -ForegroundColor Red
    Write-Host "  Output: $installOutput" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Verify lockfile was created
Write-Host "[4/5] Verifying lockfile..." -ForegroundColor Green
if (Test-Path "pnpm-lock.yaml") {
    $lockfileSize = (Get-Item "pnpm-lock.yaml").Length
    Write-Host "  ✓ Lockfile created ($([math]::Round($lockfileSize/1KB, 2)) KB)" -ForegroundColor Gray
    
    # Check if lockfile contains web/portal reference
    $lockfileContent = Get-Content "pnpm-lock.yaml" -Raw
    if ($lockfileContent -match "web/portal") {
        Write-Host "  ✓ Lockfile includes web/portal workspace" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ Warning: web/portal not found in lockfile" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ ERROR: Lockfile was not created!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 5: Commit and push
Write-Host "[5/5] Committing changes..." -ForegroundColor Green

# Check git status
$gitStatus = git status --porcelain 2>&1
if ($gitStatus -match "pnpm-lock.yaml") {
    Write-Host "  Changes detected in pnpm-lock.yaml" -ForegroundColor Gray
    
    git add pnpm-lock.yaml
    git commit -m "Regenerate pnpm-lock.yaml with corrected workspace config

- Deleted old lockfile generated with 'web' workspace path
- Regenerated with 'web/*' workspace path  
- Fixes Vercel deployment error: ERR_PNPM_OUTDATED_LOCKFILE
- Now lockfile correctly includes web/portal dependencies

Ready for Vercel deployment."

    Write-Host "  ✓ Changes committed" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Pushed to GitHub successfully" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Push failed - please push manually" -ForegroundColor Red
    }
} else {
    Write-Host "  ℹ No changes to commit (lockfile already up to date)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ LOCKFILE FIX COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Wait for git push to complete" -ForegroundColor White
Write-Host "  2. Go to Vercel and deploy again" -ForegroundColor White
Write-Host "  3. The deployment should now succeed" -ForegroundColor White
Write-Host ""
