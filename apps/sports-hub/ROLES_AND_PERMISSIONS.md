# SportsHub Roles & Permissions

**Version**: 1.0  
**Last Updated**: January 22, 2026  
**Audience**: Developers, Security Team, Product Managers

---

## Table of Contents

1. [Overview](#overview)
2. [Role Hierarchy](#role-hierarchy)
3. [Permission Matrix](#permission-matrix)
4. [Role Assignment](#role-assignment)
5. [Access Control Implementation](#access-control-implementation)
6. [Firestore Security Rules](#firestore-security-rules)

---

## Overview

SportsHub implements a **role-based access control (RBAC) system** with:
- **3 global roles** (Super Admin, Support, User)
- **3 project-specific roles** (Admin, Editor, Viewer)
- **Custom claims** via Firebase Auth
- **Firestore rules** for data-level access control

### Security Model

```
┌─────────────────────────────────────────────────────┐
│         AUTHENTICATION (Firebase Auth)              │
│  User → Email/Password → JWT Token + Custom Claims  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         AUTHORIZATION (Custom Claims)                │
│  super_admin: true | support: true | <none>         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│      PROJECT-LEVEL ROLES (Firestore)                │
│  sportshub_project_roles/{userId_projectId}         │
│  { role: 'admin' | 'editor' | 'viewer' }            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│      FIRESTORE SECURITY RULES (Data Access)         │
│  - Check custom claims                              │
│  - Check project roles                              │
│  - Verify ownership                                 │
└─────────────────────────────────────────────────────┘
```

---

## Role Hierarchy

### Global Roles (Firebase Custom Claims)

#### 1. **Super Admin** (`super_admin: true`)
**Capabilities**:
- Full platform access (all projects)
- Create/edit/delete any project
- Grant/revoke user roles
- View all audit logs
- Access admin dashboard
- Modify system settings
- Impersonate users (for support)

**Use Cases**:
- Platform administrators
- Core development team
- Emergency access

**Assignment**: Manually via Firebase Admin SDK by existing super admin

---

#### 2. **Support** (`support: true`)
**Capabilities**:
- Read-only access to all projects
- View user wallets (not modify)
- View audit logs (not delete)
- Access support dashboard
- Create support tickets
- View user activity

**Use Cases**:
- Customer support team
- QA team
- External auditors (read-only)

**Assignment**: Super admin assigns via admin dashboard

---

#### 3. **User** (Default - no custom claims)
**Capabilities**:
- Create own projects
- Participate in tournaments
- Manage own wallet
- Vote in tournaments
- View own audit logs
- Update own profile

**Use Cases**:
- All registered users
- Default role after signup

**Assignment**: Automatic upon registration

---

### Project-Specific Roles (Firestore Document)

Collection: `sportshub_project_roles/{userId}_{projectId}`

#### 1. **Project Admin** (`role: 'admin'`)
**Capabilities**:
- Edit project settings
- Create/edit/delete tournaments
- Invite users to project
- Assign project roles (admin, editor, viewer)
- View project audit logs
- Export project data
- Delete project

**Cannot**:
- Access other projects
- Grant global roles
- Modify platform settings

---

#### 2. **Project Editor** (`role: 'editor'`)
**Capabilities**:
- Create/edit tournaments (cannot delete)
- View project data
- Participate in tournaments
- View project-specific audit logs

**Cannot**:
- Delete tournaments
- Edit project settings
- Invite users
- Assign roles

---

#### 3. **Project Viewer** (`role: 'viewer'`)
**Capabilities**:
- View project dashboard
- View tournaments (read-only)
- Participate in tournaments (if allowed)
- View own votes

**Cannot**:
- Edit anything
- Create tournaments
- Invite users

---

## Permission Matrix

| Action | Super Admin | Support | Project Admin | Project Editor | Project Viewer | User (No Role) |
|--------|-------------|---------|---------------|----------------|----------------|----------------|
| **Platform** |
| View admin dashboard | ✅ | ✅ (read-only) | ❌ | ❌ | ❌ | ❌ |
| Grant global roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View all audit logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Modify system settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Projects** |
| Create project | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edit ANY project | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit OWN project | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Delete project | ✅ | ❌ | ✅ (own) | ❌ | ❌ | ✅ (own) |
| View project | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Tournaments** |
| Create tournament | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Edit tournament | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Delete tournament | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Vote in tournament | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (if public) |
| View live results | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Wallets** |
| View ANY wallet | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View OWN wallet | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modify ANY wallet | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Top up wallet | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Users** |
| View user list | ✅ | ✅ | ✅ (project) | ✅ (project) | ❌ | ❌ |
| Assign project roles | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Ban user | ✅ | ❌ | ✅ (project) | ❌ | ❌ | ❌ |
| View user audit logs | ✅ | ✅ | ✅ (project) | ❌ | ❌ | ❌ |
| **Audit Logs** |
| View all logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View project logs | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View own logs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete logs | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Role Assignment

### Assigning Global Roles (Super Admin Only)

**Via Admin Dashboard** (Recommended):
1. Navigate to `/admin/users`
2. Search for user by email/ID
3. Click "Manage Roles"
4. Toggle role (super_admin / support)
5. Confirm action (requires password)

**Via Firebase Admin SDK** (Emergency):
```typescript
import { getAuth } from 'firebase-admin/auth';

// Grant super_admin
await getAuth().setCustomUserClaims(userId, {
  super_admin: true
});

// Grant support
await getAuth().setCustomUserClaims(userId, {
  support: true
});

// Revoke all roles
await getAuth().setCustomUserClaims(userId, {});
```

**Via Cloud Function** (`grantGlobalRole`):
```typescript
const grantRole = functions.https.onCall(async (data, context) => {
  // Verify caller is super_admin
  if (!context.auth?.token.super_admin) {
    throw new HttpsError('permission-denied', 'Super admin required');
  }

  const { userId, role } = data;
  
  await admin.auth().setCustomUserClaims(userId, { [role]: true });
  
  // Audit log
  await logAdminAction(context.auth.uid, 'GRANT_ROLE', {
    targetUserId: userId,
    role,
  });
});
```

---

### Assigning Project Roles (Project Admin)

**Via Project Settings UI**:
1. Navigate to `/projects/{projectId}/settings`
2. Click "Team Members"
3. Click "Invite User"
4. Enter email address
5. Select role (admin / editor / viewer)
6. Send invitation

**Firestore Structure**:
```typescript
// Collection: sportshub_project_roles
{
  documentId: '{userId}_{projectId}',  // Composite key
  data: {
    userId: 'abc123',
    projectId: 'proj_xyz',
    role: 'admin',  // 'admin' | 'editor' | 'viewer'
    grantedBy: 'user_who_granted_role',
    grantedAt: Timestamp,
    lastModified: Timestamp
  }
}
```

**Via Cloud Function** (`assignProjectRole`):
```typescript
const assignProjectRole = functions.https.onCall(async (data, context) => {
  const { projectId, targetUserId, role } = data;
  
  // Verify caller is project admin
  const callerRole = await getProjectRole(context.auth.uid, projectId);
  if (callerRole !== 'admin' && !context.auth?.token.super_admin) {
    throw new HttpsError('permission-denied', 'Project admin required');
  }

  // Create role document
  await db.collection('sportshub_project_roles')
    .doc(`${targetUserId}_${projectId}`)
    .set({
      userId: targetUserId,
      projectId,
      role,
      grantedBy: context.auth.uid,
      grantedAt: FieldValue.serverTimestamp(),
    });

  // Audit log
  await logProjectAction(projectId, context.auth.uid, 'ASSIGN_ROLE', {
    targetUserId,
    role,
  });
});
```

---

## Access Control Implementation

### Frontend Guards

**ProtectedRoute Component**:
```typescript
// components/ProtectedRoute.tsx
export function ProtectedRoute({ 
  children,
  requiredRole,
  fallback = '/unauthorized'
}: Props) {
  const { user, loading } = useAuth();
  const { checkRole } = useRoles();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  if (requiredRole && !checkRole(requiredRole)) {
    return <Navigate to={fallback} />;
  }

  return <>{children}</>;
}
```

**Usage**:
```tsx
// Super admin only
<ProtectedRoute requiredRole="super_admin">
  <AdminDashboard />
</ProtectedRoute>

// Support or super admin
<ProtectedRoute requiredRole={['super_admin', 'support']}>
  <SupportPanel />
</ProtectedRoute>

// Project admin
<ProtectedRoute 
  requiredRole="project_admin" 
  projectId={projectId}
>
  <ProjectSettings />
</ProtectedRoute>
```

---

### Backend Validation (Cloud Functions)

**Check Global Role**:
```typescript
function requireSuperAdmin(context: CallableContext) {
  if (!context.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }
  
  if (!context.auth.token.super_admin) {
    throw new HttpsError('permission-denied', 'Super admin required');
  }
}

export const deleteProject = functions.https.onCall(async (data, context) => {
  requireSuperAdmin(context);
  
  // Proceed with deletion
  await db.collection('sportshub_projects').doc(data.projectId).delete();
});
```

**Check Project Role**:
```typescript
async function requireProjectRole(
  userId: string,
  projectId: string,
  allowedRoles: string[]
): Promise<void> {
  const roleDoc = await db
    .collection('sportshub_project_roles')
    .doc(`${userId}_${projectId}`)
    .get();

  if (!roleDoc.exists) {
    throw new HttpsError('permission-denied', 'No project access');
  }

  const { role } = roleDoc.data()!;
  if (!allowedRoles.includes(role)) {
    throw new HttpsError('permission-denied', `Requires role: ${allowedRoles.join(' or ')}`);
  }
}

export const editTournament = functions.https.onCall(async (data, context) => {
  await requireProjectRole(
    context.auth!.uid,
    data.projectId,
    ['admin', 'editor']
  );
  
  // Proceed with edit
});
```

---

## Firestore Security Rules

### Global Role Checks

```javascript
// Check if user is super admin
function isSuperAdmin() {
  return request.auth != null && 
         request.auth.token.super_admin == true;
}

// Check if user is support or super admin
function isSupport() {
  return request.auth != null && 
         (request.auth.token.super_admin == true || 
          request.auth.token.support == true);
}
```

### Project Role Checks

```javascript
// Get user's project role
function getProjectRole(userId, projectId) {
  let roleDoc = get(/databases/$(database)/documents/sportshub_project_roles/$(userId + '_' + projectId));
  return roleDoc != null ? roleDoc.data.role : null;
}

// Check if user has required project role
function hasProjectRole(projectId, allowedRoles) {
  let role = getProjectRole(request.auth.uid, projectId);
  return role != null && role in allowedRoles;
}

// Usage in rules
match /sportshub_tournaments/{tournamentId} {
  allow create: if hasProjectRole(
    resource.data.projectId,
    ['admin', 'editor']
  );
  
  allow update: if hasProjectRole(
    resource.data.projectId,
    ['admin', 'editor']
  );
  
  allow delete: if hasProjectRole(
    resource.data.projectId,
    ['admin']
  );
  
  allow read: if true; // Public read
}
```

### Ownership Checks

```javascript
// Check if user owns the resource
function isOwner(userId) {
  return request.auth != null && request.auth.uid == userId;
}

// Wallet access
match /sportshub_wallets/{userId} {
  allow read: if isOwner(userId) || isSupport();
  allow write: if isOwner(userId);
}
```

---

## Security Best Practices

### Role Assignment Guidelines

1. ✅ **Principle of Least Privilege**: Grant minimum required role
2. ✅ **Review Regularly**: Audit role assignments quarterly
3. ✅ **Revoke Promptly**: Remove roles when users leave
4. ✅ **Audit Everything**: Log all role changes
5. ✅ **Require Approval**: Super admin promotions require 2FA + email confirmation

### Common Pitfalls

❌ **DON'T**:
- Check roles only in frontend (always validate backend)
- Store roles in Firestore without custom claims (use both)
- Grant super_admin casually (extremely powerful)
- Allow users to self-promote roles
- Bypass role checks for "convenience"

✅ **DO**:
- Validate roles in Cloud Functions AND Firestore rules
- Use custom claims for global roles, Firestore for project roles
- Require 2FA for super_admin actions (planned)
- Log all permission denials for security monitoring
- Test role boundaries thoroughly

---

## Troubleshooting

### "Permission Denied" Errors

**Check**:
1. User is authenticated: `context.auth != null`
2. Custom claims are set: `context.auth.token.super_admin`
3. Token is fresh: Claims cache for 1 hour, force refresh if needed
4. Firestore rules match function logic
5. Project role document exists: `sportshub_project_roles/{userId}_{projectId}`

**Force Token Refresh** (Client):
```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
await auth.currentUser?.getIdToken(true); // Force refresh
```

---

## Compliance

### GDPR Considerations

- **Right to Access**: Users can view their own role assignments via dashboard
- **Right to Erasure**: Role documents deleted when user account deleted
- **Audit Trail**: All role changes logged with timestamp and actor

### Audit Requirements

- **Who**: User who assigned role (`grantedBy` field)
- **What**: Role granted (`role` field)
- **When**: Timestamp (`grantedAt` field)
- **Why**: (Optional) Reason field can be added

---

**Questions?** Contact the security team or reference [SECURITY.md](SECURITY.md) for broader security documentation.
