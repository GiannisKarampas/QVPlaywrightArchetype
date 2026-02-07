import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { env } from '@config/environment.config';
import logger from '@core/helpers/logger';
import { AccessibilityError } from '@core/errors/CustomErrors';
import {
  WCAGLevel,
  A11yImpact,
  IA11yScanOptions,
  IA11yScanResult,
  IA11yViolation,
  IKeyboardNavResult,
  IHeadingHierarchyResult,
  IFormA11yResult,
  ILinkButtonTextResult,
  IFocusIndicatorResult,
  IA11yAggregateReport,
} from '@core/types/accessibility.types';
import * as fs from 'fs';
import * as path from 'path';

const IMPACT_SEVERITY: Record<A11yImpact, number> = {
  [A11yImpact.CRITICAL]: 4,
  [A11yImpact.SERIOUS]: 3,
  [A11yImpact.MODERATE]: 2,
  [A11yImpact.MINOR]: 1,
};

const GENERIC_LINK_TEXTS = [
  'click here',
  'read more',
  'learn more',
  'more',
  'here',
  'link',
  'this',
];

/**
 * Accessibility testing utilities
 *
 * Provides tools for WCAG compliance testing using axe-core and custom DOM checks
 */
export class AccessibilityUtils {
  private static scanResults: IA11yScanResult[] = [];

  /**
   * Full page axe-core scan with WCAG level filtering
   */
  static async scanPage(page: Page, options: IA11yScanOptions = {}): Promise<IA11yScanResult> {
    const wcagLevel =
      options.wcagLevel || (env.get('a11yDefaultWcagLevel') as WCAGLevel) || WCAGLevel.WCAG2AA;

    logger.info(`Running accessibility scan on ${page.url()} (WCAG: ${wcagLevel})`);

    let builder = new AxeBuilder({ page }).withTags([wcagLevel]);

    if (options.rules?.length) {
      builder = builder.withRules(options.rules);
    }
    if (options.disableRules?.length) {
      builder = builder.disableRules(options.disableRules);
    }
    if (options.excludeSelectors?.length) {
      for (const selector of options.excludeSelectors) {
        builder = builder.exclude(selector);
      }
    }
    if (options.includeSelectors?.length) {
      for (const selector of options.includeSelectors) {
        builder = builder.include(selector);
      }
    }

    const results = await builder.analyze();

    const scanResult = this.mapAxeResults(results, page.url(), wcagLevel, 'page');

    this.scanResults.push(scanResult);
    logger.info(
      `Accessibility scan complete: ${scanResult.violationCount} violations found`,
    );

    return scanResult;
  }

  /**
   * Element-scoped axe-core scan
   */
  static async scanElement(
    page: Page,
    selector: string,
    options: IA11yScanOptions = {},
  ): Promise<IA11yScanResult> {
    const wcagLevel =
      options.wcagLevel || (env.get('a11yDefaultWcagLevel') as WCAGLevel) || WCAGLevel.WCAG2AA;

    logger.info(`Running accessibility scan on element: ${selector} (WCAG: ${wcagLevel})`);

    let builder = new AxeBuilder({ page }).withTags([wcagLevel]).include(selector);

    if (options.rules?.length) {
      builder = builder.withRules(options.rules);
    }
    if (options.disableRules?.length) {
      builder = builder.disableRules(options.disableRules);
    }
    if (options.excludeSelectors?.length) {
      for (const excludeSelector of options.excludeSelectors) {
        builder = builder.exclude(excludeSelector);
      }
    }

    const results = await builder.analyze();

    const scanResult = this.mapAxeResults(
      results,
      page.url(),
      wcagLevel,
      'element',
      selector,
    );

    this.scanResults.push(scanResult);
    logger.info(
      `Element scan complete for ${selector}: ${scanResult.violationCount} violations found`,
    );

    return scanResult;
  }

  /**
   * Throws AccessibilityError if violations found
   */
  static async assertNoViolations(
    page: Page,
    options: IA11yScanOptions = {},
  ): Promise<void> {
    const result = await this.scanPage(page, options);

    const filtered = this.filterByImpact(result.violations, options.impactThreshold);

    if (filtered.length > 0) {
      const summary = filtered
        .map((v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
        .join('\n');

      throw new AccessibilityError(
        `Found ${filtered.length} accessibility violations:\n${summary}`,
        filtered.length,
        result.wcagLevel,
        filtered.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length,
        })),
      );
    }

