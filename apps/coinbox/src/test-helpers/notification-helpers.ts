import { Page, Locator } from '@playwright/test';

export async function checkNotifications(page: Page) {
  await page.goto('/dashboard');
  const notificationBell = page.locator('[data-testid="notification-bell"]');
  await notificationBell.click();
  await page.waitForLoadState('networkidle');
  return page;
}

export async function getNotificationCount(page: Page) {
  const count = await page.locator('[data-testid="notification-count"]').textContent();
  return parseInt(count || '0');
}

export async function clearNotifications(page: Page) {
  await page.click('button:has-text("Clear All")');
}

export async function waitForNotification(page: Page, timeout: number = 5000): Promise<Locator> {
  await page.locator('[data-testid="notification"]').first().waitFor({ state: 'visible', timeout });
  return page.locator('[data-testid="notification"]').first();
}

export async function checkNotificationContent(page: Page, notificationId: string, options: { type?: string; contains?: string[] }): Promise<boolean> {
  let selector = `[data-testid="notification"]`;
  if (notificationId) {
    selector += `[data-notification-id="${notificationId}"]`;
  }
  if (options.type) {
    selector += `[data-type="${options.type}"]`;
  }
  
  const notification = page.locator(selector).first();
  let isVisible = await notification.isVisible().catch(() => false);
  
  if (isVisible && options.contains && options.contains.length > 0) {
    const text = await notification.textContent() || '';
    isVisible = options.contains.every(str => text.includes(str));
  }
  
  return isVisible;
}
