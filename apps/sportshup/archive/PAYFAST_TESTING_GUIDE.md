# 💳 PayFast Integration Testing Guide

**Version**: 1.0.0  
**Last Updated**: January 21, 2026

This guide explains how to test PayFast payment integration in sandbox mode before going live.

---

## 📋 Overview

PayFast is South Africa's leading payment gateway. SportsHub uses it for wallet top-ups.

**Sandbox Environment**: Test with fake money, no real transactions  
**Production Environment**: Real payments with real money

---

## 1️⃣ Sandbox Setup

### Step 1: Get Sandbox Credentials

PayFast provides public sandbox credentials for testing:

```env
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=10000100
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=46f0cd694581a
NEXT_PUBLIC_PAYFAST_PASSPHRASE=jt7NOE43FZPn
NEXT_PUBLIC_PAYFAST_SANDBOX=true
```

These are **already configured** in `.env.example`.

### Step 2: Configure Environment

```bash
cd apps/sports-hub
cp .env.example .env.local
# Edit .env.local and ensure NEXT_PUBLIC_PAYFAST_SANDBOX=true
```

---

## 2️⃣ Testing Payment Flow

### Test Scenario 1: Successful Payment

1. **Start Development Server**:
   ```bash
   pnpm dev
   ```

2. **Login to SportsHub**:
   - Create account or login
   - Navigate to Wallet section

3. **Initiate Top-Up**:
   - Click "Top Up Wallet"
   - Enter amount (e.g., R50)
   - Click "Pay with PayFast"

4. **Complete Sandbox Payment**:
   - You'll be redirected to PayFast sandbox
   - Use test card: **4111 1111 1111 1111**
   - Expiry: Any future date (e.g., 12/25)
   - CVV: **123**
   - Click "Pay Now"

5. **Verify Result**:
   - Redirected back to SportsHub
   - Wallet balance updated
   - Transaction appears in history
   - Notification received

### Test Scenario 2: Failed Payment

1. **Initiate Payment** as above
2. **At PayFast Page**: Click "Cancel"
3. **Verify**:
   - Redirected to cancel page
   - Wallet NOT updated
   - Error message shown

### Test Scenario 3: Webhook Testing

PayFast sends ITN (Instant Transaction Notification) to your webhook.

**Manual Webhook Test**:

```bash
# Test your webhook endpoint
curl -X POST http://localhost:3008/api/payfast/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "m_payment_id=test-$(date +%s)" \
  -d "pf_payment_id=1234567" \
  -d "payment_status=COMPLETE" \
  -d "item_name=Wallet Top-Up" \
  -d "amount_gross=50.00" \
  -d "amount_fee=3.75" \
  -d "amount_net=46.25" \
  -d "custom_str1=user123" \
  -d "custom_str2=wallet_topup" \
  -d "custom_int1=5000" \
  -d "name_first=Test" \
  -d "name_last=User" \
  -d "email_address=test@example.com" \
  -d "merchant_id=10000100"
```

**Expected Response**: `200 OK`

**Check Logs**:
```bash
# Function logs (if using Cloud Functions)
firebase functions:log --only handlePayFastWebhook

# Next.js logs (if using API route)
# Check terminal output
```

---

## 3️⃣ Automated Testing Script

### Create Test Script

Create `scripts/test-payfast-integration.js`:

```javascript
const crypto = require('crypto');

// Sandbox credentials
const merchantId = '10000100';
const merchantKey = '46f0cd694581a';
const passphrase = 'jt7NOE43FZPn';

// Test payment data
const paymentData = {
  merchant_id: merchantId,
  merchant_key: merchantKey,
  return_url: 'http://localhost:3008/wallet/success',
  cancel_url: 'http://localhost:3008/wallet/cancel',
  notify_url: 'http://localhost:3008/api/payfast/webhook',
  name_first: 'Test',
  name_last: 'User',
  email_address: 'test@example.com',
  amount: '50.00',
  item_name: 'Wallet Top-Up',
  custom_str1: 'test-user-123',
  custom_str2: 'wallet_topup',
  custom_int1: '5000'
};

// Generate signature
function generateSignature(data, pass) {
  const params = Object.keys(data)
    .filter(key => key !== 'signature')
    .sort()
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');
  
  const stringToHash = pass ? `${params}&passphrase=${pass}` : params;
  return crypto.createHash('md5').update(stringToHash).digest('hex');
}

const signature = generateSignature(paymentData, passphrase);
paymentData.signature = signature;

console.log('PayFast Test Payment Data:');
console.log('==========================');
console.log(JSON.stringify(paymentData, null, 2));
console.log('\nSignature:', signature);
console.log('\nPayment URL:');
console.log('https://sandbox.payfast.co.za/eng/process');
console.log('\nTest Card: 4111 1111 1111 1111');
console.log('Expiry: 12/25');
console.log('CVV: 123');
```

### Run Test

```bash
node scripts/test-payfast-integration.js
```

---

## 4️⃣ Validation Checklist

Test each scenario and verify:

### ✅ Payment Initiation
- [ ] Payment form displays correctly
- [ ] Amount is formatted correctly (cents → rands)
- [ ] User details pre-filled
- [ ] Signature generated correctly

### ✅ PayFast Redirect
- [ ] Redirect to sandbox.payfast.co.za
- [ ] All payment details shown correctly
- [ ] Test card accepted
- [ ] Payment completes successfully

### ✅ Return Flow
- [ ] Successful payment redirects to `/wallet/success`
- [ ] Cancelled payment redirects to `/wallet/cancel`
- [ ] Appropriate messages shown

