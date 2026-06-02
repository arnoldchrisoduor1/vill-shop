import type { Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/account');
}

export async function loginAsAdmin(page: Page) {
  return loginAs(page, 'admin@villshop.local', 'password');
}

export const TEST_USER = {
  name: 'Test User',
  email: `test-${Date.now()}@villshop.test`,
  password: 'TestPass123!',
};
