# 🧠 Allied iMpact – Platform Model

## Purpose of This Document
This document defines **how the Allied iMpact platform should be understood and reasoned about**.

It is NOT a technical specification.
It is a **conceptual and strategic model** used by:
- Founders
- Developers
- Architects
- AI assistants (Copilot)

Any architecture or code must align with this model.

---

## 1. What Allied iMpact Is

Allied iMpact is a **multi-sector digital impact platform** that delivers value through:

1. Ready-made digital products (subscription or usage-based)
2. Sponsored & impact-driven solutions (schools, youth, NGOs)
3. Custom-built platforms and licensed IP (clients & institutions)

It is NOT just a SaaS app marketplace.

---

## 2. User Archetypes (Core)

Every authenticated user fits into **one or more archetypes**:

| Archetype | Description |
|---------|-------------|
| Individual User | Uses consumer apps (e.g. Coin Box) |
| Learner / Youth | Uses education or sports platforms |
| Investor / Sponsor | Funds impact or revenue initiatives |
| NGO / Institution | Uses sponsored or subsidized solutions |
| Custom Dev Client | Pays for bespoke platforms |
| Admin | Manages users, entitlements, billing |
| Super Admin | Full platform control |

A single user account may span multiple archetypes.

---

## 3. Product Categories (Very Important)

All products fall into **one of three categories**:

### A. Subscription Products
Examples:
- Coin Box
- Drive Master
- CodeTech

Characteristics:
- Paid subscriptions or usage-based
- Individual user access
- Managed via billing + entitlements

---

### B. Impact / Sponsored Products
Examples:
- uMkhanyakude (schools)
- Youth development initiatives
- Community sports programs

Characteristics:
- Often free to end user
- Access granted via:
  - Sponsorship
  - Grants
  - Institutional agreements
- NOT always tied to billing

---

### C. Custom / Project-Based Solutions
Examples:
- Client-specific platforms
- Licensed IP
- Managed solutions

Characteristics:
- Contract-based
- Milestone-driven
- Access tied to project lifecycle
- Not subscription-first

---

## 4. Entitlements Model

Access to apps is determined by **entitlements**, not hard-coded logic.

Entitlements can be:
- Paid (subscription)
- Sponsored
- Role-based
- Time-based
- Project-based

Billing MAY create entitlements.
Billing is NOT required for all entitlements.

---

## 5. Dashboard Philosophy

The Allied iMpact Dashboard is a **universal control center**, not just an app launcher.

Key principles:
- One dashboard codebase
- Role-aware rendering
- Context-aware sections
- Clear separation between:
  - Apps
  - Projects
  - Impact initiatives

The dashboard adapts to:
- Who the user is
- What they have access to
- Why they are on the platform

---

## 6. Non-Negotiable Rules

1. Coin Box must never be rewritten
2. No duplicated logic across apps
3. Platform services are shared, apps are isolated
4. Impact initiatives are NOT forced into subscription logic
5. Architecture decisions must scale across sectors

---

## 7. How AI Assistants Must Operate

Before proposing or generating code:
1. Analyze the existing codebase
2. Read README.md
3. Read PLATFORM_AND_PRODUCTS.md
4. Read this document
5. Propose changes before writing code
6. Avoid duplication at all costs

---

**This model is authoritative.**
Any deviation must be explicitly approved.
