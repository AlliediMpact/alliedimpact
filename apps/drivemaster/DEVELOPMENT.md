# 🛠️ DriveMaster - Development Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Structure](#code-structure)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Git Workflow](#git-workflow)
7. [Debugging](#debugging)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

---

## Getting Started

### Prerequisites

**Required:**
- Node.js 18.17+ or 20.10+
- pnpm 8.0+ (install: `npm install -g pnpm`)
- Git 2.35+
- Firebase CLI (install: `npm install -g firebase-tools`)
- VS Code (recommended) or any modern IDE

**Recommended VS Code Extensions:**
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
- TypeScript Vue Plugin (Volar) for better TypeScript support
- GitLens for enhanced Git features
- Error Lens for inline error highlighting

### Initial Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd alliedimpact/apps/drive-master

# 2. Install dependencies
pnpm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Configure environment variables (see .env.local section below)
# Edit .env.local with your Firebase and API keys

# 5. Start development server
pnpm dev

# 6. Open browser
# Navigate to http://localhost:3000
```

### Environment Variables

Create `.env.local` in the project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=drivemaster-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=drivemaster-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=drivemaster-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123

# Firebase Admin SDK (Server-side)
FIREBASE_ADMIN_PROJECT_ID=drivemaster-prod
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xyz@drivemaster-prod.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# SendGrid Email Service
SENDGRID_API_KEY=SG.abcdef123456
SENDGRID_FROM_EMAIL=noreply@drivemaster.co.za
SENDGRID_FROM_NAME=DriveMaster

# PayFast Payment Gateway
NEXT_PUBLIC_PAYFAST_MERCHANT_ID=10000100
NEXT_PUBLIC_PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=YourSecurePassphrase123
NEXT_PUBLIC_PAYFAST_SANDBOX=true  # false for production

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
SENTRY_AUTH_TOKEN=sntrys_abc123def456
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=drivemaster

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Admin Configuration
ADMIN_EMAIL=admin@drivemaster.co.za
ADMIN_UID=firebase_uid_of_admin_user

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ABC123XYZ
```

**Important:**
- Never commit `.env.local` to Git
- Use different Firebase projects for dev/staging/prod
- Keep PayFast in sandbox mode during development
- Rotate API keys regularly

---

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Start development server
pnpm dev

# 4. Make changes
# Edit files, test in browser

# 5. Run tests
pnpm test

# 6. Lint and format
pnpm lint
pnpm format

# 7. Commit changes
git add .
git commit -m "feat: add your feature description"

# 8. Push to remote
git push origin feature/your-feature-name

# 9. Create pull request
# Use GitHub UI to create PR for review
```

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors automatically
pnpm format           # Format code with Prettier
pnpm type-check       # Run TypeScript compiler check

# Testing
pnpm test             # Run Jest tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report
pnpm test:e2e         # Run Playwright E2E tests (if configured)

# Firebase
firebase emulators:start    # Start Firebase emulators
firebase deploy             # Deploy to Firebase
firebase deploy --only functions  # Deploy only functions

# Utilities
pnpm clean            # Remove node_modules, .next, build artifacts
pnpm analyze          # Analyze bundle size
```

---

## Code Structure

### Directory Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth routes (login, register)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── layout.tsx      # Shared dashboard layout
│   │   ├── page.tsx        # Dashboard home
│   │   ├── admin/          # Admin-only pages
│   │   ├── certificates/   # Certificates management
│   │   ├── journeys/       # Journey browsing
│   │   ├── profile/        # User profile
│   │   └── schools/        # Driving schools
│   ├── api/                # API routes
│   │   ├── auth/           # Auth endpoints
│   │   ├── journeys/       # Journey endpoints
│   │   ├── payments/       # Payment webhooks
│   │   └── schools/        # School endpoints
│   ├── journey/[id]/       # Dynamic journey gameplay
│   │   └── page.tsx
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
│
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Dialog.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── layout/             # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── journey/            # Journey-specific components
│   │   ├── JourneyCard.tsx
│   │   ├── JourneyEvent.tsx
│   │   ├── JourneyProgress.tsx
│   │   └── ...
│   ├── admin/              # Admin components
│   │   ├── AdminCharts.tsx
│   │   ├── SchoolApproval.tsx
│   │   └── ...
│   └── shared/             # Shared components
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       └── ...
│
├── lib/                    # Core business logic
│   ├── firebase/           # Firebase configuration
│   │   ├── config.ts       # Firebase initialization
│   │   ├── admin.ts        # Admin SDK
│   │   └── analytics.ts    # Analytics tracking
│   ├── services/           # Service layer (data access)
│   │   ├── userService.ts
│   │   ├── journeyService.ts
│   │   ├── certificateService.ts
│   │   ├── schoolService.ts
│   │   └── subscriptionService.ts
│   ├── utils/              # Utility functions
│   │   ├── credits.ts
│   │   ├── validation.ts
│   │   ├── formatters.ts
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useJourney.ts
│   │   ├── useCredits.ts
│   │   └── ...
│   └── types/              # TypeScript types
│       ├── user.ts
│       ├── journey.ts
│       ├── certificate.ts
│       └── ...
│
├── styles/                 # Global styles
│   └── globals.css         # Tailwind + custom CSS
│
├── public/                 # Static assets
│   ├── images/
│   ├── icons/
│   └── certificates/
│
└── translations/           # i18n translations
    ├── en.json             # English
    └── af.json             # Afrikaans
```

### File Naming Conventions

- **Components:** PascalCase (`JourneyCard.tsx`)
- **Utilities:** camelCase (`formatDate.ts`)
- **Hooks:** camelCase with `use` prefix (`useAuth.ts`)
- **Services:** camelCase with `Service` suffix (`userService.ts`)
- **Types:** PascalCase (`UserProfile`, `Journey`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_CREDITS`)
- **API Routes:** kebab-case folders (`api/send-email/route.ts`)

