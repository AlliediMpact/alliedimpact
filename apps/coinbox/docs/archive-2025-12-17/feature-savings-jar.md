# Savings Jar Feature Documentation

## Overview

The Savings Jar is an automated savings feature that helps users build their savings by automatically setting aside 1% of all profit events. Users can also manually top up their savings jar and withdraw funds when they reach their threshold.

## Features

### 1. Auto-Deposit (1%)
- Automatically saves 1% from all profit events
- Profit sources include:
  - Loan investor profits
  - P2P crypto trading profits
  - Stokvel payouts (if enabled)
  - Referral bonuses

### 2. Manual Deposits
- Users can manually add funds to their savings jar anytime
- No minimum deposit amount
- Instant processing

### 3. Withdrawals
- Minimum balance required: R100 (configurable by user)
- Withdrawal fee: 1% (platform revenue)
- Funds transferred to main wallet
- Example: Withdraw R100 → R99 to wallet, R1 fee

### 4. Custom Threshold
- Users can set their own minimum withdrawal balance
- Minimum: R100
- Helps users save towards specific goals

## Technical Implementation

### Architecture

```
┌─────────────────┐
│  Profit Events  │
│  (Loans, P2P)   │
└────────┬────────┘
         │ 1%
         ▼
┌─────────────────┐
│  Savings Jar    │
│  Service        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Firestore     │
│  - savingsJar   │
│  - transactions │
│  - operations   │
└─────────────────┘
```

### Database Collections

#### savingsJar/{userId}
```typescript
{
  userId: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  autoThreshold: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### savingsJarTransactions/{txId}
```typescript
{
  id: string;
  userId: string;
  type: 'auto_deposit' | 'manual_deposit' | 'withdrawal';
  amount: number;
  fee?: number;
  source: string;
  balanceBefore: number;
  balanceAfter: number;
  operationId: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Timestamp;
  metadata?: object;
}
```

### API Endpoints

#### GET /api/savings-jar
Get savings jar details and current balance.

**Headers:**
```
Authorization: Bearer {idToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "balance": 250.00,
    "totalDeposited": 300.00,
    "totalWithdrawn": 50.00,
    "autoThreshold": 100,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### POST /api/savings-jar/deposit
Manually deposit funds to savings jar.

**Request Body:**
```json
{
  "amount": 100.00,
  "operationId": "manual_deposit_1234567890_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "tx_...",
    "amount": 100.00,
    "newBalance": 350.00,
    "message": "Successfully deposited R100.00"
  }
}
```

#### POST /api/savings-jar/withdraw
Withdraw funds from savings jar.

**Request Body:**
```json
{
  "amount": 100.00,
  "operationId": "withdrawal_1234567890_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "tx_...",
    "amount": 100.00,
    "fee": 1.00,
    "netAmount": 99.00,
    "newBalance": 250.00,
    "message": "Withdrew R99.00 (fee: R1.00)"
  }
}
```

#### GET /api/savings-jar/history
Get transaction history.

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tx_...",
      "userId": "...",
      "type": "auto_deposit",
      "amount": 5.00,
      "source": "loan_profit",
      "balanceBefore": 95.00,
      "balanceAfter": 100.00,
      "operationId": "...",
      "status": "completed",
      "createdAt": "..."
    }
  ],
  "count": 1
}
```

#### PUT /api/savings-jar/settings
Update auto-threshold setting.

**Request Body:**
```json
{
  "threshold": 150
}
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-threshold updated to R150"
}
```

## Integration with Existing Systems

### 1. Loan Profits
When a loan investor receives profit, add this to the profit calculation:

```typescript
import { savingsJarService } from '@/lib/savings-jar-service';
import { FEATURES } from '@/lib/features';

// After calculating investor profit
if (FEATURES.SAVINGS_JAR) {
  const operationId = savingsJarService.generateOperationId(
    investorId, 
    'auto_save_loan'
  );
  
  await savingsJarService.autoDeposit(
    investorId,
    investorProfit,
    'loan_profit',
    operationId,
    { loanId, amount: investorProfit }
  );
}
```

### 2. P2P Crypto Profits
Add to crypto trade completion:

```typescript
// After successful crypto trade
if (FEATURES.SAVINGS_JAR) {
  const profit = sellerProceeds - originalCost;
  if (profit > 0) {
    const operationId = savingsJarService.generateOperationId(
      sellerId,
      'auto_save_crypto'
    );
    
    await savingsJarService.autoDeposit(
      sellerId,
      profit,
      'crypto_profit',
      operationId,
      { tradeId, cryptocurrency, profit }
    );
  }
}
```

### 3. Referral Bonuses
Add to referral payout:

```typescript
// After paying referral commission
if (FEATURES.SAVINGS_JAR) {
  const operationId = savingsJarService.generateOperationId(
    referrerId,
    'auto_save_referral'
  );
  
  await savingsJarService.autoDeposit(
    referrerId,
    commissionAmount,
    'referral_bonus',
    operationId,
    { referredUserId, commissionAmount }
  );
}
```

## Security

### Idempotency
All operations require a unique `operationId` to prevent duplicate transactions. The system checks the operations log before executing any money movement.

### Firestore Rules
```javascript
// Users can only read their own savings jar
match /savingsJar/{userId} {
  allow read: if request.auth.uid == userId || isAdmin();
  allow write: if false; // Only server-side via API
}

