import { test as base } from '@playwright/test';
import { createLogger } from '@core/helpers/logger';
import { Logger } from 'winston';

/**
 * Enhanced test fixture with additional functionality
 *
 * Use this when you need:
 * - Logging (logger fixture)
 * - Test metadata (testContext)
 * - Auto-screenshot on failure (built-in)
 *
 * Otherwise, use base Playwright test directly:
 * import { test } from '@playwright/test';
 */

type TestFixtures = {
  logger: Logger;
  testContext: {
    testName: string;
    testFile: string;
    startTime: Date;
  };
};

export const test = base.extend<TestFixtures>({
  // Logger fixture - creates a logger instance per test
  logger: async ({}, use, testInfo) => {
    const logger = createLogger(`Test: ${testInfo.title}`);
    logger.info(`▶ Starting test: ${testInfo.title}`);
    logger.debug(`File: ${testInfo.file}`);
    logger.debug(`Project: ${testInfo.project.name}`);

    await use(logger);

    const duration = testInfo.duration;
    const status = testInfo.status;

    if (status === 'passed') {
      logger.info(`✓ Test passed (${duration}ms)`);
    } else if (status === 'failed') {
      logger.error(`✗ Test failed (${duration}ms)`);
    } else {
      logger.warn(`⊘ Test ${status} (${duration}ms)`);
    }
  },

  // Test context fixture - provides test metadata
  testContext: async ({}, use, testInfo) => {
    const context = {
      testName: testInfo.title,
      testFile: testInfo.file,
      startTime: new Date(),
    };

    await use(context);
  },

  // Enhanced page with browser console capturing
  page: async ({ page, logger }, use, testInfo) => {
    // Capture browser console logs
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'error') {
        logger.error(`Browser console error: ${text}`);
      } else if (type === 'warning') {
        logger.warn(`Browser console warning: ${text}`);
      } else if (type === 'log') {
        logger.debug(`Browser console: ${text}`);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      logger.error(`Page error: ${error.message}`, { stack: error.stack });
    });

    // Capture failed requests
    page.on('requestfailed', (request) => {
      logger.warn(`Request failed: ${request.url()}`, {
        method: request.method(),
        failure: request.failure()?.errorText,
      });
    });

    await use(page);

    // Auto-screenshot on failure is already handled by Playwright config
    // But we log it here for visibility
    if (testInfo.status === 'failed') {
      logger.error('Test failed - screenshot and trace available in test results');
    }
  },
});

export { expect } from '@playwright/test';
