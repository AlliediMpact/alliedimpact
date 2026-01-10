# 🛠️ CareerBox - Development Guide

> **Comprehensive guide for developers working on CareerBox**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Code Organization](#code-organization)
4. [Development Workflows](#development-workflows)
5. [Testing Strategy](#testing-strategy)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Contributing](#contributing)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js:** 20+ (LTS recommended)
- **pnpm:** 8+ (package manager)
- **Git:** Latest version
- **VS Code:** Recommended IDE
- **Firebase CLI:** For deployment

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd alliedimpact/apps/careerbox

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

### Environment Variables

Create `.env.local` with the following:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3006
NEXT_PUBLIC_APP_NAME=CareerBox

# Firebase Configuration (for production)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true
```

---

## 💻 Development Environment

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### VS Code Settings

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Development Commands

```bash
# Start development server (port 3006)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Type check
pnpm type-check

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Clean build artifacts
pnpm clean
```

---

## 📁 Code Organization

### Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Landing page
│   │   ├── auth/                 # Authentication pages
│   │   ├── dashboard/            # Dashboard routes
│   │   │   └── [userType]/       # Role-based dashboards
│   │   │       ├── matches/      # Job matches
│   │   │       ├── applications/ # Applications
│   │   │       ├── listings/     # Job listings
│   │   │       ├── applicants/   # Applicant management
│   │   │       ├── saved-jobs/   # Bookmarked jobs
│   │   │       ├── profile-views/# Analytics
│   │   │       ├── analytics/    # Dashboard analytics
│   │   │       ├── job-alerts/   # Alert management
│   │   │       ├── resume-builder/# Resume tool
│   │   │       ├── messages/     # Messaging
│   │   │       └── settings/     # User settings
│   │   ├── search/               # Global search
│   │   └── profile/              # Profile management
│   └── api/                      # API routes
│       └── ...                   # Future endpoints
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── reviews/                  # Review components
│   │   └── company-reviews.tsx
│   ├── interviews/               # Scheduling components
│   │   └── interview-scheduler.tsx
│   ├── layout/                   # Layout components
│   └── shared/                   # Shared components
│
├── lib/                          # Utility functions
│   ├── utils.ts                  # Common utilities
│   ├── firebase.ts               # Firebase config
│   └── ...
│
├── types/                        # TypeScript types
│   ├── index.ts                  # Global types
│   ├── job.ts                    # Job-related types
│   ├── user.ts                   # User types
│   └── ...
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useFirestore.ts
│   └── ...
│
└── styles/                       # Global styles
    └── globals.css               # Tailwind imports
```

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `JobCard.tsx`)
- Pages: `page.tsx` (Next.js convention)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `camelCase.ts` or `PascalCase.ts` (e.g., `job.ts`)

**Variables:**
- Components: `PascalCase` (e.g., `JobCard`)
- Functions: `camelCase` (e.g., `formatDate`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- Types/Interfaces: `PascalCase` (e.g., `User`, `JobListing`)

**CSS Classes:**
- Use Tailwind utility classes
- Custom classes: `kebab-case`

---

## 🔄 Development Workflows

### Creating a New Page

```bash
# 1. Create page file
mkdir -p src/app/[locale]/your-page
touch src/app/[locale]/your-page/page.tsx

# 2. Add page component
# src/app/[locale]/your-page/page.tsx
```

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Page | CareerBox',
  description: 'Page description',
};

export default function YourPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Your Page</h1>
    </div>
  );
}
```

### Creating a New Component

```tsx
// src/components/your-component.tsx
import { cn } from '@/lib/utils';

interface YourComponentProps {
  className?: string;
  // Add props
}

export function YourComponent({
  className,
  ...props
}: YourComponentProps) {
  return (
    <div className={cn('your-classes', className)} {...props}>
      {/* Component content */}
    </div>
  );
}
```

### Adding a New Feature

1. **Plan the feature**
   - Define requirements
   - Design UI/UX
   - Identify components needed
   - Plan data model

2. **Create types**
   ```typescript
   // src/types/your-feature.ts
   export interface YourFeature {
     id: string;
     // Add fields
   }
   ```

3. **Build components**
   - Start with UI components
   - Add business logic
   - Integrate with state management

4. **Add routing**
   - Create page files
   - Update navigation
   - Add metadata

5. **Write tests**
   - Unit tests for utilities
   - Component tests
   - Integration tests

6. **Document**
   - Update FEATURES.md
   - Add JSDoc comments
   - Update README if needed

---

## 🧪 Testing Strategy

### Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── utils/
│   └── hooks/
├── integration/             # Integration tests
│   ├── auth/
│   └── job-flow/
└── e2e/                     # End-to-end tests (future)
    └── critical-paths/
```

