import { test, expect } from '@playwright/test';

test.describe('Browse', () => {
  test('homepage loads with hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('products page loads', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByText(/Products/)).toBeVisible();
  });

  test('events page loads', async ({ page }) => {
    await page.goto('/events');
    await expect(page.getByText('Upcoming Events')).toBeVisible();
  });

  test('navbar has cart button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav button[aria-label="Cart"]')).toBeVisible();
  });
});
