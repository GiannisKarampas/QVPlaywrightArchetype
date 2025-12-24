import { test } from '@core/fixtures/test.fixture';
import { VisualUtils } from '@core/utils/visual.utils';

test.describe('Homepage Visual Tests', () => {
  test('should match homepage screenshot', async ({ page, logger }) => {
    await test.step('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Wait for page to stabilize', async () => {
      await VisualUtils.waitForStableScreenshot(page);
    });

    await test.step('Compare homepage screenshot', async () => {
      await VisualUtils.compareScreenshot(page, 'homepage', {
        threshold: 0.2,
        fullPage: true,
      });
      logger.info('Homepage visual comparison passed');
    });
  });

  test('should match homepage header', async ({ page, logger }) => {
    await test.step('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Compare header screenshot', async () => {
      await VisualUtils.compareElement(page, 'header', 'homepage-header', {
        threshold: 0.1,
      });
      logger.info('Header visual comparison passed');
    });
  });

  test('should match homepage with masked dynamic elements', async ({ page, logger }) => {
    await test.step('Navigate to homepage', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Mask dynamic elements', async () => {
      await VisualUtils.maskElements(page, [
        '[data-testid="timestamp"]',
        '.advertisement',
        '.dynamic-content',
      ]);
    });

    await test.step('Compare screenshot with masked elements', async () => {
      await VisualUtils.compareScreenshot(page, 'homepage-masked', {
        threshold: 0.2,
      });
      logger.info('Masked homepage visual comparison passed');
    });
  });
});