---

## Coding Standards

### TypeScript Guidelines

**1. Always Define Types:**
```typescript
// ✅ Good
interface Journey {
  id: string;
  title: string;
  distance: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const journey: Journey = {
  id: '123',
  title: 'City Drive',
  distance: 12,
  difficulty: 'medium',
};

// ❌ Bad
const journey: any = {
  id: '123',
  title: 'City Drive',
  distance: 12,
  difficulty: 'medium',
};
```

**2. Use Type Guards:**
```typescript
// ✅ Good
function isJourney(obj: any): obj is Journey {
  return typeof obj?.id === 'string' && typeof obj?.title === 'string';
}

if (isJourney(data)) {
  console.log(data.title); // TypeScript knows this is a Journey
}

// ❌ Bad
if (data.id && data.title) {
  console.log((data as any).title);
}
```

**3. Avoid Type Assertions:**
```typescript
// ✅ Good
const element = document.querySelector<HTMLButtonElement>('#submit-btn');
if (element) {
  element.disabled = true;
}

// ❌ Bad
const element = document.querySelector('#submit-btn') as HTMLButtonElement;
element.disabled = true; // May throw if element is null
```

### React Best Practices

**1. Component Structure:**
```typescript
// ✅ Good
interface JourneyCardProps {
  journey: Journey;
  onStart: (id: string) => void;
}

export function JourneyCard({ journey, onStart }: JourneyCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    onStart(journey.id);
  };

  return (
    <div onMouseEnter={() => setIsHovered(true)}>
      <h3>{journey.title}</h3>
      <button onClick={handleClick}>Start</button>
    </div>
  );
}
```

**2. Use Composition Over Inheritance:**
```typescript
// ✅ Good
function Button({ children, variant = 'primary', ...props }) {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  );
}

function PrimaryButton({ children, ...props }) {
  return <Button variant="primary" {...props}>{children}</Button>;
}

// ❌ Bad (inheritance)
class Button extends React.Component { ... }
class PrimaryButton extends Button { ... }
```