### Unit Testing

```typescript
// tests/unit/utils/formatDate.test.ts
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('January 15, 2024');
  });
});
```

### Component Testing

```typescript
// tests/unit/components/JobCard.test.tsx
import { render, screen } from '@testing-library/react';
import { JobCard } from '@/components/JobCard';

describe('JobCard', () => {
  const mockJob = {
    id: '1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: 'Remote',
  };

  it('renders job information', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });
});
```

### Testing Commands

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Run specific test file
pnpm test formatDate.test.ts
```

---

## ✅ Best Practices

### TypeScript

```typescript
// ✅ Good: Explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User | null {
  // Implementation
}

// ❌ Bad: Using 'any'
function getUser(id: any): any {
  // Don't do this
}
```

### React Components

```tsx
// ✅ Good: Functional component with TypeScript
import { FC } from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary'
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};

// ❌ Bad: Prop drilling, no types
export function Button(props) {
  return <button onClick={props.onClick}>{props.text}</button>;
}
```

### State Management

```tsx
// ✅ Good: Local state with proper typing
const [filters, setFilters] = useState<JobFilters>({
  type: 'all',
  location: '',
  salary: [0, 200000],
});

// Update specific filter
const updateFilter = (key: keyof JobFilters, value: any) => {
  setFilters(prev => ({ ...prev, [key]: value }));
};

// ❌ Bad: Multiple useState for related data
const [type, setType] = useState('all');
const [location, setLocation] = useState('');
const [minSalary, setMinSalary] = useState(0);
const [maxSalary, setMaxSalary] = useState(200000);
```

### API Calls

```typescript
// ✅ Good: Error handling and types
async function fetchJobs(filters: JobFilters): Promise<Job[]> {
  try {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

// ❌ Bad: No error handling
async function fetchJobs(filters) {
  const response = await fetch('/api/jobs');
  return await response.json();
}
```

### Styling with Tailwind

```tsx
// ✅ Good: Utility classes with cn helper
import { cn } from '@/lib/utils';

<div className={cn(
  'rounded-lg p-4',
  isActive && 'bg-blue-50 border-blue-500',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
  Content
</div>

// ❌ Bad: Inline styles
<div style={{
  borderRadius: '8px',
  padding: '16px',
  backgroundColor: isActive ? '#eff6ff' : 'white'
}}>
  Content
</div>
```

### Performance

```tsx
// ✅ Good: Memoization for expensive computations
import { useMemo } from 'react';

const filteredJobs = useMemo(() => {
  return jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [jobs, searchTerm]);

// ✅ Good: Callback memoization
import { useCallback } from 'react';

const handleSave = useCallback((jobId: string) => {
  saveJob(jobId);
}, [saveJob]);

// ❌ Bad: Recreating functions on every render
const handleSave = (jobId: string) => {
  saveJob(jobId);
};
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Port 3006 already in use**
```bash
# Solution 1: Kill the process
# Windows
netstat -ano | findstr :3006
taskkill /PID <PID> /F

# Solution 2: Use different port
pnpm dev -- -p 3007
```

**Issue: TypeScript errors after pulling**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

**Issue: Build fails with module not found**
```bash
# Solution: Check imports and clean cache
pnpm clean
rm -rf .next
pnpm build
```

**Issue: Tailwind styles not applying**
```bash
# Solution: Restart dev server and clear cache
# Stop server (Ctrl+C)
rm -rf .next
pnpm dev
```

### Debug Mode

```typescript
// Enable debug logging
if (process.env.NODE_ENV === 'development') {
  console.log('[DEBUG]', data);
}

// Use React DevTools for component inspection
// Install: https://react.dev/learn/react-developer-tools
```

---

## 🤝 Contributing

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "feat: add your feature"

# 3. Push to remote
git push origin feature/your-feature-name

# 4. Create pull request
# Use GitHub/GitLab UI
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(search): add salary range filter
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
refactor(components): extract JobCard logic
test(jobs): add unit tests for job filtering
chore(deps): update dependencies
```

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] TypeScript types are properly defined
- [ ] Components are properly tested
- [ ] No console errors or warnings
- [ ] Mobile responsive verified
- [ ] Accessibility considered
- [ ] Documentation updated
- [ ] Commit messages follow convention

---

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Firebase Documentation](https://firebase.google.com/docs)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools) (if using Redux)
- [Postman](https://www.postman.com/) (API testing)

---

**Happy Coding! 🚀**

If you have questions or need help, reach out to the team or create an issue in the repository.
