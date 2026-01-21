# User Management System - Documentation

## Overview
The User Management system provides comprehensive administrative tools for managing users, roles, and permissions within SportsHub. This feature allows super administrators to search, filter, view, and perform bulk operations on user accounts.

## Components Created

### 1. UserManagement.tsx
**Location:** `src/components/admin/UserManagement.tsx`  
**Size:** 674 lines  
**Purpose:** Main user management interface with search, filtering, and bulk operations

#### Key Features:
- **Search & Filtering**
  - Real-time search by email or display name
  - Filter by role (user, admin, moderator)
  - Filter by status (active, suspended, banned)
  
- **Pagination**
  - 20 users per page
  - Next/Previous navigation
  - Firestore cursor-based pagination with `startAfter`
  
- **Bulk Operations**
  - Multi-select with checkboxes
  - Bulk suspend/activate users
  - Bulk delete users (with confirmation)
  - "Select All" functionality
  
- **Individual User Actions**
  - View detailed user information
  - Suspend/activate account
  - Delete user account
  - Adjust wallet balance
  - Change user role
  
- **User Details Modal**
  - Full user profile information
  - Email verification status
  - MFA enrollment status
  - Account creation date
  - Last login timestamp
  - Wallet balance
  - Current role and status
  
- **Export Functionality**
  - Export filtered users to CSV
  - Includes all user fields
  - Downloads automatically to browser

### 2. Users Management Page
**Location:** `src/app/(dashboard)/admin/users/page.tsx`  
**Size:** 75 lines  
**Purpose:** Route wrapper with authentication and authorization

#### Features:
- Role-based access control (super_admin only)
- Loading state with spinner
- Unauthorized access alert
- Page metadata for SEO
- Clean layout with header and description

## Data Model

