# Allied iMpact - Installation Script
# Run this script to install dependencies and build the platform

Write-Host "🏢 Allied iMpact - Installation Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if PNPM is installed
Write-Host "📦 Checking for PNPM..." -ForegroundColor Yellow
$pnpmVersion = & pnpm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ PNPM not found. Installing PNPM..." -ForegroundColor Red
    npm install -g pnpm
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install PNPM. Please install manually:" -ForegroundColor Red
        Write-Host "   npm install -g pnpm" -ForegroundColor White
        exit 1
    }
    $pnpmVersion = & pnpm --version
}
Write-Host "✅ PNPM version $pnpmVersion found" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Write-Host "   This may take 2-5 minutes..." -ForegroundColor Gray
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Build platform services
Write-Host "🔨 Building platform services..." -ForegroundColor Yellow
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Platform services built successfully" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test Coin Box: cd apps\coinbox; pnpm test" -ForegroundColor White
Write-Host "  2. Run Coin Box:  cd apps\coinbox; pnpm dev" -ForegroundColor White
Write-Host "  3. Deploy:        cd apps\coinbox; vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - README.md - Platform overview" -ForegroundColor White
Write-Host "  - QUICK_START.md - Getting started guide" -ForegroundColor White
Write-Host "  - TYPESCRIPT_FIXES.md - What was fixed" -ForegroundColor White
Write-Host ""
