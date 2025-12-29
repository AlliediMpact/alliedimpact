# Contributing to Coin Box

Thank you for your interest in contributing to Coin Box! This document provides guidelines for contributing safely and effectively to the codebase.

---

## 🎯 Core Principles

### 1. **Extend, Don't Break**

**Never modify existing features**. Always add new functionality without changing what already works.

```typescript
// ✅ GOOD: Add new optional field
interface User {
  email: string;
  name: string;
  phone?: string;  // NEW: Optional field
}

// ❌ BAD: Change existing field
interface User {
  email: string;
  fullName: string;  // BAD: Renamed 'name' breaks existing code
}
```

### 2. **Test Before You Ship**

Every change must be tested:
- Unit tests for business logic
- Integration tests for API endpoints
- Manual testing for UI changes
- E2E tests for critical workflows

### 3. **Document As You Go**

- Add JSDoc comments for complex functions
- Update README if you add features
- Update SYSTEM_OVERVIEW.md for architecture changes
- Write clear commit messages

### 4. **Security First**

- Never commit secrets or API keys
- Always validate user input
- Use Firebase security rules
- Follow OWASP best practices

---

## 🔧 Development Workflow

### Prerequisites

- Node.js 18+ installed
- Firebase CLI: `npm install -g firebase-tools`
- Git configured with your name and email
- Access to Firebase project

### Setting Up Your Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/AlliediMpact/coinbox.git
   cd coinbox
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🌿 Branch Strategy

### Branch Types

1. **`main`** - Production code (protected)
2. **`develop`** - Integration branch (protected)
3. **`feature/*`** - New features
4. **`fix/*`** - Bug fixes
5. **`hotfix/*`** - Critical production fixes

### Branch Naming

```bash
feature/add-savings-jar
feature/improve-dashboard-ui
fix/wallet-balance-calculation
fix/crypto-escrow-bug
hotfix/security-patch-auth
```

### Workflow

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes and commit
git add .
git commit -m "feat: add feature description"

# 4. Push to remote
git push origin feature/your-feature-name

# 5. Create Pull Request on GitHub
# Target: develop (not main!)
```

---

## 💬 Commit Message Guidelines

We follow **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code restructuring (no feature/fix)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(wallet): add withdrawal functionality

Implement wallet withdrawal with:
- Balance validation
- Transaction recording
- Notification sending

Closes #123

---

fix(crypto): resolve escrow release bug

Fixed issue where crypto wasn't released after
buyer confirmation. Added additional validation
and retry logic.

Fixes #456

---

docs(readme): update installation instructions

Added missing Firebase setup step and updated
Node.js version requirement to 18+.
```

---

## 🔍 Code Review Process

### Before Requesting Review

