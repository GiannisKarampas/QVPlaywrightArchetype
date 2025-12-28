import { Page } from '@playwright/test';
import { BasePage } from '@core/base/BasePage';
import logger from '@core/helpers/logger';

export class RegisterPage extends BasePage {
  private readonly selectors = {
    firstNameInput: '[data-testid="first-name"], #firstName, input[name="firstName"]',
    lastNameInput: '[data-testid="last-name"], #lastName, input[name="lastName"]',
    emailInput: '[data-testid="email-input"], #email, input[name="email"]',
    passwordInput: '[data-testid="password-input"], #password, input[name="password"]',
    confirmPasswordInput:
      '[data-testid="confirm-password"], #confirmPassword, input[name="confirmPassword"]',
    registerButton: '[data-testid="register-button"], button[type="submit"]',
    termsCheckbox: '[data-testid="terms-checkbox"], input[name="terms"]',
    errorMessage: '[data-testid="error-message"], .error-message',
    successMessage: '[data-testid="success-message"], .success-message',
    loginLink: '[data-testid="login-link"], a[href*="login"]',
  };

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto('/register');
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }): Promise<void> {
    logger.info(`Registering user: ${userData.email}`);

    await this.fill(this.selectors.firstNameInput, userData.firstName);
    await this.fill(this.selectors.lastNameInput, userData.lastName);
    await this.fill(this.selectors.emailInput, userData.email);
    await this.fill(this.selectors.passwordInput, userData.password);
    await this.fill(
      this.selectors.confirmPasswordInput,
      userData.confirmPassword || userData.password,
    );
    await this.check(this.selectors.termsCheckbox);
    await this.click(this.selectors.registerButton);

    await this.waitForPageLoad();
  }

  async fillFirstName(firstName: string): Promise<void> {
    await this.fill(this.selectors.firstNameInput, firstName);
  }

  async fillLastName(lastName: string): Promise<void> {
    await this.fill(this.selectors.lastNameInput, lastName);
  }

  async fillEmail(email: string): Promise<void> {
    await this.fill(this.selectors.emailInput, email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.fill(this.selectors.passwordInput, password);
  }

  async fillConfirmPassword(confirmPassword: string): Promise<void> {
    await this.fill(this.selectors.confirmPasswordInput, confirmPassword);
  }

  async acceptTerms(): Promise<void> {
    await this.check(this.selectors.termsCheckbox);
  }

  async clickRegister(): Promise<void> {
    await this.click(this.selectors.registerButton);
  }

  async clickLogin(): Promise<void> {
    await this.click(this.selectors.loginLink);
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForSelector(this.selectors.errorMessage);
    return await this.getText(this.selectors.errorMessage);
  }

  async getSuccessMessage(): Promise<string> {
    await this.waitForSelector(this.selectors.successMessage);
    return await this.getText(this.selectors.successMessage);
  }

  async isErrorDisplayed(): Promise<boolean> {
    return await this.isVisible(this.selectors.errorMessage);
  }

  async isSuccessDisplayed(): Promise<boolean> {
    return await this.isVisible(this.selectors.successMessage);
  }
}
