#!/usr/bin/env bash

# Beta Launch Deployment Script
# Deploys Coin Box to production for beta launch

set -e  # Exit on error

echo "🚀 Coin Box Beta Launch Deployment"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="production"
PROJECT_ID="coinbox-prod"
REGION="us-central1"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo "ℹ $1"
}

# Pre-deployment checks
echo "📋 Running pre-deployment checks..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI not found. Install it with: npm install -g firebase-tools"
    exit 1
fi
print_success "Firebase CLI found"

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    print_error "Not logged in to Firebase. Run: firebase login"
    exit 1
fi
print_success "Firebase authentication verified"

# Check if all environment variables are set
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found"
    exit 1
fi
print_success "Environment configuration found"

# Run tests
echo ""
echo "🧪 Running test suite..."
npm run test:ci || {
    print_error "Tests failed. Aborting deployment."
    exit 1
}
print_success "All tests passed"

# Build the application
echo ""
echo "🔨 Building application..."
npm run build || {
    print_error "Build failed. Aborting deployment."
    exit 1
}
print_success "Build completed successfully"

# Confirm deployment
echo ""
print_warning "You are about to deploy to PRODUCTION for BETA LAUNCH"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_info "Deployment cancelled"
    exit 0
fi

echo ""
echo "📦 Deploying to production..."
echo ""

# Deploy Firestore rules
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules --project "$PROJECT_ID" || {
    print_error "Firestore rules deployment failed"
    exit 1
}
print_success "Firestore rules deployed"

# Deploy Firestore indexes
echo "Deploying Firestore indexes..."
firebase deploy --only firestore:indexes --project "$PROJECT_ID" || {
    print_error "Firestore indexes deployment failed"
    exit 1
}
print_success "Firestore indexes deployed"

# Deploy Firebase Functions
echo "Deploying Firebase Functions..."
firebase deploy --only functions --project "$PROJECT_ID" || {
    print_error "Functions deployment failed"
    exit 1
}
print_success "Firebase Functions deployed"

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod --yes || {
    print_error "Vercel deployment failed"
    exit 1
}
print_success "Application deployed to Vercel"

# Run post-deployment checks
echo ""
echo "🔍 Running post-deployment checks..."

# Check if app is accessible
APP_URL="https://coinbox.com"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL")
if [ "$HTTP_STATUS" == "200" ]; then
    print_success "Application is accessible"
else
    print_error "Application returned status $HTTP_STATUS"
    exit 1
fi

# Check API health
API_URL="https://coinbox.com/api/health"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")
if [ "$API_STATUS" == "200" ]; then
    print_success "API is healthy"
else
    print_warning "API health check returned status $API_STATUS"
fi

# Tag the release
echo ""
echo "🏷️  Tagging release..."
RELEASE_TAG="beta-v1.0.0-$(date +%Y%m%d-%H%M%S)"
git tag -a "$RELEASE_TAG" -m "Beta launch release"
git push origin "$RELEASE_TAG"
print_success "Release tagged: $RELEASE_TAG"

# Deployment summary
echo ""
echo "=================================="
echo "🎉 Deployment Successful!"
echo "=================================="
echo ""
echo "Application URL: $APP_URL"
echo "Release Tag: $RELEASE_TAG"
echo "Deployed at: $(date)"
echo ""
echo "Next steps:"
echo "1. Monitor error logs: firebase functions:log --project $PROJECT_ID"
echo "2. Check analytics dashboard"
echo "3. Send beta invitations"
echo "4. Monitor system metrics"
echo ""
print_success "Beta launch deployment complete!"