**3. Custom Hooks for Logic Reuse:**
```typescript
// ✅ Good
function useJourney(journeyId: string) {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJourney(journeyId).then(setJourney).finally(() => setLoading(false));
  }, [journeyId]);

  return { journey, loading };
}

// Usage in multiple components
function JourneyPage({ id }: { id: string }) {
  const { journey, loading } = useJourney(id);
  if (loading) return <Spinner />;
  return <JourneyDetails journey={journey} />;
}
```

### Firestore Best Practices

**1. Use Service Layer:**
```typescript
// ✅ Good
// In services/journeyService.ts
export async function getJourney(id: string): Promise<Journey> {
  const doc = await getDoc(doc(db, 'journeys', id));
  if (!doc.exists()) throw new Error('Journey not found');
  return { id: doc.id, ...doc.data() } as Journey;
}

// In component
const journey = await getJourney(id);

// ❌ Bad (direct Firestore in component)
const doc = await getDoc(doc(db, 'journeys', id));
const journey = doc.data();
```

**2. Batch Operations:**
```typescript
// ✅ Good
const batch = writeBatch(db);
journeyIds.forEach(id => {
  const ref = doc(db, 'journeys', id);
  batch.update(ref, { viewCount: increment(1) });
});
await batch.commit();

// ❌ Bad
for (const id of journeyIds) {
  await updateDoc(doc(db, 'journeys', id), { viewCount: increment(1) });
}
```

**3. Use Transactions for Consistency:**
```typescript
// ✅ Good (credits deduction)
await runTransaction(db, async (transaction) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await transaction.get(userRef);
  const credits = userDoc.data()?.credits || 0;
  
  if (credits < 15) throw new Error('Insufficient credits');
  
  transaction.update(userRef, { credits: credits - 15 });
  transaction.set(doc(db, 'journey_attempts', attemptId), attemptData);
});
```

### Styling Guidelines

**1. Use Tailwind Classes:**
```tsx
// ✅ Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h3 className="text-lg font-semibold text-gray-900">Title</h3>
  <button className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
    Click Me
  </button>
</div>

// ❌ Bad (inline styles)
<div style={{ display: 'flex', padding: '16px', backgroundColor: 'white' }}>
  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Title</h3>
</div>
```

**2. Extract Repeated Classes:**
```tsx
// ✅ Good
const cardStyles = "p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow";

<div className={cardStyles}>Content 1</div>
<div className={cardStyles}>Content 2</div>

// Or use @apply in CSS
// globals.css
.card {
  @apply p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow;
}
```

**3. Responsive Design:**
```tsx
// ✅ Good (mobile-first)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
</div>

<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  {/* Responsive text: 2xl on mobile, 3xl on tablet, 4xl on desktop */}
</h1>
```

---

## Testing

### Jest Unit Tests

**Test Structure:**
```typescript
// __tests__/services/journeyService.test.ts
import { getJourney, createJourneyAttempt } from '@/lib/services/journeyService';
import { db } from '@/lib/firebase/config';

// Mock Firebase
jest.mock('@/lib/firebase/config', () => ({
  db: mockFirestore,
}));

describe('journeyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getJourney', () => {
    it('should fetch journey by ID', async () => {
      const mockJourney = { id: '123', title: 'Test Journey' };
      mockFirestore.getDoc.mockResolvedValue({ exists: () => true, data: () => mockJourney });

      const result = await getJourney('123');

      expect(result).toEqual(mockJourney);
      expect(mockFirestore.getDoc).toHaveBeenCalledWith(expect.anything());
    });

    it('should throw error if journey not found', async () => {
      mockFirestore.getDoc.mockResolvedValue({ exists: () => false });

      await expect(getJourney('invalid')).rejects.toThrow('Journey not found');
    });
  });
});
```

