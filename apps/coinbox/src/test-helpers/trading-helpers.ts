import { Page } from '@playwright/test';

export async function createTradingTicket(page: Page, options: { type?: string; amount: number; asset?: string; interest?: number; description?: string }) {
  await page.goto('/dashboard/trading');
  await page.click('button:has-text("Create Order")');
  await page.fill('input[placeholder="Amount"]', options.amount.toString());
  if (options.asset) {
    await page.selectOption('select[name="asset"]', options.asset);
  }
  if (options.interest) {
    await page.fill('input[placeholder="Interest"]', options.interest.toString());
  }
  if (options.description) {
    await page.fill('input[placeholder="Description"]', options.description);
  }
  await page.click('button:has-text("Post Order")');
  await page.waitForLoadState('networkidle');
  return page.url().split('/').pop() || 'ticket-id';
}

export async function findMatchingTicket(page: Page) {
  await page.goto('/dashboard/trading/matches');
  await page.waitForLoadState('networkidle');
  return page;
}

export async function completeEscrow(page: Page) {
  await page.click('button:has-text("Confirm")');
  await page.waitForNavigation();
}

export async function checkTradeStatus(page: Page) {
  const status = await page.locator('[data-testid="trade-status"]').textContent();
  return status;
}
