# Beta Launch Deployment Script (PowerShell)
# Deploys Coin Box to production for beta launch

param(
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🚀 Coin Box Beta Launch Deployment" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$ENVIRONMENT = "production"
$PROJECT_ID = "coinbox-prod"
$APP_URL = "https://coinbox.com"

function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

# Pre-deployment checks
Write-Host "📋 Running pre-deployment checks..." -ForegroundColor Cyan
Write-Host ""

# Check Firebase CLI
try {
    $null = firebase --version
    Print-Success "Firebase CLI found"
} catch {
    Print-Error "Firebase CLI not found. Install it with: npm install -g firebase-tools"
    exit 1
}

# Check Firebase authentication
try {
    $null = firebase projects:list 2>&1
    Print-Success "Firebase authentication verified"
} catch {
    Print-Error "Not logged in to Firebase. Run: firebase login"
    exit 1
}

# Check environment configuration
if (-not (Test-Path ".env.production")) {
    Print-Error ".env.production file not found"
    exit 1
}
Print-Success "Environment configuration found"

# Run tests
if (-not $SkipTests) {
    Write-Host ""
    Write-Host "🧪 Running test suite..." -ForegroundColor Cyan
    npm run test:ci
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Tests failed. Aborting deployment."
        exit 1
    }
    Print-Success "All tests passed"
}

# Build application
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "🔨 Building application..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Build failed. Aborting deployment."
        exit 1
    }
    Print-Success "Build completed successfully"
}

# Confirm deployment
if (-not $DryRun) {
    Write-Host ""
    Print-Warning "You are about to deploy to PRODUCTION for BETA LAUNCH"
    $confirm = Read-Host "Are you sure you want to continue? (yes/no)"
    
    if ($confirm -ne "yes") {
        Print-Info "Deployment cancelled"
        exit 0
    }
}

Write-Host ""
Write-Host "📦 Deploying to production..." -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Print-Info "DRY RUN - No actual deployment will occur"
    Write-Host ""
}

# Deploy Firestore rules
Write-Host "Deploying Firestore rules..."
if (-not $DryRun) {
    firebase deploy --only firestore:rules --project $PROJECT_ID
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Firestore rules deployment failed"
        exit 1
    }
}
Print-Success "Firestore rules deployed"

# Deploy Firestore indexes
Write-Host "Deploying Firestore indexes..."
if (-not $DryRun) {
    firebase deploy --only firestore:indexes --project $PROJECT_ID
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Firestore indexes deployment failed"
        exit 1
    }
}
Print-Success "Firestore indexes deployed"

# Deploy Firebase Functions
Write-Host "Deploying Firebase Functions..."
if (-not $DryRun) {
    firebase deploy --only functions --project $PROJECT_ID
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Functions deployment failed"
        exit 1
    }
}
Print-Success "Firebase Functions deployed"

# Deploy to Vercel
Write-Host "Deploying to Vercel..."
if (-not $DryRun) {
    vercel --prod --yes
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Vercel deployment failed"
        exit 1
    }
}
Print-Success "Application deployed to Vercel"

# Run post-deployment checks
Write-Host ""
Write-Host "🔍 Running post-deployment checks..." -ForegroundColor Cyan

if (-not $DryRun) {
    # Check if app is accessible
    try {
        $response = Invoke-WebRequest -Uri $APP_URL -Method Head -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Print-Success "Application is accessible"
        }
    } catch {
        Print-Error "Application is not accessible"
        exit 1
    }

    # Check API health
    try {
        $response = Invoke-WebRequest -Uri "$APP_URL/api/health" -Method Get -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Print-Success "API is healthy"
        }
    } catch {
        Print-Warning "API health check failed"
    }
}

# Tag release
Write-Host ""
Write-Host "🏷️  Tagging release..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$RELEASE_TAG = "beta-v1.0.0-$timestamp"

if (-not $DryRun) {
    git tag -a $RELEASE_TAG -m "Beta launch release"
    git push origin $RELEASE_TAG
}
Print-Success "Release tagged: $RELEASE_TAG"

# Deployment summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "🎉 Deployment Successful!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Application URL: $APP_URL"
Write-Host "Release Tag: $RELEASE_TAG"
Write-Host "Deployed at: $(Get-Date)"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Monitor error logs: firebase functions:log --project $PROJECT_ID"
Write-Host "2. Check analytics dashboard"
Write-Host "3. Send beta invitations"
Write-Host "4. Monitor system metrics"
Write-Host ""
Print-Success "Beta launch deployment complete!"
