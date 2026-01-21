# Audit Logs System

## Overview

The Audit Logs system provides comprehensive visibility into all administrative actions and system events in SportsHub. It tracks who did what, when, and with what outcome, enabling compliance, security monitoring, and troubleshooting.

## Features

### 1. **Comprehensive Logging**
- Automatic tracking of all admin actions
- User authentication events (login, logout, MFA)
- Resource modifications (create, update, delete)
- Wallet operations (refunds, credits, debits)
- Failed actions with error details

### 2. **Advanced Filtering**
- **Search**: Full-text search across user emails, actions, resources
- **Action Filter**: Filter by specific action types (user.create, wallet.refund, etc.)
- **Status Filter**: Filter by success, failure, or pending status
- **Date Range**: View logs from last 24 hours, 7 days, 30 days, or 90 days
- **User Filter**: Filter by specific user ID

### 3. **Rich Data Display**
- Timestamp with millisecond precision
- User identification (email + ID)
- Action type with visual indicators
- Resource details and IDs
- Status badges (color-coded)
- IP address and user agent tracking

### 4. **Detailed Log View**
- Modal with complete log information
- JSON viewer for additional details
- Error message display for failed actions
- Full request metadata

### 5. **Export Functionality**
- Export filtered logs to CSV
- Includes all relevant fields
- Timestamped filename for organization

### 6. **Performance Optimizations**
- Client-side pagination (50 logs per page)
- Firestore query optimization with indexes
- Date range filtering to limit data transfer
- Efficient state management

## Components

### AuditLogsViewer Component
**Location**: `src/components/admin/AuditLogsViewer.tsx`

Main component for displaying and filtering audit logs.

**Props**:
```typescript
interface AuditLogsViewerProps {
  defaultPageSize?: number; // Default: 50
}
```

**Key Features**:
- Real-time loading from Firestore
- Multi-criteria filtering
- Pagination with page navigation
- Export to CSV
- Detailed log viewing

### Audit Logger Utility
**Location**: `src/lib/audit-logger.ts`

Provides helper functions for logging audit events.

**Functions**:

```typescript
// Log any audit event
logAuditEvent(data: AuditLogData): Promise<string>

// Log successful action
logSuccess(
  userId: string,
  userEmail: string,
  action: AuditAction,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<string>

// Log failed action
logFailure(
  userId: string,
  userEmail: string,
  action: AuditAction,
  resource: string,
  errorMessage: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<string>

// Get client IP address from request
getClientIP(request: Request): string

// Get user agent from request
getUserAgent(request: Request): string
```

## Data Model

### AuditLog Interface

```typescript
interface AuditLog {
  id: string;                    // Document ID
  timestamp: Timestamp;          // Server timestamp
  userId: string;                // Acting user's ID
  userEmail: string;             // Acting user's email
  action: AuditAction;           // Action type
  resource: string;              // Resource type (users, tournaments, etc.)
  resourceId?: string;           // Specific resource ID
  details?: Record<string, any>; // Additional context
  ipAddress?: string;            // Client IP address
  userAgent?: string;            // Browser/client info
  status: 'success' | 'failure' | 'pending';
  errorMessage?: string;         // Error details if failed
}
```

### Action Types

```typescript
type AuditAction = 
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.suspend'
  | 'user.activate'
  | 'tournament.create'
  | 'tournament.update'
  | 'tournament.delete'
  | 'wallet.refund'
  | 'wallet.credit'
  | 'wallet.debit'
  | 'settings.update'
  | 'mfa.enable'
  | 'mfa.disable'
  | 'admin.login'
  | 'admin.logout';
```

## Firestore Integration

### Collection: `sportshub_admin_logs`

**Security Rules**:
```
match /sportshub_admin_logs/{logId} {
  // Only super admins can read logs
  allow read: if isSuperAdmin();
  
  // Only Cloud Functions can write logs
  allow write: if false;
}
```

