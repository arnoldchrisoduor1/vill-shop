import { test, expect } from '@playwright/test';
import { TEST_USER, loginAs } from './fixtures';

test.describe('Authentication', () => {
  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('Create Account')).toBeVisible();
  });

  test('user can register', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[placeholder*="John"]', TEST_USER.name);
    await page.fill('input[type="email"]', TEST_USER.email);
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill(TEST_USER.password);
    await passwordInputs[1].fill(TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/account');
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Sign In')).toBeVisible();
  });

  test('wrong credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
  });

  test('protected route redirects to login', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/\/login/);
  });
});
