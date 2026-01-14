# @allied-impact/ui

Shared UI components for the Allied iMpact platform.

## Purpose

This package contains **dumb, reusable UI components** that are:
- ✅ Purely visual (no business logic)
- ✅ Data-agnostic (receive data via props)
- ✅ Consistent across all apps (CoinBox, EduTech, CareerBox, etc.)
- ✅ Free of authentication, permissions, or data fetching

## Usage

```tsx
import { Button, Card, CardHeader, CardTitle } from '@allied-impact/ui';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello World</CardTitle>
      </CardHeader>
      <Button onClick={() => console.log('clicked')}>
        Click Me
      </Button>
    </Card>
  );
}
```

## Available Components

### Layout (Coming in Phase 2)
- `Header` - Public header component
- `Footer` - Footer with 4-column grid
- `DashboardLayout` - Standard dashboard wrapper
- `Logo` - Brand logo

### Atoms
- ✅ `Button` - Primary, secondary, outline, ghost variants
- ✅ `Card` - Card with header, content, footer
- 🔄 `Input` - Text input with consistent styling
- 🔄 `Badge` - Status badges
- 🔄 `Label` - Form labels

### Molecules (Coming Soon)
- `Alert` - Alerts and notifications
- `EmptyState` - Empty state placeholders
- `Skeleton` - Loading skeletons
- `Toast` - Toast notifications
- `Tooltip` - Tooltips

### Data Display (Coming Soon)
- `Table` - Data tables with sorting/pagination
- `Pagination` - Pagination controls
- `Chart` - Chart components

### Overlays (Coming Soon)
- `Dialog` - Modal dialogs
- `DropdownMenu` - Dropdown menus
- `Popover` - Popovers
- `Sheet` - Side sheets

## Critical Rules

### ❌ FORBIDDEN in Shared UI:
```tsx
// ❌ NO data fetching
const data = await fetch('/api/users');

// ❌ NO Firebase imports
import { getFirestore } from 'firebase/firestore';

// ❌ NO authentication checks
import { useAuth } from '@/contexts/AuthContext';

// ❌ NO permission checks
if (user.role === 'admin') { ... }

// ❌ NO business logic
function calculateLoanInterest() { ... }

// ❌ NO imports from apps
import { UserService } from 'apps/coinbox/services';
```

### ✅ CORRECT Patterns:
```tsx
// ✅ Receive data via props
interface TableProps {
  data: any[];
  onRowClick: (row: any) => void;
}

// ✅ Accept callbacks for actions
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

// ✅ Pure visual styling
const Button = ({ variant, size, children }) => {
  // Only styling logic here
};
```

## Component Checklist

Before adding a component to this package, verify:

- [ ] Is this purely visual?
- [ ] Can it work with ANY app's data?
- [ ] Does it receive all data via props?
- [ ] Is it free of business logic?
- [ ] Is it free of data fetching?
- [ ] Is it free of auth/permission checks?
- [ ] Would a competitor understand it without context?

If any answer is "no", the component belongs in the app, not here.

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Run tests
pnpm test

# Lint
pnpm lint
```

## Reference App

Components are extracted from **CoinBox** (apps/coinbox), which serves as the visual reference for the Allied iMpact platform.

## Architecture

```
packages/ui/
├── src/
│   ├── atoms/         # Simple components (Button, Input)
│   ├── molecules/     # Compound components (Card, Alert)
│   ├── layout/        # Layout components (Header, Footer)
│   ├── data/          # Data display (Table, Chart)
│   ├── overlays/      # Modals, dropdowns, sheets
│   ├── forms/         # Form components (visual only)
│   ├── loading/       # Loading states
│   ├── utils.ts       # Utility functions (cn)
│   └── index.ts       # Public exports
├── package.json
├── tsconfig.json
└── README.md
```

## Contribution Guidelines

1. **Extract, don't create** - Components should be extracted from CoinBox
2. **Remove logic** - Strip out all business logic during extraction
3. **Add props** - Convert data fetching to prop interfaces
4. **Document usage** - Add examples to component files
5. **Test isolation** - Ensure component works standalone

## Phase 2 Progress

Current status of component extraction:

- ✅ Button (Phase 1)
- ✅ Card (Phase 1)
- ✅ Alert (Phase 1)
- 🔄 Layout components (In Progress)
- ⏳ Table, Dialog, Tooltip (Planned)

Legend: ✅ Complete | 🔄 In Progress | ⏳ Planned
