import { test as base, Page } from '@playwright/test';
import { AccessibilityUtils } from '@core/utils/accessibility.utils';
import {
  IA11yScanOptions,
  IA11yScanResult,
  IKeyboardNavResult,
  IHeadingHierarchyResult,
  IFormA11yResult,
  ILinkButtonTextResult,
  IFocusIndicatorResult,
} from '@core/types/accessibility.types';
import { env } from '@config/environment.config';

/**
 * Accessibility fixture helper that wraps AccessibilityUtils methods with a bound page
 *
 * Usage:
 * ```typescript
 * import { test, expect } from '@core/fixtures/accessibility.fixture';
 *
 * test('page should be accessible', async ({ page, a11y }) => {
 *   await page.goto('/');
 *   await a11y.assertNoViolations();
 * });
 * ```
 */
class A11yFixtureHelper {
  constructor(private page: Page) {}

  async scan(options?: IA11yScanOptions): Promise<IA11yScanResult> {
    return AccessibilityUtils.scanPage(this.page, options);
  }

  async scanElement(selector: string, options?: IA11yScanOptions): Promise<IA11yScanResult> {
    return AccessibilityUtils.scanElement(this.page, selector, options);
  }

  async assertNoViolations(options?: IA11yScanOptions): Promise<void> {
    return AccessibilityUtils.assertNoViolations(this.page, options);
  }

  async assertElementNoViolations(selector: string, options?: IA11yScanOptions): Promise<void> {
    return AccessibilityUtils.assertElementNoViolations(this.page, selector, options);
  }

  async checkTabOrder(maxTabs?: number): Promise<IKeyboardNavResult> {
    return AccessibilityUtils.checkTabOrder(this.page, maxTabs);
  }

  async checkHeadingHierarchy(): Promise<IHeadingHierarchyResult> {
    return AccessibilityUtils.checkHeadingHierarchy(this.page);
  }

  async checkFormAccessibility(formSelector?: string): Promise<IFormA11yResult> {
    return AccessibilityUtils.checkFormAccessibility(this.page, formSelector);
  }

  async checkLinkButtonText(): Promise<ILinkButtonTextResult> {
    return AccessibilityUtils.checkLinkButtonText(this.page);
  }

  async checkFocusIndicators(): Promise<IFocusIndicatorResult> {
    return AccessibilityUtils.checkFocusIndicators(this.page);
  }

  async checkAriaRoles(options?: IA11yScanOptions): Promise<IA11yScanResult> {
    return AccessibilityUtils.checkAriaRoles(this.page, options);
  }

  async checkColorContrast(options?: IA11yScanOptions): Promise<IA11yScanResult> {
    return AccessibilityUtils.checkColorContrast(this.page, options);
  }
}

type A11yFixtures = {
  a11y: A11yFixtureHelper;
};

export const test = base.extend<A11yFixtures>({
  a11y: async ({ page }, use, testInfo) => {
    const helper = new A11yFixtureHelper(page);

    // Optional auto-scan on navigation
    if (env.get('a11yAutoScanOnNavigation')) {
      page.on('load', async () => {
        try {
          await AccessibilityUtils.scanPage(page);
        } catch {
          // Auto-scan failures should not break tests
        }
      });
    }

    await use(helper);

    // After each test: attach reports if there are scan results
    const results = AccessibilityUtils.getScanResults();
    if (results.length > 0) {
      const textReport = AccessibilityUtils.generateReport();
      await testInfo.attach('accessibility-report', {
        body: textReport,
        contentType: 'text/plain',
      });

      const jsonReport = JSON.stringify(
        {
          totalScans: results.length,
          totalViolations: results.reduce((sum, r) => sum + r.violationCount, 0),
          scanResults: results,
          generatedAt: new Date().toISOString(),
        },
        null,
        2,
      );
      await testInfo.attach('accessibility-report-json', {
        body: jsonReport,
        contentType: 'application/json',
      });
    }

    // Clear scan results for isolation
    AccessibilityUtils.clearScanResults();
  },
});

export { expect } from '@playwright/test';
