import { test, expect } from '@core/fixtures/accessibility.fixture';
import { WCAGLevel, A11yImpact } from '@core/types/accessibility.types';

test.describe('Homepage Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should pass WCAG 2.1 AA full scan @a11y @critical', async ({ a11y }) => {
    await test.step('Run full accessibility scan', async () => {
      const result = await a11y.scan({ wcagLevel: WCAGLevel.WCAG21AA });
      expect(result.violationCount).toBe(0);
    });
  });

  test('should have no critical or serious violations @a11y @smoke', async ({ a11y }) => {
    await test.step('Run scan with impact threshold', async () => {
      const result = await a11y.scan();
      const criticalOrSerious = result.violations.filter(
        (v) => v.impact === A11yImpact.CRITICAL || v.impact === A11yImpact.SERIOUS,
      );
      expect(criticalOrSerious).toHaveLength(0);
    });
  });

  test('should have valid heading hierarchy @a11y', async ({ a11y }) => {
    await test.step('Check heading hierarchy', async () => {
      const result = await a11y.checkHeadingHierarchy();
      expect(result.isValid).toBeTruthy();
      expect(result.issues).toHaveLength(0);
    });
  });

  test('should have adequate color contrast @a11y', async ({ a11y }) => {
    await test.step('Check color contrast', async () => {
      const result = await a11y.checkColorContrast();
      expect(result.violationCount).toBe(0);
    });
  });

  test('should have descriptive link and button text @a11y', async ({ a11y }) => {
    await test.step('Check link and button text', async () => {
      const result = await a11y.checkLinkButtonText();
      expect(result.isValid).toBeTruthy();
      expect(result.issues).toHaveLength(0);
    });
  });
});
