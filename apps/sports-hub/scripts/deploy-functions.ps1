# ============================================================================
# Firebase Cloud Functions Deployment Script (PowerShell)
# ============================================================================
# This script deploys SportsHub Cloud Functions to Firebase
# 
# Prerequisites:
# 1. Firebase CLI installed: npm install -g firebase-tools
# 2. Logged in to Firebase: firebase login
# 3. Firebase project selected: firebase use <project-id>
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 SportsHub Cloud Functions Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if Firebase CLI is installed
try {
    firebase --version | Out-Null
} catch {
    Write-Host "❌ Firebase CLI not found. Install with: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

# Check if logged in
try {
    firebase projects:list | Out-Null
} catch {
    Write-Host "❌ Not logged in to Firebase. Run: firebase login" -ForegroundColor Red
    exit 1
}

# Navigate to functions directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\..\functions"

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "🔨 Building functions..." -ForegroundColor Yellow
try {
    npm run build
} catch {
    Write-Host "⚠️  No build script found, skipping..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Current Firebase project:" -ForegroundColor Cyan
firebase use

Write-Host ""
$response = Read-Host "Deploy to this project? (y/n)"
if ($response -ne "y" -and $response -ne "Y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚢 Deploying functions..." -ForegroundColor Green
firebase deploy --only functions

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify functions in Firebase Console"
Write-Host "2. Test deductVoteFromWallet function"
Write-Host "3. Configure webhook URLs in PayFast"
Write-Host "4. Monitor function logs: firebase functions:log"
