import { Page, APIRequestContext, BrowserContext } from '@playwright/test';
import { Logger } from 'winston';

export interface ITestFixtures {
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
  logger: Logger;
}

export interface IAPIFixtures {
  apiContext: APIRequestContext;
  authToken: string;
}

export interface ICustomTestInfo {
  testName: string;
  testFile: string;
  testStatus: 'passed' | 'failed' | 'skipped';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  error?: Error;
}

export interface ITestResult {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: Error;
}

export interface IWaitOptions {
  timeout?: number;
  interval?: number;
  throwOnTimeout?: boolean;
}

export interface IRetryOptions {
  maxAttempts: number;
  delay: number;
  backoff?: 'linear' | 'exponential';
  maxDelay?: number;
}

export interface IScreenshotOptions {
  fullPage?: boolean;
  path?: string;
  quality?: number;
  type?: 'png' | 'jpeg';
}

export interface IVisualComparisonOptions {
  threshold?: number;
  maxDiffPixels?: number;
  fullPage?: boolean;
}
