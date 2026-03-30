import { Page } from '@playwright/test';

export async function navigateToMemberships(page: Page) {
  await page.goto('/membership');
  await page.waitForLoadState('networkidle');
}

export async function purchaseMembership(page: Page, tier: string) {
  await page.click(`button:has-text("${tier}")`);
  await page.click('button:has-text("Purchase")');
  await page.waitForNavigation();
}

export async function getCurrentMembershipTier(page: Page) {
  const tier = await page.locator('[data-testid="current-tier"]').textContent();
  return tier;
}

export async function checkMembershipBenefits(page: Page) {
  return page;
}
