import { test, expect } from '@core/fixtures/accessibility.fixture';

test.describe('Forms Accessibility Tests', () => {
  test('should have accessible login form @a11y @critical', async ({ page, a11y }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await test.step('Check form labels and aria attributes', async () => {
      const result = await a11y.checkFormAccessibility('form');
      expect(result.isValid).toBeTruthy();
      expect(result.issues).toHaveLength(0);
    });

    await test.step('Run axe scan on login form', async () => {
      const result = await a11y.scanElement('form');
      expect(result.violationCount).toBe(0);
    });
  });

  test('should have accessible registration form @a11y', async ({ page, a11y }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await test.step('Check form labels and aria attributes', async () => {
      const result = await a11y.checkFormAccessibility('form');
      expect(result.isValid).toBeTruthy();
      expect(result.issues).toHaveLength(0);
    });

    await test.step('Run axe scan on registration form', async () => {
      const result = await a11y.scanElement('form');
      expect(result.violationCount).toBe(0);
    });
  });
});

// Disable pre-authenticated state for login/register pages
test.use({ storageState: undefined });
