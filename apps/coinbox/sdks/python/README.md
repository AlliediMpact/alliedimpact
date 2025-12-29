# Coin Box Python SDK

Official Python SDK for the Coin Box API.

## Installation

```bash
pip install coinbox-python
```

## Usage

### Initialize the Client

```python
from coinbox import CoinBoxSDK

# Create a client
coinbox = CoinBoxSDK(
    api_key='cb_live_your_api_key_here',
    base_url='https://coinbox.example.com/api/v1'  # optional
)

# Or use as a context manager
with CoinBoxSDK(api_key='cb_live_your_api_key_here') as coinbox:
    loans = coinbox.list_loans()
```

### Loans

```python
# Create a loan
loan = coinbox.create_loan(
    amount=10000,
    interest_rate=5.5,
    term=36,
    loan_type='personal',
    purpose='Home improvement'
)

# List loans
loans = coinbox.list_loans(
    page=1,
    limit=50,
    status='active'
)

# Get a specific loan
loan_details = coinbox.get_loan('loan_123abc')
```

### Investments

```python
# Create an investment
investment = coinbox.create_investment(
    amount=5000,
    investment_type='stocks',
    asset='AAPL',
    expected_return=8.5,
    duration=12
)

# List investments
investments = coinbox.list_investments(
    page=1,
    limit=50,
    status='active'
)
```

### Transactions

```python
# List transactions
transactions = coinbox.list_transactions(
    page=1,
    limit=50,
    transaction_type='deposit',
    start_date='2025-01-01',
    end_date='2025-12-31'
)
```

### Crypto Orders

```python
# Create a crypto order
order = coinbox.create_crypto_order(
    crypto='BTC',
    order_type='buy',
    amount=0.5,
    price=50000  # optional for market orders
)

# List crypto orders
orders = coinbox.list_crypto_orders(
    page=1,
    limit=50,
    order_type='buy',
    crypto='BTC'
)
```

## Error Handling

```python
from coinbox import CoinBoxSDK, CoinBoxError

try:
    loan = coinbox.create_loan(...)
except CoinBoxError as e:
    print(f'API Error: {e.message}')
    print(f'Status Code: {e.status_code}')
    print(f'Details: {e.details}')
except Exception as e:
    print(f'Unexpected error: {e}')
```

## Type Hints

This SDK includes type hints for better IDE support and type checking.

## API Documentation

For full API documentation, visit [https://coinbox.example.com/docs](https://coinbox.example.com/docs)

## Support

For support, email api@coinbox.com

## License

MIT