- [ ] All tests pass (`npm run test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code

### Pull Request Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing Done
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. **Create PR** targeting `develop` branch
2. **Automated checks** run (tests, build, lint)
3. **Code review** by team member
4. **Address feedback** if requested
5. **Approval** from reviewer
6. **Merge** to develop

---

## 🧪 Testing Guidelines

### What to Test

- Business logic functions
- API endpoint responses
- Edge cases and error handling
- Integration between services
- Critical user workflows

### Writing Unit Tests

```typescript
// src/lib/__tests__/wallet-service.test.ts
import { describe, it, expect } from 'vitest';
import { calculateBalance } from '../wallet-service';

describe('Wallet Service', () => {
  it('should calculate balance correctly', () => {
    const transactions = [
      { type: 'deposit', amount: 1000 },
      { type: 'withdrawal', amount: 500 },
    ];
    
    const balance = calculateBalance(transactions);
    
    expect(balance).toBe(500);
  });
  
  it('should handle empty transactions', () => {
    const balance = calculateBalance([]);
    expect(balance).toBe(0);
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

---

## 📝 Code Style Guidelines

### TypeScript

- **Use strict mode**: Enable in tsconfig.json
- **Explicit types**: Don't rely on inference for public APIs
- **No `any` type**: Use `unknown` or proper types
- **Interfaces over types**: For object shapes
- **Named exports**: Avoid default exports

```typescript
// ✅ GOOD
export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  // implementation
}

// ❌ BAD
export default function getUser(id: any) {
  // implementation
}
```

### React Components

- **Functional components**: Use hooks, not classes
- **Props interface**: Define clear prop types
- **Single responsibility**: One component, one job
- **Composition**: Prefer small, reusable components

```tsx
// ✅ GOOD
interface WalletCardProps {
  balance: number;
  currency: string;
  onDeposit: () => void;
}

export function WalletCard({ balance, currency, onDeposit }: WalletCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent>
        {currency} {balance.toFixed(2)}
      </CardContent>
      <CardFooter>
        <Button onClick={onDeposit}>Deposit</Button>
      </CardFooter>
    </Card>
  );
}
```

### File Organization

```
src/lib/wallet-service.ts      # Service logic
src/lib/__tests__/wallet-service.test.ts  # Tests
src/components/WalletCard.tsx  # UI component
src/app/wallet/page.tsx        # Page component
```

### Naming Conventions

```typescript
// Files
wallet-service.ts          // kebab-case
WalletCard.tsx             // PascalCase for components

// Variables & Functions
const userName = "John";   // camelCase
function calculateTotal() {}

// Constants
const MAX_AMOUNT = 10000;  // UPPER_SNAKE_CASE

// Types & Interfaces
interface UserProfile {}   // PascalCase
type WalletType = "main" | "crypto";

// React Components
function WalletCard() {}   // PascalCase
```

---

## 🛡️ Security Guidelines

### Never Commit Secrets

```bash
# ❌ BAD: Hardcoded API key
const API_KEY = "sk_live_abc123";

# ✅ GOOD: Use environment variables
const API_KEY = process.env.FIREBASE_API_KEY;
```

### Input Validation

```typescript
// ✅ GOOD: Always validate user input
export async function createLoan(amount: number) {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }
  
  if (amount > MAX_LOAN_AMOUNT) {
    throw new Error("Amount exceeds limit");
  }
  
  // Safe to proceed
}
```

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Transactions are immutable
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

### Authentication Checks

```typescript
// ✅ GOOD: Check auth on every API route
export async function POST(request: NextRequest) {
  const userId = await verifyAuth(request);
  
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // Proceed with authenticated request
}
```

---

## 🚫 What NOT to Do

### Don't Duplicate Features

```typescript
// ❌ BAD: Creating similar function
export async function depositFunds(amount: number) { ... }
export async function addMoney(amount: number) { ... }

// ✅ GOOD: Use existing function
export async function deposit(amount: number) { ... }
```

### Don't Modify Existing Behavior

```typescript
// ❌ BAD: Changing existing function signature
export async function calculateInterest(
  principal: number,
  rate: number,
  duration: number  // Added new required parameter!
) { ... }

// ✅ GOOD: Add new optional parameter
export async function calculateInterest(
  principal: number,
  rate: number,
  duration?: number  // Optional parameter
) { ... }
```

### Don't Skip Tests

```typescript
// ❌ BAD: No tests
export function complexCalculation(data: any) {
  // 100 lines of complex logic
}

// ✅ GOOD: Well tested
export function complexCalculation(data: Data): Result {
  // Logic here
}

// In test file:
describe('complexCalculation', () => {
  it('should handle normal case', () => { ... });
  it('should handle edge case', () => { ... });
  it('should throw on invalid input', () => { ... });
});
```

### Don't Use Copilot Blindly

```typescript
// ❌ BAD: Accepting Copilot suggestion without review
const result = await magicalFunctionThatDoesEverything();

// ✅ GOOD: Review and understand code
const result = await processTransaction({
  amount,
  type,
  userId
});
// I understand what this does and tested it
```

---

## 🤖 Working with GitHub Copilot

### Best Practices

1. **Review All Suggestions**
   - Don't blindly accept code
   - Understand what it does
   - Check for security issues

2. **Provide Clear Context**
   - Write descriptive function names
   - Add comments for complex logic
   - Use TypeScript types

3. **Test Generated Code**
   - Write tests for Copilot suggestions
   - Verify edge cases
   - Check performance

4. **Use as Assistant, Not Replacement**
   - You're responsible for the code
   - Review architectural decisions
   - Ensure it follows our patterns

### Example Workflow

```typescript
// 1. Write clear function signature
export async function calculateLoanInterest(
  principal: number,
  rate: number,
  days: number
): Promise<number> {
  // Let Copilot suggest implementation
  // 2. Review suggestion
  // 3. Test the function
  // 4. Commit with confidence
}
```

---

## 📊 Performance Guidelines

### Database Queries

```typescript
// ❌ BAD: N+1 query problem
for (const user of users) {
  const balance = await getBalance(user.id);
}

// ✅ GOOD: Batch query
const balances = await getBatchBalances(users.map(u => u.id));
```

### React Performance

```typescript
// ❌ BAD: Re-creating function on every render
function WalletCard({ balance }: Props) {
  const handleClick = () => {
    console.log(balance);
  };
  
  return <Button onClick={handleClick}>Deposit</Button>;
}

// ✅ GOOD: Memoize with useCallback
function WalletCard({ balance }: Props) {
  const handleClick = useCallback(() => {
    console.log(balance);
  }, [balance]);
  
  return <Button onClick={handleClick}>Deposit</Button>;
}
```

### Image Optimization

```tsx
// ❌ BAD: Regular img tag
<img src="/profile.jpg" alt="Profile" />

// ✅ GOOD: Next.js Image component
import Image from 'next/image';

<Image 
  src="/profile.jpg" 
  alt="Profile"
  width={100}
  height={100}
  priority
/>
```

---

## 🐛 Debugging Tips

### Enable Debug Logging

```typescript
// Add to .env.local
DEBUG=true
LOG_LEVEL=debug

// In code
if (process.env.DEBUG === 'true') {
  console.log('Debug info:', data);
}
```

### Firebase Emulator

```bash
# Start emulator for local testing
firebase emulators:start

# Connect to emulator in code
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

### Common Issues

**Build Fails**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Tests Fail**
```bash
# Clear test cache
npm run test -- --clearCache
npm run test
```

---

## 📦 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 2.1.0)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Deployed to staging
- [ ] Manual testing on staging
- [ ] Deployed to production
- [ ] Smoke tests on production

---

## 🆘 Getting Help

### Resources

- **Documentation**: Check SYSTEM_OVERVIEW.md
- **Team Chat**: Ask in Discord/Slack
- **Issues**: Search GitHub issues
- **Stack Overflow**: For general questions

### Asking Good Questions

1. **Search first**: Maybe it's already answered
2. **Be specific**: Include error messages
3. **Provide context**: What were you trying to do?
4. **Show code**: Minimal reproducible example
5. **Describe expected vs actual**: What should happen vs what does happen

### Example Question

❌ **Bad**: "It's not working, help!"

✅ **Good**:
```
I'm trying to create a loan but getting "Insufficient balance" error.

Steps to reproduce:
1. Log in as user with balance R1000
2. Create loan for R500
3. Error appears

Expected: Loan should be created
Actual: Error "Insufficient balance"

Code:
[paste relevant code]

Error:
[paste full error message]
```

---

## 🎓 Learning Resources

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### React & Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)

### Firebase
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)

### Testing
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

---

## ✅ Before You Submit PR

**Final Checklist**:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch name follows convention
- [ ] PR targets correct branch (`develop`)
- [ ] PR description is clear
- [ ] No merge conflicts
- [ ] Self-review completed
- [ ] Ready for review

---

## 🙏 Thank You!

Your contributions make Coin Box better for everyone. If you have questions about these guidelines, please ask!

---

*Last Updated: December 17, 2025*  
*Document Version: 1.0.0*  
*Maintained by: Allied iMpact Development Team*
