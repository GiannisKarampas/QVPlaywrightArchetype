import { Page } from '@playwright/test';
import { BasePage } from '@core/base/BasePage';
import logger from '@core/helpers/logger';

export class DashboardPage extends BasePage {
  private readonly selectors = {
    header: '[data-testid="dashboard-header"], .dashboard-header',
    welcomeMessage: '[data-testid="welcome-message"], .welcome-message',
    userMenu: '[data-testid="user-menu"], .user-menu',
    logoutButton: '[data-testid="logout-button"], button:has-text("Logout")',
    settingsLink: '[data-testid="settings-link"], a[href*="settings"]',
    profileLink: '[data-testid="profile-link"], a[href*="profile"]',
    notificationIcon: '[data-testid="notification-icon"], .notification-icon',
    searchInput: '[data-testid="search-input"], input[type="search"]',
    sidebarMenu: '[data-testid="sidebar-menu"], .sidebar-menu',
  };

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto('/dashboard');
  }

  async isOnDashboard(): Promise<boolean> {
    const url = await this.getCurrentUrl();
    return url.includes('/dashboard');
  }

  async expectDashboardPage(): Promise<void> {
    await this.expectUrl(/\/dashboard/);
  }

  async getWelcomeMessage(): Promise<string> {
    await this.waitForSelector(this.selectors.welcomeMessage);
    return await this.getText(this.selectors.welcomeMessage);
  }

  async openUserMenu(): Promise<void> {
    logger.info('Opening user menu');
    await this.click(this.selectors.userMenu);
  }

  async logout(): Promise<void> {
    logger.info('Logging out');
    await this.openUserMenu();
    await this.click(this.selectors.logoutButton);
    await this.waitForPageLoad();
  }

  async goToSettings(): Promise<void> {
    logger.info('Navigating to settings');
    await this.click(this.selectors.settingsLink);
    await this.waitForPageLoad();
  }

  async goToProfile(): Promise<void> {
    logger.info('Navigating to profile');
    await this.click(this.selectors.profileLink);
    await this.waitForPageLoad();
  }

  async clickNotifications(): Promise<void> {
    await this.click(this.selectors.notificationIcon);
  }

  async search(query: string): Promise<void> {
    logger.info(`Searching for: ${query}`);
    await this.fill(this.selectors.searchInput, query);
    await this.pressKey('Enter');
    await this.waitForPageLoad();
  }

  async isDashboardLoaded(): Promise<boolean> {
    return await this.isVisible(this.selectors.header);
  }

  async expectWelcomeMessage(message: string): Promise<void> {
    await this.expectText(this.selectors.welcomeMessage, message);
  }
}
