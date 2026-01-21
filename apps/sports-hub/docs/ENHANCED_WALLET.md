# Enhanced Wallet System

## Overview

The Enhanced Wallet System provides comprehensive transaction management for SportsHub users. It includes advanced filtering, detailed transaction views, balance trend analysis, CSV export capabilities, and improved user experience for managing wallet funds.

## Features

### 1. **Balance Trend Chart**
- 30-day balance history visualization
- Line chart showing balance changes over time
- Trend indicator (Growing/Declining/Stable)
- Helps users understand spending patterns

### 2. **Transaction Statistics**
- **Total Income**: Sum of all top-ups and refunds
- **Total Expenses**: Sum of all votes and debits
- **Transaction Count**: Total number of transactions
- **Average Amount**: Average transaction size

### 3. **Advanced Filtering**
- **Search**: Find transactions by email, tournament, payment ID
- **Type Filter**: Filter by topup, vote, refund, or debit
- **Status Filter**: Filter by completed, pending, or failed
- **Date Range**: Custom start and end date selection
- **Real-time Filtering**: Instant results as you type

### 4. **Transaction Details Modal**
- Complete transaction information
- Transaction ID, date, and time
- Amount and balance after transaction
- Payment ID and tournament details (if applicable)
- Refund reasons (if applicable)
- Additional metadata in JSON format

### 5. **Export Functionality**
- Export filtered transactions to CSV
- Includes all relevant fields
- Timestamped filename for organization
- Opens in Excel/Google Sheets

### 6. **Tabbed Interface**
- **Top Up Tab**: Quick wallet funding with preset amounts
- **Transactions Tab**: Full transaction history with filtering
- Clean separation of functionality
- Improved navigation

### 7. **Responsive Design**
- Mobile-friendly layout
- Touch-optimized interactions
- Adaptive grid system
- Accessible on all devices

## Components

### EnhancedWalletTransactions Component
**Location**: `src/components/wallet/EnhancedWalletTransactions.tsx`

Main component for displaying and managing wallet transactions.

**Props**:
```typescript
interface EnhancedWalletTransactionsProps {
  userId: string;                // User ID to load transactions for
  defaultPageSize?: number;      // Items per page (default: 20)
  showAdminActions?: boolean;    // Show admin-specific actions (default: false)
}
```

**Key Features**:
- Advanced filtering system (5 filter types)
- Client-side pagination (20 transactions per page)
- 30-day balance trend chart
- Statistics cards
- CSV export
- Transaction details modal
- Responsive table layout

**State Management**:
```typescript
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');
const [typeFilter, setTypeFilter] = useState('all');
const [statusFilter, setStatusFilter] = useState('all');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [chartData, setChartData] = useState<ChartData[]>([]);
```

### Updated Wallet Page
**Location**: `src/app/(dashboard)/wallet/page.tsx`

Enhanced with tabbed interface:
- **Top Up Tab**: Original top-up functionality
- **Transactions Tab**: New enhanced transactions component
- Improved balance display with trend indicator
- Better dark mode support

## Data Model

### Transaction Interface

```typescript
interface Transaction {
  id: string;                        // Document ID
  userId: string;                    // User's ID
  userEmail: string;                 // User's email
  type: 'topup' | 'vote' | 'refund' | 'debit'; // Transaction type
  amountInCents: number;             // Amount in cents
  balanceAfterInCents: number;       // Balance after transaction
  timestamp: Timestamp;              // Transaction time
  status: 'completed' | 'pending' | 'failed'; // Transaction status
  paymentId?: string;                // PayFast payment ID (if applicable)
  tournamentId?: string;             // Tournament ID (for votes)
  tournamentName?: string;           // Tournament name (for votes)
  refundReason?: string;             // Reason for refund (if applicable)
  metadata?: Record<string, any>;    // Additional data
}
```

### Chart Data Interface

```typescript
interface ChartData {
  date: string;        // Formatted date (e.g., "Jan 20")
  balance: number;     // Balance in Rands
  income: number;      // Income for that day
  expenses: number;    // Expenses for that day
}
```

## Firestore Integration

### Collections Structure