**Component Tests:**
```typescript
// __tests__/components/JourneyCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import JourneyCard from '@/components/journey/JourneyCard';

describe('JourneyCard', () => {
  const mockJourney = {
    id: '123',
    title: 'Test Journey',
    distance: 12,
    difficulty: 'medium' as const,
  };

  it('renders journey details', () => {
    render(<JourneyCard journey={mockJourney} onStart={jest.fn()} />);

    expect(screen.getByText('Test Journey')).toBeInTheDocument();
    expect(screen.getByText('12 km')).toBeInTheDocument();
  });

  it('calls onStart when button clicked', () => {
    const handleStart = jest.fn();
    render(<JourneyCard journey={mockJourney} onStart={handleStart} />);

    fireEvent.click(screen.getByText('Start Journey'));

    expect(handleStart).toHaveBeenCalledWith('123');
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test journeyService.test.ts

# Run tests matching pattern
pnpm test --testNamePattern="should fetch journey"
```

---

## Git Workflow

### Branch Naming

- **Features:** `feature/add-journey-bookmarks`
- **Bugs:** `fix/journey-completion-bug`
- **Hotfixes:** `hotfix/payment-webhook-error`
- **Refactoring:** `refactor/simplify-credit-logic`
- **Documentation:** `docs/update-readme`

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build process, dependencies, etc.

**Examples:**
```bash
feat(journey): add difficulty indicators
fix(auth): resolve Google login redirect issue
docs: update deployment guide
refactor(services): simplify journey service methods
test(journey): add unit tests for journey service
chore(deps): update next.js to 14.1.0
```

### Pull Request Process

1. **Create Branch:**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make Changes & Commit:**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

3. **Push to Remote:**
   ```bash
   git push origin feature/your-feature
   ```

4. **Create PR on GitHub:**
   - Use PR template
   - Add description
   - Link related issues
   - Request reviewers

5. **Address Review Comments:**
   ```bash
   git add .
   git commit -m "refactor: address PR feedback"
   git push origin feature/your-feature
   ```

6. **Merge After Approval:**
   - Squash and merge (preferred)
   - Delete branch after merge

---

## Debugging

### Browser DevTools

**React DevTools:**
- Install React DevTools extension
- Inspect component hierarchy
- View props and state
- Profile performance

**Network Tab:**
- Monitor API requests
- Check Firebase calls
- Inspect response times
- Debug failed requests

**Console:**
- Use `console.log()` for quick debugging
- Use `console.table()` for arrays/objects
- Use `debugger;` statement for breakpoints

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Firebase Debugging

**Firestore Rules:**
```bash
# Test rules locally
firebase emulators:start --only firestore

# View security rule logs
firebase firestore:rules:debug
```

**Function Logs:**
```bash
# View function logs
firebase functions:log

# Tail logs in real-time
firebase functions:log --only yourFunctionName
```

---

## Common Tasks

### Adding a New Journey

1. **Create Journey Document:**
   ```typescript
   // In Firebase Console or via script
   {
     id: 'suburbs-to-city',
     title: 'Suburbs to City Center',
     description: 'Navigate through busy city streets',
     distance: 12,
     duration: 25,
     difficulty: 'medium',
     stage: 'intermediate',
     imageUrl: '/images/journeys/city.jpg',
     events: [
       {
         id: 'event-1',
         position: 2.5,
         type: 'stop_sign',
         question: {
           text: 'What should you do at a stop sign?',
           options: ['Stop completely', 'Slow down', 'Yield', 'Speed up'],
           correctIndex: 0,
           explanation: 'You must come to a complete stop at a stop sign...',
         },
       },
       // ... more events
     ],
   }
   ```

2. **Upload Journey Image:**
   - Add image to `public/images/journeys/`
   - Optimize with `next/image`

3. **Test Journey:**
   - Visit `/journeys`
   - Select your new journey
   - Play through all events
   - Verify scoring logic

### Adding a New Email Template

1. **Create Template:**
   ```typescript
   // In services/emailService.ts
   export async function sendWelcomeEmail(user: { email: string; name: string }) {
     const msg = {
       to: user.email,
       from: {
         email: process.env.SENDGRID_FROM_EMAIL!,
         name: process.env.SENDGRID_FROM_NAME!,
       },
       subject: 'Welcome to DriveMaster! 🚗',
       html: `
         <!DOCTYPE html>
         <html>
         <body>
           <h1>Welcome, ${user.name}!</h1>
           <p>We're excited to have you on board.</p>
           <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard</a>
         </body>
         </html>
       `,
     };

     await sgMail.send(msg);
   }
   ```

