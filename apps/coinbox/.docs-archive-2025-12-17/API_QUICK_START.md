# Coin Box API - Quick Start Guide

Get started with the Coin Box API in minutes!

---

## Step 1: Get Your API Key

1. Log in to your Coin Box account
2. Navigate to **Developer Portal** (`/developer`)
3. Click **Create API Key**
4. Choose your tier:
   - **Basic**: 10 req/min (Free)
   - **Pro**: 100 req/min ($29/month)
   - **Enterprise**: 1,000 req/min (Contact sales)
5. Save your API key securely - it's only shown once!

---

## Step 2: Choose Your SDK

### JavaScript/TypeScript

```bash
npm install @coinbox/sdk
```

```typescript
import { CoinBoxSDK } from '@coinbox/sdk';

const coinbox = new CoinBoxSDK({
  apiKey: 'cb_live_your_api_key_here'
});

// Create a loan
const loan = await coinbox.createLoan({
  amount: 10000,
  interestRate: 5.5,
  term: 36,
  type: 'personal'
});

console.log('Loan created:', loan);
```

### Python

```bash
pip install coinbox-python
```

```python
from coinbox import CoinBoxSDK

coinbox = CoinBoxSDK(api_key='cb_live_your_api_key_here')

# Create a loan
loan = coinbox.create_loan(
    amount=10000,
    interest_rate=5.5,
    term=36,
    loan_type='personal'
)

print('Loan created:', loan)
```

### cURL (REST API)

```bash
curl -X POST https://coinbox.example.com/api/v1/loans \
  -H "Authorization: Bearer cb_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "interestRate": 5.5,
    "term": 36,
    "type": "personal"
  }'
```

---

## Step 3: Common Operations

### List Loans

**JavaScript:**
```typescript
const loans = await coinbox.listLoans({
  page: 1,
  limit: 50,
  status: 'active'
});
```

**Python:**
```python
loans = coinbox.list_loans(
    page=1,
    limit=50,
    status='active'
)
```

**cURL:**
```bash
curl https://coinbox.example.com/api/v1/loans?page=1&limit=50&status=active \
  -H "Authorization: Bearer cb_live_your_api_key_here"
```

### Create Investment

**JavaScript:**
```typescript
const investment = await coinbox.createInvestment({
  amount: 5000,
  type: 'stocks',
  asset: 'AAPL',
  expectedReturn: 8.5,
  duration: 12
});
```

**Python:**
```python
investment = coinbox.create_investment(
    amount=5000,
    investment_type='stocks',
    asset='AAPL',
    expected_return=8.5,
    duration=12
)
```

### Create Crypto Order

**JavaScript:**
```typescript
const order = await coinbox.createCryptoOrder({
  crypto: 'BTC',
  orderType: 'buy',
  amount: 0.5,
  price: 50000 // optional
});
```

**Python:**
```python
order = coinbox.create_crypto_order(
    crypto='BTC',
    order_type='buy',
    amount=0.5,
    price=50000  # optional
)
```

---

## Step 4: Set Up Webhooks (Optional)

Receive real-time notifications about events in your account.

### Create a Webhook

**JavaScript:**
```typescript
const response = await fetch('https://coinbox.example.com/api/v1/webhooks', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer cb_live_your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://your-server.com/webhooks',
    events: [
      'loan.created',
      'loan.approved',
      'investment.created'
    ]
  })
});

const { webhook } = await response.json();
console.log('Webhook secret:', webhook.secret); // Save this!
```

### Verify Webhook Signatures

**Node.js:**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const parts = signature.split(',');
  const timestamp = parts[0].split('=')[1];
  const receivedSig = parts[1].split('=')[1];
  
  const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(receivedSig),
    Buffer.from(expectedSig)
  );
}

// In your webhook handler
app.post('/webhooks', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = verifyWebhook(req.body, signature, 'whsec_your_secret');
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook
  console.log('Event:', req.body.event);
  console.log('Data:', req.body.data);
  
  res.status(200).send('OK');
});
```

**Python:**
```python
import hmac
import hashlib
import time

def verify_webhook(payload, signature, secret):
    parts = signature.split(',')
    timestamp = int(parts[0].split('=')[1])
    received_sig = parts[1].split('=')[1]
    
    # Check timestamp (5 minute tolerance)
    if abs(time.time() - timestamp) > 300:
        return False
    
    signed_payload = f"{timestamp}.{json.dumps(payload)}"
    expected_sig = hmac.new(
        secret.encode(),
        signed_payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(received_sig, expected_sig)

# In your Flask webhook handler
@app.route('/webhooks', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    is_valid = verify_webhook(request.json, signature, 'whsec_your_secret')
    
    if not is_valid:
        return 'Invalid signature', 401
    
    # Process the webhook
    event = request.json.get('event')
    data = request.json.get('data')
    print(f'Event: {event}')
    print(f'Data: {data}')
    
    return 'OK', 200
```

---

## Rate Limits

Monitor your usage with response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702742400
```

### Limits by Tier

| Tier | Per Minute | Per Hour | Per Day |
|------|------------|----------|---------|
| Basic | 10 | 100 | 1,000 |
| Pro | 100 | 1,000 | 10,000 |
| Enterprise | 1,000 | 10,000 | 100,000 |

---

## Error Handling

### Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "error": "Invalid amount",
  "details": {
    "field": "amount",
    "message": "Amount must be greater than 0"
  }
}
```

### Handling Errors

**JavaScript:**
```typescript
try {
  const loan = await coinbox.createLoan({...});
} catch (error) {
  if (error instanceof CoinBoxError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.statusCode);
  }
}
```

**Python:**
```python
try:
    loan = coinbox.create_loan(...)
except CoinBoxError as e:
    print(f'API Error: {e.message}')
    print(f'Status: {e.status_code}')
```

---

## Available Events

### Loan Events
- `loan.created`
- `loan.approved`
- `loan.rejected`
- `loan.disbursed`
- `loan.payment_received`
- `loan.completed`

### Investment Events
- `investment.created`
- `investment.completed`
- `investment.dividend_paid`

### Transaction Events
- `transaction.created`
- `transaction.completed`
- `transaction.failed`

### Crypto Events
- `crypto.order_created`
- `crypto.order_filled`
- `crypto.order_cancelled`

### User Events
- `user.kyc_completed`
- `user.kyc_rejected`

---

## Best Practices

### 1. Secure Your API Key
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Use different keys for development and production

### 2. Handle Rate Limits
```typescript
// Implement exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.statusCode === 429 && i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      } else {
        throw error;
      }
    }
  }
}
```

### 3. Use Webhooks for Real-Time Updates
Instead of polling, set up webhooks to receive instant notifications.

### 4. Implement Proper Error Handling
Always wrap API calls in try-catch blocks and handle errors gracefully.

### 5. Log API Requests
Keep logs of API requests for debugging and monitoring.

---

## Need Help?

- 📚 **Documentation**: Visit [Developer Portal](/developer)
- 💬 **Support**: Email api@coinbox.com
- 🐛 **Issues**: GitHub Issues (coming soon)
- 📊 **Status**: Check API status page

---

## Examples Repository

Check out our examples repository for complete working examples:
- Next.js application
- Express.js server
- Python Flask application
- React Native mobile app

Coming soon!

---

**Happy coding! 🚀**