```
sportshub_wallets/{userId}
  ├── balanceInCents: number
  ├── currency: 'ZAR'
  ├── createdAt: Timestamp
  ├── lastUpdated: Timestamp
  └── transactions (subcollection)
      ├── {transactionId}
      │   ├── userId: string
      │   ├── userEmail: string
      │   ├── type: string
      │   ├── amountInCents: number
      │   ├── balanceAfterInCents: number
      │   ├── timestamp: Timestamp
      │   ├── status: string
      │   ├── paymentId?: string
      │   ├── tournamentId?: string
      │   ├── tournamentName?: string
      │   ├── refundReason?: string
      │   └── metadata?: object
      └── ...
```

### Required Indexes

```
Collection: sportshub_wallets/{userId}/transactions
Fields:
  - timestamp (Descending)
  - type (Ascending)
  - status (Ascending)
Query Scopes: Collection
```

### Query Patterns

1. **Load Recent Transactions**:
```typescript
const transactionsRef = collection(db, 'sportshub_wallets', userId, 'transactions');
const q = query(
  transactionsRef,
  orderBy('timestamp', 'desc'),
  limit(100)
);
```

2. **Filter by Type**:
```typescript
const q = query(
  transactionsRef,
  where('type', '==', 'topup'),
  orderBy('timestamp', 'desc')
);
```

3. **Date Range Query**:
```typescript
const q = query(
  transactionsRef,
  where('timestamp', '>=', startDate),
  where('timestamp', '<=', endDate),
  orderBy('timestamp', 'desc')
);
```

## Usage Examples

### 1. Basic Integration

```typescript
import EnhancedWalletTransactions from '@/components/wallet/EnhancedWalletTransactions';

export default function WalletPage() {
  const { currentUser } = useAuth();
  
  return (
    <div>
      <h1>My Wallet</h1>
      {currentUser && (
        <EnhancedWalletTransactions userId={currentUser.uid} />
      )}
    </div>
  );
}
```

### 2. Admin View with Custom Page Size

```typescript
<EnhancedWalletTransactions 
  userId={selectedUserId}
  defaultPageSize={50}
  showAdminActions={true}
/>
```

### 3. Programmatic Filtering

The component maintains internal state for filters, but you can extend it to accept initial filter values:

```typescript
// Future enhancement
<EnhancedWalletTransactions 
  userId={userId}
  initialFilters={{
    type: 'vote',
    startDate: '2026-01-01',
    endDate: '2026-01-31'
  }}
/>
```

## Filter System

### Search Filter
- Searches across multiple fields:
  - User email
  - Tournament name
  - Payment ID
  - Transaction ID
- Case-insensitive matching
- Real-time filtering

### Type Filter
- **All Types**: Show all transactions
- **Topup**: Wallet deposits via PayFast
- **Vote**: Vote purchases
- **Refund**: Admin refunds
- **Debit**: Other deductions

### Status Filter
- **All Statuses**: Show all transactions
- **Completed**: Successfully processed
- **Pending**: Awaiting confirmation
- **Failed**: Payment/processing failure

### Date Range Filter
- **Start Date**: Filter transactions on or after this date
- **End Date**: Filter transactions on or before this date
- Inclusive of selected dates
- Works with other filters

## Chart Visualization

### Balance Trend Chart

**Purpose**: Show wallet balance over 30 days

**Data Points**: 30 (one per day)

**Calculation**:
```typescript
for (let i = 29; i >= 0; i--) {
  const date = subDays(new Date(), i);
  const dayTransactions = transactions.filter(/* match date */);
  
  const income = dayTransactions
    .filter(tx => tx.type === 'topup' || tx.type === 'refund')
    .reduce((sum, tx) => sum + tx.amountInCents, 0);
    
  const expenses = dayTransactions
    .filter(tx => tx.type === 'vote' || tx.type === 'debit')
    .reduce((sum, tx) => sum + tx.amountInCents, 0);
    
  const balance = lastTransaction?.balanceAfterInCents || previousBalance;
  
  chartData.push({ date, balance, income, expenses });
}
```

**Trend Calculation**:
- **Growing**: > 5% increase over 30 days
- **Declining**: > 5% decrease over 30 days
- **Stable**: Within ±5% range

## Export Functionality

### CSV Export

**Headers**:
- Date
- Type
- Amount
- Balance After
- Status
- Payment ID
- Tournament
- Notes

**Format**:
```csv
"Date","Type","Amount","Balance After","Status","Payment ID","Tournament","Notes"
"2026-01-20 14:30:00","topup","50.00","50.00","completed","pf_12345","",""
"2026-01-20 14:35:00","vote","2.00","48.00","completed","","Cup Final 2026",""
```

