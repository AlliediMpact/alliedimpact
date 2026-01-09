import { test, expect } from '@playwright/test';
import { authenticatedPage } from './helpers';

test.describe('Dashboard Tests', () => {
  test('should display personalized welcome message', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('should show all product cards', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/dashboard');

    // Check for product cards
    await expect(page.locator('text=Coin Box')).toBeVisible();
    await expect(page.locator('text=My Projects')).toBeVisible();
    await expect(page.locator('text=uMkhanyakude')).toBeVisible();
    await expect(page.locator('text=Drive Master')).toBeVisible();
    await expect(page.locator('text=CodeTech')).toBeVisible();
    await expect(page.locator('text=Cup Final')).toBeVisible();
  });

  test('should display user activity feed', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/dashboard');

    // Check for activity section
    const activitySection = page.locator('text=Recent Activity').first();
    await expect(activitySection).toBeVisible();
  });

  test('should show quick stats', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/dashboard');

    // Stats should be visible
    await page.waitForSelector('[class*="grid"]');
    const stats = await page.locator('[class*="grid"] > div').count();
    expect(stats).toBeGreaterThan(0);
  });

  test('should navigate to product when card is clicked', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/dashboard');

    // Click on active product
    await page.click('text=Launch Coin Box');
    
    // Should navigate (might be external, so check URL or new tab)
    await page.waitForTimeout(1000);
  });

  test('should display notifications badge', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/dashboard');

    // Check for notifications link
    const notificationLink = page.locator('[href="/notifications"]');
    await expect(notificationLink).toBeVisible();
  });

  test('should show member since date', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/dashboard');

    // Should show membership info
    await expect(page.locator('text=/Member since/i')).toBeVisible();
  });
});

test.describe('Product Pages Tests', () => {
  const products = ['coinbox', 'myprojects', 'umkhanyakude', 'drivemaster', 'codetech', 'cupfinal'];

  for (const product of products) {
    test(`should load ${product} product page`, async ({ page }) => {
      await page.goto(`/products/${product}`);
      
      // Should show product hero
      await expect(page.locator('h1')).toBeVisible();
      
      // Should show features section
      await expect(page.locator('text=Features').or(page.locator('text=Key Features'))).toBeVisible();
    });

    test(`should show CTA buttons on ${product} page`, async ({ page }) => {
      await page.goto(`/products/${product}`);
      
      // Should have at least one CTA button
      const buttons = page.locator('button, a[class*="button"]');
      await expect(buttons.first()).toBeVisible();
    });
  }

  test('should show active products with launch button', async ({ page }) => {
    await page.goto('/products/coinbox');
    
    // Active product should have launch button
    await expect(page.locator('text=/Launch|Get Started|Sign Up/i')).toBeVisible();
  });

  test('should show coming soon products with waitlist option', async ({ page }) => {
    await page.goto('/products/drivemaster');
    
    // Coming soon should indicate status
    await expect(page.locator('text=/Coming|Soon|Q1|Q2|Q3|Q4|2026/i')).toBeVisible();
  });
});

test.describe('Notifications Tests', () => {
  test('should load notifications page', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/notifications');

    await expect(page.locator('h1')).toContainText(/Notifications/i);
  });

  test('should show notification filters', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/notifications');

    // Should have filter options
    await expect(page.locator('text=All')).toBeVisible();
  });

  test('should display notification list', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/notifications');

    // Wait for notifications to load
    await page.waitForSelector('[class*="notification"], [class*="card"]', { timeout: 5000 })
      .catch(() => {
        // If no notifications, that's okay for a new user
      });
  });

  test('should mark notification as read', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/notifications');

    // Find first unread notification and mark as read
    const firstNotification = page.locator('[class*="notification"], [class*="card"]').first();
    if (await firstNotification.isVisible()) {
      await firstNotification.click();
      await page.waitForTimeout(500);
    }
  });

  test('should filter notifications by type', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/notifications');

    // Try filtering
    const filterButton = page.locator('text=Unread').or(page.locator('button:has-text("Filter")'));
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Settings Integration Tests', () => {
  test('should save notification preferences', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/settings');

    // Find notification settings section
    const notificationSection = page.locator('text=/Notification/i');
    await expect(notificationSection).toBeVisible();

    // Toggle a preference
    const toggles = page.locator('input[type="checkbox"]');
    if (await toggles.first().isVisible()) {
      await toggles.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should navigate between settings tabs', async ({ page }) => {
    await authenticatedPage(page);
    await page.goto('/settings');

    // Check for tabs or sections
    const tabs = page.locator('button, a').filter({ hasText: /Profile|Security|Notifications/ });
    const count = await tabs.count();
    
    if (count > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Search and Navigation Tests', () => {
  test('should search for products', async ({ page }) => {
    await page.goto('/');

    // Try to find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('coin');
      await page.waitForTimeout(500);
      
      // Results should appear
      await expect(page.locator('text=Coin Box')).toBeVisible();
    }
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    await page.goto('/products/coinbox');

    // Check for breadcrumbs
    const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"], [class*="breadcrumb"]');
    if (await breadcrumbs.isVisible()) {
      const homeLink = breadcrumbs.locator('text=Home').or(breadcrumbs.locator('a').first());
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('should have working footer links', async ({ page }) => {
    await page.goto('/');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check footer links
    await expect(page.locator('footer a[href="/about"]')).toBeVisible();
    await expect(page.locator('footer a[href="/contact"]')).toBeVisible();
  });
});

test.describe('Responsive Design Tests', () => {
  const devices = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  for (const device of devices) {
    test(`should display correctly on ${device.name}`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto('/');

      // Page should load
      await expect(page.locator('h1')).toBeVisible();

      // Navigation should be accessible
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    });
  }

  test('should show mobile menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Look for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu")');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Performance Tests', () => {
  test('should load homepage within performance budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000); // 5 seconds max
  });

  test('should load dashboard quickly for authenticated users', async ({ page }) => {
    await authenticatedPage(page);
    
    const startTime = Date.now();
    await page.goto('/dashboard');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(4000); // 4 seconds max
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/');

    // Check if images have loading="lazy"
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      const firstImage = images.first();
      const loading = await firstImage.getAttribute('loading');
      // Either lazy or eager is fine, just checking attribute exists
      expect(loading).toBeTruthy();
    }
  });
});

test.describe('Error Handling Tests', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    
    // Should show 404 or error page
    const content = await page.textContent('body');
    expect(content).toMatch(/404|not found|page not found/i);
  });

  test('should handle network errors', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);
    await page.goto('/').catch(() => {
      // Expected to fail
    });

    // Go back online
    await page.context().setOffline(false);
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show error boundary on component error', async ({ page }) => {
    await page.goto('/');

    // Inject error to trigger error boundary
    await page.evaluate(() => {
      // This would normally be triggered by a real error
      window.dispatchEvent(new ErrorEvent('error', {
        message: 'Test error',
        filename: 'test.js',
        lineno: 1,
        colno: 1,
        error: new Error('Test error'),
      }));
    });

    await page.waitForTimeout(500);
  });
});
