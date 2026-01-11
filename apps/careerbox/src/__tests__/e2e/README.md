# End-to-End Tests

This directory contains end-to-end (E2E) tests for critical user journeys using Playwright.

## Setup

```bash
# Install Playwright browsers
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests in headed mode (see browser)
pnpm test:e2e --headed

# Run E2E tests in debug mode
pnpm test:e2e --debug
```

## Test Structure

E2E tests are organized by user journey:

- `critical-paths/` - Essential user flows that must work
- `job-seeker/` - Job seeker-specific journeys
- `employer/` - Employer-specific journeys
- `auth/` - Authentication flows

## Writing E2E Tests

Example:

```typescript
import { test, expect } from '@playwright/test';

test('user can search for jobs', async ({ page }) => {
  await page.goto('/search');
  await page.fill('[placeholder="Job title"]', 'Software Engineer');
  await page.click('button:text("Search")');
  await expect(page.locator('.job-card')).toHaveCount.greaterThan(0);
});
```

## Best Practices

1. **Use data-testid** - Add `data-testid` attributes for reliable selectors
2. **Avoid hard-coded waits** - Use `waitFor` conditions instead
3. **Clean up test data** - Reset state after each test
4. **Run locally** - Always test locally before CI
5. **Keep tests independent** - Each test should work in isolation

## CI/CD Integration

E2E tests run automatically on:
- Pull requests
- Main branch commits
- Pre-deployment

## Debugging Failed Tests

```bash
# Show trace viewer for last test
pnpm exec playwright show-trace

# Run single test file
pnpm test:e2e tests/critical-paths/search.spec.ts

# Run tests with specific viewport
pnpm test:e2e --project=mobile
```

## Future Enhancements

- [ ] Add visual regression testing
- [ ] Add performance testing
- [ ] Add accessibility testing (axe-core)
- [ ] Add cross-browser testing
- [ ] Add mobile device testing
