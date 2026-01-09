# 🧠 Allied iMpact – Platform & Products

This document explains **how Allied iMpact works as a platform**, **why it is structured this way**, and **how all current and future applications must integrate safely**.

---

## 1️⃣ Allied iMpact Platform Overview

Allied iMpact is a **multi-application ecosystem** built on a shared platform layer.

The platform provides:
- Authentication (SSO)
- Central routing & dashboard
- Subscription awareness
- Cross-app consistency

The platform **does NOT**:
- Own app business logic
- Control app pricing
- Share app databases

Each application remains **independent and isolated**.

---

## 2️⃣ Why This Architecture Exists

### Problems We Are Solving
- Users don’t want multiple accounts
- Businesses want modular systems
- Scaling one app shouldn’t risk others
- Clients need proof before custom development

### Our Solution
- One platform
- Many independent products
- Shared identity, not shared risk

---

## 3️⃣ Product Categories

### A. Financial Platforms (High Risk)
Examples:
- Coin Box (P2P Loans, P2P Crypto)
- Future financial tools

Rules:
- Strong KYC
- Wallet isolation
- Strict limits per membership
- Zero tolerance for data loss

---

### B. SaaS Platforms (Medium Risk)
Examples:
- Drive Master
- CodeTech
- Gov Cross Platform (future)

Rules:
- Subscription-based
- Feature-tiered access
- Less regulatory overhead

---

### C. Informational Platforms (Low Risk)
Examples:
- uMkhanyakude High Schools

Rules:
- Public access
- Minimal auth
- Content-first

---

## 4️⃣ Existing Applications

### 🪙 Coin Box (REFERENCE SYSTEM)
- Financial P2P platform
- Production-ready
- Complex rules (loans, crypto, wallets, KYC)

**Important:**
- Coin Box must NEVER be rewritten
- It serves as a **reference**, not a dependency

---

### 🚗 Drive Master
- Training & certification platform
- Free + paid plans
- Different pricing model from Coin Box

---

### 💻 CodeTech
- Education & skills platform
- Subscription-based
- Focus on learning and certification

---

### ⚽ Cup Final
- Sports + technology platform
- Event-based logic
- High traffic, high visibility
- Custom fan engagement systems

---

### 🏫 uMkhanyakude High Schools
- Informational + community platform
- Minimal auth
- Education-focused

---

### 💼 My Projects
- Custom solution client portal
- Project tracking & milestone management
- Direct communication with development team
- File sharing & deliverables
- Milestone-based payments (bank transfer or in-app)

**Important:**
- My Projects is a **separate independent app**, not a platform dashboard feature
- Located at: https://myprojects.alliedimpact.com
- Users can access directly OR via platform
- Only for clients with custom development contracts

---

## 5️⃣ Future Applications (Planned)

- Gov Cross Platform  
  (Government employees relocation & post swapping)
- eLearning
- eHR
- White-label SaaS products

These must:
- Follow platform rules
- Have independent pricing
- Be deployable independently

---

## 6️⃣ Identity, Access & Dashboard Flow

### V1 Dashboard Structure (Current State)

Allied iMpact provides **1 primary dashboard view** plus an admin view:

#### 1. Individual Dashboard (Default)
**For:** All authenticated users  
**Shows:** Product grid with all 6 apps, active subscriptions, quick access  
**Access:** All users see this by default  
**Apps Included:** Coin Box, Drive Master, CodeTech, Cup Final, uMkhanyakude, **My Projects**

**Note:** The Individual Dashboard shows all available apps. Users can click any app to either:
- Subscribe (if it's a subscription app)
- Access directly (if they already have access)
- Learn more (if it's coming soon)

#### 2. Admin Dashboard
**For:** Platform administrators only  
**Shows:** Platform analytics, user management, system monitoring  
**Access:** Users with ADMIN or SUPER_ADMIN archetype

### ViewSwitcher Behavior

The ViewSwitcher only appears for users with **admin access**:
- Regular users → Only see Individual Dashboard (no switcher)
- Admins → ViewSwitcher shows "Dashboard" ↔ "Admin"

### App-Specific Dashboards

Each app has its own dashboards **inside the app**, not on the platform:
- **Coin Box** → Wallet dashboard, investments, loans, crypto trading
- **Drive Master** → Learner progress, lessons, test prep
- **CodeTech** → Coding courses, certificates, projects
- **Cup Final** → Fan engagement, team stats, voting
- **uMkhanyakude** → School information, community features
- **My Projects** → Project tracking, milestones, deliverables, tickets

The platform only tracks **authentication and entitlements** - each app controls its own features.

### User Flow

1. User registers once on Allied iMpact platform
2. Lands on Individual Dashboard (sees all 6 apps)
3. Subscribes to apps OR accesses custom solutions
4. Active subscriptions are highlighted in product grid
5. Clicking an app routes securely into it (with SSO)
6. User experiences app-specific features inside the app

**Example:** A client with a My Projects contract:
- Logs into platform → sees product grid with My Projects
- Can access My Projects directly at myprojects.alliedimpact.com
- OR click "Launch My Projects" from platform dashboard
- Either way, they're redirected to the My Projects app with SSO

Apps never bypass platform authentication.

---

## 7️⃣ Rules for Development (Critical)

- One repo
- One platform
- Many apps
- No duplicate auth
- No shared app databases
- No cross-app logic leakage

When unsure:
> **Stop. Analyze. Ask. Document.**

---

## 8️⃣ How Copilot Should Work in This Repo

Copilot must:
- Read `README.md` first
- Then read this document
- Then read the app-level README
- Propose changes before implementing
- Never assume greenfield

---

## 9️⃣ Final Note

Allied iMpact is:
- A product company
- A platform company
- A software development company

Every app we build:
- Generates revenue
- Proves capability
- Can be sold, customized, or scaled

This document exists to **protect the vision while enabling growth**.

---

_Allied iMpact is not a single app.  
It is an ecosystem._ 🌍
