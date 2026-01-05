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

Allied iMpact provides **2 primary dashboards** for users:

#### 1. Individual Dashboard
**For:** Anyone who subscribes to our apps  
**Shows:** Product grid, active subscriptions, quick access to apps  
**Access:** All authenticated users (default)  
**Apps Included:** Coin Box, Drive Master, CodeTech, Cup Final, uMkhanyakude

#### 2. My Projects Dashboard  
**For:** Anyone getting a custom solution (web development, custom software, etc.)  
**Shows:** Project tracking, milestones, deliverables, support tickets  
**Access:** Granted when custom project/contract is signed  
**Clients Can Be:** NGO, school, government, business, individual - doesn't matter

**Note:** Organizations aren't separate dashboard types - an NGO, school, or business getting a custom solution all use the same My Projects Dashboard to track their work.

#### 3. Admin Dashboard
**For:** Platform administrators only  
**Shows:** Platform analytics, user management, system monitoring

### ViewSwitcher Behavior

Users only see the ViewSwitcher if they have **multiple dashboard types**:
- Regular app user → Only Individual Dashboard (no switcher)
- Custom client → Only My Projects Dashboard (no switcher)  
- User with both → ViewSwitcher appears with both options
- Admin → ViewSwitcher shows Individual + Admin (or all 3 if they have projects)

### Other Dashboard Types

**Learner, Investor, Sponsor dashboards** exist in their **respective apps**, not on the Allied iMpact platform:
- **Learner dashboards** → Inside Drive Master and CodeTech apps
- **Investor/Sponsor dashboards** → Inside Cup Final and uMkhanyakude apps (when those features launch)

The platform tracks WHO they are (via archetypes), but their specialized dashboards live in the apps that serve them.

### User Flow

1. User registers once on Allied iMpact
2. Lands on Individual Dashboard (sees all available apps)
3. Subscribes to apps they want
4. Active apps are highlighted
5. Clicking an app routes securely into it
6. If user gets a custom project → My Projects Dashboard appears in ViewSwitcher

Apps never bypass the platform guard.

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
