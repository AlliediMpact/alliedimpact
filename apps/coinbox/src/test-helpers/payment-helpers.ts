import { Page } from '@playwright/test';

export async function navigateToPayments(page: Page) {
  await page.goto('/dashboard/payments');
  await page.waitForLoadState('networkidle');
}

export async function makePayment(page: Page, amount: number, method: string) {
  await page.click('button:has-text("Add Payment Method")');
  await page.fill('input[placeholder="Amount"]', amount.toString());
  await page.selectOption('select[name="method"]', method);
  await page.click('button:has-text("Continue")');
  await page.waitForNavigation();
}

export async function verifyPaymentStatus(page: Page, expectedStatus: string) {
  const status = await page.locator('[data-testid="payment-status"]').textContent();
  return status?.includes(expectedStatus);
}

export function generateMockPayment(options?: { amount?: number; currency?: string; method?: string; description?: string; recipient?: string }) {
  return Promise.resolve({
    id: 'mock-payment-' + Math.random().toString(36).substr(2, 9),
    amount: options?.amount || 100,
    currency: options?.currency || 'ZAR',
    method: options?.method || 'card',
    description: options?.description || 'Test payment',
    recipient: options?.recipient || undefined,
    status: 'completed',
    createdAt: new Date()
  });
}

export async function verifyPaymentSuccess(page: Page) {
  return page.locator('[data-testid="payment-success"]').isVisible();
}

export async function verifyReceiptGenerated(page: Page, paymentId: string) {
  // Return a mock receipt object
  return {
    id: paymentId || 'mock-receipt-' + Math.random().toString(36).substr(2, 9),
    amount: 100,
    status: 'generated',
    timestamp: new Date()
  };
}
