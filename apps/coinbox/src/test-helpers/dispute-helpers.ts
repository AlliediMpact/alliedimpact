import { Page } from '@playwright/test';

export async function createDispute(page: Page, options: { tradeId?: string; reason: string }) {
  if (options.tradeId) {
    await page.goto(`/dashboard/trades/${options.tradeId}`);
  }
  await page.click('button:has-text("Report Issue")');
  await page.fill('textarea[name="reason"]', options.reason);
  await page.click('button:has-text("Submit Dispute")');
  await page.waitForLoadState('networkidle');
  return page.url().split('/').pop() || 'dispute-id';
}

export async function submitEvidence(page: Page, disputeId: string, options?: { type?: string; file?: string; description?: string }) {
  await page.click('button:has-text("Upload Evidence")');
  if (options?.file) {
    await page.locator('input[type="file"]').setInputFiles(options.file);
  }
  if (options?.description) {
    await page.fill('textarea[name="evidence"]', options.description);
  }
  await page.click('button:has-text("Submit")');
  await page.waitForLoadState('networkidle');
}

export async function getDisputeStatus(page: Page) {
  const status = await page.locator('[data-testid="dispute-status"]').textContent();
  return status;
}

export async function createMockDispute(page: Page, options: any) {
  return createDispute(page, options);
}

export async function submitDisputeEvidence(page: Page, disputeId: string, options?: any) {
  return submitEvidence(page, disputeId, options);
}

export async function checkDisputeStatus(page: Page) {
  return getDisputeStatus(page);
}

export async function resolveDispute(page: Page, disputeId: string, resolution: string) {
  await page.goto(`/dashboard/disputes/${disputeId}`);
  await page.fill('textarea[name="resolution"]', resolution);
  await page.click('button:has-text("Resolve")');
  await page.waitForLoadState('networkidle');
}
