import { test, expect } from '@core/fixtures/base.fixture';
import { RegisterPage } from '@pages/auth/RegisterPage';
import { LoginPage } from '@pages/auth/LoginPage';
import { DashboardPage } from '@pages/dashboard/DashboardPage';
import { UserFactory } from '@data/factories/user.factory';

// Disable auth for this E2E journey (tests registration + login)
test.use({ storageState: undefined });

test.describe('End-to-End User Journey', () => {
  test('complete user journey from registration to logout', async ({ page, logger }) => {
    // Using logger fixture for detailed E2E flow tracking
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    const newUser = UserFactory.createRequest();

    await test.step('Register new user', async () => {
      await registerPage.navigate();
      await registerPage.register({
        firstName: newUser.firstName!,
        lastName: newUser.lastName!,
        email: newUser.email,
        password: newUser.password,
      });
      logger.info(`Registered new user: ${newUser.email}`);
    });

    await test.step('Verify registration success', async () => {
      const isSuccessDisplayed = await registerPage.isSuccessDisplayed();
      if (isSuccessDisplayed) {
        const successMessage = await registerPage.getSuccessMessage();
        expect(successMessage).toBeTruthy();
      }
    });

    await test.step('Login with new credentials', async () => {
      await loginPage.navigate();
      await loginPage.login(newUser.email, newUser.password);
      logger.info('Logged in with new credentials');
    });

    await test.step('Verify dashboard access', async () => {
      await dashboardPage.expectDashboardPage();
      const isLoaded = await dashboardPage.isDashboardLoaded();
      expect(isLoaded).toBeTruthy();
    });

    await test.step('Navigate to profile', async () => {
      await dashboardPage.goToProfile();
      const currentUrl = await dashboardPage.getCurrentUrl();
      expect(currentUrl).toContain('profile');
    });

    await test.step('Navigate to settings', async () => {
      await dashboardPage.goToSettings();
      const currentUrl = await dashboardPage.getCurrentUrl();
      expect(currentUrl).toContain('settings');
    });

    await test.step('Logout user', async () => {
      await dashboardPage.navigate();
      await dashboardPage.logout();
      await loginPage.expectLoginPage();
      logger.info('User journey completed successfully');
    });
  });
});