### ✅ Webhook Processing
- [ ] ITN received from PayFast
- [ ] Signature validated correctly
- [ ] Wallet balance updated
- [ ] Transaction recorded in history
- [ ] Notification sent to user

### ✅ Error Handling
- [ ] Invalid signature rejected
- [ ] Duplicate transactions prevented
- [ ] Network errors handled gracefully
- [ ] User sees appropriate error messages

---

## 5️⃣ Common Issues & Solutions

### Issue: Signature Mismatch

**Symptoms**: 
- Payment fails with "Invalid signature"
- Webhook rejected

**Solution**:
1. Verify passphrase is correct
2. Check parameter encoding (use `+` for spaces, not `%20`)
3. Ensure parameters are sorted alphabetically
4. Remove `signature` field before generating new signature

**Debug**:
```javascript
// Log signature generation
console.log('Parameters:', sortedParams);
console.log('String to hash:', stringToHash);
console.log('Generated signature:', signature);
console.log('Received signature:', receivedSignature);
```

### Issue: Webhook Not Receiving Calls

**Symptoms**:
- Payment completes but wallet not updated
- No logs in webhook endpoint

**Solution**:
1. **Check URL**: Must be publicly accessible (not `localhost`)
2. **Use ngrok** for local testing:
   ```bash
   ngrok http 3008
   # Use ngrok URL as notify_url
   ```
3. **Check IP whitelist**: Allow PayFast IPs:
   - 197.97.145.144-148
   - 41.74.179.194-199

### Issue: Amount Mismatch

**Symptoms**:
- Wrong amount charged
- Wallet credited incorrectly

**Solution**:
1. Check cents → rands conversion: `(amountInCents / 100).toFixed(2)`
2. Verify `custom_int1` stores amount in cents
3. Use `amount_gross` from ITN, not `amount_net`

### Issue: Localhost Testing

**Problem**: PayFast can't reach `localhost` for webhooks

**Solution**: Use ngrok or similar tunneling service:

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3008

# Use generated URL
https://abc123.ngrok.io/api/payfast/webhook
```

---

## 6️⃣ Production Go-Live

### Pre-Production Checklist

- [ ] All sandbox tests passed
- [ ] Signature validation working
- [ ] Webhook processing verified
- [ ] Error handling tested
- [ ] Transaction logging confirmed
- [ ] Notification system working

### Switch to Production

1. **Get Production Credentials**:
   - Login to [PayFast Dashboard](https://www.payfast.co.za)
   - Navigate to Settings → Integration
   - Copy Merchant ID and Merchant Key
   - Set secure passphrase

2. **Update Environment**:
   ```env
   NEXT_PUBLIC_PAYFAST_MERCHANT_ID=your_production_id
   NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=your_production_key
   NEXT_PUBLIC_PAYFAST_PASSPHRASE=your_secure_passphrase
   NEXT_PUBLIC_PAYFAST_SANDBOX=false
   ```

3. **Configure Webhooks**:
   - Set ITN URL in PayFast dashboard
   - Use production domain: `https://sportshub.alliedimpact.com/api/payfast/webhook`

4. **Test with Real Money**:
   - Make small test payment (R10)
   - Verify wallet credited
   - Check transaction history
   - Confirm notification received

### Production Monitoring

Monitor these metrics:

```javascript
// Track in analytics
{
  payment_initiated: count,
  payment_completed: count,
  payment_failed: count,
  webhook_received: count,
  signature_validation_failed: count,
  wallet_credit_success: count,
  average_payment_time: milliseconds
}
```

**Alerts**:
- Signature validation failures > 5% → Check credentials
- Webhook not received > 10% → Check URL/IP whitelist
- Payment completion < 80% → Investigate user experience

---

## 7️⃣ Security Best Practices

### ✅ DO:
- ✅ Validate signature on every webhook call
- ✅ Check IP address against PayFast whitelist
- ✅ Use HTTPS for all endpoints
- ✅ Log all transactions (including failures)
- ✅ Set reasonable min/max top-up amounts
- ✅ Implement rate limiting (5 top-ups/hour)
- ✅ Store passphrase in environment variables (never in code)

### ❌ DON'T:
- ❌ Trust webhook data without signature validation
- ❌ Process duplicate payment IDs
- ❌ Expose merchant key in client-side code
- ❌ Skip IP whitelist checking
- ❌ Allow unlimited top-up amounts
- ❌ Process webhooks from unknown IPs

---

## 8️⃣ Testing Matrix

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Valid payment (R10) | Wallet +R10, notification sent | ⬜ |
| Valid payment (R50) | Wallet +R50, notification sent | ⬜ |
| Valid payment (R100) | Wallet +R100, notification sent | ⬜ |
| Cancelled payment | No wallet change, cancel message | ⬜ |
| Invalid signature | Webhook rejected, no credit | ⬜ |
| Duplicate payment ID | Second attempt rejected | ⬜ |
| Below minimum (R5) | Validation error, no redirect | ⬜ |
| Network timeout | Retry logic, user notified | ⬜ |
| Unknown IP webhook | Rejected (production only) | ⬜ |

---

## 📞 Support

**PayFast Support**:
- Email: support@payfast.co.za
- Phone: +27 21 201 7737
- Docs: https://developers.payfast.co.za

**SportsHub Team**:
- Email: dev@alliedimpact.com
- Docs: See `docs/` folder

---

## ✅ You're Ready!

Complete the testing matrix above, and you're ready for production payments! 🎉
