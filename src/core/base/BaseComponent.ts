import { Page, Locator } from '@playwright/test';
import logger from '@core/helpers/logger';
import { env } from '@config/environment.config';

export abstract class BaseComponent {
  protected page: Page;
  protected rootSelector: string;
  protected root: Locator;

  constructor(page: Page, rootSelector: string) {
    this.page = page;
    this.rootSelector = rootSelector;
    this.root = page.locator(rootSelector);
  }

  public async isVisible(): Promise<boolean> {
    try {
      await this.root.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  protected async waitForVisible(): Promise<void> {
    logger.debug(`Waiting for component to be visible: ${this.rootSelector}`);
    await this.root.waitFor({
      state: 'visible',
      timeout: env.get('timeout'),
    });
  }

  protected async waitForHidden(): Promise<void> {
    logger.debug(`Waiting for component to be hidden: ${this.rootSelector}`);
    await this.root.waitFor({
      state: 'hidden',
      timeout: env.get('timeout'),
    });
  }

  protected locator(selector: string): Locator {
    return this.root.locator(selector);
  }

  protected async click(selector: string): Promise<void> {
    logger.debug(`Clicking element in component: ${selector}`);
    await this.locator(selector).click({ timeout: env.get('actionTimeout') });
  }

  protected async fill(selector: string, value: string): Promise<void> {
    logger.debug(`Filling element in component: ${selector}`);
    await this.locator(selector).fill(value, { timeout: env.get('actionTimeout') });
  }

  protected async getText(selector: string): Promise<string> {
    logger.debug(`Getting text from component element: ${selector}`);
    const text = await this.locator(selector).textContent({
      timeout: env.get('actionTimeout'),
    });
    return text?.trim() || '';
  }

  protected async count(selector: string): Promise<number> {
    return await this.locator(selector).count();
  }

  protected nth(selector: string, index: number): Locator {
    return this.locator(selector).nth(index);
  }

  protected first(selector: string): Locator {
    return this.locator(selector).first();
  }

  protected last(selector: string): Locator {
    return this.locator(selector).last();
  }
}
