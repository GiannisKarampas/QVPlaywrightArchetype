import { Page, expect } from '@playwright/test';
import { IVisualComparisonOptions, IScreenshotOptions } from '@types/test.types';
import { env } from '@config/environment.config';
import logger from '@core/helpers/logger';
import * as path from 'path';

export class VisualUtils {
  static async takeScreenshot(
    page: Page,
    name: string,
    options: IScreenshotOptions = {},
  ): Promise<string> {
    const { fullPage = true, quality = 90, type = 'png' } = options;

    const screenshotPath =
      options.path || path.join(process.cwd(), 'reports', 'screenshots', `${name}.${type}`);

    logger.debug(`Taking screenshot: ${screenshotPath}`);

    await page.screenshot({
      path: screenshotPath,
      fullPage,
      quality: type === 'jpeg' ? quality : undefined,
      type,
    });

    logger.info(`Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  static async compareScreenshot(
    page: Page,
    name: string,
    options: IVisualComparisonOptions = {},
  ): Promise<void> {
    const {
      threshold = env.get('visualThreshold'),
      maxDiffPixels,
      fullPage = true,
    } = options;

    logger.debug(`Comparing screenshot: ${name}`);

    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage,
      threshold,
      maxDiffPixels,
    });

    logger.info(`Visual comparison passed: ${name}`);
  }

  static async compareElement(
    page: Page,
    selector: string,
    name: string,
    options: IVisualComparisonOptions = {},
  ): Promise<void> {
    const { threshold = env.get('visualThreshold'), maxDiffPixels } = options;

    logger.debug(`Comparing element screenshot: ${name}`);

    const element = page.locator(selector);
    await expect(element).toHaveScreenshot(`${name}.png`, {
      threshold,
      maxDiffPixels,
    });

    logger.info(`Element visual comparison passed: ${name}`);
  }

  static async takeElementScreenshot(
    page: Page,
    selector: string,
    name: string,
    options: IScreenshotOptions = {},
  ): Promise<string> {
    const { quality = 90, type = 'png' } = options;

    const screenshotPath =
      options.path || path.join(process.cwd(), 'reports', 'screenshots', `${name}.${type}`);

    logger.debug(`Taking element screenshot: ${screenshotPath}`);

    const element = page.locator(selector);
    await element.screenshot({
      path: screenshotPath,
      quality: type === 'jpeg' ? quality : undefined,
      type,
    });

    logger.info(`Element screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  static async waitForStableScreenshot(
    page: Page,
    options: { timeout?: number; pollInterval?: number } = {},
  ): Promise<void> {
    const { timeout = 5000, pollInterval = 100 } = options;
    const startTime = Date.now();

    logger.debug('Waiting for stable screenshot...');

    let previousScreenshot = await page.screenshot();
    await this.sleep(pollInterval);

    while (Date.now() - startTime < timeout) {
      const currentScreenshot = await page.screenshot();

      if (Buffer.compare(previousScreenshot, currentScreenshot) === 0) {
        logger.debug('Screenshot stabilized');
        return;
      }

      previousScreenshot = currentScreenshot;
      await this.sleep(pollInterval);
    }

    logger.warn('Screenshot did not stabilize within timeout');
  }

  static async maskElements(
    page: Page,
    selectors: string[],
  ): Promise<void> {
    for (const selector of selectors) {
      try {
        await page.locator(selector).evaluate((element: Element) => {
          (element as HTMLElement).style.visibility = 'hidden';
        });
      } catch (error) {
        logger.warn(`Failed to mask element: ${selector}`);
      }
    }
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const takeScreenshot = VisualUtils.takeScreenshot.bind(VisualUtils);
export const compareScreenshot = VisualUtils.compareScreenshot.bind(VisualUtils);
export const compareElement = VisualUtils.compareElement.bind(VisualUtils);
