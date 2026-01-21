# Admin Portal Navigation

## Overview

The Admin Portal provides comprehensive tools for managing the SportsHub platform. This document outlines the available admin pages and how to navigate between them.

## Admin Routes

### Dashboard
**URL**: `/admin/dashboard`  
**Access**: `sportshub_super_admin` only

Main admin overview showing:
- Key performance indicators (KPIs)
- User growth charts
- Tournament statistics
- Revenue metrics
- Recent activity feed

[View Documentation](./ADMIN_DASHBOARD.md)

---

### User Management
**URL**: `/admin/users`  
**Access**: `sportshub_super_admin` only

Comprehensive user management interface:
- Search and filter users
- View user details and activity
- Bulk operations (suspend, activate, delete)
- Export user data to CSV
- Edit user roles and permissions

[View Documentation](./USER_MANAGEMENT.md)

---

### Audit Logs
**URL**: `/admin/audit-logs`  
**Access**: `sportshub_super_admin` only

Complete audit trail of all admin actions:
- Filter by action type, status, date range
- Search by user or resource
- View detailed log entries
- Export logs to CSV
- Track security events

[View Documentation](./AUDIT_LOGS.md)

---

### System Health Monitor
**URL**: `/admin/system-health`  
**Access**: `sportshub_super_admin` only

Real-time system monitoring:
- 6 key metrics (Firestore, errors, users, response time, DB size, uptime)
- Performance charts (24-hour history)
- Automatic alert generation
- Auto-refresh every 30 seconds
- Overall system status banner

[View Documentation](./SYSTEM_HEALTH.md)

---

## Navigation Structure

```
Admin Portal
├── Dashboard (/admin/dashboard)
│   └── Overview & Analytics
├── User Management (/admin/users)
│   ├── User List
│   ├── User Details
│   └── Bulk Operations
├── Audit Logs (/admin/audit-logs)
│   ├── Log Viewer
│   └── Export Tools
└── System Health (/admin/system-health)
    ├── Metrics Dashboard
    └── Alerts
```

## Access Control

### Role Requirements

All admin routes require the `sportshub_super_admin` role:

```typescript
// Custom claim set via Firebase Admin SDK
const customClaims = {
  sportshub_super_admin: true
};

await admin.auth().setCustomUserClaims(userId, customClaims);
```

### Route Protection

Each admin page includes authentication guards:

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const { cupfinalUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!cupfinalUser || cupfinalUser.globalRole !== 'sportshub_super_admin') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You do not have permission to access this page.
        </AlertDescription>
      </Alert>
    );
  }

  return <AdminComponent />;
}
```

## Admin Header Integration

### Navigation Menu

The admin portal can be accessed via the main header's admin menu:

```typescript
// In Header.tsx
{user.globalRole === 'sportshub_super_admin' && (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button variant="ghost">
        Admin <ChevronDown />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem asChild>
        <Link href="/admin/dashboard">Dashboard</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/admin/users">User Management</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/admin/audit-logs">Audit Logs</Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/admin/system-health">System Health</Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)}
```

## Quick Actions

### From Dashboard
- **View Users**: Navigate to User Management
- **View Logs**: Navigate to Audit Logs
- **Check Health**: Navigate to System Health

### From User Management
- **View User Activity**: Opens audit logs filtered by user
- **Export Users**: Download CSV of all users
- **Bulk Actions**: Suspend, activate, or delete multiple users

### From Audit Logs
- **Filter by User**: View all actions by specific user
- **Export Logs**: Download CSV of filtered logs
- **View Details**: Open detailed log modal

## Breadcrumb Navigation

Each admin page includes breadcrumbs for easy navigation:

```typescript
<Breadcrumb>
  <BreadcrumbItem>
    <Link href="/admin/dashboard">Admin</Link>
  </BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem>
    <BreadcrumbPage>User Management</BreadcrumbPage>
  </BreadcrumbItem>
</Breadcrumb>
```

## Keyboard Shortcuts

### Global Shortcuts
- `Cmd/Ctrl + K`: Open search (from anywhere)
- `Esc`: Close modals/dialogs

### Admin-Specific
- `Cmd/Ctrl + /`: Toggle admin menu (when on admin pages)
- `Cmd/Ctrl + E`: Export current view
- `Cmd/Ctrl + F`: Focus search input

## Mobile Navigation

On mobile devices, admin navigation is accessible via:
1. Hamburger menu (top left)
2. Admin section in mobile drawer
3. Bottom navigation (when on admin pages)

## URL Parameters

### User Management
```
/admin/users?search=john@example.com
/admin/users?status=suspended
/admin/users?role=admin
```

### Audit Logs
```
/admin/audit-logs?action=user.suspend
/admin/audit-logs?status=failure
/admin/audit-logs?user=USER_ID
/admin/audit-logs?range=7
```

## Best Practices

### Navigation Flow
1. Start at Dashboard for overview
2. Drill into specific areas (Users, Logs)
3. Use breadcrumbs to navigate back
4. Use search to jump directly to resources

### Security
1. Always verify role before showing admin links
2. Use route guards on all admin pages
3. Log admin navigation in audit logs
4. Implement session timeouts

### Performance
1. Lazy load admin components
2. Implement route-level code splitting
3. Cache navigation state
4. Prefetch common destinations

## Related Documentation

- [Admin Dashboard](./ADMIN_DASHBOARD.md)
- [User Management](./USER_MANAGEMENT.md)
- [Audit Logs](./AUDIT_LOGS.md)
- [Architecture](./ARCHITECTURE.md)
- [Security](./SECURITY.md)