2. **Test Email:**
   - Use [SendGrid's Email Testing](https://app.sendgrid.com/email_testing)
   - Send test email to yourself
   - Verify formatting and links

### Adding a New Admin Feature

1. **Check User Role:**
   ```typescript
   // In middleware.ts or page
   const user = await getUserProfile(uid);
   if (user.role !== 'admin') {
     return redirect('/dashboard');
   }
   ```

2. **Create Admin Component:**
   ```typescript
   // components/admin/YourFeature.tsx
   export function YourFeature() {
     // Admin-only logic
   }
   ```

3. **Add to Admin Dashboard:**
   ```typescript
   // app/(dashboard)/admin/page.tsx
   import { YourFeature } from '@/components/admin/YourFeature';

   export default function AdminPage() {
     return (
       <div>
         {/* Existing admin features */}
         <YourFeature />
       </div>
     );
   }
   ```

---

## Troubleshooting

### Common Issues

**1. Firebase Auth Error:**
```
Error: Firebase: Error (auth/unauthorized-domain)
```
**Solution:**
- Go to Firebase Console → Authentication → Settings
- Add `localhost:3000` to Authorized Domains

**2. PayFast Signature Mismatch:**
```
Error: Invalid signature
```
**Solution:**
- Check `.env.local` has correct `PAYFAST_PASSPHRASE`
- Ensure no extra spaces in passphrase
- Verify merchant ID and key match PayFast dashboard

**3. SendGrid Email Not Sending:**
```
Error: Forbidden
```
**Solution:**
- Verify `SENDGRID_API_KEY` is correct
- Check domain verification in SendGrid
- Ensure sender email matches verified domain

**4. Build Fails:**
```
Error: Module not found: Can't resolve '@/components/...'
```
**Solution:**
- Check `tsconfig.json` has correct path aliases
- Restart TypeScript server in VS Code (Cmd+Shift+P → "Restart TS Server")
- Clear `.next` folder: `rm -rf .next`

**5. Firestore Permission Denied:**
```
Error: Missing or insufficient permissions
```
**Solution:**
- Check Firestore Rules in Firebase Console
- Ensure user is authenticated
- Verify user has correct role for operation
- Test rules with Firestore Emulator

### Debug Logs

**Enable Verbose Logging:**
```typescript
// In firebase/config.ts
if (process.env.NODE_ENV === 'development') {
  enableFirestoreLogging();
}

// In API routes
console.log('[API] Request:', request);
console.log('[API] Response:', response);
```

**Sentry Breadcrumbs:**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.addBreadcrumb({
  category: 'journey',
  message: 'User started journey',
  level: 'info',
  data: { journeyId: '123' },
});
```

---

## Contributing

### Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows TypeScript and React best practices
- [ ] All tests pass (`pnpm test`)
- [ ] No ESLint errors (`pnpm lint`)
- [ ] Code is formatted (`pnpm format`)
- [ ] TypeScript types are correct (`pnpm type-check`)
- [ ] No console errors in browser
- [ ] Responsive on mobile, tablet, desktop
- [ ] Accessibility tested (keyboard navigation, screen reader)
- [ ] Performance is acceptable (Lighthouse score > 90)
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow Conventional Commits
- [ ] PR description is clear and detailed

### Getting Help

- **Documentation:** Read this guide, ARCHITECTURE.md, FEATURES.md
- **Issues:** Check GitHub Issues for similar problems
- **Team:** Ask in team Slack/Discord channel
- **Firebase:** [Firebase Documentation](https://firebase.google.com/docs)
- **Next.js:** [Next.js Documentation](https://nextjs.org/docs)

---

*Last Updated: January 15, 2026*
