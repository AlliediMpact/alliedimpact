🚀 COPILOT GUIDELINES — CREATIVE MODE (UI/UX CENTRIC)
For the Allied iMpact CoinBox Application — Next.js + Firebase
🔥 1. GENERAL PRINCIPLES

Copilot must follow these rules at all times:

Never break the existing business logic or Firebase integration.

Analyze the entire file BEFORE making any edits.

When a change is needed, summarize the fix FIRST, then apply it.

Do not remove or rename core functions, hooks, or pages unless the user approves.

Preserve routing, folder structure, and component imports.

All new UI elements must be mobile-first and match the crypto-themed aesthetic.

Never introduce blocking or long-running logic on the client.

Use React best practices (hooks, controlled components, avoiding rerender loops).

Confirm the existence of a component/page before creating a new one.

All async code must catch errors and log them with clear context.

🎨 2. UI/UX RULES

Copilot must always:

Prefer clean, minimal, bold crypto UI (Betway-style layout + gradients).

Use shadcn/ui, Tailwind, and reusable components.

Maintain consistent spacing, 8px grid.

Buttons: Full-width on mobile, minimal width on desktop.

Use hover / focus animations (scale, fade, shadow).

Avoid clutter; group related elements into cards or sections.

Make forms step-by-step, guided, and user-friendly.

All pages must have consistent header and footer behavior.

Respect the brand theme: neon accents, purple/blue gradients, glassmorphism.

Use responsive containers (max-w-7xl mx-auto px-4) for content.

🔐 3. AUTH & FIREBASE RULES

Copilot must:

Use the existing Firebase client instance (firebase.ts).

Avoid creating multiple Firebase apps or duplicate initializers.

Validate authentication state using existing context only.

Avoid SSR Firebase calls unless explicitly approved.

Never expose API keys or write admin-level Firestore rules in the client.

Ensure Firestore queries use proper try/catch and loading states.

For public pages: use ONLY collections permitted by Firestore rules.

When adding Firestore reads: prefer lightweight, indexed queries.

Do not modify firebase.config.js structure without approval.

Always keep Firestore reads compatible with deployed security rules.

🧭 4. ROUTING RULES (NEXT.JS)

Copilot must:

Keep App Router structure (/app/<page>/page.tsx).

Never remove or change existing routes without confirmation.

Ensure all <Link> components use Next.js <Link> properly.

Ensure all buttons redirect using router.push() correctly.

Confirm that the target page exists before linking to it.

If a route is missing, suggest creating it with a clean, empty scaffold.

Never break the layout (layout.tsx) or root providers.

Ensure client components have "use client" if they use hooks.

⚙️ 5. COMPONENT & CODE QUALITY RULES

Copilot must:

Keep components small, focused, and reusable.

Follow naming conventions:

Components: PascalCase.jsx/tsx

Hooks: useSomething.ts

Firebase utilities: firebaseXYZ.ts

Do NOT move files across folders without approval.

Avoid complex nested inline CSS; use Tailwind instead.

Avoid using any and enforce proper TypeScript types.

Remove dead code, unused imports, and console logs (only keep useful ones).

When refactoring, maintain the same behavior unless improvement is requested.

🧪 6. DEBUGGING & FIXING RULES

Copilot must:

Always check console warnings and errors before applying fixes.

Log helpful debug messages like:
console.error("[Auth Error]: ...")

Avoid silent failures.

Run through the login → dashboard → pages workflow after each fix.

Never break signup, login, logout, routing, or session persistence.

If a function is failing, analyze its dependencies BEFORE editing.

If something loads forever, check:

missing awaits

blocked promises

conditional logic loops

missing dependency arrays

Confirm reducers and context providers are stable and clean.

💡 7. UI/UX CREATIVE GUIDELINES (ENHANCED MODE)

Copilot is allowed to be creative BUT must follow:

Use modern coin/crypto visual styles (subtle neon).

Homepage must be simple, bold, and high-conversion.

Forms should use multi-step wizard forms when appropriate.

Support “flipping form” design if requested.

Modals/popups must be accessible and mobile-first.

Use icons from Lucide.

Add micro-interactions:

fade-in

scale

slide transitions

Avoid animation spam — keep it subtle.

🏛️ 8. ANTI-DESTRUCTION RULES

Copilot must NEVER:

Delete Firebase integration code.

Replace Firestore queries with incompatible logic.

Introduce new auth methods without approval.

Remove environment variables.

Break the signup or login workflow.

Change the structure of app folders without approval.

Add server components that block rendering.

Overwrite business logic functions.

Replace custom hooks with new versions unless identical behavior is kept.

📘 9. WHEN ADDING NEW FILES

Copilot must:

Place components inside /components/ unless they are page-specific.

Place Firebase helpers in /lib/ or /firebase/.

Place reusable UI components in /components/ui/.

Place new routes in app/<route>/page.tsx.

Always check for duplicates before creating new files.

🚀 10. WORKFLOW FOR EACH REQUEST

Copilot must follow this exact sequence:

Analyze the repo, file structure, and affected files.

Locate the component/page with the issue.

Explain the problem in human language.

Propose a safe fix.

Wait for approval from the user.

Then apply the changes.

Validate behavior end-to-end.

Do NOT create side effects or modify unrelated files.

🎯 11. GOAL OF THESE GUIDELINES

To ensure Copilot:

builds stable,

beautiful,

modern,

professional

mobile-first UI/UX

…WITHOUT breaking Firestore, Auth, routing, or business logic.