**Indexes Required**:
```
Collection: sportshub_admin_logs
Fields:
  - timestamp (Descending)
  - action (Ascending)
  - status (Ascending)
  - userId (Ascending)
```

**Query Patterns**:
1. Recent logs: `orderBy('timestamp', 'desc').limit(50)`
2. Date range: `where('timestamp', '>=', startDate).orderBy('timestamp', 'desc')`
3. By user: `where('userId', '==', userId).orderBy('timestamp', 'desc')`
4. By action: `where('action', '==', actionType).orderBy('timestamp', 'desc')`

## Usage Examples

### 1. Log User Suspension

```typescript
import { logAuditEvent, getClientIP, getUserAgent } from '@/lib/audit-logger';

export async function POST(request: Request) {
  try {
    const { userId, reason } = await request.json();
    
    // Perform the action
    await suspendUserAccount(userId);
    
    // Log success
    await logAuditEvent({
      userId: currentUser.uid,
      userEmail: currentUser.email!,
      action: 'user.suspend',
      resource: 'users',
      resourceId: userId,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      status: 'success',
      details: { reason }
    });
    
    return Response.json({ success: true });
  } catch (error: any) {
    // Log failure
    await logAuditEvent({
      userId: currentUser.uid,
      userEmail: currentUser.email!,
      action: 'user.suspend',
      resource: 'users',
      resourceId: userId,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      status: 'failure',
      errorMessage: error.message
    });
    
    throw error;
  }
}
```

### 2. Log Wallet Refund

```typescript
import { logSuccess, logFailure } from '@/lib/audit-logger';

async function processRefund(userId: string, amount: number, orderId: string) {
  try {
    await refundToWallet(userId, amount);
    
    await logSuccess(
      adminUser.uid,
      adminUser.email!,
      'wallet.refund',
      'wallets',
      userId,
      { amount, orderId, currency: 'ZAR' }
    );
  } catch (error: any) {
    await logFailure(
      adminUser.uid,
      adminUser.email!,
      'wallet.refund',
      'wallets',
      error.message,
      userId,
      { amount, orderId }
    );
    throw error;
  }
}
```

### 3. Log Tournament Creation

```typescript
import { logAuditEvent } from '@/lib/audit-logger';

async function createTournament(data: TournamentData) {
  const tournament = await createTournamentInFirestore(data);
  
  await logAuditEvent({
    userId: currentUser.uid,
    userEmail: currentUser.email!,
    action: 'tournament.create',
    resource: 'tournaments',
    resourceId: tournament.id,
    status: 'success',
    details: {
      name: data.name,
      startDate: data.startDate,
      entryFee: data.entryFee
    }
  });
  
  return tournament;
}
```

## UI Components

### Filter Bar
- **Search Input**: Real-time search with debouncing
- **Action Dropdown**: Select from 15+ action types
- **Status Dropdown**: Filter by success/failure/pending
- **Date Range Dropdown**: 4 preset ranges
- **User ID Input**: Filter by specific user

### Stats Cards
1. **Total Logs**: Count of filtered logs
2. **Success Rate**: Percentage of successful actions
3. **Failed Actions**: Count of failed actions

### Logs Table
- **Columns**: Timestamp, User, Action, Resource, Status, Actions
- **Row Actions**: View details button
- **Pagination**: Navigate through pages
- **Empty State**: Helpful message when no logs found

### Detail Modal
- Full log information display
- JSON viewer for additional details
- Copy-friendly formatting
- IP and user agent information

## Security

### Access Control
- **View Logs**: Only `sportshub_super_admin` role
- **Write Logs**: Only Cloud Functions (Admin SDK bypasses rules)
- **Export**: Only available to authenticated admins

### Data Protection
- IP addresses hashed in production (optional)
- Sensitive details excluded from logs
- User tokens never logged
- PII minimization

### Compliance
- GDPR-compliant audit trail
- 90-day data retention (configurable)
- Right to access (admin query by user)
- Right to erasure (admin function)

## Performance Considerations

