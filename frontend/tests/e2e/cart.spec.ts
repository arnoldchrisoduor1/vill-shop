import { test, expect } from '@playwright/test';

test.describe('Cart', () => {
  test('cart drawer opens when clicking cart button', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Cart"]');
    await expect(page.getByText('Cart')).toBeVisible();
  });

  test('cart shows empty state by default', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Cart"]');
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });

  test('checkout redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/login/);
  });
});
