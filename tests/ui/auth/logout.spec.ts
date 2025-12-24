import { test, expect } from '@playwright/test';
import { DashboardPage } from '@pages/dashboard/DashboardPage';
import { LoginPage } from '@pages/auth/LoginPage';

// Authentication is handled by global-setup - page is already logged in!

test.describe('Logout Tests', () => {
  let dashboardPage: DashboardPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    // Already authenticated via global-setup
    dashboardPage = new DashboardPage(page);
    loginPage = new LoginPage(page);
    await dashboardPage.navigate();
  });

  test('should successfully logout from dashboard', async () => {
    await test.step('Verify user is on dashboard', async () => {
      const isOnDashboard = await dashboardPage.isOnDashboard();
      expect(isOnDashboard).toBeTruthy();
    });

    await test.step('Logout user', async () => {
      await dashboardPage.logout();
    });

    await test.step('Verify redirect to login page', async () => {
      await loginPage.expectLoginPage();
    });
  });

  test('should clear session after logout', async () => {
    await test.step('Logout user', async () => {
      await dashboardPage.logout();
    });

    await test.step('Try to navigate back to dashboard', async () => {
      await dashboardPage.navigate();
    });

    await test.step('Verify redirect to login', async () => {
      await loginPage.expectLoginPage();
    });
  });
});
