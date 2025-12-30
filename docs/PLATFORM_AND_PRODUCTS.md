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

1. User registers once
2. Lands on Allied iMpact Dashboard
3. Sees all available apps
4. Subscribes per app
5. Active apps are highlighted
6. Clicking an app routes securely into it

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
