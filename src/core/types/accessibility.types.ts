/**
 * Accessibility Testing Type Definitions
 *
 * Types and interfaces for WCAG compliance testing using axe-core and custom checks
 */

export enum WCAGLevel {
  WCAG2A = 'wcag2a',
  WCAG2AA = 'wcag2aa',
  WCAG2AAA = 'wcag2aaa',
  WCAG21A = 'wcag21a',
  WCAG21AA = 'wcag21aa',
}

export enum A11yImpact {
  CRITICAL = 'critical',
  SERIOUS = 'serious',
  MODERATE = 'moderate',
  MINOR = 'minor',
}

export interface IA11yViolation {
  id: string;
  impact: A11yImpact;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
  tags: string[];
}

export interface IA11yScanOptions {
  wcagLevel?: WCAGLevel;
  impactThreshold?: A11yImpact;
  includeSelectors?: string[];
  excludeSelectors?: string[];
  rules?: string[];
  disableRules?: string[];
}

export interface IA11yScanResult {
  url: string;
  timestamp: string;
  wcagLevel: WCAGLevel;
  violations: IA11yViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  violationCount: number;
  scanScope: 'page' | 'element';
  selector?: string;
}

export interface IKeyboardNavResult {
  totalInteractiveElements: number;
  reachableElements: number;
  unreachableElements: string[];
  tabOrder: string[];
  issuesFound: string[];
}

export interface IHeadingHierarchyResult {
  headings: Array<{ level: number; text: string }>;
  isValid: boolean;
  issues: string[];
}

export interface IFormA11yResult {
  formSelector: string;
  fields: Array<{
    selector: string;
    hasLabel: boolean;
    hasAriaLabel: boolean;
    hasAriaDescribedby: boolean;
    hasRequiredIndicator: boolean;
    issues: string[];
  }>;
  isValid: boolean;
  issues: string[];
}

export interface ILinkButtonTextResult {
  elements: Array<{
    selector: string;
    tagName: string;
    text: string;
    issue: 'empty' | 'generic' | null;
  }>;
  isValid: boolean;
  issues: string[];
}

export interface IFocusIndicatorResult {
  elements: Array<{
    selector: string;
    hasFocusIndicator: boolean;
    outlineStyle?: string;
    boxShadow?: string;
  }>;
  isValid: boolean;
  issues: string[];
}

export interface IA11yAggregateReport {
  totalScans: number;
  totalViolations: number;
  violationsByImpact: Record<A11yImpact, number>;
  scanResults: IA11yScanResult[];
  generatedAt: string;
}
