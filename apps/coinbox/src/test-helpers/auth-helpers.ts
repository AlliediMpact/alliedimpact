import { Page, expect } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Sign In")');
  await page.waitForNavigation();
}

export async function register(page: Page, email: string, password: string, name: string) {
  await page.goto('/auth/signup');
  await page.fill('input[placeholder="Full Name"]', name);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Create Account")');
  await page.waitForNavigation();
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu-trigger"]');
  await page.click('button:has-text("Sign Out")');
  await page.waitForNavigation();
}

export async function createMockUser(options: { email: string; password: string; name?: string; displayName?: string; role?: string }): Promise<string> {
  // Mock implementation that returns a uid string
  return 'mock-' + Math.random().toString(36).substr(2, 9);
}

export async function loginAsMockUser(page: Page, email: string, password: string) {
  await login(page, email, password);
}

export async function loginAsAdmin(page: Page) {
  await login(page, 'admin@alliedimpact.com', 'adminPassword123');
}

export async function clearMockUserData(userId: string) {
  // Mock implementation - would normally clear Firebase data
  return true;
}
