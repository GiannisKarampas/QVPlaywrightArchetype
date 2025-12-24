import { Page } from '@playwright/test';
import { BaseComponent } from '@core/base/BaseComponent';
import logger from '@core/helpers/logger';

export class HeaderComponent extends BaseComponent {
  private readonly selectors = {
    logo: '[data-testid="logo"], .logo',
    userMenu: '[data-testid="user-menu"], .user-menu',
    userName: '[data-testid="user-name"], .user-name',
    logoutButton: '[data-testid="logout"], button:has-text("Logout")',
    profileLink: '[data-testid="profile"], a:has-text("Profile")',
    settingsLink: '[data-testid="settings"], a:has-text("Settings")',
    notificationBadge: '[data-testid="notification-badge"], .notification-badge',
  };

  constructor(page: Page) {
    super(page, '[data-testid="header"], header');
  }

  async clickLogo(): Promise<void> {
    logger.info('Clicking header logo');
    await this.click(this.selectors.logo);
  }

  async getUserName(): Promise<string> {
    await this.waitForVisible();
    return await this.getText(this.selectors.userName);
  }

  async openUserMenu(): Promise<void> {
    logger.info('Opening user menu from header');
    await this.click(this.selectors.userMenu);
  }

  async logout(): Promise<void> {
    logger.info('Logging out from header');
    await this.openUserMenu();
    await this.click(this.selectors.logoutButton);
  }

  async goToProfile(): Promise<void> {
    logger.info('Navigating to profile from header');
    await this.openUserMenu();
    await this.click(this.selectors.profileLink);
  }

  async goToSettings(): Promise<void> {
    logger.info('Navigating to settings from header');
    await this.openUserMenu();
    await this.click(this.selectors.settingsLink);
  }

  async getNotificationCount(): Promise<number> {
    const text = await this.getText(this.selectors.notificationBadge);
    return parseInt(text, 10) || 0;
  }

  async hasNotifications(): Promise<boolean> {
    const count = await this.count(this.selectors.notificationBadge);
    return count > 0;
  }
}