    logger.info('No accessibility violations found');
  }

  /**
   * Throws AccessibilityError if violations found for a specific element
   */
  static async assertElementNoViolations(
    page: Page,
    selector: string,
    options: IA11yScanOptions = {},
  ): Promise<void> {
    const result = await this.scanElement(page, selector, options);

    const filtered = this.filterByImpact(result.violations, options.impactThreshold);

    if (filtered.length > 0) {
      const summary = filtered
        .map((v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
        .join('\n');

      throw new AccessibilityError(
        `Found ${filtered.length} accessibility violations in "${selector}":\n${summary}`,
        filtered.length,
        result.wcagLevel,
        filtered.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length,
        })),
      );
    }

    logger.info(`No accessibility violations found for element: ${selector}`);
  }

  /**
   * ARIA-specific axe rules only
   */
  static async checkAriaRoles(
    page: Page,
    options: IA11yScanOptions = {},
  ): Promise<IA11yScanResult> {
    return this.scanPage(page, {
      ...options,
      rules: [
        'aria-allowed-attr',
        'aria-allowed-role',
        'aria-hidden-body',
        'aria-hidden-focus',
        'aria-required-attr',
        'aria-required-children',
        'aria-required-parent',
        'aria-roles',
        'aria-valid-attr',
        'aria-valid-attr-value',
        ...(options.rules || []),
      ],
    });
  }

  /**
   * Color contrast rules only
   */
  static async checkColorContrast(
    page: Page,
    options: IA11yScanOptions = {},
  ): Promise<IA11yScanResult> {
    return this.scanPage(page, {
      ...options,
      rules: ['color-contrast', ...(options.rules || [])],
    });
  }

  /**
   * Tab through page, record focus order, detect unreachable interactive elements
   */
  static async checkTabOrder(
    page: Page,
    maxTabs: number = 100,
  ): Promise<IKeyboardNavResult> {
    logger.info('Checking tab order and keyboard navigation');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: IKeyboardNavResult = await page.evaluate((max: number) => {
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
      const doc = (globalThis as any).document;
      const win = globalThis as any; // browser context

      const interactiveSelectors =
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const allInteractive = Array.from(doc.querySelectorAll(interactiveSelectors) as any[])
        .filter((el: any) => {
          const style = win.getComputedStyle(el);
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            !el.hasAttribute('disabled') &&
            el.getAttribute('aria-hidden') !== 'true'
          );
        })
        .map((el: any) => {
          const tag = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : '';
          const cls = el.className
            ? `.${String(el.className).split(' ').filter(Boolean).join('.')}`
            : '';
          return `${tag}${id}${cls}`;
        });

      const tabOrder: string[] = [];
      const startElement = doc.activeElement;

      for (let i = 0; i < max; i++) {
        const focusableElements = Array.from(
          doc.querySelectorAll(interactiveSelectors) as any[],
        ).filter((el: any) => {
          const style = win.getComputedStyle(el);
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            !el.hasAttribute('disabled')
          );
        });

        const currentIndex = focusableElements.indexOf(doc.activeElement);
        const nextIndex = (currentIndex + 1) % focusableElements.length;

        if (focusableElements[nextIndex]) {
          focusableElements[nextIndex].focus();
        }

        const focused = doc.activeElement;
        if (!focused || focused === doc.body || focused === startElement) break;

        const tag = focused.tagName.toLowerCase();
        const id = focused.id ? `#${focused.id}` : '';
        const cls = focused.className
          ? `.${String(focused.className).split(' ').filter(Boolean).join('.')}`
          : '';
        const descriptor = `${tag}${id}${cls}`;

        if (tabOrder.includes(descriptor)) break;
        tabOrder.push(descriptor);
      }

      const unreachable = allInteractive.filter((el: any) => !tabOrder.includes(el));

      return {
        totalInteractiveElements: allInteractive.length,
        reachableElements: tabOrder.length,
        unreachableElements: unreachable,
        tabOrder,
        issuesFound: unreachable.map(
          (el: any) => `Element not reachable via keyboard: ${el}`,
        ),
      };
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    }, maxTabs);

    logger.info(
      `Tab order check: ${result.reachableElements}/${result.totalInteractiveElements} elements reachable`,
    );

    return result;
  }

  /**
   * Verify h1-h6 order (no skips, single h1, starts with h1)
   */
  static async checkHeadingHierarchy(page: Page): Promise<IHeadingHierarchyResult> {
    logger.info('Checking heading hierarchy');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: IHeadingHierarchyResult = await page.evaluate(() => {
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
      const doc = (globalThis as any).document;

      const headingElements = Array.from(
        doc.querySelectorAll('h1, h2, h3, h4, h5, h6') as any[],
      );
      const headings: Array<{ level: number; text: string }> = [];
      const issues: string[] = [];

      headingElements.forEach((el: any) => {
        const level = parseInt(el.tagName.charAt(1), 10);
        headings.push({ level, text: (el.textContent || '').trim() });
      });

      if (headings.length === 0) {
        issues.push('No headings found on the page');
        return { headings, isValid: false, issues };
      }

      if (headings[0].level !== 1) {
        issues.push(`Page should start with h1, but starts with h${headings[0].level}`);
      }

      const h1Count = headings.filter((h: any) => h.level === 1).length;
      if (h1Count === 0) {
        issues.push('No h1 heading found on the page');
      } else if (h1Count > 1) {
        issues.push(`Multiple h1 headings found (${h1Count}). Page should have a single h1`);
      }

      for (let i = 1; i < headings.length; i++) {
        const current = headings[i].level;
        const previous = headings[i - 1].level;
        if (current > previous + 1) {
          issues.push(
            `Heading level skipped: h${previous} to h${current} ("${headings[i].text}")`,
          );
        }
      }

      return { headings, isValid: issues.length === 0, issues };
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    });

    logger.info(`Heading hierarchy check: ${result.isValid ? 'passed' : 'failed'}`);
    return result;
  }

  /**
   * Check labels, aria-label, aria-describedby, required indicators
   */
  static async checkFormAccessibility(
    page: Page,
    formSelector?: string,
  ): Promise<IFormA11yResult> {
    const selector = formSelector || 'form';
    logger.info(`Checking form accessibility: ${selector}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: IFormA11yResult = await page.evaluate((sel: string) => {
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
      const doc = (globalThis as any).document;

      const form = doc.querySelector(sel);
      if (!form) {
        return {
          formSelector: sel,
          fields: [],
          isValid: false,
          issues: [`Form not found: ${sel}`],
        };
      }

      const inputs = Array.from(form.querySelectorAll('input, select, textarea') as any[]);
      const fields: Array<{
        selector: string;
        hasLabel: boolean;
        hasAriaLabel: boolean;
        hasAriaDescribedby: boolean;
        hasRequiredIndicator: boolean;
        issues: string[];
      }> = [];
      const formIssues: string[] = [];

      inputs.forEach((el: any) => {
        if (el.type === 'hidden' || el.type === 'submit' || el.type === 'button') return;

        const id = el.id;
        const tag = el.tagName.toLowerCase();
        const type = el.getAttribute('type') || '';
        const descriptor = id ? `${tag}#${id}` : `${tag}[type="${type}"]`;

        const hasLabel = id ? !!form.querySelector(`label[for="${id}"]`) : false;
        const hasAriaLabel = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
        const hasAriaDescribedby = el.hasAttribute('aria-describedby');
        const isRequired =
          el.hasAttribute('required') || el.getAttribute('aria-required') === 'true';
        const hasRequiredIndicator = isRequired;
        const fieldIssues: string[] = [];

        if (!hasLabel && !hasAriaLabel) {
          fieldIssues.push(`${descriptor}: Missing label or aria-label`);
        }

        if (isRequired && !hasAriaDescribedby && !hasLabel) {
          fieldIssues.push(`${descriptor}: Required field lacks accessible description`);
        }

        fields.push({
          selector: descriptor,
          hasLabel,
          hasAriaLabel,
          hasAriaDescribedby,
          hasRequiredIndicator,
          issues: fieldIssues,
        });

        formIssues.push(...fieldIssues);
      });

      return {
        formSelector: sel,
        fields,
        isValid: formIssues.length === 0,
        issues: formIssues,
      };
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    }, selector);

    logger.info(`Form accessibility check: ${result.isValid ? 'passed' : 'failed'}`);
    return result;
  }

  /**
   * Detect empty or generic link/button text
   */
  static async checkLinkButtonText(page: Page): Promise<ILinkButtonTextResult> {
    logger.info('Checking link and button text');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: ILinkButtonTextResult = await page.evaluate((genericTexts: string[]) => {
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
      const doc = (globalThis as any).document;
      const win = globalThis as any; // browser context

      const elements = Array.from(
        doc.querySelectorAll('a, button, [role="button"], [role="link"]') as any[],
      );
      const results: Array<{
        selector: string;
        tagName: string;
        text: string;
        issue: 'empty' | 'generic' | null;
      }> = [];
      const issues: string[] = [];

      elements.forEach((el: any) => {
        const style = win.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return;

        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const text = (
          el.textContent ||
          el.getAttribute('aria-label') ||
          el.getAttribute('title') ||
          ''
        ).trim();

        const hasAriaLabel = el.hasAttribute('aria-label');
        const hasImage = el.querySelector('img[alt]');

        let issue: 'empty' | 'generic' | null = null;

        if (!text && !hasAriaLabel && !hasImage) {
          issue = 'empty';
          issues.push(`${tag}${id}: Empty text (no accessible name)`);
        } else if (genericTexts.includes(text.toLowerCase())) {
          issue = 'generic';
          issues.push(`${tag}${id}: Generic text "${text}"`);
        }

        if (issue) {
          results.push({ selector: `${tag}${id}`, tagName: tag, text, issue });
        }
      });

      return { elements: results, isValid: issues.length === 0, issues };
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    }, GENERIC_LINK_TEXTS);

    logger.info(`Link/button text check: ${result.isValid ? 'passed' : 'failed'}`);
    return result;
  }

  /**
   * Compare computed styles before/after focus to detect visible focus indicators
   */
  static async checkFocusIndicators(page: Page): Promise<IFocusIndicatorResult> {
    logger.info('Checking focus indicators');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: IFocusIndicatorResult = await page.evaluate(() => {
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
      const doc = (globalThis as any).document;
      const win = globalThis as any; // browser context

      const focusableSelectors =
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(
        doc.querySelectorAll(focusableSelectors) as any[],
      ).filter((el: any) => {
        const style = win.getComputedStyle(el);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          !el.hasAttribute('disabled')
        );
      });

      const results: Array<{
        selector: string;
        hasFocusIndicator: boolean;
        outlineStyle?: string;
        boxShadow?: string;
      }> = [];
      const issues: string[] = [];

      const sampled = focusableElements.slice(0, 20);

      sampled.forEach((el: any) => {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const descriptor = `${tag}${id}`;

        const beforeStyle = win.getComputedStyle(el);
        const beforeOutline = beforeStyle.outline;
        const beforeBoxShadow = beforeStyle.boxShadow;
        const beforeBorder = beforeStyle.border;

        el.focus();

        const afterStyle = win.getComputedStyle(el);
        const afterOutline = afterStyle.outline;
        const afterBoxShadow = afterStyle.boxShadow;
        const afterBorder = afterStyle.border;

        el.blur();

        const hasVisibleOutline =
          afterOutline !== beforeOutline && afterOutline !== 'none' && afterOutline !== '';
        const hasBoxShadow =
          afterBoxShadow !== beforeBoxShadow &&
          afterBoxShadow !== 'none' &&
          afterBoxShadow !== '';
        const hasBorderChange = afterBorder !== beforeBorder;

        const hasFocusIndicator = hasVisibleOutline || hasBoxShadow || hasBorderChange;

        results.push({
          selector: descriptor,
          hasFocusIndicator,
          outlineStyle: afterOutline,
          boxShadow: afterBoxShadow,
        });

        if (!hasFocusIndicator) {
          issues.push(`${descriptor}: No visible focus indicator detected`);
        }
      });

      return { elements: results, isValid: issues.length === 0, issues };
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    });

    logger.info(`Focus indicator check: ${result.isValid ? 'passed' : 'failed'}`);
    return result;
  }

  /**
   * Generate text report of all accumulated scan results
   */
  static generateReport(): string {
    if (this.scanResults.length === 0) {
      return '\n=== Accessibility Report ===\nNo scans recorded.\n';
    }

    const totalViolations = this.scanResults.reduce((sum, r) => sum + r.violationCount, 0);
    const violationsByImpact = this.countByImpact();

    let report = `\n=== Accessibility Report ===\n`;
    report += `Total Scans: ${this.scanResults.length}\n`;
    report += `Total Violations: ${totalViolations}\n`;
    report += `By Impact:\n`;
    report += `  Critical: ${violationsByImpact[A11yImpact.CRITICAL] || 0}\n`;
    report += `  Serious: ${violationsByImpact[A11yImpact.SERIOUS] || 0}\n`;
    report += `  Moderate: ${violationsByImpact[A11yImpact.MODERATE] || 0}\n`;
    report += `  Minor: ${violationsByImpact[A11yImpact.MINOR] || 0}\n\n`;

    this.scanResults.forEach((result, index) => {
      report += `Scan ${index + 1}: ${result.url} (${result.scanScope}${result.selector ? ` - ${result.selector}` : ''})\n`;
      report += `  WCAG Level: ${result.wcagLevel}\n`;
      report += `  Violations: ${result.violationCount}, Passes: ${result.passes}, Incomplete: ${result.incomplete}\n`;

      if (result.violations.length > 0) {
        result.violations.forEach((v) => {
          report += `  - [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)\n`;
        });
      }
      report += '\n';
    });

    return report;
  }

  /**
   * Save JSON report to reports/accessibility/
   */
  static generateJSONReport(outputPath?: string): string {
    const reportDir = path.join(process.cwd(), 'reports', 'accessibility');
    fs.mkdirSync(reportDir, { recursive: true });

    const filePath =
      outputPath || path.join(reportDir, `a11y-report-${Date.now()}.json`);

    const report: IA11yAggregateReport = {
      totalScans: this.scanResults.length,
      totalViolations: this.scanResults.reduce((sum, r) => sum + r.violationCount, 0),
      violationsByImpact: this.countByImpact(),
      scanResults: this.scanResults,
      generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    logger.info(`Accessibility JSON report saved: ${filePath}`);

    return filePath;
  }

  /**
   * Get all accumulated scan results
   */
  static getScanResults(): IA11yScanResult[] {
    return [...this.scanResults];
  }

  /**
   * Clear all accumulated scan results
   */
  static clearScanResults(): void {
    this.scanResults = [];
    logger.debug('Accessibility scan results cleared');
  }

  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
  private static mapAxeResults(
    results: any,
    url: string,
    wcagLevel: WCAGLevel,
    scanScope: 'page' | 'element',
    selector?: string,
  ): IA11yScanResult {
    const violations: IA11yViolation[] = results.violations.map(
      (v: any) => ({
        id: v.id,
        impact: v.impact as A11yImpact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map((n: any) => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary || '',
        })),
        tags: v.tags,
      }),
    );

    return {
      url,
      timestamp: new Date().toISOString(),
      wcagLevel,
      violations,
      passes: results.passes?.length || 0,
      incomplete: results.incomplete?.length || 0,
      inapplicable: results.inapplicable?.length || 0,
      violationCount: violations.length,
      scanScope,
      selector,
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

  private static filterByImpact(
    violations: IA11yViolation[],
    threshold?: A11yImpact,
  ): IA11yViolation[] {
    if (!threshold) return violations;

    const thresholdSeverity = IMPACT_SEVERITY[threshold];
    return violations.filter(
      (v) => IMPACT_SEVERITY[v.impact] >= thresholdSeverity,
    );
  }

  private static countByImpact(): Record<A11yImpact, number> {
    const counts: Record<A11yImpact, number> = {
      [A11yImpact.CRITICAL]: 0,
      [A11yImpact.SERIOUS]: 0,
      [A11yImpact.MODERATE]: 0,
      [A11yImpact.MINOR]: 0,
    };

    for (const result of this.scanResults) {
      for (const violation of result.violations) {
        if (violation.impact in counts) {
          counts[violation.impact]++;
        }
      }
    }

    return counts;
  }
}

export const scanPage = AccessibilityUtils.scanPage.bind(AccessibilityUtils);
export const scanElement = AccessibilityUtils.scanElement.bind(AccessibilityUtils);
export const assertNoViolations = AccessibilityUtils.assertNoViolations.bind(AccessibilityUtils);
export const checkTabOrder = AccessibilityUtils.checkTabOrder.bind(AccessibilityUtils);
export const checkHeadingHierarchy =
  AccessibilityUtils.checkHeadingHierarchy.bind(AccessibilityUtils);
export const checkFormAccessibility =
  AccessibilityUtils.checkFormAccessibility.bind(AccessibilityUtils);
export const checkLinkButtonText =
  AccessibilityUtils.checkLinkButtonText.bind(AccessibilityUtils);
export const checkFocusIndicators =
  AccessibilityUtils.checkFocusIndicators.bind(AccessibilityUtils);
