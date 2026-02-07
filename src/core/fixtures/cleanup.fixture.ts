import { test as base } from '@playwright/test';
import { CleanupHelper } from '@core/helpers/cleanup.helper';

/**
 * Test fixture that provides automatic cleanup
 *
 * Usage:
 * ```typescript
 * import { test, expect } from '@core/fixtures/cleanup.fixture';
 *
 * test('create user', async ({ cleanup }) => {
 *   const user = await createUser();
 *   cleanup.addUser(user.id);
 *   // User will be automatically cleaned up after test
 * });
 * ```
 */

type CleanupFixtures = {
  cleanup: CleanupHelper;
};

export const test = base.extend<CleanupFixtures>({
  cleanup: async ({}, use) => {
    const cleanupHelper = new CleanupHelper();

    // Provide cleanup helper to test
    await use(cleanupHelper);

    // Automatically cleanup after test
    await cleanupHelper.cleanup();
  },
});

export { expect } from '@playwright/test';
