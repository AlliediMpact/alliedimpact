# ControlHub - Security Documentation

**Version**: 0.1.0  
**Last Updated**: January 23, 2026

---

## 🎯 Security Overview

ControlHub handles sensitive platform-wide observability data, requiring enterprise-grade security controls.

**Security Posture**: Zero Trust Architecture with defense-in-depth

---

## 🔐 Authentication & Authorization

### Authentication

**Method**: Firebase Authentication with Custom Claims

```typescript
// User authenticates via Firebase Auth
const user = await signInWithEmailAndPassword(auth, email, password);

// Custom claims contain role
const token = await user.getIdTokenResult();
console.log(token.claims.controlhub_super_admin); // true
```

**Requirements**:
- ✅ Multi-Factor Authentication (MFA) **MANDATORY**
- ✅ Strong password policy (min 12 chars, complexity)
- ✅ Session timeout: 1 hour idle, 8 hours absolute
- ✅ IP-based anomaly detection
- ✅ Failed login lockout: 5 attempts = 15 min lockout

### Authorization

**Method**: Role-Based Access Control (RBAC) via Custom Claims

| Role | Custom Claim | Access Level |
|------|--------------|--------------|
| Super Admin | `controlhub_super_admin` | Full access |
| Security Team | `controlhub_security` | Security + Audit |
| Support Team | `controlhub_support` | Support + Audit |
| Auditor | `controlhub_auditor` | Audit logs only |

**Enforcement**: Firestore Security Rules (server-side)

```javascript
match /controlhub_audit_logs/{logId} {
  allow read: if hasAnyRole();
  allow write: if false; // NEVER allow client writes
}
```

---

## 🛡️ API Security

### Token-Based Authentication

Apps authenticate to ControlHub APIs using Bearer tokens:

```bash
Authorization: Bearer ch_live_coinbox_abc123...
```

**Token Management**:
- Unique token per app
- Stored in environment variables (NEVER in code)
- Rotated quarterly
- Different tokens for dev/staging/prod
- Minimum 64 characters, cryptographically random

### Token Generation

```typescript
import crypto from 'crypto';

function generateApiToken(appId: string, environment: string): string {
  const prefix = environment === 'production' ? 'ch_live' : 'ch_test';
  const random = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${appId}_${random}`;
}
```

### Request Validation

```typescript
// API validates token, appId, and request schema
export async function POST(request: NextRequest) {
  // 1. Extract appId from request body
  const appId = extractAppId(body);
  
  // 2. Validate Bearer token matches appId
  const authHeader = request.headers.get('Authorization');
  if (!validateApiToken(authHeader, appId)) {
    return apiError('UNAUTHORIZED', 'Invalid token', 401);
  }
  
  // 3. Validate request schema with Zod
  const event = HealthEventSchema.parse(body.data);
  
  // 4. Store in Firestore
  await storeEvent(event);
}
```

### Rate Limiting

```typescript
// 60 requests per minute per app
const RATE_LIMIT = 60;
const WINDOW = 60000; // 1 minute

// Implemented with Redis or in-memory Map
const rateLimiter = new Map<AppId, { count: number; resetAt: number }>();

