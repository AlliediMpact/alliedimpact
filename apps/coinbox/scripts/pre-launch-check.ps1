# Pre-Launch Verification Script
# Runs essential checks before beta launch

param(
    [switch]$SkipInstall,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🔍 Pre-Launch Verification" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

$failed = @()
$passed = @()

function Test-Step {
    param([string]$Name, [scriptblock]$Action)
    
    Write-Host "Checking: $Name..." -NoNewline
    try {
        & $Action
        Write-Host " ✓" -ForegroundColor Green
        $script:passed += $Name
        return $true
    } catch {
        Write-Host " ✗" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
        $script:failed += $Name
        return $false
    }
}

# 1. Check Node.js and pnpm
Test-Step "Node.js installed" {
    $version = node --version
    if (-not $version) { throw "Node.js not found" }
}

Test-Step "pnpm installed" {
    $version = pnpm --version
    if (-not $version) { throw "pnpm not found" }
}

# 2. Check environment files
Test-Step "Environment configuration" {
    $envFiles = @(
        ".env.local",
        ".env.production"
    )
    foreach ($file in $envFiles) {
        $path = Join-Path $PSScriptRoot "..\$file"
        if (-not (Test-Path $path)) {
            throw "$file not found"
        }
    }
}

# 3. Check Firebase configuration
Test-Step "Firebase CLI" {
    $version = firebase --version 2>$null
    if (-not $version) { throw "Firebase CLI not found" }
}

# 4. Install dependencies
if (-not $SkipInstall) {
    Write-Host ""
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    cd "$PSScriptRoot\..\.."
    pnpm install --prefer-offline --no-frozen-lockfile
    if ($LASTEXITCODE -ne 0) {
        $failed += "Dependency installation"
    } else {
        $passed += "Dependency installation"
        Write-Host "✓ Dependencies installed" -ForegroundColor Green
    }
}

# 5. TypeScript check (lint only, faster than full tsc)
cd "$PSScriptRoot\.."
Write-Host ""
Test-Step "Lint check" {
    $output = npm run lint 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0 -and $output -match "error") {
        throw "Lint errors found"
    }
}

# 6. Build application
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "🔨 Building application..." -ForegroundColor Cyan
    cd "$PSScriptRoot\.."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        $failed += "Build"
        Write-Host "✗ Build failed" -ForegroundColor Red
    } else {
        $passed += "Build"
        Write-Host "✓ Build successful" -ForegroundColor Green
    }
}

# 7. Check critical files exist
Test-Step "Critical files" {
    $criticalFiles = @(
        "src/app/layout.tsx",
        "src/app/page.tsx",
        "src/lib/firebase.ts",
        "firestore.rules",
        "firestore.indexes.json"
    )
    foreach ($file in $criticalFiles) {
        $path = Join-Path $PSScriptRoot "..\$file"
        if (-not (Test-Path $path)) {
            throw "Missing critical file: $file"
        }
    }
}

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($passed.Count -gt 0) {
    Write-Host "✓ Passed ($($passed.Count)):" -ForegroundColor Green
    foreach ($item in $passed) {
        Write-Host "  - $item" -ForegroundColor Green
    }
    Write-Host ""
}

if ($failed.Count -gt 0) {
    Write-Host "✗ Failed ($($failed.Count)):" -ForegroundColor Red
    foreach ($item in $failed) {
        Write-Host "  - $item" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "⚠️  Some checks failed. Please fix before launching." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "🎉 All checks passed!" -ForegroundColor Green
    Write-Host "✓ Ready for beta launch" -ForegroundColor Green
    Write-Host ""
    exit 0
}
