#!/bin/bash

# P2P Crypto Marketplace - Quick Setup Script
# This script helps configure your environment for production deployment

set -e

echo "🚀 P2P Crypto Marketplace - Setup Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project root detected${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "📦 Checking dependencies..."
echo ""

if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

if command_exists npm; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

if command_exists firebase; then
    echo -e "${GREEN}✅ Firebase CLI installed${NC}"
else
    echo -e "${YELLOW}⚠️  Firebase CLI not found. Install with: npm install -g firebase-tools${NC}"
fi

echo ""

# Install npm packages
echo "📥 Installing npm packages..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
    
    cat > .env.local << 'EOF'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# CoinGecko API (Optional)
COINGECKO_API_KEY=

# Feature Flags
NEXT_PUBLIC_P2P_CRYPTO_ENABLED=true
NEXT_PUBLIC_AI_PREDICTIONS_ENABLED=true

# Security
NEXT_PUBLIC_ESCROW_TIMEOUT_MINUTES=30
NEXT_PUBLIC_MAX_TRADE_AMOUNT=1000000
EOF

    echo -e "${GREEN}✅ .env.local created. Please update with your Firebase credentials.${NC}"
else
    echo -e "${GREEN}✅ .env.local exists${NC}"
fi

echo ""

# Check Firebase configuration
echo "🔥 Checking Firebase setup..."

if [ -f "firebase.json" ]; then
    echo -e "${GREEN}✅ firebase.json found${NC}"
else
    echo -e "${RED}❌ firebase.json not found. Run: firebase init${NC}"
fi

if [ -f "firestore.rules" ]; then
    echo -e "${GREEN}✅ firestore.rules found${NC}"
else
    echo -e "${YELLOW}⚠️  firestore.rules not found${NC}"
fi

if [ -f "firestore.indexes.json" ]; then
    echo -e "${GREEN}✅ firestore.indexes.json found${NC}"
else
    echo -e "${YELLOW}⚠️  firestore.indexes.json not found${NC}"
fi

echo ""

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed. Please check errors above.${NC}"
    exit 1
fi

echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Update Firebase credentials in .env.local"
echo "2. Deploy Firestore rules:"
echo "   ${YELLOW}firebase deploy --only firestore:rules${NC}"
echo ""
echo "3. Deploy Firestore indexes:"
echo "   ${YELLOW}firebase deploy --only firestore:indexes${NC}"
echo ""
echo "4. Start development server:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "5. Test the application:"
echo "   - Marketplace: ${YELLOW}http://localhost:9004/p2p-crypto/marketplace${NC}"
echo "   - Create Listing: ${YELLOW}http://localhost:9004/p2p-crypto/create${NC}"
echo "   - Dashboard: ${YELLOW}http://localhost:9004/p2p-crypto/dashboard${NC}"
echo ""
echo "6. Deploy to production:"
echo "   ${YELLOW}vercel --prod${NC}"
echo "   or"
echo "   ${YELLOW}firebase deploy --only hosting${NC}"
echo ""
echo "📖 Documentation:"
echo "   - Implementation: ${YELLOW}docs/P2P_CRYPTO_AI_IMPLEMENTATION.md${NC}"
echo "   - Quick Start: ${YELLOW}docs/P2P_CRYPTO_QUICK_START.md${NC}"
echo "   - Architecture: ${YELLOW}docs/P2P_CRYPTO_ARCHITECTURE.md${NC}"
echo "   - Deployment: ${YELLOW}P2P_CRYPTO_DEPLOYMENT_CHECKLIST.md${NC}"
echo ""
echo "🎉 Happy Trading!"