function checkRateLimit(appId: AppId): boolean {
  const now = Date.now();
  const record = rateLimiter.get(appId);
  
  if (!record || now > record.resetAt) {
    rateLimiter.set(appId, { count: 1, resetAt: now + WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false; // 429 Too Many Requests
  }
  
  record.count++;
  return true;
}
```

---

## 🔒 Data Security

### Data Classification

| Data Type | Classification | Retention | Encryption |
|-----------|----------------|-----------|------------|
| **Audit Logs** | Critical | 7 years | At rest + in transit |
| **Auth Events** | High | 90 days | At rest + in transit |
| **Alerts** | High | 365 days | At rest + in transit |
| **Health Status** | Medium | Latest only | In transit |
| **Support Metrics** | Low | 90 days | In transit |

### Encryption

**In Transit**:
- TLS 1.3 required
- HTTPS only (HTTP redirects to HTTPS)
- Certificate pinning for API clients

**At Rest**:
- Firestore automatic encryption (AES-256)
- Backup encryption enabled
- Keys managed by Google Cloud KMS

### Data Immutability

**Audit Logs** are **IMMUTABLE** (cannot be modified or deleted):

```javascript
// Firestore rules enforce immutability
match /controlhub_audit_logs/{logId} {
  allow read: if hasAnyRole();
  allow create: if false; // Only API creates via service account
  allow update, delete: if false; // NEVER ALLOW
}
```

**Enforcement**:
- Client-side: Firestore rules block updates/deletes
- Server-side: API only allows inserts
- Backup: Daily exports to immutable Cloud Storage

---

## 🚨 Threat Model

### Threat 1: Unauthorized API Access

**Attack**: Attacker obtains API token and sends fake events

**Mitigations**:
- ✅ Unique token per app (limits blast radius)
- ✅ Rate limiting (prevents flood attacks)
- ✅ Token rotation (limits exposure window)
- ✅ IP allowlisting (optional, limits source IPs)
- ✅ Request signing with HMAC (future enhancement)

### Threat 2: Privilege Escalation

**Attack**: User with Support role attempts to access Security data

**Mitigations**:
- ✅ Firestore rules enforce role-based access (server-side)
- ✅ Frontend hides UI elements based on role (client-side)
- ✅ All role changes logged in audit trail
- ✅ Regular role reviews (quarterly)

### Threat 3: Audit Log Tampering

**Attack**: Malicious admin attempts to modify/delete audit logs

**Mitigations**:
- ✅ Firestore rules prevent updates/deletes (IMMUTABLE)
- ✅ Daily exports to separate Cloud Storage bucket
- ✅ Exports are write-once, read-many (WORM)
- ✅ Tamper detection via checksums

### Threat 4: Credential Compromise

**Attack**: User credentials stolen via phishing

**Mitigations**:
- ✅ MFA mandatory (reduces risk)
- ✅ IP-based anomaly detection (flags unusual logins)
- ✅ Session timeout (limits exposure)
- ✅ Failed login lockout (prevents brute force)
- ✅ Security team alerted on suspicious activity

### Threat 5: Data Exfiltration

**Attack**: Insider threat downloads all audit logs

**Mitigations**:
- ✅ Role-based access (not everyone can access everything)
- ✅ Query limits (max 1000 records per query)
- ✅ All queries logged (who accessed what)
- ✅ Data Loss Prevention (DLP) alerts on large exports

---

## 🔍 Logging & Monitoring

### Security Events Logged

```typescript
// All ControlHub actions are logged
{
  actor: 'admin@alliedimpact.com',
  action: 'query_audit_logs',
  timestamp: '2026-01-23T10:00:00Z',
  metadata: {
    query: 'appId == "coinbox"',
    resultsReturned: 45,
    ipAddress: '41.203.123.45'
  }
}
```

**Logged Events**:
- User logins/logouts
- Role assignments/revocations
- Audit log queries
- Alert acknowledgments
- Configuration changes
- API token rotations
- Failed authentication attempts

### Real-time Alerts

```typescript
// Critical security events trigger immediate alerts
if (failedLoginAttempts > 5) {
  sendAlert({
    severity: 'high',
    title: 'Brute Force Attack Detected',
    description: `Multiple failed logins for ${email} from ${ip}`,
    category: 'security'
  });
}
```

**Alert Channels**:
- Email (security team)
- SMS (on-call engineer)
- Slack (#security-alerts)
- PagerDuty (critical only)

---

## 🛠️ Security Operations

### Incident Response

**Severity Levels**:
- **P0 (Critical)**: Data breach, unauthorized access to audit logs
- **P1 (High)**: Compromised API token, privilege escalation
- **P2 (Medium)**: Suspicious login patterns, MFA bypass attempts
- **P3 (Low)**: Failed login attempts, expired certificates

**Response Procedure**:
1. **Detect**: Automated alert triggers
2. **Assess**: Security team investigates
3. **Contain**: Revoke compromised tokens/roles
4. **Eradicate**: Patch vulnerability
5. **Recover**: Restore normal operations
6. **Review**: Post-mortem and improvements

### Token Rotation

```bash
# Quarterly rotation schedule
# Q1: January 15
# Q2: April 15
# Q3: July 15
# Q4: October 15

# Rotation process:
1. Generate new tokens
2. Update apps (blue-green deployment)
3. Monitor for errors
4. Revoke old tokens after 7 days
5. Update documentation
```

### Vulnerability Management

**Scanning**:
- Dependabot (weekly)
- Snyk (on every commit)
- Manual penetration testing (quarterly)

**Patching SLA**:
- Critical: 24 hours
- High: 7 days
- Medium: 30 days
- Low: 90 days

---

## 📋 Compliance

### Data Protection

**GDPR Compliance**:
- ✅ User consent for data processing
- ✅ Right to access (audit logs)
- ✅ Right to erasure (user deletion)
- ✅ Data portability (export API)
- ✅ Data breach notification (72 hours)

**POPIA Compliance** (South Africa):
- ✅ Data minimization (only necessary data)
- ✅ Purpose limitation (observability only)
- ✅ Storage limitation (retention policies)
- ✅ Security safeguards (encryption, access control)

### Audit Trail Requirements

**Retention**: 7 years (financial compliance)

**Logged Actions**:
- Admin actions (user verifications, role changes)
- Financial transactions (CoinBox)
- System configuration changes
- Data access (who viewed what)

**Immutability**: Enforced by Firestore rules + Cloud Storage WORM

---

## 🔐 Security Checklist

### Pre-Production

- [ ] All users have MFA enabled
- [ ] API tokens generated and stored securely
- [ ] Firestore rules deployed and tested
- [ ] Rate limiting configured
- [ ] IP allowlist configured (if applicable)
- [ ] SSL/TLS certificates valid
- [ ] Backup strategy tested
- [ ] Incident response plan documented
- [ ] Security team trained

### Ongoing

- [ ] Quarterly role reviews
- [ ] Quarterly token rotations
- [ ] Weekly vulnerability scans
- [ ] Monthly security metrics review
- [ ] Annual penetration testing
- [ ] Annual disaster recovery drill

---

## 🚨 Incident Reporting

**Security Incidents**:
- Email: security@alliedimpact.com
- Phone: +27 XX XXX XXXX (24/7)
- Slack: #security-incidents

**Vulnerability Disclosure**:
- Email: security@alliedimpact.com
- PGP Key: [Available on website]

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules Best Practices](https://firebase.google.com/docs/rules/security)
- [GDPR Compliance Guide](https://gdpr.eu/)
- [POPIA Compliance (South Africa)](https://popia.co.za/)

---

**Last Updated**: January 23, 2026  
**Maintained By**: Security Team + Platform Engineering
