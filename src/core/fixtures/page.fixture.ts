/**
 * DEPRECATED: This fixture is no longer needed with global-setup approach
 *
 * Authentication is now handled by global-setup.ts which creates:
 * - .auth/user.json (regular user)
 * - .auth/admin.json (admin user)
 *
 * These are automatically loaded via playwright.config.ts storageState
 *
 * For authenticated tests, simply use:
 *
 * import { test } from '@playwright/test';
 * // or
 * import { test } from '@core/fixtures/base.fixture';  // if you need logger
 *
 * test('my test', async ({ page }) => {
 *   // page is already authenticated!
 *   await page.goto('/dashboard');
 * });
 *
 * For admin tests, use the chromium-admin project:
 * npx playwright test --project=chromium-admin
 *
 * Or in the test file:
 * test.use({ storageState: '.auth/admin.json' });
 */

import { test as base } from '@playwright/test';

export const test = base;
export { expect } from '@playwright/test';
