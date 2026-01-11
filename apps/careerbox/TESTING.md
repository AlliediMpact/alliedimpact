# 🧪 CareerBox Testing Guide

Comprehensive testing documentation for the CareerBox platform.

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Coverage Goals](#coverage-goals)
6. [CI/CD Integration](#cicd-integration)

---

## Testing Philosophy

CareerBox follows a comprehensive testing strategy:

- **Unit Tests**: Test individual functions and utilities in isolation
- **Component Tests**: Test React components with user interactions
- **Integration Tests**: Test feature workflows end-to-end
- **E2E Tests**: Test critical user journeys in a browser

### Testing Pyramid

```
       /\
      /  \    E2E Tests (Few, Slow, Expensive)
     /____\
    /      \  Integration Tests (Some, Medium Speed)
   /________\
  /          \ Unit Tests (Many, Fast, Cheap)
 /____________\
```

---

## Test Structure

```
src/__tests__/
├── unit/                    # Unit tests
│   ├── utils/              # Utility function tests
│   │   └── validation.test.ts
│   └── hooks/              # Custom hook tests
├── components/             # Component tests
│   ├── application-modal.test.tsx
│   ├── interview-scheduler.test.tsx
│   └── company-reviews.test.tsx
├── integration/            # Integration tests
│   ├── job-application-flow.test.tsx
│   └── search-and-apply.test.tsx
├── e2e/                    # End-to-end tests
│   ├── critical-paths/
│   ├── job-seeker/
│   └── employer/
└── setup/                  # Test configuration
    └── test-utils.tsx
```

---

## Running Tests

### Unit & Component Tests

```bash
# Run all tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:ci

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test validation.test.ts

# Run tests matching pattern
pnpm test --testNamePattern="validation"
```

### E2E Tests

```bash
# Run E2E tests
pnpm test:e2e

# Run in headed mode (visible browser)
pnpm test:e2e:headed

# Run in debug mode
pnpm test:e2e:debug

# Run specific E2E test
pnpm test:e2e tests/critical-paths/search.spec.ts
```

### Type Checking

```bash
# Type check all files
pnpm type-check
```

### Linting

```bash
# Lint all files
pnpm lint

# Fix auto-fixable issues
pnpm lint --fix
```

---

## Writing Tests

### Unit Tests

Test individual functions in isolation:

```typescript
// src/__tests__/unit/utils/formatDate.test.ts
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2026-01-15');
    expect(formatDate(date)).toBe('January 15, 2026');
  });

  it('should handle invalid dates', () => {
    expect(() => formatDate(null as any)).toThrow();
  });
});
```

### Component Tests

Test React components with user interactions:

```typescript
// src/__tests__/components/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Integration Tests

Test complete feature workflows:

```typescript
// src/__tests__/integration/job-application-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationModal } from '@/components/application/application-modal';

describe('Job Application Flow', () => {
  it('should complete full application', async () => {
    const mockOnSuccess = jest.fn();
    render(<ApplicationModal {...props} onSubmitSuccess={mockOnSuccess} />);

    // Fill form
    await userEvent.type(screen.getByLabelText(/cover letter/i), 'A'.repeat(150));
    
    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    await userEvent.upload(screen.getByLabelText(/resume/i), file);

    // Submit
    fireEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
```

### E2E Tests

Test critical user journeys in a browser:

```typescript
// src/__tests__/e2e/critical-paths/search-apply.spec.ts
import { test, expect } from '@playwright/test';

test('user can search and apply for jobs', async ({ page }) => {
  // Navigate to search
  await page.goto('/search');

  // Search for jobs
  await page.fill('[data-testid="search-input"]', 'Software Engineer');
  await page.click('[data-testid="search-button"]');

  // Wait for results
  await page.waitForSelector('[data-testid="job-card"]');

  // Click on first job
  await page.click('[data-testid="job-card"]:first-child');

  // Open application modal
  await page.click('[data-testid="apply-button"]');

  // Fill application
  await page.fill('[data-testid="cover-letter"]', 'I am interested...');
  await page.setInputFiles('[data-testid="resume-upload"]', 'path/to/resume.pdf');

  // Submit
  await page.click('[data-testid="submit-application"]');

  // Verify success
  await expect(page.locator('text=Application submitted')).toBeVisible();
});
```

---

## Testing Best Practices

### 1. Test User Behavior, Not Implementation

❌ **Bad:**
```typescript
it('should call setState', () => {
  const { result } = renderHook(() => useState(0));
  act(() => result.current[1](1));
  expect(result.current[0]).toBe(1);
});
```

✅ **Good:**
```typescript
it('should increment counter when button clicked', () => {
  render(<Counter />);
  fireEvent.click(screen.getByText('Increment'));
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 2. Use Testing Library Queries Correctly

**Priority Order:**
1. `getByRole` - Most accessible
2. `getByLabelText` - For form fields
3. `getByPlaceholderText` - For inputs
4. `getByText` - For non-interactive elements
5. `getByTestId` - Last resort

### 3. Avoid Brittle Tests

❌ **Bad:**
```typescript
expect(element.className).toBe('btn btn-primary');
```

✅ **Good:**
```typescript
expect(element).toHaveClass('btn-primary');
```

### 4. Mock External Dependencies

```typescript
// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {
    collection: jest.fn(),
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));
```

### 5. Clean Up After Tests

```typescript
afterEach(() => {
  jest.clearAllMocks();
  cleanup(); // From @testing-library/react
});
```

---

## Coverage Goals

### Current Coverage

- **Unit Tests**: 80%+ coverage
- **Component Tests**: 70%+ coverage
- **Integration Tests**: Critical flows covered
- **E2E Tests**: Happy paths covered

### Target Coverage

- **Overall**: 85%+
- **Critical Paths**: 95%+
- **Utilities**: 90%+
- **Components**: 80%+

### Viewing Coverage

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- **Pull Requests** - All tests must pass
- **Main Branch** - After merge
- **Pre-Deployment** - Before production deploy

### Workflow File

See `.github/workflows/test.yml` for the complete CI configuration.

### Quality Gates

- ✅ Type checking must pass
- ✅ Linting must pass
- ✅ All tests must pass
- ✅ Coverage must meet minimums

---

## Mock Data Factories

Use test utilities for consistent mock data:

```typescript
import { mockJob, mockApplication, mockNotification } from '@/__tests__/setup/test-utils';

const job = mockJob({ title: 'Custom Title' });
const application = mockApplication({ status: 'accepted' });
const notification = mockNotification({ read: true });
```

---

## Debugging Tests

### Debug Single Test

```bash
# Add .only to focus on one test
it.only('should work', () => {
  // Your test
});

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### View Component in Browser

```typescript
import { debug } from '@testing-library/react';

it('should render', () => {
  const { container } = render(<Component />);
  debug(container); // Prints HTML to console
});
```

### Playwright Debug

```bash
# Open inspector
pnpm test:e2e:debug

# Generate trace
pnpm test:e2e --trace on

# View trace
pnpm exec playwright show-trace trace.zip
```

---

## Common Issues

### 1. Act Warnings

```typescript
// Wrap async operations in waitFor
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### 2. Flaky Tests

- Use `waitFor` instead of fixed timeouts
- Mock timers: `jest.useFakeTimers()`
- Increase timeout for slow operations

### 3. Memory Leaks

```typescript
afterEach(() => {
  cleanup();
  jest.clearAllTimers();
});
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library Docs](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** 2026-01-11  
**Version:** 1.0.0
