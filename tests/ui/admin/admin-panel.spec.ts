import { test, expect } from '@playwright/test';

// Use admin authentication for all tests in this file
test.use({ storageState: '.auth/admin.json' });

test.describe('Admin Panel Tests', () => {
  test('admin can access admin panel', async ({ page }) => {
    await page.goto('/admin');

    await test.step('Verify admin panel is accessible', async () => {
      await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible();
    });

    await test.step('Verify admin navigation is present', async () => {
      await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible();
    });
  });

  test('admin can view user management', async ({ page }) => {
    await page.goto('/admin/users');

    await test.step('Verify user management page', async () => {
      await expect(page.locator('[data-testid="user-table"]')).toBeVisible();
    });

    await test.step('Verify admin actions are available', async () => {
      await expect(page.locator('[data-testid="delete-user-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="edit-user-button"]')).toBeVisible();
    });
  });

  test('admin can access system settings', async ({ page }) => {
    await page.goto('/admin/settings');

    await test.step('Verify settings page is accessible', async () => {
      await expect(page.locator('[data-testid="system-settings"]')).toBeVisible();
    });
  });
});
