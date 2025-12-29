# @coinbox/sdk

Official JavaScript/TypeScript SDK for the Coin Box API.

## Installation

```bash
npm install @coinbox/sdk
# or
yarn add @coinbox/sdk
# or
pnpm add @coinbox/sdk
```

## Usage

### Initialize the Client

```typescript
import { CoinBoxSDK } from '@coinbox/sdk';

const coinbox = new CoinBoxSDK({
  apiKey: 'cb_live_your_api_key_here',
  baseUrl: 'https://coinbox.example.com/api/v1' // optional
});
```

### Loans

```typescript
// Create a loan
const loan = await coinbox.createLoan({
  amount: 10000,
  interestRate: 5.5,
  term: 36,
  type: 'personal',
  purpose: 'Home improvement'
});

// List loans
const loans = await coinbox.listLoans({
  page: 1,
  limit: 50,
  status: 'active'
});

// Get a specific loan
const loanDetails = await coinbox.getLoan('loan_123abc');
```

### Investments

```typescript
// Create an investment
const investment = await coinbox.createInvestment({
  amount: 5000,
  type: 'stocks',
  asset: 'AAPL',
  expectedReturn: 8.5,
  duration: 12
});

// List investments
const investments = await coinbox.listInvestments({
  page: 1,
  limit: 50,
  status: 'active'
});
```

### Transactions

```typescript
// List transactions
const transactions = await coinbox.listTransactions({
  page: 1,
  limit: 50,
  type: 'deposit',
  startDate: '2025-01-01',
  endDate: '2025-12-31'
});
```

### Crypto Orders

```typescript
// Create a crypto order
const order = await coinbox.createCryptoOrder({
  crypto: 'BTC',
  orderType: 'buy',
  amount: 0.5,
  price: 50000 // optional for market orders
});

// List crypto orders
const orders = await coinbox.listCryptoOrders({
  page: 1,
  limit: 50,
  orderType: 'buy',
  crypto: 'BTC'
});
```

## Error Handling

```typescript
import { CoinBoxError } from '@coinbox/sdk';

try {
  const loan = await coinbox.createLoan({...});
} catch (error) {
  if (error instanceof CoinBoxError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Details:', error.details);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions out of the box.

## API Documentation

For full API documentation, visit [https://coinbox.example.com/docs](https://coinbox.example.com/docs)

## Support

For support, email api@coinbox.com

## License

MIT
