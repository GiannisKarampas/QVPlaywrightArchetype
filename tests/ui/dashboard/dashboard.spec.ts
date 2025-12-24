import { test, expect } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/DashboardPage';
import { HeaderComponent } from '@pages/components/Header.component';

// Authentication is handled by global-setup.ts - page is already logged in!

test.describe('Dashboard Tests', () => {
  let dashboardPage: DashboardPage;
  let headerComponent: HeaderComponent;

  test.beforeEach(async ({ page }) => {
    // No login needed - already authenticated via global-setup!
    dashboardPage = new DashboardPage(page);
    headerComponent = new HeaderComponent(page);
    await dashboardPage.navigate();
  });

  test('should display dashboard after login', async () => {
    await test.step('Verify dashboard is loaded', async () => {
      const isLoaded = await dashboardPage.isDashboardLoaded();
      expect(isLoaded).toBeTruthy();
    });

    await test.step('Verify welcome message is displayed', async () => {
      const welcomeMessage = await dashboardPage.getWelcomeMessage();
      expect(welcomeMessage).toBeTruthy();
    });
  });

  test('should navigate to settings', async () => {
    await test.step('Click settings link', async () => {
      await dashboardPage.goToSettings();
    });

    await test.step('Verify navigation to settings', async () => {
      const currentUrl = await dashboardPage.getCurrentUrl();
      expect(currentUrl).toContain('settings');
    });
  });

  test('should navigate to profile', async () => {
    await test.step('Click profile link', async () => {
      await dashboardPage.goToProfile();
    });

    await test.step('Verify navigation to profile', async () => {
      const currentUrl = await dashboardPage.getCurrentUrl();
      expect(currentUrl).toContain('profile');
    });
  });

  test('should perform search', async () => {
    const searchQuery = 'test query';

    await test.step('Enter search query', async () => {
      await dashboardPage.search(searchQuery);
    });

    await test.step('Verify search results page', async () => {
      const currentUrl = await dashboardPage.getCurrentUrl();
      expect(currentUrl).toContain('search');
    });
  });

  test('should display user information in header', async () => {
    await test.step('Verify header is visible', async () => {
      const isVisible = await headerComponent.isVisible();
      expect(isVisible).toBeTruthy();
    });

    await test.step('Get user name from header', async () => {
      const userName = await headerComponent.getUserName();
      expect(userName).toBeTruthy();
    });
  });
});
