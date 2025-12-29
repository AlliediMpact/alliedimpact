🔧 GLOBAL COPILOT INSTRUCTIONS

Copilot must follow these rules when generating, modifying, or analyzing code or documentation for the Allied iMpact Coin Box P2P Platform.

1️⃣ PROJECT CONTEXT — WHAT WE ARE BUILDING

The project is a complete P2P financial platform with:

🔥 Core Modules

P2P Crypto Trading

P2P Stablecoin Trading

P2P Loans (Borrow / Lend)

Escrow + Smart Matching

Membership Tiers with Trading / Loan Limits

Wallet System (Deposit, Withdraw, Transfer, History)

🎨 Stack

Next.js (App Router)

React + TypeScript

Tailwind CSS + ShadCN UI

Node.js backend

Supabase (preferred) or PostgreSQL

Prisma ORM

Zod for validation

NextAuth for authentication

2️⃣ FRONTEND RULES

When generating UI/UX or components:

General UI Rules

Always use:

TailwindCSS

ShadCN UI components

Responsive layout (mobile-first)

Keep UI clean, minimal, fintech-style

Include loading states, empty states, and error states

Use Framer Motion for micro animations (where reasonable)

Component Structure

Copilot must always produce:

- Component
- Props definition
- UI layout
- Minimal logic

State Management

Use:

React hooks first

Zustand when global state is required

3️⃣ BACKEND / API RULES

Backend must follow:

API Style

Use REST (Next.js API Route Handlers)

Always validate inputs with Zod

Always secure routes with middleware + JWT or NextAuth Session

Database

Always use Prisma

Migrations must be clean and descriptive

Error Handling

Return object:

{
  success: false,
  error: "Human readable message",
  code: "ERROR_CODE"
}

Logging

Use:

console.error("[MODULE] Message:", error);

4️⃣ P2P PLATFORM RULES

Copilot must follow these business rules unless explicitly overridden.

Membership Tiers

Membership tiers determine:

Daily trade limits

Loan caps

Fees

Never modify fee structure automatically.

Trade Rules

All trades go through escrow

Enforce:

Payment timeouts

Auto-cancel rules

Fee deduction rules

Loan Rules

Loan contracts must:

Include repayment date

Include collateral options

Include penalty rules

Escrow must release only after repayment confirmation.

5️⃣ DOCUMENTATION RULES

When Copilot modifies or creates documentation:

Documentation must:

Be clear

Be structured

Be technical but understandable

Be suitable for onboarding new developers

Use these sections in docs:

Overview

Features

Architecture

Folder Structure

Databases & Tables

APIs

Frontend Components

Business Rules

Membership Tiers

Development Guidelines

Deployment

Never create duplicated documentation

If two documents have overlapping content → consolidate into one.

6️⃣ DELETE RULES

Copilot is allowed to delete files that are:

Duplicated

Deprecated

Placeholder folders

Old specs not used anymore

Old mockups/scripts not related to the new direction

Copilot must:

Tell us which file is being deleted

Give a reason

Suggest where the updated information is stored

7️⃣ README RULES

When Copilot updates the main README.md, it must include:

Mandatory Sections

Product Summary

Tech Stack

System Architecture Diagram (Mermaid)

Folder Structure

How to Run the Project

How To Contribute

API Quick Reference

Membership Tiers & Trading Limits

P2P Workflow (Trade + Loan)

Roadmap

Tone

Professional

Friendly

Clear

Short paragraphs

8️⃣ PROMPT QUALITY RULES

When Copilot receives an unclear instruction:

It must ask follow-up questions first

When generating code:

Use type-safe patterns

Avoid unnecessary packages

Follow project conventions