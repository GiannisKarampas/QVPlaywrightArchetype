import { Page } from '@playwright/test';
import { BasePage } from '@core/base/BasePage';
import logger from '@core/helpers/logger';

export class LoginPage extends BasePage {
  private readonly selectors = {
    emailInput: '[data-testid="email-input"], #email, input[name="email"]',
    passwordInput: '[data-testid="password-input"], #password, input[name="password"]',
    loginButton: '[data-testid="login-button"], button[type="submit"]',
    errorMessage: '[data-testid="error-message"], .error-message',
    forgotPasswordLink: '[data-testid="forgot-password"], a[href*="forgot"]',
    registerLink: '[data-testid="register-link"], a[href*="register"]',
    rememberMeCheckbox: '[data-testid="remember-me"], input[type="checkbox"]',
  };

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    logger.info(`Logging in as: ${email}`);

    await this.fill(this.selectors.emailInput, email);
    await this.fill(this.selectors.passwordInput, password);
    await this.click(this.selectors.loginButton);

    await this.waitForPageLoad();
  }

  async loginWithRememberMe(email: string, password: string): Promise<void> {
    logger.info(`Logging in with remember me: ${email}`);

    await this.fill(this.selectors.emailInput, email);
    await this.fill(this.selectors.passwordInput, password);
    await this.check(this.selectors.rememberMeCheckbox);
    await this.click(this.selectors.loginButton);

    await this.waitForPageLoad();
  }

  async fillEmail(email: string): Promise<void> {
    await this.fill(this.selectors.emailInput, email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.fill(this.selectors.passwordInput, password);
  }

  async clickLogin(): Promise<void> {
    await this.click(this.selectors.loginButton);
  }

  async clickForgotPassword(): Promise<void> {
    await this.click(this.selectors.forgotPasswordLink);
  }

  async clickRegister(): Promise<void> {
    await this.click(this.selectors.registerLink);
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForSelector(this.selectors.errorMessage);
    return await this.getText(this.selectors.errorMessage);
  }

  async isErrorDisplayed(): Promise<boolean> {
    return await this.isVisible(this.selectors.errorMessage);
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isEnabled(this.selectors.loginButton);
  }

  async isOnLoginPage(): Promise<boolean> {
    const url = await this.getCurrentUrl();
    return url.includes('/login');
  }

  async expectLoginPage(): Promise<void> {
    await this.expectUrl(/\/login/);
  }

  async expectErrorMessage(message: string): Promise<void> {
    await this.expectText(this.selectors.errorMessage, message);
  }
}
