#!/bin/bash

# P2P Crypto Marketplace - Production Deployment Script
# Automated deployment to Vercel with pre-flight checks

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 P2P Crypto Marketplace - Production Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Pre-flight Checks
echo -e "${BLUE}Step 1: Pre-flight Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠ Vercel CLI not found${NC}"
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi
echo -e "${GREEN}✓ Vercel CLI installed${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠ Firebase CLI not found${NC}"
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi
echo -e "${GREEN}✓ Firebase CLI installed${NC}"

echo ""
read -p "Pre-flight checks complete. Press Enter to continue..."
echo ""

# Step 2: Environment Variables Check
echo -e "${BLUE}Step 2: Environment Variables Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f .env.local ]; then
    echo -e "${RED}✗ .env.local not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .env.local exists${NC}"

# Check required Firebase variables
REQUIRED_VARS=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "NEXT_PUBLIC_FIREBASE_APP_ID"
)

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^$var=" .env.local; then
        echo -e "${GREEN}✓ $var set${NC}"
    else
        echo -e "${RED}✗ $var missing${NC}"
        exit 1
    fi
done

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: You must configure these variables in Vercel Dashboard${NC}"
echo ""
read -p "Press Enter to continue..."
echo ""

# Step 3: Code Quality Check
echo -e "${BLUE}Step 3: Code Quality Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Running TypeScript check..."
if npx tsc --noEmit; then
    echo -e "${GREEN}✓ TypeScript check passed${NC}"
else
    echo -e "${RED}✗ TypeScript errors found${NC}"
    read -p "Continue anyway? (y/N): " continue_ts
    if [ "$continue_ts" != "y" ]; then
        exit 1
    fi
fi

echo ""
read -p "Press Enter to continue..."
echo ""

# Step 4: Production Build
echo -e "${BLUE}Step 4: Production Build${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Running production build..."
if npm run build; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo ""
read -p "Press Enter to continue..."
echo ""

# Step 5: Firestore Rules Deployment
echo -e "${BLUE}Step 5: Firestore Rules Deployment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Deploying Firestore security rules..."
if firebase deploy --only firestore:rules; then
    echo -e "${GREEN}✓ Firestore rules deployed${NC}"
else
    echo -e "${RED}✗ Firestore rules deployment failed${NC}"
    read -p "Continue anyway? (y/N): " continue_rules
    if [ "$continue_rules" != "y" ]; then
        exit 1
    fi
fi

echo ""
read -p "Press Enter to continue..."
echo ""

# Step 6: Deployment Choice
echo -e "${BLUE}Step 6: Choose Deployment Method${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Select deployment method:"
echo "  1) Vercel (Recommended)"
echo "  2) Firebase Hosting"
echo "  3) Skip deployment (testing only)"
echo ""
read -p "Enter choice (1-3): " deploy_choice
echo ""

case $deploy_choice in
    1)
        echo -e "${BLUE}Deploying to Vercel...${NC}"
        echo ""
        
        # Check if logged in to Vercel
        if vercel whoami &> /dev/null; then
            echo -e "${GREEN}✓ Logged in to Vercel${NC}"
        else
            echo "Logging in to Vercel..."
            vercel login
        fi
        
        echo ""
        echo -e "${YELLOW}⚠️  Make sure environment variables are set in Vercel Dashboard${NC}"
        echo "Visit: https://vercel.com/[your-team]/[your-project]/settings/environment-variables"
        echo ""
        read -p "Environment variables configured? Press Enter to deploy..."
        echo ""
        
        # Deploy to production
        echo "Deploying to production..."
        if vercel --prod; then
            echo ""
            echo -e "${GREEN}✅ Deployment successful!${NC}"
        else
            echo ""
            echo -e "${RED}✗ Deployment failed${NC}"
            exit 1
        fi
        ;;
        
    2)
        echo -e "${BLUE}Deploying to Firebase Hosting...${NC}"
        echo ""
        
        # Check if logged in to Firebase
        if firebase projects:list &> /dev/null; then
            echo -e "${GREEN}✓ Logged in to Firebase${NC}"
        else
            echo "Logging in to Firebase..."
            firebase login
        fi
        
        echo ""
        echo "Deploying to Firebase Hosting..."
        if firebase deploy --only hosting; then
            echo ""
            echo -e "${GREEN}✅ Deployment successful!${NC}"
        else
            echo ""
            echo -e "${RED}✗ Deployment failed${NC}"
            exit 1
        fi
        ;;
        
    3)
        echo -e "${YELLOW}⚠ Skipping deployment${NC}"
        echo ""
        echo "Build artifacts are ready in .next/"
        echo "You can deploy manually later."
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 7: Post-Deployment Checklist
echo -e "${BLUE}Step 7: Post-Deployment Checklist${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat << EOF
✅ Deployment Complete!

Post-Deployment Tasks:

🔍 Immediate Verification (Next 5 minutes):
  [ ] Visit deployment URL
  [ ] Check homepage loads
  [ ] Navigate to /p2p-crypto/marketplace
  [ ] Test user authentication
  [ ] Create test listing (small amount)
  [ ] Verify API responses
  [ ] Check browser console for errors
  [ ] Test on mobile device

📊 First Hour Monitoring:
  [ ] Monitor error logs in Vercel/Firebase Dashboard
  [ ] Check Firestore read/write usage
  [ ] Verify first real trade completes
  [ ] Monitor API response times
  [ ] Check for 500 errors
  [ ] Review user feedback

🔒 Security Verification:
  [ ] Verify HTTPS enabled
  [ ] Test Firestore rules in production
  [ ] Check authentication flows
  [ ] Verify session cookies secure
  [ ] Test unauthorized access attempts

📈 Performance Check:
  [ ] Run Lighthouse audit (target: 90+ score)
  [ ] Check Core Web Vitals
  [ ] Monitor page load times
  [ ] Test with slow connection
  [ ] Check Firestore query performance

🎯 Business Verification:
  [ ] Complete one full trade workflow
  [ ] Verify fee collection (0.5%)
  [ ] Check escrow working
  [ ] Verify stats updating
  [ ] Test tier limits

Deployment URL: [Check Vercel/Firebase output above]

Documentation:
  - Testing Guide: docs/p2p-crypto-testing-guide.md
  - Admin Guide: docs/p2p-crypto-admin-guide.md
  - Quick Reference: docs/p2p-crypto-quick-reference.md

Monitoring:
  - Vercel Dashboard: https://vercel.com/dashboard
  - Firebase Console: https://console.firebase.google.com
  - Firestore Usage: Check your Firebase project

Support:
  - Check error logs for issues
  - Review docs/p2p-crypto-testing-guide.md for troubleshooting
  - Monitor first 24 hours closely

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 P2P Crypto Marketplace is now LIVE in production!

Next Steps:
  1. Complete post-deployment checklist above
  2. Monitor for first 24 hours
  3. Gather user feedback
  4. Iterate and improve

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo ""
