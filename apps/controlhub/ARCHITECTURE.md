# ControlHub - Technical Architecture

**Version**: 0.1.0  
**Last Updated**: January 23, 2026

---

## 🎯 Overview

ControlHub is the **platform-wide observability and governance dashboard** for Allied iMpact. It provides centralized visibility across all apps without controlling or interfering with their operations.

**Key Principle**: Apps work perfectly fine if ControlHub is offline. ControlHub observes, it does not control.

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Allied iMpact Apps                        │
│  (CoinBox, SportsHub, DriveMaster, EduTech, Portal, etc.)  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP POST (Events)
                     │ Bearer Token Auth
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  ControlHub API Endpoints                    │
│  /api/v1/events/health   /api/v1/events/auth               │
│  /api/v1/events/audit    /api/v1/alerts                    │
│  /api/v1/support/metrics                                    │
└────────────────────┬────────────────────────────────────────┘
                     │ Validated Events
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 ControlHub Firestore DB                      │
│  controlhub_app_health       controlhub_auth_events         │
│  controlhub_audit_logs       controlhub_alerts              │
│  controlhub_support_metrics                                 │
└────────────────────┬────────────────────────────────────────┘
                     │ Real-time Queries
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  ControlHub Dashboard UI                     │
│  Next.js 14 App Router + React + Tailwind CSS              │
│  Real-time updates via Firestore listeners                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 Data Flow

### Event Emission Pattern

1. **App Emits Event**
   - App packages event data (health, auth, audit, alert, support)
   - Includes app ID and timestamp
   - Signs with API token

2. **API Receives Event**
   - Validates API token (Bearer auth)
   - Validates app ID
   - Validates event schema
   - Returns 200 OK immediately (async processing)

3. **Event Stored in Firestore**
   - Writes to appropriate collection
   - Adds server timestamp
   - Applies retention policy

4. **Dashboard Displays Data**
   - Real-time Firestore listeners
   - Updates UI automatically
   - No polling required

---

## 🔐 Security Architecture

### API Authentication

Each app has a unique API token stored in environment variables:

```typescript
// Apps send events with Bearer token
Authorization: Bearer <COINBOX_API_TOKEN>

// ControlHub validates token against appId
if (token !== process.env.COINBOX_API_TOKEN) {
  return 401 Unauthorized;
}
```

### Firestore Security Rules

```javascript
// Custom Claims-based access control
function isSuperAdmin() {
  return 'controlhub_super_admin' in request.auth.token;
}

// Audit logs are IMMUTABLE
match /controlhub_audit_logs/{logId} {
  allow read: if hasAnyRole();
  allow update, delete: if false; // NEVER allow modifications
}
```

### Role-Based Access Control

| Role | Health | Auth Events | Audit Logs | Alerts | Support |
|------|--------|-------------|------------|--------|---------|
| **Super Admin** | ✅ R/W | ✅ Read | ✅ Read | ✅ R/W | ✅ Read |
| **Security Team** | ❌ | ✅ Read | ✅ Read | ✅ R/W | ❌ |
| **Support Team** | ❌ | ❌ | ✅ Read | ❌ | ✅ Read |
| **Auditor** | ❌ | ❌ | ✅ Read | ❌ | ❌ |

---

## 💾 Data Model

### Firestore Collections

#### 1. `controlhub_app_health/{appId}`

**Purpose**: Current health status of each app (overwritten every 60s)

```typescript
{
  appId: 'coinbox',
  status: 'healthy' | 'degraded' | 'offline',
  environment: 'production',
  timestamp: '2026-01-23T10:30:00Z',
  metrics: {
    errorRate: 0.02,        // 2%
    responseTime: 145,      // milliseconds
    activeUsers: 1234,
    requestsPerMinute: 560
  },
  version: '2.5.0',
  lastUpdated: Timestamp,
  receivedAt: '2026-01-23T10:30:15Z'
}
```

**Retention**: Latest status only (overwritten)

---

#### 2. `controlhub_auth_events/{eventId}`

**Purpose**: Authentication activity across all apps

```typescript
{
  appId: 'sportshub',
  event: 'login_success' | 'login_failure' | 'logout' | 'mfa_required',
  userId: 'user_123',
  timestamp: '2026-01-23T10:35:00Z',
  metadata: {
    ip: '197.45.123.45',
    userAgent: 'Mozilla/5.0...',
    location: 'Johannesburg, South Africa',
    deviceType: 'mobile',
    anomalyDetected: false
  },
  receivedAt: Timestamp
}
```

**Retention**: 90 days (automatic cleanup via Cloud Function)

---

#### 3. `controlhub_audit_logs/{logId}`

**Purpose**: Immutable audit trail of admin actions

```typescript
{
  appId: 'coinbox',
  action: 'user_verification_approved',
  actor: 'admin@alliedimpact.com',
  actorRole: 'super_admin',
  target: 'user_456',
  targetType: 'user',
  timestamp: '2026-01-23T11:00:00Z',
  metadata: {
    previousStatus: 'pending',
    newStatus: 'verified',
    reason: 'Documents approved'
  },
  ipAddress: '41.203.123.45',
  receivedAt: Timestamp,
  immutable: true
}
```

**Retention**: 7 years (2555 days) - **NEVER DELETE**  
**Security**: NO updates or deletes allowed (enforced by Firestore rules)

---

#### 4. `controlhub_alerts/{alertId}`

**Purpose**: Security, system, and compliance alerts