### Optimization Strategies
1. **Date Range Filtering**: Always filter by date to limit query size
2. **Indexes**: Create composite indexes for common query patterns
3. **Pagination**: Load 50 logs at a time
4. **Client-side Filtering**: Apply filters client-side after initial load
5. **Caching**: Consider caching recent logs for faster access

### Firestore Costs
- **Read Operations**: ~50-100 reads per page load
- **Write Operations**: 1 write per logged action
- **Estimated Monthly Cost**: $5-20 for typical admin usage
- **Optimization**: Use date range filters to reduce reads

## Testing

### Test Checklist

#### Functionality
- [ ] Logs load correctly from Firestore
- [ ] Search filters logs by email, action, resource
- [ ] Action filter works for all action types
- [ ] Status filter shows correct logs
- [ ] Date range filter queries correct time period
- [ ] User ID filter works correctly
- [ ] Pagination navigates correctly
- [ ] Export generates valid CSV file
- [ ] Detail modal shows complete information
- [ ] Stats calculate correctly

#### Security
- [ ] Non-admin users cannot access /admin/audit-logs
- [ ] Firestore rules prevent direct writes
- [ ] IP addresses are captured correctly
- [ ] Error messages don't expose sensitive data

#### Performance
- [ ] Initial load completes in < 2 seconds
- [ ] Filtering is responsive (< 500ms)
- [ ] Pagination is instant
- [ ] Export handles 1000+ logs

#### Edge Cases
- [ ] Empty state displays correctly
- [ ] Error states show helpful messages
- [ ] Loading states prevent duplicate requests
- [ ] Timestamp formatting handles all timezones

## Monitoring

### Key Metrics
1. **Log Volume**: Number of logs created per day
2. **Error Rate**: Percentage of failed actions
3. **Query Performance**: Average load time for log queries
4. **Storage Usage**: Size of audit logs collection

### Alerts
- High failure rate (> 10% in 1 hour)
- Unusual activity patterns
- Storage approaching limits
- Query performance degradation

## Future Enhancements

### Planned Features
1. **Real-time Updates**: Live log streaming with WebSockets
2. **Advanced Analytics**: Charts showing trends over time
3. **Anomaly Detection**: ML-based alerts for suspicious activity
4. **Log Archival**: Automated archival to Cloud Storage after 90 days
5. **Custom Alerts**: User-configurable alert rules
6. **Correlation**: Link related logs (e.g., failed login attempts)
7. **Export Formats**: PDF reports, JSON export
8. **Bulk Operations**: Bulk export, bulk deletion

### Integration Opportunities
- **Sentry**: Link error logs to Sentry events
- **BigQuery**: Export to BigQuery for advanced analytics
- **Slack**: Real-time notifications for critical events
- **Email**: Daily/weekly digest reports

## Troubleshooting

### Common Issues

#### Logs Not Loading
**Problem**: No logs appear in the table
**Solutions**:
1. Check Firestore rules for `sportshub_admin_logs`
2. Verify user has `sportshub_super_admin` role
3. Check browser console for errors
4. Confirm date range includes existing logs

#### Export Not Working
**Problem**: CSV download fails or is empty
**Solutions**:
1. Ensure logs are loaded (not in loading state)
2. Check browser's download settings
3. Verify user has permission to download files
4. Try smaller date range if large dataset

#### Slow Performance
**Problem**: Logs take long time to load
**Solutions**:
1. Reduce date range
2. Create Firestore composite indexes
3. Implement server-side pagination
4. Consider caching strategy

## Resources

- **Component**: [src/components/admin/AuditLogsViewer.tsx](../src/components/admin/AuditLogsViewer.tsx)
- **Page**: [src/app/(dashboard)/admin/audit-logs/page.tsx](../src/app/(dashboard)/admin/audit-logs/page.tsx)
- **Utility**: [src/lib/audit-logger.ts](../src/lib/audit-logger.ts)
- **Firestore Rules**: [firestore.rules](../firestore.rules)
- **Related**: [USER_MANAGEMENT.md](./USER_MANAGEMENT.md)
