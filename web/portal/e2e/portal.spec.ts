import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Sign In")');
    
    // Should show validation errors
    await expect(page.locator('text=/email/i')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('h1')).toContainText('Create Your Account');
  });

  test('should show password match validation', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[name*="name"]', 'Test User');
    await page.fill('input[type="password"]').first().fill('password123');
    await page.locator('input[type="password"]').nth(1).fill('different123');
    
    await page.click('button:has-text("Create Account")');
    
    await expect(page.locator('text=/passwords do not match/i')).toBeVisible();
  });

  test('should navigate to reset password page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Forgot Password');
    
    await expect(page).toHaveURL('/reset-password');
    await expect(page.locator('h1')).toContainText('Reset Password');
  });

  test('should have working contact form', async ({ page }) => {
    await page.goto('/contact');
    
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="subject"]', 'Test Subject');
    await page.fill('textarea[name="message"]', 'Test message content');
    
    // Note: This will actually submit to Firestore in test
    // Consider mocking in real E2E tests
    await page.click('button:has-text("Send Message")');
  });
});

test.describe('Navigation', () => {
  test('should navigate through main pages', async ({ page }) => {
    await page.goto('/');
    
    // Test main navigation
    await page.click('text=About');
    await expect(page).toHaveURL('/about');
    
    await page.click('text=Products');
    await expect(page).toHaveURL('/products');
    
    await page.click('text=Contact');
    await expect(page).toHaveURL('/contact');
  });

  test('should navigate through legal pages', async ({ page }) => {
    await page.goto('/');
    
    await page.click('text=Terms of Service');
    await expect(page).toHaveURL('/legal/terms');
    
    await page.goto('/');
    await page.click('text=Privacy Policy');
    await expect(page).toHaveURL('/legal/privacy');
    
    await page.goto('/');
    await page.click('text=Cookie Policy');
    await expect(page).toHaveURL('/legal/cookies');
  });

  test('should have responsive header', async ({ page }) => {
    await page.goto('/');
    
    // Check logo is visible
    await expect(page.locator('text=Allied iMpact')).toBeVisible();
    
    // Check navigation links
    await expect(page.locator('nav')).toBeVisible();
  });
});

test.describe('Products Page', () => {
  test('should display products', async ({ page }) => {
    await page.goto('/products');
    
    await expect(page.locator('h1')).toContainText('Our Products');
    
    // Should show product cards
    await expect(page.locator('text=Coin Box')).toBeVisible();
    await expect(page.locator('text=Drive Master')).toBeVisible();
    await expect(page.locator('text=CodeTech')).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');
    
    // Click category filter
    await page.click('button:has-text("Financial")');
    
    // Should show only financial products
    await expect(page.locator('text=Coin Box')).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    await page.goto('/products');
    
    const searchInput = page.locator('input[placeholder*="search"]');
    await searchInput.fill('Coin');
    
    // Should filter results
    await expect(page.locator('text=Coin Box')).toBeVisible();
  });

  test('should enable compare mode', async ({ page }) => {
    await page.goto('/products');
    
    await page.click('button:has-text("Compare")');
    
    // Should show compare checkboxes
    await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);
  });

  test('should have accessible forms', async ({ page }) => {
    await page.goto('/login');
    
    // Check for labels
    await expect(page.locator('label')).toHaveCount(2); // email and password
    
    // Check for proper input types
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to activate links
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON']).toContain(focusedElement);
  });
});

test.describe('Performance', () => {
  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out expected Firebase errors in test environment
    const criticalErrors = errors.filter(e => 
      !e.includes('Firebase') && 
      !e.includes('auth/configuration-not-found')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
