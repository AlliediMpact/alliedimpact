# System Health Monitor

## Overview

The System Health Monitor provides real-time visibility into the SportsHub platform's performance, availability, and operational health. It aggregates metrics from multiple sources including Firestore, Sentry, and application logs to present a comprehensive view of system status.

## Features

### 1. **Real-Time Metrics Dashboard**
- **6 Key Metrics**: Firestore status, error rate, active users, response time, database size, uptime
- **Auto-Refresh**: Automatic updates every 30 seconds (toggleable)
- **Status Indicators**: Visual health indicators (healthy/warning/critical)
- **Trend Analysis**: Up/down/stable trends with percentage changes
- **Last Update Timestamp**: Shows when metrics were last refreshed

### 2. **Overall System Status**
- **Status Banner**: Prominent display of overall system health
- **Three States**: 
  - 🟢 **Healthy**: All systems operational
  - 🟡 **Warning**: Some services require attention
  - 🔴 **Critical**: Immediate action required
- **Automatic Assessment**: Aggregates individual metric states

### 3. **Performance Charts**
- **Response Time Chart**: 24-hour area chart showing average response times
- **Active Users Chart**: Line chart tracking concurrent user activity
- **Interactive Tooltips**: Hover to see specific data points
- **Responsive Design**: Charts adapt to screen size

### 4. **Active Alerts System**
- **Automatic Alert Generation**: Alerts created based on metric thresholds
- **Severity Levels**: Info, warning, error, critical
- **Timestamp Tracking**: When each alert was generated
- **Resolution Status**: Track which alerts have been addressed

### 5. **System Information**
- Environment details (production/development)
- Platform information (Next.js 14 + Firebase)
- Region configuration
- Monitoring tools in use

## Components

### SystemHealthMonitor Component
**Location**: `src/components/admin/SystemHealthMonitor.tsx`

Main component for displaying system health metrics and alerts.

**Key Features**:
- Auto-refresh with configurable interval (default: 30 seconds)
- Parallel data fetching for optimal performance
- Real-time status calculation
- Alert generation based on thresholds
- Responsive chart visualization

**Dependencies**:
- Firestore for data queries
- recharts for visualization
- date-fns for date formatting
- shadcn/ui for UI components

## Metrics Explained

### 1. Firestore Status
**What it measures**: Firestore database health and operation count

**Data source**: Query `sportshub_admin_logs` collection for operations in last hour

**Status thresholds**:
- 🟢 Healthy: Firestore queries executing successfully
- 🔴 Critical: Unable to query Firestore

**Includes**:
- Operation count in last hour
- Estimated database size
- Connection status

### 2. Error Rate
**What it measures**: Percentage of failed operations

**Data source**: Failed logs from `sportshub_admin_logs` in last 24 hours

**Status thresholds**:
- 🟢 Healthy: < 2% error rate
- 🟡 Warning: 2-5% error rate
- 🔴 Critical: > 5% error rate

**Includes**:
- Total error count (24h)
- Trend direction (+/- percentage)
- Error rate percentage

### 3. Active Users
**What it measures**: Total user count and new user growth

**Data source**: `sportshub_users` collection

**Status thresholds**:
- 🟢 Healthy: Always (informational metric)

**Includes**:
- Total user count
- New users today
- Growth trend

### 4. Response Time
**What it measures**: Average API response time

**Data source**: Calculated from performance metrics

**Status thresholds**:
- 🟢 Healthy: < 2000ms
- 🟡 Warning: > 2000ms

**Includes**:
- Average response time (ms)
- Trend direction
- 24-hour history chart

### 5. Database Size
**What it measures**: Estimated Firestore storage usage

**Data source**: Estimated based on document counts

**Status thresholds**:
- 🟢 Healthy: < 1000MB
- 🟡 Warning: > 1000MB

**Includes**:
- Size in megabytes
- Growth trend

### 6. Uptime
**What it measures**: System availability percentage

