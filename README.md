# 🏢 Allied iMpact

> **One Identity. Multiple Products. Built for Scale.**

Allied iMpact is a **multi-product digital platform and software development company** that builds, operates, and scales independent applications under a **single identity and shared platform foundation**.

This repository is the **single source of truth** for all Allied iMpact-owned applications.

---

## 🌍 What We Are Building

Allied iMpact operates on **two parallel tracks**:

1. **Our Own Products**  
   Revenue-generating platforms (e.g. Coin Box, Drive Master)

2. **Client Solutions & Services**  
   Custom-built software, apps, and digital platforms for businesses, NGOs, and government

Both tracks share the **same engineering standards**, **design philosophy**, and **platform foundation**.

---

## 🧠 Platform Philosophy

These principles are **non-negotiable**:

1. **Single Identity**
   - One user account across all Allied iMpact applications
   - Central authentication & entitlement checks

2. **Product Independence**
   - Each app has its own rules, pricing, limits, and lifecycle
   - No app may depend on another app’s internal logic

3. **Zero Rewrites**
   - Existing production systems (especially Coin Box) must never be rewritten
   - New systems may reference, but not modify, existing ones

4. **Scalable by Design**
   - Every app must be able to scale independently
   - Failure in one app must never impact others

---

## 🧩 Platform Structure (High Level)

alliedimpact/
├── platform/ # Shared services (auth, billing, routing)
├── apps/ # Independent applications
│ ├── coinbox/
│ ├── drive-master/
│ ├── codetech/
│ ├── cup-final/
│ └── umkhanyakude/
├── web/ # Allied iMpact main website & dashboard
├── docs/ # Platform & product documentation
└── shared/ # Shared utilities (no business logic)

yaml
Copy code

---

## 🔐 Identity & Access Model

- Users register **once**
- After login, users land on the **Allied iMpact Dashboard**
- Each app:
  - Requires its own subscription (if applicable)
  - Has its own access rules
- Active apps appear **highlighted** on the dashboard

---

## 🚀 Development Rules (Must Follow)

- ❌ Do NOT duplicate existing features
- ❌ Do NOT create new auth systems per app
- ❌ Do NOT modify Coin Box core logic
- ✅ Reuse platform services where applicable
- ✅ Always document decisions
- ✅ Always check existing structure before coding

---

## 📚 Documentation Guide

| File | Purpose |
|-----|--------|
| `README.md` | Platform overview (this file) |
| `docs/MASTER_IMPLEMENTATION_PLAN.md` | **Current development plan** ⭐ |
| `docs/PLATFORM_AND_PRODUCTS.md` | Deep explanation of platform & apps |
| `docs/ALLIED_IMPACT_PLATFORM_MODEL.md` | Conceptual & strategic model |
| `apps/*/README.md` | App-specific rules & logic |

---

## 🛠️ Tech Stack (Standard)

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Hosting**: Vercel (apps), Firebase (backend)
- **Payments**: Stripe / Paystack (per app)
- **Monorepo**: PNPM workspaces

---

## 📌 Important Note for AI / Copilot

> This repository contains **existing production systems**.
>
> Always:
> - Analyze before implementing
> - Reuse before creating
> - Extend instead of rewriting
> - Respect app boundaries

---

_Allied iMpact is a long-term platform.  
We build once. We scale forever._ 🚀