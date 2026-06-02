import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

test.describe('Admin Panel', () => {
  test('admin can login and access dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/dashboard');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('admin dashboard shows revenue cards', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/dashboard');
    await expect(page.getByText(/Revenue/)).toBeVisible();
  });

  test('admin products page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/products');
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('admin feature flags page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/feature-flags');
    await expect(page.getByText('Feature Flags')).toBeVisible();
  });

  test('non-admin redirected from admin pages', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