**Data source**: Historical uptime tracking

**Status thresholds**:
- 🟢 Healthy: > 99%
- 🟡 Warning: 95-99%
- 🔴 Critical: < 95%

**Includes**:
- 30-day uptime percentage
- Status indicator

## Alert System

### Alert Generation

Alerts are automatically generated when metrics exceed thresholds:

```typescript
if (metric.status === 'critical') {
  // Generate critical alert
  alerts.push({
    id: `${metric.name}-${Date.now()}`,
    severity: 'critical',
    message: `Critical: ${metric.name} is in critical state`,
    timestamp: new Date(),
    resolved: false
  });
}
```

### Alert Severity Levels

| Severity | Color | Icon | Trigger |
|----------|-------|------|---------|
| Info | Blue | ℹ️ | Informational message |
| Warning | Yellow | ⚠️ | Metric in warning state |
| Error | Orange | ⚠️ | Error detected |
| Critical | Red | 🔴 | Metric in critical state |

### Alert Resolution

Alerts are automatically resolved when:
1. Metric returns to healthy state
2. Underlying issue is fixed
3. Manual resolution by admin (future feature)

## Performance Charts

### Response Time Chart
**Type**: Area Chart  
**Data Points**: 24 hours (hourly intervals)  
**Y-Axis**: Response time in milliseconds  
**X-Axis**: Time (HH:mm format)

**Interpretation**:
- **< 500ms**: Excellent performance
- **500-1000ms**: Good performance
- **1000-2000ms**: Acceptable performance
- **> 2000ms**: Poor performance (warning state)

### Active Users Chart
**Type**: Line Chart  
**Data Points**: 24 hours (hourly intervals)  
**Y-Axis**: Number of concurrent users  
**X-Axis**: Time (HH:mm format)

**Interpretation**:
- Shows user activity patterns
- Identifies peak usage times
- Helps with capacity planning
- Useful for scaling decisions

## Data Collection

### Firestore Queries

```typescript
// Check Firestore health
const oneHourAgo = Timestamp.fromDate(subHours(new Date(), 1));
const logsRef = collection(db, 'sportshub_admin_logs');
const q = query(
  logsRef,
  where('timestamp', '>=', oneHourAgo),
  orderBy('timestamp', 'desc')
);

// Get error statistics
const oneDayAgo = Timestamp.fromDate(subDays(new Date(), 1));
const errorQuery = query(
  logsRef,
  where('timestamp', '>=', oneDayAgo),
  where('status', '==', 'failure'),
  orderBy('timestamp', 'desc')
);

// Get user statistics
const usersRef = collection(db, 'sportshub_users');
const usersSnapshot = await getDocs(usersRef);
```

### Performance Metrics

Performance data is currently generated as mock data for demonstration. In production, integrate with:

1. **Sentry**: Real error rates and response times
2. **Firebase Performance Monitoring**: Real-world performance metrics
3. **Custom Analytics**: Application-specific metrics

## Auto-Refresh

### Configuration

Auto-refresh is enabled by default with a 30-second interval:

```typescript
const [autoRefresh, setAutoRefresh] = useState(true);

useEffect(() => {
  if (autoRefresh) {
    const interval = setInterval(() => {
      fetchSystemHealth();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }
}, [autoRefresh]);
```

### Toggle Auto-Refresh

Users can toggle auto-refresh via checkbox in the header:
- **Enabled**: Metrics refresh every 30 seconds
- **Disabled**: Manual refresh only (click "Refresh" button)

### Manual Refresh

Click the "Refresh" button to manually update all metrics:
- Fetches latest data from all sources
- Updates charts and alerts
- Shows loading spinner during fetch

## Thresholds & Tuning

### Customizing Thresholds

Edit threshold values in the component:

