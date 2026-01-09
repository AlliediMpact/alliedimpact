import { test as base, expect } from '@playwright/test';

/**
 * E2E Test Fixtures and Utilities
 * Provides reusable helpers for Playwright tests
 */

// Extend base test with custom fixtures
export const test = base.extend({
  // Auto-login fixture for authenticated tests
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill in test credentials (requires test user in Firebase)
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'testpassword123');
    
    // Submit and wait for navigation
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    await use(page);
  },
});

export { expect };

/**
 * Test helpers
 */
export class TestHelpers {
  /**
   * Wait for network idle
   */
  static async waitForNetworkIdle(page: any) {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  }

  /**
   * Check for accessibility violations
   */
  static async checkA11y(page: any) {
    // Check for missing alt text on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);

    // Check for buttons without accessible names
    const buttonsWithoutLabel = await page.locator('button:not([aria-label]):not(:has-text(""))').count();
    expect(buttonsWithoutLabel).toBe(0);
  }

  /**
   * Take full page screenshot
   */
  static async takeFullPageScreenshot(page: any, name: string) {
    await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Mock API response
   */
  static async mockApiRoute(page: any, url: string, response: any) {
    await page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Fill form with data
   */
  static async fillForm(page: any, formData: Record<string, string>) {
    for (const [name, value] of Object.entries(formData)) {
      const input = page.locator(`input[name="${name}"], textarea[name="${name}"]`);
      await input.fill(value);
    }
  }

  /**
   * Wait for toast/notification
   */
  static async waitForNotification(page: any, text: string) {
    await expect(page.locator(`text=${text}`)).toBeVisible({ timeout: 5000 });
  }
}
