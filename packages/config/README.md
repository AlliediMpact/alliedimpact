# @allied-impact/config

Design tokens and configuration for the Allied iMpact platform.

## Purpose

This package contains:
- **Design Tokens**: Colors, typography, spacing, shadows (extracted from CoinBox)
- **Tailwind Config Generator**: Generates consistent Tailwind configuration
- **ESLint Rules**: Enforces architectural boundaries

## Usage

### In App's Tailwind Config

```typescript
// apps/yourapp/tailwind.config.ts
import { generateTailwindConfig } from '@allied-impact/config/tailwind';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  ...generateTailwindConfig(),
  // App-specific extensions (rare, avoid if possible)
};
```

### Accessing Design Tokens

```typescript
import { tokens, colors, spacing } from '@allied-impact/config';

// Use tokens in your code
const primaryColor = colors.primary.DEFAULT; // #193281
const cardShadow = tokens.shadows.card;
```

### ESLint Configuration

```javascript
// apps/yourapp/.eslintrc.js
module.exports = {
  extends: ['@allied-impact/config/eslint-preset'],
  // App-specific rules
};
```

## Design Tokens Reference

### Colors

```typescript
colors.primary.DEFAULT  // #193281 (Deep Blue)
colors.primary.purple   // #5e17eb (Vibrant Purple)
colors.accent.DEFAULT   // #5e17eb
colors.status.success   // #10B981
colors.status.warning   // #F59E0B
colors.status.error     // #EF4444
```

### Typography

```typescript
fontSize.h1  // 2.25rem (36px)
fontSize.h2  // 1.75rem (28px)
fontSize.h3  // 1.375rem (22px) - CoinBox standard
fontSize.h4  // 1.125rem (18px) - CoinBox standard
```

### Spacing

```typescript
spacing.xs   // 0.25rem (4px)
spacing.sm   // 0.5rem (8px)
spacing.md   // 1rem (16px)
spacing.lg   // 1.5rem (24px)
spacing.xl   // 2rem (32px)
```

## Critical Rules

### ❌ DO NOT:
- Override design tokens in apps (breaks consistency)
- Import business logic or services
- Add app-specific values here

### ✅ DO:
- Use these tokens consistently across all apps
- Propose changes via pull request if tokens need updating
- Document any additions clearly

## Architecture Guardrails

This package enforces:
1. **No cross-app imports** - Apps remain independent
2. **No business logic in shared UI** - Components are data-agnostic
3. **No Firebase/auth in shared code** - Pass data via props

Violations will cause ESLint errors and build failures.

## Reference App

Design tokens are extracted from **CoinBox** (apps/coinbox), which serves as the visual reference for the Allied iMpact platform.

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Clean build artifacts
pnpm clean
```

## Maintenance

When updating design tokens:
1. Verify change is platform-wide (not app-specific)
2. Update this README with new values
3. Test in at least 2 apps before committing
4. Document breaking changes clearly
