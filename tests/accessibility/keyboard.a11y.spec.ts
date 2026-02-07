import { test, expect } from '@core/fixtures/accessibility.fixture';

test.describe('Keyboard Navigation Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have correct tab order @a11y @critical', async ({ a11y }) => {
    await test.step('Verify tab order', async () => {
      const result = await a11y.checkTabOrder();
      expect(result.unreachableElements).toHaveLength(0);
      expect(result.reachableElements).toBeGreaterThan(0);
    });
  });

  test('should have visible focus indicators @a11y', async ({ a11y }) => {
    await test.step('Check focus indicators', async () => {
      const result = await a11y.checkFocusIndicators();
      expect(result.isValid).toBeTruthy();
      expect(result.issues).toHaveLength(0);
    });
  });

  test('should have valid ARIA roles @a11y', async ({ a11y }) => {
    await test.step('Check ARIA roles', async () => {
      const result = await a11y.checkAriaRoles();
      expect(result.violationCount).toBe(0);
    });
  });

  test('should support keyboard navigation in forms @a11y', async ({ page, a11y }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await test.step('Check form tab order', async () => {
      const result = await a11y.checkTabOrder();
      expect(result.reachableElements).toBeGreaterThan(0);
      expect(result.issuesFound).toHaveLength(0);
    });

    await test.step('Check form focus indicators', async () => {
      const result = await a11y.checkFocusIndicators();
      expect(result.isValid).toBeTruthy();
    });
  });
});