**Filename Format**:
```
transactions-YYYY-MM-DD-HHmmss.csv
Example: transactions-2026-01-20-143022.csv
```

**Usage**:
1. Apply desired filters
2. Click "Export CSV" button
3. File downloads automatically
4. Open in Excel, Google Sheets, or text editor

## Transaction Details Modal

### Information Displayed

1. **Basic Details**:
   - Date & Time (formatted: "Jan 20, 2026, 2:30 PM")
   - Transaction ID (full ID, selectable)
   - Type (with icon)
   - Status (badge)

2. **Financial Details**:
   - Amount (with +/- prefix, color-coded)
   - Balance After transaction

3. **Conditional Fields**:
   - Payment ID (if applicable)
   - Tournament Name & ID (for votes)
   - Refund Reason (for refunds)
   - Additional Metadata (JSON formatted)

### Modal Features
- Scrollable content for long data
- Copy-friendly formatting
- JSON syntax highlighting
- Responsive layout
- Keyboard accessible (Esc to close)

## Statistics Cards

### 1. Total Income Card
- **Value**: Sum of topups + refunds
- **Color**: Green (positive)
- **Format**: R0.00

### 2. Total Expenses Card
- **Value**: Sum of votes + debits
- **Color**: Red (negative)
- **Format**: R0.00

### 3. Transactions Card
- **Value**: Count of filtered transactions
- **Color**: Default
- **Format**: Number

### 4. Average Amount Card
- **Value**: Average transaction amount
- **Color**: Default
- **Format**: R0.00
- **Calculation**: Total amount / transaction count

## Pagination

### Features
- 20 transactions per page (configurable)
- Previous/Next navigation buttons
- Current page indicator
- Total pages calculated dynamically
- Results summary (showing X to Y of Z)

### Navigation
- **Previous Button**: Disabled on first page
- **Next Button**: Disabled on last page
- Page counter updates automatically
- Maintains filters across pages

## Performance Optimizations

### Client-Side Filtering
- Initial load: Fetch 100 transactions
- Filters applied client-side for instant results
- No additional Firestore queries for filters
- Reduces Firestore costs

### Pagination Strategy
- Only display 20 items at a time
- Calculate pages from filtered results
- Instant navigation (no loading)
- Memory-efficient

### Chart Optimization
- Generate once on data load
- Update only when transactions change
- Memoize calculations (future enhancement)
- Efficient date operations with date-fns

## Security & Privacy

### Access Control
- Users can only view their own transactions
- Admin route protection (future enhancement)
- Firestore security rules enforce user-level access

### Firestore Security Rules

```javascript
match /sportshub_wallets/{userId} {
  allow read: if request.auth.uid == userId || isSuperAdmin();
  allow write: if false; // Only Cloud Functions
  
  match /transactions/{transactionId} {
    allow read: if request.auth.uid == userId || isSuperAdmin();
    allow write: if false; // Only Cloud Functions
  }
}
```

### Data Protection
- Payment IDs partially masked (optional)
- Personal emails visible only to owner
- Sensitive metadata excluded from exports
- Audit logging for admin access

## User Experience

### Loading States
- Skeleton loaders during initial load
- Spinner for data fetching
- Disabled buttons during operations
- Clear loading indicators

### Empty States
- Helpful message when no transactions
- Suggestions for next action
- Icon illustration
- Consistent styling

### Error Handling
- Graceful error messages
- Retry functionality
- Console logging for debugging
- User-friendly error text

### Mobile Experience
- Responsive table (stacks on mobile)
- Touch-friendly buttons
- Swipeable cards (future)
- Optimized chart size

## Testing Checklist

### Functionality
- [ ] Transactions load correctly from Firestore
- [ ] Search filter works across all searchable fields
- [ ] Type filter shows correct transaction types
- [ ] Status filter shows correct statuses
- [ ] Date range filter works correctly
- [ ] Pagination navigates correctly
- [ ] Export generates valid CSV
- [ ] Detail modal shows complete information
- [ ] Chart displays 30-day trend
- [ ] Statistics calculate correctly
- [ ] Trend indicator shows correct state

### Visual
- [ ] Charts render on all screen sizes
- [ ] Cards align properly in grid
- [ ] Table is readable on mobile
- [ ] Dark mode works correctly
- [ ] Icons display properly
- [ ] Status badges color-coded correctly

