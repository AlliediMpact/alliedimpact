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

## 2. User Archetypes (Core Concept)

**Important:** Archetypes are LABELS that describe who a user is or what they're doing. They are NOT separate dashboard types.

### Platform Archetypes (Managed by Allied iMpact)

| Archetype | Description | Dashboard |
|---------|-------------|-----------|
| **INDIVIDUAL** | Uses consumer apps (Coin Box, Drive Master, CodeTech, etc.) | Individual Dashboard |
| **MY_PROJECTS** | Has a custom solution project (web dev, custom software, etc.) - Can be NGO, school, gov, business, or individual | My Projects Dashboard |
| **ADMIN** | Manages users, entitlements, billing | Admin Dashboard |
| **SUPER_ADMIN** | Full platform control | Admin Dashboard |

### App-Specific Archetypes (Managed by Individual Apps)

These archetypes are tracked on the platform but their dashboards live in the apps:

| Archetype | Managed By | Dashboard Location |
|---------|------------|-------------------|
| **Learner** | Drive Master, CodeTech | Inside the learning app |
| **Investor** | Cup Final, uMkhanyakude | Inside the app with investment features |
| **Sponsor** | Cup Final, uMkhanyakude | Inside the app with sponsorship features |

**Example:** A school principal might have multiple archetypes:
- `INDIVIDUAL` → Subscribed to Coin Box (personal use)
- `MY_PROJECTS` → School website project (custom solution client)
- `Learner` → Taking courses in Drive Master (sees learner dashboard inside Drive Master)

The platform shows them the Individual Dashboard and My Projects Dashboard. When they enter Drive Master, they see their Learner dashboard inside that app.

### Key Insight

**The platform provides 2 dashboards:**
1. Individual Dashboard (for app subscribers)
2. My Projects Dashboard (for custom solution clients)

**Each app provides its own specialized dashboards** for Learners, Investors, Sponsors, etc.

A single user account may span multiple archetypes across both platform and apps.

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