```typescript
// Error Rate Thresholds
status: errorStats.errorRate > 5 ? 'critical' : 
        errorStats.errorRate > 2 ? 'warning' : 
        'healthy'

// Response Time Thresholds
status: performanceStats.avgResponseTime > 2000 ? 'warning' : 'healthy'

// Database Size Thresholds
status: firestoreHealth.estimatedSize > 1000 ? 'warning' : 'healthy'
```

### Recommended Thresholds

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Error Rate | < 2% | 2-5% | > 5% |
| Response Time | < 1000ms | 1000-2000ms | > 2000ms |
| Database Size | < 500MB | 500-1000MB | > 1000MB |
| Uptime | > 99.5% | 95-99.5% | < 95% |

## Integration with Monitoring Tools

### Sentry Integration

Fetch real error rates from Sentry:

```typescript
// Install Sentry SDK client
npm install @sentry/react

// Query Sentry API
const sentryStats = await fetch(
  `https://sentry.io/api/0/projects/${org}/${project}/stats/`,
  {
    headers: {
      'Authorization': `Bearer ${SENTRY_API_TOKEN}`
    }
  }
);
```

### Firebase Performance Monitoring

Track real response times:

```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance();
const trace = perf.trace('api_call');
trace.start();
// Make API call
trace.stop();
```

### Custom Metrics

Log custom metrics to Firestore:

```typescript
// Log performance metric
await addDoc(collection(db, 'performance_metrics'), {
  timestamp: serverTimestamp(),
  responseTime: duration,
  endpoint: '/api/tournaments',
  statusCode: 200
});
```

## Security

### Access Control

System Health page requires `sportshub_super_admin` role:

```typescript
// Page-level protection
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function SystemHealthPage() {
  const { cupfinalUser, loading } = useAuth();

  if (!cupfinalUser || cupfinalUser.globalRole !== 'sportshub_super_admin') {
    return <UnauthorizedAlert />;
  }

  return <SystemHealthMonitor />;
}
```

### Data Privacy

- No sensitive user data displayed in metrics
- IP addresses not shown (only counted)
- Error messages sanitized
- Aggregate statistics only

## Performance Considerations

### Query Optimization

1. **Time-based Filtering**: Always filter by date range to limit data
2. **Indexes**: Create composite indexes for common queries
3. **Parallel Fetching**: Use `Promise.all()` for concurrent requests
4. **Client-side Caching**: Cache metrics for 30 seconds

### Firestore Costs

**Estimated Monthly Costs** (based on 1000 admin page views/month):
- Reads: ~6,000 reads = $0.22
- Writes: 0 (read-only)
- **Total**: ~$0.22/month

### Load Time

- Initial load: ~1-2 seconds
- Refresh: ~500-1000ms
- Chart rendering: ~200ms

## Troubleshooting

### Metrics Not Loading

**Problem**: Metrics show as 0 or don't load

**Solutions**:
1. Check Firestore rules for `sportshub_admin_logs` read access
2. Verify user has `sportshub_super_admin` role
3. Check browser console for errors
4. Confirm collections have data

### Charts Not Displaying

**Problem**: Performance charts are blank

**Solutions**:
1. Ensure recharts package is installed
2. Check that performance data is being generated
3. Verify ResponsiveContainer has valid dimensions
4. Check browser console for rendering errors

### High Error Rate

**Problem**: Error rate shows as critical (> 5%)

**Solutions**:
1. Check audit logs for specific errors
2. Review Sentry for error details
3. Verify API endpoints are responding
4. Check Firestore connectivity

### Slow Response Times

**Problem**: Response time > 2000ms

**Solutions**:
1. Check Firestore query complexity
2. Ensure indexes are created
3. Review server-side code for bottlenecks
4. Consider implementing caching

## Best Practices

### Monitoring Routine

1. **Daily**: Check overall status and active alerts
2. **Weekly**: Review performance charts for trends
3. **Monthly**: Analyze error rates and identify patterns
4. **Quarterly**: Review thresholds and adjust as needed

### Alert Response

1. **Critical Alerts**: Respond within 15 minutes
2. **Warning Alerts**: Review within 1 hour
3. **Info Alerts**: Review during normal operations

### Performance Tuning

1. Monitor response times during peak hours
2. Scale resources when approaching thresholds
3. Optimize slow queries identified in metrics
4. Review and update thresholds quarterly

## Future Enhancements

### Planned Features

1. **Historical Data**: Store and display historical metrics
2. **Custom Dashboards**: User-configurable metric displays
3. **Advanced Alerts**: Email/Slack notifications for critical events
4. **Anomaly Detection**: ML-based detection of unusual patterns
5. **Capacity Planning**: Predictive analytics for resource needs
6. **SLA Tracking**: Service level agreement monitoring
7. **Cost Tracking**: Firestore and hosting cost breakdowns
8. **User Activity**: Real-time active user monitoring

### Integration Opportunities

- **BigQuery**: Export metrics for advanced analysis
- **Grafana**: External dashboard integration
- **PagerDuty**: Incident management integration
- **Slack**: Real-time alert notifications
- **DataDog**: Comprehensive APM integration

## API Reference

### fetchSystemHealth()

Fetches all system health metrics.

**Returns**: `Promise<void>`

**Side Effects**:
- Updates `metrics` state
- Updates `alerts` state
- Updates `performanceData` state
- Updates `overallStatus` state

### checkFirestoreHealth()

Checks Firestore database health.

**Returns**: `Promise<FirestoreHealth>`

```typescript
interface FirestoreHealth {
  status: string;
  healthy: boolean;
  operationsCount: number;
  estimatedSize: number;
}
```

### getErrorStatistics()

Calculates error rate from audit logs.

**Returns**: `Promise<ErrorStats>`

```typescript
interface ErrorStats {
  totalErrors: number;
  errorRate: string;
  trend: 'up' | 'down';
  trendValue: string;
}
```

### getUserStatistics()

Retrieves user count and growth metrics.

**Returns**: `Promise<UserStats>`

```typescript
interface UserStats {
  activeUsers: number;
  newUsersToday: number;
  trend: 'up' | 'down';
  trendValue: string;
}
```

### generateAlerts()

Generates alerts based on metric states.

**Parameters**: `metrics: HealthMetric[]`

**Returns**: `SystemAlert[]`

```typescript
interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}
```

## Testing Checklist

### Functionality
- [ ] Metrics load correctly on page load
- [ ] Auto-refresh updates metrics every 30 seconds
- [ ] Manual refresh button updates metrics
- [ ] Overall status calculates correctly
- [ ] Charts display performance data
- [ ] Alerts generate for warning/critical states
- [ ] Toggle auto-refresh works correctly
- [ ] Last update timestamp updates

### Visual
- [ ] Status colors match metric states
- [ ] Charts are responsive on all screen sizes
- [ ] Icons display correctly
- [ ] Loading spinner shows during data fetch
- [ ] Alert severity badges display correctly

### Security
- [ ] Non-admin users cannot access page
- [ ] Firestore queries respect security rules
- [ ] No sensitive data exposed in metrics

### Performance
- [ ] Initial load completes in < 2 seconds
- [ ] Refresh completes in < 1 second
- [ ] Charts render smoothly
- [ ] No memory leaks during auto-refresh

## Resources

- **Component**: [src/components/admin/SystemHealthMonitor.tsx](../src/components/admin/SystemHealthMonitor.tsx)
- **Page**: [src/app/(dashboard)/admin/system-health/page.tsx](../src/app/(dashboard)/admin/system-health/page.tsx)
- **Related**: [AUDIT_LOGS.md](./AUDIT_LOGS.md), [USER_MANAGEMENT.md](./USER_MANAGEMENT.md)
- **Charts Library**: [recharts](https://recharts.org/)
- **Monitoring**: [Sentry](https://sentry.io/), [Firebase Performance](https://firebase.google.com/docs/perf-mon)