### Performance
- [ ] Initial load < 2 seconds
- [ ] Filtering is instant (< 100ms)
- [ ] Pagination is instant
- [ ] Export handles 1000+ transactions
- [ ] Chart renders smoothly

### Edge Cases
- [ ] Empty transaction list handled
- [ ] No chart data handled gracefully
- [ ] Large transaction amounts formatted correctly
- [ ] Missing optional fields don't break UI
- [ ] Date edge cases (midnight, timezone) handled

## Troubleshooting

### Transactions Not Loading

**Problem**: Transaction list is empty

**Solutions**:
1. Check Firestore collection name: `sportshub_wallets/{userId}/transactions`
2. Verify userId is correct
3. Check browser console for errors
4. Confirm Firestore rules allow read access
5. Verify transactions exist in Firestore

### Chart Not Displaying

**Problem**: Balance trend chart is blank

**Solutions**:
1. Ensure recharts package is installed
2. Check that transactions have timestamp field
3. Verify chart container has dimensions
4. Check browser console for rendering errors
5. Confirm date-fns is installed

### Export Not Working

**Problem**: CSV download fails

**Solutions**:
1. Check browser's download settings
2. Verify popup blocker isn't blocking download
3. Ensure transactions are loaded
4. Try smaller date range
5. Check browser console for errors

### Filters Not Working

**Problem**: Filters don't affect results

**Solutions**:
1. Clear browser cache
2. Check that filterTransactions() is being called
3. Verify useEffect dependencies
4. Check console for JavaScript errors
5. Try refreshing the page

## Future Enhancements

### Planned Features
1. **PDF Export**: Generate PDF reports with charts
2. **Email Reports**: Schedule automated email reports
3. **Advanced Analytics**: Spending patterns, predictions
4. **Bulk Refunds**: Admin bulk refund workflow
5. **Transaction Search**: Full-text search across all fields
6. **Saved Filters**: Save frequently used filter combinations
7. **Real-time Updates**: Live transaction updates via Firestore listeners
8. **Mobile App**: Dedicated mobile application
9. **Recurring Payments**: Automatic top-ups when balance low
10. **Transaction Categories**: Custom tags/categories for transactions

### Integration Opportunities
- **Accounting Software**: Export to QuickBooks, Xero
- **Analytics**: Google Analytics event tracking
- **Notifications**: Email/SMS for large transactions
- **Budgeting**: Set spending limits and alerts
- **Rewards**: Cashback or loyalty points

## Best Practices

### For Users
1. Review transactions regularly
2. Export statements monthly
3. Contact support for discrepancies
4. Keep top-up receipts
5. Monitor balance before voting

### For Developers
1. Always validate transaction data
2. Log errors to Sentry
3. Test with large datasets
4. Optimize Firestore queries
5. Monitor performance metrics

### For Admins
1. Review refund requests promptly
2. Document refund reasons clearly
3. Monitor for suspicious activity
4. Audit large transactions
5. Maintain transaction integrity

## API Reference

### loadTransactions()

Loads transactions from Firestore.

**Parameters**: 
- `loadMore?: boolean` - Load more transactions (pagination)

**Returns**: `Promise<void>`

**Side Effects**:
- Updates `transactions` state
- Updates `lastDoc` for pagination
- Updates `hasMore` flag

### filterTransactions()

Applies all active filters to transactions.

**Returns**: `void`

**Side Effects**:
- Updates `filteredTransactions` state
- Resets to page 1

### generateChartData()

Creates 30-day chart data from transactions.

**Returns**: `void`

**Side Effects**:
- Updates `chartData` state
- Updates `balanceTrend` state

### exportToCSV()

Exports filtered transactions to CSV file.

**Returns**: `void`

**Side Effects**:
- Triggers browser download
- Creates and removes temporary DOM elements

### viewTransactionDetails()

Opens detail modal for a transaction.

**Parameters**:
- `transaction: Transaction`

**Returns**: `void`

**Side Effects**:
- Updates `selectedTransaction` state
- Opens detail modal

## Resources

- **Component**: [src/components/wallet/EnhancedWalletTransactions.tsx](../src/components/wallet/EnhancedWalletTransactions.tsx)
- **Page**: [src/app/(dashboard)/wallet/page.tsx](../src/app/(dashboard)/wallet/page.tsx)
- **Charts**: [recharts Documentation](https://recharts.org/)
- **Date Utils**: [date-fns Documentation](https://date-fns.org/)
- **Related**: [ARCHITECTURE.md](./ARCHITECTURE.md)
