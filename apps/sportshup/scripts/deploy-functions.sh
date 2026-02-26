#!/bin/bash

# ============================================================================
# Firebase Cloud Functions Deployment Script
# ============================================================================
# This script deploys SportsHub Cloud Functions to Firebase
# 
# Prerequisites:
# 1. Firebase CLI installed: npm install -g firebase-tools
# 2. Logged in to Firebase: firebase login
# 3. Firebase project selected: firebase use <project-id>
# ============================================================================

set -e  # Exit on error

echo "🚀 SportsHub Cloud Functions Deployment"
echo "========================================"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Run: firebase login"
    exit 1
fi

# Navigate to functions directory
cd "$(dirname "$0")/../functions"

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building functions..."
npm run build || echo "⚠️  No build script found, skipping..."

echo ""
echo "🔍 Current Firebase project:"
firebase use

echo ""
read -p "Deploy to this project? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚢 Deploying functions..."
firebase deploy --only functions

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify functions in Firebase Console"
echo "2. Test deductVoteFromWallet function"
echo "3. Configure webhook URLs in PayFast"
echo "4. Monitor function logs: firebase functions:log"
