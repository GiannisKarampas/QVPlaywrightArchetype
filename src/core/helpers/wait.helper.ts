import { Page } from '@playwright/test';
import { IWaitOptions } from '../../types/test.types';
import logger from './logger';

export class WaitHelper {
  static async waitForCondition(
    condition: () => Promise<boolean> | boolean,
    options: IWaitOptions = {},
  ): Promise<void> {
    const { timeout = 30000, interval = 500, throwOnTimeout = true } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await condition();
        if (result) {
          logger.debug('Wait condition met');
          return;
        }
      } catch (error) {
        logger.debug(`Wait condition check failed: ${(error as Error).message}`);
      }

      await this.sleep(interval);
    }

    const message = `Wait condition not met after ${timeout}ms`;
    logger.warn(message);

    if (throwOnTimeout) {
      throw new Error(message);
    }
  }

  static async waitForElement(
    page: Page,
    selector: string,
    options: IWaitOptions = {},
  ): Promise<void> {
    const { timeout = 30000 } = options;
    logger.debug(`Waiting for element: ${selector}`);

    try {
      await page.waitForSelector(selector, { timeout, state: 'visible' });
      logger.debug(`Element found: ${selector}`);
    } catch (error) {
      logger.error(`Element not found: ${selector}`);
      throw error;
    }
  }

  static async waitForElementHidden(
    page: Page,
    selector: string,
    options: IWaitOptions = {},
  ): Promise<void> {
    const { timeout = 30000 } = options;
    logger.debug(`Waiting for element to be hidden: ${selector}`);

    try {
      await page.waitForSelector(selector, { timeout, state: 'hidden' });
      logger.debug(`Element hidden: ${selector}`);
    } catch (error) {
      logger.error(`Element still visible: ${selector}`);
      throw error;
    }
  }

  static async waitForNavigation(page: Page, options: IWaitOptions = {}): Promise<void> {
    const { timeout = 30000 } = options;
    logger.debug('Waiting for navigation');

    try {
      await page.waitForLoadState('networkidle', { timeout });
      logger.debug('Navigation complete');
    } catch (error) {
      logger.error('Navigation timeout');
      throw error;
    }
  }

  static async waitForAPIResponse(
    page: Page,
    urlPattern: string | RegExp,
    options: IWaitOptions = {},
  ): Promise<void> {
    const { timeout = 30000 } = options;
    logger.debug(`Waiting for API response: ${urlPattern}`);

    try {
      await page.waitForResponse(urlPattern, { timeout });
      logger.debug(`API response received: ${urlPattern}`);
    } catch (error) {
      logger.error(`API response timeout: ${urlPattern}`);
      throw error;
    }
  }

  static async sleep(ms: number): Promise<void> {
    logger.debug(`Sleeping for ${ms}ms`);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async poll<T>(
    fn: () => Promise<T>,
    condition: (result: T) => boolean,
    options: IWaitOptions = {},
  ): Promise<T> {
    const { timeout = 30000, interval = 500, throwOnTimeout = true } = options;
    const startTime = Date.now();
    let lastResult: T | undefined;

    while (Date.now() - startTime < timeout) {
      try {
        lastResult = await fn();
        if (condition(lastResult)) {
          logger.debug('Poll condition met');
          return lastResult;
        }
      } catch (error) {
        logger.debug(`Poll execution failed: ${(error as Error).message}`);
      }

      await this.sleep(interval);
    }

    const message = `Poll condition not met after ${timeout}ms`;
    logger.warn(message);

    if (throwOnTimeout) {
      throw new Error(message);
    }

    return lastResult as T;
  }
}

export const waitForCondition = WaitHelper.waitForCondition.bind(WaitHelper);
export const waitForElement = WaitHelper.waitForElement.bind(WaitHelper);
export const sleep = WaitHelper.sleep.bind(WaitHelper);