```typescript
{
  appId: 'drivemaster',
  severity: 'critical' | 'high' | 'medium' | 'low',
  title: 'High Response Time Detected',
  description: 'Average response time exceeded 400ms for 5 minutes',
  category: 'performance',
  timestamp: '2026-01-23T12:00:00Z',
  metadata: {
    threshold: 400,
    actual: 520,
    duration: 300
  },
  acknowledged: false,
  acknowledgedBy: null,
  acknowledgedAt: null,
  resolved: false,
  resolvedBy: null,
  resolvedAt: null,
  notes: [],
  receivedAt: Timestamp
}
```

**Retention**: 365 days

---

#### 5. `controlhub_support_metrics/{appId}`

**Purpose**: High-level support ticket summaries

```typescript
{
  appId: 'edutech',
  timestamp: '2026-01-23T13:00:00Z',
  metrics: {
    openTickets: 12,
    closedTickets: 45,
    averageResponseTime: 2.5, // hours
    slaCompliance: 0.95,      // 95%
    ticketsByCategory: {
      'technical': 5,
      'billing': 3,
      'general': 4
    },
    ticketsBySeverity: {
      'critical': 1,
      'high': 3,
      'medium': 5,
      'low': 3
    }
  },
  lastUpdated: Timestamp,
  receivedAt: '2026-01-23T13:00:15Z'
}
```

**Retention**: 90 days

---

## 🔌 API Endpoints

### Health Ping
```
POST /api/v1/events/health
Authorization: Bearer <APP_API_TOKEN>
Content-Type: application/json

{
  "appId": "coinbox",
  "data": {
    "appId": "coinbox",
    "status": "healthy",
    "environment": "production",
    "timestamp": "2026-01-23T10:30:00Z",
    "metrics": {
      "errorRate": 0.02,
      "responseTime": 145,
      "activeUsers": 1234,
      "requestsPerMinute": 560
    },
    "version": "2.5.0"
  },
  "timestamp": "2026-01-23T10:30:00Z"
}
```

---

### Auth Event
```
POST /api/v1/events/auth
Authorization: Bearer <APP_API_TOKEN>

{
  "appId": "sportshub",
  "data": {
    "appId": "sportshub",
    "event": "login_success",
    "userId": "user_123",
    "timestamp": "2026-01-23T10:35:00Z",
    "metadata": {
      "ip": "197.45.123.45",
      "location": "Johannesburg, South Africa"
    }
  },
  "timestamp": "2026-01-23T10:35:00Z"
}
```

---

### Audit Log
```
POST /api/v1/events/audit
Authorization: Bearer <APP_API_TOKEN>

{
  "appId": "coinbox",
  "data": {
    "appId": "coinbox",
    "action": "user_verification_approved",
    "actor": "admin@alliedimpact.com",
    "target": "user_456",
    "timestamp": "2026-01-23T11:00:00Z"
  },
  "timestamp": "2026-01-23T11:00:00Z"
}
```

---

## 🚀 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Runtime**: Next.js API Routes (Edge Functions)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Custom Claims)
- **Validation**: Zod

### Infrastructure
- **Hosting**: Vercel (Frontend + API)
- **Database**: Google Cloud Firestore
- **Monitoring**: Firebase Logging

---

## 📊 Performance Considerations

### API Rate Limiting
- **60 requests per minute per app**
- Implemented at API edge
- Returns 429 if exceeded

### Firestore Query Optimization
- **Health Status**: Single document read per app (no pagination)
- **Auth Events**: Indexed by timestamp + appId (DESC)
- **Audit Logs**: Composite index (appId, timestamp DESC)
- **Alerts**: Filtered by acknowledged/resolved status

### Real-time Updates
- Dashboard uses Firestore `onSnapshot` listeners
- Automatic reconnection on network issues
- Optimistic UI updates for alert acknowledgments

---

## 🔄 Data Retention Policy

| Collection | Retention | Cleanup Method |
|------------|-----------|----------------|
| **App Health** | Latest only | Overwrite on each ping |
| **Auth Events** | 90 days | Scheduled Cloud Function |
| **Audit Logs** | 7 years | **NEVER** (compliance) |
| **Alerts** | 365 days | Scheduled Cloud Function |
| **Support Metrics** | 90 days | Scheduled Cloud Function |

---

## 🛡️ Disaster Recovery

### Backup Strategy
- **Firestore**: Automatic daily backups (Firebase)
- **Audit Logs**: Exported to Google Cloud Storage (monthly)
- **Configuration**: Version controlled in Git

### Failure Scenarios

**Scenario 1: ControlHub API Down**
- Apps continue working normally (no dependency)
- Events queue or drop (apps don't retry)
- Dashboard shows "Last Updated X minutes ago"

**Scenario 2: Firestore Unavailable**
- API returns 500 errors
- Apps continue working (don't depend on ControlHub)
- Dashboard shows error banner

**Scenario 3: Dashboard Offline**
- API continues receiving events
- Data stored in Firestore
- Dashboard auto-reconnects when back online

---

## 📝 Future Enhancements

### Phase 2: Enhanced Governance
- [ ] Cross-app user journey tracking
- [ ] Compliance report generation
- [ ] Platform-wide search
- [ ] Advanced analytics dashboards

### Phase 3: Operations
- [ ] SLA monitoring with alerting
- [ ] Incident management workflow
- [ ] Automated runbooks
- [ ] Integration with external monitoring (Datadog, etc.)

---

**Last Updated**: January 23, 2026  
**Maintained By**: Platform Team
