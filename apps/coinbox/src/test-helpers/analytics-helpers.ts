import { Page } from '@playwright/test';

export async function navigateToAnalytics(page: Page) {
  await page.goto('/dashboard/analytics');
  await page.waitForLoadState('networkidle');
}

export async function exportData(page: Page, dataType: string, format?: string) {
  await page.click('button:has-text("Export")');
  if (format) {
    await page.selectOption('select[name="format"]', format);
  }
  await page.click('button:has-text("Download")');
  await page.waitForLoadState('networkidle');
}

export async function checkAnalyticsData(page: Page) {
  const dataVisible = await page.locator('[data-testid="analytics-chart"]').isVisible();
  return dataVisible;
}

export async function selectDateRange(page: Page, startDate: string, endDate: string) {
  await page.fill('input[data-testid="start-date"]', startDate);
  await page.fill('input[data-testid="end-date"]', endDate);
  await page.click('button:has-text("Apply")');
  await page.waitForLoadState('networkidle');
}

export async function selectExportFormat(page: Page, format: string) {
  await page.selectOption('select[name="format"]', format);
}

export async function triggerExport(page: Page, dataType: string) {
  await page.click('button:has-text("Export")');
  await page.waitForLoadState('networkidle');
}

export async function verifyExportSuccess(page: Page) {
  const successMessage = await page.locator('[data-testid="export-success"]').isVisible();
  return successMessage;
}