// Users can only read their own transactions
match /savingsJarTransactions/{txId} {
  allow read: if resource.data.userId == request.auth.uid || isAdmin();
  allow write: if false; // Only server-side
}
```

### Authorization
All API endpoints require:
- Valid Firebase ID token
- User must be authenticated
- Feature must be enabled (`FEATURES.SAVINGS_JAR = true`)

## Configuration

### Environment Variables
```env
# Feature flag
NEXT_PUBLIC_FEATURE_SAVINGS_JAR=true

# Configuration
SAVINGS_JAR_AUTO_PERCENTAGE=0.01      # 1%
SAVINGS_JAR_WITHDRAWAL_FEE=0.01       # 1%
SAVINGS_JAR_MIN_WITHDRAWAL=100        # R100
```

### Enable Feature
1. Add environment variables to `.env.local`
2. Restart the application
3. Feature will be available in user dashboard

## Testing

### Manual Testing Checklist
- [ ] Initialize savings jar for new user
- [ ] Auto-deposit 1% from loan profit
- [ ] Auto-deposit 1% from crypto profit
- [ ] Manual deposit (valid amount)
- [ ] Manual deposit (invalid amount - error)
- [ ] Withdraw (sufficient balance)
- [ ] Withdraw (insufficient balance - error)
- [ ] Withdraw (below threshold - error)
- [ ] Verify 1% withdrawal fee calculation
- [ ] Update auto-threshold (valid)
- [ ] Update auto-threshold (< R100 - error)
- [ ] View transaction history
- [ ] Verify balance calculations
- [ ] Test idempotency (duplicate operationId)

### Unit Test Examples

See `src/tests/savings-jar-service.test.ts` for complete test suite.

## User Guide

### Getting Started
1. Navigate to Dashboard → Savings Jar
2. Your savings jar is automatically created
3. Start earning to see auto-deposits

### Making a Manual Deposit
1. Enter amount in "Deposit" card
2. Click "Deposit" button
3. Funds are immediately added to your savings jar

### Withdrawing Funds
1. Ensure balance ≥ minimum threshold (default R100)
2. Enter withdrawal amount
3. Click "Withdraw" button
4. Net amount (after 1% fee) transferred to main wallet

### Setting Your Threshold
1. Go to "Settings" section
2. Enter desired minimum balance
3. Click "Update"
4. Minimum: R100

## Monitoring & Analytics

### Admin Dashboard Metrics
- Total savings across all users
- Total deposits (auto + manual)
- Total withdrawals
- Total fees collected
- Average savings per user
- Adoption rate (users with active savings jars)

### User Metrics
- Balance
- Total deposited
- Total withdrawn
- Transaction count
- Savings rate (% of profits saved)

## Future Enhancements

### Phase 2 (Planned)
- [ ] Savings goals (target amounts)
- [ ] Interest on savings balance
- [ ] Round-up on transactions (not just profits)
- [ ] Savings challenges/gamification
- [ ] Export statements (PDF/CSV)
- [ ] Scheduled deposits
- [ ] Share savings milestones
- [ ] Savings jar for minors (parent-managed)

## Support & FAQs

### Q: Can I use my savings jar balance for loans?
**A:** No, savings jar funds are separate and cannot be used as collateral.

### Q: What's the minimum I can save?
**A:** Auto-deposits have no minimum. Manual deposits can be any positive amount.

### Q: When are auto-deposits made?
**A:** Immediately when you earn profits from loans, crypto trades, or referrals.

### Q: Can I disable auto-deposits?
**A:** Not currently. The 1% is a platform feature to encourage savings.

### Q: What happens if I don't reach my threshold?
**A:** You can still manually top up. Withdrawals are only restricted by the threshold.

### Q: Are my savings insured?
**A:** Savings are held in secure Firestore database. No traditional insurance applies.

## Technical Support

For issues or questions:
- Email: support@coinbox.ai
- Dashboard: Support Ticket System
- GitHub: Create issue (for developers)

---

**Version:** 1.0.0  
**Last Updated:** December 12, 2025  
**Status:** Production Ready (Feature Flag Required)
