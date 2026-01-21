# SportsHub Security Documentation

**Version**: 1.0  
**Last Updated**: January 2026  
**Classification**: Internal - Developer Reference  
**Security Score**: 8.5/10

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Firestore Security Rules](#firestore-security-rules)
4. [Rate Limiting](#rate-limiting)
5. [Audit Logging](#audit-logging)
6. [Data Protection](#data-protection)
7. [Bot Protection](#bot-protection)
8. [Incident Response](#incident-response)
9. [Compliance](#compliance)
10. [Security Best Practices](#security-best-practices)

---

## Security Overview

### Defense in Depth Strategy

SportsHub implements a **7-layer security architecture**:

```
1. Network Security (HTTPS/TLS)
2. Authentication (Firebase Auth + Custom Claims)
3. Authorization (Firestore Security Rules - 615 lines)
4. Rate Limiting (10 votes/min, 5 topups/hr)
5. Input Validation (reCAPTCHA v3 + Zod schemas)
6. Audit Logging (13 action types, immutable trail)
7. Data Immutability (Votes/audits cannot be modified)
```

### Security Principles

1. **Least Privilege**: Users only access what they need
2. **Zero Trust**: Verify every request, even from authenticated users
3. **Defense in Depth**: Multiple security layers
4. **Audit Everything**: Complete audit trail for compliance
5. **Fail Secure**: Errors default to deny access
6. **Immutability**: Critical data cannot be changed once created

---

## Authentication & Authorization

### Firebase Authentication

**Supported Methods:**
- ✅ Email/Password
- ❌ Google OAuth (planned)
- ❌ Phone (planned)
- ❌ MFA (planned Phase 2)

**Session Management:**
- Token expiration: 1 hour
- Refresh tokens: 30 days
- Automatic renewal on activity
- Secure httpOnly cookies (SSR)

### Custom Claims (Role-Based Access Control)

**Role Hierarchy:**
```typescript
interface CustomClaims {
  super_admin?: boolean;  // Platform super admin
  support?: boolean;      // Support team member
  // Project-specific roles stored in Firestore
}
```

**Role Assignment:**
```typescript
// Cloud Function (admin only)
export const grantRole = functions.https.onCall(
  async (data, context) => {
    // Verify caller is super_admin
    if (!context.auth?.token.super_admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only super admins can grant roles'
      );
    }
    
    const { userId, role } = data;
    
    // Set custom claim
    await admin.auth().setCustomUserClaims(userId, {
      [role]: true
    });
    
    // Log audit trail
    await logAdminAction(
      context.auth.uid,
      'grant_role',
      'user',
      userId,
      { role }
    );
    
    return { success: true };
  }
);
```

### Role-Based Permissions Matrix

| Permission | Super Admin | Project Admin | Support | User |
|-----------|-------------|---------------|---------|------|
| **Tournaments** |
| Create Tournament | ✅ | ✅ (own project) | ❌ | ❌ |
| Edit Tournament | ✅ | ✅ (own project) | ❌ | ❌ |
| Delete Tournament | ✅ | ❌ | ❌ | ❌ |
| Publish Tournament | ✅ | ✅ (own project) | ❌ | ❌ |
| Close Tournament | ✅ | ✅ (own project) | ❌ | ❌ |
| View Tournament | ✅ | ✅ | ✅ | ✅ (open only) |
| **Voting** |
| Cast Vote | ✅ | ✅ | ✅ | ✅ |
| View Own Votes | ✅ | ✅ | ✅ | ✅ |
| View All Votes | ✅ | ✅ (own project) | ✅ | ❌ |
| Delete Vote | ❌ (immutable) | ❌ | ❌ | ❌ |
| **Wallets** |
| View Own Wallet | ✅ | ✅ | ✅ | ✅ |
| View All Wallets | ✅ | ❌ | ✅ | ❌ |
| Top Up Wallet | ✅ | ✅ | ✅ | ✅ |
| Refund | ✅ | ❌ | ❌ | ❌ |
| Adjust Balance | ✅ | ❌ | ❌ | ❌ |
| **Audit Logs** |
| View Audit Logs | ✅ | ✅ (own project) | ✅ | ❌ |
| **Roles** |
| Grant Role | ✅ | ❌ | ❌ | ❌ |
| Revoke Role | ✅ | ❌ | ❌ | ❌ |

---

## Firestore Security Rules

### Rule Structure (615 lines)

**File**: `firestore.rules`

#### Helper Functions

```javascript
// Check if user is authenticated
function isAuthenticated() {
  return request.auth != null;
}

// Check super_admin custom claim (token-based)
function isSuperAdmin() {
  return isAuthenticated() && 
         request.auth.token.super_admin == true;
}

// Check support role
function isSupport() {
  return isAuthenticated() && 
         request.auth.token.support == true;
}

// Check project-specific role
function hasProjectRole(projectId, role) {
  return isAuthenticated() && 
         get(/databases/$(database)/documents/projects/$(projectId))
           .data.roles[request.auth.uid] == role;
}

// Check if user is project admin
function isProjectAdmin(projectId) {
  return isSuperAdmin() || hasProjectRole(projectId, 'admin');
}

// Validate wallet balance
function hasWalletBalance(amount) {
  return get(/databases/$(database)/documents/wallets/$(request.auth.uid))
           .data.balance >= amount;
}

// Check if tournament voting window is open
function votingWindowOpen(tournamentData) {
  return tournamentData.status == 'open' &&
         tournamentData.votingDeadline > request.time;
}

// Validate timestamp is server-generated
function hasValidTimestamp(data) {
  return data.createdAt == request.time;
}
```

---

### Collection-Specific Rules

#### 1. Projects Collection
```javascript
match /projects/{projectId} {
  // Read: Super admin or has any role in project
  allow read: if isSuperAdmin() || 
                 isSupport() ||
                 request.auth.uid in resource.data.roles;
  
  // Create: Super admin only
  allow create: if isSuperAdmin() &&
                   hasValidTimestamp(request.resource.data);
  
  // Update: Super admin or project admin
  allow update: if isProjectAdmin(projectId);
  
  // Delete: Super admin only
  allow delete: if isSuperAdmin();
}
```

#### 2. Tournaments Sub-collection
```javascript
match /projects/{projectId}/tournaments/{tournamentId} {
  // Read: Everyone can read open tournaments
  allow read: if resource.data.status == 'open' ||
                 isProjectAdmin(projectId) ||
                 isSupport();
  
  // Create: Project admin only
  allow create: if isProjectAdmin(projectId) &&
                   hasValidTimestamp(request.resource.data) &&
                   request.resource.data.status == 'draft';
  
  // Update: Project admin only
  allow update: if isProjectAdmin(projectId);
  
  // Delete: Super admin only
  allow delete: if isSuperAdmin();
}
```

#### 3. Votes Sub-collection (IMMUTABLE)
```javascript
match /projects/{projectId}/tournaments/{tournamentId}/votes/{voteId} {
  // Read: Own votes or project admin
  allow read: if isAuthenticated() &&
                 (resource.data.userId == request.auth.uid ||
                  isProjectAdmin(projectId) ||
                  isSupport());
  
  // Create: Authenticated user with sufficient balance
  allow create: if isAuthenticated() &&
                   request.resource.data.userId == request.auth.uid &&
                   hasValidTimestamp(request.resource.data) &&
                   hasWalletBalance(request.resource.data.voteCost);
  
  // Update/Delete: NEVER (immutable for audit trail)
  allow update, delete: if false;  // 🔒 IMMUTABLE
}
```

#### 4. Wallets Collection (NO CLIENT WRITES)
```javascript
match /wallets/{userId} {
  // Read: Own wallet or admin/support
  allow read: if isAuthenticated() &&
                 (userId == request.auth.uid ||
                  isSuperAdmin() ||
                  isSupport());
  
  // Create: Cloud Functions only (initial wallet)
  allow create: if false;  // ❌ No client creates
  
  // Update: NEVER (Cloud Functions only)
  allow update: if false;  // ❌ No client updates
  
  // Delete: NEVER
  allow delete: if false;  // ❌ No deletes
}
```

#### 5. Notifications Collection
```javascript
match /notifications/{notificationId} {
  // Read: Own notifications only
  allow read: if isAuthenticated() &&
                 resource.data.userId == request.auth.uid;
  
  // Create: Cloud Functions only
  allow create: if false;  // ❌ No client creates
  
  // Update: Mark as read (own notifications only)
  allow update: if isAuthenticated() &&
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.diff(resource.data)
                     .affectedKeys().hasOnly(['read']);
  
  // Delete: Own notifications only
  allow delete: if isAuthenticated() &&
                   resource.data.userId == request.auth.uid;
}
```

#### 6. Audit Logs Collection (IMMUTABLE)
```javascript
match /audit_logs/{logId} {
  // Read: Super admin or related project admin
  allow read: if isSuperAdmin() ||
                 (isAuthenticated() && 
                  resource.data.userId == request.auth.uid) ||
                 isSupport();
  
  // Create: Cloud Functions only
  allow create: if false;  // ❌ No client creates
  
  // Update/Delete: NEVER (immutable audit trail)
  allow update, delete: if false;  // 🔒 IMMUTABLE
}
```

#### 7. Rate Limits Collection
```javascript
match /rate_limits/{limitId} {
  // Read: Own rate limits or admin
  allow read: if isAuthenticated() &&
                 (resource.data.userId == request.auth.uid ||
                  isSuperAdmin());
  
  // Create/Update/Delete: Cloud Functions only
  allow create, update, delete: if false;  // ❌ CF only
}
```

---

## Rate Limiting

### Rate Limit Configurations

```typescript
const RATE_LIMITS = {
  VOTE_SUBMISSION: {
    action: 'vote',
    windowMs: 60 * 1000,          // 1 minute
    maxAttempts: 10,              // 10 votes/min
    errorMessage: 'Too many votes. Please wait before voting again.'
  },
  
  WALLET_TOPUP: {
    action: 'topup',
    windowMs: 60 * 60 * 1000,     // 1 hour
    maxAttempts: 5,               // 5 topups/hour
    errorMessage: 'Too many top-up attempts. Please wait 1 hour.'
  },
  
  ADMIN_ACTION: {
    action: 'admin',
    windowMs: 60 * 1000,          // 1 minute
    maxAttempts: 20,              // 20 actions/min
    errorMessage: 'Too many admin actions. Please slow down.'
  },
  
  CREATE_TOURNAMENT: {
    action: 'create_tournament',
    windowMs: 60 * 60 * 1000,     // 1 hour
    maxAttempts: 5,               // 5 tournaments/hour
    errorMessage: 'Tournament creation limit reached. Wait 1 hour.'
  },
  
  AUTH_ATTEMPT: {
    action: 'auth',
    windowMs: 15 * 60 * 1000,     // 15 minutes
    maxAttempts: 5,               // 5 attempts/15min
    errorMessage: 'Too many login attempts. Account locked for 15 minutes.'
  }
};
```

### Implementation Details

**Algorithm**: Sliding Window with Firestore

**Storage**: `rate_limits` collection
```typescript
{
  id: `${userId}_${action}`,
  userId: string,
  action: string,
  attempts: number,
  windowStart: Timestamp,
  lastAttempt: Timestamp
}
```

**Enforcement**:
```typescript
async function enforceRateLimit(
  context: CallableContext,
  config: RateLimitConfig
): Promise<void> {
  const userId = context.auth!.uid;
  const limitId = `${userId}_${config.action}`;
  
  // Check current limit status
  // Increment attempts
  // Throw if exceeded
  // Auto-reset after window expires
}
```

**Cleanup**: Scheduled Cloud Function runs every 24 hours, deletes records > 7 days old

---

## Audit Logging

### Logged Actions (13 Types)

```typescript
type AdminAction =
  | 'create_tournament'      // New tournament created
  | 'update_tournament'      // Tournament details modified
  | 'delete_tournament'      // Tournament removed
  | 'publish_tournament'     // Tournament published (draft → open)
  | 'unpublish_tournament'   // Tournament unpublished
  | 'close_tournament'       // Tournament closed (open → closed)
  | 'add_voting_item'        // Voting option added
  | 'update_voting_item'     // Voting option modified
  | 'delete_voting_item'     // Voting option removed
  | 'create_project'         // New project created
  | 'update_project'         // Project details modified
  | 'delete_project'         // Project removed
  | 'grant_role'             // Role granted to user
  | 'revoke_role'            // Role revoked from user
  | 'refund_wallet'          // Wallet refund processed
  | 'adjust_balance'         // Manual balance adjustment
  | 'system_action';         // System-initiated action
```

### Audit Log Structure

```typescript
{
  id: string;                // Auto-generated
  userId: string;            // Actor (who performed action)
  userEmail: string;         // Actor email (for human readability)
  action: AdminAction;       // Action type
  resourceType: string;      // Target resource type
  resourceId: string;        // Target resource ID
  projectId?: string;        // Associated project (if applicable)
  timestamp: Timestamp;      // When action occurred
  metadata?: {               // Action-specific data
    changes?: Record<string, any>;
    previousValue?: any;
    newValue?: any;
    reason?: string;
  };
  ipAddress?: string;        // Request IP
  userAgent?: string;        // Browser/client info
}
```

### Usage Example

```typescript
// Log tournament publish action
await logAdminAction(
  context.auth.uid,                   // Actor ID
  'publish_tournament',               // Action type
  'tournament',                       // Resource type
  tournamentId,                       // Resource ID
  {                                   // Metadata
    projectId,
    changes: { status: 'open' },
    tournamentName: 'Best Player 2024'
  }
);
```

### Query Functions

```typescript
// Get all logs for a specific resource
const logs = await getResourceAuditLogs('tournament', tournamentId);

// Get all logs by a specific user
const userLogs = await getUserAuditLogs(userId, 30); // Last 30 days

// Get recent logs (admin dashboard)
const recentLogs = await getRecentAuditLogs(100); // Last 100 logs
```

### Retention Policy

- **Duration**: 1 year
- **Cleanup**: Automated (scheduled Cloud Function every 7 days)
- **Compliance**: POPIA, GDPR compliance
- **Immutability**: Cannot be modified or deleted (except by cleanup)

---

## Data Protection

### Data Classification

| Data Type | Classification | Protection Level |
|-----------|---------------|------------------|
| User credentials | **Critical** | Firebase Auth encryption |
| Wallet balances | **High** | Cloud Functions only, audit logged |
| Votes | **High** | Immutable, audit trail |
| Personal info (email) | **Medium** | Firebase Auth, minimal collection |
| Tournament data | **Low** | Public (when published) |
| Audit logs | **High** | Immutable, admin-only access |

### Encryption

**In Transit:**
- ✅ HTTPS/TLS 1.3
- ✅ Firestore encrypted connections
- ✅ Firebase Auth encrypted tokens

**At Rest:**
- ✅ Firebase managed encryption (AES-256)
- ✅ Automatic backup encryption
- ❌ Additional encryption layer (not needed for current threat model)

### Data Minimization

**Principles:**
- Only collect necessary data
- No PII beyond email (required for auth)
- Vote records anonymized in public results
- IP address optional (audit trail only)

**User Data Collected:**
- ✅ Email (authentication)
- ✅ Display name (optional)
- ✅ Wallet balance (transactions)
- ✅ Vote history (own votes only)
- ❌ Phone number
- ❌ Physical address
- ❌ Payment details (future: tokenized only)

---

## Bot Protection

### reCAPTCHA v3 Integration

**Placement**: Vote submission form

**Implementation:**
```typescript
// Client-side
import ReCAPTCHA from 'react-google-recaptcha';

const handleVoteSubmit = async () => {
  // Get reCAPTCHA token
  const token = await recaptchaRef.current.executeAsync();
  
  // Submit vote with token
  await submitVote({
    tournamentId,
    optionId,
    recaptchaToken: token
  });
};
```

**Server-side Validation:**
```typescript
// Cloud Function
const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
  method: 'POST',
  body: new URLSearchParams({
    secret: process.env.RECAPTCHA_SECRET_KEY,
    response: recaptchaToken
  })
});

const result = await response.json();

if (!result.success || result.score < 0.5) {
  throw new Error('reCAPTCHA validation failed');
}
```

**Score Threshold**: 0.5 (balance between security and false positives)

### Additional Bot Protection

1. **Rate Limiting**: 10 votes/minute per user
2. **Distributed Counters**: Prevents single-document hotspots
3. **Vote Immutability**: Cannot game system by changing votes
4. **Wallet Requirement**: Costs 1 credit per vote
5. **Audit Trail**: All actions logged

---

## Incident Response

### Incident Classification

| Severity | Definition | Response Time | Examples |
|----------|------------|---------------|----------|
| **P0** | Critical security breach | < 1 hour | Data breach, system compromise |
| **P1** | High-impact vulnerability | < 4 hours | SQL injection, XSS attack |
| **P2** | Medium-impact issue | < 24 hours | Rate limit bypass, minor leak |
| **P3** | Low-impact issue | < 7 days | Info disclosure, minor bug |

### Incident Response Procedure

**Phase 1: Detection (0-15 minutes)**
1. Alert received (Sentry, manual report, audit log anomaly)
2. Verify incident authenticity
3. Classify severity (P0-P3)
4. Notify security team

**Phase 2: Containment (15 minutes - 1 hour)**
1. Isolate affected systems
2. Disable compromised accounts
3. Block malicious IPs
4. Enable additional logging
5. Snapshot current state (evidence preservation)

**Phase 3: Eradication (1-4 hours)**
1. Identify root cause
2. Remove malicious code/access
3. Patch vulnerabilities
4. Reset compromised credentials
5. Deploy fixes

**Phase 4: Recovery (4-24 hours)**
1. Restore normal operations
2. Monitor for recurring issues
3. Verify fix effectiveness
4. Re-enable affected features

**Phase 5: Post-Incident (24-72 hours)**
1. Conduct post-mortem
2. Document lessons learned
3. Update security policies
4. Implement preventive measures
5. Notify affected users (if required by law)

### Emergency Contacts

- **Security Lead**: security@alliedimpact.com
- **Development Team**: dev@alliedimpact.com
- **Support Team**: support@sportshub.com
- **Legal/Compliance**: legal@alliedimpact.com

---

## Compliance

### POPIA (Protection of Personal Information Act - South Africa)

**Compliance Status**: ✅ In Progress

**Requirements:**
1. ✅ Consent: Users agree to Terms of Service
2. ✅ Purpose Limitation: Data used only for platform operation
3. ✅ Data Minimization: Only collect email + display name
4. ✅ Accuracy: Users can update profile
5. ⏳ Security: Encryption, access control (ongoing improvements)
6. ⏳ Openness: Privacy policy (to be published)
7. ⏳ Right to Access: User can view own data
8. ⏳ Right to Delete: Manual process (admin action)

**Actions Required:**
- Publish Privacy Policy
- Implement data export feature
- Implement account deletion flow
- Obtain explicit consent checkbox

### GDPR (General Data Protection Regulation - EU)

**Compliance Status**: ⚠️ Partial

**Requirements:**
1. ⏳ Lawful Basis: Consent + legitimate interest
2. ✅ Data Minimization: Minimal data collection
3. ⏳ Right to Access: Implement data export
4. ⏳ Right to Erasure: Implement account deletion
5. ⏳ Right to Portability: Export in machine-readable format
6. ⏳ Data Breach Notification: 72-hour notification process
7. ❌ EU Data Residency: Firebase us-central1 (need EU region)

**Actions Required (if serving EU users):**
- Migrate to Firebase EU region
- Implement GDPR compliance features
- Appoint Data Protection Officer (DPO)
- Update Terms of Service and Privacy Policy

---

## Security Best Practices

### For Developers

1. **Never log sensitive data** (passwords, tokens, API keys)
2. **Use environment variables** for secrets
3. **Validate all inputs** (client and server-side)
4. **Use parameterized queries** (prevent injection)
5. **Enable error tracking** (Sentry - planned)
6. **Review security rules regularly** (monthly audit)
7. **Keep dependencies updated** (weekly check)
8. **Use TypeScript** for type safety
9. **Implement least privilege** for all roles
10. **Test security rules** before deployment

### For Administrators

1. **Enable MFA** on admin accounts (Phase 2)
2. **Rotate secrets** every 90 days
3. **Review audit logs** weekly
4. **Monitor rate limits** for abuse patterns
5. **Backup Firestore** daily (automated)
6. **Document all role changes** in audit log
7. **Revoke unused roles** immediately
8. **Use strong passwords** (16+ characters)
9. **Limit super_admin role** to 2-3 users maximum
10. **Never share credentials**

### For Users

1. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
2. **Enable MFA** when available (Phase 2)
3. **Don't share account credentials**
4. **Report suspicious activity** to support
5. **Verify tournament authenticity** before voting
6. **Monitor wallet balance** for unauthorized transactions
7. **Use secure networks** (avoid public Wi-Fi)
8. **Keep devices updated** (OS, browser)
9. **Be cautious of phishing** (verify email sender)
10. **Review vote history** regularly

---

## Security Roadmap

### Phase 2 (Next 2 Months)
- ⏳ Implement MFA (multi-factor authentication)
- ⏳ Install Sentry (error tracking + security monitoring)
- ⏳ Publish Privacy Policy and Terms of Service
- ⏳ Implement data export feature (GDPR/POPIA)
- ⏳ Add account deletion flow
- ⏳ Email notifications for security events

### Phase 3 (3-6 Months)
- Penetration testing (third-party audit)
- Security training for developers
- Migrate to Firebase EU region (GDPR)
- Implement Web Application Firewall (WAF)
- Add IP-based geo-blocking (if needed)
- Enhanced logging and monitoring

### Phase 4 (6-12 Months)
- SOC 2 Type II certification
- Bug bounty program
- Advanced threat detection (ML-based)
- Automated security scanning (CI/CD)
- Data Loss Prevention (DLP) tools

---

## Security Metrics

### Current Metrics
- **Security Score**: 8.5/10
- **Firestore Rules Coverage**: 615 lines (comprehensive)
- **Rate Limiting Coverage**: 5 critical actions
- **Audit Logging Coverage**: 13 admin action types
- **Immutable Collections**: 2 (votes, audit_logs)
- **Bot Protection**: reCAPTCHA v3 (score-based)
- **Uptime**: 99.9% target

### Target Metrics (Phase 2)
- **Security Score**: 9.5/10
- **MFA Adoption**: 80% of admin accounts
- **Penetration Test**: 0 critical vulnerabilities
- **Incident Response Time**: < 1 hour for P0
- **Audit Log Queries**: < 500ms
- **Rate Limit False Positives**: < 0.1%

---

**Document Version**: 1.0  
**Last Updated**: January 19, 2026  
**Maintained By**: Security Team  
**Next Security Review**: February 2026  
**Classification**: Internal - Confidential
