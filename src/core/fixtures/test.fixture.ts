import { test as base } from '@playwright/test';
import { createLogger } from '@core/helpers/logger';
import { env } from '@config/environment.config';
import { Logger } from 'winston';

type TestFixtures = {
  logger: Logger;
  testContext: {
    testName: string;
    testFile: string;
    startTime: Date;
  };
};

export const test = base.extend<TestFixtures>({
  logger: async ({}, use, testInfo) => {
    const logger = createLogger(`Test: ${testInfo.title}`);
    logger.info(`Starting test: ${testInfo.title}`);
    logger.info(`Environment: ${env.get('testEnv')}`);

    await use(logger);

    const duration = testInfo.duration;
    const status = testInfo.status;
    logger.info(`Test completed: ${status} (${duration}ms)`);
  },

  testContext: async ({}, use, testInfo) => {
    const context = {
      testName: testInfo.title,
      testFile: testInfo.file,
      startTime: new Date(),
    };

    await use(context);
  },

  page: async ({ page, logger }, use, testInfo) => {
    logger.debug('Page fixture initialized');

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        logger.error(`Browser console error: ${text}`);
      } else if (type === 'warning') {
        logger.warn(`Browser console warning: ${text}`);
      }
    });

    page.on('pageerror', (error) => {
      logger.error(`Page error: ${error.message}`);
    });

    page.on('requestfailed', (request) => {
      logger.warn(`Request failed: ${request.url()} - ${request.failure()?.errorText}`);
    });

    await use(page);

    if (testInfo.status === 'failed' && env.get('screenshotOnFailure')) {
      const screenshotPath = testInfo.outputPath('failure-screenshot.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      testInfo.attach('failure-screenshot', {
        path: screenshotPath,
        contentType: 'image/png',
      });
      logger.info(`Failure screenshot saved: ${screenshotPath}`);
    }
  },
});

export { expect } from '@playwright/test';
