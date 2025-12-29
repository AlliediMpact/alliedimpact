#!/usr/bin/env bash

# Rollback Script
# Quickly reverts deployment in case of critical issues

set -e

echo "🔄 Coin Box Rollback Procedure"
echo "==============================="
echo ""

# Configuration
PROJECT_ID="coinbox-prod"
BACKUP_TAG=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_error() { echo -e "${RED}✗ $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

# Get the last stable tag
echo "Finding last stable release..."
LAST_TAG=$(git tag --sort=-creatordate | grep -E "^beta-v" | head -2 | tail -1)

if [ -z "$LAST_TAG" ]; then
    print_error "No previous release found"
    exit 1
fi

echo "Last stable release: $LAST_TAG"
print_warning "This will rollback to: $LAST_TAG"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

echo ""
echo "🔄 Rolling back deployment..."

# Checkout last stable tag
git checkout "$LAST_TAG"
print_success "Checked out $LAST_TAG"

# Build
npm run build
print_success "Build completed"

# Deploy
vercel --prod --yes
print_success "Deployed to Vercel"

# Restore Firestore rules (if needed)
firebase deploy --only firestore:rules --project "$PROJECT_ID"
print_success "Firestore rules restored"

# Create rollback tag
ROLLBACK_TAG="rollback-to-$LAST_TAG-$(date +%Y%m%d-%H%M%S)"
git tag -a "$ROLLBACK_TAG" -m "Rollback to $LAST_TAG"
git push origin "$ROLLBACK_TAG"

echo ""
print_success "Rollback complete!"
echo ""
echo "Rolled back to: $LAST_TAG"
echo "Rollback tag: $ROLLBACK_TAG"
echo ""
echo "Next steps:"
echo "1. Verify application is working"
echo "2. Investigate root cause"
echo "3. Notify users of service restoration"
