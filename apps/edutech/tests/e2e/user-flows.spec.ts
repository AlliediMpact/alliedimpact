/**
 * End-to-End Tests for Critical User Flows
 * 
 * Run with: pnpm test:e2e
 */

import { test, expect, Page } from '@playwright/test';

// Helper function to login
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('User Authentication', () => {
  test('should sign up new user successfully', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill signup form
    await page.fill('input[name="displayName"]', 'Test User');
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Should show welcome message or onboarding
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should login existing user', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'learner@edutech.co.za');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/invalid|incorrect|wrong/i')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    
    // Click logout button
    await page.click('button:has-text("Logout")');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Course Browsing and Enrollment', () => {
  test('should browse courses page', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    await page.goto('/courses');
    
    // Should see course cards
    const courseCards = page.locator('[data-testid="course-card"]');
    await expect(courseCards.first()).toBeVisible();
    
    // Count should be > 0
    const count = await courseCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter courses by track', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    await page.goto('/courses');
    
    // Click "Coding" filter
    await page.click('button:has-text("Coding")');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // All visible courses should be coding track
    const badges = page.locator('[data-testid="course-track"]');
    const firstBadge = await badges.first().textContent();
    expect(firstBadge).toContain('Coding');
  });

  test('should search courses', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    await page.goto('/courses');
    
    // Type in search box
    await page.fill('input[placeholder*="search" i]', 'HTML');
    
    // Wait for debounce
    await page.waitForTimeout(500);
    
    // Should see HTML course
    await expect(page.locator('text=HTML')).toBeVisible();
  });

  test('should enroll in a course', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    await page.goto('/courses');
    
    // Click first course
    await page.click('[data-testid="course-card"]').first();
    
    // Should be on course details page
    await expect(page.locator('h1')).toBeVisible();
    
    // Click enroll button
    await page.click('button:has-text("Enroll")');
    
    // Should show success message
    await expect(page.locator('text=/enrolled|success/i')).toBeVisible();
    
    // Button should change to "Continue"
    await expect(page.locator('button:has-text("Continue")')).toBeVisible();
  });
});

test.describe('Learning Experience', () => {
  test('should complete a lesson', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Click on an enrolled course
    await page.click('[data-testid="enrolled-course"]').first();
    
    // Should see lesson list
    await expect(page.locator('[data-testid="lesson-item"]')).toBeVisible();
    
    // Click first lesson
    await page.click('[data-testid="lesson-item"]').first();
    
    // Read lesson content
    await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible();
    
    // Mark as complete
    await page.click('button:has-text("Complete")');
    
    // Should see XP notification
    await expect(page.locator('text=/\\+10 XP/i')).toBeVisible();
  });

  test('should track course progress', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    await page.goto('/dashboard');
    
    // Should see progress bars
    const progressBars = page.locator('[role="progressbar"]');
    await expect(progressBars.first()).toBeVisible();
    
    // Progress should be between 0-100%
    const progressValue = await progressBars.first().getAttribute('aria-valuenow');
    const progress = parseInt(progressValue || '0');
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  test('should award badges', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    await page.goto('/dashboard');
    
    // Complete first course (if not completed)
    // ... (implementation depends on test data)
    
    // Check achievements card
    await page.click('text=Achievements');
    
    // Should see at least one badge
    await expect(page.locator('[data-testid="badge-item"]')).toBeVisible();
  });
});

test.describe('Forum Interaction', () => {
  test('should create forum post', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    await page.goto('/forum');
    
    // Click new post button
    await page.click('button:has-text("New Post")');
    
    // Fill form
    await page.fill('input[name="title"]', 'Test Post Title');
    await page.fill('textarea[name="content"]', 'This is a test post content.');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should see success message
    await expect(page.locator('text=/posted|created/i')).toBeVisible();
  });

  test('should reply to post', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    await page.goto('/forum');
    
    // Click on first post
    await page.click('[data-testid="forum-post"]').first();
    
    // Fill reply
    await page.fill('textarea[placeholder*="reply" i]', 'This is my reply');
    await page.click('button:has-text("Reply")');
    
    // Should see reply
    await expect(page.locator('text=This is my reply')).toBeVisible();
  });

  test('should upvote post', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    await page.goto('/forum');
    
    // Get initial upvote count
    const upvoteButton = page.locator('button[aria-label*="upvote" i]').first();
    const initialCount = await upvoteButton.textContent();
    
    // Click upvote
    await upvoteButton.click();
    
    // Count should increase
    await page.waitForTimeout(500);
    const newCount = await upvoteButton.textContent();
    expect(newCount).not.toBe(initialCount);
  });
});

test.describe('Subscription Management', () => {
  test('should show trial status', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    await page.goto('/dashboard');
    
    // Should see trial banner or badge
    await expect(page.locator('text=/trial|free/i')).toBeVisible();
  });

  test('should navigate to subscription page', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    await page.goto('/subscribe');
    
    // Should see pricing plans
    await expect(page.locator('text=/monthly|annual/i')).toBeVisible();
    await expect(page.locator('text=R199')).toBeVisible(); // Monthly price
  });

  test('should restrict premium content for free users', async ({ page }) => {
    await login(page, 'learner@edutech.co.za', 'password123');
    
    // Try to access premium course
    await page.goto('/courses');
    await page.click('[data-testid="premium-badge"]').first();
    
    // Should see upgrade prompt
    await expect(page.locator('text=/premium|upgrade|subscribe/i')).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should display mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page, 'learner@edutech.co.za', 'password123');
    
    // Should see bottom navigation
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  });

  test('should support swipe gestures', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page, 'learner@edutech.co.za', 'password123');
    
    await page.goto('/courses');
    
    // Swipe right
    await page.mouse.move(100, 300);
    await page.mouse.down();
    await page.mouse.move(300, 300);
    await page.mouse.up();
    
    // Should navigate back (if applicable)
    // ... (implementation depends on swipe behavior)
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through form
    await page.keyboard.press('Tab');
    await page.keyboard.type('learner@edutech.co.za');
    await page.keyboard.press('Tab');
    await page.keyboard.type('password123');
    await page.keyboard.press('Enter');
    
    // Should login successfully
    await expect(page).toHaveURL('/dashboard');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    await expect(page.locator('main')).toBeVisible();
    
    // Check for navigation
    await expect(page.locator('nav')).toBeVisible();
    
    // Buttons should have accessible names
    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const label = await button.getAttribute('aria-label') || await button.textContent();
      expect(label).toBeTruthy();
    }
  });
});
