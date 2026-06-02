import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

test.describe('Account', () => {
  test('account page loads for logged in user', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/account');
    await expect(page.getByText('Profile Information')).toBeVisible();
  });

  test('orders page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/account/orders');
    await expect(page.getByText('My Orders')).toBeVisible();
  });

  test('wishlist page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/account/wishlist');
    await expect(page.getByText('My Wishlist')).toBeVisible();
  });
});
