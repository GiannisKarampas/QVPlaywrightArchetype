import { Page, Locator, expect } from '@playwright/test';
import { env } from '@config/environment.config';
import logger from '@core/helpers/logger';
import { WaitHelper } from '@core/helpers/wait.helper';
import { VisualUtils } from '@core/utils/visual.utils';
import { AccessibilityUtils } from '@core/utils/accessibility.utils';
import { IScreenshotOptions } from '../../types/test.types';
import { IA11yScanOptions, IA11yScanResult } from '@core/types/accessibility.types';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = env.get('baseUrl');
  }

  protected async goto(path: string = ''): Promise<void> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    logger.info(`Navigating to: ${url}`);

    await this.page.goto(url, {
      timeout: env.get('navigationTimeout'),
      waitUntil: 'domcontentloaded',
    });

    await this.waitForPageLoad();
  }

  protected async waitForPageLoad(): Promise<void> {
    logger.debug('Waiting for page to load');
    await this.page.waitForLoadState('networkidle', {
      timeout: env.get('navigationTimeout'),
    });
  }

  protected async click(selector: string): Promise<void> {
    logger.debug(`Clicking element: ${selector}`);
    await this.page.click(selector, { timeout: env.get('actionTimeout') });
  }

  protected async clickByText(text: string): Promise<void> {
    logger.debug(`Clicking element with text: ${text}`);
    await this.page.getByText(text).click({ timeout: env.get('actionTimeout') });
  }

  protected async clickByRole(role: 'button' | 'link' | 'textbox', name: string): Promise<void> {
    logger.debug(`Clicking ${role} with name: ${name}`);
    await this.page.getByRole(role, { name }).click({ timeout: env.get('actionTimeout') });
  }

  protected async fill(selector: string, value: string): Promise<void> {
    logger.debug(`Filling element ${selector} with value: ${value}`);
    await this.page.fill(selector, value, { timeout: env.get('actionTimeout') });
  }

  protected async type(selector: string, value: string, delay: number = 100): Promise<void> {
    logger.debug(`Typing into element ${selector}: ${value}`);
    await this.page.type(selector, value, { delay, timeout: env.get('actionTimeout') });
  }

  protected async selectOption(selector: string, value: string): Promise<void> {
    logger.debug(`Selecting option ${value} in ${selector}`);
    await this.page.selectOption(selector, value, { timeout: env.get('actionTimeout') });
  }

  protected async check(selector: string): Promise<void> {
    logger.debug(`Checking checkbox: ${selector}`);
    await this.page.check(selector, { timeout: env.get('actionTimeout') });
  }

  protected async uncheck(selector: string): Promise<void> {
    logger.debug(`Unchecking checkbox: ${selector}`);
    await this.page.uncheck(selector, { timeout: env.get('actionTimeout') });
  }

  protected async getText(selector: string): Promise<string> {
    logger.debug(`Getting text from: ${selector}`);
    const element = this.page.locator(selector);
    const text = await element.textContent({ timeout: env.get('actionTimeout') });
    return text?.trim() || '';
  }

  protected async getValue(selector: string): Promise<string> {
    logger.debug(`Getting value from: ${selector}`);
    return await this.page.inputValue(selector, { timeout: env.get('actionTimeout') });
  }

  protected async isVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: 5000,
      });
      return true;
    } catch {
      return false;
    }
  }

  protected async isHidden(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, {
        state: 'hidden',
        timeout: 5000,
      });
      return true;
    } catch {
      return false;
    }
  }

  protected async isEnabled(selector: string): Promise<boolean> {
    return await this.page.isEnabled(selector, { timeout: env.get('actionTimeout') });
  }

  protected async isDisabled(selector: string): Promise<boolean> {
    return await this.page.isDisabled(selector, { timeout: env.get('actionTimeout') });
  }

  protected async isChecked(selector: string): Promise<boolean> {
    return await this.page.isChecked(selector, { timeout: env.get('actionTimeout') });
  }

  protected async waitForSelector(selector: string): Promise<void> {
    logger.debug(`Waiting for selector: ${selector}`);
    await WaitHelper.waitForElement(this.page, selector, {
      timeout: env.get('timeout'),
    });
  }

  protected async waitForNavigation(): Promise<void> {
    logger.debug('Waiting for navigation');
    await WaitHelper.waitForNavigation(this.page, {
      timeout: env.get('navigationTimeout'),
    });
  }

  protected async waitForResponse(urlPattern: string | RegExp): Promise<void> {
    logger.debug(`Waiting for response: ${urlPattern}`);
    await WaitHelper.waitForAPIResponse(this.page, urlPattern, {
      timeout: env.get('timeout'),
    });
  }

  protected async takeScreenshot(name: string, options?: IScreenshotOptions): Promise<string> {
    return await VisualUtils.takeScreenshot(this.page, name, options);
  }

  protected async scrollToElement(selector: string): Promise<void> {
    logger.debug(`Scrolling to element: ${selector}`);
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  protected async hover(selector: string): Promise<void> {
    logger.debug(`Hovering over element: ${selector}`);
    await this.page.hover(selector, { timeout: env.get('actionTimeout') });
  }

  protected async pressKey(key: string): Promise<void> {
    logger.debug(`Pressing key: ${key}`);
    await this.page.keyboard.press(key);
  }

  protected async reload(): Promise<void> {
    logger.debug('Reloading page');
    await this.page.reload({ timeout: env.get('navigationTimeout') });
  }

  protected async goBack(): Promise<void> {
    logger.debug('Navigating back');
    await this.page.goBack({ timeout: env.get('navigationTimeout') });
  }

  protected async goForward(): Promise<void> {
    logger.debug('Navigating forward');
    await this.page.goForward({ timeout: env.get('navigationTimeout') });
  }

  protected getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  public async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  public async getTitle(): Promise<string> {
    return await this.page.title();
  }

  public async checkAccessibility(options?: IA11yScanOptions): Promise<IA11yScanResult> {
    return AccessibilityUtils.scanPage(this.page, options);
  }

  public async assertAccessible(options?: IA11yScanOptions): Promise<void> {
    return AccessibilityUtils.assertNoViolations(this.page, options);
  }

  protected async expectVisible(selector: string): Promise<void> {
    logger.debug(`Expecting element to be visible: ${selector}`);
    await expect(this.page.locator(selector)).toBeVisible({
      timeout: env.get('timeout'),
    });
  }

  protected async expectHidden(selector: string): Promise<void> {
    logger.debug(`Expecting element to be hidden: ${selector}`);
    await expect(this.page.locator(selector)).toBeHidden({
      timeout: env.get('timeout'),
    });
  }

  protected async expectText(selector: string, expectedText: string): Promise<void> {
    logger.debug(`Expecting text "${expectedText}" in ${selector}`);
    await expect(this.page.locator(selector)).toHaveText(expectedText, {
      timeout: env.get('timeout'),
    });
  }

  protected async expectValue(selector: string, expectedValue: string): Promise<void> {
    logger.debug(`Expecting value "${expectedValue}" in ${selector}`);
    await expect(this.page.locator(selector)).toHaveValue(expectedValue, {
      timeout: env.get('timeout'),
    });
  }

  protected async expectUrl(expectedUrl: string | RegExp): Promise<void> {
    logger.debug(`Expecting URL: ${expectedUrl}`);
    await expect(this.page).toHaveURL(expectedUrl, {
      timeout: env.get('timeout'),
    });
  }

  protected async expectTitle(expectedTitle: string | RegExp): Promise<void> {
    logger.debug(`Expecting title: ${expectedTitle}`);
    await expect(this.page).toHaveTitle(expectedTitle, {
      timeout: env.get('timeout'),
    });
  }
}
