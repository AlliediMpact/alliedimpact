#!/bin/bash

# P2P Crypto Marketplace - API Testing Script
# Tests all API endpoints with curl

BASE_URL="http://localhost:9004"
SESSION_COOKIE="session=YOUR_SESSION_COOKIE_HERE"

echo "🧪 P2P Crypto API Testing Script"
echo "================================="
echo ""
echo "⚠️  SETUP REQUIRED:"
echo "   1. Get your session cookie from browser DevTools"
echo "   2. Replace SESSION_COOKIE value in this script"
echo "   3. Run the script: ./test-p2p-api.sh"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Create Listing
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Create Listing (POST /api/p2p-crypto/create-listing)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CREATE_PAYLOAD='{
  "type": "sell",
  "asset": "BTC",
  "cryptoAmount": 0.01,
  "pricePerUnit": 1200000,
  "paymentMethod": "Bank Transfer",
  "terms": "Payment within 1 hour. Fast release."
}'

echo "Request:"
echo "$CREATE_PAYLOAD" | jq .
echo ""

LISTING_RESPONSE=$(curl -s -X POST "$BASE_URL/api/p2p-crypto/create-listing" \
  -H "Content-Type: application/json" \
  -H "Cookie: $SESSION_COOKIE" \
  -d "$CREATE_PAYLOAD")

echo "Response:"
echo "$LISTING_RESPONSE" | jq .
echo ""

# Extract listing ID if successful
LISTING_ID=$(echo "$LISTING_RESPONSE" | jq -r '.listing.id // empty')

if [ -n "$LISTING_ID" ]; then
  echo -e "${GREEN}✓ Listing created successfully!${NC}"
  echo "Listing ID: $LISTING_ID"
else
  echo -e "${RED}✗ Failed to create listing${NC}"
fi

echo ""
read -p "Press Enter to continue..."
echo ""

# Test 2: Browse Listings
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Browse Listings (GET /api/p2p-crypto/listings)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

LISTINGS_RESPONSE=$(curl -s "$BASE_URL/api/p2p-crypto/listings?asset=BTC&type=sell&status=active")

echo "Response:"
echo "$LISTINGS_RESPONSE" | jq .
echo ""

LISTING_COUNT=$(echo "$LISTINGS_RESPONSE" | jq '.listings | length')

if [ "$LISTING_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Found $LISTING_COUNT listing(s)${NC}"
else
  echo -e "${YELLOW}⚠ No listings found${NC}"
fi

echo ""
read -p "Press Enter to continue..."
echo ""

# Test 3: Get AI Predictions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: AI Price Predictions (GET /api/p2p-crypto/predictions)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PREDICTIONS_RESPONSE=$(curl -s "$BASE_URL/api/p2p-crypto/predictions?asset=BTC&days=7")

echo "Response:"
echo "$PREDICTIONS_RESPONSE" | jq .
echo ""

HAS_PREDICTIONS=$(echo "$PREDICTIONS_RESPONSE" | jq -r '.predictions // empty')

if [ -n "$HAS_PREDICTIONS" ]; then
  echo -e "${GREEN}✓ Predictions retrieved successfully!${NC}"
else
  echo -e "${YELLOW}⚠ No predictions available${NC}"
fi

echo ""
read -p "Press Enter to continue..."
echo ""

# Test 4: Match Listing (requires second user)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Match Listing (POST /api/p2p-crypto/match-listing)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⚠️  This requires a SECOND USER session cookie${NC}"
echo ""
echo "To test matching:"
echo "  1. Login as a different user in another browser"
echo "  2. Get their session cookie"
echo "  3. Replace BUYER_SESSION_COOKIE below"
echo ""

BUYER_SESSION_COOKIE="session=SECOND_USER_SESSION_HERE"

if [ -n "$LISTING_ID" ]; then
  MATCH_PAYLOAD="{\"listingId\": \"$LISTING_ID\"}"
  
  echo "Request:"
  echo "$MATCH_PAYLOAD" | jq .
  echo ""
  
  MATCH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/p2p-crypto/match-listing" \
    -H "Content-Type: application/json" \
    -H "Cookie: $BUYER_SESSION_COOKIE" \
    -d "$MATCH_PAYLOAD")
  
  echo "Response:"
  echo "$MATCH_RESPONSE" | jq .
  echo ""
  
  TRANSACTION_ID=$(echo "$MATCH_RESPONSE" | jq -r '.transaction.id // empty')
  
  if [ -n "$TRANSACTION_ID" ]; then
    echo -e "${GREEN}✓ Listing matched successfully!${NC}"
    echo "Transaction ID: $TRANSACTION_ID"
  else
    echo -e "${RED}✗ Failed to match listing${NC}"
  fi
else
  echo -e "${YELLOW}⚠ No listing ID available (create listing first)${NC}"
fi

echo ""
read -p "Press Enter to continue..."
echo ""

# Test 5: Confirm Payment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Confirm Payment (POST /api/p2p-crypto/confirm-payment)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$TRANSACTION_ID" ]; then
  CONFIRM_PAYLOAD="{\"transactionId\": \"$TRANSACTION_ID\"}"
  
  echo "Request:"
  echo "$CONFIRM_PAYLOAD" | jq .
  echo ""
  
  CONFIRM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/p2p-crypto/confirm-payment" \
    -H "Content-Type: application/json" \
    -H "Cookie: $BUYER_SESSION_COOKIE" \
    -d "$CONFIRM_PAYLOAD")
  
  echo "Response:"
  echo "$CONFIRM_RESPONSE" | jq .
  echo ""
  
  if echo "$CONFIRM_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Payment confirmed successfully!${NC}"
  else
    echo -e "${RED}✗ Failed to confirm payment${NC}"
  fi
else
  echo -e "${YELLOW}⚠ No transaction ID available (match listing first)${NC}"
fi

echo ""
read -p "Press Enter to continue..."
echo ""

# Test 6: Release Crypto
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: Release Crypto (POST /api/p2p-crypto/release-crypto)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$TRANSACTION_ID" ]; then
  RELEASE_PAYLOAD="{\"transactionId\": \"$TRANSACTION_ID\"}"
  
  echo "Request:"
  echo "$RELEASE_PAYLOAD" | jq .
  echo ""
  
  RELEASE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/p2p-crypto/release-crypto" \
    -H "Content-Type: application/json" \
    -H "Cookie: $SESSION_COOKIE" \
    -d "$RELEASE_PAYLOAD")
  
  echo "Response:"
  echo "$RELEASE_RESPONSE" | jq .
  echo ""
  
  if echo "$RELEASE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Crypto released successfully!${NC}"
  else
    echo -e "${RED}✗ Failed to release crypto${NC}"
  fi
else
  echo -e "${YELLOW}⚠ No transaction ID available (confirm payment first)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ API Testing Complete!"
echo ""
echo "Summary:"
echo "  - Listing ID: ${LISTING_ID:-N/A}"
echo "  - Transaction ID: ${TRANSACTION_ID:-N/A}"
echo ""
echo "Next Steps:"
echo "  1. Check Firestore Console for data"
echo "  2. Verify wallet balances updated"
echo "  3. Check user stats updated"
echo "  4. Review transaction history"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
