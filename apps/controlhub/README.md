# 🎛️ ControlHub - Platform Observability & Governance Dashboard

**Status**: Alpha Development  
**Version**: 0.1.0  
**Port**: 3010

---

## 🎯 Purpose

ControlHub is the **platform-wide observation and governance dashboard** for Allied iMpact. It provides visibility across all apps without controlling or interfering with them.

**Think of it as**: Security Operations Center (SOC) + Platform Health Monitor + Compliance Dashboard

**NOT**: An admin panel, workflow engine, or app controller

---

## 🧩 What ControlHub Does

### ✅ Core Functions

1. **App Health Monitoring** - Real-time status of all apps
2. **Authentication Event Stream** - Cross-app login activity
3. **Unified Audit Log** - Platform-wide compliance logging
4. **Alert Aggregation** - Security and system alerts
5. **Support Operations View** - High-level support visibility

### ❌ What It Does NOT Do

- ❌ Authenticate users (apps do this)
- ❌ Manage user profiles (apps do this)
- ❌ Execute business logic (apps do this)
- ❌ Modify app data (apps do this)
- ❌ Replace app dashboards (apps keep their own)

---

## 👥 Who Uses ControlHub

**Internal Teams Only**:
- Platform Super Admins
- Security & Compliance Team
- Support & Operations Team
- Auditors (read-only)

**NOT** for end users, customers, or beneficiaries.

---

## 🏗️ Architecture

### Independence Guarantee

```
App (CoinBox) ──► Emits Events ──► ControlHub API ──► ControlHub DB
     │                                      │
     │                                      │
     └──► Continues working if ControlHub is offline
```

### Key Principles

1. **Apps push data TO ControlHub** (ControlHub never polls)
2. **Apps work fine if ControlHub is offline**
3. **ControlHub has its own Firebase project**
4. **Zero runtime dependencies**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Firebase account (separate project)

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3010
```

### Environment Variables

Create `.env.local`:

```env
# Firebase (ControlHub's own project)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# App Authentication Tokens (for apps to call ControlHub API)
COINBOX_API_TOKEN=
SPORTSHUB_API_TOKEN=
DRIVEMASTER_API_TOKEN=
EDUTECH_API_TOKEN=
PORTAL_API_TOKEN=
```

---

## 📊 Data Model

### Firestore Collections

```
controlhub/
├── app_health/{appId}          # App health status
├── auth_events/{eventId}        # Authentication events (90-day retention)
├── audit_logs/{logId}           # Audit trail (7-year retention)
├── alerts/{alertId}             # Security & system alerts
├── support_metrics/{appId}      # Support ticket metrics
└── users/{userId}               # Minimal user metadata
```

---

## 🔌 API Endpoints

Apps emit events to ControlHub via these endpoints:

```
POST /api/v1/events/health       # App health pings (every 60s)
POST /api/v1/events/auth         # Login/logout events
POST /api/v1/events/audit        # Admin actions
POST /api/v1/alerts              # Security/system alerts
POST /api/v1/support/metrics     # Support ticket summaries
```

**Authentication**: Each app uses a service account token in the `Authorization` header.

---

## 🎨 UI/UX

### Design Principles

- **Professional, enterprise-grade**
- **Dark mode** (easier for long monitoring sessions)
- **Calm colors** (no bright reds/greens unless critical)
- **Dense information** (not consumer-friendly)
- **Keyboard shortcuts** for power users

### Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│ ControlHub | Platform Observability                 │
├──────────┬──────────────────────────────────────────┤
│ Apps     │  🟢 CoinBox       ⚠️ SportsHub           │
│ Security │  🟢 DriveMaster   🟢 EduTech             │
│ Audit    │  🟢 Portal        🟢 MyProjects          │
│ Alerts   │                                           │
│ Support  │  Recent Alerts                            │
│ Reports  │  [Alert list with severity indicators]   │
└──────────┴──────────────────────────────────────────┘
```

---

## 🔐 Security

### Role-Based Access Control

```typescript
controlhub_super_admin    // Full access
controlhub_security       // Security events only
controlhub_support        // Support metrics only
controlhub_auditor        // Read-only audit logs
```

### Security Requirements

- ✅ MFA mandatory for all ControlHub users
- ✅ All actions logged
- ✅ Read-only by default
- ✅ Zero trust principles
- ✅ IP whitelist (optional)

---

## 📋 Project Structure

```
apps/controlhub/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (dashboard)/       # Main dashboard pages
│   │   ├── api/               # Event ingestion APIs
│   │   └── layout.tsx
│   ├── components/
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── alerts/            # Alert components
│   │   └── layout/            # Header, Sidebar
│   ├── lib/
│   │   ├── firebase.ts        # Firebase config
│   │   ├── api/               # API utilities
│   │   └── utils.ts
│   └── types/
│       └── events.ts          # Event schemas
├── public/
├── firestore.rules            # Security rules
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🧪 Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

---

## 📦 Build & Deploy

```bash
# Type check
pnpm type-check

# Build
pnpm build

# Start production server
pnpm start
```

---

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [ROLES_AND_PERMISSIONS.md](ROLES_AND_PERMISSIONS.md) - Access control
- [API.md](API.md) - API documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

---

## 🚫 Anti-Patterns to Avoid

❌ **Don't**: Make apps depend on ControlHub  
✅ **Do**: Let apps emit events independently

❌ **Don't**: Store user personal data  
✅ **Do**: Store only event metadata

❌ **Don't**: Poll app databases  
✅ **Do**: Wait for apps to push events

❌ **Don't**: Execute app business logic  
✅ **Do**: Observe and display only

---

## 🎯 Roadmap

### Phase 1: Core Observability (Current)
- ✅ App health monitoring
- ✅ Auth event stream
- ✅ Unified audit log
- ✅ Alert aggregation
- ✅ Support visibility

### Phase 2: Enhanced Governance
- ⏳ Cross-app user journey
- ⏳ Compliance reports
- ⏳ Platform-wide search
- ⏳ Advanced analytics

### Phase 3: Operations
- ⏳ SLA monitoring
- ⏳ Incident management
- ⏳ Automated runbooks

---

## 📞 Support

**Internal Use Only**

For issues or questions:
- Platform Team: platform@alliedimpact.com
- Security Team: security@alliedimpact.com

---

**License**: Proprietary - Allied iMpact Internal Tool
