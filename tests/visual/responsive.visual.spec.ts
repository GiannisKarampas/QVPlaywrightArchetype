import { test, devices } from '@playwright/test';
import { VisualUtils } from '@core/utils/visual.utils';
import logger from '@core/helpers/logger';

test.describe('Responsive Design Visual Tests', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`should match ${viewport.name} viewport`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });

      const page = await context.newPage();

      await test.step(`Navigate on ${viewport.name}`, async () => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
      });

      await test.step(`Compare ${viewport.name} screenshot`, async () => {
        await VisualUtils.compareScreenshot(page, `homepage-${viewport.name}`, {
          threshold: 0.2,
          fullPage: true,
        });
        logger.info(`${viewport.name} visual comparison passed`);
      });

      await context.close();
    });
  }

  test('should match on iPhone 12', async ({ browser }) => {
    const context = await browser.newContext(devices['iPhone 12']);
    const page = await context.newPage();

    await test.step('Navigate on iPhone 12', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Compare iPhone 12 screenshot', async () => {
      await VisualUtils.compareScreenshot(page, 'homepage-iphone12', {
        threshold: 0.2,
      });
      logger.info('iPhone 12 visual comparison passed');
    });

    await context.close();
  });

  test('should match on iPad Pro', async ({ browser }) => {
    const context = await browser.newContext(devices['iPad Pro']);
    const page = await context.newPage();

    await test.step('Navigate on iPad Pro', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Compare iPad Pro screenshot', async () => {
      await VisualUtils.compareScreenshot(page, 'homepage-ipadpro', {
        threshold: 0.2,
      });
      logger.info('iPad Pro visual comparison passed');
    });

    await context.close();
  });
});