### User Interface
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'banned';
  createdAt: Date;
  lastLoginAt?: Date;
  emailVerified: boolean;
  mfaEnabled: boolean;
  walletBalance: number;
}
```

## Firestore Integration

### Collections Used
- **users**: Main user collection with profiles and settings
- **sportshub_admin_logs**: Audit trail for admin actions

### Operations
1. **Read Operations**
   - `getDocs()`: Fetch paginated user list
   - `orderBy('createdAt', 'desc')`: Sort by newest first
   - `limit(20)`: 20 users per page
   - `startAfter()`: Cursor-based pagination

2. **Write Operations**
   - `updateDoc()`: Update user fields (role, status, wallet)
   - `deleteDoc()`: Remove user account

3. **Audit Logging**
   - All admin actions logged to `sportshub_admin_logs`
   - Includes admin ID, action type, target user, timestamp

## UI Components Used

### shadcn/ui Components
- **Card**: Main container for user management interface
- **Input**: Search field with icon
- **Button**: Action buttons (primary, destructive, outline variants)
- **Badge**: Status indicators (active, suspended, banned)
- **Select**: Dropdown filters for role and status
- **Dialog**: Confirmation modals and user details modal
- **DropdownMenu**: Per-user action menu
- **Checkbox**: Multi-select functionality
- **Alert**: Error and success messages

### Icons (lucide-react)
- **Search**: Search input icon
- **MoreVertical**: Action menu trigger
- **UserCheck/UserX**: Suspend/activate icons
- **Shield**: Role assignment icon
- **Trash2**: Delete icon
- **RefreshCw**: Refresh button
- **ChevronLeft/ChevronRight**: Pagination icons
- **Filter**: Filter indicator
- **Download**: Export CSV icon
- **AlertCircle**: Unauthorized access alert

## Security Features

### Role-Based Access Control
- Only users with `globalRole === 'sportshub_super_admin'` can access
- Automatic redirect to login if not authenticated
- Access denied alert for non-admin users

### Confirmation Dialogs
- All destructive actions require confirmation
- Bulk operations show count of affected users
- Clear action descriptions in modal

### Audit Trail
- All admin actions logged to Firestore
- Includes: admin user ID, action type, target user, timestamp
- Used for compliance and accountability

## User Experience

### Search & Filter Flow
1. Type in search box (debounced real-time search)
2. Select role filter (all, user, admin, moderator)
3. Select status filter (all, active, suspended, banned)
4. Results update automatically
5. Export filtered results to CSV

### Bulk Operations Flow
1. Select users with checkboxes
2. Click bulk action button (suspend/activate/delete)
3. Confirmation modal shows count of affected users
4. Confirm action
5. Operations execute in parallel
6. Success/error alert displayed
7. User list refreshes automatically

### Individual User Flow
1. Click action menu (three dots) on user row
2. Select action (view details, suspend, activate, delete, adjust wallet, change role)
3. For destructive actions, confirmation modal appears
4. For details, modal shows full user profile
5. Action executes and user list updates

### Pagination Flow
1. Load initial 20 users (sorted by newest)
2. Click "Next" to load next page
3. Firestore cursor (`lastDoc`) tracks position
4. "Previous" returns to previous page
5. "Refresh" resets to page 1

## File Structure
```
apps/sports-hub/
├── src/
│   ├── components/
│   │   └── admin/
│   │       ├── UserManagement.tsx (674 lines)
│   │       └── AdminDashboard.tsx (505 lines)
│   └── app/
│       └── (dashboard)/
│           └── admin/
│               ├── users/
│               │   └── page.tsx (75 lines)
│               ├── dashboard/
│               │   └── page.tsx (266 lines)
│               └── page.tsx (163 lines)
```

## Dependencies

### Required Packages
- `firebase` - Firestore database operations
- `lucide-react` - Icon library
- `date-fns` - Date formatting utilities
- `@radix-ui/*` - UI primitives (via shadcn/ui)

### Internal Dependencies
- `@/config/firebase` - Firebase client SDK
- `@/contexts/AuthContext` - Authentication context
- `@/components/ui/*` - shadcn/ui components

## Performance Optimizations

### 1. Debounced Search
- Search input debounced to avoid excessive filtering
- Updates after user stops typing

### 2. Client-Side Filtering
- Role and status filters applied on loaded users
- No additional Firestore queries for filters

### 3. Cursor-Based Pagination
- Efficient pagination with Firestore cursors
- Only loads 20 users at a time
- Avoids loading entire user collection

### 4. Selective Re-renders
- React state management prevents unnecessary re-renders
- User selection tracked with Set for O(1) lookups

## Usage Example

### Accessing User Management
1. Login as super admin
2. Navigate to `/admin/users`
3. System checks authentication and authorization
4. User management interface loads

### Suspending Multiple Users
1. Search or filter to find users
2. Check boxes next to users to suspend
3. Click "Bulk Actions" dropdown
4. Select "Suspend Selected"
5. Confirm in modal
6. Users updated to suspended status

### Adjusting Wallet Balance
1. Find user in list
2. Click action menu (three dots)
3. Select "Adjust Wallet"
4. Enter new balance in dialog
5. Confirm action
6. Wallet balance updated in Firestore

### Exporting Users
1. Apply desired filters (role, status, search)
2. Click "Export CSV" button
3. CSV file downloads with filtered users
4. Includes all user fields

## Future Enhancements

### Potential Additions
1. **Advanced Filters**
   - Date range for account creation
   - Last login date range
   - Wallet balance range
   - MFA enrollment status

2. **User Import**
   - Bulk user creation from CSV
   - Template CSV download
   - Validation and error reporting

3. **Activity History**
   - Show user's voting history
   - Transaction history
   - Login history

4. **Communication Tools**
   - Send email to selected users
   - In-app notification broadcast
   - Announcement system

5. **Analytics**
   - User growth charts
   - Retention metrics
   - Engagement statistics

## Testing Checklist

- [ ] Super admin can access user management
- [ ] Non-admin users see access denied
- [ ] Search filters users by email/name
- [ ] Role filter works correctly
- [ ] Status filter works correctly
- [ ] Pagination loads next/previous pages
- [ ] Select all checkbox works
- [ ] Bulk suspend updates multiple users
- [ ] Bulk activate updates multiple users
- [ ] Bulk delete removes multiple users
- [ ] Individual suspend/activate works
- [ ] User details modal displays correctly
- [ ] Delete user removes from database
- [ ] Adjust wallet updates balance
- [ ] Change role updates user role
- [ ] Export CSV downloads correctly
- [ ] Refresh button reloads user list
- [ ] Audit logs created for all actions
- [ ] Loading states display properly
- [ ] Error handling works for failed operations

## Completion Status

✅ **Component Created**: UserManagement.tsx (674 lines)  
✅ **Page Route Created**: /admin/users  
✅ **Authentication**: Role-based access control implemented  
✅ **Features Complete**: Search, filter, bulk operations, export, pagination  
✅ **Documentation**: Complete with usage examples

**Phase 3.2 Status:** Complete  
**Next Phase:** 3.3 - Audit Logs Viewer

---

*Created: January 20, 2026*  
*Last Updated: January 20, 2026*  
*Version: 1.0*
