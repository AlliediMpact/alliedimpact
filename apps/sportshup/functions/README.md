# CupFinal Cloud Functions

Firebase Cloud Functions for CupFinal wallet and payment operations.

## Functions

### 1. `handlePayFastWebhook` (HTTP)
Processes PayFast ITN (Instant Transaction Notification) after successful payment.

**Security:**
- Validates PayFast signature (MD5 hash with passphrase)
- Checks payment status (COMPLETE)
- Prevents duplicate processing
- IP validation (production only)

**Flow:**
1. Receive POST request from PayFast
2. Validate signature
3. Check payment status
4. Record payment in `cupfinal_payments`
5. Update wallet balance atomically
6. Create transaction record

**Endpoint:** `https://your-region-your-project.cloudfunctions.net/handlePayFastWebhook`

### 2. `deductVoteFromWallet` (Callable)
Deducts R2.00 from user's wallet when they cast a vote.

**Authentication:** Required (Firebase Auth)

**Parameters:**
```typescript
{
  voteId: string;
  tournamentId: string;
  votingItemId: string;
  optionId: string;
}
```

**Flow:**
1. Verify user authentication
2. Check wallet balance (≥ R2.00)
3. Deduct R2.00 atomically
4. Record transaction

**Usage:**
```typescript
import { httpsCallable } from 'firebase/functions';

const deductVote = httpsCallable(functions, 'deductVoteFromWallet');
const result = await deductVote({
  voteId: '...',
  tournamentId: '...',
  votingItemId: '...',
  optionId: '...',
});
```

### 3. `refundWallet` (Callable)
Admin function to refund wallet balance.

**Authentication:** Required (admin or super_admin role)

**Parameters:**
```typescript
{
  userId: string;
  amountInCents: number;
  reason: string;
}
```

**Usage:**
```typescript
const refund = httpsCallable(functions, 'refundWallet');
const result = await refund({
  userId: 'user123',
  amountInCents: 2000, // R20.00
  reason: 'Voided tournament',
});
```

## Environment Variables

Set these in Firebase Functions config:

```bash
firebase functions:config:set payfast.passphrase="YOUR_PAYFAST_PASSPHRASE"
```

## Development

```bash
# Install dependencies
cd functions
npm install

# Build
npm run build

# Start emulators
npm run serve

# Deploy
npm run deploy
```

## Testing Webhook Locally

Use ngrok to expose local webhook:

```bash
ngrok http 5001
# Copy ngrok URL and set as notify_url in PayFast sandbox
```

## Production Deployment

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:handlePayFastWebhook
```

## Monitoring

View logs:
```bash
firebase functions:log
```

Or in Firebase Console: Functions > Logs
