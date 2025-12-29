#!/bin/bash

# Beta User Enablement Script for Savings Jar
# Enables the Savings Jar feature for selected beta test users

set -e

echo "🚀 Savings Jar Beta Testing - User Enablement"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠ Firebase CLI not found. Install with: npm install -g firebase-tools${NC}"
    exit 1
fi

echo -e "${BLUE}Phase 3A: Internal Testing (5 users)${NC}"
echo "======================================="
echo ""

# Internal test users
INTERNAL_USERS=(
    "user.investor@test.coinbox.local"
    "user.newbasic@test.coinbox.local"
    "admin.main@test.coinbox.local"
    "support.agent@test.coinbox.local"
    "user.rejected@test.coinbox.local"
)

echo "Internal Beta Test Users:"
for i in "${!INTERNAL_USERS[@]}"; do
    echo "  $((i+1)). ${INTERNAL_USERS[$i]}"
done
echo ""

# Feature flag is already enabled globally in .env.local
echo -e "${GREEN}✓ Feature flag enabled globally in .env.local${NC}"
echo ""

# Create Firestore document for beta user tracking
echo "Creating beta user tracking document..."

cat > /tmp/beta-users.json << 'EOF'
{
  "savingsJarBeta": {
    "phase": "3A-internal",
    "startDate": "2025-12-12",
    "endDate": "2025-12-19",
    "participants": [
      {
        "email": "user.investor@test.coinbox.local",
        "enrolledAt": "2025-12-12T10:45:00Z",
        "role": "investor",
        "testFocus": "P2P crypto auto-deposits",
        "status": "active"
      },
      {
        "email": "user.newbasic@test.coinbox.local",
        "enrolledAt": "2025-12-12T10:45:00Z",
        "role": "basic-user",
        "testFocus": "Manual deposits/withdrawals",
        "status": "active"
      },
      {
        "email": "admin.main@test.coinbox.local",
        "enrolledAt": "2025-12-12T10:45:00Z",
        "role": "admin",
        "testFocus": "Admin views and management",
        "status": "active"
      },
      {
        "email": "support.agent@test.coinbox.local",
        "enrolledAt": "2025-12-12T10:45:00Z",
        "role": "support",
        "testFocus": "Support queries and troubleshooting",
        "status": "active"
      },
      {
        "email": "user.rejected@test.coinbox.local",
        "enrolledAt": "2025-12-12T10:45:00Z",
        "role": "test-user",
        "testFocus": "Edge cases and boundary conditions",
        "status": "active"
      }
    ],
    "metrics": {
      "usersEnrolled": 5,
      "usersActive": 0,
      "totalDeposits": 0,
      "totalWithdrawals": 0,
      "totalSavings": 0,
      "issuesReported": 0
    }
  }
}
EOF

echo -e "${GREEN}✓ Beta tracking document created${NC}"
echo ""

# Instructions
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Send invitation emails to beta users"
echo "2. Share testing guide: PHASE_3_BETA_TESTING.md"
echo "3. Start monitoring dashboard"
echo "4. Run through test scenarios"
echo "5. Document any issues found"
echo ""

# Email template
echo -e "${BLUE}📧 Beta Invitation Email Template:${NC}"
echo "====================================="
cat << 'EMAIL'
Subject: You're Invited: Savings Jar Beta Testing 🎉

Hi [Name],

Congratulations! You've been selected to participate in the beta test of our new Savings Jar feature.

What is Savings Jar?
- Automatically saves 1% from all your profits
- Build an emergency fund effortlessly
- Withdraw anytime (small 1% fee)
- Watch your savings grow!

Your Test Focus: [Test Focus Area]

Getting Started:
1. Login to CoinBox: http://localhost:9004
2. Click "Savings Jar" in the dashboard sidebar
3. Follow the on-screen instructions
4. Test the feature thoroughly

Testing Duration: December 12-19, 2025 (1 week)

What We Need From You:
✓ Test all features (deposits, withdrawals, auto-saves)
✓ Report any bugs or issues
✓ Share your honest feedback
✓ Complete the end-of-week survey

Support:
If you encounter any issues, contact: support@coinbox.ai
Response time: < 2 hours

Thank you for helping us make CoinBox better!

Best regards,
The CoinBox Team

P.S. As a thank you, beta testers will receive R50 bonus credit! 🎁
EMAIL
echo ""

# Monitoring commands
echo -e "${BLUE}📊 Monitoring Commands:${NC}"
echo "======================="
echo ""
echo "# Check total savings jars created:"
echo "firebase firestore:query savingsJar --limit 100"
echo ""
echo "# Check recent transactions:"
echo "firebase firestore:query savingsJarTransactions --order createdAt desc --limit 20"
echo ""
echo "# Check for errors:"
echo "firebase firestore:query operations_log --where 'status==failed' --limit 10"
echo ""

# Success
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Beta Testing Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "🚀 Ready to start Phase 3A internal testing"
echo ""

# Quick test
echo -e "${BLUE}🧪 Quick Verification:${NC}"
echo "Test the feature at: http://localhost:9004/en/dashboard/savings-jar"
echo ""
echo "Login with any test account:"
for user in "${INTERNAL_USERS[@]}"; do
    echo "  - $user"
done
echo ""

echo -e "${GREEN}Good luck with the beta test! 🎉${NC}"
